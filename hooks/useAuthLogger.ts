import { useCallback, useEffect, useRef } from 'react'
import { authLogger, LogContext, AuthLogEvent, LogLevel } from '../lib/utils/logger'

export interface UseAuthLoggerOptions {
  component?: string
  userId?: string
  sessionId?: string
  autoLogMount?: boolean
  autoLogUnmount?: boolean
}

export function useAuthLogger(options: UseAuthLoggerOptions = {}) {
  const {
    component = 'UnknownComponent',
    userId,
    sessionId,
    autoLogMount = false,
    autoLogUnmount = false
  } = options

  const loggerRef = useRef(authLogger.child({
    component,
    userId,
    sessionId
  }))

  // Update logger context when options change
  useEffect(() => {
    loggerRef.current = authLogger.child({
      component,
      userId,
      sessionId
    })
  }, [component, userId, sessionId])

  // Auto-log component mount/unmount
  useEffect(() => {
    if (autoLogMount) {
      loggerRef.current.debug(`Component mounted: ${component}`)
    }

    return () => {
      if (autoLogUnmount) {
        loggerRef.current.debug(`Component unmounting: ${component}`)
      }
    }
  }, [component, autoLogMount, autoLogUnmount])

  // Logging methods
  const debug = useCallback((message: string, data?: Record<string, any>, context?: LogContext) => {
    loggerRef.current.debug(message, data, context)
  }, [])

  const info = useCallback((message: string, data?: Record<string, any>, context?: LogContext) => {
    loggerRef.current.info(message, data, context)
  }, [])

  const warn = useCallback((message: string, data?: Record<string, any>, context?: LogContext) => {
    loggerRef.current.warn(message, data, context)
  }, [])

  const error = useCallback((message: string, error?: Error | string, data?: Record<string, any>, context?: LogContext) => {
    loggerRef.current.error(message, error, data, context)
  }, [])

  // Auth-specific logging
  const logAuthEvent = useCallback((event: AuthLogEvent) => {
    loggerRef.current.logAuthEvent(event)
  }, [])

  // Performance logging
  const timeOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: LogContext
  ): Promise<T> => {
    return loggerRef.current.timeOperation(operationName, operation, context)
  }, [])

  const logPerformance = useCallback((operation: string, duration: number, metadata?: Record<string, any>) => {
    loggerRef.current.logPerformance(operation, duration, metadata)
  }, [])

  // HTTP request logging
  const logHttpRequest = useCallback((
    method: string,
    url: string,
    requestData?: any,
    responseData?: any,
    statusCode?: number,
    duration?: number,
    error?: Error | string
  ) => {
    loggerRef.current.logHttpRequest(method, url, requestData, responseData, statusCode, duration, error)
  }, [])

  // Update logger context dynamically
  const updateContext = useCallback((key: string, value: any) => {
    loggerRef.current.updateContext(key, value)
  }, [])

  const setContext = useCallback((context: Partial<LogContext>) => {
    loggerRef.current.setContext(context)
  }, [])

  // Set log level
  const setLogLevel = useCallback((level: LogLevel) => {
    loggerRef.current.setLogLevel(level)
  }, [])

  // Create child logger with additional context
  const createChild = useCallback((context: LogContext) => {
    return loggerRef.current.child(context)
  }, [])

  // Resource monitoring
  const logResourceUsage = useCallback(() => {
    loggerRef.current.logResourceUsage()
  }, [])

  // Helper methods for common authentication operations
  const logLoginStart = useCallback((email?: string) => {
    logAuthEvent({
      event: 'login_start',
      email,
      details: { timestamp: Date.now() }
    })
  }, [logAuthEvent])

  const logLoginSuccess = useCallback((userId: string, email?: string, duration?: number) => {
    logAuthEvent({
      event: 'login_success',
      userId,
      email,
      duration,
      details: { timestamp: Date.now() }
    })
  }, [logAuthEvent])

  const logLoginError = useCallback((error: Error | string, email?: string, attemptNumber?: number) => {
    logAuthEvent({
      event: 'login_error',
      email,
      error,
      attemptNumber,
      details: { timestamp: Date.now() }
    })
  }, [logAuthEvent])

  const logTokenRefresh = useCallback((success: boolean, error?: Error | string) => {
    logAuthEvent({
      event: 'token_refresh',
      error: success ? undefined : error,
      details: { 
        success,
        timestamp: Date.now()
      }
    })
  }, [logAuthEvent])

  const logTokenSave = useCallback((success: boolean, error?: Error | string, attemptNumber?: number) => {
    logAuthEvent({
      event: 'token_save',
      error: success ? undefined : error,
      attemptNumber,
      details: { 
        success,
        timestamp: Date.now()
      }
    })
  }, [logAuthEvent])

  const logTokenVerify = useCallback((success: boolean, error?: Error | string) => {
    logAuthEvent({
      event: 'token_verify',
      error: success ? undefined : error,
      details: { 
        success,
        timestamp: Date.now()
      }
    })
  }, [logAuthEvent])

  const logSyncTokens = useCallback((success: boolean, error?: Error | string, duration?: number) => {
    logAuthEvent({
      event: 'sync_tokens',
      error: success ? undefined : error,
      duration,
      details: { 
        success,
        timestamp: Date.now()
      }
    })
  }, [logAuthEvent])

  const logRaceCondition = useCallback((operation: string, error?: Error | string, attemptNumber?: number) => {
    logAuthEvent({
      event: 'race_condition',
      error,
      attemptNumber,
      details: { 
        operation,
        timestamp: Date.now()
      }
    })
  }, [logAuthEvent])

  const logRecoveryAttempt = useCallback((strategy: string, success: boolean, error?: Error | string, attemptNumber?: number) => {
    logAuthEvent({
      event: 'recovery_attempt',
      error: success ? undefined : error,
      attemptNumber,
      details: { 
        strategy,
        success,
        timestamp: Date.now()
      }
    })
  }, [logAuthEvent])

  const logLogout = useCallback((userId?: string, reason?: string) => {
    logAuthEvent({
      event: 'logout',
      userId,
      details: { 
        reason,
        timestamp: Date.now()
      }
    })
  }, [logAuthEvent])

  return {
    // Basic logging methods
    debug,
    info,
    warn,
    error,
    
    // Auth event logging
    logAuthEvent,
    
    // Performance logging
    timeOperation,
    logPerformance,
    
    // HTTP logging
    logHttpRequest,
    
    // Context management
    updateContext,
    setContext,
    setLogLevel,
    createChild,
    
    // Resource monitoring
    logResourceUsage,
    
    // Auth-specific helpers
    logLoginStart,
    logLoginSuccess,
    logLoginError,
    logTokenRefresh,
    logTokenSave,
    logTokenVerify,
    logSyncTokens,
    logRaceCondition,
    logRecoveryAttempt,
    logLogout,
    
    // Direct access to logger instance
    logger: loggerRef.current
  }
}

export default useAuthLogger 