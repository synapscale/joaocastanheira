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
  private readonly tokenKey: string
  private readonly refreshTokenKey: string
  private readonly userKey: string

  constructor() {
    // Garante compatibilidade tanto com config.ts (que possui config.auth) quanto
    // com possíveis versões alternativas do arquivo de configuração que
    // armazenem as chaves de autenticação no nível raiz.
    const authConfig = (config as any)?.auth ?? {}

    this.tokenKey =
      authConfig.tokenKey ?? (config as any)?.jwtStorageKey ?? 'synapse_auth_token'

    this.refreshTokenKey =
      authConfig.refreshTokenKey ?? (config as any)?.refreshTokenKey ?? 'synapse_refresh_token'

    // A chave do usuário só existe no objeto aninhado `auth` na configuração
    // "padrão". Caso não exista, usa-se um valor de fallback estático.
    this.userKey = authConfig.userKey ?? 'synapse_user'
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.tokenKey)
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.tokenKey, token)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.refreshTokenKey)
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.refreshTokenKey, token)
  }

  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem(this.userKey)
    return userData ? JSON.parse(userData) : null
  }

  setUser(user: AuthUser): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
    localStorage.removeItem(this.userKey)
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
   * Normaliza a resposta do backend para o formato padrão AuthResponse
   */
  private normalizeAuthResponse(raw: any): AuthResponse {
    // Caso já esteja no formato esperado
    if (raw && raw.tokens && raw.tokens.accessToken) {
      if (!raw.user) throw new Error('Resposta do backend não contém usuário.')
      return raw
    }
    // Caso venha no formato OAuth2/FastAPI
    if (raw && raw.access_token && raw.refresh_token && raw.user) {
      return {
        tokens: {
          accessToken: raw.access_token,
          refreshToken: raw.refresh_token,
          tokenType: raw.token_type || 'Bearer',
          expiresIn: raw.expires_in || 0,
        },
        user: raw.user,
      }
    }
    // Caso venha só tokens (sem user)
    if (raw && raw.access_token && raw.refresh_token) {
      throw new Error('Resposta do backend não contém usuário.')
    }
    // Log para debug
    console.error('Formato de resposta de autenticação desconhecido:', raw)
    throw new Error('Formato de resposta de autenticação desconhecido: ' + JSON.stringify(raw))
  }

  /**
   * Realiza login do usuário
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      let response: any

      // Monta corpo OAuth2 form-urlencoded uma única vez
      const params = new URLSearchParams()
      params.append('grant_type', 'password')
      params.append('username', data.email)
      params.append('password', data.password)
      params.append('scope', '')
      params.append('client_id', 'string')
      params.append('client_secret', 'string')

      try {
        response = await apiService.request(
          config.endpoints.auth.login,
          {
            method: 'POST',
            body: params,
            skipAuth: true,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      } catch (error: any) {
        // Endpoint não encontrado? tenta rota legada /auth/login
        if (error?.status === 404) {
          response = await apiService.request(
            '/auth/login',
            {
              method: 'POST',
              body: params,
              skipAuth: true,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          )
        } else {
          throw error
        }
      }

      // Normaliza resposta para AuthResponse
      const normalized = this.normalizeAuthResponse(response)
      this.storage.setToken(normalized.tokens.accessToken)
      this.storage.setRefreshToken(normalized.tokens.refreshToken)
      this.storage.setUser(normalized.user)

      return normalized
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
      return new Error(this.extractErrorMessage(error.data?.message || error.message || error))
    }
    
    if (error?.status === 429) {
      return new Error('Muitas tentativas. Tente novamente mais tarde.')
    }
    
    if (error?.status >= 500) {
      return new Error('Erro interno do servidor. Tente novamente mais tarde.')
    }
    
    return new Error(this.extractErrorMessage(error?.message || error))
  }

  /**
   * Converte diferentes formatos de mensagem de erro (string, objeto, array)
   * em uma string legível.
   */
  private extractErrorMessage(raw: unknown): string {
    if (!raw) return 'Erro de autenticação'

    // Se for já string, retorna
    if (typeof raw === 'string') return raw

    // Se for array, concatena mensagens
    if (Array.isArray(raw)) {
      return raw
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object') {
            return (item as any).message || JSON.stringify(item)
          }
          return String(item)
        })
        .join(', ')
    }

    // Se for objeto, tenta pegar propriedade message ou serializa
    if (typeof raw === 'object') {
      return (raw as any).message || JSON.stringify(raw)
    }

    // Fallback genérico
    return String(raw)
  }
}

// Instância singleton do serviço de autenticação
export const authService = new AuthService()

export default authService

