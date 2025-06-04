/**
 * Serviço de API centralizado
 * Gerencia toda comunicação HTTP com o backend
 */

import { config, getApiUrl } from './config'
import type {
  ApiResponse,
  ApiError,
  ApiRequestOptions,
  HttpError,
  RequestInterceptor,
  ResponseInterceptor,
  CacheEntry,
  CacheConfig,
  QueryParams,
  RequestBody,
  HttpMethod,
} from './types/api'

/**
 * Classe principal para comunicação com a API
 */
export class ApiService {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private cache = new Map<string, CacheEntry>()
  private cacheConfig: CacheConfig = {
    ttl: config.cache.cacheExpiration,
    maxSize: 100,
    enabled: true,
  }

  constructor() {
    this.baseUrl = config.apiBaseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Adiciona interceptador de request
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Adiciona interceptador de response
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Configura cache
   */
  configurateCache(config: CacheConfig): void {
    this.cacheConfig = { ...this.cacheConfig, ...config }
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Gera chave de cache
   */
  private getCacheKey(url: string, options?: ApiRequestOptions): string {
    const method = options?.method || 'GET'
    const body = options?.body ? JSON.stringify(options.body) : ''
    return `${method}:${url}:${body}`
  }

  /**
   * Verifica se item está no cache e é válido
   */
  private getCachedData<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null

    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Adiciona item ao cache
   */
  private setCachedData<T>(key: string, data: T): void {
    if (!this.cacheConfig.enabled) return

    // Remove itens antigos se cache estiver cheio
    if (this.cache.size >= (this.cacheConfig.maxSize || 100)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (this.cacheConfig.ttl || 300000),
    }

    this.cache.set(key, entry)
  }

  /**
   * Aplica interceptadores de request
   */
  private async applyRequestInterceptors(options: RequestInit): Promise<RequestInit> {
    let config = { ...options }

    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onRequest) {
        try {
          config = await interceptor.onRequest(config)
        } catch (error) {
          if (interceptor.onRequestError) {
            throw await interceptor.onRequestError(error as Error)
          }
          throw error
        }
      }
    }

    return config
  }

  /**
   * Aplica interceptadores de response
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let result = response

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onResponse) {
        try {
          result = await interceptor.onResponse(result)
        } catch (error) {
          if (interceptor.onResponseError) {
            throw await interceptor.onResponseError(error as HttpError)
          }
          throw error
        }
      }
    }

    return result
  }

  /**
   * Constrói URL com query parameters
   */
  private buildUrl(endpoint: string, params?: QueryParams): string {
    const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint)
    
    if (!params) return url

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  /**
   * Executa request com retry automático
   */
  private async executeWithRetry<T>(
    url: string,
    options: ApiRequestOptions,
    attempt = 1
  ): Promise<T> {
    const maxRetries = options.retries || config.api.retryAttempts
    const retryDelay = options.retryDelay || config.api.retryDelay

    try {
      return await this.executeRequest<T>(url, options)
    } catch (error) {
      const httpError = error as HttpError

      // Não fazer retry para erros 4xx (exceto 408, 429)
      if (httpError.status >= 400 && httpError.status < 500) {
        if (httpError.status !== 408 && httpError.status !== 429) {
          throw error
        }
      }

      if (attempt >= maxRetries) {
        throw error
      }

      // Aguarda antes do próximo retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))

      return this.executeWithRetry<T>(url, options, attempt + 1)
    }
  }

  /**
   * Executa request HTTP
   */
  private async executeRequest<T>(url: string, options: ApiRequestOptions): Promise<T> {
    const timeout = options.timeout || config.api.timeout

    // Configura timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // Prepara opções do request
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      }

      // Aplica interceptadores de request
      const finalOptions = await this.applyRequestInterceptors(requestOptions)

      // Executa request
      const response = await fetch(url, finalOptions)

      // Aplica interceptadores de response
      const finalResponse = await this.applyResponseInterceptors(response)

      // Verifica se response é ok
      if (!finalResponse.ok) {
        const errorData = await this.parseErrorResponse(finalResponse)
        const error: HttpError = new Error(errorData.message) as HttpError
        error.status = finalResponse.status
        error.statusText = finalResponse.statusText
        error.data = errorData
        throw error
      }

      // Parse da resposta
      const data = await this.parseResponse<T>(finalResponse)
      return data

    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Parse da resposta de sucesso
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const json = await response.json()
      
      // Se a resposta segue o padrão ApiResponse
      if (json && typeof json === 'object' && 'data' in json) {
        return json.data as T
      }
      
      return json as T
    }

    if (contentType?.includes('text/')) {
      return (await response.text()) as unknown as T
    }

    return (await response.blob()) as unknown as T
  }

  /**
   * Parse da resposta de erro
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const json = await response.json()
      return {
        message: json.message || json.detail || response.statusText,
        code: json.code,
        details: json.details,
        timestamp: new Date().toISOString(),
      }
    } catch {
      return {
        message: response.statusText || 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Request genérico
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const method = options.method || 'GET'
    const url = this.buildUrl(endpoint, options.method === 'GET' ? options.params : undefined)
    const cacheKey = this.getCacheKey(url, options)

    // Verifica cache para requests GET
    if (method === 'GET' && !options.skipAuth) {
      const cachedData = this.getCachedData<T>(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    // Executa request
    const data = await this.executeWithRetry<T>(url, options)

    // Adiciona ao cache se for GET
    if (method === 'GET' && !options.skipAuth) {
      this.setCachedData(cacheKey, data)
    }

    return data
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: QueryParams, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
      params,
    })
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: RequestBody, options?: Omit<ApiRequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: RequestBody, options?: Omit<ApiRequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: RequestBody, options?: Omit<ApiRequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * Upload de arquivo
   */
  async upload<T = any>(endpoint: string, file: File, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type para permitir que o browser defina o boundary
        ...options?.headers,
        'Content-Type': undefined as any,
      },
    })
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get(config.endpoints.health, undefined, { timeout: 5000, retries: 1 })
      return true
    } catch {
      return false
    }
  }
}

// Instância singleton do serviço de API
export const apiService = new ApiService()

// Configuração de interceptadores de autenticação
apiService.addRequestInterceptor({
  onRequest: async (config) => {
    // Adiciona token de autenticação se disponível
    const token = localStorage.getItem(config.auth.tokenKey)
    if (token && !config.headers?.skipAuth) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    return config
  },
})

apiService.addResponseInterceptor({
  onResponseError: async (error) => {
    // Handle token expiration
    if (error.status === 401) {
      // Remove token inválido
      localStorage.removeItem(config.auth.tokenKey)
      localStorage.removeItem(config.auth.refreshTokenKey)
      localStorage.removeItem(config.auth.userKey)
      
      // Redireciona para login se não estiver na página de login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    return error
  },
})

export default apiService

