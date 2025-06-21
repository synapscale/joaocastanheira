# Serviços Backend - Sistema de Chat

## Visão Geral

O sistema de chat utiliza uma arquitetura de serviços bem estruturada para abstrair a comunicação com APIs externas e gerenciar a lógica de negócio. Os serviços são organizados em camadas com responsabilidades específicas.

## Arquitetura de Serviços

```
┌─────────────────────────────────────────────┐
│              FRONTEND HOOKS                 │
│  - useConversations                         │
│  - useChat                                  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────┴───────────────────────────┐
│              SERVICE LAYER                  │
│  - ChatService (principal)                  │
│  - AIUtils (processamento IA)               │
│  - ModelMapper (mapeamento)                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────┴───────────────────────────┐
│              API LAYER                      │
│  - APIService (HTTP client)                 │
│  - Config (configurações)                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────┴───────────────────────────┐
│              EXTERNAL APIs                  │
│  - /api/v1/conversations/                   │
│  - /api/v1/llm/chat                         │
│  - /api/chat (fallback)                     │
└─────────────────────────────────────────────┘
```

## ChatService (Serviço Principal)

### Interface e Tipos

```typescript
// lib/services/chat.ts

interface MessageResponse {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  model_used?: string
  model_provider?: string
  tokens_used: number
  processing_time_ms: number
  temperature?: number
  max_tokens?: number
  error_message?: string
  rating?: number
  feedback?: string
  attachments?: any[]
}

interface ConversationResponse {
  id: string
  title: string
  agent_id?: string
  workspace_id?: string
  created_at: string
  updated_at: string
  context: Record<string, any>
  settings: {
    model: string
    provider: string
    personality: string
    tool: string
  }
  metadata: {
    message_count: number
    total_tokens_used: number
    last_message_at?: string
  }
}

interface ConversationsResponse {
  conversations: ConversationResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

interface MessagesResponse {
  messages: MessageResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

interface LLMResponse {
  content: string
  model: string
  provider: string
  tokens_used: number
  processing_time_ms: number
  temperature: number
  max_tokens: number
  finish_reason: string
}
```

### Implementação Completa

```typescript
export class ChatService {
  private apiService: APIService
  
  constructor() {
    this.apiService = new APIService()
  }
  
  /**
   * Método principal - Fluxo completo de chat
   * 1. Salva mensagem do usuário
   * 2. Processa com LLM
   * 3. Salva resposta do assistente
   */
  async sendChatMessage(params: {
    message: string
    conversationId: string
  }): Promise<{
    userMessage: MessageResponse
    assistantMessage: MessageResponse
  }> {
    try {
      console.log('💬 Iniciando fluxo de chat completo...')
      
      // 1. Salvar mensagem do usuário
      console.log('📝 Salvando mensagem do usuário...')
      const userMessage = await this.addMessage(params.conversationId, params.message)
      console.log('✅ Mensagem do usuário salva:', userMessage.id)
      
      // 2. Processar com LLM
      console.log('🤖 Processando com LLM...')
      const llmResponse = await this.processWithLLM({
        message: params.message,
        model: mapToApiModelName('gpt-4o'),
        provider: 'openai'
      })
      console.log('✅ Resposta do LLM recebida')
      
      // 3. Salvar resposta do assistente (localStorage como fallback)
      console.log('💾 Salvando resposta do assistente...')
      const assistantMessage = await this.saveAssistantMessage({
        conversationId: params.conversationId,
        content: llmResponse.content,
        model: llmResponse.model,
        provider: llmResponse.provider,
        tokens_used: llmResponse.tokens_used,
        processing_time_ms: llmResponse.processing_time_ms,
        temperature: llmResponse.temperature,
        max_tokens: llmResponse.max_tokens
      })
      console.log('✅ Resposta do assistente salva:', assistantMessage.id)
      
      return {
        userMessage,
        assistantMessage
      }
    } catch (error) {
      console.error('❌ Erro no fluxo de chat:', error)
      throw error
    }
  }
  
  /**
   * Obter lista de conversas
   */
  async getConversations(page = 1, pageSize = 50): Promise<ConversationsResponse> {
    try {
      const response = await this.apiService.get(`/conversations/?page=${page}&page_size=${pageSize}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
      throw new Error('Não foi possível carregar as conversas')
    }
  }
  
  /**
   * Criar nova conversa
   */
  async createConversation(data: {
    title: string
    agent_id?: string
    workspace_id?: string
    context?: Record<string, any>
    settings?: Record<string, any>
  }): Promise<ConversationResponse> {
    try {
      const response = await this.apiService.post('/conversations/', data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
      throw new Error('Não foi possível criar a conversa')
    }
  }
  
  /**
   * Obter mensagens de uma conversa
   */
  async getMessages(conversationId: string, page = 1, pageSize = 100): Promise<MessagesResponse> {
    try {
      const response = await this.apiService.get(
        `/conversations/${conversationId}/messages/?page=${page}&page_size=${pageSize}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      throw new Error('Não foi possível carregar as mensagens')
    }
  }
  
  /**
   * Adicionar mensagem do usuário
   */
  async addMessage(conversationId: string, content: string): Promise<MessageResponse> {
    try {
      const response = await this.apiService.post(`/conversations/${conversationId}/messages/`, {
        content,
        attachments: []
      })
      return response.data
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error)
      throw new Error('Não foi possível salvar a mensagem')
    }
  }
  
  /**
   * Processar mensagem com LLM
   */
  async processWithLLM(params: {
    message: string
    model: string
    provider: string
    context?: any[]
    systemPrompt?: string
  }): Promise<LLMResponse> {
    try {
      const response = await this.apiService.post('/llm/chat', {
        message: params.message,
        model: params.model,
        provider: params.provider,
        temperature: 0.7,
        max_tokens: 4000,
        context: params.context || [],
        system_prompt: params.systemPrompt || 'Você é um assistente útil.',
        tools: []
      })
      
      return response.data
    } catch (error) {
      console.error('Erro ao processar com LLM:', error)
      throw new Error('Não foi possível processar a mensagem com IA')
    }
  }
  
  /**
   * Salvar resposta do assistente (localStorage como fallback)
   */
  async saveAssistantMessage(params: {
    conversationId: string
    content: string
    model: string
    provider: string
    tokens_used: number
    processing_time_ms: number
    temperature?: number
    max_tokens?: number
  }): Promise<MessageResponse> {
    // Como a API não tem endpoint direto para salvar mensagens do assistente,
    // vamos usar localStorage como fallback
    const assistantMessage: MessageResponse = {
      id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversation_id: params.conversationId,
      role: 'assistant',
      content: params.content,
      created_at: new Date().toISOString(),
      model_used: params.model,
      model_provider: params.provider,
      tokens_used: params.tokens_used,
      processing_time_ms: params.processing_time_ms,
      temperature: params.temperature,
      max_tokens: params.max_tokens
    }
    
    // Salvar no localStorage
    try {
      const key = `chat-messages-${params.conversationId}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push(assistantMessage)
      localStorage.setItem(key, JSON.stringify(existing))
      console.log('💾 Mensagem do assistente salva no localStorage')
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error)
    }
    
    return assistantMessage
  }
  
  /**
   * Atualizar título da conversa
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    try {
      await this.apiService.put(`/conversations/${conversationId}/title`, { title })
    } catch (error) {
      console.error('Erro ao atualizar título:', error)
      throw new Error('Não foi possível atualizar o título')
    }
  }
  
  /**
   * Deletar conversa
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await this.apiService.delete(`/conversations/${conversationId}`)
      
      // Limpar localStorage também
      const key = `chat-messages-${conversationId}`
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Erro ao deletar conversa:', error)
      throw new Error('Não foi possível deletar a conversa')
    }
  }
}
```

## APIService (Cliente HTTP)

### Implementação Base

```typescript
// lib/api/service.ts

interface APIResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

interface APIError {
  message: string
  code?: string
  details?: any
  status?: number
}

class APIService {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  
  constructor() {
    this.baseURL = config.apiBaseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }
  
  /**
   * Configurar headers de autenticação
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  /**
   * Configurar workspace
   */
  setWorkspace(workspaceId: string): void {
    this.defaultHeaders['X-Workspace-ID'] = workspaceId
  }
  
  /**
   * Requisição GET
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<APIResponse<T>> {
    const url = this.buildURL(endpoint, params)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders,
      })
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }
  
  /**
   * Requisição POST
   */
  async post<T = any>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    const url = this.buildURL(endpoint)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
      })
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }
  
  /**
   * Requisição PUT
   */
  async put<T = any>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    const url = this.buildURL(endpoint)
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
      })
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }
  
  /**
   * Requisição DELETE
   */
  async delete<T = any>(endpoint: string): Promise<APIResponse<T>> {
    const url = this.buildURL(endpoint)
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.defaultHeaders,
      })
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }
  
  /**
   * Construir URL completa
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    // Remover barra inicial se existir (já está no baseURL)
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    let url = `${this.baseURL}/${cleanEndpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    
    return url
  }
  
  /**
   * Processar resposta
   */
  private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    
    let data: T
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = (await response.text()) as unknown as T
    }
    
    if (!response.ok) {
      throw {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        data
      }
    }
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers
    }
  }
  
  /**
   * Processar erro
   */
  private handleError(error: any): APIError {
    if (error.status) {
      // Erro HTTP
      return {
        message: error.message || 'Erro na requisição',
        status: error.status,
        details: error.data
      }
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Erro de rede
      return {
        message: 'Erro de conexão. Verifique sua internet.',
        code: 'NETWORK_ERROR'
      }
    }
    
    // Erro genérico
    return {
      message: error.message || 'Erro desconhecido',
      details: error
    }
  }
}

// Instância singleton
export const apiService = new APIService()
```

## AI Utils (Utilitários de IA)

### Processamento de Requisições

```typescript
// lib/ai-utils.ts

interface AIRequestParams {
  message: string
  model: string
  provider: string
  context?: Message[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  tools?: any[]
}

interface AIResponse {
  content: string
  model: string
  provider: string
  tokens_used: number
  processing_time_ms: number
  temperature: number
  max_tokens: number
  finish_reason: string
}

/**
 * Processar requisição de IA com fallbacks
 */
export async function processAIRequest(params: AIRequestParams): Promise<AIResponse> {
  const startTime = Date.now()
  
  try {
    // 1. Mapear modelo para nome da API
    const apiModel = mapToApiModelName(params.model)
    console.log(`🤖 Processando com modelo: ${params.model} → ${apiModel}`)
    
    // 2. Preparar contexto de mensagens
    const messages = [
      ...(params.context || []).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: params.message }
    ]
    
    // 3. Tentar endpoint principal (/llm/chat)
    try {
      const response = await apiService.post('/llm/chat', {
        message: params.message,
        model: apiModel,
        provider: params.provider,
        context: messages,
        system_prompt: params.systemPrompt || 'Você é um assistente útil.',
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 4000,
        tools: params.tools || []
      })
      
      const processingTime = Date.now() - startTime
      
      return {
        content: response.data.content,
        model: response.data.model,
        provider: response.data.provider,
        tokens_used: response.data.tokens_used || 0,
        processing_time_ms: response.data.processing_time_ms || processingTime,
        temperature: response.data.temperature || params.temperature || 0.7,
        max_tokens: response.data.max_tokens || params.maxTokens || 4000,
        finish_reason: response.data.finish_reason || 'stop'
      }
    } catch (primaryError) {
      console.warn('❌ Erro no endpoint principal, tentando fallback...', primaryError)
      
      // 4. Fallback para endpoint simples (/chat)
      try {
        const fallbackResponse = await apiService.post('/chat', {
          message: params.message,
          conversationId: null
        })
        
        const processingTime = Date.now() - startTime
        
        return {
          content: fallbackResponse.data.response || fallbackResponse.data.content || 'Resposta não disponível',
          model: apiModel,
          provider: params.provider,
          tokens_used: 0,
          processing_time_ms: processingTime,
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || 4000,
          finish_reason: 'stop'
        }
      } catch (fallbackError) {
        console.error('❌ Falha em todos os endpoints:', fallbackError)
        throw new Error('Não foi possível processar a mensagem com IA')
      }
    }
  } catch (error) {
    console.error('❌ Erro geral no processamento de IA:', error)
    throw error
  }
}

/**
 * Validar configuração de API
 */
export function validateAPIConfiguration(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Verificar URL base
  if (!config.apiBaseUrl) {
    errors.push('URL base da API não configurada')
  }
  
  // Verificar chaves de API (opcional)
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  const hasGoogle = !!process.env.GOOGLE_API_KEY
  
  if (!hasOpenAI && !hasAnthropic && !hasGoogle) {
    warnings.push('Nenhuma chave de API configurada. O sistema usará chaves do usuário ou do sistema.')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Obter estatísticas de uso
 */
export function getUsageStats(messages: Message[]): {
  totalMessages: number
  totalTokens: number
  averageResponseTime: number
  modelUsage: Record<string, number>
  providerUsage: Record<string, number>
} {
  const assistantMessages = messages.filter(m => m.role === 'assistant')
  
  const totalTokens = assistantMessages.reduce(
    (sum, msg) => sum + (msg.metadata?.tokens_used || 0), 
    0
  )
  
  const totalResponseTime = assistantMessages.reduce(
    (sum, msg) => sum + (msg.metadata?.processing_time_ms || 0), 
    0
  )
  
  const modelUsage: Record<string, number> = {}
  const providerUsage: Record<string, number> = {}
  
  assistantMessages.forEach(msg => {
    if (msg.model) {
      modelUsage[msg.model] = (modelUsage[msg.model] || 0) + 1
    }
    if (msg.metadata?.provider) {
      providerUsage[msg.metadata.provider] = (providerUsage[msg.metadata.provider] || 0) + 1
    }
  })
  
  return {
    totalMessages: messages.length,
    totalTokens,
    averageResponseTime: assistantMessages.length > 0 ? totalResponseTime / assistantMessages.length : 0,
    modelUsage,
    providerUsage
  }
}
```

## Model Mapper (Mapeamento de Modelos)

### Sistema de Mapeamento

```typescript
// lib/utils/model-mapper.ts

/**
 * Mapeamento de nomes de modelos do frontend para nomes da API
 */
const modelMappings: Record<string, string> = {
  // OpenAI
  'chatgpt-4o': 'gpt-4o',
  'chatgpt-4o-mini': 'gpt-4o-mini',
  'chatgpt-4-turbo': 'gpt-4-turbo',
  'chatgpt-4': 'gpt-4',
  'chatgpt-3.5-turbo': 'gpt-3.5-turbo',
  'chatgpt-3.5': 'gpt-3.5-turbo',
  
  // Anthropic
  'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
  'claude-3-opus': 'claude-3-opus-20240229',
  'claude-3-sonnet': 'claude-3-sonnet-20240229',
  'claude-3-haiku': 'claude-3-haiku-20240307',
  'claude-2.1': 'claude-2.1',
  'claude-2': 'claude-2.0',
  
  // Google
  'gemini-pro': 'gemini-1.5-pro',
  'gemini-flash': 'gemini-1.5-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-1.0-pro': 'gemini-1.0-pro',
  
  // Meta (via Hugging Face ou outras APIs)
  'llama-3.1-405b': 'meta-llama/Meta-Llama-3.1-405B-Instruct',
  'llama-3.1-70b': 'meta-llama/Meta-Llama-3.1-70B-Instruct',
  'llama-3.1-8b': 'meta-llama/Meta-Llama-3.1-8B-Instruct',
  'llama-2-70b': 'meta-llama/Llama-2-70b-chat-hf',
  'llama-2-13b': 'meta-llama/Llama-2-13b-chat-hf',
  
  // Mistral
  'mistral-large': 'mistral-large-latest',
  'mistral-medium': 'mistral-medium-latest',
  'mistral-small': 'mistral-small-latest',
  'mixtral-8x7b': 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  
  // Cohere
  'command-r-plus': 'command-r-plus',
  'command-r': 'command-r',
  'command': 'command',
  
  // Outros modelos mantêm o nome original
}

/**
 * Mapear nome do modelo do frontend para nome da API
 */
export function mapToApiModelName(frontendModelName: string): string {
  const mappedName = modelMappings[frontendModelName]
  
  if (mappedName) {
    console.log(`🔄 Mapeando modelo: ${frontendModelName} → ${mappedName}`)
    return mappedName
  }
  
  console.log(`ℹ️ Modelo não mapeado, usando nome original: ${frontendModelName}`)
  return frontendModelName
}

/**
 * Mapear nome da API para nome do frontend (reverso)
 */
export function mapFromApiModelName(apiModelName: string): string {
  const reverseMapping = Object.entries(modelMappings).find(
    ([_, apiName]) => apiName === apiModelName
  )
  
  return reverseMapping ? reverseMapping[0] : apiModelName
}

/**
 * Obter provedor baseado no modelo
 */
export function getProviderFromModel(modelName: string): string {
  const apiModelName = mapToApiModelName(modelName)
  
  if (apiModelName.startsWith('gpt-') || apiModelName.startsWith('chatgpt-')) {
    return 'openai'
  }
  
  if (apiModelName.startsWith('claude-')) {
    return 'anthropic'
  }
  
  if (apiModelName.startsWith('gemini-')) {
    return 'google'
  }
  
  if (apiModelName.includes('llama') || apiModelName.includes('meta-')) {
    return 'meta'
  }
  
  if (apiModelName.startsWith('mistral') || apiModelName.includes('mixtral')) {
    return 'mistral'
  }
  
  if (apiModelName.startsWith('command')) {
    return 'cohere'
  }
  
  return 'unknown'
}

/**
 * Validar se modelo é suportado
 */
export function isModelSupported(modelName: string): boolean {
  const apiModelName = mapToApiModelName(modelName)
  const provider = getProviderFromModel(modelName)
  
  // Lista de provedores suportados
  const supportedProviders = ['openai', 'anthropic', 'google', 'meta', 'mistral', 'cohere']
  
  return supportedProviders.includes(provider)
}

/**
 * Obter configurações padrão para um modelo
 */
export function getModelDefaults(modelName: string): {
  temperature: number
  maxTokens: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
} {
  const provider = getProviderFromModel(modelName)
  
  switch (provider) {
    case 'openai':
      return {
        temperature: 0.7,
        maxTokens: 4000,
        topP: 1.0,
        frequencyPenalty: 0,
        presencePenalty: 0
      }
    
    case 'anthropic':
      return {
        temperature: 0.7,
        maxTokens: 4000
      }
    
    case 'google':
      return {
        temperature: 0.7,
        maxTokens: 4000,
        topP: 1.0
      }
    
    default:
      return {
        temperature: 0.7,
        maxTokens: 4000
      }
  }
}
```

## Configuração e Ambiente

### Config Service

```typescript
// lib/config.ts

interface Config {
  apiBaseUrl: string
  environment: 'development' | 'production' | 'test'
  features: {
    offlineMode: boolean
    debugMode: boolean
    analytics: boolean
  }
  limits: {
    maxMessageLength: number
    maxConversations: number
    maxMessagesPerConversation: number
  }
  defaultSettings: {
    model: string
    provider: string
    temperature: number
    maxTokens: number
  }
}

const config: Config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  environment: (process.env.NODE_ENV as any) || 'development',
  
  features: {
    offlineMode: process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true',
    debugMode: process.env.NODE_ENV === 'development',
    analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
  },
  
  limits: {
    maxMessageLength: parseInt(process.env.NEXT_PUBLIC_MAX_MESSAGE_LENGTH || '4000'),
    maxConversations: parseInt(process.env.NEXT_PUBLIC_MAX_CONVERSATIONS || '100'),
    maxMessagesPerConversation: parseInt(process.env.NEXT_PUBLIC_MAX_MESSAGES_PER_CONVERSATION || '1000')
  },
  
  defaultSettings: {
    model: 'gpt-4o', // Corrigido de 'chatgpt-4o'
    provider: 'openai',
    temperature: 0.7,
    maxTokens: 4000
  }
}

export default config

/**
 * Validar configuração
 */
export function validateConfig(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validações obrigatórias
  if (!config.apiBaseUrl) {
    errors.push('API_BASE_URL não configurada')
  }
  
  if (config.limits.maxMessageLength < 100) {
    errors.push('MAX_MESSAGE_LENGTH muito baixo (mínimo: 100)')
  }
  
  // Validações de aviso
  if (config.environment === 'production' && config.features.debugMode) {
    warnings.push('Debug mode ativo em produção')
  }
  
  if (!config.features.offlineMode && !navigator.onLine) {
    warnings.push('Modo offline desabilitado mas sem conexão')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
```

## Sistema de Fallbacks

### Implementação de Fallbacks

```typescript
// lib/services/fallback-system.ts

interface FallbackOptions {
  maxRetries: number
  retryDelay: number
  fallbackEndpoints: string[]
  offlineMode: boolean
}

class FallbackSystem {
  private options: FallbackOptions
  
  constructor(options: Partial<FallbackOptions> = {}) {
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      fallbackEndpoints: ['/llm/chat', '/chat'],
      offlineMode: true,
      ...options
    }
  }
  
  /**
   * Executar com fallbacks
   */
  async executeWithFallback<T>(
    primaryFunction: () => Promise<T>,
    fallbackFunctions: (() => Promise<T>)[] = [],
    offlineFallback?: () => T
  ): Promise<T> {
    // Tentar função principal
    try {
      return await this.retry(primaryFunction)
    } catch (primaryError) {
      console.warn('❌ Função principal falhou:', primaryError)
      
      // Tentar fallbacks
      for (let i = 0; i < fallbackFunctions.length; i++) {
        try {
          console.log(`🔄 Tentando fallback ${i + 1}...`)
          return await this.retry(fallbackFunctions[i])
        } catch (fallbackError) {
          console.warn(`❌ Fallback ${i + 1} falhou:`, fallbackError)
        }
      }
      
      // Último recurso: modo offline
      if (this.options.offlineMode && offlineFallback) {
        console.log('🔌 Usando modo offline...')
        return offlineFallback()
      }
      
      throw new Error('Todas as tentativas falharam')
    }
  }
  
  /**
   * Retry com delay exponencial
   */
  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any
    
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (attempt < this.options.maxRetries) {
          const delay = this.options.retryDelay * Math.pow(2, attempt - 1)
          console.log(`⏳ Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError
  }
}

export const fallbackSystem = new FallbackSystem()
``` 