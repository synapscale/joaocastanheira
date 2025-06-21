"use client"

/**
 * Hook useConversations
 *
 * Este hook gerencia o estado e as operações relacionadas às conversas do chat.
 * Ele fornece funções para criar, atualizar, excluir e gerenciar conversas.
 * Agora integrado com o novo serviço de chat.
 */

import { useState, useCallback, useEffect, useMemo } from "react"
import type { Conversation, Message } from "@/types/chat"
import { useToast } from "@/hooks/use-toast"
import { chatService } from "@/lib/services/chat"
import { useApp } from '@/context/app-context'

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
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  createConversation: (data?: ConversationCreateData) => Promise<Conversation>
  setCurrentConversation: (id: string) => Promise<void>
  addMessageToConversation: (message: Message) => void
  sendMessage: (content: string, attachments?: File[]) => Promise<{ userMessage: Message, assistantMessage: Message }>
  getMessages: (conversationId: string) => Promise<Message[]>
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  loadConversations: () => Promise<void>
  refreshCurrentConversation: () => Promise<void>
}

/**
 * Hook para gerenciar conversas
 *
 * @returns Interface para gerenciar conversas
 */
export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // Obter configurações do usuário dos dropdowns
  const { 
    selectedModel, 
    selectedTool, 
    selectedPersonality,
    userPreferences 
  } = useApp()

  // Obter configurações de LLM do contexto
  const llmSettings = userPreferences?.llmSettings || {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
  }

  // Conversa atual calculada
  const currentConversation = useMemo(() => {
    return conversations.find(conv => conv.id === currentConversationId) || null
  }, [conversations, currentConversationId])

  // Carregar conversas da API
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await chatService.getConversations(1, 50)
      
      // Transformar dados da API para o formato local
      const apiConversations: Conversation[] = data.conversations.map((conv: any) => ({
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
          user_id: conv.user_id,
          status: conv.status,
          message_count: conv.message_count,
          total_tokens_used: conv.total_tokens_used,
          last_message_at: conv.last_message_at,
        },
      }))

      setConversations(apiConversations)
      
      // Se não há conversa atual e há conversas disponíveis, selecionar a primeira
      if (apiConversations.length > 0 && !currentConversationId) {
        await setCurrentConversation(apiConversations[0].id)
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
  }, [currentConversationId, toast])

  // Criar nova conversa
  const createConversation = useCallback(
    async (data?: ConversationCreateData): Promise<Conversation> => {
      try {
        setIsLoading(true)
        
        // Criar conversa na API
        const newConversation = await chatService.createConversation({
          title: data?.title || `Conversa ${new Date().toLocaleTimeString()}`,
          agent_id: data?.agent_id,
          workspace_id: data?.workspace_id,
          context: data?.context,
          settings: data?.settings,
        })

        // Transformar para formato local
        const localConversation: Conversation = {
          id: newConversation.id,
          title: newConversation.title || "Nova Conversa",
          messages: [],
          createdAt: new Date(newConversation.created_at || Date.now()).getTime(),
          updatedAt: new Date(newConversation.updated_at || Date.now()).getTime(),
          settings: newConversation.settings || {},
          metadata: {
            agent_id: newConversation.agent_id,
            workspace_id: newConversation.workspace_id,
            context: newConversation.context,
            user_id: newConversation.user_id,
            status: newConversation.status,
            message_count: newConversation.message_count,
            total_tokens_used: newConversation.total_tokens_used,
            last_message_at: newConversation.last_message_at,
          },
        }

        // Atualizar estado local
        setConversations(prev => [localConversation, ...prev])
        await setCurrentConversation(localConversation.id)

        toast({
          title: "Sucesso",
          description: "Nova conversa criada com sucesso.",
        })

        return localConversation
      } catch (error) {
        console.error("Erro ao criar conversa:", error)
        toast({
          title: "Erro",
          description: "Não foi possível criar a conversa.",
          variant: "destructive",
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [toast]
  )

  // Definir conversa atual e carregar suas mensagens
  const setCurrentConversation = useCallback(async (id: string) => {
    try {
      setCurrentConversationId(id)
      setIsLoading(true)
      
      console.log('📨 Carregando mensagens da conversa:', id)
      
      // Carregar mensagens da API
      let apiMessages: Message[] = []
      try {
        const messagesData = await chatService.getMessages(id, 1, 100)
        apiMessages = messagesData.messages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at || Date.now()).getTime(),
          status: 'sent',
          model: msg.model_used,
          metadata: {
            provider: msg.model_provider,
            tokens_used: msg.tokens_used,
            processing_time_ms: msg.processing_time_ms,
            temperature: msg.temperature,
            max_tokens: msg.max_tokens,
            error_message: msg.error_message,
            rating: msg.rating,
            feedback: msg.feedback,
          },
          attachments: msg.attachments,
        }))
      } catch (apiError) {
        console.warn('⚠️ Erro ao carregar mensagens da API, usando apenas offline:', apiError)
      }

      // Carregar mensagens offline
      const offlineMessages = chatService.getOfflineMessages(id)
      const localOfflineMessages: Message[] = offlineMessages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at || Date.now()).getTime(),
        status: 'sent',
        model: msg.model_used,
        metadata: {
          provider: msg.model_provider,
          tokens_used: msg.tokens_used,
          processing_time_ms: msg.processing_time_ms,
          temperature: msg.temperature,
          max_tokens: msg.max_tokens,
          error_message: msg.error_message,
          rating: msg.rating,
          feedback: msg.feedback,
        },
        attachments: msg.attachments,
      }))

      // Combinar mensagens API e offline, removendo duplicatas por ID
      const allMessages = [...apiMessages, ...localOfflineMessages]
      const uniqueMessages = allMessages.filter((msg, index, self) => 
        index === self.findIndex(m => m.id === msg.id)
      )

      // Ordenar por timestamp
      const sortedMessages = uniqueMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

      console.log('📨 Mensagens carregadas:', {
        api: apiMessages.length,
        offline: localOfflineMessages.length,
        total: sortedMessages.length
      })

      setMessages(sortedMessages)
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens da conversa.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Atualizar conversa local quando uma mensagem é adicionada externamente
  const addMessageToConversation = useCallback(
    (message: Message) => {
      if (!currentConversationId) return

      setMessages(prev => [...prev, message])
      
      // Atualizar metadados da conversa
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversationId
            ? {
                ...conv,
                updatedAt: Date.now(),
                metadata: {
                  ...conv.metadata,
                  message_count: (conv.metadata?.message_count || 0) + 1,
                  last_message_at: new Date().toISOString(),
                }
              }
            : conv
        )
      )
    },
    [currentConversationId]
  )

  // Enviar mensagem (método principal integrado)
  const sendMessage = useCallback(
    async (content: string, attachments?: File[]): Promise<{ userMessage: Message, assistantMessage: Message }> => {
      // Criar mensagem do usuário imediatamente (fora do try para estar no escopo do catch)
      const userMessage: Message = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: content,
        timestamp: Date.now(),
        status: 'sending',
      }

      try {
        setIsLoading(true)

        let activeConversationId = currentConversationId

        // Se não há conversa ativa, criar uma nova automaticamente
        if (!activeConversationId) {
          console.log('🔄 Nenhuma conversa ativa, criando nova conversa automaticamente...')
          
          const conversationTitle = content.length > 50 ? content.substring(0, 50) + '...' : content
          
          // Usar configurações do usuário dos dropdowns
          const userSettings = {
            model: selectedModel?.id || 'gpt-4o',
            tool: selectedTool || 'tools',
            personality: selectedPersonality || 'natural',
            provider: selectedModel?.provider || 'openai',
            temperature: llmSettings.temperature,
            maxTokens: llmSettings.maxTokens,
          }
          
          const newConversation = await createConversation({
            title: conversationTitle,
            settings: userSettings
          })

          activeConversationId = newConversation.id
          console.log('✅ Nova conversa criada com configurações do usuário:', activeConversationId, userSettings)
        }

        // Adicionar mensagem do usuário IMEDIATAMENTE na interface
        setMessages(prev => [...prev, userMessage])

        // Preparar configurações para a chamada da API
        const chatSettings = {
          model: selectedModel?.id || 'gpt-4o',
          provider: selectedModel?.provider || 'openai',
          tool: selectedTool || 'tools',
          personality: selectedPersonality || 'natural',
          temperature: llmSettings.temperature,
          maxTokens: llmSettings.maxTokens,
          topP: llmSettings.topP,
          frequencyPenalty: llmSettings.frequencyPenalty,
          presencePenalty: llmSettings.presencePenalty,
        }

        console.log('🔍 DEBUG - Configurações do contexto:', {
          selectedModel: selectedModel,
          selectedTool: selectedTool,
          selectedPersonality: selectedPersonality,
          llmSettings: llmSettings
        })

        console.log('🚀 DEBUG - Configurações enviadas para API:', chatSettings)

        // Enviar mensagem usando o novo serviço
        const result = await chatService.sendChatMessage({
          message: content,
          conversationId: activeConversationId,
          settings: chatSettings,
        })

        // Atualizar mensagem do usuário com dados da API
        const updatedUserMessage: Message = {
          ...userMessage,
          id: result.userMessage.id,
          timestamp: new Date(result.userMessage.created_at || Date.now()).getTime(),
          status: 'sent',
        }

        const assistantMessage: Message = {
          id: result.assistantMessage.id,
          role: 'assistant',
          content: result.assistantMessage.content,
          timestamp: new Date(result.assistantMessage.created_at || Date.now()).getTime(),
          status: 'sent',
          model: result.assistantMessage.model_used,
          metadata: {
            provider: result.assistantMessage.model_provider,
            tokens_used: result.assistantMessage.tokens_used,
            processing_time_ms: result.assistantMessage.processing_time_ms,
            temperature: result.assistantMessage.temperature,
            max_tokens: result.assistantMessage.max_tokens,
          },
        }

        // Atualizar estado local - substituir mensagem temporária e adicionar resposta
        setMessages(prev => {
          const withoutTemp = prev.filter(msg => msg.id !== userMessage.id)
          return [...withoutTemp, updatedUserMessage, assistantMessage]
        })
        
        // Atualizar metadados da conversa
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  updatedAt: Date.now(),
                  metadata: {
                    ...conv.metadata,
                    message_count: (conv.metadata?.message_count || 0) + 2,
                    total_tokens_used: (conv.metadata?.total_tokens_used || 0) + result.assistantMessage.tokens_used,
                    last_message_at: new Date().toISOString(),
                  }
                }
              : conv
          )
        )

        console.log('✅ Mensagem enviada com sucesso usando:', {
          model: result.assistantMessage.model_used,
          provider: result.assistantMessage.model_provider,
          temperature: result.assistantMessage.temperature,
          max_tokens: result.assistantMessage.max_tokens
        })

        return { userMessage: updatedUserMessage, assistantMessage }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error)
        
        // Atualizar status da mensagem do usuário para erro
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, status: 'error' as const }
              : msg
          )
        )
        
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem.",
          variant: "destructive",
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [currentConversationId, createConversation, selectedModel, selectedTool, selectedPersonality, llmSettings, toast]
  )

  // Obter mensagens de uma conversa específica
  const getMessages = useCallback(
    async (conversationId: string): Promise<Message[]> => {
      try {
        const messagesData = await chatService.getMessages(conversationId, 1, 100)
        
        return messagesData.messages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at || Date.now()).getTime(),
          status: 'sent',
          model: msg.model_used,
          metadata: {
            provider: msg.model_provider,
            tokens_used: msg.tokens_used,
            processing_time_ms: msg.processing_time_ms,
            temperature: msg.temperature,
            max_tokens: msg.max_tokens,
            error_message: msg.error_message,
            rating: msg.rating,
            feedback: msg.feedback,
          },
          attachments: msg.attachments,
        }))
      } catch (error) {
        console.error("Erro ao obter mensagens:", error)
        return []
      }
    },
    []
  )

  // Atualizar conversa
  const updateConversation = useCallback(
    async (id: string, updates: Partial<Conversation>) => {
      try {
        // Se há atualização de título, sincronizar com API
        if (updates.title) {
          await chatService.updateConversationTitle(id, updates.title)
        }

        // Atualizar estado local
        setConversations(prev =>
          prev.map(conv =>
            conv.id === id
              ? { ...conv, ...updates, updatedAt: Date.now() }
              : conv
          )
        )

        toast({
          title: "Sucesso",
          description: "Conversa atualizada com sucesso.",
        })
      } catch (error) {
        console.error("Erro ao atualizar conversa:", error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a conversa.",
          variant: "destructive",
        })
      }
    },
    [toast]
  )

  // Deletar conversa
  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        // Deletar na API
        await chatService.deleteConversation(id)
        
        // Atualizar estado local
        setConversations(prev => prev.filter(conv => conv.id !== id))
        
        // Se era a conversa atual, limpar seleção
        if (currentConversationId === id) {
          const remaining = conversations.filter(conv => conv.id !== id)
          if (remaining.length > 0) {
            await setCurrentConversation(remaining[0].id)
          } else {
            setCurrentConversationId(null)
            setMessages([])
          }
        }

        toast({
          title: "Sucesso",
          description: "Conversa deletada com sucesso.",
        })
      } catch (error) {
        console.error("Erro ao deletar conversa:", error)
        toast({
          title: "Erro",
          description: "Não foi possível deletar a conversa.",
          variant: "destructive",
        })
      }
    },
    [currentConversationId, conversations, toast]
  )

  // Recarregar conversa atual
  const refreshCurrentConversation = useCallback(async () => {
    if (currentConversationId) {
      await setCurrentConversation(currentConversationId)
    }
  }, [currentConversationId, setCurrentConversation])

  // Carregar conversas na inicialização
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations,
    currentConversationId,
    currentConversation,
    messages,
    isLoading,
    createConversation,
    setCurrentConversation,
    addMessageToConversation,
    sendMessage,
    getMessages,
    updateConversation,
    deleteConversation,
    loadConversations,
    refreshCurrentConversation,
  }
}
