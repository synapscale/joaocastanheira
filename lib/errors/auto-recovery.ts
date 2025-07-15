import { AuthError, AuthErrorCode, AuthErrorCategory } from '../types/errors'
import { AuthErrorClassifier } from './error-classifier'
import { authLogger } from '../utils/logger'

export interface RetryOptions {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  exponentialBase: number
  jitter: boolean
}

export interface CircuitBreakerOptions {
  failureThreshold: number
  resetTimeout: number
  monitoringPeriod: number
}

export interface RecoveryAttempt {
  attemptNumber: number
  timestamp: Date
  error: AuthError
  recoveryStrategy: string
  success: boolean
  duration: number
}

export interface RecoveryResult {
  success: boolean
  attempts: RecoveryAttempt[]
  finalError?: AuthError
  recoveredBy?: string
  totalDuration: number
}

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED
  private failureCount = 0
  private lastFailureTime: Date | null = null
  private nextAttemptTime: Date | null = null

  constructor(
    private name: string,
    private options: CircuitBreakerOptions
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN
        authLogger.info(`Circuit breaker ${this.name} moving to HALF_OPEN state`)
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN - operation blocked`)
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) return false
    return new Date() >= this.nextAttemptTime
  }

  private onSuccess(): void {
    this.failureCount = 0
    this.state = CircuitBreakerState.CLOSED
    this.lastFailureTime = null
    this.nextAttemptTime = null
    authLogger.debug(`Circuit breaker ${this.name} reset to CLOSED state`)
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = new Date()

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.OPEN
      this.nextAttemptTime = new Date(Date.now() + this.options.resetTimeout)
      authLogger.warn(`Circuit breaker ${this.name} opened`, {
        failureCount: this.failureCount,
        resetTime: this.nextAttemptTime
      })
    }
  }

  getState(): CircuitBreakerState {
    return this.state
  }

  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    }
  }
}

export class AutoRecoveryManager {
  private static circuitBreakers = new Map<string, CircuitBreaker>()

  private static readonly DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialBase: 2,
    jitter: true
  }

  private static readonly DEFAULT_CIRCUIT_BREAKER_OPTIONS: CircuitBreakerOptions = {
    failureThreshold: 5,
    resetTimeout: 30000, // 30 seconds
    monitoringPeriod: 60000 // 1 minute
  }

  /**
   * Attempts to automatically recover from an authentication error
   */
  static async attemptRecovery(
    error: AuthError,
    context: string,
    retryFunction: () => Promise<any>,
    options?: Partial<RetryOptions>
  ): Promise<RecoveryResult> {
    const startTime = Date.now()
    const attempts: RecoveryAttempt[] = []
    const finalOptions = { ...this.DEFAULT_RETRY_OPTIONS, ...options }

    authLogger.info(`Starting auto-recovery for ${error.code}`, {
      context,
      category: error.category,
      recoverable: error.recoverable,
      retryable: error.retryable
    })

    // Check if error is recoverable
    if (!error.recoverable) {
      authLogger.warn(`Error ${error.code} is not recoverable`, { context })
      return {
        success: false,
        attempts: [],
        finalError: error,
        totalDuration: Date.now() - startTime
      }
    }

    // Get circuit breaker for this context
    const circuitBreaker = this.getCircuitBreaker(context)

    // Determine recovery strategy based on error type
    const strategies = this.getRecoveryStrategies(error)

    for (const strategy of strategies) {
      for (let attempt = 1; attempt <= finalOptions.maxRetries; attempt++) {
        const attemptStart = Date.now()
        
        try {
          // Wait for delay before retry (except first attempt)
          if (attempt > 1) {
            const delay = this.calculateDelay(attempt, finalOptions)
            authLogger.debug(`Waiting ${delay}ms before retry attempt ${attempt}`)
            await this.sleep(delay)
          }

          authLogger.info(`Recovery attempt ${attempt} using strategy: ${strategy}`, {
            context,
            errorCode: error.code,
            strategy,
            attempt
          })

          // Execute recovery through circuit breaker
          const result = await circuitBreaker.execute(async () => {
            return await this.executeRecoveryStrategy(strategy, error, retryFunction)
          })

          // Recovery successful
          const duration = Date.now() - attemptStart
          attempts.push({
            attemptNumber: attempt,
            timestamp: new Date(),
            error,
            recoveryStrategy: strategy,
            success: true,
            duration
          })

          authLogger.info(`Recovery successful using strategy: ${strategy}`, {
            context,
            attempt,
            strategy,
            duration
          })

          return {
            success: true,
            attempts,
            recoveredBy: strategy,
            totalDuration: Date.now() - startTime
          }

        } catch (recoveryError) {
          const duration = Date.now() - attemptStart
          const classifiedError = AuthErrorClassifier.classifyError(recoveryError)
          
          attempts.push({
            attemptNumber: attempt,
            timestamp: new Date(),
            error: classifiedError.error,
            recoveryStrategy: strategy,
            success: false,
            duration
          })

          authLogger.warn(`Recovery attempt ${attempt} failed`, {
            context,
            strategy,
            attempt,
            error: recoveryError,
            duration
          })

          // If this was the last attempt for this strategy, try next strategy
          if (attempt === finalOptions.maxRetries) {
            break
          }
        }
      }
    }

    // All recovery attempts failed
    const errorMetadata = {
      context: context,
      totalAttempts: attempts.length,
      totalDuration: Date.now() - startTime
    }
    authLogger.error(`All recovery attempts failed for ${error.code}`, error, errorMetadata)

    return {
      success: false,
      attempts,
      finalError: error,
      totalDuration: Date.now() - startTime
    }
  }

  /**
   * Gets or creates a circuit breaker for the given context
   */
  private static getCircuitBreaker(context: string): CircuitBreaker {
    if (!this.circuitBreakers.has(context)) {
      this.circuitBreakers.set(
        context,
        new CircuitBreaker(context, this.DEFAULT_CIRCUIT_BREAKER_OPTIONS)
      )
    }
    return this.circuitBreakers.get(context)!
  }

  /**
   * Determines recovery strategies based on error type
   */
  private static getRecoveryStrategies(error: AuthError): string[] {
    const strategies: string[] = []

    switch (error.category) {
      case AuthErrorCategory.NETWORK:
        strategies.push('network_retry', 'fallback_endpoint')
        break
      
      case AuthErrorCategory.TOKEN:
        if (error.code === AuthErrorCode.TOKEN_EXPIRED) {
          strategies.push('token_refresh', 'force_relogin')
        } else if (error.code === AuthErrorCode.TOKEN_SAVE_FAILED) {
          strategies.push('storage_retry', 'fallback_storage', 'memory_only')
        } else {
          strategies.push('token_cleanup', 'force_relogin')
        }
        break
      
      case AuthErrorCategory.AUTHENTICATION:
        if (error.code === AuthErrorCode.AUTH_SESSION_EXPIRED) {
          strategies.push('session_refresh', 'force_relogin')
        } else {
          strategies.push('credential_retry')
        }
        break
      
      case AuthErrorCategory.SERVER:
        strategies.push('server_retry', 'fallback_endpoint')
        break
      
      case AuthErrorCategory.INTERNAL:
        strategies.push('state_reset', 'cache_clear', 'force_reload')
        break
      
      default:
        strategies.push('generic_retry')
    }

    return strategies
  }

  /**
   * Executes a specific recovery strategy
   */
  private static async executeRecoveryStrategy(
    strategy: string,
    error: AuthError,
    retryFunction: () => Promise<any>
  ): Promise<any> {
    authLogger.debug(`Executing recovery strategy: ${strategy}`, { errorCode: error.code })

    switch (strategy) {
      case 'network_retry':
        return await retryFunction()
      
      case 'token_refresh':
        // Try to refresh the token before retrying
        await this.attemptTokenRefresh()
        return await retryFunction()
      
      case 'storage_retry':
        // Clear storage and retry
        await this.clearAuthStorage()
        return await retryFunction()
      
      case 'fallback_storage':
        // Try alternative storage method
        await this.switchToFallbackStorage()
        return await retryFunction()
      
      case 'memory_only':
        // Switch to memory-only mode
        await this.switchToMemoryOnlyMode()
        return await retryFunction()
      
      case 'session_refresh':
        // Try to refresh the session
        await this.refreshSession()
        return await retryFunction()
      
      case 'state_reset':
        // Reset internal state
        await this.resetInternalState()
        return await retryFunction()
      
      case 'cache_clear':
        // Clear all caches
        await this.clearAllCaches()
        return await retryFunction()
      
      case 'force_reload':
        // Force a page reload as last resort
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
        throw new Error('Page reload initiated')
      
      case 'force_relogin':
        // Force user to login again
        await this.forceRelogin()
        return await retryFunction()
      
      case 'fallback_endpoint':
        // Try alternative API endpoint
        await this.switchToFallbackEndpoint()
        return await retryFunction()
      
      default:
        // Generic retry without special handling
        return await retryFunction()
    }
  }

  /**
   * Recovery strategy implementations
   */
  private static async attemptTokenRefresh(): Promise<void> {
    authLogger.debug('Attempting token refresh for recovery')
    // Implementation would depend on your auth service
    // This is a placeholder for the actual token refresh logic
    try {
      // Example: await authService.refreshToken()
      authLogger.info('Token refresh successful during recovery')
    } catch (error) {
      authLogger.warn('Token refresh failed during recovery', error as Error)
      throw error
    }
  }

  private static async clearAuthStorage(): Promise<void> {
    authLogger.debug('Clearing auth storage for recovery')
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Clear cookies
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      
      authLogger.info('Auth storage cleared successfully')
    } catch (error) {
      authLogger.warn('Failed to clear auth storage', error as Error)
      throw error
    }
  }

  private static async switchToFallbackStorage(): Promise<void> {
    authLogger.debug('Switching to fallback storage method')
    // Implementation would switch storage method (e.g., localStorage to sessionStorage)
  }

  private static async switchToMemoryOnlyMode(): Promise<void> {
    authLogger.debug('Switching to memory-only storage mode')
    // Implementation would disable persistent storage and use memory only
  }

  private static async refreshSession(): Promise<void> {
    authLogger.debug('Attempting session refresh')
    // Implementation would refresh the current session
  }

  private static async resetInternalState(): Promise<void> {
    authLogger.debug('Resetting internal application state')
    // Implementation would reset Redux/Context state
  }

  private static async clearAllCaches(): Promise<void> {
    authLogger.debug('Clearing all application caches')
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      authLogger.info('All caches cleared successfully')
    } catch (error) {
      authLogger.warn('Failed to clear caches', error as Error)
    }
  }

  private static async forceRelogin(): Promise<void> {
    authLogger.debug('Forcing user relogin')
    await this.clearAuthStorage()
    // Implementation would redirect to login page or clear auth state
  }

  private static async switchToFallbackEndpoint(): Promise<void> {
    authLogger.debug('Switching to fallback API endpoint')
    // Implementation would switch API endpoint
  }

  /**
   * Calculate delay for exponential backoff with jitter
   */
  private static calculateDelay(attempt: number, options: RetryOptions): number {
    const baseDelay = Math.min(
      options.baseDelay * Math.pow(options.exponentialBase, attempt - 1),
      options.maxDelay
    )

    if (options.jitter) {
      // Add random jitter to prevent thundering herd
      return baseDelay + Math.random() * 1000
    }

    return baseDelay
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get recovery statistics
   */
  static getRecoveryStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    Array.from(this.circuitBreakers.entries()).forEach(([name, breaker]) => {
      stats[name] = breaker.getMetrics()
    })
    
    return stats
  }

  /**
   * Reset all circuit breakers
   */
  static resetAllCircuitBreakers(): void {
    this.circuitBreakers.clear()
    authLogger.info('All circuit breakers reset')
  }
}

export default AutoRecoveryManager 