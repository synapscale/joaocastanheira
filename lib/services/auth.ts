/**
 * Serviço de autenticação
 * Gerencia todas as operações de autenticação com o backend
 */

import { apiService } from '../api'
import { config } from '../config'
import type {
  AuthUser,
  LoginData,
  RegisterData,
  AuthResponse,
  AuthTokens,
  AuthStorage,
} from '../types/auth'

/**
 * Implementação do storage de autenticação
 */
class AuthStorageImpl implements AuthStorage {
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(config.auth.tokenKey)
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(config.auth.tokenKey, token)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(config.auth.refreshTokenKey)
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(config.auth.refreshTokenKey, token)
  }

  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem(config.auth.userKey)
    return userData ? JSON.parse(userData) : null
  }

  setUser(user: AuthUser): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(config.auth.userKey, JSON.stringify(user))
  }

  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(config.auth.tokenKey)
    localStorage.removeItem(config.auth.refreshTokenKey)
    localStorage.removeItem(config.auth.userKey)
  }
}

/**
 * Classe principal do serviço de autenticação
 */
export class AuthService {
  private storage: AuthStorage

  constructor() {
    this.storage = new AuthStorageImpl()
  }

  /**
   * Realiza login do usuário
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        config.endpoints.auth.login,
        {
          email: data.email,
          password: data.password,
        },
        { skipAuth: true }
      )

      // Salvar tokens e dados do usuário
      this.storage.setToken(response.tokens.accessToken)
      this.storage.setRefreshToken(response.tokens.refreshToken)
      this.storage.setUser(response.user)

      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Realiza registro de novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        config.endpoints.auth.register,
        {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        { skipAuth: true }
      )

      // Salvar tokens e dados do usuário
      this.storage.setToken(response.tokens.accessToken)
      this.storage.setRefreshToken(response.tokens.refreshToken)
      this.storage.setUser(response.user)

      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.storage.getRefreshToken()
      
      if (refreshToken) {
        await apiService.post(config.endpoints.auth.logout, {
          refreshToken,
        })
      }
    } catch (error) {
      // Continua com logout local mesmo se falhar no servidor
      console.warn('Erro ao fazer logout no servidor:', error)
    } finally {
      this.storage.clear()
    }
  }

  /**
   * Atualiza o token de acesso usando refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = this.storage.getRefreshToken()
      
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado')
      }

      const response = await apiService.post<{ accessToken: string; expiresIn: number }>(
        config.endpoints.auth.refresh,
        { refreshToken },
        { skipAuth: true }
      )

      this.storage.setToken(response.accessToken)
      return response.accessToken
    } catch (error) {
      // Se refresh falhar, limpar dados de auth
      this.storage.clear()
      throw this.handleAuthError(error)
    }
  }

  /**
   * Obtém dados do usuário atual
   */
  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await apiService.get<AuthUser>(config.endpoints.auth.me)
      
      // Atualizar dados do usuário no storage
      this.storage.setUser(response)
      
      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Atualiza dados do usuário
   */
  async updateUser(data: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const response = await apiService.put<AuthUser>(
        config.endpoints.auth.me,
        data
      )

      // Atualizar dados do usuário no storage
      this.storage.setUser(response)

      return response
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.post('/api/v1/auth/change-password', {
        currentPassword,
        newPassword,
      })
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Verifica email do usuário
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await apiService.post('/api/v1/auth/verify-email', {
        token,
      }, { skipAuth: true })
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Solicita reset de senha
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiService.post('/api/v1/auth/request-password-reset', {
        email,
      }, { skipAuth: true })
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Reseta senha com token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiService.post('/api/v1/auth/reset-password', {
        token,
        newPassword,
      }, { skipAuth: true })
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = this.storage.getToken()
      
      if (!token) {
        return false
      }

      // Verificar se token ainda é válido
      await this.getCurrentUser()
      return true
    } catch (error) {
      // Token inválido, limpar storage
      this.storage.clear()
      return false
    }
  }

  /**
   * Verifica se token está próximo do vencimento
   */
  isTokenExpiringSoon(): boolean {
    const token = this.storage.getToken()
    
    if (!token) {
      return true
    }

    try {
      // Decodificar JWT para verificar expiração
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Converter para milliseconds
      const currentTime = Date.now()
      const timeUntilExpiration = expirationTime - currentTime
      
      return timeUntilExpiration < config.auth.tokenExpirationBuffer
    } catch (error) {
      // Se não conseguir decodificar, considerar como expirando
      return true
    }
  }

  /**
   * Obtém dados do storage
   */
  getStoredUser(): AuthUser | null {
    return this.storage.getUser()
  }

  getStoredToken(): string | null {
    return this.storage.getToken()
  }

  getStoredRefreshToken(): string | null {
    return this.storage.getRefreshToken()
  }

  /**
   * Limpa dados de autenticação
   */
  clearAuthData(): void {
    this.storage.clear()
  }

  /**
   * Trata erros de autenticação
   */
  private handleAuthError(error: any): Error {
    if (error?.status === 401) {
      this.storage.clear()
      return new Error('Credenciais inválidas')
    }
    
    if (error?.status === 422) {
      return new Error(error.data?.message || 'Dados inválidos')
    }
    
    if (error?.status === 429) {
      return new Error('Muitas tentativas. Tente novamente mais tarde.')
    }
    
    if (error?.status >= 500) {
      return new Error('Erro interno do servidor. Tente novamente mais tarde.')
    }
    
    return new Error(error?.message || 'Erro de autenticação')
  }
}

// Instância singleton do serviço de autenticação
export const authService = new AuthService()

export default authService

