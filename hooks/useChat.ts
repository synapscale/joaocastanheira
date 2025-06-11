/**
 * Hook personalizado para chat
 * Fornece interface simplificada para usar o sistema de chat
 */

import { useEffect, useCallback } from 'react'
import { useChatContext } from '@/context/chat-context'
import type { UseChatOptions, UseChatReturn, ChatConfig } from '@/lib/types/chat'

/**
 * Hook principal para usar o sistema de chat
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    state,
    createSession,
    loadSessions,
    switchSession,
    deleteSession,
    sendMessage,
    updateConfig,
    connect,
    disconnect,
    sendTyping
  } = useChatContext()

  const { autoConnect = true, sessionId } = options

  // Auto-conectar quando especificado
  useEffect(() => {
    if (autoConnect && sessionId) {
      switchSession(sessionId)
    }
  }, [autoConnect, sessionId, switchSession])

  // Auto-conectar WebSocket quando sessão atual muda
  useEffect(() => {
    if (autoConnect && state.currentSession && state.connectionStatus === 'disconnected') {
      connect()
    }
  }, [autoConnect, state.currentSession, state.connectionStatus, connect])

  return {
    // Estado
    currentSession: state.currentSession,
    sessions: state.sessions,
    isLoading: state.isLoading,
    isTyping: state.isTyping,
    error: state.error,
    isConnected: state.isConnected,
    connectionStatus: state.connectionStatus,
    
    // Ações
    sendMessage,
    createSession,
    switchSession,
    deleteSession,
    updateConfig,
    connect,
    disconnect,
    sendTyping
  }
}

/**
 * Hook para gerenciar sessões de chat
 */
export function useChatSessions() {
  const { state, createSession, loadSessions, switchSession, deleteSession, updateSessionTitle } = useChatContext()

  return {
    sessions: state.sessions,
    currentSession: state.currentSession,
    isLoading: state.isLoading,
    error: state.error,
    createSession,
    loadSessions,
    switchSession,
    deleteSession,
    updateSessionTitle
  }
}

/**
 * Hook para gerenciar mensagens de chat
 */
export function useChatMessages() {
  const { state, sendMessage, resendMessage, deleteMessage } = useChatContext()

  const messages = state.currentSession?.messages || []

  return {
    messages,
    isLoading: state.isLoading,
    isTyping: state.isTyping,
    error: state.error,
    sendMessage,
    resendMessage,
    deleteMessage
  }
}

/**
 * Hook para gerenciar configurações de chat
 */
export function useChatConfig() {
  const { state, updateConfig } = useChatContext()

  const setModel = useCallback((model: string) => {
    updateConfig({ model })
  }, [updateConfig])

  const setPersonality = useCallback((personality: string) => {
    updateConfig({ personality })
  }, [updateConfig])

  const setTools = useCallback((tools: string[]) => {
    updateConfig({ tools })
  }, [updateConfig])

  const setTemperature = useCallback((temperature: number) => {
    updateConfig({ temperature })
  }, [updateConfig])

  const setMaxTokens = useCallback((maxTokens: number) => {
    updateConfig({ maxTokens })
  }, [updateConfig])

  const setSystemPrompt = useCallback((systemPrompt: string) => {
    updateConfig({ systemPrompt })
  }, [updateConfig])

  const resetConfig = useCallback(() => {
    updateConfig({
      model: 'gpt-4',
      personality: 'assistant',
      tools: [],
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: undefined
    })
  }, [updateConfig])

  return {
    config: state.config,
    updateConfig,
    setModel,
    setPersonality,
    setTools,
    setTemperature,
    setMaxTokens,
    setSystemPrompt,
    resetConfig
  }
}

/**
 * Hook para gerenciar conexão WebSocket
 */
export function useChatConnection() {
  const { state, connect, disconnect, sendTyping } = useChatContext()

  return {
    isConnected: state.isConnected,
    connectionStatus: state.connectionStatus,
    connect,
    disconnect,
    sendTyping
  }
}

/**
 * Hook para indicador de digitação
 */
export function useChatTyping() {
  const { sendTyping } = useChatConnection()
  
  const startTyping = useCallback(() => {
    sendTyping(true)
  }, [sendTyping])

  const stopTyping = useCallback(() => {
    sendTyping(false)
  }, [sendTyping])

  return {
    startTyping,
    stopTyping
  }
}

/**
 * Hook para auto-salvar rascunhos
 */
export function useChatDraft(sessionId?: string) {
  const saveDraft = useCallback((content: string) => {
    if (sessionId) {
      localStorage.setItem(`chat_draft_${sessionId}`, content)
    }
  }, [sessionId])

  const loadDraft = useCallback((): string => {
    if (sessionId) {
      return localStorage.getItem(`chat_draft_${sessionId}`) || ''
    }
    return ''
  }, [sessionId])

  const clearDraft = useCallback(() => {
    if (sessionId) {
      localStorage.removeItem(`chat_draft_${sessionId}`)
    }
  }, [sessionId])

  return {
    saveDraft,
    loadDraft,
    clearDraft
  }
}

/**
 * Hook para estatísticas de chat
 */
export function useChatStats() {
  const { state } = useChatContext()

  const stats = {
    totalSessions: state.sessions.length,
    totalMessages: state.sessions.reduce((acc, session) => acc + session.messages.length, 0),
    currentSessionMessages: state.currentSession?.messages.length || 0,
    averageMessagesPerSession: state.sessions.length > 0 
      ? Math.round(state.sessions.reduce((acc, session) => acc + session.messages.length, 0) / state.sessions.length)
      : 0
  }

  return stats
}

export default useChat

