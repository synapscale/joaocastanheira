import { AuthUser } from '@/lib/types/auth'
import { AuthError, AuthErrorCode, AuthErrorCategory } from '@/lib/types/errors'
import { authLogger } from '@/lib/utils/logger'

/**
 * Interface para dados de autenticação a serem sincronizados
 */
export interface AuthSyncData {
  accessToken?: string
  refreshToken?: string
  user?: AuthUser
  timestamp?: number
}

/**
 * Interface para configuração do sincronizador
 */
export interface StorageSyncConfig {
  debounceDelay: number
  maxRetries: number
  retryDelay: number
  enableFallback: boolean
  batchSize: number
  enableCompression: boolean
}

/**
 * Interface para resultado de sincronização
 */
export interface SyncResult {
  success: boolean
  errors: AuthError[]
  warnings: string[]
  fallbacksUsed: string[]
  duration: number
}

/**
 * Interface para operação de storage pendente
 */
interface PendingOperation {
  id: string
  data: AuthSyncData
  timestamp: number
  priority: 'high' | 'medium' | 'low'
  retryCount: number
}

/**
 * Classe para sincronização robusta de storage com debouncing
 */
export class AuthStorageSynchronizer {
  private logger: typeof authLogger
  private config: StorageSyncConfig
  private pendingOperations: Map<string, PendingOperation> = new Map()
  private debounceTimer: NodeJS.Timeout | null = null
  private isProcessing: boolean = false
  private lastSyncTime: number = 0
  private syncQueue: PendingOperation[] = []

  constructor(config?: Partial<StorageSyncConfig>) {
    this.logger = authLogger.child({ component: 'AuthStorageSynchronizer' })
    this.config = {
      debounceDelay: 300, // 300ms
      maxRetries: 3,
      retryDelay: 500,
      enableFallback: true,
      batchSize: 5,
      enableCompression: false,
      ...config
    }

    this.logger.info('AuthStorageSynchronizer inicializado', { config: this.config })
  }

  /**
   * Agenda uma operação de sincronização com debouncing
   */
  async scheduleSync(
    data: AuthSyncData, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    const operationId = this.generateOperationId(data)
    
    this.logger.debug('Agendando operação de sincronização', {
      operationId,
      priority,
      dataKeys: Object.keys(data)
    })

    // Criar operação pendente
    const operation: PendingOperation = {
      id: operationId,
      data,
      timestamp: Date.now(),
      priority,
      retryCount: 0
    }

    // Atualizar ou adicionar operação
    this.pendingOperations.set(operationId, operation)

    // Cancelar timer anterior se existir
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // Agendar execução baseada na prioridade
    const delay = priority === 'high' ? 50 : this.config.debounceDelay

    this.debounceTimer = setTimeout(() => {
      this.processPendingOperations()
    }, delay)
  }

  /**
   * Força sincronização imediata (para casos críticos)
   */
  async forceSyncImmediate(data: AuthSyncData): Promise<SyncResult> {
    this.logger.info('Forçando sincronização imediata')
    
    // Cancelar debounce pendente
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    const operation: PendingOperation = {
      id: this.generateOperationId(data),
      data,
      timestamp: Date.now(),
      priority: 'high',
      retryCount: 0
    }

    return await this.executeSyncOperation(operation)
  }

  /**
   * Processa todas as operações pendentes
   */
  private async processPendingOperations(): Promise<void> {
    if (this.isProcessing) {
      this.logger.debug('Processamento já em andamento, pulando')
      return
    }

    this.isProcessing = true
    const startTime = Date.now()

    try {
      // Converter operações pendentes para array e ordenar por prioridade
      const operations = Array.from(this.pendingOperations.values())
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })

      this.logger.info('Processando operações pendentes', {
        totalOperations: operations.length,
        highPriority: operations.filter(op => op.priority === 'high').length,
        mediumPriority: operations.filter(op => op.priority === 'medium').length,
        lowPriority: operations.filter(op => op.priority === 'low').length
      })

      // Processar em lotes
      const batches = this.createBatches(operations, this.config.batchSize)
      const results: SyncResult[] = []

      for (const batch of batches) {
        const batchResults = await this.processBatch(batch)
        results.push(...batchResults)
      }

      // Limpar operações processadas com sucesso
      this.clearSuccessfulOperations(results)

      // Reagendar operações falhadas para retry
      this.rescheduleFailedOperations(results)

      this.lastSyncTime = Date.now()
      this.logger.info('Processamento de operações concluído', {
        duration: Date.now() - startTime,
        totalResults: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      })

    } catch (error) {
      this.logger.error('Erro crítico no processamento de operações', error)
    } finally {
      this.isProcessing = false
      this.debounceTimer = null
    }
  }

  /**
   * Processa um lote de operações
   */
  private async processBatch(operations: PendingOperation[]): Promise<SyncResult[]> {
    const results: SyncResult[] = []

    for (const operation of operations) {
      try {
        const result = await this.executeSyncOperation(operation)
        results.push(result)
      } catch (error) {
        this.logger.error('Erro ao processar operação', error, { operationId: operation.id })
        results.push({
          success: false,
          errors: [new AuthError({
            category: AuthErrorCategory.INTERNAL,
            code: AuthErrorCode.INTERNAL_UNEXPECTED_ERROR,
            message: error instanceof Error ? error.message : 'Erro desconhecido',
            userMessage: 'Erro ao sincronizar dados',
            recoverable: true,
            retryable: true,
            timestamp: new Date()
          })],
          warnings: [],
          fallbacksUsed: [],
          duration: 0
        })
      }
    }

    return results
  }

  /**
   * Executa uma operação de sincronização individual
   */
  private async executeSyncOperation(operation: PendingOperation): Promise<SyncResult> {
    const startTime = Date.now()
    const result: SyncResult = {
      success: false,
      errors: [],
      warnings: [],
      fallbacksUsed: [],
      duration: 0
    }

    this.logger.debug('Executando operação de sincronização', {
      operationId: operation.id,
      retryCount: operation.retryCount
    })

    try {
      // Tentar sincronização com localStorage
      const localStorageResult = await this.syncToLocalStorage(operation.data)
      if (!localStorageResult.success) {
        result.errors.push(...localStorageResult.errors)
        result.fallbacksUsed.push('localStorage_failed')
      }

      // Tentar sincronização com cookies
      const cookieResult = await this.syncToCookies(operation.data)
      if (!cookieResult.success) {
        result.errors.push(...cookieResult.errors)
        result.fallbacksUsed.push('cookies_failed')
      }

      // Tentar sincronização com sessionStorage como fallback
      if (this.config.enableFallback && (result.errors.length > 0)) {
        const sessionResult = await this.syncToSessionStorage(operation.data)
        if (sessionResult.success) {
          result.fallbacksUsed.push('sessionStorage_fallback')
        } else {
          result.errors.push(...sessionResult.errors)
        }
      }

      // Considerar sucesso se pelo menos uma storage funcionou
      result.success = result.errors.length < 3 // Máximo de 3 storages
      
      if (result.success) {
        this.logger.debug('Operação de sincronização bem-sucedida', {
          operationId: operation.id,
          fallbacksUsed: result.fallbacksUsed
        })
      }

    } catch (error) {
      this.logger.error('Erro na execução da operação', error, { operationId: operation.id })
      result.errors.push(new AuthError({
        category: AuthErrorCategory.INTERNAL,
        code: AuthErrorCode.INTERNAL_UNEXPECTED_ERROR,
        message: error instanceof Error ? error.message : 'Erro desconhecido na sincronização',
        userMessage: 'Erro interno na sincronização',
        recoverable: true,
        retryable: true,
        timestamp: new Date()
      }))
    }

    result.duration = Date.now() - startTime
    return result
  }

  /**
   * Sincroniza dados para localStorage
   */
  private async syncToLocalStorage(data: AuthSyncData): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      errors: [],
      warnings: [],
      fallbacksUsed: [],
      duration: 0
    }

    try {
      if (typeof window === 'undefined') {
        throw new Error('localStorage não disponível no servidor')
      }

      const timestamp = Date.now()

      if (data.accessToken) {
        localStorage.setItem('synapsefrontend_auth_token', data.accessToken)
      }
      if (data.refreshToken) {
        localStorage.setItem('synapsefrontend_refresh_token', data.refreshToken)
      }
      if (data.user) {
        localStorage.setItem('synapsefrontend_user', JSON.stringify(data.user))
      }
      if (data.timestamp) {
        localStorage.setItem('synapsefrontend_timestamp', timestamp.toString())
      }

      result.success = true

    } catch (error) {
      result.errors.push(new AuthError({
        category: AuthErrorCategory.INTERNAL,
        code: AuthErrorCode.TOKEN_SAVE_FAILED,
        message: error instanceof Error ? error.message : 'Falha ao salvar no localStorage',
        userMessage: 'Erro ao salvar dados localmente',
        recoverable: true,
        retryable: true,
        timestamp: new Date()
      }))
    }

    return result
  }

  /**
   * Sincroniza dados para cookies
   */
  private async syncToCookies(data: AuthSyncData): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      errors: [],
      warnings: [],
      fallbacksUsed: [],
      duration: 0
    }

    try {
      if (typeof document === 'undefined') {
        throw new Error('Cookies não disponíveis no servidor')
      }

      const expires = new Date()
      expires.setDate(expires.getDate() + 7) // 7 dias

      if (data.accessToken) {
        document.cookie = `synapsefrontend_auth_token=${data.accessToken}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`
      }
      if (data.refreshToken) {
        document.cookie = `synapsefrontend_refresh_token=${data.refreshToken}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`
      }

      result.success = true

    } catch (error) {
      result.errors.push(new AuthError({
        category: AuthErrorCategory.INTERNAL,
        code: AuthErrorCode.TOKEN_SAVE_FAILED,
        message: error instanceof Error ? error.message : 'Falha ao salvar em cookies',
        userMessage: 'Erro ao salvar cookies',
        recoverable: true,
        retryable: true,
        timestamp: new Date()
      }))
    }

    return result
  }

  /**
   * Sincroniza dados para sessionStorage (fallback)
   */
  private async syncToSessionStorage(data: AuthSyncData): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      errors: [],
      warnings: [],
      fallbacksUsed: [],
      duration: 0
    }

    try {
      if (typeof window === 'undefined') {
        throw new Error('sessionStorage não disponível no servidor')
      }

      if (data.accessToken) {
        sessionStorage.setItem('synapsefrontend_auth_token', data.accessToken)
      }
      if (data.refreshToken) {
        sessionStorage.setItem('synapsefrontend_refresh_token', data.refreshToken)
      }
      if (data.user) {
        sessionStorage.setItem('synapsefrontend_user', JSON.stringify(data.user))
      }

      result.success = true

    } catch (error) {
      result.errors.push(new AuthError({
        category: AuthErrorCategory.INTERNAL,
        code: AuthErrorCode.TOKEN_SAVE_FAILED,
        message: error instanceof Error ? error.message : 'Falha ao salvar no sessionStorage',
        userMessage: 'Erro ao salvar dados da sessão',
        recoverable: true,
        retryable: true,
        timestamp: new Date()
      }))
    }

    return result
  }

  /**
   * Gera ID único para operação
   */
  private generateOperationId(data: AuthSyncData): string {
    const keys = Object.keys(data).sort().join('_')
    const timestamp = Date.now()
    return `sync_${keys}_${timestamp}`
  }

  /**
   * Cria lotes de operações para processamento
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Remove operações bem-sucedidas da lista de pendências
   */
  private clearSuccessfulOperations(results: SyncResult[]): void {
    // Implementação simplificada - em uma versão mais complexa,
    // mapearíamos resultados para operações específicas
    if (results.some(r => r.success)) {
      this.pendingOperations.clear()
    }
  }

  /**
   * Reagenda operações falhadas para retry
   */
  private rescheduleFailedOperations(results: SyncResult[]): void {
    const failedResults = results.filter(r => !r.success)
    
    if (failedResults.length > 0) {
      this.logger.warn('Reagendando operações falhadas', {
        count: failedResults.length
      })

      // Reagendar após delay
      setTimeout(() => {
        if (this.pendingOperations.size > 0) {
          this.processPendingOperations()
        }
      }, this.config.retryDelay)
    }
  }

  /**
   * Obtém estatísticas do sincronizador
   */
  public getStats() {
    return {
      pendingOperations: this.pendingOperations.size,
      isProcessing: this.isProcessing,
      lastSyncTime: this.lastSyncTime,
      queueSize: this.syncQueue.length,
      config: this.config
    }
  }

  /**
   * Limpa todas as operações pendentes
   */
  public clearPendingOperations(): void {
    this.pendingOperations.clear()
    this.syncQueue = []
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    this.logger.info('Todas as operações pendentes foram limpas')
  }
} 