/**
 * Contexto de chat integrado com backend
 * Gerencia estado global do chat, conversas e mensagens
 */

"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { chatUnifiedService, type ConversationResponse, type MessageResponse, type ConversationCreate, type MessageCreate, type LLMModel, type LLMProvider } from '@/lib/services/chat-unified'
import { useAuth } from '@/context/auth-context'

// Types for backward compatibility
export interface ChatSession {
  id: string
  title?: string
  createdAt: string
  updatedAt: string
  userId: string
  messages: ChatMessage[]
  metadata?: any
  isActive: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  status?: 'sending' | 'sent' | 'error'
  attachments?: any[]
  metadata?: any
}

export interface ChatConfig {
  model?: string
  provider?: string
  personality?: string
  tools?: string[]
  temperature?: number
  maxTokens?: number
  agent_id?: string
}

export interface ChatState {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isLoading: boolean
  isTyping: boolean
  error: string | null
  config: ChatConfig
  isConnected: boolean
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  availableModels: LLMModel[]
  availableProviders: LLMProvider[]
}

export type ChatAction =
  | { type: 'SET_CURRENT_SESSION'; payload: ChatSession | null }
  | { type: 'ADD_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_SESSION'; payload: ChatSession }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: ChatMessage } }
  | { type: 'UPDATE_MESSAGE'; payload: { sessionId: string; messageId: string; updates: Partial<ChatMessage> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONFIG'; payload: Partial<ChatConfig> }
  | { type: 'SET_CONNECTION_STATUS'; payload: ChatState['connectionStatus'] }
  | { type: 'SET_AVAILABLE_MODELS'; payload: LLMModel[] }
  | { type: 'SET_AVAILABLE_PROVIDERS'; payload: LLMProvider[] }
  | { type: 'CLEAR_SESSIONS' }

export interface ChatContextType {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  createSession: (title?: string) => Promise<ChatSession>
  loadSessions: () => Promise<void>
  switchSession: (sessionId: string) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>
  sendMessage: (message: string, attachments?: File[]) => Promise<void>
  resendMessage: (messageId: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  updateConfig: (config: Partial<ChatConfig>) => void
  connect: () => Promise<void>
  disconnect: () => void
  sendTyping: (isTyping: boolean) => void
  loadModels: () => Promise<void>
  loadProviders: () => Promise<void>
}

// Convert API types to UI types for backward compatibility
function conversationToSession(conversation: ConversationResponse, messages: MessageResponse[] = []): ChatSession {
  return {
    id: conversation.id,
    title: conversation.title || 'Nova Conversa',
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    userId: conversation.user_id,
    messages: messages.map(messageToChat),
    metadata: {
      agent_id: conversation.agent_id,
      workspace_id: conversation.workspace_id,
      context: conversation.context,
      settings: conversation.settings
    },
    isActive: conversation.status === 'active'
  }
}

function messageToChat(message: MessageResponse): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.created_at,
    status: 'sent',
    attachments: [],
    metadata: message.metadata
  }
}

// Estado inicial
const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  isLoading: false,
  isTyping: false,
  error: null,
  config: {
    model: 'gpt-4',
    provider: 'openai',
    personality: 'assistant',
    tools: [],
    temperature: 0.7,
    maxTokens: 2048
  },
  isConnected: true,
  connectionStatus: 'connected',
  availableModels: [],
  availableProviders: []
}

// Reducer para gerenciar estado do chat
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSession: action.payload,
        error: null
      }

    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        currentSession: action.payload
      }

    case 'UPDATE_SESSION':
      const updatedSessions = state.sessions.map(session =>
        session.id === action.payload.id ? action.payload : session
      )
      return {
        ...state,
        sessions: updatedSessions,
        currentSession: state.currentSession?.id === action.payload.id 
          ? action.payload 
          : state.currentSession
      }

    case 'DELETE_SESSION':
      const filteredSessions = state.sessions.filter(s => s.id !== action.payload)
      return {
        ...state,
        sessions: filteredSessions,
        currentSession: state.currentSession?.id === action.payload 
          ? (filteredSessions[0] || null) 
          : state.currentSession
      }

    case 'ADD_MESSAGE':
      const { sessionId, message } = action.payload
      const sessionsWithNewMessage = state.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [...session.messages, message],
            updatedAt: new Date().toISOString()
          }
        }
        return session
      })

      return {
        ...state,
        sessions: sessionsWithNewMessage,
        currentSession: state.currentSession?.id === sessionId
          ? {
              ...state.currentSession,
              messages: [...state.currentSession.messages, message],
              updatedAt: new Date().toISOString()
            }
          : state.currentSession
      }

    case 'UPDATE_MESSAGE':
      const { messageId, updates } = action.payload
      const sessionsWithUpdatedMessage = state.sessions.map(session => {
        if (session.id === action.payload.sessionId) {
          return {
            ...session,
            messages: session.messages.map(msg =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            updatedAt: new Date().toISOString()
          }
        }
        return session
      })

      return {
        ...state,
        sessions: sessionsWithUpdatedMessage,
        currentSession: state.currentSession?.id === action.payload.sessionId
          ? {
              ...state.currentSession,
              messages: state.currentSession.messages.map(msg =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
              updatedAt: new Date().toISOString()
            }
          : state.currentSession
      }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'SET_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      }

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
        isConnected: action.payload === 'connected'
      }

    case 'SET_AVAILABLE_MODELS':
      return {
        ...state,
        availableModels: action.payload
      }

    case 'SET_AVAILABLE_PROVIDERS':
      return {
        ...state,
        availableProviders: action.payload
      }

    case 'CLEAR_SESSIONS':
      return {
        ...state,
        sessions: [],
        currentSession: null
      }

    default:
      return state
  }
}

// Contexto
const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Provider
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { user, isAuthenticated } = useAuth()

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      // Since the new chat service doesn't have isOnline method, assume connected
      dispatch({ 
        type: 'SET_CONNECTION_STATUS', 
        payload: 'connected' 
      })
    }

    checkConnection()
    window.addEventListener('online', checkConnection)
    window.addEventListener('offline', checkConnection)

    return () => {
      window.removeEventListener('online', checkConnection)
      window.removeEventListener('offline', checkConnection)
    }
  }, [])

  // Carregar sessões quando usuário faz login
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSessions()
    } else {
      dispatch({ type: 'CLEAR_SESSIONS' })
    }
  }, [isAuthenticated, user])

  // Ações de sessão
  const createSession = useCallback(async (title?: string): Promise<ChatSession> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const conversationData: ConversationCreate = {
        title: title,
        agent_id: state.config.agent_id,
        context: { model: state.config.model, temperature: state.config.temperature },
        settings: state.config
      }

      const conversation = await chatUnifiedService.createConversation(conversationData)
      const session = conversationToSession(conversation)
      
      dispatch({ type: 'ADD_SESSION', payload: session })
      return session
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar sessão'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      // Fallback offline mode
      const offlineSession: ChatSession = {
        id: `offline_${Date.now()}`,
        title: title || `Chat ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id || 'offline_user',
        messages: [],
        metadata: state.config,
        isActive: true
      }
      
      dispatch({ type: 'ADD_SESSION', payload: offlineSession })
      return offlineSession
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.config, user])

  const loadSessions = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const conversations = await chatUnifiedService.getConversations()
      const sessions = conversations.map(conv => conversationToSession(conv))
      
      // Limpar sessões antigas e adicionar novas
      dispatch({ type: 'CLEAR_SESSIONS' })
      sessions.forEach(session => {
        dispatch({ type: 'ADD_SESSION', payload: session })
      })

      // Selecionar primeira sessão se não houver sessão atual
      if (sessions.length > 0 && !state.currentSession) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: sessions[0] })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar sessões'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      // Log error but don't add fallback conversations since we don't have offline support
      console.warn('Failed to load conversations from API:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const switchSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const conversation = await chatUnifiedService.getConversation(sessionId)
      const messages = await chatUnifiedService.getMessages(sessionId)
      const session = conversationToSession(conversation, messages)
      
      dispatch({ type: 'SET_CURRENT_SESSION', payload: session })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao trocar sessão'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      // Fallback to cached session
      const cachedSession = state.sessions.find(s => s.id === sessionId)
      if (cachedSession) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: cachedSession })
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.sessions])

  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      await chatUnifiedService.deleteConversation(sessionId)
      dispatch({ type: 'DELETE_SESSION', payload: sessionId })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar sessão'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      // Still remove from local state
      dispatch({ type: 'DELETE_SESSION', payload: sessionId })
    }
  }, [])

  const updateSessionTitle = useCallback(async (sessionId: string, title: string): Promise<void> => {
    try {
      // Note: updateConversationTitle doesn't exist in the API service
      // For now, just update locally until the API method is implemented
      const session = state.sessions.find(s => s.id === sessionId)
      if (session) {
        const updatedSession = { ...session, title, updatedAt: new Date().toISOString() }
        dispatch({ type: 'UPDATE_SESSION', payload: updatedSession })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar título'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }, [state.sessions])

  // Ações de mensagem
  const sendMessage = useCallback(async (message: string, attachments?: File[]): Promise<void> => {
    if (!state.currentSession) {
      throw new Error('Nenhuma sessão ativa')
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        status: 'sending',
        attachments: attachments ? [] : undefined
      }

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { sessionId: state.currentSession.id, message: userMessage }
      })

      const result = await chatUnifiedService.sendMessageWithAI(
        state.currentSession.id, 
        message,
        {
          model: state.config.model,
          provider: state.config.provider,
          temperature: state.config.temperature,
          max_tokens: state.config.maxTokens
        }
      )
      
      // Update user message status
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          sessionId: state.currentSession.id,
          messageId: userMessage.id,
          updates: { status: 'sent' }
        }
      })

      // Add assistant message
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { 
          sessionId: state.currentSession.id, 
          message: messageToChat(result.assistantMessage) 
        }
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      // Mark user message as error
      const userMessages = state.currentSession.messages.filter(m => m.role === 'user')
      const lastUserMessage = userMessages[userMessages.length - 1]
      if (lastUserMessage) {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            sessionId: state.currentSession.id,
            messageId: lastUserMessage.id,
            updates: { status: 'error' }
          }
        })
      }
      
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.currentSession])

  const resendMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!state.currentSession) return

    const message = state.currentSession.messages.find(m => m.id === messageId)
    if (!message || message.role !== 'user') return

    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      await sendMessage(message.content)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao reenviar mensagem'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }, [state.currentSession, sendMessage])

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!state.currentSession) return

    // Remover mensagem do estado local
    dispatch({
      type: 'UPDATE_MESSAGE',
      payload: {
        sessionId: state.currentSession.id,
        messageId,
        updates: { content: '[Mensagem deletada]' }
      }
    })
  }, [state.currentSession])

  // Configurações
  const updateConfig = useCallback((config: Partial<ChatConfig>): void => {
    dispatch({ type: 'SET_CONFIG', payload: config })
  }, [])

  // WebSocket (placeholder for future implementation)
  const connect = useCallback(async (): Promise<void> => {
    if (!state.currentSession || !isAuthenticated) return
    // WebSocket connection would be implemented here
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' })
  }, [state.currentSession, isAuthenticated])

  const disconnect = useCallback((): void => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' })
  }, [])

  const sendTyping = useCallback((isTyping: boolean): void => {
    dispatch({ type: 'SET_TYPING', payload: isTyping })
  }, [])

  // Carregar modelos e provedores disponíveis
  const loadModels = useCallback(async (): Promise<void> => {
    try {
      const models = await chatUnifiedService.getModels()
      dispatch({ type: 'SET_AVAILABLE_MODELS', payload: models })
    } catch (error) {
      console.error('Erro ao carregar modelos:', error)
    }
  }, [])

  const loadProviders = useCallback(async (): Promise<void> => {
    try {
      const providers = await chatUnifiedService.getProviders()
      dispatch({ type: 'SET_AVAILABLE_PROVIDERS', payload: providers })
    } catch (error) {
      console.error('Erro ao carregar provedores:', error)
    }
  }, [])

  // Carregar modelos e provedores quando autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      loadModels()
      loadProviders()
    }
  }, [isAuthenticated, user, loadModels, loadProviders])

  const contextValue: ChatContextType = useMemo(() => ({
    state,
    dispatch,
    createSession,
    loadSessions,
    switchSession,
    deleteSession,
    updateSessionTitle,
    sendMessage,
    resendMessage,
    deleteMessage,
    updateConfig,
    connect,
    disconnect,
    sendTyping,
    loadModels,
    loadProviders
  }), [state, createSession, loadSessions, switchSession, deleteSession, updateSessionTitle, sendMessage, resendMessage, deleteMessage, updateConfig, connect, disconnect, sendTyping, loadModels, loadProviders])

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook para usar o contexto
export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext deve ser usado dentro de um ChatProvider')
  }
  return context
}

export default ChatContext

