"use client"

/**
 * Hook useConversations
 *
 * Este hook gerencia o estado e as operações relacionadas às conversas do chat.
 * Ele fornece funções para criar, atualizar, excluir e gerenciar conversas.
 */

import { useState, useEffect } from "react"
import type { Conversation, Message } from "@/types/chat"

/**
 * Gera um título a partir da primeira mensagem do usuário
 *
 * @param messages - Lista de mensagens
 * @returns Título gerado
 */
function generateTitleFromMessages(messages: Message[]): string {
  const firstUserMessage = messages.find((msg) => msg.role === "user")
  if (firstUserMessage) {
    // Limita o título a 30 caracteres
    const title = firstUserMessage.content.substring(0, 30)
    return title.length < firstUserMessage.content.length ? `${title}...` : title
  }
  return "Nova conversa"
}

/**
 * Interface de retorno do hook useConversations
 */
interface UseConversationsReturn {
  /** Lista de todas as conversas */
  conversations: Conversation[]

  /** ID da conversa atual */
  currentConversationId: string | null

  /** Conversa atual */
  currentConversation: Conversation | null

  /** Indica se as conversas foram carregadas */
  isLoaded: boolean

  /** Define o ID da conversa atual */
  setCurrentConversationId: (id: string) => void

  /** Cria uma nova conversa */
  createConversation: (initialMessages?: Message[], metadata?: any) => string

  /** Atualiza uma conversa existente */
  updateConversation: (
    conversationId: string,
    updates: Partial<Conversation> | ((conv: Conversation) => Partial<Conversation>),
  ) => void

  /** Adiciona uma mensagem à conversa atual */
  addMessageToConversation: (message: Message, conversationId?: string) => void

  /** Exclui uma conversa */
  deleteConversation: (conversationId: string) => void

  /** Limpa todas as conversas */
  clearAllConversations: () => void
}

/**
 * Hook para gerenciar conversas
 *
 * @returns Interface para gerenciar conversas
 */
export function useConversations(): UseConversationsReturn {
  // SECTION: Estado
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // SECTION: Efeitos

  /**
   * Carrega as conversas do localStorage na inicialização
   */
  useEffect(() => {
    const loadConversations = () => {
      try {
        const savedConversations = localStorage.getItem("ai-canvas-conversations")
        if (savedConversations) {
          const parsed = JSON.parse(savedConversations) as Conversation[]
          setConversations(parsed)

          // Se houver conversas salvas e nenhuma conversa atual, use a mais recente
          if (parsed.length > 0 && !currentConversationId) {
            // Ordena por updatedAt e pega a mais recente
            const mostRecent = [...parsed].sort((a, b) => b.updatedAt - a.updatedAt)[0]
            setCurrentConversationId(mostRecent.id)
          }
        }
        setIsLoaded(true)
      } catch (error) {
        console.error("Erro ao carregar conversas:", error)
        setIsLoaded(true)
      }
    }

    loadConversations()
  }, [currentConversationId])

  /**
   * Salva as conversas no localStorage sempre que mudam
   */
  useEffect(() => {
    if (isLoaded && conversations.length > 0) {
      localStorage.setItem("ai-canvas-conversations", JSON.stringify(conversations))
    }
  }, [conversations, isLoaded])

  // SECTION: Dados derivados

  /**
   * Obtém a conversa atual
   */
  const currentConversation = currentConversationId
    ? conversations.find((conv) => conv.id === currentConversationId)
    : null

  // SECTION: Funções

  /**
   * Cria uma nova conversa
   *
   * @param initialMessages - Mensagens iniciais
   * @param metadata - Metadados da conversa
   * @returns ID da nova conversa
   */
  const createConversation = (initialMessages: Message[] = [], metadata = {}): string => {
    const now = Date.now()
    const newConversation: Conversation = {
      id: `conv_${now}`,
      title: initialMessages.length > 0 ? generateTitleFromMessages(initialMessages) : "Nova conversa",
      messages:
        initialMessages.length > 0
          ? initialMessages
          : [
              {
                id: `msg_${now}`,
                role: "assistant",
                content: "Olá! Como posso ajudar você hoje?",
                timestamp: now,
              },
            ],
      createdAt: now,
      updatedAt: now,
      metadata: metadata,
    }

    setConversations((prev) => [...prev, newConversation])
    setCurrentConversationId(newConversation.id)
    return newConversation.id
  }

  /**
   * Atualiza uma conversa existente
   *
   * @param conversationId - ID da conversa a ser atualizada
   * @param updates - Atualizações a serem aplicadas
   */
  const updateConversation = (
    conversationId: string,
    updates: Partial<Conversation> | ((conv: Conversation) => Partial<Conversation>),
  ) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const updatedFields = typeof updates === "function" ? updates(conv) : updates

          return {
            ...conv,
            ...updatedFields,
            updatedAt: Date.now(),
            // Mescla metadados existentes com novos metadados, se fornecidos
            metadata: updatedFields.metadata ? { ...conv.metadata, ...updatedFields.metadata } : conv.metadata,
          }
        }
        return conv
      }),
    )
  }

  /**
   * Adiciona uma mensagem à conversa atual
   *
   * @param message - Mensagem a ser adicionada
   * @param conversationId - ID da conversa (opcional, usa a atual se não fornecido)
   */
  const addMessageToConversation = (message: Message, conversationId?: string) => {
    const targetId = conversationId || currentConversationId

    if (!targetId) {
      // Se não houver conversa atual, crie uma nova com esta mensagem
      const initialMessages = [message]
      createConversation(initialMessages)
      return
    }

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === targetId) {
          // Atualiza o título se for a primeira mensagem do usuário
          let title = conv.title
          if (message.role === "user" && !conv.messages.some((m) => m.role === "user")) {
            title = generateTitleFromMessages([message])
          }

          return {
            ...conv,
            title,
            messages: [...conv.messages, message],
            updatedAt: Date.now(),
          }
        }
        return conv
      }),
    )
  }

  /**
   * Exclui uma conversa
   *
   * @param conversationId - ID da conversa a ser excluída
   */
  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

    // Se a conversa atual foi excluída, selecione outra ou crie uma nova
    if (currentConversationId === conversationId) {
      const remaining = conversations.filter((conv) => conv.id !== conversationId)
      if (remaining.length > 0) {
        // Seleciona a conversa mais recente
        const mostRecent = [...remaining].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        setCurrentConversationId(mostRecent.id)
      } else {
        // Cria uma nova conversa se não houver mais nenhuma
        createConversation()
      }
    }
  }

  /**
   * Limpa todas as conversas
   */
  const clearAllConversations = () => {
    setConversations([])
    setCurrentConversationId(null)
    createConversation() // Cria uma nova conversa vazia
  }

  return {
    conversations,
    currentConversationId,
    currentConversation,
    isLoaded,
    setCurrentConversationId,
    createConversation,
    updateConversation,
    addMessageToConversation,
    deleteConversation,
    clearAllConversations,
  }
}
