/**
 * Serviço de autenticação
 * Gerencia todas as operações de autenticação com o backend
 */

import { apiService } from '../api/service'
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
      authConfig.tokenKey ?? process.env.NEXT_PUBLIC_JWT_STORAGE_KEY ?? 'synapsefrontend_auth_token'

    this.refreshTokenKey =
      authConfig.refreshTokenKey ?? process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY ?? 'synapsefrontend_refresh_token'

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
    
    // Também definir como cookie para compatibilidade com middleware
    this.setCookie(this.tokenKey, token, 7) // 7 dias
    
    // 🔍 DEBUG: Verificar se o cookie foi definido
    console.log('🔍 AuthStorage - Token salvo em localStorage e cookie:', {
      tokenKey: this.tokenKey,
      tokenLength: token.length,
      cookieAfterSet: document.cookie
    })
    
    // Token salvo diretamente (sem eventos artificiais para evitar loops)
    
    // Verificar se o cookie foi definido corretamente
    setTimeout(() => {
      const cookieValue = this.getCookie(this.tokenKey)
      if (!cookieValue) {
        console.warn('AuthService: Cookie de token não foi definido corretamente')
      }
    }, 10)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.refreshTokenKey)
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.refreshTokenKey, token)
    
    // Também definir como cookie para compatibilidade com middleware
    this.setCookie(this.refreshTokenKey, token, 30) // 30 dias
    
    // Refresh token salvo diretamente (sem eventos artificiais para evitar loops)
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
    
    // Também limpar cookies
    this.deleteCookie(this.tokenKey)
    this.deleteCookie(this.refreshTokenKey)
  }

  /**
   * Obtém um cookie pelo nome
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    
    return null
  }

  /**
   * Define um cookie
   */
  private setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return
    
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    
    // Usar configurações mais específicas para garantir compatibilidade
    const isSecure = window.location.protocol === 'https:'
    const secureFlag = isSecure ? ';Secure' : ''
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureFlag}`
  }

  /**
   * Remove um cookie
   */
  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return
    
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`
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
    
    // Caso venha no formato camelCase (novo formato do backend)
    if (raw && raw.accessToken && raw.user) {
      return {
        tokens: {
          accessToken: raw.accessToken,
          refreshToken: raw.refreshToken,
          tokenType: raw.tokenType || 'Bearer',
          expiresIn: raw.expiresIn || 0,
        },
        user: raw.user,
      }
    }
    
    // Caso venha no formato OAuth2/FastAPI (snake_case)
    if (raw && raw.access_token && raw.refresh_token && raw.user) {
      return {
        tokens: {
          accessToken: raw.access_token,
          refreshToken: raw.refresh_token,
          tokenType: 'Bearer',
          expiresIn: raw.expires_in || 0,
        },
        user: raw.user,
      }
    }
    
    // Caso venha só tokens (sem user)
    if (raw && (raw.access_token || raw.accessToken)) {
      throw new Error('Resposta do backend não contém usuário.')
    }
    
    // Log para debug
    console.error('Formato de resposta de autenticação desconhecido:', raw)
    throw new Error('Formato de resposta de autenticação desconhecido: ' + JSON.stringify(raw))
  }

  /**
   * Converte User do ApiService para AuthUser
   */
  private mapUserToAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.full_name || user.first_name + ' ' + user.last_name || user.email,
      avatar: user.avatar_url,
      createdAt: user.created_at || new Date().toISOString(),
      updatedAt: user.updated_at || new Date().toISOString(),
      isEmailVerified: user.is_verified || false,
      role: user.role === 'admin' ? 'admin' : user.subscription_plan === 'premium' ? 'premium' : 'user',
      preferences: {
        theme: 'system',
        language: 'pt-BR',
        notifications: true,
      },
    }
  }

  /**
   * Realiza login do usuário
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      let response: any

      try {
        // Use the updated ApiService login method which handles the correct format
        response = await apiService.login(data.email, data.password)
      } catch (error: any) {
        // If the main endpoint fails, try the legacy endpoint
        if (error?.status === 404) {
          const formData = new URLSearchParams()
          formData.append('grant_type', 'password')
          formData.append('username', data.email)
          formData.append('password', data.password)
          formData.append('scope', '')
          formData.append('client_id', '')
          formData.append('client_secret', '')

          response = await apiService.request<any>(
            '/auth/login',
            {
              method: 'POST',
              body: formData.toString(),
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

      // Normalize response to AuthResponse
      const normalized = this.normalizeAuthResponse(response)
      this.storage.setToken(normalized.tokens.accessToken)
      this.storage.setRefreshToken(normalized.tokens.refreshToken)
      this.storage.setUser(normalized.user)

      console.log('🔍 DEBUG AuthService.login - Tokens obtidos:', {
        hasAccessToken: !!normalized.tokens.accessToken,
        hasRefreshToken: !!normalized.tokens.refreshToken,
        user: normalized.user.email
      })

      // Sincronizar tokens com o ApiService
      console.log('🔄 Sincronizando tokens com ApiService...')
      apiService.syncTokensWithAuthService(
        normalized.tokens.accessToken,
        normalized.tokens.refreshToken
      )
      
      console.log('✅ Tokens sincronizados - initializeUserData será chamado automaticamente')

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
      // Use the updated ApiService register method
      const user = await apiService.register({
        email: data.email,
        password: data.password,
        username: data.name.toLowerCase().replace(/\s+/g, '_'),
        full_name: data.name,
      })

      // Após registrar, efetuar login para obter tokens
      const loginResponse = await this.login({
        email: data.email,
        password: data.password,
      })

      // O workspace padrão será criado automaticamente pelo ApiService
      // através do initializeUserData() quando os tokens forem sincronizados
      console.log('✅ Registro concluído - workspace será criado automaticamente')

      return loginResponse
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
        await apiService.logout()
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

      const response = await apiService.refreshAccessToken()
      
      if (response) {
        console.log('✅ AuthService: Novo token recebido do refresh, salvando...')
        this.storage.setToken(response.accessToken)
        
        // Salvar também o refresh token se vier na resposta
        if (response.refreshToken) {
          this.storage.setRefreshToken(response.refreshToken)
          console.log('✅ AuthService: Novo refresh token salvo')
        }
        
        // Sincronizar tokens com o ApiService
        apiService.syncTokensWithAuthService()
        console.log('✅ AuthService: Tokens sincronizados com ApiService')
        
        // Verificar se o token foi persistido corretamente
        setTimeout(() => {
          const savedToken = this.storage.getToken()
          console.log('🔍 AuthService: Token salvo no storage:', savedToken ? 'SIM' : 'NÃO')
          console.log('🔍 AuthService: Token length:', savedToken?.length || 0)
        }, 100)
        
        return response.accessToken
      }
      return null
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
      const response = await apiService.getCurrentUser()
      
      // Converter User para AuthUser
      const authUser = this.mapUserToAuthUser(response)
      
      // Atualizar dados do usuário no storage
      this.storage.setUser(authUser)
      
      return authUser
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
      await apiService.post(config.endpoints.auth.changePassword, {
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
      await apiService.post(config.endpoints.auth.verifyEmail, {
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
      await apiService.post(config.endpoints.auth.requestPasswordReset, {
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
      await apiService.post(config.endpoints.auth.resetPassword, {
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

      // Verificar se o token está expirado localmente primeiro
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        const isExpired = payload.exp <= currentTime
        
        if (isExpired) {
          this.storage.clear()
          return false
        }
      } catch (parseError) {
        console.error('AuthService - Erro ao decodificar token:', parseError);
        this.storage.clear()
        return false
      }

      // Verificar com o servidor se possível
      try {
        await apiService.getCurrentUser()
        return true
      } catch (error: any) {
        // Se for erro 401, token inválido
        if (error?.status === 401) {
          this.storage.clear()
          return false
        }
        
        // Para outros erros, assumir que o token local está válido
        // (pode ser problema de conectividade)
        return true
      }
    } catch (error) {
      console.error('AuthService - checkAuthStatus - Erro geral:', error)
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

