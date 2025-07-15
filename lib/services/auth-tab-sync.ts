import { AuthUser } from '@/lib/types/auth'
import { AuthError, AuthErrorCode, AuthErrorCategory } from '@/lib/types/errors'
import { authLogger } from '@/lib/utils/logger'

/**
 * Interface para mensagens de sincronização entre tabs
 */
export interface AuthTabMessage {
  type: 'AUTH_LOGIN' | 'AUTH_LOGOUT' | 'AUTH_REFRESH' | 'AUTH_UPDATE' | 'AUTH_PING' | 'AUTH_PONG'
  payload: {
    user?: AuthUser | null
    accessToken?: string | null
    refreshToken?: string | null
    timestamp: number
    tabId: string
    sequence: number
    sessionId: string
  }
  version: string
  signature?: string
}

/**
 * Interface para configuração do sincronizador
 */
export interface TabSyncConfig {
  enableBroadcastChannel: boolean
  enableStorageEvents: boolean
  conflictResolutionStrategy: 'latest_wins' | 'priority_based' | 'merge'
  pingInterval: number
  tabTimeout: number
  enableSignature: boolean
  maxRetries: number
}

/**
 * Interface para estado de tab
 */
interface TabState {
  id: string
  lastSeen: number
  lastSequence: number
  isActive: boolean
  sessionId: string
}

/**
 * Callback para mudanças de autenticação
 */
export type AuthChangeCallback = (message: AuthTabMessage) => void

/**
 * Classe para sincronização multi-tab robusta
 */
export class AuthTabSynchronizer {
  private logger: typeof authLogger
  private config: TabSyncConfig
  private broadcastChannel: BroadcastChannel | null = null
  private tabId: string
  private sessionId: string
  private sequenceNumber: number = 0
  private activeTabs: Map<string, TabState> = new Map()
  private changeCallbacks: Set<AuthChangeCallback> = new Set()
  private storageEventListener: ((event: StorageEvent) => void) | null = null
  private pingTimer: NodeJS.Timeout | null = null
  private cleanupTimer: NodeJS.Timeout | null = null
  private isInitialized: boolean = false

  constructor(config?: Partial<TabSyncConfig>) {
    this.logger = authLogger.child({ component: 'AuthTabSynchronizer' })
    this.config = {
      enableBroadcastChannel: true,
      enableStorageEvents: true,
      conflictResolutionStrategy: 'latest_wins',
      pingInterval: 5000, // 5 segundos
      tabTimeout: 15000, // 15 segundos
      enableSignature: false,
      maxRetries: 3,
      ...config
    }

    // Gerar IDs únicos para esta tab
    this.tabId = this.generateTabId()
    this.sessionId = this.generateSessionId()

    this.logger.info('AuthTabSynchronizer criado', {
      tabId: this.tabId,
      sessionId: this.sessionId,
      config: this.config
    })
  }

  /**
   * Inicializa o sincronizador
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('AuthTabSynchronizer já foi inicializado')
      return
    }

    try {
      this.logger.info('Inicializando AuthTabSynchronizer')

      // Verificar se está no browser
      if (typeof window === 'undefined') {
        throw new Error('AuthTabSynchronizer só funciona no browser')
      }

      // Configurar BroadcastChannel
      if (this.config.enableBroadcastChannel && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('auth_sync')
        this.broadcastChannel.addEventListener('message', this.handleBroadcastMessage.bind(this))
        this.logger.info('BroadcastChannel configurado')
      }

      // Configurar Storage Events
      if (this.config.enableStorageEvents) {
        this.storageEventListener = this.handleStorageEvent.bind(this)
        if (this.storageEventListener) {
          window.addEventListener('storage', this.storageEventListener)
          this.logger.info('Storage events configurados')
        }
      }

      // TEMPORARIAMENTE DESABILITADO - ping e cleanup automáticos
      // this.startPingSystem()
      // this.startTabCleanup()
      console.log('🔴 AuthTabSynchronizer: Ping e Cleanup systems DESABILITADOS temporariamente')

      // Registrar esta tab como ativa
      this.registerTab()

    } catch (error) {
      this.logger.error('Erro ao inicializar AuthTabSynchronizer', error)
      throw new AuthError({
        category: AuthErrorCategory.INTERNAL,
        code: AuthErrorCode.INITIALIZATION_FAILED,
        message: error instanceof Error ? error.message : 'Falha na inicialização do sincronizador',
        userMessage: 'Erro ao inicializar sincronização entre abas',
        recoverable: true,
        retryable: true,
        timestamp: new Date()
      })
    }
  }

  /**
   * Finaliza o sincronizador
   */
  async destroy(): Promise<void> {
    this.logger.info('Finalizando AuthTabSynchronizer')

    try {
      // Limpar timers
      if (this.pingTimer) {
        clearInterval(this.pingTimer)
        this.pingTimer = null
      }
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer)
        this.cleanupTimer = null
      }

      // Desconectar BroadcastChannel
      if (this.broadcastChannel) {
        this.broadcastChannel.close()
        this.broadcastChannel = null
      }

      // Remover storage event listener
      if (this.storageEventListener && typeof window !== 'undefined') {
        window.removeEventListener('storage', this.storageEventListener)
        this.storageEventListener = null
      }

      // Limpar callbacks
      this.changeCallbacks.clear()

      // Desregistrar esta tab
      this.unregisterTab()

      this.isInitialized = false
      this.logger.info('AuthTabSynchronizer finalizado')

    } catch (error) {
      this.logger.error('Erro ao finalizar AuthTabSynchronizer', error)
    }
  }

  /**
   * Adiciona callback para mudanças de autenticação
   */
  onAuthChange(callback: AuthChangeCallback): () => void {
    this.changeCallbacks.add(callback)
    
    // Retorna função para remover o callback
    return () => {
      this.changeCallbacks.delete(callback)
    }
  }

  /**
   * Notifica login em todas as tabs
   */
  async notifyLogin(user: AuthUser, accessToken: string, refreshToken: string): Promise<void> {
    const message: AuthTabMessage = {
      type: 'AUTH_LOGIN',
      payload: {
        user,
        accessToken,
        refreshToken,
        timestamp: Date.now(),
        tabId: this.tabId,
        sequence: ++this.sequenceNumber,
        sessionId: this.sessionId
      },
      version: '1.0'
    }

    await this.broadcastMessage(message)
    this.logger.info('Login notificado para todas as tabs')
  }

  /**
   * Notifica logout em todas as tabs
   */
  async notifyLogout(): Promise<void> {
    const message: AuthTabMessage = {
      type: 'AUTH_LOGOUT',
      payload: {
        user: null,
        accessToken: null,
        refreshToken: null,
        timestamp: Date.now(),
        tabId: this.tabId,
        sequence: ++this.sequenceNumber,
        sessionId: this.sessionId
      },
      version: '1.0'
    }

    await this.broadcastMessage(message)
    this.logger.info('Logout notificado para todas as tabs')
  }

  /**
   * Notifica refresh de token em todas as tabs
   */
  async notifyTokenRefresh(accessToken: string, refreshToken?: string): Promise<void> {
    const message: AuthTabMessage = {
      type: 'AUTH_REFRESH',
      payload: {
        accessToken,
        refreshToken,
        timestamp: Date.now(),
        tabId: this.tabId,
        sequence: ++this.sequenceNumber,
        sessionId: this.sessionId
      },
      version: '1.0'
    }

    await this.broadcastMessage(message)
    this.logger.info('Refresh de token notificado para todas as tabs')
  }

  /**
   * Notifica atualização de usuário em todas as tabs
   */
  async notifyUserUpdate(user: AuthUser): Promise<void> {
    const message: AuthTabMessage = {
      type: 'AUTH_UPDATE',
      payload: {
        user,
        timestamp: Date.now(),
        tabId: this.tabId,
        sequence: ++this.sequenceNumber,
        sessionId: this.sessionId
      },
      version: '1.0'
    }

    await this.broadcastMessage(message)
    this.logger.info('Atualização de usuário notificada para todas as tabs')
  }

  /**
   * Transmite mensagem para outras tabs
   */
  private async broadcastMessage(message: AuthTabMessage): Promise<void> {
    try {
      // Adicionar assinatura se habilitado
      if (this.config.enableSignature) {
        message.signature = await this.signMessage(message)
      }

      // Enviar via BroadcastChannel
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(message)
      }

      // Enviar via Storage Events (fallback) - DISABLED to prevent infinite loops
      // Artificial storage events can cause cascading loops with other storage listeners
      // BroadcastChannel is sufficient for tab communication
      if (false && this.config.enableStorageEvents) {
        const storageKey = `auth_sync_${Date.now()}_${this.tabId}`
        localStorage.setItem(storageKey, JSON.stringify(message))
        
        // Limpar chave após um tempo para evitar poluição
        setTimeout(() => {
          localStorage.removeItem(storageKey)
        }, 1000)
      }

    } catch (error) {
      this.logger.error('Erro ao transmitir mensagem', error)
      throw error
    }
  }

  /**
   * Trata mensagens do BroadcastChannel
   */
  private async handleBroadcastMessage(event: MessageEvent<AuthTabMessage>): Promise<void> {
    try {
      const message = event.data

      // Ignorar mensagens da própria tab
      if (message.payload.tabId === this.tabId) {
        return
      }

      await this.processMessage(message)

    } catch (error) {
      this.logger.error('Erro ao processar mensagem do BroadcastChannel', error)
    }
  }

  /**
   * Trata eventos de storage
   */
  private async handleStorageEvent(event: StorageEvent): Promise<void> {
    try {
      // Verificar se é uma mensagem de sincronização
      if (!event.key?.startsWith('auth_sync_') || !event.newValue) {
        return
      }

      const message: AuthTabMessage = JSON.parse(event.newValue)

      // Ignorar mensagens da própria tab
      if (message.payload.tabId === this.tabId) {
        return
      }

      await this.processMessage(message)

    } catch (error) {
      this.logger.error('Erro ao processar storage event', error)
    }
  }

  /**
   * Processa mensagem recebida
   */
  private async processMessage(message: AuthTabMessage): Promise<void> {
    this.logger.debug('Processando mensagem de sincronização', {
      type: message.type,
      fromTab: message.payload.tabId,
      sequence: message.payload.sequence
    })

    try {
      // Verificar assinatura se habilitado
      if (this.config.enableSignature && !(await this.verifyMessage(message))) {
        this.logger.warn('Mensagem com assinatura inválida rejeitada')
        return
      }

      // Atualizar estado da tab remetente
      this.updateTabState(message.payload.tabId, message.payload.sequence, message.payload.sessionId)

      // Processar baseado no tipo
      switch (message.type) {
        case 'AUTH_PING':
          await this.handlePing(message)
          break
        case 'AUTH_PONG':
          await this.handlePong(message)
          break
        case 'AUTH_LOGIN':
        case 'AUTH_LOGOUT':
        case 'AUTH_REFRESH':
        case 'AUTH_UPDATE':
          // Resolver conflitos se necessário
          if (await this.shouldProcessMessage(message)) {
            this.notifyCallbacks(message)
          }
          break
      }

    } catch (error) {
      this.logger.error('Erro ao processar mensagem', error)
    }
  }

  /**
   * Determina se deve processar mensagem baseado na estratégia de resolução de conflitos
   */
  private async shouldProcessMessage(message: AuthTabMessage): Promise<boolean> {
    switch (this.config.conflictResolutionStrategy) {
      case 'latest_wins':
        return true // Sempre processa (última mensagem ganha)
      
      case 'priority_based':
        // Tab com sessionId "menor" tem prioridade (primeira a abrir)
        return message.payload.sessionId <= this.sessionId
      
      case 'merge':
        // Estratégia de merge - implementação mais complexa
        return await this.canMergeMessage(message)
      
      default:
        return true
    }
  }

  /**
   * Verifica se mensagem pode ser merged (estratégia simplificada)
   */
  private async canMergeMessage(message: AuthTabMessage): Promise<boolean> {
    // Implementação simplificada - em produção seria mais sofisticada
    return true
  }

  /**
   * Notifica todos os callbacks registrados
   */
  private notifyCallbacks(message: AuthTabMessage): void {
    this.changeCallbacks.forEach(callback => {
      try {
        callback(message)
      } catch (error) {
        this.logger.error('Erro em callback de mudança de auth', error)
      }
    })
  }

  /**
   * Sistema de ping para detectar tabs ativas
   */
  private startPingSystem(): void {
    // TEMPORARIAMENTE DESABILITADO - ping automático a cada 5 segundos
    // this.pingTimer = setInterval(async () => {\n    //   await this.sendPing()\n    // }, this.config.pingInterval)\n    \n    console.log('🔴 AuthTabSynchronizer: Ping system DESABILITADO temporariamente')\n  }
  }

  /**
   * Envia ping para outras tabs
   */
  private async sendPing(): Promise<void> {
    const message: AuthTabMessage = {
      type: 'AUTH_PING',
      payload: {
        timestamp: Date.now(),
        tabId: this.tabId,
        sequence: ++this.sequenceNumber,
        sessionId: this.sessionId
      },
      version: '1.0'
    }

    await this.broadcastMessage(message)
  }

  /**
   * Trata ping recebido
   */
  private async handlePing(message: AuthTabMessage): Promise<void> {
    // Responder com pong
    const response: AuthTabMessage = {
      type: 'AUTH_PONG',
      payload: {
        timestamp: Date.now(),
        tabId: this.tabId,
        sequence: ++this.sequenceNumber,
        sessionId: this.sessionId
      },
      version: '1.0'
    }

    await this.broadcastMessage(response)
  }

  /**
   * Trata pong recebido
   */
  private async handlePong(message: AuthTabMessage): Promise<void> {
    // Atualizar estado da tab que respondeu
    this.updateTabState(message.payload.tabId, message.payload.sequence, message.payload.sessionId)
  }

  /**
   * Atualiza estado de uma tab
   */
  private updateTabState(tabId: string, sequence: number, sessionId: string): void {
    const existing = this.activeTabs.get(tabId)
    
    this.activeTabs.set(tabId, {
      id: tabId,
      lastSeen: Date.now(),
      lastSequence: sequence,
      isActive: true,
      sessionId: sessionId
    })

    if (!existing) {
      this.logger.info('Nova tab detectada', { tabId, sessionId })
    }
  }

  /**
   * Sistema de limpeza de tabs inativas
   */
  private startTabCleanup(): void {
    // TEMPORARIAMENTE DESABILITADO - limpeza automática de tabs inativas
    // this.cleanupTimer = setInterval(() => {
    //   const now = Date.now()
    //   const toRemove: string[] = []

    //   this.activeTabs.forEach((tab, tabId) => {
    //     if (now - tab.lastSeen > this.config.tabTimeout) {
    //       toRemove.push(tabId)
    //     }
    //   })

    //   toRemove.forEach(tabId => {
    //     this.activeTabs.delete(tabId)
    //     this.logger.info('Tab inativa removida', { tabId })
    //   })
    // }, this.config.pingInterval)
    
    console.log('🔴 AuthTabSynchronizer: Tab cleanup system DESABILITADO temporariamente')
  }

  /**
   * Registra esta tab como ativa
   */
  private registerTab(): void {
    this.activeTabs.set(this.tabId, {
      id: this.tabId,
      lastSeen: Date.now(),
      lastSequence: this.sequenceNumber,
      isActive: true,
      sessionId: this.sessionId
    })
  }

  /**
   * Remove registro desta tab
   */
  private unregisterTab(): void {
    this.activeTabs.delete(this.tabId)
  }

  /**
   * Gera ID único para tab
   */
  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Gera ID único para sessão
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Assina mensagem (implementação simplificada)
   */
  private async signMessage(message: AuthTabMessage): Promise<string> {
    // Implementação simplificada - em produção usaria crypto real
    const content = JSON.stringify(message.payload)
    return btoa(content).substr(0, 16)
  }

  /**
   * Verifica assinatura da mensagem (implementação simplificada)
   */
  private async verifyMessage(message: AuthTabMessage): Promise<boolean> {
    if (!message.signature) return false
    
    // Implementação simplificada
    const expectedSignature = await this.signMessage(message)
    return message.signature === expectedSignature
  }

  /**
   * Obtém estatísticas do sincronizador
   */
  public getStats() {
    return {
      tabId: this.tabId,
      sessionId: this.sessionId,
      isInitialized: this.isInitialized,
      activeTabs: Array.from(this.activeTabs.values()),
      totalTabs: this.activeTabs.size,
      sequenceNumber: this.sequenceNumber,
      callbackCount: this.changeCallbacks.size,
      config: this.config
    }
  }
} 