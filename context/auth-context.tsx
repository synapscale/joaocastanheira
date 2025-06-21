"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authService } from '../lib/services/auth'
import type {
  AuthContextType,
  AuthUser,
  LoginData,
  RegisterData,
  AuthResponse,
  AuthState,
  AuthAction,
  AuthError,
} from '../lib/types/auth'

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isInitialized: false,
  error: null,
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
        token: action.payload,
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

  // Inicializar autenticação ao carregar a aplicação
  useEffect(() => {
    initializeAuth()
  }, [])

  // Auto-refresh do token
  useEffect(() => {
    if (state.token && state.isInitialized) {
      const interval = setInterval(() => {
        if (authService.isTokenExpiringSoon()) {
          refreshAccessToken()
        }
      }, 60000) // Verificar a cada minuto

      return () => clearInterval(interval)
    }
  }, [state.token, state.isInitialized])

  /**
   * Inicializa autenticação verificando dados salvos
   */
  const initializeAuth = useCallback(async () => {
    if (typeof window === 'undefined') return; // Só roda no client!
    
    try {
      const storedUser = authService.getStoredUser()
      const storedToken = authService.getStoredToken()
      const storedRefreshToken = authService.getStoredRefreshToken()

      if (storedUser && storedToken && storedRefreshToken) {
        // Verificar se token ainda é válido
        const isValid = await authService.checkAuthStatus()
        
        if (isValid) {
          console.log('AuthContext - Restaurando sessão do usuário');
          
          // Sincronizar tokens com o ApiService
          const { apiService } = await import('../lib/api/service')
          console.log('🔍 DEBUG AuthContext - Sincronizando tokens com ApiService');
          console.log('🔍 DEBUG AuthContext - Token:', storedToken?.substring(0, 20) + '...');
          apiService.syncTokensWithAuthService(storedToken, storedRefreshToken)
          console.log('🔍 DEBUG AuthContext - ApiService autenticado após sync:', apiService.isAuthenticated());
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: storedUser,
              tokens: {
                accessToken: storedToken,
                refreshToken: storedRefreshToken,
                expiresIn: 0,
                tokenType: 'Bearer',
              },
            },
          })
        } else {
          authService.clearAuthData()
        }
      }
    } catch (error) {
      console.warn('⚠️ AuthContext - Erro ao inicializar autenticação:', error)
      authService.clearAuthData()
    } finally {
      dispatch({ type: 'AUTH_INITIALIZE' })
    }
  }, [])

  /**
   * Realiza login
   */
  const login = useCallback(async (data: LoginData): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' })
    
    try {
      const response = await authService.login(data)
      
      // Sincronizar tokens com o ApiService após login
      const { apiService } = await import('../lib/api/service')
      console.log('🔍 DEBUG AuthContext - Sincronizando tokens após login');
      apiService.syncTokensWithAuthService(response.tokens.accessToken, response.tokens.refreshToken)
      console.log('🔍 DEBUG AuthContext - ApiService autenticado após login:', apiService.isAuthenticated());
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens,
        },
      })

      return response
    } catch (error) {
      const authError: AuthError = {
        code: 'LOGIN_FAILED',
        message: error instanceof Error ? error.message : 'Erro ao fazer login',
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: authError })
      throw error
    }
  }, [])

  /**
   * Realiza registro
   */
  const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' })
    
    try {
      const response = await authService.register(data)
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens,
        },
      })

      return response
    } catch (error) {
      const authError: AuthError = {
        code: 'REGISTER_FAILED',
        message: error instanceof Error ? error.message : 'Erro ao criar conta',
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: authError })
      throw error
    }
  }, [])

  /**
   * Realiza logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout()
    } catch (error) {
      console.warn('⚠️ Erro ao fazer logout:', error)
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }, [])

  /**
   * Atualiza token de acesso
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const newToken = await authService.refreshAccessToken()
      
      if (newToken) {
        dispatch({ type: 'AUTH_REFRESH_TOKEN', payload: newToken })
      }
      
      return newToken
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar token:', error)
      dispatch({ type: 'AUTH_LOGOUT' })
      return null
    }
  }, [])

  /**
   * Atualiza dados do usuário
   */
  const updateUser = useCallback(async (data: Partial<AuthUser>): Promise<AuthUser> => {
    try {
      const updatedUser = await authService.updateUser(data)
      dispatch({ type: 'AUTH_UPDATE_USER', payload: updatedUser })
      return updatedUser
    } catch (error) {
      const authError: AuthError = {
        code: 'UPDATE_USER_FAILED',
        message: error instanceof Error ? error.message : 'Erro ao atualizar usuário',
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: authError })
      throw error
    }
  }, [])

  /**
   * Altera senha
   */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await authService.changePassword(currentPassword, newPassword)
    } catch (error) {
      const authError: AuthError = {
        code: 'CHANGE_PASSWORD_FAILED',
        message: error instanceof Error ? error.message : 'Erro ao alterar senha',
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: authError })
      throw error
    }
  }, [])

  /**
   * Verifica email
   */
  const verifyEmail = useCallback(async (token: string): Promise<void> => {
    try {
      await authService.verifyEmail(token)
      
      // Atualizar dados do usuário após verificação
      if (state.user) {
        const updatedUser = await authService.getCurrentUser()
        dispatch({ type: 'AUTH_UPDATE_USER', payload: updatedUser })
      }
    } catch (error) {
      const authError: AuthError = {
        code: 'EMAIL_VERIFICATION_FAILED',
        message: error instanceof Error ? error.message : 'Erro ao verificar email',
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: authError })
      throw error
    }
  }, [state.user])

  /**
   * Solicita reset de senha
   */
  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    try {
      await authService.requestPasswordReset(email)
    } catch (error) {
      const authError: AuthError = {
        code: 'PASSWORD_RESET_REQUEST_FAILED',
        message: error instanceof Error ? error.message : 'Erro ao solicitar reset de senha',
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: authError })
      throw error
    }
  }, [])

  /**
   * Reseta senha
   */
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
    try {
      await authService.resetPassword(token, newPassword)
    } catch (error) {
      const authError: AuthError = {
        code: 'PASSWORD_RESET_FAILED',
        message: error instanceof Error ? error.message : 'Erro ao resetar senha',
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: authError })
      throw error
    }
  }, [])

  /**
   * Verifica status de autenticação
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      return await authService.checkAuthStatus()
    } catch (error) {
      console.warn('⚠️ Erro ao verificar status de autenticação:', error)
      return false
    }
  }, [])

  /**
   * Limpa dados de autenticação
   */
  const clearAuthData = useCallback((): void => {
    authService.clearAuthData()
    dispatch({ type: 'AUTH_LOGOUT' })
  }, [])

  // Valor do contexto
  const contextValue: AuthContextType = {
    // Estado
    user: state.user,
    token: state.token,
    refreshToken: state.refreshToken,
    isAuthenticated: !!state.user && !!state.token,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    
    // Métodos
    login,
    register,
    logout,
    refreshAccessToken,
    updateUser,
    changePassword,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    checkAuthStatus,
    clearAuthData,
  }

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
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

/**
 * Hook para obter dados do usuário
 */
export function useUser(): AuthUser | null {
  const { user } = useAuth()
  return user
}

export default AuthProvider

