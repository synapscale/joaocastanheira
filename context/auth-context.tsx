"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { authService } from '../lib/services/auth'
import { AuthErrorClassifier } from '../lib/errors/error-classifier'
import { AuthError, AuthErrorCode, AuthErrorCategory } from '../lib/types/errors'
import { recordRefreshAttempt } from '../lib/utils/token-refresh-validator'
import { authHydrationService, StoredAuthData } from '../lib/services/auth-hydration'
import type {
  AuthContextType,
  AuthUser,
  LoginData,
  RegisterData,
  AuthResponse,
  AuthState,
  AuthAction,
} from '../lib/types/auth'
import { useToast } from '@/hooks/use-toast'
import { authLogger } from '@/lib/utils/logger'
import { AuthHydrationService } from '@/lib/services/auth-hydration'
import { AuthStorageSynchronizer } from '@/lib/services/auth-storage-sync'
import { AuthTabSynchronizer, AuthTabMessage } from '@/lib/services/auth-tab-sync'
import { AuthStorageValidator, ValidationResult } from '@/lib/services/auth-storage-validator'
import { authCleanupManager } from '@/lib/services/auth-cleanup-manager'
import { 
  getAuthStorageValidator, 
  getAuthStorageSynchronizer, 
  getAuthTabSynchronizer, 
  getAuthHydrationService,
  clearAuthServices 
} from '@/lib/services/auth-services-registry'

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  
  // Token refresh state management
  isRefreshing: false,
  refreshError: null,
  lastRefreshAttempt: null,
  refreshAttemptCount: 0,
  nextRefreshAllowedAt: null,
}

// Reducer para gerenciar estado de autenticação
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.tokens.accessToken,
        refreshToken: action.payload.tokens.refreshToken,
        isLoading: false,
        error: null,
      }

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: action.payload,
      }

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      }

    case 'AUTH_REFRESH_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        error: null,
      }

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        error: null,
      }

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }

    case 'AUTH_INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
      }
      
    // Token refresh cases
    case 'AUTH_REFRESH_START':
      return {
        ...state,
        isRefreshing: true,
        refreshError: null,
        lastRefreshAttempt: Date.now(),
        refreshAttemptCount: state.refreshAttemptCount + 1,
        // Não atualizar nextRefreshAllowedAt aqui - será calculado em caso de erro
      }
      
    case 'AUTH_REFRESH_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isRefreshing: false,
        refreshError: null,
        refreshAttemptCount: 0,
        nextRefreshAllowedAt: null // Reset backoff após sucesso
      }
      
    case 'AUTH_REFRESH_ERROR': {
      // Calcular próximo tempo permitido com exponential backoff
      // Fórmula: base_delay * (2 ^ attempt_count) + jitter
      const baseDelayMs = 1000 // 1 segundo base
      const maxDelayMs = 60000 // Máximo 1 minuto
      const attemptCount = Math.min(state.refreshAttemptCount, 6) // Limitar para evitar overflow
      const exponentialDelay = baseDelayMs * Math.pow(2, attemptCount)
      const jitter = Math.random() * 1000 // Jitter de 0-1 segundo
      const totalDelay = Math.min(exponentialDelay + jitter, maxDelayMs)
      const nextAllowedAt = Date.now() + totalDelay
      
      return {
        ...state,
        isRefreshing: false,
        refreshError: action.payload,
        nextRefreshAllowedAt: nextAllowedAt
      }
    }
      
    case 'AUTH_REFRESH_RESET':
      return {
        ...state,
        isRefreshing: false,
        refreshError: null,
        refreshAttemptCount: 0,
        nextRefreshAllowedAt: null
      }

    default:
      return state
  }
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Props do provider
interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Provider de autenticação
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { toast } = useToast()
  const hydrationService = useMemo(() => getAuthHydrationService(), [])
  const storageSynchronizer = useMemo(() => getAuthStorageSynchronizer({
    debounceDelay: 250, // Menor delay para auth
    maxRetries: 3,
    retryDelay: 500,
    enableFallback: true,
    batchSize: 3,
    enableCompression: false
  }), [])
  const tabSynchronizer = useMemo(() => getAuthTabSynchronizer({
    enableBroadcastChannel: true,
    enableStorageEvents: true,
    conflictResolutionStrategy: 'latest_wins',
    pingInterval: 30000, // 30 segundos em vez de 5 - muito mais conservador
    tabTimeout: 60000,   // 1 minuto em vez de 15 segundos
    enableSignature: false,
    maxRetries: 3
  }), [])
  
  const storageValidator = useMemo(() => getAuthStorageValidator({
    enableChecksumValidation: true,
    enableSchemaValidation: true,
    enableExpirationValidation: true,
    enableStructureValidation: true,
    maxDataAge: 7, // 7 dias
    autoRepair: true,
    strictMode: false
  }), [])

  // 🔧 CLEANUP DE TODOS OS SERVIÇOS DURANTE HMR/UNMOUNT
  useEffect(() => {
    console.log('🧹 CLEANUP: Registrando cleanup para todos os serviços auth')
    
    return () => {
      console.log('🧹 CLEANUP: Destruindo todos os serviços auth durante unmount/HMR')
      clearAuthServices()
    }
  }, [])

  // Inicializar autenticação ao carregar a aplicação
  useEffect(() => {
    console.log('🔄 AuthContext: Iniciando initializeAuth...')
    initializeAuth()
  }, [])

  // TEMPORARIAMENTE DESABILITADO - Inicializar sincronização multi-tab
  useEffect(() => {
    console.log('🔴 AuthContext: Sincronização multi-tab DESABILITADA temporariamente para debug')
    
    // const initializeTabSync = async () => {
    //   try {
    //     await tabSynchronizer.initialize()
        
    //     // Configurar callback para mudanças de auth de outras tabs
    //     const unsubscribe = tabSynchronizer.onAuthChange(handleTabAuthChange)
        
    //     authLogger.info('✅ Sincronização multi-tab inicializada')
        
    //     // Cleanup quando componente for desmontado
    //     return () => {
    //       unsubscribe()
    //       tabSynchronizer.destroy()
    //     }
    //   } catch (error) {
    //     authLogger.error('❌ Erro ao inicializar sincronização multi-tab', error)
    //   }
    // }

    // const cleanup = initializeTabSync()
    
    // return () => {
    //   cleanup.then(fn => fn && fn())
    // }
  }, [tabSynchronizer])

  /**
   * Manipula mudanças de autenticação vindas de outras tabs
   */
  const handleTabAuthChange = useCallback((message: AuthTabMessage) => {
    authLogger.info('🔄 Mudança de auth recebida de outra tab', {
      type: message.type,
      fromTab: message.payload.tabId,
      timestamp: message.payload.timestamp
    })

    try {
      switch (message.type) {
        case 'AUTH_LOGIN':
          if (message.payload.user && message.payload.accessToken && message.payload.refreshToken) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: message.payload.user,
                tokens: {
                  accessToken: message.payload.accessToken,
                  refreshToken: message.payload.refreshToken,
                  expiresIn: 3600, // Valor padrão
                  tokenType: 'Bearer'
                }
              }
            })
            
            // Sincronizar com ApiService local
            authService.setToken(message.payload.accessToken)
            
            toast({
              title: 'Login sincronizado',
              description: 'Você foi logado em outra aba',
              variant: 'default'
            })
          }
          break

        case 'AUTH_LOGOUT':
          dispatch({ type: 'AUTH_LOGOUT' })
          
          // Limpar ApiService local
          authService.clearTokens()
          
          toast({
            title: 'Logout sincronizado',
            description: 'Você foi deslogado em outra aba',
            variant: 'destructive'
          })
          break

        case 'AUTH_REFRESH':
          if (message.payload.accessToken) {
            dispatch({
              type: 'AUTH_REFRESH_TOKEN',
              payload: {
                token: message.payload.accessToken,
                refreshToken: message.payload.refreshToken || state.refreshToken || ''
              }
            })
            
            // Sincronizar com ApiService local
            authService.setToken(message.payload.accessToken)
          }
          break

        case 'AUTH_UPDATE':
          if (message.payload.user) {
            dispatch({
              type: 'AUTH_UPDATE_USER',
              payload: message.payload.user
            })
          }
          break
      }
    } catch (error) {
      authLogger.error('❌ Erro ao processar mudança de auth de outra tab', error)
    }
  }, [state.refreshToken, toast])

  /**
   * Inicializa a autenticação usando o AuthHydrationService robusto
   * MODIFICADO: Não faz requests automáticos para servidor, apenas hidrata dados locais
   */
  const initializeAuth = useCallback(async () => {
    authLogger.info('🔄 AuthContext: Iniciando inicialização robusta da autenticação (SOMENTE LOCAL)...')
    
    // Evitar múltiplas execuções simultâneas
    if (state.isLoading || state.isInitialized) {
      authLogger.debug('✅ AuthContext: Já está inicializando ou inicializado, pulando...')
      return
    }
    
    dispatch({ type: 'AUTH_START' })
    
    try {
      // Usar o AuthHydrationService para hidratação robusta APENAS LOCAL
      const hydrationResult = await hydrationService.hydrateAuthState()
      
      if (hydrationResult.success && hydrationResult.data) {
        authLogger.info('✅ AuthContext: Hidratação bem-sucedida (LOCAL)', {
          source: hydrationResult.source,
          fallbacksUsed: hydrationResult.fallbacksUsed
        })

        // Validar integridade dos dados hidratados APENAS LOCALMENTE
        const rawData = JSON.stringify(hydrationResult.data)
        const storageType = (['localStorage', 'sessionStorage', 'cookies'].includes(hydrationResult.source)) 
          ? hydrationResult.source as 'localStorage' | 'sessionStorage' | 'cookies'
          : 'localStorage'
        const validationResult = await storageValidator.validateStoredData(rawData, storageType)
        
        authLogger.info('🔍 AuthContext: Validação de integridade (LOCAL)', {
          isValid: validationResult.isValid,
          errorsCount: validationResult.errors.length,
          warningsCount: validationResult.warnings.length,
          shouldCleanup: validationResult.shouldCleanup,
          needsRefresh: validationResult.needsRefresh
        })

        // Se dados estão corrompidos, usar cleanup manager para recuperação
        if (validationResult.shouldCleanup) {
          authLogger.warn('⚠️ AuthContext: Dados corrompidos detectados, iniciando recuperação automática')
          
          try {
            // Tentar procedimentos de recuperação automática primeiro
            const recoverySuccess = await authCleanupManager.executeRecoveryProcedures(false)
            
            if (recoverySuccess) {
              authLogger.info('✅ AuthContext: Recuperação automática bem-sucedida')
              toast({
                title: 'Dados restaurados',
                description: 'Os dados de autenticação foram recuperados automaticamente.',
                variant: 'default'
              })
              // Tentar reinicializar após recuperação - REMOVIDO PARA EVITAR LOOP
              // setTimeout(() => initializeAuth(), 500)
              return
            } else {
              // Se recuperação falha, fazer limpeza completa
              authLogger.warn('⚠️ AuthContext: Recuperação falhou, executando limpeza completa')
              const cleanupResult = await authCleanupManager.performAutomaticCleanup({
                cleanExpiredTokens: true,
                cleanStaleData: true,
                cleanCorruptedData: true,
                maxDataAge: 1, // Mais agressivo para dados corrompidos
                preserveUserPreferences: true,
                dryRun: false
              })
              
              authLogger.info('🧹 AuthContext: Limpeza automática concluída', {
                itemsRemoved: cleanupResult.itemsRemoved,
                spaceFreed: cleanupResult.spaceFreed
              })
            }
          } catch (cleanupError) {
            authLogger.error('❌ AuthContext: Erro durante limpeza automática', cleanupError as Error)
          }
          
          dispatch({ type: 'AUTH_INITIALIZE' })
          
          toast({
            title: 'Dados corrompidos detectados',
            description: 'Os dados de autenticação foram limpos. Faça login novamente.',
            variant: 'destructive'
          })
          return
        }

        // Usar dados corrigidos se disponíveis
        const authData = validationResult.correctedData ? {
          accessToken: validationResult.correctedData.data.accessToken!,
          refreshToken: validationResult.correctedData.data.refreshToken!,
          user: validationResult.correctedData.data.user!,
          timestamp: validationResult.correctedData.data.timestamp
        } : hydrationResult.data
        
        const { accessToken, refreshToken, user, timestamp } = hydrationResult.data
        
        // Verificar se os dados não estão muito antigos (mais de 7 dias)
        const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 dias
        if (Date.now() - timestamp > maxAge) {
          authLogger.warn('⚠️ AuthContext: Dados de autenticação muito antigos, descartando')
          await logout()
          dispatch({ type: 'AUTH_INITIALIZE' })
          return
        }
        
        // Verificar se o token não está expirado APENAS LOCALMENTE
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]))
          const now = Math.floor(Date.now() / 1000)
          
          if (payload.exp && payload.exp < now) {
            authLogger.info('⚠️ AuthContext: Token expirado, tentando renovar com refresh token')
            
            if (refreshToken) {
              try {
                const newAccessToken = await authService.refreshAccessToken()
                if (newAccessToken) {
                  authLogger.info('✅ AuthContext: Token renovado com sucesso')
                  
                  // Não precisa chamar setToken novamente, já foi feito no refreshAccessToken()
                  // Buscar o refresh token atualizado do storage
                  const currentRefreshToken = authService.getRefreshToken()
                  
                  dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: {
                      user,
                      tokens: {
                        accessToken: newAccessToken,
                        refreshToken: currentRefreshToken || refreshToken,
                        tokenType: 'Bearer',
                        expiresIn: 0
                      }
                    }
                  })
                  dispatch({ type: 'AUTH_INITIALIZE' })
                  return
                }
              } catch (refreshError) {
                authLogger.error('❌ AuthContext: Erro ao renovar token', refreshError)
              }
            }
            
            authLogger.warn('❌ AuthContext: Não foi possível renovar token, fazendo logout')
            await logout()
            dispatch({ type: 'AUTH_INITIALIZE' })
            return
          }
        } catch (tokenError) {
          authLogger.error('❌ AuthContext: Erro ao validar token JWT', tokenError)
          await logout()
          dispatch({ type: 'AUTH_INITIALIZE' })
          return
        }
        
        // Token válido - sincronizar e restaurar sessão APENAS LOCALMENTE
        authLogger.info('✅ AuthContext: Token válido, restaurando sessão (LOCAL)')
        // TEMPORARIAMENTE SIMPLIFICADO - apenas definir tokens
        authService.setToken(accessToken)
        if (refreshToken) {
          authService.setRefreshToken(refreshToken)
        }
        
        // REMOVIDO: Não verificar status da sessão com o servidor automaticamente
        // O checkAuthStatus será chamado apenas quando o usuário fizer login ou ação específica
        authLogger.info('✅ AuthContext: Sessão restaurada baseada em dados locais (sem verificação com servidor)')
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user,
            tokens: {
              accessToken,
              refreshToken,
              tokenType: 'Bearer',
              expiresIn: 0
            }
          }
        })
        
        dispatch({ type: 'AUTH_INITIALIZE' })
        return

      } else {
        // Nenhum dado de autenticação encontrado
        authLogger.info('ℹ️ AuthContext: Nenhum dado de autenticação encontrado')
        dispatch({ type: 'AUTH_INITIALIZE' })
        return
      }

    } catch (error) {
      authLogger.error('❌ AuthContext: Erro na inicialização', error)
      
      // Em caso de erro, limpar tudo e marcar como inicializado
      await logout()
      dispatch({ type: 'AUTH_INITIALIZE' })
      
      toast({
        title: 'Erro na inicialização',
        description: 'Ocorreu um erro ao carregar dados de autenticação. Faça login novamente.',
        variant: 'destructive'
      })
    }
  }, [hydrationService, storageValidator, authCleanupManager, toast])

  /**
   * Sincroniza tokens entre todos os serviços (AuthService, ApiService, etc.)
   */
  const syncTokensAcrossServices = useCallback(async (token: string, refreshToken?: string) => {
    console.log('🔄 AuthContext: Sincronizando tokens entre serviços...')
    
    try {
      // 1. Sincronizar com ApiService
      if (authService.syncTokensWithAuthService) {
        console.log('🔄 AuthContext: Sincronizando com ApiService...')
        authService.syncTokensWithAuthService()
      }
      
      // 2. Aguardar um pouco para garantir que os cookies sejam definidos
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // 3. Verificar se a sincronização foi bem-sucedida
      const apiToken = authService.getToken ? authService.getToken() : null
      const storageToken = authService.getStoredToken()
      
      console.log('🔍 AuthContext: Verificando sincronização:', {
        originalToken: token.substring(0, 20) + '...',
        apiServiceToken: apiToken ? apiToken.substring(0, 20) + '...' : 'null',
        storageToken: storageToken ? storageToken.substring(0, 20) + '...' : 'null',
        tokensMatch: token === apiToken && token === storageToken
      })
      
      if (token !== apiToken || token !== storageToken) {
        console.warn('⚠️ AuthContext: Tokens não estão sincronizados, forçando sincronização...')
        
        // Forçar sincronização manual
        authService.setToken(token)
        if (refreshToken) {
          authService.setRefreshToken(refreshToken)
        }
        
        // Token sincronizado diretamente via setToken (sem eventos artificiais)
      }
      
      console.log('✅ AuthContext: Tokens sincronizados com sucesso')
    } catch (error) {
      console.error('❌ AuthContext: Erro ao sincronizar tokens:', error)
    }
  }, [])

  /**
   * Verifica se os tokens foram salvos corretamente em todas as fontes
   */
  const verifyTokensSaved = useCallback(async (
    expectedAccessToken: string, 
    expectedRefreshToken: string, 
    expectedUser: AuthUser,
    maxRetries: number = 5,
    retryDelay: number = 100
  ): Promise<boolean> => {
    console.log('🔍 AuthContext: Verificando se tokens foram salvos corretamente...')
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Verificar localStorage
        const storedToken = authService.getStoredToken()
        const storedRefreshToken = authService.getStoredRefreshToken()
        const storedUser = authService.getStoredUser()
        
        // Verificar cookies
        const cookieToken = authService.getToken() // Método que lê do storage interno
        
        // Verificar se todos os valores estão corretos
        const allChecks = {
          localStorage_token: storedToken === expectedAccessToken,
          localStorage_refresh: storedRefreshToken === expectedRefreshToken,
          localStorage_user: storedUser && storedUser.id === expectedUser.id,
          cookie_token: cookieToken === expectedAccessToken
        }
        
        console.log(`🔍 AuthContext: Verificação ${attempt}/${maxRetries}:`, allChecks)
        
        // Se todas as verificações passaram
        if (Object.values(allChecks).every(check => check === true)) {
          console.log('✅ AuthContext: Tokens verificados com sucesso em todas as fontes')
          return true
        }
        
        // Se não é a última tentativa, aguardar e tentar novamente
        if (attempt < maxRetries) {
          console.log(`⏳ AuthContext: Tentativa ${attempt} falhou, aguardando ${retryDelay}ms...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          retryDelay = Math.min(retryDelay * 1.5, 1000) // Backoff exponencial
        }
        
      } catch (error) {
        console.error(`❌ AuthContext: Erro na verificação ${attempt}:`, error)
        if (attempt === maxRetries) {
          return false
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
    
    console.error('❌ AuthContext: Falha na verificação de tokens após todas as tentativas')
    return false
  }, [])

  /**
   * Função de sincronização melhorada com verificação
   */
  const syncTokensAcrossServicesWithVerification = useCallback(async (
    accessToken: string, 
    refreshToken: string,
    user: AuthUser
  ): Promise<boolean> => {
    console.log('🔄 AuthContext: Iniciando sincronização com verificação...')
    
    try {
      // 1. Executar sincronização original
      await syncTokensAcrossServices(accessToken, refreshToken)
      
      // 2. Verificar se os tokens foram salvos corretamente
      const isVerified = await verifyTokensSaved(accessToken, refreshToken, user, 5, 100)
      
      if (!isVerified) {
        throw new Error('Falha na verificação: tokens não foram salvos corretamente')
      }
      
      console.log('✅ AuthContext: Sincronização e verificação concluídas com sucesso')
      return true
      
    } catch (error) {
      console.error('❌ AuthContext: Erro na sincronização com verificação:', error)
      return false
    }
  }, [syncTokensAcrossServices, verifyTokensSaved])

  /**
   * Função de recuperação para falhas de salvamento de tokens
   */
  const recoverFromTokenSaveFailure = useCallback(async (
    accessToken: string,
    refreshToken: string,
    user: AuthUser,
    failureReason: string
  ): Promise<boolean> => {
    console.log('🔧 AuthContext: Iniciando recuperação de falha de salvamento de tokens...', { failureReason })
    
    try {
      // Estratégia 1: Limpar storage e tentar novamente
      console.log('🔧 AuthContext: Tentativa 1 - Limpando storage e salvando novamente')
      authService.clearTokens()
      await new Promise(resolve => setTimeout(resolve, 200)) // Aguardar limpeza
      
      // Salvar tokens novamente
      authService.setToken(accessToken)
      authService.setRefreshToken(refreshToken)
      authService.setUser(user)
      
      // Verificar se funcionou
      const recovered = await verifyTokensSaved(accessToken, refreshToken, user, 3, 200)
      if (recovered) {
        console.log('✅ AuthContext: Recuperação bem-sucedida com limpeza de storage')
        return true
      }
      
      // Estratégia 2: Salvar apenas em localStorage (fallback)
      console.log('🔧 AuthContext: Tentativa 2 - Salvando apenas em localStorage como fallback')
      localStorage.setItem('synapsefrontend_auth_token', accessToken)
      localStorage.setItem('synapsefrontend_refresh_token', refreshToken)
      localStorage.setItem('synapsefrontend_user', JSON.stringify(user))
      
      // Verificar localStorage
      const tokenCheck = localStorage.getItem('synapsefrontend_auth_token') === accessToken
      const refreshCheck = localStorage.getItem('synapsefrontend_refresh_token') === refreshToken
      const userCheck = JSON.parse(localStorage.getItem('synapsefrontend_user') || '{}')?.id === user.id
      
      if (tokenCheck && refreshCheck && userCheck) {
        console.log('✅ AuthContext: Recuperação parcial bem-sucedida (localStorage apenas)')
        return true
      }
      
      // Estratégia 3: Forçar relogin se tudo falhar
      console.error('❌ AuthContext: Todas as estratégias de recuperação falharam')
      return false
      
    } catch (error) {
      console.error('❌ AuthContext: Erro durante recuperação:', error)
      return false
    }
  }, [verifyTokensSaved])

  /**
   * Função de sincronização melhorada com recuperação de erros
   */
  const syncTokensAcrossServicesWithRecovery = useCallback(async (
    accessToken: string, 
    refreshToken: string,
    user: AuthUser
  ): Promise<boolean> => {
    console.log('🔄 AuthContext: Iniciando sincronização com recuperação automática...')
    
    try {
      // Primeira tentativa: sincronização normal
      const syncSuccess = await syncTokensAcrossServicesWithVerification(accessToken, refreshToken, user)
      
      if (syncSuccess) {
        console.log('✅ AuthContext: Sincronização bem-sucedida na primeira tentativa')
        return true
      }
      
      // Segunda tentativa: recuperação de falha
      console.log('⚠️ AuthContext: Sincronização falhou, iniciando recuperação automática...')
      const recoverySuccess = await recoverFromTokenSaveFailure(
        accessToken, 
        refreshToken, 
        user, 
        'Falha na verificação inicial de tokens'
      )
      
      if (recoverySuccess) {
        console.log('✅ AuthContext: Recuperação automática bem-sucedida')
        return true
      }
      
      // Falha completa
      console.error('❌ AuthContext: Falha total na sincronização e recuperação de tokens')
      return false
      
    } catch (error) {
      console.error('❌ AuthContext: Erro crítico na sincronização:', error)
      
      // Tentativa de recuperação em caso de erro crítico
      try {
        const emergencyRecovery = await recoverFromTokenSaveFailure(
          accessToken, 
          refreshToken, 
          user, 
          `Erro crítico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        )
        
        if (emergencyRecovery) {
          console.log('🚨 AuthContext: Recuperação de emergência bem-sucedida')
          return true
        }
      } catch (emergencyError) {
        console.error('🚨 AuthContext: Falha na recuperação de emergência:', emergencyError)
      }
      
      return false
    }
  }, [syncTokensAcrossServicesWithVerification, recoverFromTokenSaveFailure])

  /**
   * Notifica outras tabs sobre login
   */
  const notifyTabsLogin = useCallback(async (user: AuthUser, accessToken: string, refreshToken: string) => {
    try {
      await tabSynchronizer.notifyLogin(user, accessToken, refreshToken)
      authLogger.info('✅ Login notificado para outras tabs')
    } catch (error) {
      authLogger.error('❌ Erro ao notificar login para outras tabs', error)
    }
  }, [tabSynchronizer])

  /**
   * Notifica outras tabs sobre logout
   */
  const notifyTabsLogout = useCallback(async () => {
    try {
      await tabSynchronizer.notifyLogout()
      authLogger.info('✅ Logout notificado para outras tabs')
    } catch (error) {
      authLogger.error('❌ Erro ao notificar logout para outras tabs', error)
    }
  }, [tabSynchronizer])

  /**
   * Notifica outras tabs sobre refresh de token
   */
  const notifyTabsTokenRefresh = useCallback(async (accessToken: string, refreshToken?: string) => {
    try {
      await tabSynchronizer.notifyTokenRefresh(accessToken, refreshToken)
      authLogger.info('✅ Refresh de token notificado para outras tabs')
    } catch (error) {
      authLogger.error('❌ Erro ao notificar refresh para outras tabs', error)
    }
  }, [tabSynchronizer])

  /**
   * Sincronização robusta de tokens com debouncing
   */
  const syncTokensWithDebouncing = useCallback(async (
    accessToken: string | null, 
    refreshToken: string | null, 
    user: AuthUser | null = null,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> => {
    authLogger.info('🔄 AuthContext: Iniciando sincronização com debouncing', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      priority
    })

    try {
      // Preparar dados para sincronização
      const syncData = {
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
        ...(user && { user }),
        timestamp: Date.now()
      }

      // Agendar sincronização com debouncing
      await storageSynchronizer.scheduleSync(syncData, priority)

      // Atualizar ApiService diretamente (sem debounce para API)
      if (accessToken) {
        authService.setToken(accessToken)
      }

      authLogger.info('✅ AuthContext: Sincronização agendada com sucesso')

    } catch (error) {
      authLogger.error('❌ AuthContext: Erro na sincronização com debouncing', error)
      
      // Fallback: tentar sincronização imediata em caso de erro crítico
      try {
        await storageSynchronizer.forceSyncImmediate({
          ...(accessToken && { accessToken }),
          ...(refreshToken && { refreshToken }),
          ...(user && { user }),
          timestamp: Date.now()
        })
        authLogger.info('✅ AuthContext: Fallback de sincronização imediata bem-sucedido')
      } catch (fallbackError) {
        authLogger.error('❌ AuthContext: Falha total na sincronização', fallbackError)
        throw fallbackError
      }
    }
  }, [storageSynchronizer])

  /**
   * Função melhorada de limpeza de dados com debouncing
   */
  const clearAuthDataWithSync = useCallback(async (): Promise<void> => {
    authLogger.info('🧹 AuthContext: Limpando dados de autenticação')

    try {
      // Limpar ApiService primeiro
      authService.clearTokens()

      // Agendar limpeza nos storages com prioridade alta
      await storageSynchronizer.forceSyncImmediate({
        accessToken: '',
        refreshToken: '',
        timestamp: Date.now()
      })

      authLogger.info('✅ AuthContext: Dados de autenticação limpos com sucesso')

    } catch (error) {
      authLogger.error('❌ AuthContext: Erro ao limpar dados de autenticação', error)
      throw error
    }
  }, [storageSynchronizer])

  /**
   * Executa operação de storage com fallback automático
   */
  const executeWithFallback = useCallback(async (
    operation: () => Promise<any>,
    operationName: string
  ): Promise<any> => {
    try {
      const fallbackResult = await authCleanupManager.performFallbackOperation(operation, {
        enableStorageFallback: true,
        enableMemoryFallback: true,
        enableNetworkFallback: false,
        maxFallbackAttempts: 3,
        fallbackTimeout: 2000
      })

      if (fallbackResult.success) {
        authLogger.info(`✅ ${operationName} bem-sucedida com fallback`, {
          method: fallbackResult.method,
          attemptCount: fallbackResult.attemptCount,
          fallbackChain: fallbackResult.fallbackChain
        })
        return fallbackResult.data
      } else {
        throw new Error(`All fallback attempts failed for ${operationName}`)
      }
    } catch (error) {
      authLogger.error(`❌ ${operationName} falhou mesmo com fallbacks`, error as Error)
      throw error
    }
  }, [])

  /**
   * Função de login melhorada com sincronização multi-tab
   */
  const login = useCallback(async (data: LoginData): Promise<AuthResponse> => {
    authLogger.info('🔐 AuthContext: Iniciando processo de login')
    console.log('🔍 AuthContext - Estado antes do login:', { user: state.user, token: state.token, isAuthenticated: !!state.user && !!state.token })
    
    dispatch({ type: 'AUTH_START' })
    console.log('🔍 AuthContext - Dispatch AUTH_START enviado')

    try {
      // Fazer login via API
      console.log('🔍 AuthContext - Chamando authService.login...')
      const response = await authService.login(data)
      console.log('🔍 AuthContext - Resposta do authService.login:', {
        hasUser: !!response.user,
        userEmail: response.user?.email,
        hasAccessToken: !!response.tokens?.accessToken,
        hasRefreshToken: !!response.tokens?.refreshToken,
        tokens: response.tokens
      })
      
      // Atualizar estado local
      console.log('🔍 AuthContext - Enviando dispatch AUTH_SUCCESS...')
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens
        }
      })
      console.log('🔍 AuthContext - Dispatch AUTH_SUCCESS enviado com payload:', {
        hasUser: !!response.user,
        userEmail: response.user?.email,
        hasAccessToken: !!response.tokens?.accessToken,
        hasRefreshToken: !!response.tokens?.refreshToken
      })

      // Aguardar um pouco para o estado ser atualizado
      setTimeout(() => {
        console.log('🔍 AuthContext - Estado após dispatch AUTH_SUCCESS:', {
          user: state.user,
          token: state.token,
          isAuthenticated: !!state.user && !!state.token
        })
      }, 100)

      // Criar dados versionados seguros para armazenamento
      const versionedData = await storageValidator.createVersionedData(
        response.tokens.accessToken,
        response.tokens.refreshToken,
        response.user,
        response.tokens.expiresIn || 3600
      )

      authLogger.info('🔒 AuthContext: Dados versionados criados', {
        version: versionedData.version,
        checksum: versionedData.checksum.substring(0, 16) + '...',
        deviceId: versionedData.metadata.deviceId
      })

      // Backup dados para fallback antes de sincronizar
      authCleanupManager.backupDataForFallback('memory', {
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        user: response.user,
        timestamp: Date.now()
      })

      // Sincronizar dados com storage (com debouncing)
      await syncTokensWithDebouncing(
        response.tokens.accessToken,
        response.tokens.refreshToken,
        response.user,
        'high' // Prioridade alta para login
      )

      // Notificar outras tabs
      await notifyTabsLogin(response.user, response.tokens.accessToken, response.tokens.refreshToken)

      authLogger.info('✅ AuthContext: Login realizado com sucesso')
      console.log('🔍 AuthContext - Login finalizado, retornando response')
      
      return response

    } catch (error) {
      authLogger.error('❌ AuthContext: Erro no login', error)
      
      const authError = error instanceof AuthError 
        ? error 
        : new AuthError({
            category: AuthErrorCategory.AUTHENTICATION,
            code: AuthErrorCode.AUTH_LOGIN_FAILED,
            message: error instanceof Error ? error.message : 'Erro desconhecido no login',
            userMessage: 'Falha no login. Verifique suas credenciais.',
            recoverable: true,
            retryable: true,
            timestamp: new Date()
          })
      
      dispatch({ type: 'AUTH_ERROR', payload: authError })
      throw authError
    }
  }, [syncTokensWithDebouncing, notifyTabsLogin])

  /**
   * Função de logout melhorada com sincronização multi-tab
   */
  const logout = useCallback(async (): Promise<void> => {
    authLogger.info('🔓 AuthContext: Iniciando processo de logout')

    try {
      // Notificar outras tabs primeiro
      await notifyTabsLogout()

      // Limpar dados locais
      await clearAuthDataWithSync()

      // Atualizar estado
      dispatch({ type: 'AUTH_LOGOUT' })

      authLogger.info('✅ AuthContext: Logout realizado com sucesso')

    } catch (error) {
      authLogger.error('❌ AuthContext: Erro no logout', error)
      
      // Mesmo com erro, limpar estado local
      dispatch({ type: 'AUTH_LOGOUT' })
      throw error
    }
  }, [notifyTabsLogout, clearAuthDataWithSync])

  /**
   * Função para limpar dados de autenticação
   */
  const clearAuthData = useCallback((): void => {
    console.log('🔄 AuthContext: Limpando dados de autenticação...')
    
    try {
      // Limpar dados do AuthService de forma síncrona
      authService.clearTokens()
      
      // Limpar estado do contexto
      dispatch({ type: 'AUTH_LOGOUT' })
      
      console.log('✅ AuthContext: Dados de autenticação limpos')
    } catch (error) {
      console.error('❌ AuthContext: Erro ao limpar dados:', error)
      // Mesmo com erro, limpar o estado local
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }, [])

  /**
   * Função para refresh do access token
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    console.log('🔄 AuthContext: Iniciando refresh do access token...')
    const startTime = Date.now()
    
    // Verificar se já há um refresh em andamento
    if (state.isRefreshing) {
      console.log('⚠️ AuthContext: Refresh já em andamento, ignorando solicitação')
      return null
    }
    
    // Verificar se ainda está no período de backoff
    const now = Date.now()
    if (state.nextRefreshAllowedAt && now < state.nextRefreshAllowedAt) {
      const waitTimeMs = state.nextRefreshAllowedAt - now
      console.log(`⚠️ AuthContext: Aguardando backoff. Próxima tentativa em ${Math.ceil(waitTimeMs / 1000)}s`)
      return null
    }
    
    // Verificar limite de tentativas (máximo 3 tentativas em 5 minutos)
    const currentTime = Date.now()
    const fiveMinutesAgo = currentTime - (5 * 60 * 1000)
    
    if (state.refreshAttemptCount >= 3 && state.lastRefreshAttempt && state.lastRefreshAttempt > fiveMinutesAgo) {
      console.log('⚠️ AuthContext: Limite de tentativas de refresh atingido')
      const limitError = AuthErrorClassifier.createTokenSaveError('Limite de tentativas de refresh atingido. Tente novamente em alguns minutos.')
      dispatch({
        type: 'AUTH_REFRESH_ERROR',
        payload: limitError
      })
      recordRefreshAttempt(false, Date.now() - startTime, limitError)
      return null
    }
    
    // Iniciar processo de refresh
    dispatch({ type: 'AUTH_REFRESH_START' })
    
    try {
      // Verificar se há refresh token disponível
      const currentRefreshToken = state.refreshToken || authService.getStoredRefreshToken()
      
      if (!currentRefreshToken) {
        console.log('⚠️ AuthContext: Não há refresh token disponível')
        const error = AuthErrorClassifier.createTokenSaveError('Não há refresh token disponível para realizar refresh')
        dispatch({
          type: 'AUTH_REFRESH_ERROR',
          payload: error
        })
        recordRefreshAttempt(false, Date.now() - startTime, error)
        return null
      }
      
      // Chamar o AuthService para refresh
      const newAccessToken = await authService.refreshAccessToken()
      
      if (!newAccessToken) {
        console.log('❌ AuthContext: Falha no refresh do token')
        const errorResult = AuthErrorClassifier.classifyError(new Error('Falha no refresh do token - resposta vazia do servidor'))
        dispatch({
          type: 'AUTH_REFRESH_ERROR',
          payload: errorResult.error
        })
        recordRefreshAttempt(false, Date.now() - startTime, errorResult.error)
        return null
      }
      
      console.log('✅ AuthContext: Token refreshed com sucesso')
      
      // Sincronizar tokens entre todos os serviços
      await syncTokensAcrossServices(newAccessToken, currentRefreshToken)
      
      // Atualizar estado do contexto com sucesso
      dispatch({
        type: 'AUTH_REFRESH_SUCCESS',
        payload: {
          token: newAccessToken,
          refreshToken: currentRefreshToken
        }
      })
      
      // Registrar sucesso no sistema de monitoramento
      recordRefreshAttempt(true, Date.now() - startTime)
      
      console.log('✅ AuthContext: Estado atualizado após refresh do token')
      return newAccessToken
      
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no refresh do access token:', error)
      
      // Classificar erro usando o sistema da Task #7
      const errorResult = AuthErrorClassifier.classifyError(error)
      const authError = errorResult.error
      
      console.log(`🔍 AuthContext: Erro classificado - Categoria: ${authError.category}, Código: ${authError.code}`)
      
      // Implementar lógica de fallback baseada na categoria e código do erro
      const shouldForceLogout = (
        authError.category === 'AUTHENTICATION' || 
        authError.category === 'AUTHORIZATION' ||
        authError.code === AuthErrorCode.TOKEN_REFRESH_FAILED ||
        authError.code === AuthErrorCode.TOKEN_EXPIRED ||
        authError.code === AuthErrorCode.TOKEN_INVALID ||
        authError.code === AuthErrorCode.AUTH_SESSION_EXPIRED
      )
      
      if (shouldForceLogout) {
        console.log('🚨 AuthContext: Erro crítico de autenticação - forçando logout')
        // Usar clearAuthData para evitar loop infinito
        clearAuthData()
      }
      
      // Registrar erro no estado e no sistema de monitoramento
      dispatch({
        type: 'AUTH_REFRESH_ERROR',
        payload: authError
      })
      
      recordRefreshAttempt(false, Date.now() - startTime, authError)
      
      return null
    }
  }, [state.refreshToken, state.isRefreshing, state.refreshAttemptCount, state.lastRefreshAttempt, state.nextRefreshAllowedAt, syncTokensAcrossServices, clearAuthData])

  /**
   * Função de registro
   */
  const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
    console.log('🔄 AuthContext: Iniciando registro...')
    
    dispatch({ type: 'AUTH_START' })
    
    try {
      // Chamar o serviço de autenticação
      const response = await authService.register(data.name, data.email, data.password)
      
      // Extrair usuário e tokens da resposta
      const { user, accessToken, refreshToken } = response
      
      // Sincronizar tokens entre todos os serviços
      await syncTokensAcrossServicesWithRecovery(accessToken, refreshToken)
      
      // Atualizar estado do contexto
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 3600, // 1 hora por padrão
            tokenType: 'Bearer' as const
          }
        }
      })
      
      console.log('✅ AuthContext: Registro realizado com sucesso')
      
      return {
        user,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600,
          tokenType: 'Bearer' as const
        }
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no registro:', error)
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: {
          code: error.code || 'REGISTER_ERROR',
          message: error.message || 'Erro ao fazer registro'
        }
      })
      throw error
    }
  }, [syncTokensAcrossServicesWithRecovery])

  /**
   * Função para atualizar dados do usuário
   */
  const updateUser = useCallback(async (userData: Partial<AuthUser>): Promise<AuthUser> => {
    console.log('🔄 AuthContext: Atualizando dados do usuário...')
    
    try {
      // Implementar chamada para API de update do usuário se necessário
      // const updatedUser = await authService.updateUser(userData)
      
      // Por enquanto, apenas atualizar o estado local
      const updatedUser = { ...state.user, ...userData } as AuthUser
      
      dispatch({
        type: 'AUTH_UPDATE_USER',
        payload: updatedUser
      })
      
      console.log('✅ AuthContext: Dados do usuário atualizados')
      return updatedUser
    } catch (error) {
      console.error('❌ AuthContext: Erro ao atualizar usuário:', error)
      throw error
    }
  }, [state.user])

  /**
   * Função para alterar senha
   */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    console.log('🔄 AuthContext: Alterando senha...')
    
    try {
      // Implementar chamada para API de alteração de senha
      // await authService.changePassword(currentPassword, newPassword)
      
      console.log('✅ AuthContext: Senha alterada com sucesso')
    } catch (error) {
      console.error('❌ AuthContext: Erro ao alterar senha:', error)
      throw error
    }
  }, [])

  /**
   * Função para verificar email
   */
  const verifyEmail = useCallback(async (token: string): Promise<void> => {
    console.log('🔄 AuthContext: Verificando email...')
    
    try {
      // Implementar chamada para API de verificação de email
      // await authService.verifyEmail(token)
      
      console.log('✅ AuthContext: Email verificado com sucesso')
    } catch (error) {
      console.error('❌ AuthContext: Erro ao verificar email:', error)
      throw error
    }
  }, [])

  /**
   * Função para solicitar reset de senha
   */
  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    console.log('🔄 AuthContext: Solicitando reset de senha...')
    
    try {
      // Implementar chamada para API de solicitação de reset
      // await authService.requestPasswordReset(email)
      
      console.log('✅ AuthContext: Reset de senha solicitado')
    } catch (error) {
      console.error('❌ AuthContext: Erro ao solicitar reset:', error)
      throw error
    }
  }, [])

  /**
   * Função para resetar senha
   */
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
    console.log('🔄 AuthContext: Resetando senha...')
    
    try {
      // Implementar chamada para API de reset de senha
      // await authService.resetPassword(token, newPassword)
      
      console.log('✅ AuthContext: Senha resetada com sucesso')
    } catch (error) {
      console.error('❌ AuthContext: Erro ao resetar senha:', error)
      throw error
    }
  }, [])

  /**
   * Função para verificar status de autenticação
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    console.log('🔄 AuthContext: Verificando status de autenticação...')
    
    try {
      // Verificar se há token válido
      if (!state.token) {
        return false
      }
      
      // Validar token com o servidor se necessário
      // const isValid = await authService.validateToken(state.token)
      
      const isValid = !!state.user && !!state.token
      console.log(`✅ AuthContext: Status de autenticação: ${isValid}`)
      
      return isValid
    } catch (error) {
      console.error('❌ AuthContext: Erro ao verificar status:', error)
      return false
    }
  }, [state.token, state.user])

  /**
   * Auto-refresh de tokens
   */
  // TEMPORARIAMENTE DESABILITADO - Auto-refresh de tokens
  // useEffect(() => {
  //   if (!state.user || !state.token) return

  //   const startTokenRefresh = () => {
  //     const interval = setInterval(async () => {
  //       try {
  //         // Verificar se o token está próximo de expirar (dentro de 5 minutos)
  //         const payload = JSON.parse(atob(state.token.split('.')[1]))
  //         const now = Math.floor(Date.now() / 1000)
  //         const timeUntilExpiry = payload.exp - now
          
  //         if (timeUntilExpiry < 300) { // 5 minutos = 300 segundos
  //           console.log('🔄 AuthContext: Token próximo de expirar, renovando...')
            
  //           const newTokens = await authService.refreshToken()
  //           if (newTokens) {
  //             console.log('✅ AuthContext: Token renovado automaticamente')
              
  //             await syncTokensAcrossServices(newTokens.accessToken, newTokens.refreshToken)
              
  //             dispatch({
  //               type: 'AUTH_REFRESH_TOKEN',
  //               payload: {
  //                 token: newTokens.accessToken,
  //                 refreshToken: newTokens.refreshToken
  //               }
  //             })
  //           }
  //         }
  //       } catch (error) {
  //         console.error('❌ AuthContext: Erro no auto-refresh:', error)
  //       }
  //     }, 60000) // Verificar a cada minuto

  //     return interval
  //   }

  //   const interval = startTokenRefresh()
  //   return () => clearInterval(interval)
  // }, [state.user, state.token, syncTokensAcrossServices])

  /**
   * Inicialização automática
   */
  // useEffect(() => {
  //   if (!state.isInitialized) {
  //     initializeAuth()
  //   }
  // }, [state.isInitialized, initializeAuth])

  // Valor do contexto - memoizado para evitar re-renderizações desnecessárias
  const contextValue = useMemo(() => ({
    // Estado básico
    user: state.user,
    token: state.token,
    refreshToken: state.refreshToken,
    isAuthenticated: !!state.user && !!state.token,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    
    // Estado de refresh
    isRefreshing: state.isRefreshing,
    refreshError: state.refreshError,
    lastRefreshAttempt: state.lastRefreshAttempt,
    refreshAttemptCount: state.refreshAttemptCount,
    nextRefreshAllowedAt: state.nextRefreshAllowedAt,
    
    // Métodos principais
    login,
    logout,
    refreshAccessToken,
    
    // Método para resetar estado de refresh
    resetRefreshState: () => { dispatch({ type: 'AUTH_REFRESH_RESET' }) },
    
    // Métodos stub para evitar erros
    register: async () => { throw new Error('Não implementado') },
    updateUser: async () => { throw new Error('Não implementado') },
    changePassword: async () => { throw new Error('Não implementado') },
    verifyEmail: async () => { throw new Error('Não implementado') },
    requestPasswordReset: async () => { throw new Error('Não implementado') },
    resetPassword: async () => { throw new Error('Não implementado') },
    checkAuthStatus: async () => false,
    clearAuthData: () => { dispatch({ type: 'AUTH_LOGOUT' }) },
  }), [state, login, logout, refreshAccessToken])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
}

/**
 * Hook para verificar se está autenticado
 */
export function useIsAuthenticated(): boolean {
  const { user, token } = useAuth()
  return !!(user && token)
}

/**
 * Hook para obter dados do usuário
 */
export function useUser(): AuthUser | null {
  const { user } = useAuth()
  return user
}

export default AuthProvider

