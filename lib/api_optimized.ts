/**
 * Cliente HTTP otimizado para comunicação com o backend
 * Criado por José - O melhor Full Stack do mundo
 * Implementa todas as melhores práticas de comunicação HTTP
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { config } from './config_optimized'

// Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandling?: boolean
  _retry?: boolean
}

// Extend AxiosRequestConfig to include custom properties
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean
    _retry?: boolean
  }
}

class ApiService {
  private client: AxiosInstance
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = this.getToken()
        if (token && !config.skipAuth) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Log in development
        if (this.isDevelopment()) {
          console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }

        return config
      },
      (error) => {
        console.error('❌ Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log in development
        if (this.isDevelopment()) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        }

        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestOptions

        // Try refresh token if 401
        if (error.response?.status === 401 && !originalRequest?.skipAuth && !originalRequest?._retry) {
          if (originalRequest) {
            originalRequest._retry = true

            try {
              const newToken = await this.refreshToken()
              if (newToken && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return this.client(originalRequest)
              }
            } catch (refreshError) {
              // Refresh failed, logout
              this.handleAuthError()
              return Promise.reject(refreshError)
            }
          }
        }

        // Global error handling
        if (!originalRequest?.skipErrorHandling) {
          this.handleApiError(error)
        }

        return Promise.reject(error)
      }
    )
  }

  private isDevelopment(): boolean {
    return config.isDevelopment
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(config.jwtStorageKey)
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(config.refreshTokenKey)
  }

  private setTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(config.jwtStorageKey, accessToken)
    if (refreshToken) {
      localStorage.setItem(config.refreshTokenKey, refreshToken)
    }
  }

  private clearTokens() {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(config.jwtStorageKey)
    localStorage.removeItem(config.refreshTokenKey)
  }

  private async refreshToken(): Promise<string | null> {
    // Avoid multiple simultaneous attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    this.refreshPromise = this.client
      .post('/api/v1/auth/refresh', { refresh_token: refreshToken }, { skipAuth: true } as RequestOptions)
      .then((response) => {
        const { access_token, refresh_token } = response.data
        this.setTokens(access_token, refresh_token)
        return access_token
      })
      .catch((error) => {
        console.error('❌ Refresh token failed:', error)
        this.clearTokens()
        return null
      })
      .finally(() => {
        this.refreshPromise = null
      })

    return this.refreshPromise
  }

  private handleAuthError() {
    this.clearTokens()
    
    // Redirect to login if not on login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }

  private handleApiError(error: AxiosError) {
    const errorData = error.response?.data as any
    const message = errorData?.message || error.message || 'Erro desconhecido'
    
    console.error('❌ API Error:', {
      status: error.response?.status,
      message,
      url: error.config?.url,
    })

    // Emit custom event for components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: {
          status: error.response?.status,
          message,
          url: error.config?.url,
        }
      }))
    }
  }

  // Public methods
  async get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    const response = await this.client.get<T>(url, options)
    return response.data
  }

  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    const response = await this.client.post<T>(url, data, options)
    return response.data
  }

  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    const response = await this.client.put<T>(url, data, options)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    const response = await this.client.patch<T>(url, data, options)
    return response.data
  }

  async delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    const response = await this.client.delete<T>(url, options)
    return response.data
  }

  // Authentication methods
  setAuthTokens(accessToken: string, refreshToken?: string) {
    this.setTokens(accessToken, refreshToken)
  }

  clearAuth() {
    this.clearTokens()
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // File upload
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    return this.client.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { timeout: 5000 })
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
export const apiService = new ApiService()
export default apiService

