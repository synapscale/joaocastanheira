/**
 * Serviço de LLM Services - Gerencia integrações com modelos de linguagem
 * Integração completa com a API real de LLM services
 */

import { apiService } from '../api/service'
import type {
  LLMService,
  LLMServiceCreate,
  LLMServiceUpdate,
  LLMServiceFilters,
  LLMProvider,
  LLMModel,
  LLMUsage,
  LLMCompletion,
  LLMCompletionRequest
} from '../api/openapi-types'

export interface LLMServiceResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
  filters_applied: LLMServiceFilters
}

export interface LLMServiceStats {
  total_services: number
  active_services: number
  total_requests: number
  total_tokens_used: number
  total_cost: number
  popular_providers: Array<{
    provider: string
    service_count: number
    usage_percentage: number
  }>
  popular_models: Array<{
    model: string
    provider: string
    requests: number
    tokens: number
  }>
  usage_by_date: Array<{
    date: string
    requests: number
    tokens: number
    cost: number
  }>
}

export interface LLMTestResult {
  service_id: string
  success: boolean
  response_time_ms: number
  response?: any
  error?: string
  tokens_used?: number
  cost?: number
  timestamp: string
}

export interface LLMBenchmarkResult {
  service_id: string
  provider: string
  model: string
  benchmark_type: 'quality' | 'speed' | 'cost'
  score: number
  metrics: {
    average_response_time: number
    success_rate: number
    cost_per_token: number
    quality_metrics?: {
      accuracy: number
      coherence: number
      relevance: number
    }
  }
  test_cases: number
  timestamp: string
}

/**
 * Classe principal do serviço de LLM Services
 */
export class LLMServicesService {
  /**
   * Buscar serviços de LLM configurados
   */
  async getLLMServices(filters?: LLMServiceFilters): Promise<LLMServiceResponse<LLMService>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters?.provider) queryParams.append('provider', filters.provider)
      if (filters?.model) queryParams.append('model', filters.model)
      if (filters?.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString())
      if (filters?.search) queryParams.append('search', filters.search)
      if (filters?.sort_by) queryParams.append('sort_by', filters.sort_by)
      if (filters?.sort_order) queryParams.append('sort_order', filters.sort_order)
      if (filters?.page) queryParams.append('page', filters.page.toString())
      if (filters?.size) queryParams.append('size', filters.size.toString())
      if (filters?.workspace_id) queryParams.append('workspace_id', filters.workspace_id)

      const queryString = queryParams.toString()
      const endpoint = queryString ? `/llm-services/?${queryString}` : '/llm-services/'

      return await apiService.get<LLMServiceResponse<LLMService>>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar serviços de LLM')
    }
  }

  /**
   * Obter um serviço de LLM específico
   */
  async getLLMService(serviceId: string): Promise<LLMService> {
    try {
      return await apiService.get<LLMService>(`/llm-services/${serviceId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar serviço de LLM')
    }
  }

  /**
   * Criar um novo serviço de LLM
   */
  async createLLMService(serviceData: LLMServiceCreate): Promise<LLMService> {
    try {
      return await apiService.post<LLMService>('/llm-services/', serviceData)
    } catch (error) {
      throw this.handleError(error, 'Erro ao criar serviço de LLM')
    }
  }

  /**
   * Atualizar serviço de LLM existente
   */
  async updateLLMService(serviceId: string, serviceData: LLMServiceUpdate): Promise<LLMService> {
    try {
      return await apiService.put<LLMService>(`/llm-services/${serviceId}`, serviceData)
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar serviço de LLM')
    }
  }

  /**
   * Excluir serviço de LLM
   */
  async deleteLLMService(serviceId: string): Promise<void> {
    try {
      await apiService.delete(`/llm-services/${serviceId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao excluir serviço de LLM')
    }
  }

  /**
   * Ativar/desativar serviço de LLM
   */
  async toggleLLMService(serviceId: string, isActive: boolean): Promise<LLMService> {
    try {
      return await apiService.put<LLMService>(`/llm-services/${serviceId}/toggle`, {
        is_active: isActive
      })
    } catch (error) {
      throw this.handleError(error, 'Erro ao alterar status do serviço')
    }
  }

  /**
   * Testar conexão com serviço de LLM
   */
  async testLLMService(serviceId: string, testData?: {
    prompt?: string
    max_tokens?: number
    temperature?: number
  }): Promise<LLMTestResult> {
    try {
      const payload = {
        prompt: testData?.prompt || 'Hello, this is a test message. Please respond.',
        max_tokens: testData?.max_tokens || 100,
        temperature: testData?.temperature || 0.7
      }

      return await apiService.post<LLMTestResult>(`/llm-services/${serviceId}/test`, payload)
    } catch (error) {
      throw this.handleError(error, 'Erro ao testar serviço de LLM')
    }
  }

  /**
   * Fazer uma chamada de completion
   */
  async createCompletion(serviceId: string, request: LLMCompletionRequest): Promise<LLMCompletion> {
    try {
      return await apiService.post<LLMCompletion>(`/llm-services/${serviceId}/completion`, request)
    } catch (error) {
      throw this.handleError(error, 'Erro ao executar completion')
    }
  }

  /**
   * Fazer uma chamada de completion com streaming
   */
  async createStreamingCompletion(
    serviceId: string, 
    request: LLMCompletionRequest,
    onChunk: (chunk: string) => void,
    onError?: (error: any) => void,
    onComplete?: (completion: LLMCompletion) => void
  ): Promise<void> {
    try {
      // Usar o método getBlob do apiService para streaming
      const response = await fetch(`/llm-services/${serviceId}/completion/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getAccessToken()}`
        },
        body: JSON.stringify({ ...request, stream: true })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Streaming não suportado')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let completion: LLMCompletion | null = null

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              if (completion && onComplete) {
                onComplete(completion)
              }
              return
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'chunk') {
                onChunk(parsed.content)
              } else if (parsed.type === 'completion') {
                completion = parsed.data
              }
            } catch (e) {
              console.warn('Erro ao parsear chunk SSE:', e)
            }
          }
        }
      }
    } catch (error) {
      if (onError) {
        onError(error)
      } else {
        throw this.handleError(error, 'Erro no streaming completion')
      }
    }
  }

  /**
   * Obter provedores de LLM disponíveis
   */
  async getLLMProviders(): Promise<LLMProvider[]> {
    try {
      return await apiService.get<LLMProvider[]>('/llm-services/providers')
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar provedores de LLM')
    }
  }

  /**
   * Obter modelos disponíveis para um provedor
   */
  async getProviderModels(provider: string): Promise<LLMModel[]> {
    try {
      return await apiService.get<LLMModel[]>(`/llm-services/providers/${provider}/models`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar modelos do provedor')
    }
  }

  /**
   * Obter uso de serviços de LLM
   */
  async getLLMUsage(params?: {
    service_id?: string
    start_date?: string
    end_date?: string
    group_by?: 'day' | 'week' | 'month'
    workspace_id?: string
  }): Promise<LLMUsage> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.service_id) queryParams.append('service_id', params.service_id)
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.group_by) queryParams.append('group_by', params.group_by)
      if (params?.workspace_id) queryParams.append('workspace_id', params.workspace_id)

      const queryString = queryParams.toString()
      const endpoint = `/llm-services/usage${queryString ? '?' + queryString : ''}`

      return await apiService.get<LLMUsage>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar uso de LLM')
    }
  }

  /**
   * Obter estatísticas de serviços de LLM
   */
  async getLLMStats(params?: {
    start_date?: string
    end_date?: string
    workspace_id?: string
  }): Promise<LLMServiceStats> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.workspace_id) queryParams.append('workspace_id', params.workspace_id)

      const queryString = queryParams.toString()
      const endpoint = `/llm-services/stats${queryString ? '?' + queryString : ''}`

      return await apiService.get<LLMServiceStats>(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar estatísticas de LLM')
    }
  }

  /**
   * Executar benchmark de serviços
   */
  async runBenchmark(params: {
    service_ids?: string[]
    benchmark_type: 'quality' | 'speed' | 'cost' | 'all'
    test_prompts?: string[]
    max_tokens?: number
    temperature?: number
  }): Promise<{
    benchmark_id: string
    status: 'running' | 'completed' | 'failed'
    results?: LLMBenchmarkResult[]
    estimated_completion?: string
  }> {
    try {
      return await apiService.post('/llm-services/benchmark', params)
    } catch (error) {
      throw this.handleError(error, 'Erro ao executar benchmark')
    }
  }

  /**
   * Obter resultados de benchmark
   */
  async getBenchmarkResults(benchmarkId: string): Promise<{
    benchmark_id: string
    status: 'running' | 'completed' | 'failed'
    progress?: number
    results: LLMBenchmarkResult[]
    summary?: {
      best_overall: string
      best_quality: string
      best_speed: string
      best_cost: string
    }
    created_at: string
    completed_at?: string
  }> {
    try {
      return await apiService.get(`/llm-services/benchmark/${benchmarkId}`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar resultados do benchmark')
    }
  }

  /**
   * Validar configuração de serviço
   */
  async validateServiceConfig(config: Partial<LLMServiceCreate>): Promise<{
    is_valid: boolean
    errors?: string[]
    warnings?: string[]
    suggestions?: string[]
    estimated_cost?: {
      per_1k_tokens: number
      per_request: number
    }
  }> {
    try {
      return await apiService.post('/llm-services/validate-config', config)
    } catch (error) {
      throw this.handleError(error, 'Erro ao validar configuração')
    }
  }

  /**
   * Obter templates de configuração para provedores
   */
  async getConfigTemplates(): Promise<Array<{
    provider: string
    template_name: string
    description: string
    config_template: any
    required_fields: string[]
    optional_fields: string[]
    examples: any[]
  }>> {
    try {
      return await apiService.get('/llm-services/config-templates')
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar templates de configuração')
    }
  }

  /**
   * Duplicar serviço existente
   */
  async duplicateService(serviceId: string, newConfig?: {
    name?: string
    description?: string
    workspace_id?: string
  }): Promise<LLMService> {
    try {
      return await apiService.post<LLMService>(`/llm-services/${serviceId}/duplicate`, newConfig || {})
    } catch (error) {
      throw this.handleError(error, 'Erro ao duplicar serviço')
    }
  }

  /**
   * Obter logs de um serviço
   */
  async getServiceLogs(serviceId: string, params?: {
    start_date?: string
    end_date?: string
    level?: 'debug' | 'info' | 'warning' | 'error'
    page?: number
    size?: number
  }): Promise<{
    logs: Array<{
      id: string
      timestamp: string
      level: string
      message: string
      request_id?: string
      metadata?: any
    }>
    total: number
    page: number
    size: number
  }> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.level) queryParams.append('level', params.level)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.size) queryParams.append('size', params.size.toString())

      const queryString = queryParams.toString()
      const endpoint = `/llm-services/${serviceId}/logs${queryString ? '?' + queryString : ''}`

      return await apiService.get(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar logs do serviço')
    }
  }

  /**
   * Obter métricas de performance de um serviço
   */
  async getServiceMetrics(serviceId: string, params?: {
    start_date?: string
    end_date?: string
    granularity?: 'hour' | 'day' | 'week'
  }): Promise<{
    response_times: Array<{
      timestamp: string
      avg_response_time: number
      p95_response_time: number
      p99_response_time: number
    }>
    error_rates: Array<{
      timestamp: string
      total_requests: number
      error_count: number
      error_rate: number
    }>
    token_usage: Array<{
      timestamp: string
      input_tokens: number
      output_tokens: number
      total_tokens: number
      cost: number
    }>
    summary: {
      total_requests: number
      success_rate: number
      avg_response_time: number
      total_tokens: number
      total_cost: number
    }
  }> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.granularity) queryParams.append('granularity', params.granularity)

      const queryString = queryParams.toString()
      const endpoint = `/llm-services/${serviceId}/metrics${queryString ? '?' + queryString : ''}`

      return await apiService.get(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar métricas do serviço')
    }
  }

  /**
   * Resetar chave de API de um serviço
   */
  async resetServiceApiKey(serviceId: string): Promise<{
    message: string
    new_key_preview: string
  }> {
    try {
      return await apiService.post(`/llm-services/${serviceId}/reset-api-key`)
    } catch (error) {
      throw this.handleError(error, 'Erro ao resetar chave de API')
    }
  }

  /**
   * [ADMIN] Obter todos os serviços da plataforma
   */
  async getAllPlatformServices(params?: {
    page?: number
    size?: number
    workspace_id?: string
    provider?: string
    status?: 'active' | 'inactive' | 'error'
  }): Promise<LLMServiceResponse<LLMService & {
    workspace_name: string
    user_name: string
    total_requests: number
    last_used: string
  }>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.size) queryParams.append('size', params.size.toString())
      if (params?.workspace_id) queryParams.append('workspace_id', params.workspace_id)
      if (params?.provider) queryParams.append('provider', params.provider)
      if (params?.status) queryParams.append('status', params.status)

      const queryString = queryParams.toString()
      const endpoint = `/llm-services/admin/all${queryString ? '?' + queryString : ''}`

      return await apiService.get(endpoint)
    } catch (error) {
      throw this.handleError(error, 'Erro ao carregar todos os serviços')
    }
  }

  /**
   * Tratar erros de API com mensagens mais específicas
   */
  private handleError(error: any, defaultMessage: string): Error {
    console.error('LLMServicesService error:', error)
    
    // Erro de autenticação
    if (error?.status === 401) {
      return new Error('Você precisa estar logado para acessar serviços de LLM.')
    }
    
    // Erro de autorização
    if (error?.status === 403) {
      return new Error('Você não tem permissão para realizar esta ação.')
    }
    
    // Erro de recurso não encontrado
    if (error?.status === 404) {
      return new Error('Serviço de LLM não encontrado.')
    }
    
    // Erro de validação
    if (error?.status === 422) {
      const details = error?.data?.detail || error?.message || ''
      return new Error(`Configuração inválida: ${details}`)
    }
    
    // Erro de cota/limite
    if (error?.status === 429) {
      return new Error('Limite de uso atingido. Tente novamente em alguns minutos.')
    }
    
    // Erro de servidor
    if (error?.status >= 500) {
      return new Error('Erro interno do servidor. Tente novamente em alguns minutos.')
    }
    
    // Erro de rede
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('conectar ao servidor')) {
      return new Error('Não foi possível conectar ao servidor. Verifique sua conexão de internet.')
    }
    
    // Erro genérico
    const message = error?.message || defaultMessage
    return new Error(message)
  }
}

// Instância singleton do serviço
export const llmServicesService = new LLMServicesService()
export default llmServicesService 