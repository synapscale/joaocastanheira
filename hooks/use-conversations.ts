"use client"

/**
 * Hook useConversations
 *
 * Este hook gerencia o estado e as operações relacionadas às conversas do chat.
 * Ele fornece funções para criar, atualizar, excluir e gerenciar conversas.
 */

import { useState, useCallback, useEffect, useMemo } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Conversation, Message } from "@/types/chat"
import { useToast } from "@/hooks/use-toast"

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

interface ConversationCreateData {
  title?: string
  agent_id?: string
  workspace_id?: string
  context?: Record<string, any>
  settings?: Record<string, any>
}

interface UseConversationsReturn {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  createConversation: (data?: ConversationCreateData) => Conversation
  setCurrentConversation: (id: string) => void
  addMessageToConversation: (message: Message) => void
  getMessages: (conversationId: string) => Message[] | null
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  deleteConversation: (id: string) => void
  loadConversations: () => Promise<void>
  syncWithAPI: boolean
  setSyncWithAPI: (sync: boolean) => void
}

/**
 * Hook para gerenciar conversas
 *
 * @returns Interface para gerenciar conversas
 */
export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [syncWithAPI, setSyncWithAPI] = useState(true)
  const { toast } = useToast()

  // Função para fazer chamadas autenticadas à API
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token")
    const headers = {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(`/api/v1${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }, [])

  // Carregar conversas da API
  const loadConversations = useCallback(async () => {
    if (!syncWithAPI) return

    try {
      setIsLoading(true)
      const data = await apiCall("/conversations/")
      
      // Transformar dados da API para o formato local
      const apiConversations: Conversation[] = data.items?.map((conv: any) => ({
        id: conv.id,
        title: conv.title || "Nova Conversa",
        messages: [], // Mensagens são carregadas separadamente
        createdAt: new Date(conv.created_at || Date.now()).getTime(),
        updatedAt: new Date(conv.updated_at || Date.now()).getTime(),
        settings: conv.settings || {},
        metadata: {
          agent_id: conv.agent_id,
          workspace_id: conv.workspace_id,
          context: conv.context,
        },
      })) || []

      setConversations(apiConversations)
      
      // Se não há conversa atual, selecionar a primeira
      if (apiConversations.length > 0 && !currentConversationId) {
        setCurrentConversationId(apiConversations[0].id)
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [syncWithAPI, apiCall, currentConversationId, toast])

  // Criar nova conversa
  const createConversation = useCallback(
    (data?: ConversationCreateData): Conversation => {
      const newConversation: Conversation = {
        id: uuidv4(),
        title: data?.title || `Conversa ${new Date().toLocaleTimeString()}`,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        settings: data?.settings || {},
        metadata: {
          agent_id: data?.agent_id,
          workspace_id: data?.workspace_id,
          context: data?.context,
        },
      }

      setConversations(prev => [newConversation, ...prev])
      setCurrentConversationId(newConversation.id)

      // Sincronizar com API se habilitado
      if (syncWithAPI) {
        apiCall("/conversations/", {
          method: "POST",
          body: JSON.stringify({
            title: newConversation.title,
            agent_id: data?.agent_id,
            workspace_id: data?.workspace_id,
            context: data?.context,
            settings: data?.settings,
          }),
        })
          .then(response => {
            // Atualizar ID local com ID da API
            setConversations(prev =>
              prev.map(conv =>
                conv.id === newConversation.id
                  ? { ...conv, id: response.id }
                  : conv
              )
            )
            setCurrentConversationId(response.id)
          })
          .catch(error => {
            console.error("Erro ao criar conversa na API:", error)
            toast({
              title: "Aviso",
              description: "Conversa criada localmente. Sincronização com servidor falhou.",
              variant: "default",
            })
          })
      }

      return newConversation
    },
    [syncWithAPI, apiCall, toast]
  )

  // Definir conversa atual
  const setCurrentConversation = useCallback((id: string) => {
    setCurrentConversationId(id)
  }, [])

  // Adicionar mensagem à conversa
  const addMessageToConversation = useCallback(
    (message: Message) => {
      if (!currentConversationId) return

      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...(conv.messages || []), message],
                updatedAt: Date.now(),
              }
            : conv
        )
      )
    },
    [currentConversationId]
  )

  // Obter mensagens de uma conversa
  const getMessages = useCallback(
    (conversationId: string): Message[] | null => {
      const conversation = conversations.find(conv => conv.id === conversationId)
      return conversation?.messages || null
    },
    [conversations]
  )

  // Atualizar conversa
  const updateConversation = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === id
            ? { ...conv, ...updates, updatedAt: Date.now() }
            : conv
        )
      )

      // Sincronizar com API se necessário
      if (syncWithAPI && updates.title) {
        apiCall(`/conversations/${id}/title`, {
          method: "PUT",
          body: JSON.stringify({ title: updates.title }),
        }).catch(error => {
          console.error("Erro ao atualizar título na API:", error)
        })
      }
    },
    [syncWithAPI, apiCall]
  )

  // Deletar conversa
  const deleteConversation = useCallback(
    (id: string) => {
      setConversations(prev => prev.filter(conv => conv.id !== id))
      
      if (currentConversationId === id) {
        const remaining = conversations.filter(conv => conv.id !== id)
        setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null)
      }

      // Sincronizar com API
      if (syncWithAPI) {
        apiCall(`/conversations/${id}`, {
          method: "DELETE",
        }).catch(error => {
          console.error("Erro ao deletar conversa na API:", error)
          toast({
            title: "Aviso",
            description: "Conversa removida localmente. Erro ao sincronizar com servidor.",
            variant: "default",
          })
        })
      }
    },
    [currentConversationId, conversations, syncWithAPI, apiCall, toast]
  )

  // Carregar conversas na inicialização
  useEffect(() => {
    if (syncWithAPI) {
      loadConversations()
    }
  }, [syncWithAPI, loadConversations])

  // Persistir estado local quando não há sincronização com API
  useEffect(() => {
    if (!syncWithAPI) {
      try {
        const saved = localStorage.getItem("synapscale_conversations")
        if (saved) {
          const data = JSON.parse(saved)
          setConversations(data.conversations || [])
          setCurrentConversationId(data.currentConversationId || null)
        }
      } catch (error) {
        console.error("Erro ao carregar conversas do localStorage:", error)
      }
    }
  }, [syncWithAPI])

  // Salvar estado local quando não há sincronização com API
  useEffect(() => {
    if (!syncWithAPI) {
      try {
        localStorage.setItem(
          "synapscale_conversations",
          JSON.stringify({
            conversations,
            currentConversationId,
          })
        )
      } catch (error) {
        console.error("Erro ao salvar conversas no localStorage:", error)
      }
    }
  }, [conversations, currentConversationId, syncWithAPI])

  return {
    conversations,
    currentConversationId,
    isLoading,
    createConversation,
    setCurrentConversation,
    addMessageToConversation,
    getMessages,
    updateConversation,
    deleteConversation,
    loadConversations,
    syncWithAPI,
    setSyncWithAPI,
  }
}
