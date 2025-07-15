import { useState, useCallback, useEffect } from 'react'
import { AuthError, AuthErrorCode, AuthErrorCategory } from '../lib/types/errors'
import { AuthErrorClassifier } from '../lib/errors/error-classifier'
import useAuthLogger from './useAuthLogger'

export interface ErrorState {
  error: AuthError | Error | string | null
  isLoading: boolean
  success: boolean
  retryCount: number
  lastAttempt: Date | null
}

export interface UseErrorHandlingOptions {
  component: string
  operation?: string
  maxRetries?: number
  retryDelay?: number
  autoRetry?: boolean
  onError?: (error: AuthError | Error | string) => void
  onSuccess?: () => void
  onMaxRetriesReached?: (error: AuthError | Error | string) => void
}

export function useErrorHandling({
  component,
  operation = 'unknown',
  maxRetries = 3,
  retryDelay = 1000,
  autoRetry = false,
  onError,
  onSuccess,
  onMaxRetriesReached
}: UseErrorHandlingOptions) {
  const [state, setState] = useState<ErrorState>({
    error: null,
    isLoading: false,
    success: false,
    retryCount: 0,
    lastAttempt: null
  })

  const logger = useAuthLogger({ 
    component,
    autoLogMount: false,
    autoLogUnmount: false 
  })

  // Clear error and reset state
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      success: false
    }))
  }, [])

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      success: false,
      error: loading ? null : prev.error
    }))
  }, [])

  // Set success state
  const setSuccess = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      success: true,
      error: null,
      retryCount: 0
    }))
    
    logger.info(`Operation successful: ${operation}`, {
      component,
      operation,
      timestamp: Date.now()
    })
    
    onSuccess?.()
  }, [operation, component, logger, onSuccess])

  // Handle error with classification and logging
  const handleError = useCallback((error: Error | string | AuthError, context?: string) => {
    const classificationResult = AuthErrorClassifier.classifyError(error, context)
    const classifiedError = classificationResult.error
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      success: false,
      error: classifiedError,
      lastAttempt: new Date()
    }))

    // Log the error
    logger.error(
      `Operation failed: ${operation}`,
      classifiedError,
      {
        operation,
        component,
        retryCount: state.retryCount,
        context
      }
    )

    onError?.(classifiedError)
  }, [operation, component, logger, onError, state.retryCount])

  // Retry logic
  const retry = useCallback(async (retryFunction?: () => Promise<void>) => {
    if (state.retryCount >= maxRetries) {
      logger.warn(`Max retries reached for operation: ${operation}`, {
        maxRetries,
        retryCount: state.retryCount,
        operation,
        component
      })
      
      onMaxRetriesReached?.(state.error!)
      return false
    }

    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      isLoading: true,
      error: null
    }))

    logger.info(`Retrying operation: ${operation}`, {
      attempt: state.retryCount + 1,
      maxRetries,
      operation,
      component
    })

    try {
      if (retryFunction) {
        await retryFunction()
      }
      return true
    } catch (error) {
      handleError(error as Error)
      return false
    }
  }, [state.retryCount, state.error, maxRetries, operation, component, logger, onMaxRetriesReached, handleError])

  // Auto-retry with exponential backoff
  const autoRetryWithBackoff = useCallback(async (retryFunction: () => Promise<void>) => {
    if (!autoRetry || state.retryCount >= maxRetries) {
      return false
    }

    const delay = retryDelay * Math.pow(2, state.retryCount)
    
    logger.debug(`Auto-retry scheduled`, {
      delay,
      attempt: state.retryCount + 1,
      operation,
      component
    })

    setTimeout(async () => {
      await retry(retryFunction)
    }, delay)

    return true
  }, [autoRetry, state.retryCount, maxRetries, retryDelay, operation, component, logger, retry])

  // Execute an operation with error handling
  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T | null> => {
    const opName = operationName || 'unknown'
    
    setLoading(true)
    
    try {
      logger.debug(`Starting operation: ${opName}`)
      
      const result = await operation()
      
      setSuccess()
      logger.info(`Operation completed successfully: ${opName}`)
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      logger.error(`Operation failed: ${opName}`, error as Error, {
        operationName: opName
      })
      
      handleError(error as Error, opName)
      
      // Try auto-retry if enabled
      if (autoRetry && state.retryCount < maxRetries) {
        await autoRetryWithBackoff(async () => {
          await operation()
        })
      }
      
      return null
    }
  }, [setLoading, setSuccess, handleError, autoRetry, state.retryCount, maxRetries, autoRetryWithBackoff, logger])

  // Create error from code
  const createError = useCallback((
    code: AuthErrorCode,
    message?: string,
    context?: string
  ): AuthError => {
    // Use one of the static factory methods from AuthErrorClassifier
    if (code === AuthErrorCode.TOKEN_SAVE_FAILED) {
      return AuthErrorClassifier.createTokenSaveError(context)
    }
    if (code === AuthErrorCode.NETWORK_CONNECTION_FAILED || code === AuthErrorCode.NETWORK_TIMEOUT || code === AuthErrorCode.NETWORK_OFFLINE) {
      return AuthErrorClassifier.createNetworkError(context)
    }
    if (code === AuthErrorCode.INTERNAL_RACE_CONDITION) {
      return AuthErrorClassifier.createRaceConditionError(context)
    }
    
    // Generic error creation for other codes
    const classificationResult = AuthErrorClassifier.classifyError(new Error(message || 'Unknown error'), context)
    return classificationResult.error
  }, [])

  // Check if error is retryable
  const isRetryable = useCallback((): boolean => {
    if (!state.error) return false
    
    if (state.error instanceof AuthError) {
      return state.error.retryable && state.retryCount < maxRetries
    }
    
    return state.retryCount < maxRetries
  }, [state.error, state.retryCount, maxRetries])

  // Check if error is recoverable
  const isRecoverable = useCallback((): boolean => {
    if (!state.error) return false
    
    if (state.error instanceof AuthError) {
      return state.error.recoverable
    }
    
    return true
  }, [state.error])

  // Get user-friendly error message
  const getUserFriendlyMessage = useCallback((): string | null => {
    if (!state.error) return null
    
    if (state.error instanceof AuthError) {
      return state.error.userMessage
    }
    
    if (typeof state.error === 'string') {
      return state.error
    }
    
    return 'Ocorreu um erro inesperado'
  }, [state.error])

  // Get suggested actions
  const getSuggestedActions = useCallback((): string[] => {
    if (!state.error || !(state.error instanceof AuthError)) {
      return ['Tente novamente']
    }
    
    // Use the classification result to get suggested actions
    const classificationResult = AuthErrorClassifier.classifyError(state.error)
    return classificationResult.suggestedActions || ['Tente novamente']
  }, [state.error])

  // Reset state completely
  const reset = useCallback(() => {
    setState({
      error: null,
      isLoading: false,
      success: false,
      retryCount: 0,
      lastAttempt: null
    })
  }, [])

  // Calculate time since last attempt
  const timeSinceLastAttempt = useCallback((): number | null => {
    if (!state.lastAttempt) return null
    return Date.now() - state.lastAttempt.getTime()
  }, [state.lastAttempt])

  // Check if should allow retry based on timing
  const shouldAllowRetry = useCallback((): boolean => {
    const timeSince = timeSinceLastAttempt()
    if (timeSince === null) return true
    
    // Minimum 1 second between retries
    return timeSince > 1000
  }, [timeSinceLastAttempt])

  // Effect to handle auto-retry on error
  useEffect(() => {
    if (state.error && autoRetry && isRetryable() && shouldAllowRetry()) {
      const delay = retryDelay * Math.pow(2, state.retryCount)
      
      const timeoutId = setTimeout(() => {
        logger.info(`Auto-retry triggered for ${operation}`, {
          attempt: state.retryCount + 1,
          delay
        })
      }, delay)

      return () => clearTimeout(timeoutId)
    }
  }, [state.error, autoRetry, isRetryable, shouldAllowRetry, retryDelay, state.retryCount, logger, operation])

  return {
    // State
    error: state.error,
    isLoading: state.isLoading,
    success: state.success,
    retryCount: state.retryCount,
    lastAttempt: state.lastAttempt,
    
    // Actions
    clearError,
    setLoading,
    setSuccess,
    handleError,
    retry,
    reset,
    executeWithErrorHandling,
    createError,
    
    // Utilities
    isRetryable,
    isRecoverable,
    getUserFriendlyMessage,
    getSuggestedActions,
    timeSinceLastAttempt,
    shouldAllowRetry,
    
    // Direct access to logger
    logger
  }
}

export default useErrorHandling 