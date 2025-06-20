/**
 * Serviço de chat integrado com backend
 * Gerencia sessões, mensagens e comunicação em tempo real
 */

import { config } from '../config'
import { apiService, Message as ApiMessage, Conversation as ApiConversation } from '../api/service'

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
    // Use the global apiService instance
  }

  /**
   * Validar API keys necessárias baseadas no modelo selecionado
   */
  private validateApiKeys(settings: ChatSettings, apiKeys: Record<string, string>): { valid: boolean; missing: string[] } {
    const missing: string[] = []
    
    if (!settings.model) return { valid: true, missing: [] }
    
    // Mapear modelos para provedores e suas chaves necessárias
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
    
    // Verificar chaves específicas para ferramentas
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
   */
  private async getUserApiKeys(): Promise<Record<string, string>> {
    try {
      // Buscar do serviço de variáveis integrado com o backend  
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.variables.base}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        console.warn('Não foi possível obter API keys do usuário:', response.status)
        return {}
      }

      const text = await response.text()
      if (!text || text.trim() === '') {
        console.warn('Response vazia do servidor para getUserApiKeys')
        return {}
      }

      let result: any = {}
      try {
        result = JSON.parse(text)
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta getUserApiKeys:', parseError)
        console.error('Resposta recebida:', text)
        return {}
      }

      const apiKeys = result.items || result || []
      
      // Converter para formato esperado pelo validador
      const formattedKeys: Record<string, string> = {}
      
      // Mapear chaves de variáveis para nomes de provedores baseado na API spec
      if (Array.isArray(apiKeys)) {
        apiKeys.forEach((keyData: any) => {
          if (keyData.key === 'OPENAI_API_KEY' && keyData.value) {
            formattedKeys.openai = keyData.value
          }
          if (keyData.key === 'ANTHROPIC_API_KEY' && keyData.value) {
            formattedKeys.anthropic = keyData.value
          }
          if (keyData.key === 'GOOGLE_API_KEY' && keyData.value) {
            formattedKeys.google = keyData.value
          }
        })
      }
      
      // Cache local para performance
      localStorage.setItem('userApiKeys', JSON.stringify(formattedKeys))
      
      return formattedKeys
    } catch (error) {
      console.error('Erro ao obter API keys do usuário:', error)
      return {}
    }
  }

  /**
   * Preparar configurações para envio à API
   */
  private prepareSettings(rawSettings: Partial<ChatSettings>): ChatSettings {
    return {
      model: rawSettings.model || 'gpt-4o',
      provider: this.getProviderFromModel(rawSettings.model || 'gpt-4o'),
      tool: rawSettings.tool || 'tools',
      personality: rawSettings.personality || 'natural',
      temperature: rawSettings.temperature || this.getTemperatureFromPersonality(rawSettings.personality || 'natural'),
      maxTokens: rawSettings.maxTokens || 2048,
      topP: rawSettings.topP || 1,
      frequencyPenalty: rawSettings.frequencyPenalty || 0,
      presencePenalty: rawSettings.presencePenalty || 0
    }
  }

  /**
   * Obter provedor baseado no modelo
   */
  private getProviderFromModel(model: string): string {
    const modelProviderMap: Record<string, string> = {
      'gpt-4o': 'openai',
      'gpt-4': 'openai',
      'gpt-3.5-turbo': 'openai',
      'claude-3': 'anthropic',
      'gemini-pro': 'google'
    }
    return modelProviderMap[model] || 'openai'
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
      
      // Salvar no localStorage para analytics
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
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.chat.http}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        },
        body: JSON.stringify({
          type: 'create_conversation',
          title: conversationData.title,
          agent_id: conversationData.agent_id,
          context: conversationData.context,
          settings: preparedSettings,
          apiKeys
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

      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.chat.conversations}?${params}`, {
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
      console.error('Failed to get conversations:', error)
      throw error
    }
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      return await this.apiService.getConversation(conversationId)
    } catch (error) {
      console.error('Failed to get conversation:', error)
      throw error
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.chat.http}?conversationId=${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      throw error
    }
  }

  async updateConversationTitle(conversationId: string, title: string): Promise<Conversation> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/conversations/${conversationId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        },
        body: JSON.stringify({ title })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to update conversation title:', error)
      throw error
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
   * Enviar mensagem com configurações completas
   */
  async sendMessage(conversationId: string, messageData: MessageCreate): Promise<Message> {
    try {
      // Preparar configurações
      const settings = this.prepareSettings(messageData.settings || {})
      
      // Obter API keys do usuário
      const userApiKeys = await this.getUserApiKeys()
      const apiKeys = { ...userApiKeys, ...messageData.apiKeys }
      
      // Validar API keys necessárias
      const validation = this.validateApiKeys(settings, apiKeys)
      if (!validation.valid) {
        throw new Error(`API keys necessárias não encontradas: ${validation.missing.join(', ')}. Configure suas chaves em Variáveis do Usuário.`)
      }

      // Fazer requisição para a API
      const response = await fetch(`${config.apiBaseUrl}/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: messageData.content }],
          provider: settings.provider,
          model: settings.model,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          top_p: settings.topP,
          frequency_penalty: settings.frequencyPenalty,
          presence_penalty: settings.presencePenalty
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
      }
      
      throw error
    }
  }

  async getMessages(conversationId: string, page = 1, size = 50): Promise<{ messages: Message[], total: number, page: number, size: number }> {
    try {
      const response = await this.apiService.getMessages(conversationId, { page, size })
      
      return {
        messages: response.items.map(msg => this.mapApiMessageToMessage(msg)),
        total: response.total,
        page: response.page,
        size: response.size
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
      const logs = localStorage.getItem('chatConfigurationLogs')
      if (!logs || logs.trim() === '') {
        return {
          totalMessages: 0,
          successRate: 0,
          mostUsedSettings: { models: {}, tools: {}, personalities: {} },
          errorsByType: {}
        }
      }

      let parsedLogs: any[] = []
      try {
        parsedLogs = JSON.parse(logs)
        if (!Array.isArray(parsedLogs)) {
          parsedLogs = []
        }
      } catch (parseError) {
        console.error('Erro ao fazer parse dos logs de analytics:', parseError)
        return {
          totalMessages: 0,
          successRate: 0,
          mostUsedSettings: { models: {}, tools: {}, personalities: {} },
          errorsByType: {}
        }
      }
      const successfulLogs = parsedLogs.filter((log: any) => log.success)
      
      return {
        totalMessages: parsedLogs.length,
        successRate: parsedLogs.length > 0 ? successfulLogs.length / parsedLogs.length : 0,
        mostUsedSettings: {
          models: this.aggregateSettings(parsedLogs, 'model'),
          tools: this.aggregateSettings(parsedLogs, 'tool'),
          personalities: this.aggregateSettings(parsedLogs, 'personality')
        },
        errorsByType: this.aggregateErrors(parsedLogs)
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

  /**
   * Agregar configurações para analytics
   */
  private aggregateSettings(logs: any[], setting: string): Record<string, number> {
    return logs.reduce((acc, log) => {
      const value = log.settings?.[setting] || 'unknown'
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Agregar erros para analytics
   */
  private aggregateErrors(logs: any[]): Record<string, number> {
    return logs.filter(log => !log.success).reduce((acc, log) => {
      const errorType = this.categorizeError(log.error || 'unknown')
      acc[errorType] = (acc[errorType] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Categorizar tipos de erro
   */
  private categorizeError(error: string): string {
    if (error.includes('API keys')) return 'api_keys'
    if (error.includes('rate limit')) return 'rate_limit'
    if (error.includes('Configurações')) return 'invalid_config'
    if (error.includes('network')) return 'network'
    return 'unknown'
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

      // Fazer uma requisição de teste
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.chat.http}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiService.getAccessToken()}`
        },
        body: JSON.stringify({
          message: 'test',
          settings,
          apiKeys: userApiKeys,
          test: true
        })
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
        const data = JSON.parse(text)
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
        return JSON.parse(text)
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

