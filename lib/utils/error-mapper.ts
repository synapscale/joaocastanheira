import type { ErrorType, ErrorSeverity } from '../../components/ui/error-feedback'

export interface MappedError {
  type: ErrorType
  severity: ErrorSeverity
  title: string
  message: string
  actionable?: boolean
  retryable?: boolean
}

// Error patterns for automatic categorization
const errorPatterns = {
  // Authentication errors
  authentication: [
    /invalid.credentials/i,
    /unauthorized/i,
    /401/,
    /wrong.password/i,
    /incorrect.password/i,
    /email.not.found/i,
    /user.not.found/i,
    /authentication.failed/i,
    /login.failed/i
  ],
  
  // Network errors
  network: [
    /network.error/i,
    /connection.failed/i,
    /timeout/i,
    /fetch.failed/i,
    /offline/i,
    /no.internet/i,
    /connection.refused/i,
    /dns.error/i
  ],
  
  // Server errors
  server: [
    /500/,
    /502/,
    /503/,
    /504/,
    /internal.server.error/i,
    /bad.gateway/i,
    /service.unavailable/i,
    /gateway.timeout/i,
    /server.error/i
  ],
  
  // Rate limiting
  'rate-limit': [
    /429/,
    /too.many.requests/i,
    /rate.limit/i,
    /quota.exceeded/i,
    /throttle/i,
    /too.many.attempts/i
  ],
  
  // Account issues
  account: [
    /account.disabled/i,
    /account.suspended/i,
    /account.locked/i,
    /email.not.verified/i,
    /verification.required/i,
    /account.expired/i,
    /subscription.expired/i
  ],
  
  // Validation errors
  validation: [
    /validation.error/i,
    /invalid.format/i,
    /required.field/i,
    /invalid.email/i,
    /password.too.short/i,
    /missing.required/i
  ]
}

// Specific error messages mapping
const specificErrors: Record<string, Partial<MappedError>> = {
  // Authentication
  'invalid_credentials': {
    type: 'authentication',
    severity: 'medium',
    title: 'Credenciais inválidas',
    message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
    retryable: true
  },
  'user_not_found': {
    type: 'authentication',
    severity: 'medium',
    title: 'Usuário não encontrado',
    message: 'Não encontramos uma conta com este email. Verifique o email ou crie uma conta.',
    retryable: true
  },
  'wrong_password': {
    type: 'authentication',
    severity: 'medium',
    title: 'Senha incorreta',
    message: 'A senha está incorreta. Tente novamente ou use "Esqueci a senha".',
    retryable: true
  },
  
  // Network
  'network_error': {
    type: 'network',
    severity: 'medium',
    title: 'Erro de conexão',
    message: 'Verifique sua conexão com a internet e tente novamente.',
    retryable: true
  },
  'timeout': {
    type: 'network',
    severity: 'medium',
    title: 'Tempo esgotado',
    message: 'A conexão demorou mais que o esperado. Tente novamente.',
    retryable: true
  },
  
  // Server
  'internal_server_error': {
    type: 'server',
    severity: 'high',
    title: 'Erro interno do servidor',
    message: 'Algo deu errado em nossos servidores. Nossa equipe foi notificada.',
    retryable: true
  },
  'service_unavailable': {
    type: 'server',
    severity: 'high',
    title: 'Serviço indisponível',
    message: 'O serviço está temporariamente indisponível. Tente novamente em alguns minutos.',
    retryable: true
  },
  
  // Rate limiting
  'too_many_requests': {
    type: 'rate-limit',
    severity: 'high',
    title: 'Muitas tentativas',
    message: 'Você fez muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
    retryable: false
  },
  'rate_limit_exceeded': {
    type: 'rate-limit',
    severity: 'high',
    title: 'Limite excedido',
    message: 'Limite de tentativas excedido. Aguarde 15 minutos antes de tentar novamente.',
    retryable: false
  },
  
  // Account
  'account_disabled': {
    type: 'account',
    severity: 'critical',
    title: 'Conta desativada',
    message: 'Sua conta foi desativada. Entre em contato com o suporte para mais informações.',
    retryable: false,
    actionable: true
  },
  'email_not_verified': {
    type: 'account',
    severity: 'high',
    title: 'Email não verificado',
    message: 'Você precisa verificar seu email antes de fazer login. Verifique sua caixa de entrada.',
    retryable: false,
    actionable: true
  },
  'account_locked': {
    type: 'account',
    severity: 'high',
    title: 'Conta bloqueada',
    message: 'Sua conta foi temporariamente bloqueada devido a tentativas de login suspeitas.',
    retryable: false,
    actionable: true
  },
  
  // Validation
  'invalid_email': {
    type: 'validation',
    severity: 'low',
    title: 'Email inválido',
    message: 'Por favor, digite um endereço de email válido.',
    retryable: true
  },
  'password_required': {
    type: 'validation',
    severity: 'low',
    title: 'Senha obrigatória',
    message: 'Por favor, digite sua senha.',
    retryable: true
  },
  'password_too_short': {
    type: 'validation',
    severity: 'low',
    title: 'Senha muito curta',
    message: 'A senha deve ter pelo menos 6 caracteres.',
    retryable: true
  }
}

// Map any error to the appropriate type and message
export function mapError(error: any): MappedError {
  console.log('🔍 Mapeando erro:', { error, type: typeof error })
  
  // Handle null/undefined
  if (!error) {
    return {
      type: 'general',
      severity: 'medium',
      title: 'Erro inesperado',
      message: 'Algo deu errado. Tente novamente.',
      retryable: true
    }
  }

  // Extract error information
  const errorMessage = error?.message || error?.toString() || ''
  const errorCode = error?.code || error?.status || ''
  const errorName = error?.name || ''
  
  console.log('📝 Detalhes do erro:', { errorMessage, errorCode, errorName })

  // Check for specific error codes/keys first
  const normalizedCode = errorCode.toString().toLowerCase().replace(/[^a-z0-9_]/g, '_')
  const normalizedMessage = errorMessage.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  
  // Try exact matches first
  for (const [key, config] of Object.entries(specificErrors)) {
    if (normalizedCode.includes(key) || normalizedMessage.includes(key) || errorMessage.includes(key)) {
      console.log('✅ Erro específico encontrado:', key)
      return {
        type: 'general',
        severity: 'medium',
        title: 'Erro',
        message: errorMessage || 'Erro inesperado',
        retryable: true,
        ...config
      } as MappedError
    }
  }

  // Pattern matching for categories
  const fullErrorText = `${errorMessage} ${errorCode} ${errorName}`.toLowerCase()
  
  for (const [type, patterns] of Object.entries(errorPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(fullErrorText)) {
        console.log('🎯 Padrão encontrado:', type, pattern)
        return getDefaultErrorForType(type as ErrorType, errorMessage)
      }
    }
  }

  // HTTP status code fallbacks
  const statusCode = parseInt(errorCode.toString()) || 0
  if (statusCode >= 400) {
    if (statusCode === 401) {
      return getDefaultErrorForType('authentication', errorMessage)
    }
    if (statusCode === 403) {
      return getDefaultErrorForType('account', errorMessage)
    }
    if (statusCode === 429) {
      return getDefaultErrorForType('rate-limit', errorMessage)
    }
    if (statusCode >= 500) {
      return getDefaultErrorForType('server', errorMessage)
    }
    if (statusCode >= 400 && statusCode < 500) {
      return getDefaultErrorForType('validation', errorMessage)
    }
  }

  console.log('❓ Erro não categorizado, usando fallback')
  
  // Fallback to general error
  return {
    type: 'general',
    severity: 'medium',
    title: 'Erro inesperado',
    message: errorMessage || 'Algo deu errado. Tente novamente.',
    retryable: true
  }
}

// Get default error configuration for a type
function getDefaultErrorForType(type: ErrorType, originalMessage: string): MappedError {
  const defaults: Record<ErrorType, Omit<MappedError, 'message'>> = {
    authentication: {
      type: 'authentication',
      severity: 'medium',
      title: 'Erro de autenticação',
      retryable: true
    },
    network: {
      type: 'network',
      severity: 'medium',
      title: 'Erro de conexão',
      retryable: true
    },
    server: {
      type: 'server',
      severity: 'high',
      title: 'Erro do servidor',
      retryable: true
    },
    'rate-limit': {
      type: 'rate-limit',
      severity: 'high',
      title: 'Muitas tentativas',
      retryable: false
    },
    account: {
      type: 'account',
      severity: 'high',
      title: 'Problema na conta',
      retryable: false,
      actionable: true
    },
    validation: {
      type: 'validation',
      severity: 'low',
      title: 'Dados inválidos',
      retryable: true
    },
    general: {
      type: 'general',
      severity: 'medium',
      title: 'Erro inesperado',
      retryable: true
    }
  }

  const config = defaults[type]
  return {
    ...config,
    message: originalMessage || getFallbackMessage(type)
  }
}

// Fallback messages for each type
function getFallbackMessage(type: ErrorType): string {
  const fallbacks: Record<ErrorType, string> = {
    authentication: 'Erro na autenticação. Verifique suas credenciais.',
    network: 'Problema de conexão. Verifique sua internet.',
    server: 'Erro interno. Nossa equipe foi notificada.',
    'rate-limit': 'Muitas tentativas. Aguarde alguns minutos.',
    account: 'Problema com sua conta. Entre em contato com o suporte.',
    validation: 'Dados inválidos. Verifique as informações.',
    general: 'Algo deu errado. Tente novamente.'
  }
  
  return fallbacks[type]
}

// Utility to check if error should trigger specific actions
export function shouldShowRetryButton(error: MappedError): boolean {
  return error.retryable === true && error.type !== 'rate-limit'
}

export function shouldShowSupportLink(error: MappedError): boolean {
  return error.actionable === true || error.severity === 'critical'
}

export function getRetryDelay(error: MappedError): number {
  switch (error.type) {
    case 'rate-limit':
      return 60000 // 1 minute
    case 'server':
      return 5000 // 5 seconds
    case 'network':
      return 3000 // 3 seconds
    default:
      return 1000 // 1 second
  }
}

export default mapError 