/**
 * Tipos para autenticação
 * Define interfaces para usuário, contexto de auth e dados de registro
 */

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
  isEmailVerified: boolean
  role?: 'user' | 'admin' | 'premium'
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
    language?: string
    notifications?: boolean
  }
}

export interface LoginData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
  message?: string
}

export interface AuthContextType {
  // Estado do usuário
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  
  // Métodos de autenticação
  login: (data: LoginData) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  logout: () => Promise<void>
  
  // Métodos de gerenciamento
  refreshAccessToken: () => Promise<string | null>
  updateUser: (data: Partial<AuthUser>) => Promise<AuthUser>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  
  // Métodos de verificação
  verifyEmail: (token: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  
  // Métodos utilitários
  checkAuthStatus: () => Promise<boolean>
  clearAuthData: () => void
}

export interface AuthError {
  code: string
  message: string
  field?: string
  details?: any
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  isInitialized: boolean
  error: AuthError | null
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser; tokens: AuthTokens } }
  | { type: 'AUTH_ERROR'; payload: AuthError }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_REFRESH_TOKEN'; payload: string }
  | { type: 'AUTH_UPDATE_USER'; payload: AuthUser }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_INITIALIZE' }

// Tipos para validação
export interface LoginValidation {
  email: string[]
  password: string[]
}

export interface RegisterValidation {
  name: string[]
  email: string[]
  password: string[]
  confirmPassword: string[]
  acceptTerms: string[]
}

// Tipos para hooks
export interface UseAuthReturn extends AuthContextType {
  error: AuthError | null
  clearError: () => void
}

export interface UseLoginReturn {
  login: (data: LoginData) => Promise<void>
  isLoading: boolean
  error: AuthError | null
  clearError: () => void
}

export interface UseRegisterReturn {
  register: (data: RegisterData) => Promise<void>
  isLoading: boolean
  error: AuthError | null
  clearError: () => void
}

// Tipos para persistência
export interface AuthStorage {
  getToken: () => string | null
  setToken: (token: string) => void
  getRefreshToken: () => string | null
  setRefreshToken: (token: string) => void
  getUser: () => AuthUser | null
  setUser: (user: AuthUser) => void
  clear: () => void
}

// Tipos para configuração
export interface AuthConfig {
  apiBaseUrl: string
  tokenKey: string
  refreshTokenKey: string
  userKey: string
  tokenExpirationBuffer: number
  autoRefresh: boolean
  persistAuth: boolean
}

export default {
  AuthUser,
  LoginData,
  RegisterData,
  AuthTokens,
  AuthResponse,
  AuthContextType,
  AuthError,
  AuthState,
  AuthAction,
  LoginValidation,
  RegisterValidation,
  UseAuthReturn,
  UseLoginReturn,
  UseRegisterReturn,
  AuthStorage,
  AuthConfig,
}

