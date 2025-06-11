/**
 * Configurações centralizadas da aplicação
 * Gerencia todas as variáveis de ambiente e configurações globais
 */

export const config = {
  // URLs base para comunicação com o backend
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  
  // Ambiente da aplicação
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  
  // Configurações de API
  api: {
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
    retryDelay: 1000, // 1 segundo
  },
  
  // Configurações de WebSocket
  websocket: {
    reconnectAttempts: 5,
    reconnectDelay: 2000, // 2 segundos
    heartbeatInterval: 30000, // 30 segundos
  },
  
  // Configurações de autenticação
  auth: {
    tokenKey: 'synapse_auth_token',
    refreshTokenKey: 'synapse_refresh_token',
    userKey: 'synapse_user',
    tokenExpirationBuffer: 300000, // 5 minutos antes de expirar
    autoRefresh: true,
    persistAuth: true,
  },
  
  // Configurações de cache
  cache: {
    variablesCacheKey: 'synapse_variables_cache',
    cacheExpiration: 300000, // 5 minutos
  },
  
  // Configurações de desenvolvimento
  isDevelopment: process.env.NEXT_PUBLIC_APP_ENV === 'development',
  isProduction: process.env.NEXT_PUBLIC_APP_ENV === 'production',
  
  // URLs completas para endpoints principais
  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      register: '/api/v1/auth/register',
      refresh: '/api/v1/auth/refresh',
      logout: '/api/v1/auth/logout',
      me: '/api/v1/auth/me',
      changePassword: '/api/v1/auth/change-password',
      verifyEmail: '/api/v1/auth/verify-email',
      requestPasswordReset: '/api/v1/auth/request-password-reset',
      resetPassword: '/api/v1/auth/reset-password',
      resendVerification: '/api/v1/auth/resend-verification',
    },
    variables: {
      base: '/api/v1/variables',
      bulk: '/api/v1/variables/bulk',
      import: '/api/v1/variables/import',
      export: '/api/v1/variables/export',
      validate: '/api/v1/variables/validate',
    },
    chat: {
      websocket: '/ws/chat',
      http: '/api/v1/chat',
    },
    workflows: {
      base: '/api/v1/workflows',
      execute: '/api/v1/workflows/execute',
    },
    health: '/health',
  },
} as const

/**
 * Valida se todas as configurações necessárias estão presentes
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.apiBaseUrl) {
    errors.push('NEXT_PUBLIC_API_URL é obrigatório')
  }
  
  if (!config.wsUrl) {
    errors.push('NEXT_PUBLIC_WS_URL é obrigatório')
  }
  
  // Validar formato das URLs
  try {
    new URL(config.apiBaseUrl)
  } catch {
    errors.push('NEXT_PUBLIC_API_URL deve ser uma URL válida')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Retorna a URL completa para um endpoint
 */
export function getApiUrl(endpoint: string): string {
  return `${config.apiBaseUrl}${endpoint}`
}

/**
 * Retorna a URL completa para WebSocket
 */
export function getWsUrl(endpoint: string): string {
  return `${config.wsUrl}${endpoint}`
}

/**
 * Configurações específicas para desenvolvimento
 */
export const devConfig = {
  enableDebugLogs: config.isDevelopment,
  enableMockData: false,
  enablePerformanceMonitoring: config.isDevelopment,
}

export default config

