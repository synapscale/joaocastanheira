/**
 * Contexto de chat integrado com backend
 * Gerencia estado global do chat, sessões e mensagens
 */

"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { getChatService } from '@/lib/services/chat'
import { getWebSocketService } from '@/lib/services/websocket'
import { useAuth } from '@/context/auth-context'
import type {
  ChatState,
  ChatAction,
  ChatContextType,
  ChatSession,
  ChatMessage,
  ChatConfig
} from '@/lib/types/chat'

// Estado inicial
const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  isLoading: false,
  isTyping: false,
  error: null,
  config: {
    model: 'gpt-4',
    personality: 'assistant',
    tools: [],
    temperature: 0.7,
    maxTokens: 2048
  },
  isConnected: false,
  connectionStatus: 'disconnected'
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
  const chatService = getChatService()
  const wsService = getWebSocketService()

  // Configurar callbacks do WebSocket
  useEffect(() => {
    wsService.updateCallbacks({
      onMessage: (message: ChatMessage) => {
        if (state.currentSession) {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: { sessionId: state.currentSession.id, message }
          })
        }
      },
      onStatusChange: (status) => {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: status })
      },
      onSessionUpdate: (session: ChatSession) => {
        dispatch({ type: 'UPDATE_SESSION', payload: session })
      },
      onError: (error: Error) => {
        dispatch({ type: 'SET_ERROR', payload: error.message })
      },
      onTyping: (isTyping: boolean) => {
        dispatch({ type: 'SET_TYPING', payload: isTyping })
      }
    })
  }, [wsService, state.currentSession])

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

      const session = await chatService.createSession(title, state.config)
      dispatch({ type: 'ADD_SESSION', payload: session })

      // Conectar ao WebSocket se autenticado
      if (isAuthenticated) {
        await connect()
      }

      return session
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar sessão'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [chatService, state.config, isAuthenticated])

  const loadSessions = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const sessions = await chatService.getSessions()
      
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
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [chatService, state.currentSession])

  const switchSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const session = await chatService.getSession(sessionId)
      if (session) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: session })
        
        // Reconectar WebSocket para nova sessão
        if (isAuthenticated) {
          await chatService.connectToSession(sessionId)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao trocar sessão'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [chatService, isAuthenticated])

  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      await chatService.deleteSession(sessionId)
      dispatch({ type: 'DELETE_SESSION', payload: sessionId })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar sessão'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }, [chatService])

  const updateSessionTitle = useCallback(async (sessionId: string, title: string): Promise<void> => {
    try {
      await chatService.updateSessionTitle(sessionId, title)
      
      // Atualizar no estado local
      const session = state.sessions.find(s => s.id === sessionId)
      if (session) {
        const updatedSession = { ...session, title, updatedAt: new Date().toISOString() }
        dispatch({ type: 'UPDATE_SESSION', payload: updatedSession })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar título'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }, [chatService, state.sessions])

  // Ações de mensagem
  const sendMessage = useCallback(async (message: string, attachments?: File[]): Promise<void> => {
    if (!state.currentSession) {
      throw new Error('Nenhuma sessão ativa')
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      await chatService.sendMessage(
        state.currentSession.id,
        message,
        state.config,
        attachments
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [chatService, state.currentSession, state.config])

  const resendMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!state.currentSession) return

    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      await chatService.resendMessage(state.currentSession.id, messageId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao reenviar mensagem'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }, [chatService, state.currentSession])

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

  // WebSocket
  const connect = useCallback(async (): Promise<void> => {
    if (!state.currentSession || !isAuthenticated) return

    try {
      await chatService.connectToSession(state.currentSession.id)
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error)
    }
  }, [chatService, state.currentSession, isAuthenticated])

  const disconnect = useCallback((): void => {
    chatService.disconnectFromSession()
  }, [chatService])

  const sendTyping = useCallback((isTyping: boolean): void => {
    chatService.sendTyping(isTyping)
  }, [chatService])

  const contextValue: ChatContextType = {
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
    sendTyping
  }

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

