/**
 * Configurações centralizadas da aplicação
 * Gerencia todas as variáveis de ambiente e configurações globais
 */

import { validateAndPrint } from './validate-env'

// Validar configurações na inicialização (apenas em desenvolvimento)
if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_APP_ENV === 'development') {
  console.log('\n🔍 Validando variáveis de ambiente...')
  validateAndPrint()
}

// Normaliza a URL base e adiciona /api/v1 automaticamente
function normalizeApiBase(raw?: string): string {
  if (!raw) {
    throw new Error('NEXT_PUBLIC_API_URL é obrigatório. Configure esta variável no arquivo .env')
  }

  let url = raw.trim()

  // Remove barra(s) finais
  url = url.replace(/\/+$/, '')

  // Remove sufixo /api ou /api/v{n} se existir (para limpar)
  url = url.replace(/\/api(\/v\d+)?$/, '')

  // Adiciona /api/v1 sempre
  return `${url}/api/v1`
}

export const config = {
  // URLs base para comunicação com o backend
  apiBaseUrl: normalizeApiBase(process.env.NEXT_PUBLIC_API_URL),
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || (() => {
    throw new Error('NEXT_PUBLIC_WS_URL não está definida no arquivo .env')
  })(),
  
  // Ambiente da aplicação
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  
  // Configurações de API
  api: {
    baseUrl: normalizeApiBase(process.env.NEXT_PUBLIC_API_URL),
    timeout: 30000,
    retries: 3,
  },
  
  // Configurações de WebSocket
  websocket: {
    reconnectAttempts: 5,
    reconnectDelay: 2000, // 2 segundos
    heartbeatInterval: 30000, // 30 segundos
  },
  
  // Chat Configuration  
  chat: {
    endpoint: '/llm/chat',
    conversations: '/conversations',
    maxRetries: 3,
    timeout: 30000,
    reconnectInterval: 5000,
  },
  
  // Configurações de autenticação
  auth: {
    tokenKey: 'synapscale_token',
    refreshTokenKey: 'synapscale_refresh_token',
    userKey: 'synapse_user',
    tokenExpirationBuffer: 300000, // 5 minutos antes de expirar
    autoRefresh: true,
    persistAuth: true,
    endpoints: {
      login: '/auth/login',
      register: '/auth/register', 
      refresh: '/auth/refresh',
      logout: '/auth/logout',
      me: '/auth/me',
    }
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
      login: '/auth/login',
      register: '/auth/register',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
      me: '/auth/me',
      changePassword: '/auth/change-password',
      verifyEmail: '/auth/verify-email',
      requestPasswordReset: '/auth/request-password-reset',
      resetPassword: '/auth/reset-password',
      resendVerification: '/auth/resend-verification',
    },
    variables: {
      base: '/user-variables',
      bulk: '/user-variables/bulk',
      import: '/user-variables/import',
      export: '/user-variables/export',
      validate: '/user-variables/validate',
    },
    chat: {
      websocket: '/ws/chat',
      http: '/llm/chat',
      conversations: '/conversations',
    },
    workflows: {
      base: '/workflows',
      execute: '/workflows/execute',
    },
    health: '/health',
  },

  // Other services
  workflows: {
    endpoint: '/workflows',
  },
  
  templates: {
    endpoint: '/templates',
  },
  
  agents: {
    endpoint: '/agents',
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
  enablePerformanceMonitoring: config.isDevelopment,
}

export default config

