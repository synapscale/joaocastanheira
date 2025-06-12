/**
 * Serviço de chat integrado com backend
 * Gerencia sessões, mensagens e comunicação em tempo real
 */

import { ApiService } from '@/lib/api'
import { getWebSocketService } from '@/lib/services/websocket'
import { config } from '@/lib/config'
import type {
  ChatMessage,
  ChatSession,
  ChatConfig,
  SendMessageRequest,
  SendMessageResponse,
  GetSessionsResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  ChatStats
} from '@/lib/types/chat'

export class ChatService {
  private apiService: ApiService
  private wsService = getWebSocketService()
  private cache = new Map<string, ChatSession>()
  private cacheExpiration = 5 * 60 * 1000 // 5 minutos

  constructor() {
    this.apiService = new ApiService()
  }

  // ==================== SESSÕES ====================

  /**
   * Cria uma nova sessão de chat
   */
  async createSession(title?: string, config?: Partial<ChatConfig>): Promise<ChatSession> {
    try {
      const request: CreateSessionRequest = {
        title: title || `Chat ${new Date().toLocaleString()}`,
        config
      }

      const response = await this.apiService.post<CreateSessionResponse>(
        config.endpoints.chat.http + '/sessions',
        request
      )

      const session = response.session
      this.cache.set(session.id, session)
      
      return session
    } catch (error) {
      console.error('Erro ao criar sessão:', error)
      
      // Fallback para modo offline
      const session: ChatSession = {
        id: `offline_${Date.now()}`,
        title: title || `Chat ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'offline_user',
        messages: [],
        metadata: config,
        isActive: true
      }

      this.cache.set(session.id, session)
      this.saveToLocalStorage('sessions', this.getAllCachedSessions())
      
      return session
    }
  }

  /**
   * Carrega todas as sessões do usuário
   */
  async getSessions(): Promise<ChatSession[]> {
    try {
      const response = await this.apiService.get<GetSessionsResponse>(
        config.endpoints.chat.http + '/sessions'
      )

      // Atualizar cache
      response.sessions.forEach(session => {
        this.cache.set(session.id, session)
      })

      return response.sessions
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
      
      // Fallback para localStorage
      const cachedSessions = this.loadFromLocalStorage('sessions', [])
      return cachedSessions
    }
  }

  /**
   * Carrega uma sessão específica
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      // Verificar cache primeiro
      const cached = this.cache.get(sessionId)
      if (cached && this.isCacheValid(sessionId)) {
        return cached
      }

      const response = await this.apiService.get<ChatSession>(
        `${config.endpoints.chat.http}/sessions/${sessionId}`
      )

      this.cache.set(sessionId, response)
      return response
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
      
      // Fallback para cache/localStorage
      return this.cache.get(sessionId) || null
    }
  }

  /**
   * Atualiza o título de uma sessão
   */
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    try {
      await this.apiService.patch(
        `${config.endpoints.chat.http}/sessions/${sessionId}`,
        { title }
      )

      // Atualizar cache
      const session = this.cache.get(sessionId)
      if (session) {
        session.title = title
        session.updatedAt = new Date().toISOString()
        this.cache.set(sessionId, session)
      }
    } catch (error) {
      console.error('Erro ao atualizar título da sessão:', error)
      
      // Atualizar apenas no cache/localStorage
      const session = this.cache.get(sessionId)
      if (session) {
        session.title = title
        session.updatedAt = new Date().toISOString()
        this.cache.set(sessionId, session)
        this.saveToLocalStorage('sessions', this.getAllCachedSessions())
      }
    }
  }

  /**
   * Deleta uma sessão
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.apiService.delete(
        `${config.endpoints.chat.http}/sessions/${sessionId}`
      )

      this.cache.delete(sessionId)
    } catch (error) {
      console.error('Erro ao deletar sessão:', error)
      
      // Remover apenas do cache/localStorage
      this.cache.delete(sessionId)
      this.saveToLocalStorage('sessions', this.getAllCachedSessions())
    }
  }

  // ==================== MENSAGENS ====================

  /**
   * Envia uma mensagem
   */
  async sendMessage(
    sessionId: string,
    message: string,
    config?: Partial<ChatConfig>,
    attachments?: File[]
  ): Promise<ChatMessage> {
    try {
      // Criar mensagem do usuário
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        status: 'sending',
        attachments: attachments ? await this.processAttachments(attachments) : undefined
      }

      // Adicionar ao cache imediatamente
      this.addMessageToCache(sessionId, userMessage)

      // Tentar enviar via WebSocket primeiro
      if (this.wsService.isConnected()) {
        this.wsService.sendMessage(message, {
          sessionId,
          config,
          attachments: userMessage.attachments
        })
        
        userMessage.status = 'sent'
        this.updateMessageInCache(sessionId, userMessage.id, { status: 'sent' })
        
        return userMessage
      }

      // Fallback para HTTP
      const request: SendMessageRequest = {
        message,
        sessionId,
        config,
        attachments
      }

      const response = await this.apiService.post<SendMessageResponse>(
        config.endpoints.chat.http + '/messages',
        request
      )

      // Atualizar status da mensagem do usuário
      userMessage.status = 'delivered'
      this.updateMessageInCache(sessionId, userMessage.id, { status: 'delivered' })

      // Adicionar resposta do assistente
      this.addMessageToCache(sessionId, response.message)

      // Atualizar sessão no cache
      this.cache.set(sessionId, response.session)

      return response.message
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Marcar mensagem como erro
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        status: 'error',
        metadata: { error: 'Falha ao enviar mensagem' }
      }

      this.addMessageToCache(sessionId, errorMessage)
      throw error
    }
  }

  /**
   * Reenvia uma mensagem
   */
  async resendMessage(sessionId: string, messageId: string): Promise<void> {
    const session = this.cache.get(sessionId)
    if (!session) return

    const message = session.messages.find(m => m.id === messageId)
    if (!message || message.role !== 'user') return

    // Remover mensagem de erro e possível resposta
    const messageIndex = session.messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      session.messages.splice(messageIndex, 2) // Remove mensagem e possível resposta
      this.cache.set(sessionId, session)
    }

    // Reenviar
    await this.sendMessage(sessionId, message.content, undefined, undefined)
  }

  // ==================== WEBSOCKET ====================

  /**
   * Conecta ao WebSocket para uma sessão
   */
  async connectToSession(sessionId: string): Promise<void> {
    const authToken = this.apiService.getAuthToken()
    if (!authToken) {
      throw new Error('Token de autenticação não encontrado')
    }

    await this.wsService.connect(sessionId, authToken)
  }

  /**
   * Desconecta do WebSocket
   */
  disconnectFromSession(): void {
    this.wsService.disconnect()
  }

  /**
   * Envia indicador de digitação
   */
  sendTyping(isTyping: boolean): void {
    this.wsService.sendTyping(isTyping)
  }

  // ==================== ESTATÍSTICAS ====================

  /**
   * Obtém estatísticas do chat
   */
  async getStats(): Promise<ChatStats> {
    try {
      return await this.apiService.get<ChatStats>(
        config.endpoints.chat.http + '/stats'
      )
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      
      // Calcular estatísticas do cache
      const sessions = this.getAllCachedSessions()
      return {
        totalSessions: sessions.length,
        totalMessages: sessions.reduce((acc, s) => acc + s.messages.length, 0),
        totalTokens: sessions.reduce((acc, s) => 
          acc + s.messages.reduce((msgAcc, m) => msgAcc + (m.metadata?.tokens || 0), 0), 0
        ),
        averageResponseTime: 0,
        mostUsedModel: 'gpt-4',
        mostUsedPersonality: 'assistant'
      }
    }
  }

  // ==================== UTILITÁRIOS PRIVADOS ====================

  private async processAttachments(files: File[]): Promise<any[]> {
    // Processar anexos (upload, etc.)
    // Por enquanto, retorna array vazio
    return []
  }

  private addMessageToCache(sessionId: string, message: ChatMessage): void {
    const session = this.cache.get(sessionId)
    if (session) {
      session.messages.push(message)
      session.updatedAt = new Date().toISOString()
      this.cache.set(sessionId, session)
      this.saveToLocalStorage('sessions', this.getAllCachedSessions())
    }
  }

  private updateMessageInCache(
    sessionId: string, 
    messageId: string, 
    updates: Partial<ChatMessage>
  ): void {
    const session = this.cache.get(sessionId)
    if (session) {
      const messageIndex = session.messages.findIndex(m => m.id === messageId)
      if (messageIndex !== -1) {
        session.messages[messageIndex] = { ...session.messages[messageIndex], ...updates }
        session.updatedAt = new Date().toISOString()
        this.cache.set(sessionId, session)
        this.saveToLocalStorage('sessions', this.getAllCachedSessions())
      }
    }
  }

  private getAllCachedSessions(): ChatSession[] {
    return Array.from(this.cache.values())
  }

  private isCacheValid(sessionId: string): boolean {
    // Por simplicidade, sempre considerar cache válido
    return true
  }

  private saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`chat_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
    }
  }

  private loadFromLocalStorage(key: string, defaultValue: any): any {
    try {
      const data = localStorage.getItem(`chat_${key}`)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error)
      return defaultValue
    }
  }
}

// Instância singleton do serviço de chat
let chatServiceInstance: ChatService | null = null

/**
 * Retorna a instância singleton do ChatService
 */
export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService()
  }
  return chatServiceInstance
}

export default ChatService

