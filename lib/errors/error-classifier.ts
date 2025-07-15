import { 
  AuthError, 
  AuthErrorCategory, 
  AuthErrorCode, 
  AuthErrorInfo, 
  AuthErrorMap, 
  ErrorClassificationResult, 
  AuthErrorRecoveryOptions 
} from '../types/errors'

// Predefined error mappings for common errors
const ERROR_MAPPINGS: AuthErrorMap = {
  // Network errors
  [AuthErrorCode.NETWORK_CONNECTION_FAILED]: {
    category: AuthErrorCategory.NETWORK,
    message: 'Failed to connect to authentication server',
    userMessage: 'Verifique sua conexão com a internet e tente novamente',
    recoverable: true,
    retryable: true
  },
  [AuthErrorCode.NETWORK_TIMEOUT]: {
    category: AuthErrorCategory.NETWORK,
    message: 'Network request timed out',
    userMessage: 'A operação demorou muito para responder. Tente novamente',
    recoverable: true,
    retryable: true
  },
  [AuthErrorCode.NETWORK_OFFLINE]: {
    category: AuthErrorCategory.NETWORK,
    message: 'Device is offline',
    userMessage: 'Sem conexão com a internet. Verifique sua conexão',
    recoverable: true,
    retryable: true
  },
  
  // Validation errors
  [AuthErrorCode.VALIDATION_INVALID_EMAIL]: {
    category: AuthErrorCategory.VALIDATION,
    message: 'Invalid email format',
    userMessage: 'Digite um email válido',
    recoverable: true,
    retryable: false
  },
  [AuthErrorCode.VALIDATION_INVALID_PASSWORD]: {
    category: AuthErrorCategory.VALIDATION,
    message: 'Password does not meet requirements',
    userMessage: 'A senha não atende aos requisitos',
    recoverable: true,
    retryable: false
  },
  [AuthErrorCode.VALIDATION_MISSING_FIELDS]: {
    category: AuthErrorCategory.VALIDATION,
    message: 'Required fields are missing',
    userMessage: 'Preencha todos os campos obrigatórios',
    recoverable: true,
    retryable: false
  },
  [AuthErrorCode.VALIDATION_PASSWORD_TOO_SHORT]: {
    category: AuthErrorCategory.VALIDATION,
    message: 'Password is too short',
    userMessage: 'A senha deve ter pelo menos 8 caracteres',
    recoverable: true,
    retryable: false
  },
  
  // Server errors
  [AuthErrorCode.SERVER_INTERNAL_ERROR]: {
    category: AuthErrorCategory.SERVER,
    message: 'Internal server error',
    userMessage: 'Erro interno do servidor. Tente novamente em alguns minutos',
    recoverable: true,
    retryable: true
  },
  [AuthErrorCode.SERVER_UNAVAILABLE]: {
    category: AuthErrorCategory.SERVER,
    message: 'Server is unavailable',
    userMessage: 'Servidor indisponível. Tente novamente mais tarde',
    recoverable: true,
    retryable: true
  },
  [AuthErrorCode.SERVER_RATE_LIMITED]: {
    category: AuthErrorCategory.SERVER,
    message: 'Rate limit exceeded',
    userMessage: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente',
    recoverable: true,
    retryable: true
  },
  [AuthErrorCode.SERVER_MAINTENANCE]: {
    category: AuthErrorCategory.SERVER,
    message: 'Server is under maintenance',
    userMessage: 'Sistema em manutenção. Tente novamente mais tarde',
    recoverable: true,
    retryable: true
  },
  
  // Token errors
  [AuthErrorCode.TOKEN_EXPIRED]: {
    category: AuthErrorCategory.TOKEN,
    message: 'Authentication token has expired',
    userMessage: 'Sua sessão expirou. Faça login novamente',
    recoverable: true,
    retryable: false
  },
  [AuthErrorCode.TOKEN_INVALID]: {
    category: AuthErrorCategory.TOKEN,
    message: 'Invalid authentication token',
    userMessage: 'Erro de autenticação. Faça login novamente',
    recoverable: true,
    retryable: false
  },
  [AuthErrorCode.TOKEN_MALFORMED]: {
    category: AuthErrorCategory.TOKEN,
    message: 'Token format is invalid',
    userMessage: 'Erro de autenticação. Faça login novamente',
    recoverable: true,
    retryable: false
  },
  [AuthErrorCode.TOKEN_MISSING]: {
    category: AuthErrorCategory.TOKEN,
    message: 'Authentication token is missing',
    userMessage: 'Erro de autenticação. Faça login novamente',
    recoverable: true,
    retryable: false
  },
  [AuthErrorCode.TOKEN_SAVE_FAILED]: {
    category: AuthErrorCategory.TOKEN,
    message: 'Failed to save authentication token',
    userMessage: 'Erro ao salvar credenciais. Tente novamente',
    recoverable: true,
    retryable: true
  },
  [AuthErrorCode.TOKEN_REFRESH_FAILED]: {
    category: AuthErrorCategory.TOKEN,
    message: 'Failed to refresh authentication token',
    userMessage: 'Erro ao renovar sessão. Faça login novamente',
    recoverable: true,
    retryable: false
  },
  
  // Authentication errors
  [AuthErrorCode.AUTH_INVALID_CREDENTIALS]: {
    category: AuthErrorCategory.AUTHENTICATION,
    message: 'Invalid email or password',
    userMessage: 'Email ou senha incorretos',
    recoverable: true,
    retryable: false
  },
  [AuthErrorCode.AUTH_ACCOUNT_LOCKED]: {
    category: AuthErrorCategory.AUTHENTICATION,
    message: 'Account is locked',
    userMessage: 'Conta bloqueada. Entre em contato com o suporte',
    recoverable: false,
    retryable: false
  },
  [AuthErrorCode.AUTH_ACCOUNT_DISABLED]: {
    category: AuthErrorCategory.AUTHENTICATION,
    message: 'Account is disabled',
    userMessage: 'Conta desabilitada. Entre em contato com o suporte',
    recoverable: false,
    retryable: false
  },
  [AuthErrorCode.AUTH_LOGIN_FAILED]: {
    category: AuthErrorCategory.AUTHENTICATION,
    message: 'Login failed',
    userMessage: 'Falha no login. Verifique suas credenciais',
    recoverable: true,
    retryable: false
  },
  [AuthErrorCode.AUTH_LOGOUT_FAILED]: {
    category: AuthErrorCategory.AUTHENTICATION,
    message: 'Logout failed',
    userMessage: 'Erro ao fazer logout. Tente novamente',
    recoverable: true,
    retryable: true
  },
  [AuthErrorCode.AUTH_SESSION_EXPIRED]: {
    category: AuthErrorCategory.AUTHENTICATION,
    message: 'Session has expired',
    userMessage: 'Sessão expirada. Faça login novamente',
    recoverable: true,
    retryable: false
  },
  
  // Authorization errors
  [AuthErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: {
    category: AuthErrorCategory.AUTHORIZATION,
    message: 'Insufficient permissions',
    userMessage: 'Você não tem permissão para acessar este recurso',
    recoverable: false,
    retryable: false
  },
  [AuthErrorCode.AUTH_FORBIDDEN]: {
    category: AuthErrorCategory.AUTHORIZATION,
    message: 'Access forbidden',
    userMessage: 'Acesso negado',
    recoverable: false,
    retryable: false
  },
  [AuthErrorCode.AUTH_UNAUTHORIZED]: {
    category: AuthErrorCategory.AUTHORIZATION,
    message: 'Unauthorized access',
    userMessage: 'Acesso não autorizado. Faça login novamente',
    recoverable: true,
    retryable: false
  },
  
  // Internal errors
  [AuthErrorCode.INTERNAL_STATE_CORRUPTION]: {
    category: AuthErrorCategory.INTERNAL,
    message: 'Internal state corruption detected',
    userMessage: 'Erro interno. Recarregue a página',
    recoverable: true,
    retryable: true
  },
  [AuthErrorCode.INTERNAL_RACE_CONDITION]: {
    category: AuthErrorCategory.INTERNAL,
    message: 'Race condition detected',
    userMessage: 'Erro interno. Tente novamente',
    recoverable: true,
    retryable: true
  },
  [AuthErrorCode.INTERNAL_UNEXPECTED_ERROR]: {
    category: AuthErrorCategory.INTERNAL,
    message: 'Unexpected internal error',
    userMessage: 'Erro inesperado. Tente novamente',
    recoverable: true,
    retryable: true
  },
  
  // Unknown errors
  [AuthErrorCode.UNKNOWN_ERROR]: {
    category: AuthErrorCategory.UNKNOWN,
    message: 'An unknown error occurred',
    userMessage: 'Erro desconhecido. Tente novamente',
    recoverable: true,
    retryable: true
  }
}

export class AuthErrorClassifier {
  
  /**
   * Classifies an error and returns appropriate error information
   */
  static classifyError(error: unknown, context?: string): ErrorClassificationResult {
    console.log('🔍 ErrorClassifier: Classificando erro...', { error, context })
    
    // If already an AuthError, return it with additional context
    if (error instanceof AuthError) {
      return {
        error: error,
        recoveryOptions: this.getRecoveryOptions(error.code),
        suggestedActions: this.getSuggestedActions(error.code)
      }
    }
    
    // Classify different types of errors
    const errorCode = this.identifyErrorCode(error)
    const errorInfo = this.getErrorInfo(errorCode, error, context)
    const authError = new AuthError(errorInfo, error instanceof Error ? error : undefined)
    
    console.log('✅ ErrorClassifier: Erro classificado', { 
      code: errorCode, 
      category: errorInfo.category,
      recoverable: errorInfo.recoverable,
      retryable: errorInfo.retryable
    })
    
    return {
      error: authError,
      recoveryOptions: this.getRecoveryOptions(errorCode),
      suggestedActions: this.getSuggestedActions(errorCode)
    }
  }
  
  /**
   * Identifies the error code from the error object
   */
  private static identifyErrorCode(error: unknown): AuthErrorCode {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      // Network errors
      if (message.includes('network') || message.includes('connection')) {
        return AuthErrorCode.NETWORK_CONNECTION_FAILED
      }
      if (message.includes('timeout')) {
        return AuthErrorCode.NETWORK_TIMEOUT
      }
      if (message.includes('offline')) {
        return AuthErrorCode.NETWORK_OFFLINE
      }
      
      // Server errors
      if (message.includes('500') || message.includes('internal server')) {
        return AuthErrorCode.SERVER_INTERNAL_ERROR
      }
      if (message.includes('503') || message.includes('unavailable')) {
        return AuthErrorCode.SERVER_UNAVAILABLE
      }
      if (message.includes('429') || message.includes('rate limit')) {
        return AuthErrorCode.SERVER_RATE_LIMITED
      }
      
      // Authentication errors
      if (message.includes('invalid credentials') || message.includes('unauthorized')) {
        return AuthErrorCode.AUTH_INVALID_CREDENTIALS
      }
      if (message.includes('token expired') || message.includes('jwt expired')) {
        return AuthErrorCode.TOKEN_EXPIRED
      }
      if (message.includes('token invalid') || message.includes('jwt invalid')) {
        return AuthErrorCode.TOKEN_INVALID
      }
      if (message.includes('token save') || message.includes('save failed')) {
        return AuthErrorCode.TOKEN_SAVE_FAILED
      }
      if (message.includes('refresh failed')) {
        return AuthErrorCode.TOKEN_REFRESH_FAILED
      }
      
      // Validation errors
      if (message.includes('email') && message.includes('invalid')) {
        return AuthErrorCode.VALIDATION_INVALID_EMAIL
      }
      if (message.includes('password') && message.includes('short')) {
        return AuthErrorCode.VALIDATION_PASSWORD_TOO_SHORT
      }
      if (message.includes('required') || message.includes('missing')) {
        return AuthErrorCode.VALIDATION_MISSING_FIELDS
      }
      
      // Internal errors
      if (message.includes('race condition')) {
        return AuthErrorCode.INTERNAL_RACE_CONDITION
      }
      if (message.includes('state corruption')) {
        return AuthErrorCode.INTERNAL_STATE_CORRUPTION
      }
    }
    
    return AuthErrorCode.UNKNOWN_ERROR
  }
  
  /**
   * Gets the error information for a specific error code
   */
  private static getErrorInfo(code: AuthErrorCode, originalError: unknown, context?: string): AuthErrorInfo {
    const mapping = ERROR_MAPPINGS[code]
    
    return {
      category: mapping.category,
      code: code,
      message: mapping.message,
      userMessage: mapping.userMessage,
      recoverable: mapping.recoverable,
      retryable: mapping.retryable,
      debugInfo: {
        originalError: originalError instanceof Error ? originalError.message : String(originalError),
        stack: originalError instanceof Error ? originalError.stack : undefined
      },
      timestamp: new Date(),
      context: context
    }
  }
  
  /**
   * Gets recovery options for a specific error code
   */
  private static getRecoveryOptions(code: AuthErrorCode): AuthErrorRecoveryOptions | undefined {
    const mapping = ERROR_MAPPINGS[code]
    
    if (!mapping.recoverable) {
      return undefined
    }
    
    // Default recovery options based on error type
    const baseOptions: AuthErrorRecoveryOptions = {
      retryCount: 0,
      retryDelay: 1000,
      maxRetries: 3,
    }
    
    // Customize based on error code
    switch (code) {
      case AuthErrorCode.NETWORK_CONNECTION_FAILED:
      case AuthErrorCode.NETWORK_TIMEOUT:
        return { ...baseOptions, retryDelay: 2000, maxRetries: 5 }
      
      case AuthErrorCode.SERVER_INTERNAL_ERROR:
      case AuthErrorCode.SERVER_UNAVAILABLE:
        return { ...baseOptions, retryDelay: 5000, maxRetries: 3 }
      
      case AuthErrorCode.SERVER_RATE_LIMITED:
        return { ...baseOptions, retryDelay: 10000, maxRetries: 2 }
      
      case AuthErrorCode.TOKEN_SAVE_FAILED:
        return { ...baseOptions, retryDelay: 500, maxRetries: 5 }
      
      case AuthErrorCode.INTERNAL_RACE_CONDITION:
        return { ...baseOptions, retryDelay: 100, maxRetries: 3 }
      
      default:
        return baseOptions
    }
  }
  
  /**
   * Gets suggested actions for a specific error code
   */
  private static getSuggestedActions(code: AuthErrorCode): string[] {
    switch (code) {
      case AuthErrorCode.NETWORK_CONNECTION_FAILED:
      case AuthErrorCode.NETWORK_TIMEOUT:
      case AuthErrorCode.NETWORK_OFFLINE:
        return [
          'Verifique sua conexão com a internet',
          'Tente novamente em alguns segundos',
          'Recarregue a página se o problema persistir'
        ]
      
      case AuthErrorCode.SERVER_INTERNAL_ERROR:
      case AuthErrorCode.SERVER_UNAVAILABLE:
        return [
          'Aguarde alguns minutos e tente novamente',
          'Verifique se há atualizações sobre manutenção do sistema',
          'Entre em contato com o suporte se o problema persistir'
        ]
      
      case AuthErrorCode.SERVER_RATE_LIMITED:
        return [
          'Aguarde alguns minutos antes de tentar novamente',
          'Evite múltiplas tentativas consecutivas'
        ]
      
      case AuthErrorCode.TOKEN_EXPIRED:
      case AuthErrorCode.TOKEN_INVALID:
      case AuthErrorCode.TOKEN_MALFORMED:
      case AuthErrorCode.TOKEN_MISSING:
      case AuthErrorCode.AUTH_SESSION_EXPIRED:
        return [
          'Faça login novamente',
          'Limpe o cache do navegador se o problema persistir'
        ]
      
      case AuthErrorCode.AUTH_INVALID_CREDENTIALS:
        return [
          'Verifique se o email e senha estão corretos',
          'Tente resetar a senha se necessário'
        ]
      
      case AuthErrorCode.VALIDATION_INVALID_EMAIL:
      case AuthErrorCode.VALIDATION_INVALID_PASSWORD:
      case AuthErrorCode.VALIDATION_MISSING_FIELDS:
      case AuthErrorCode.VALIDATION_PASSWORD_TOO_SHORT:
        return [
          'Corrija os dados do formulário',
          'Verifique se todos os campos obrigatórios estão preenchidos'
        ]
      
      case AuthErrorCode.TOKEN_SAVE_FAILED:
        return [
          'Tente novamente',
          'Verifique se o navegador permite cookies',
          'Limpe o cache do navegador'
        ]
      
      case AuthErrorCode.INTERNAL_STATE_CORRUPTION:
        return [
          'Recarregue a página',
          'Limpe o cache do navegador',
          'Faça logout e login novamente'
        ]
      
      case AuthErrorCode.INTERNAL_RACE_CONDITION:
        return [
          'Tente novamente',
          'Aguarde alguns segundos entre tentativas'
        ]
      
      case AuthErrorCode.AUTH_ACCOUNT_LOCKED:
      case AuthErrorCode.AUTH_ACCOUNT_DISABLED:
        return [
          'Entre em contato com o suporte',
          'Verifique se há emails sobre o status da conta'
        ]
      
      default:
        return [
          'Tente novamente',
          'Recarregue a página se o problema persistir',
          'Entre em contato com o suporte se necessário'
        ]
    }
  }
  
  /**
   * Creates a standardized error for token save failures
   */
  static createTokenSaveError(context?: string, debugInfo?: Record<string, any>): AuthError {
    const errorInfo: AuthErrorInfo = {
      category: AuthErrorCategory.TOKEN,
      code: AuthErrorCode.TOKEN_SAVE_FAILED,
      message: 'Failed to save authentication token',
      userMessage: 'Erro ao salvar credenciais. Tente novamente',
      recoverable: true,
      retryable: true,
      debugInfo: debugInfo,
      timestamp: new Date(),
      context: context
    }
    
    return new AuthError(errorInfo)
  }
  
  /**
   * Creates a standardized error for network failures
   */
  static createNetworkError(context?: string, debugInfo?: Record<string, any>): AuthError {
    const errorInfo: AuthErrorInfo = {
      category: AuthErrorCategory.NETWORK,
      code: AuthErrorCode.NETWORK_CONNECTION_FAILED,
      message: 'Failed to connect to authentication server',
      userMessage: 'Verifique sua conexão com a internet e tente novamente',
      recoverable: true,
      retryable: true,
      debugInfo: debugInfo,
      timestamp: new Date(),
      context: context
    }
    
    return new AuthError(errorInfo)
  }
  
  /**
   * Creates a standardized error for race conditions
   */
  static createRaceConditionError(context?: string, debugInfo?: Record<string, any>): AuthError {
    const errorInfo: AuthErrorInfo = {
      category: AuthErrorCategory.INTERNAL,
      code: AuthErrorCode.INTERNAL_RACE_CONDITION,
      message: 'Race condition detected',
      userMessage: 'Erro interno. Tente novamente',
      recoverable: true,
      retryable: true,
      debugInfo: debugInfo,
      timestamp: new Date(),
      context: context
    }
    
    return new AuthError(errorInfo)
  }
}

export default AuthErrorClassifier 