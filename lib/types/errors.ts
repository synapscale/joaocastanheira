// Error types and categories for authentication system
export enum AuthErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  TOKEN = 'TOKEN',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  INTERNAL = 'INTERNAL',
  UNKNOWN = 'UNKNOWN'
}

export enum AuthErrorCode {
  // Network errors
  NETWORK_CONNECTION_FAILED = 'NETWORK_CONNECTION_FAILED',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  
  // Validation errors
  VALIDATION_INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_PASSWORD = 'VALIDATION_INVALID_PASSWORD',
  VALIDATION_MISSING_FIELDS = 'VALIDATION_MISSING_FIELDS',
  VALIDATION_PASSWORD_TOO_SHORT = 'VALIDATION_PASSWORD_TOO_SHORT',
  
  // Server errors
  SERVER_INTERNAL_ERROR = 'SERVER_INTERNAL_ERROR',
  SERVER_UNAVAILABLE = 'SERVER_UNAVAILABLE',
  SERVER_RATE_LIMITED = 'SERVER_RATE_LIMITED',
  SERVER_MAINTENANCE = 'SERVER_MAINTENANCE',
  
  // Token errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_MALFORMED = 'TOKEN_MALFORMED',
  TOKEN_MISSING = 'TOKEN_MISSING',
  TOKEN_SAVE_FAILED = 'TOKEN_SAVE_FAILED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  
  // Authentication errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',
  AUTH_ACCOUNT_DISABLED = 'AUTH_ACCOUNT_DISABLED',
  AUTH_LOGIN_FAILED = 'AUTH_LOGIN_FAILED',
  AUTH_LOGOUT_FAILED = 'AUTH_LOGOUT_FAILED',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  
  // Authorization errors
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  
  // Internal errors
  INTERNAL_STATE_CORRUPTION = 'INTERNAL_STATE_CORRUPTION',
  INTERNAL_RACE_CONDITION = 'INTERNAL_RACE_CONDITION',
  INTERNAL_UNEXPECTED_ERROR = 'INTERNAL_UNEXPECTED_ERROR',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  HYDRATION_FAILED = 'HYDRATION_FAILED',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthErrorInfo {
  category: AuthErrorCategory
  code: AuthErrorCode
  message: string
  userMessage: string
  recoverable: boolean
  retryable: boolean
  debugInfo?: Record<string, any>
  timestamp: Date
  context?: string
}

export interface AuthErrorRecoveryOptions {
  retryCount: number
  retryDelay: number
  maxRetries: number
  fallbackAction?: () => Promise<void>
  onRecoverySuccess?: (attempt: number) => void
  onRecoveryFailed?: (error: AuthError) => void
}

export class AuthError extends Error {
  public readonly category: AuthErrorCategory
  public readonly code: AuthErrorCode
  public readonly userMessage: string
  public readonly recoverable: boolean
  public readonly retryable: boolean
  public readonly debugInfo?: Record<string, any>
  public readonly timestamp: Date
  public readonly context?: string
  public readonly originalError?: Error

  constructor(errorInfo: AuthErrorInfo, originalError?: Error) {
    super(errorInfo.message)
    this.name = 'AuthError'
    this.category = errorInfo.category
    this.code = errorInfo.code
    this.userMessage = errorInfo.userMessage
    this.recoverable = errorInfo.recoverable
    this.retryable = errorInfo.retryable
    this.debugInfo = errorInfo.debugInfo
    this.timestamp = errorInfo.timestamp
    this.context = errorInfo.context
    this.originalError = originalError
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      code: this.code,
      userMessage: this.userMessage,
      recoverable: this.recoverable,
      retryable: this.retryable,
      debugInfo: this.debugInfo,
      timestamp: this.timestamp,
      context: this.context,
      originalError: this.originalError?.message
    }
  }
}

export type AuthErrorMap = Record<AuthErrorCode, Omit<AuthErrorInfo, 'code' | 'timestamp'>>

export interface ErrorClassificationResult {
  error: AuthError
  recoveryOptions?: AuthErrorRecoveryOptions
  suggestedActions: string[]
} 