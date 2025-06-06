/**
 * Configurações otimizadas da aplicação
 * Criado por José - O melhor Full Stack do mundo
 * Implementa todas as melhores práticas de configuração
 */

interface Config {
  // URLs
  apiUrl: string
  wsUrl: string
  appUrl: string
  
  // Environment
  environment: 'development' | 'production' | 'staging'
  isDevelopment: boolean
  isProduction: boolean
  debug: boolean
  
  // Authentication
  jwtStorageKey: string
  refreshTokenKey: string
  
  // Features
  features: {
    analytics: boolean
    marketplace: boolean
    fileUpload: boolean
    workspaces: boolean
  }
  
  // File Upload
  maxFileSize: number
  allowedFileTypes: string[]
  
  // UI
  app: {
    name: string
    description: string
    companyName: string
  }
  
  // Cache
  cacheTimeout: number
  
  // WebSocket
  websocket: {
    reconnectAttempts: number
    reconnectDelay: number
  }
  
  // Development
  showDebugInfo: boolean
  enableReactQueryDevtools: boolean
}

function getConfig(): Config {
  const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT as Config['environment']) || 'development'
  
  return {
    // URLs
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    
    // Environment
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
    
    // Authentication
    jwtStorageKey: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapse_auth_token',
    refreshTokenKey: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'synapse_refresh_token',
    
    // Features
    features: {
      analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      marketplace: process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === 'true',
      fileUpload: process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD === 'true',
      workspaces: process.env.NEXT_PUBLIC_ENABLE_WORKSPACES === 'true',
    },
    
    // File Upload
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'),
    allowedFileTypes: JSON.parse(process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || '["image/*","application/pdf","text/*"]'),
    
    // UI
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Synapse Automation Platform',
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Plataforma de Automação com IA',
      companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'João Castanheira',
    },
    
    // Cache
    cacheTimeout: parseInt(process.env.NEXT_PUBLIC_CACHE_TIMEOUT || '300000'),
    
    // WebSocket
    websocket: {
      reconnectAttempts: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_ATTEMPTS || '5'),
      reconnectDelay: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_DELAY || '2000'),
    },
    
    // Development
    showDebugInfo: process.env.NEXT_PUBLIC_SHOW_DEBUG_INFO === 'true',
    enableReactQueryDevtools: process.env.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS === 'true',
  }
}

export const config = getConfig()

// Validations
if (config.isDevelopment) {
  console.log('🔧 Configurações de desenvolvimento carregadas:', {
    apiUrl: config.apiUrl,
    wsUrl: config.wsUrl,
    features: config.features,
  })
}

// Check required URLs
if (!config.apiUrl || !config.wsUrl) {
  throw new Error('URLs de API e WebSocket são obrigatórias')
}

/**
 * Get full API URL for endpoint
 */
export function getApiUrl(endpoint: string): string {
  return `${config.apiUrl}${endpoint}`
}

/**
 * Get full WebSocket URL for endpoint
 */
export function getWsUrl(endpoint: string): string {
  return `${config.wsUrl}${endpoint}`
}

/**
 * Validate configuration
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.apiUrl) {
    errors.push('API URL é obrigatória')
  }
  
  if (!config.wsUrl) {
    errors.push('WebSocket URL é obrigatória')
  }
  
  // Validate URL format
  try {
    new URL(config.apiUrl)
  } catch {
    errors.push('API URL deve ser uma URL válida')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export default config

