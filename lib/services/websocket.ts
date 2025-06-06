/**
 * Serviço de WebSocket para comunicação em tempo real
 * Gerencia conexões WebSocket com o backend para chat
 */

import { config, getWsUrl } from '@/lib/config'
import type { ChatMessage, ChatSession, WebSocketMessage, WebSocketEvent } from '@/lib/types/chat'

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'

export interface WebSocketCallbacks {
  onMessage?: (message: ChatMessage) => void
  onStatusChange?: (status: WebSocketStatus) => void
  onSessionUpdate?: (session: ChatSession) => void
  onError?: (error: Error) => void
  onTyping?: (isTyping: boolean) => void
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private status: WebSocketStatus = 'disconnected'
  private callbacks: WebSocketCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = config.websocket.reconnectAttempts
  private reconnectDelay = config.websocket.reconnectDelay
  private heartbeatInterval: NodeJS.Timeout | null = null
  private sessionId: string | null = null
  private authToken: string | null = null

  constructor(callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks
  }

  /**
   * Conecta ao WebSocket do backend
   */
  async connect(sessionId: string, authToken: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.sessionId = sessionId
    this.authToken = authToken
    this.setStatus('connecting')

    try {
      const wsUrl = getWsUrl(`/ws/chat/${sessionId}?token=${authToken}`)
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)

    } catch (error) {
      this.handleError(error as Event)
    }
  }

  /**
   * Desconecta do WebSocket
   */
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.setStatus('disconnected')
    this.reconnectAttempts = 0
  }

  /**
   * Envia uma mensagem via WebSocket
   */
  sendMessage(message: string, metadata?: Record<string, any>): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket não está conectado')
    }

    const wsMessage: WebSocketMessage = {
      type: 'chat_message',
      data: {
        message,
        metadata,
        timestamp: new Date().toISOString(),
      }
    }

    this.ws!.send(JSON.stringify(wsMessage))
  }

  /**
   * Envia indicador de digitação
   */
  sendTyping(isTyping: boolean): void {
    if (!this.isConnected()) return

    const wsMessage: WebSocketMessage = {
      type: 'typing',
      data: { isTyping }
    }

    this.ws!.send(JSON.stringify(wsMessage))
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Retorna o status atual
   */
  getStatus(): WebSocketStatus {
    return this.status
  }

  /**
   * Atualiza callbacks
   */
  updateCallbacks(callbacks: Partial<WebSocketCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Handlers privados
  private handleOpen(): void {
    this.setStatus('connected')
    this.reconnectAttempts = 0
    this.startHeartbeat()
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const wsMessage: WebSocketEvent = JSON.parse(event.data)

      switch (wsMessage.type) {
        case 'chat_message':
          if (this.callbacks.onMessage) {
            this.callbacks.onMessage(wsMessage.data as ChatMessage)
          }
          break

        case 'session_update':
          if (this.callbacks.onSessionUpdate) {
            this.callbacks.onSessionUpdate(wsMessage.data as ChatSession)
          }
          break

        case 'typing':
          if (this.callbacks.onTyping) {
            this.callbacks.onTyping(wsMessage.data.isTyping)
          }
          break

        case 'error':
          if (this.callbacks.onError) {
            this.callbacks.onError(new Error(wsMessage.data.message))
          }
          break

        case 'pong':
          // Heartbeat response - connection is alive
          break

        default:
          console.warn('Tipo de mensagem WebSocket desconhecido:', wsMessage.type)
      }
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error)
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error)
      }
    }
  }

  private handleClose(event: CloseEvent): void {
    this.setStatus('disconnected')
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    // Tentar reconectar se não foi um fechamento intencional
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect()
    }
  }

  private handleError(event: Event): void {
    console.error('Erro no WebSocket:', event)
    this.setStatus('error')
    
    if (this.callbacks.onError) {
      this.callbacks.onError(new Error('Erro de conexão WebSocket'))
    }
  }

  private setStatus(status: WebSocketStatus): void {
    this.status = status
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(status)
    }
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    this.reconnectAttempts++
    this.setStatus('reconnecting')

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    setTimeout(() => {
      if (this.sessionId && this.authToken) {
        this.connect(this.sessionId, this.authToken)
      }
    }, delay)
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        const pingMessage: WebSocketMessage = {
          type: 'ping',
          data: { timestamp: new Date().toISOString() }
        }
        this.ws!.send(JSON.stringify(pingMessage))
      }
    }, config.websocket.heartbeatInterval)
  }
}

// Instância singleton do serviço WebSocket
let wsServiceInstance: WebSocketService | null = null

/**
 * Retorna a instância singleton do WebSocketService
 */
export function getWebSocketService(): WebSocketService {
  if (!wsServiceInstance) {
    wsServiceInstance = new WebSocketService()
  }
  return wsServiceInstance
}

/**
 * Hook para usar o WebSocket service
 */
export function useWebSocketService(callbacks: WebSocketCallbacks = {}) {
  const service = getWebSocketService()
  service.updateCallbacks(callbacks)
  return service
}

