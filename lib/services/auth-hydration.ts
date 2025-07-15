import { AuthUser } from '@/lib/types/auth'
import { AuthError, AuthErrorCode, AuthErrorCategory, AuthErrorInfo } from '@/lib/types/errors'
import { authLogger } from '@/lib/utils/logger'

/**
 * Interface para dados de autenticação armazenados
 */
export interface StoredAuthData {
  accessToken: string
  refreshToken: string
  user: AuthUser
  timestamp: number
  version: string
}

/**
 * Interface para resultado da hidratação
 */
export interface HydrationResult {
  success: boolean
  data?: StoredAuthData
  source?: 'localStorage' | 'sessionStorage' | 'cookies' | 'memory'
  error?: AuthError
  fallbacksUsed: string[]
}

/**
 * Interface para configuração de hidratação
 */
export interface HydrationConfig {
  maxRetries: number
  retryDelay: number
  enableFallbacks: boolean
  enableIntegrityCheck: boolean
  enableParallelCheck: boolean
  storageVersion: string
  maxDataAge: number // ms
}

/**
 * Interface para validação de integridade
 */
export interface IntegrityCheck {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Serviço para hidratação robusta do estado de autenticação
 */
export class AuthHydrationService {
  private logger: typeof authLogger
  private config: HydrationConfig
  private memoryCache: Map<string, any> = new Map()

  constructor() {
    this.logger = authLogger.child({ component: 'AuthHydrationService' })
    this.config = {
      maxRetries: 3,
      retryDelay: 200,
      enableFallbacks: true,
      enableIntegrityCheck: true,
      enableParallelCheck: true,
      storageVersion: '1.0.0',
      maxDataAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    }
  }

  /**
   * Hidrata o estado de autenticação de forma robusta
   */
  async hydrateAuthState(): Promise<HydrationResult> {
    this.logger.info('Iniciando hidratação robusta do estado de autenticação')

    const result: HydrationResult = {
      success: false,
      fallbacksUsed: []
    }

    try {
      // Tentativa 1: Hidratação em paralelo (se habilitada)
      if (this.config.enableParallelCheck) {
        const parallelResult = await this.tryParallelHydration()
        if (parallelResult.success) {
          this.logger.info('Hidratação paralela bem-sucedida', { source: parallelResult.source })
          return parallelResult
        }
        result.fallbacksUsed.push('parallel_check')
      }

      // Tentativa 2: Hidratação sequencial com fallbacks
      if (this.config.enableFallbacks) {
        const fallbackResult = await this.trySequentialHydration()
        if (fallbackResult.success) {
          this.logger.info('Hidratação sequencial bem-sucedida', { source: fallbackResult.source })
          return fallbackResult
        }
        result.fallbacksUsed.push(...fallbackResult.fallbacksUsed)
      }

      // Tentativa 3: Recuperação de corrupção
      const recoveryResult = await this.tryDataRecovery()
      if (recoveryResult.success) {
        this.logger.info('Recuperação de dados bem-sucedida', { source: recoveryResult.source })
        return recoveryResult
      }
      result.fallbacksUsed.push('data_recovery')

      // Todas as tentativas falharam
      result.error = new AuthError({
        code: AuthErrorCode.HYDRATION_FAILED,
        message: 'Falha na hidratação após todas as tentativas',
        category: AuthErrorCategory.INTERNAL,
        userMessage: 'Erro ao carregar dados de autenticação',
        recoverable: true,
        retryable: true,
        debugInfo: { fallbacksUsed: result.fallbacksUsed },
        timestamp: new Date()
      })

      this.logger.error('Falha na hidratação após todas as tentativas', result.error)
      return result

    } catch (error) {
      const authError = error instanceof AuthError ? error : new AuthError({
        code: AuthErrorCode.HYDRATION_FAILED,
        message: error instanceof Error ? error.message : 'Erro desconhecido na hidratação',
        category: AuthErrorCategory.INTERNAL,
        userMessage: 'Erro interno na inicialização',
        recoverable: true,
        retryable: true,
        timestamp: new Date()
      })

      result.error = authError
      this.logger.error('Erro crítico na hidratação', authError)
      return result
    }
  }

  /**
   * Tenta hidratação em paralelo de múltiplas fontes
   */
  private async tryParallelHydration(): Promise<HydrationResult> {
    this.logger.debug('Tentando hidratação em paralelo')

    const sources = ['localStorage', 'sessionStorage', 'cookies'] as const
    const promises = sources.map(source => this.tryHydrationFromSource(source))

    try {
      // Aguarda a primeira fonte que retornar dados válidos
      const results = await Promise.allSettled(promises)
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'fulfilled' && result.value.success) {
          return {
            ...result.value,
            fallbacksUsed: [`parallel_${sources[i]}`]
          }
        }
      }

      return {
        success: false,
        fallbacksUsed: sources.map(s => `parallel_${s}_failed`)
      }

         } catch (error) {
       this.logger.error('Erro na hidratação paralela', error)
       return {
         success: false,
         error: new AuthError({
           code: AuthErrorCode.HYDRATION_FAILED,
           message: 'Erro na hidratação paralela',
           category: AuthErrorCategory.INTERNAL,
           userMessage: 'Erro no carregamento paralelo de dados',
           recoverable: true,
           retryable: true,
           timestamp: new Date()
         }),
         fallbacksUsed: ['parallel_error']
       }
    }
  }

  /**
   * Tenta hidratação sequencial com fallbacks
   */
  private async trySequentialHydration(): Promise<HydrationResult> {
    this.logger.debug('Tentando hidratação sequencial com fallbacks')

    const sources = ['localStorage', 'sessionStorage', 'cookies'] as const
    const fallbacksUsed: string[] = []

    for (const source of sources) {
      try {
        const result = await this.tryHydrationFromSource(source)
        if (result.success) {
          return {
            ...result,
            fallbacksUsed: [...fallbacksUsed, `sequential_${source}_success`]
          }
        }
        fallbacksUsed.push(`sequential_${source}_failed`)
      } catch (error) {
        this.logger.warn(`Erro ao tentar hidratação de ${source}`, error)
        fallbacksUsed.push(`sequential_${source}_error`)
      }
    }

    return {
      success: false,
      fallbacksUsed
    }
  }

  /**
   * Tenta hidratação de uma fonte específica
   */
  private async tryHydrationFromSource(source: 'localStorage' | 'sessionStorage' | 'cookies'): Promise<HydrationResult> {
    let attempt = 0
    
    while (attempt < this.config.maxRetries) {
      try {
        const data = await this.loadDataFromSource(source)
        if (!data) {
          throw new Error(`Nenhum dado encontrado em ${source}`)
        }

        // Validação de integridade
        if (this.config.enableIntegrityCheck) {
          const integrityCheck = this.validateDataIntegrity(data)
          if (!integrityCheck.isValid) {
            throw new Error(`Dados corrompidos em ${source}: ${integrityCheck.errors.join(', ')}`)
          }
        }

        // Verificar idade dos dados
        const dataAge = Date.now() - data.timestamp
        if (dataAge > this.config.maxDataAge) {
          throw new Error(`Dados muito antigos em ${source} (${Math.round(dataAge / (24 * 60 * 60 * 1000))} dias)`)
        }

        this.logger.info(`Hidratação bem-sucedida de ${source}`, { 
          attempt: attempt + 1,
          dataAge: Math.round(dataAge / (60 * 1000)) // minutos
        })

        return {
          success: true,
          data,
          source,
          fallbacksUsed: []
        }

      } catch (error) {
        attempt++
        this.logger.warn(`Tentativa ${attempt} falhou para ${source}`, error)

        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(1.5, attempt - 1) // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw new Error(`Falha na hidratação de ${source} após ${this.config.maxRetries} tentativas`)
  }

  /**
   * Carrega dados de uma fonte específica
   */
  private async loadDataFromSource(source: 'localStorage' | 'sessionStorage' | 'cookies'): Promise<StoredAuthData | null> {
    try {
      let rawData: string | null = null

      switch (source) {
        case 'localStorage':
          rawData = localStorage.getItem('synapsefrontend_auth_data')
          break
        case 'sessionStorage':
          rawData = sessionStorage.getItem('synapsefrontend_auth_data')
          break
        case 'cookies':
          // Implementar leitura de cookies se necessário
          rawData = this.getCookieValue('synapsefrontend_auth_data')
          break
      }

      if (!rawData) {
        return null
      }

      const data = JSON.parse(rawData) as StoredAuthData
      return data

    } catch (error) {
      this.logger.error(`Erro ao carregar dados de ${source}`, error)
      return null
    }
  }

  /**
   * Valida a integridade dos dados
   */
  private validateDataIntegrity(data: StoredAuthData): IntegrityCheck {
    const errors: string[] = []
    const warnings: string[] = []

    // Verificar campos obrigatórios
    if (!data.accessToken) errors.push('accessToken ausente')
    if (!data.refreshToken) warnings.push('refreshToken ausente')
    if (!data.user) errors.push('user ausente')
    if (!data.timestamp) errors.push('timestamp ausente')
    if (!data.version) warnings.push('version ausente')

    // Verificar formato do token
    if (data.accessToken && typeof data.accessToken === 'string') {
      const tokenParts = data.accessToken.split('.')
      if (tokenParts.length !== 3) {
        errors.push('accessToken não é um JWT válido')
      } else {
        try {
          const payload = JSON.parse(atob(tokenParts[1]))
          const now = Math.floor(Date.now() / 1000)
          if (payload.exp && payload.exp < now) {
            warnings.push('accessToken expirado')
          }
        } catch {
          errors.push('accessToken payload inválido')
        }
      }
    }

    // Verificar estrutura do usuário
    if (data.user && typeof data.user === 'object') {
      if (!data.user.id) errors.push('user.id ausente')
      if (!data.user.email) warnings.push('user.email ausente')
    }

    // Verificar versão
    if (data.version && data.version !== this.config.storageVersion) {
      warnings.push(`versão incompatível: ${data.version} vs ${this.config.storageVersion}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Tenta recuperação de dados corrompidos
   */
  private async tryDataRecovery(): Promise<HydrationResult> {
    this.logger.info('Tentando recuperação de dados corrompidos')

    // Estratégia 1: Verificar cache em memória
    const memoryData = this.memoryCache.get('auth_data')
    if (memoryData) {
      this.logger.info('Dados recuperados do cache em memória')
      return {
        success: true,
        data: memoryData,
        source: 'memory',
        fallbacksUsed: ['memory_recovery']
      }
    }

    // Estratégia 2: Tentar recuperar dados parciais
    const partialData = await this.tryPartialRecovery()
    if (partialData) {
      this.logger.info('Dados parciais recuperados')
      return {
        success: true,
        data: partialData,
        source: 'localStorage',
        fallbacksUsed: ['partial_recovery']
      }
    }

    return {
      success: false,
      fallbacksUsed: ['recovery_failed']
    }
  }

  /**
   * Tenta recuperar dados parciais de diferentes chaves
   */
  private async tryPartialRecovery(): Promise<StoredAuthData | null> {
    try {
      const token = localStorage.getItem('synapsefrontend_auth_token')
      const refreshToken = localStorage.getItem('synapsefrontend_refresh_token')
      const userStr = localStorage.getItem('synapsefrontend_user')

      if (!token || !userStr) {
        return null
      }

      const user = JSON.parse(userStr)
      
      return {
        accessToken: token,
        refreshToken: refreshToken || token,
        user,
        timestamp: Date.now(),
        version: this.config.storageVersion
      }

    } catch (error) {
      this.logger.error('Erro na recuperação parcial', error)
      return null
    }
  }

  /**
   * Salva dados no cache em memória
   */
  saveToMemoryCache(data: StoredAuthData): void {
    this.memoryCache.set('auth_data', data)
    this.logger.debug('Dados salvos no cache em memória')
  }

  /**
   * Limpa cache em memória
   */
  clearMemoryCache(): void {
    this.memoryCache.clear()
    this.logger.debug('Cache em memória limpo')
  }

  /**
   * Utilitário para ler cookies
   */
  private getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  /**
   * Configura o serviço
   */
  configure(config: Partial<HydrationConfig>): void {
    this.config = { ...this.config, ...config }
    this.logger.info('Configuração atualizada', this.config)
  }
}

export const authHydrationService = new AuthHydrationService() 