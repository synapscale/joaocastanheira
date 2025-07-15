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

// Lista de endpoints de sistema que NÃO devem ter o prefixo /api/v1
const SYSTEM_ENDPOINTS = [
  '/',
  '/.identity', 
  '/current-url',
  '/health',
  '/health/detailed',
  '/info'
];

// Normaliza a URL base e adiciona /api/v1 automaticamente (a menos que NEXT_PUBLIC_SKIP_API_V1 seja true)
function normalizeApiBase(raw?: string): string {
  if (!raw) {
    throw new Error('NEXT_PUBLIC_API_URL é obrigatório. Configure esta variável no arquivo .env')
  }

  let url = raw.trim()

  // Remove barra(s) finais
  url = url.replace(/\/+$/, '')

  // Se a variável NEXT_PUBLIC_SKIP_API_V1 for true, não adicionar /api/v1
  if (process.env.NEXT_PUBLIC_SKIP_API_V1 === 'true') {
    return url;
  }

  // Se a URL já contém /api/v1, usar como está
  if (url.endsWith('/api/v1')) {
    return url;
  }

  // Remove sufixo /api ou /api/v{n} se existir (para limpar)
  url = url.replace(/\/api(\/v\d+)?$/, '')

  // Adiciona /api/v1 sempre (a menos que seja skipado)
  return `${url}/api/v1`
}

// Função para obter URL base sem /api/v1 (para endpoints de sistema)
function getSystemApiBase(raw?: string): string {
  if (!raw) {
    throw new Error('NEXT_PUBLIC_API_URL é obrigatório. Configure esta variável no arquivo .env')
  }

  let url = raw.trim()
  
  // Remove barra(s) finais
  url = url.replace(/\/+$/, '')
  
  // Remove sufixo /api ou /api/v{n} se existir
  url = url.replace(/\/api(\/v\d+)?$/, '')
  
  return url
}

// Função utilitária para verificar se um endpoint é de sistema
function isSystemEndpoint(endpoint: string): boolean {
  return SYSTEM_ENDPOINTS.some(systemEndpoint => 
    endpoint === systemEndpoint || endpoint.startsWith(systemEndpoint + '/')
  );
}

export const config = {
  // URLs base para comunicação com o backend
  apiBaseUrl: normalizeApiBase(process.env.NEXT_PUBLIC_API_URL),
  systemApiBaseUrl: getSystemApiBase(process.env.NEXT_PUBLIC_API_URL),
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
    tokenKey: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapsefrontend_auth_token',
    refreshTokenKey: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'synapsefrontend_refresh_token',
    userKey: 'synapse_user',
    tokenExpirationBuffer: 300000, // 5 minutos antes de expirar (mais conservador)
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
 * Retorna a URL completa para um endpoint (detecta automaticamente se é sistema ou aplicação)
 */
export function getApiUrl(endpoint: string): string {
  if (isSystemEndpoint(endpoint)) {
    return `${config.systemApiBaseUrl}${endpoint}`
  }
  return `${config.apiBaseUrl}${endpoint}`
}

/**
 * Força usar URL base de sistema (sem /api/v1)
 */
export function getSystemApiUrl(endpoint: string): string {
  return `${config.systemApiBaseUrl}${endpoint}`
}

/**
 * Força usar URL base de aplicação (com /api/v1)
 */
export function getAppApiUrl(endpoint: string): string {
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

// Exportar função utilitária
export { isSystemEndpoint }

export default config

