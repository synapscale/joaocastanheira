/**
 * Serviço de chat integrado com backend
 * Gerencia sessões, mensagens e comunicação em tempo real
 */

import { config } from '../config'
import { apiService, Message as ApiMessage, Conversation as ApiConversation } from '../api/service'
import { mapToApiModelName, getProviderFromModel } from '../utils/model-mapper'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  conversation_id: string
  attachments?: any[]
  model_used?: string
  model_provider?: string
  tokens_used: number
  processing_time_ms: number
  temperature?: number
  max_tokens?: number
  status: string
  error_message?: string
  rating?: number
  feedback?: string
  created_at?: string
  updated_at?: string
  settings?: ChatSettings
}

export interface Conversation {
  id: string
  title?: string
  agent_id?: string
  workspace_id?: string
  user_id: string
  status: string
  message_count: number
  total_tokens_used: number
  context?: any
  settings?: ChatSettings
  apiKeys?: Record<string, string>
  last_message_at?: string
  created_at?: string
  updated_at?: string
}

export interface ConversationCreate {
  title?: string
  agent_id?: string
  workspace_id?: string
  context?: any
  settings?: ChatSettings
  apiKeys?: Record<string, string>
}

export interface MessageCreate {
  content: string
  attachments?: any[]
  settings?: ChatSettings
  apiKeys?: Record<string, string>
}

export interface ChatConfig {
  temperature?: number
  max_tokens?: number
  model?: string
  agent_id?: string
}

export interface ChatSettings {
  model?: string
  provider?: string
  tool?: string
  personality?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface SendMessageRequest {
  message: string
  conversationId?: string
  settings?: ChatSettings
  apiKeys?: Record<string, string>
}

export interface SendMessageResponse {
  id: string
  content: string
  role: 'assistant'
  model_used?: string
  temperature_used?: number
  tool_used?: string
  personality_used?: string
  processing_time_ms?: number
  settings?: ChatSettings
}

class ChatService {
  private apiService = apiService

  constructor() {
    this.validateEnvironment()
  }

  private validateEnvironment(): void {
    if (!config.apiBaseUrl) {
      console.warn('API base URL não configurado. Algumas funcionalidades podem não funcionar.')
    }
  }

  /**
   * Validar API keys necessárias baseadas no modelo selecionado
   */
  private validateApiKeys(settings: ChatSettings, apiKeys: Record<string, string>): { valid: boolean; missing: string[] } {
    const missing: string[] = []
    
    if (!settings.model) return { valid: true, missing: [] }
    
    // FALLBACK: Se não há chaves de usuário, permitir uso das chaves do sistema (configuradas no backend)
    // O backend deve ter suas próprias chaves configuradas para funcionar como fallback
    const hasUserApiKeys = Object.keys(apiKeys).length > 0
    
    if (!hasUserApiKeys) {
      console.info('Usando chaves de API do sistema como fallback')
      return { valid: true, missing: [] }
    }
    
    // Se há chaves do usuário, validar se são suficientes
    const modelProviderMap: Record<string, string> = {
      'gpt-4o': 'openai',
      'gpt-4': 'openai',
      'gpt-3.5-turbo': 'openai',
      'claude-3': 'anthropic',
      'gemini-pro': 'google'
    }
    
    const provider = modelProviderMap[settings.model]
    if (provider && !apiKeys[provider]) {
      missing.push(provider)
    }
    
    // Verificar chaves específicas para ferramentas (apenas se usuário tem chaves próprias)
    if (settings.tool) {
      switch (settings.tool) {
        case 'twitter':
          if (!apiKeys.twitter) missing.push('twitter')
          break
        case 'linkedin':
          if (!apiKeys.linkedin) missing.push('linkedin')
          break
        case 'instagram':
          if (!apiKeys.instagram) missing.push('instagram')
          break
        case 'facebook':
          if (!apiKeys.facebook) missing.push('facebook')
          break
      }
    }
    
    return {
      valid: missing.length === 0,
      missing
    }
  }

  /**
   * Obter variáveis do usuário (API keys) do contexto de variáveis
   * Retorna chaves vazias como fallback (backend pode usar chaves do sistema)
   */
  private async getUserApiKeys(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/user-variables/api-keys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        console.warn('Não foi possível obter chaves de API do usuário, usando chaves do sistema como fallback')
        return {}
      }

      const data = await response.json()
      return data.reduce((acc: Record<string, string>, item: any) => {
        acc[item.provider] = item.api_key
        return acc
      }, {})
    } catch (error) {
      console.warn('Erro ao obter chaves de API do usuário, usando chaves do sistema como fallback:', error)
      return {}
    }
  }

  /**
   * Preparar configurações para envio à API
   */
  private prepareSettings(rawSettings: Partial<ChatSettings>): ChatSettings {
    const frontendModel = rawSettings.model || 'gpt-4o'
    const apiModel = mapToApiModelName(frontendModel)
    
    // Usar temperatura definida pelo usuário, ou fallback para personalidade apenas se não foi definida
    const temperature = rawSettings.temperature !== undefined 
      ? rawSettings.temperature 
      : this.getTemperatureFromPersonality(rawSettings.personality || 'natural')
    
    return {
      model: apiModel,
      provider: rawSettings.provider || getProviderFromModel(frontendModel),
      tool: rawSettings.tool || 'tools',
      personality: rawSettings.personality || 'natural',
      temperature: temperature,
      maxTokens: rawSettings.maxTokens || 2048,
      topP: rawSettings.topP !== undefined ? rawSettings.topP : 1,
      frequencyPenalty: rawSettings.frequencyPenalty !== undefined ? rawSettings.frequencyPenalty : 0,
      presencePenalty: rawSettings.presencePenalty !== undefined ? rawSettings.presencePenalty : 0
    }
  }

  /**
   * Obter temperature baseada na personalidade
   */
  private getTemperatureFromPersonality(personality: string): number {
    const personalityTemperatureMap: Record<string, number> = {
      'sistematica': 0.1,
      'objetiva': 0.3,
      'natural': 0.7,
      'criativa': 0.9,
      'imaginativa': 1.0
    }
    return personalityTemperatureMap[personality] || 0.7
  }

  /**
   * Log de uso de configurações para analytics
   */
  private logConfigurationUsage(settings: Partial<ChatSettings>, success: boolean, error?: string): void {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        settings,
        success,
        error,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      
      const existingLogs = localStorage.getItem('chatConfigurationLogs')
      let logs: any[] = []
      
      if (existingLogs && existingLogs.trim() !== '') {
        try {
          logs = JSON.parse(existingLogs)
          if (!Array.isArray(logs)) {
            logs = []
          }
        } catch (parseError) {
          console.warn('Erro ao fazer parse dos logs existentes, reiniciando logs:', parseError)
          logs = []
        }
      }
      
      logs.push(logEntry)
      
      // Manter apenas os últimos 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      
      localStorage.setItem('chatConfigurationLogs', JSON.stringify(logs))
    } catch (error) {
      console.error('Erro ao registrar log de configuração:', error)
    }
  }

  // Conversation management
  async createConversation(conversationData: ConversationCreate): Promise<Conversation> {
    try {
      const preparedSettings = this.prepareSettings(conversationData.settings || {})
      const userApiKeys = await this.getUserApiKeys()
      const apiKeys = { ...userApiKeys, ...conversationData.apiKeys }

      // Usar endpoint correto do chat
      const response = await fetch(`${config.apiBaseUrl}/conversations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        },
        body: JSON.stringify({
          title: conversationData.title,
          agent_id: conversationData.agent_id,
          workspace_id: conversationData.workspace_id,
          context: {
            ...conversationData.context,
            created_with_settings: preparedSettings,
            initial_model: preparedSettings.model,
            initial_provider: preparedSettings.provider,
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString(),
            frontend_version: '1.0.0'
          },
          settings: preparedSettings
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const conversation = await response.json()
      this.logConfigurationUsage(preparedSettings, true)
      return conversation
    } catch (error) {
      this.logConfigurationUsage(conversationData.settings || {}, false, error instanceof Error ? error.message : 'Erro desconhecido')
      console.error('Failed to create conversation:', error)
      throw error
    }
  }

  async getConversations(page = 1, size = 20, agent_id?: string): Promise<{ conversations: Conversation[], total: number, page: number, size: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })
      if (agent_id) params.append('agent_id', agent_id)

      console.log('🔍 Buscando conversas:', `${config.apiBaseUrl}/conversations/?${params}`)

      const response = await fetch(`${config.apiBaseUrl}/conversations/?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        // Se o endpoint não existir, retornar lista vazia em vez de falhar
        if (response.status === 404) {
          console.warn('⚠️ Endpoint de conversas não encontrado, retornando lista vazia')
          return {
            conversations: [],
            total: 0,
            page: page,
            size: size
          }
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Conversas carregadas:', data)
      
      return {
        conversations: data.items || data.conversations || [],
        total: data.total || 0,
        page: data.page || page,
        size: data.size || size
      }
    } catch (error) {
      console.error('❌ Erro ao buscar conversas:', error)
      
      // Fallback: retornar conversas offline se disponível
      if (error instanceof Error && error.message.includes('404')) {
        console.log('🔄 Usando conversas offline como fallback')
        const offlineConversations = this.getOfflineConversations()
        return {
          conversations: offlineConversations.slice((page - 1) * size, page * size),
          total: offlineConversations.length,
          page: page,
          size: size
        }
      }
      
      throw error
    }
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get conversation:', error)
      throw error
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('✅ Conversa deletada:', conversationId)
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      throw error
    }
  }

  async updateConversationTitle(conversationId: string, title: string): Promise<Conversation> {
    try {
      const params = new URLSearchParams({ title })
      const response = await fetch(`${config.apiBaseUrl}/conversations/${conversationId}/title?${params}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Título da conversa atualizado:', { conversationId, title })
      return result
    } catch (error) {
      console.error('Failed to update conversation title:', error)
      throw error
    }
  }

  /**
   * Atualizar título da conversa automaticamente baseado no conteúdo
   */
  async autoUpdateConversationTitle(conversationId: string, firstMessage: string): Promise<void> {
    try {
      const generatedTitle = this.generateTitleFromMessage(firstMessage)
      await this.updateConversationTitle(conversationId, generatedTitle)
    } catch (error) {
      console.warn('Não foi possível atualizar título automaticamente:', error)
      // Não falhar o fluxo principal por causa do título
    }
  }

  async archiveConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/conversations/${conversationId}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to archive conversation:', error)
      throw error
    }
  }

  async unarchiveConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/conversations/${conversationId}/unarchive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to unarchive conversation:', error)
      throw error
    }
  }

  private mapApiMessageToMessage(apiMessage: ApiMessage): Message {
    return {
      id: apiMessage.id,
      content: apiMessage.content,
      role: apiMessage.role as 'user' | 'assistant' | 'system',
      conversation_id: apiMessage.conversation_id,
      attachments: apiMessage.attachments,
      model_used: apiMessage.model_used,
      model_provider: undefined, // Não disponível na ApiMessage
      tokens_used: apiMessage.tokens_used,
      processing_time_ms: apiMessage.processing_time_ms,
      temperature: undefined,
      max_tokens: undefined,
      status: 'sent', // Valor padrão já que não está na ApiMessage
      error_message: undefined,
      rating: undefined,
      feedback: undefined,
      created_at: apiMessage.created_at,
      updated_at: undefined, // Não disponível na ApiMessage
      settings: undefined
    }
  }

  /**
   * Salvar mensagem do assistant no banco de dados
   */
  async saveAssistantMessage(conversationId: string, messageData: {
    content: string
    model_used?: string
    model_provider?: string
    tokens_used?: number
    processing_time_ms?: number
    temperature?: number
    max_tokens?: number
  }): Promise<Message> {
    console.log('💾 Salvando mensagem do assistant localmente (API não suporta assistant messages diretas):', { 
      conversationId, 
      content: messageData.content.substring(0, 50) + '...' 
    })

    // Como a API não tem endpoint específico para salvar mensagens do assistant,
    // vamos criar a mensagem localmente e salvar offline para sincronizar depois
    const assistantMessage: Message = {
      id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversation_id: conversationId,
      role: 'assistant',
      content: messageData.content,
      attachments: [],
      model_used: messageData.model_used,
      model_provider: messageData.model_provider,
      tokens_used: messageData.tokens_used || 0,
      processing_time_ms: messageData.processing_time_ms || 0,
      temperature: messageData.temperature,
      max_tokens: messageData.max_tokens,
      status: 'sent',
      created_at: new Date().toISOString()
    }
    
    // Salvar offline para que apareça na interface imediatamente
    this.saveOfflineMessage(assistantMessage)
    console.log('✅ Mensagem do assistant salva localmente:', assistantMessage.id)
    
    return assistantMessage
  }

  /**
   * Enviar mensagem com configurações completas
   */
  async sendMessage(conversationId: string, messageData: MessageCreate): Promise<Message> {
    try {
      // Preparar configurações
      const settings = this.prepareSettings(messageData.settings || {})
      
      // Obter API keys do usuário
      const userApiKeys = await this.getUserApiKeys()
      const apiKeys = { ...userApiKeys, ...messageData.apiKeys }
      
      // Validar API keys necessárias (com fallback para chaves do sistema)
      const validation = this.validateApiKeys(settings, apiKeys)
      if (!validation.valid) {
        console.warn(`API keys do usuário não encontradas para: ${validation.missing.join(', ')}. Usando chaves do sistema como fallback.`)
      }

      // Fazer requisição para a API
      const response = await fetch(`${config.apiBaseUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        },
        body: JSON.stringify({
          content: messageData.content,
          attachments: messageData.attachments || []
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // Log para analytics
      this.logConfigurationUsage(settings, true)

      return this.mapApiMessageToMessage(result)
    } catch (error) {
      // Log erro para analytics
      this.logConfigurationUsage(messageData.settings || {}, false, error instanceof Error ? error.message : 'Erro desconhecido')
      
      // Tratamento de erros específicos
      if (error instanceof Error) {
        if (error.message.includes('API keys')) {
          throw new Error(`🔑 ${error.message}`)
        }
        if (error.message.includes('Configurações inválidas')) {
          throw new Error(`⚙️ ${error.message}`)
        }
        if (error.message.includes('rate limit')) {
          throw new Error(`⏱️ Limite de requisições atingido. Tente novamente em alguns minutos.`)
        }
        if (error.message.includes('HTTP 500') || error.message.includes('Internal Server Error')) {
          throw new Error(`🔧 Erro interno do servidor. Tente novamente em alguns minutos.`)
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
          throw new Error(`🌐 Erro de conectividade. Verifique sua conexão com a internet.`)
        }
      }
      
      throw error
    }
  }

  async getMessages(conversationId: string, page = 1, size = 50): Promise<{ messages: Message[], total: number, page: number, size: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })

      const response = await fetch(`${config.apiBaseUrl}/conversations/${conversationId}/messages?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        messages: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        size: data.size || size
      }
    } catch (error) {
      console.error('Failed to get messages:', error)
      throw error
    }
  }

  // Offline functionality
  getOfflineConversations(): Conversation[] {
    try {
      const stored = localStorage.getItem('offline_conversations')
      if (!stored || stored.trim() === '') {
        return []
      }
      
      try {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
      } catch (parseError) {
        console.error('Erro ao fazer parse das conversas offline:', parseError)
        return []
      }
    } catch (error) {
      console.error('Failed to get offline conversations:', error)
      return []
    }
  }

  saveOfflineConversation(conversation: Conversation): void {
    try {
      const conversations = this.getOfflineConversations()
      const existingIndex = conversations.findIndex(c => c.id === conversation.id)
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation
      } else {
        conversations.push(conversation)
      }
      
      localStorage.setItem('offline_conversations', JSON.stringify(conversations))
    } catch (error) {
      console.error('Failed to save offline conversation:', error)
    }
  }

  getOfflineMessages(conversationId: string): Message[] {
    try {
      const stored = localStorage.getItem(`offline_messages_${conversationId}`)
      if (!stored || stored.trim() === '') {
        return []
      }
      
      try {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
      } catch (parseError) {
        console.error('Erro ao fazer parse das mensagens offline:', parseError)
        return []
      }
    } catch (error) {
      console.error('Failed to get offline messages:', error)
      return []
    }
  }

  saveOfflineMessage(message: Message): void {
    try {
      const messages = this.getOfflineMessages(message.conversation_id)
      messages.push(message)
      localStorage.setItem(`offline_messages_${message.conversation_id}`, JSON.stringify(messages))
    } catch (error) {
      console.error('Failed to save offline message:', error)
    }
  }

  isOnline(): boolean {
    return navigator.onLine
  }

  async syncOfflineData(): Promise<void> {
    if (!this.isOnline()) {
      return
    }

    try {
      // Sync conversations
      const offlineConversations = this.getOfflineConversations()
      for (const conversation of offlineConversations) {
        if (conversation.id.startsWith('offline_')) {
          // This is an offline conversation, create it on the server
          const serverConversation = await this.createConversation({
            title: conversation.title,
            agent_id: conversation.agent_id,
            context: conversation.context,
            settings: conversation.settings
          })
          
          // Update local storage with server ID
          conversation.id = serverConversation.id
          this.saveOfflineConversation(conversation)
        }
      }

      // Sync messages
      for (const conversation of offlineConversations) {
        const offlineMessages = this.getOfflineMessages(conversation.id)
        for (const message of offlineMessages) {
          if (message.id.startsWith('offline_')) {
            // This is an offline message, send it to the server
            await this.sendMessage(conversation.id, {
              content: message.content,
              attachments: message.attachments
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error)
    }
  }

  // INTEGRATED CHAT FLOW - Novo método principal

  /**
   * Fluxo completo de chat: enviar mensagem e obter resposta
   */
  async sendChatMessage(request: SendMessageRequest): Promise<{ userMessage: Message, assistantMessage: Message }> {
    try {
      console.log('🔄 Iniciando fluxo de chat:', request)
      console.log('🔍 DEBUG - Settings recebidas:', request.settings)

      let conversationId = request.conversationId

      // 1. Criar conversa se não existir
      if (!conversationId) {
        const conversation = await this.createConversation({
          title: this.generateTitleFromMessage(request.message),
          settings: request.settings
        })
        conversationId = conversation.id
      }

      // 2. Preparar configurações para envio
      const settings = this.prepareSettings(request.settings || {})
      console.log('🔍 DEBUG - Settings após prepareSettings:', settings)
      
      // 3. Obter API keys do usuário
      const userApiKeys = await this.getUserApiKeys()
      const apiKeys = { ...userApiKeys, ...request.apiKeys }
      
      // 4. Validar API keys necessárias (com fallback para chaves do sistema)
      const validation = this.validateApiKeys(settings, apiKeys)
      if (!validation.valid) {
        console.warn(`API keys do usuário não encontradas para: ${validation.missing.join(', ')}. Usando chaves do sistema como fallback.`)
      }

      // 5. FLUXO HÍBRIDO: Usar LLM direto para obter resposta e depois salvar ambas as mensagens
      console.log('🤖 Obtendo resposta do LLM...')
      
      const requestBody = {
        messages: [
          { role: 'user', content: request.message }
        ],
        model: mapToApiModelName(settings.model || 'gpt-4o'),
        provider: settings.provider || getProviderFromModel(settings.model || 'gpt-4o'),
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
        tools: settings.tool !== 'no-tools' ? settings.tool : undefined,
        personality: settings.personality
      }
      
      console.log('🔍 DEBUG - Request body para /llm/chat:', requestBody)
      
      const response = await fetch(`${config.apiBaseUrl}/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const chatResult = await response.json()
      console.log('🔍 Resposta da API /llm/chat:', chatResult)
      
      // Verificar se temos o conteúdo da resposta
      if (!chatResult.content) {
        throw new Error('Resposta inválida da API de chat')
      }

      // 6. Salvar mensagem do usuário no banco de dados
      console.log('💾 Salvando mensagem do usuário...')
      const userMessage = await this.sendMessage(conversationId, {
        content: request.message,
        settings: request.settings,
        apiKeys: request.apiKeys
      })

      // 7. Salvar mensagem do assistant no banco de dados
      console.log('💾 Salvando mensagem do assistant...')
      const assistantMessage = await this.saveAssistantMessage(conversationId, {
        content: chatResult.content,
        model_used: chatResult.model,
        model_provider: chatResult.provider,
        tokens_used: chatResult.usage?.total_tokens || 0,
        processing_time_ms: chatResult.metadata?.processing_time_ms || 0,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      })

      // 8. Atualizar título da conversa se foi criada agora
      if (!request.conversationId) {
        await this.autoUpdateConversationTitle(conversationId, request.message)
      }

      console.log('✅ Fluxo de chat concluído:', { 
        userMessage: userMessage.id, 
        assistantMessage: assistantMessage.id,
        model: assistantMessage.model_used
      })

      return { userMessage, assistantMessage }
    } catch (error) {
      console.error('❌ Erro no fluxo de chat:', error)
      
      // Se a API principal falhar, tentar fallback com mensagem manual
      if (request.conversationId) {
        try {
          console.log('🔄 Tentando fallback com sendMessage...')
          
          const userMessage = await this.sendMessage(request.conversationId, {
            content: request.message,
            settings: request.settings,
            apiKeys: request.apiKeys
          })

          // Criar mensagem de assistant simulada para não quebrar o fluxo
          const assistantMessage: Message = {
            id: `assistant_error_${Date.now()}`,
            conversation_id: request.conversationId,
            role: 'assistant',
            content: 'Desculpe, estou com dificuldades para processar sua mensagem no momento. Por favor, tente novamente.',
            model_used: 'gpt-4o',
            model_provider: 'openai',
            tokens_used: 0,
            processing_time_ms: 0,
            attachments: [],
            status: 'sent',
            created_at: new Date().toISOString()
          }
          
          // Salvar offline para sincronizar depois
          this.saveOfflineMessage(assistantMessage)

          return { userMessage, assistantMessage }
        } catch (fallbackError) {
          console.error('❌ Fallback também falhou:', fallbackError)
          throw error
        }
      }
      
      throw error
    }
  }

  /**
   * Atualizar estatísticas da conversa após nova mensagem
   */
  private async updateConversationStats(conversationId: string, stats: {
    userTokens: number
    assistantTokens: number
    processingTime: number
    model: string
    provider: string
  }): Promise<void> {
    try {
      // Obter conversa atual para atualizar estatísticas
      const conversation = await this.getConversation(conversationId)
      
      // Calcular novos totais
      const totalTokens = conversation.total_tokens_used + stats.userTokens + stats.assistantTokens
      const messageCount = conversation.message_count + 2 // user + assistant
      
      // Atualizar contexto com informações da última interação
      const updatedContext = {
        ...conversation.context,
        last_model_used: stats.model,
        last_provider_used: stats.provider,
        last_processing_time_ms: stats.processingTime,
        total_interactions: Math.floor(messageCount / 2)
      }

      // Note: A API não tem endpoint específico para atualizar stats,
      // mas essas informações são atualizadas automaticamente quando mensagens são enviadas
      console.log('📊 Estatísticas da conversa atualizadas:', {
        conversationId,
        messageCount,
        totalTokens,
        lastModel: stats.model,
        lastProvider: stats.provider
      })
      
      // Salvar no cache local para referência
      this.saveConversationStatsCache(conversationId, {
        messageCount,
        totalTokens,
        lastModel: stats.model,
        lastProvider: stats.provider,
        lastProcessingTime: stats.processingTime,
        updatedAt: new Date().toISOString()
      })
      
    } catch (error) {
      console.warn('⚠️ Não foi possível atualizar estatísticas da conversa:', error)
      // Não falhar o fluxo principal por causa de estatísticas
    }
  }

  /**
   * Salvar cache de estatísticas da conversa
   */
  private saveConversationStatsCache(conversationId: string, stats: any): void {
    try {
      const cacheKey = `conversation_stats_${conversationId}`
      localStorage.setItem(cacheKey, JSON.stringify(stats))
    } catch (error) {
      console.warn('Erro ao salvar cache de estatísticas:', error)
    }
  }

  /**
   * Gerar título a partir da mensagem
   */
  private generateTitleFromMessage(message: string): string {
    const maxLength = 50
    if (message.length <= maxLength) {
      return message
    }
    return message.substring(0, maxLength - 3) + '...'
  }

  /**
   * Obter analytics de uso
   */
  getUsageAnalytics(): {
    totalMessages: number
    successRate: number
    mostUsedSettings: {
      models: Record<string, number>
      tools: Record<string, number>
      personalities: Record<string, number>
    }
    errorsByType: Record<string, number>
  } {
    try {
      const logs = JSON.parse(localStorage.getItem('chatConfigurationLogs') || '[]')
      
      const totalMessages = logs.length
      const successCount = logs.filter((log: any) => log.success).length
      const successRate = totalMessages > 0 ? (successCount / totalMessages) * 100 : 0

      const mostUsedSettings = {
        models: this.aggregateSettings(logs, 'model'),
        tools: this.aggregateSettings(logs, 'tool'),
        personalities: this.aggregateSettings(logs, 'personality')
      }

      const errorsByType = this.aggregateErrors(logs)

      return {
        totalMessages,
        successRate,
        mostUsedSettings,
        errorsByType
      }
    } catch (error) {
      console.error('Erro ao obter analytics:', error)
      return {
        totalMessages: 0,
        successRate: 0,
        mostUsedSettings: { models: {}, tools: {}, personalities: {} },
        errorsByType: {}
      }
    }
  }

  private aggregateSettings(logs: any[], setting: string): Record<string, number> {
    const counts: Record<string, number> = {}
    logs.forEach(log => {
      const value = log.settings?.[setting]
      if (value) {
        counts[value] = (counts[value] || 0) + 1
      }
    })
    return counts
  }

  private aggregateErrors(logs: any[]): Record<string, number> {
    const errors: Record<string, number> = {}
    logs.filter(log => !log.success).forEach(log => {
      const errorType = this.categorizeError(log.error || 'Unknown')
      errors[errorType] = (errors[errorType] || 0) + 1
    })
    return errors
  }

  private categorizeError(error: string): string {
    if (error.includes('network') || error.includes('fetch')) return 'Network'
    if (error.includes('auth') || error.includes('token')) return 'Authentication'
    if (error.includes('rate') || error.includes('limit')) return 'Rate Limit'
    if (error.includes('model') || error.includes('provider')) return 'Model/Provider'
    return 'Other'
  }

  /**
   * Testar se um provider específico está disponível
   */
  async testProvider(provider: string): Promise<{ available: boolean; error?: string }> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/llm/providers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        return { available: false, error: `HTTP ${response.status}: ${response.statusText}` }
      }

      const providers = await response.json()
      const providerInfo = providers.find((p: any) => p.id === provider || p.name === provider)
      
      return {
        available: providerInfo && providerInfo.status === 'available',
        error: providerInfo ? providerInfo.error : `Provider ${provider} not found`
      }
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async testConfiguration(settings: ChatSettings): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const userApiKeys = await this.getUserApiKeys()
      const validation = this.validateApiKeys(settings, userApiKeys)
      
      if (!validation.valid) {
        return {
          valid: false,
          errors: validation.missing.map(key => `API key '${key}' não configurada`)
        }
      }

      // Testar conectividade básica com a API
      const response = await fetch(`${config.apiBaseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return { valid: true, errors: [] }
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      }
    }
  }

  /**
   * Configurar API key via API (seguindo especificação OpenAPI)
   */
  async configureApiKey(provider: string, apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/user-variables/api-keys/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        },
        body: JSON.stringify({
          key: `${provider.toUpperCase()}_API_KEY`,
          value: apiKey,
          category: 'api_keys',
          is_encrypted: true,
          is_active: true,
          description: `API key para ${provider}`
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao configurar API key: ${response.status} ${response.statusText}. Detalhes: ${errorText}`)
      }

      // Verificar se há conteúdo na resposta antes de tentar processar
      const text = await response.text()
      if (text && text.trim() !== '') {
        try {
          const result = JSON.parse(text)
          console.log(`✅ API key configurada para ${provider}:`, result)
        } catch (parseError) {
          console.log(`✅ API key configurada para ${provider} (resposta não-JSON)`)
        }
      } else {
        console.log(`✅ API key configurada para ${provider}`)
      }
    } catch (error) {
      console.error(`❌ Erro ao configurar API key para ${provider}:`, error)
      throw error
    }
  }

  /**
   * Verificar providers disponíveis
   */
  async checkProviders(): Promise<any[]> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/llm/providers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao verificar providers: ${response.status}`)
      }

      const text = await response.text()
      if (!text || text.trim() === '') {
        console.warn('Response vazia do servidor para providers')
        return []
      }

      try {
        const data = text ? JSON.parse(text) : {}
        return data.providers || []
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta de providers:', parseError)
        console.error('Resposta recebida:', text)
        return []
      }
    } catch (error) {
      console.error('Erro ao verificar providers:', error)
      return []
    }
  }

  /**
   * Verificar API keys configuradas
   */
  async checkApiKeys(): Promise<any[]> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/user-variables/api-keys`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao verificar API keys: ${response.status}`)
      }

      const text = await response.text()
      if (!text || text.trim() === '') {
        console.warn('Response vazia do servidor para API keys')
        return []
      }

      try {
        return text ? JSON.parse(text) : []
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError)
        console.error('Resposta recebida:', text)
        return []
      }
    } catch (error) {
      console.error('Erro ao verificar API keys:', error)
      return []
    }
  }
}

export const chatService = new ChatService()
export default chatService

