/**
 * Sistema de logging centralizado para capturar e reportar erros
 */

// Structured logging system for authentication flow
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
  // Adicionando compatibilidade com strings
  debug = 0,
  info = 1,
  warn = 2,
  error = 3,
  silent = 4
}

export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  component?: string
  operation?: string
  [key: string]: any
}

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  context?: LogContext
  data?: Record<string, any>
  error?: Error | string
  stack?: string
  duration?: number
}

export interface AuthLogEvent {
  event: 'login_start' | 'login_success' | 'login_error' | 'logout' | 'token_refresh' | 'token_save' | 'token_verify' | 'sync_tokens' | 'race_condition' | 'recovery_attempt'
  userId?: string
  email?: string
  details?: Record<string, any>
  error?: Error | string
  duration?: number
  attemptNumber?: number
}

export class AuthLogger {
  private currentLogLevel: LogLevel = LogLevel.INFO
  private context: LogContext = {}
  private isDevelopment: boolean = true

  constructor() {
    // Set log level based on environment
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.currentLogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
    
    // Set initial context
    this.context = {
      component: 'AuthSystem',
      sessionId: this.generateSessionId()
    }
  }

  /**
   * Set global context that will be included in all logs
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * Update specific context values
   */
  updateContext(key: string, value: any): void {
    this.context[key] = value
  }

  /**
   * Set the current log level
   */
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Mask sensitive data in objects
   */
  private maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sensitiveKeys = [
      'password', 'token', 'accessToken', 'refreshToken', 'jwt',
      'authorization', 'cookie', 'session', 'secret', 'key',
      'credential', 'auth', 'bearer'
    ]

    const masked = Array.isArray(data) ? [...data] : { ...data }

    const maskValue = (obj: any, path: string[] = []): any => {
      if (obj === null || obj === undefined) return obj
      
      if (typeof obj === 'string') {
        const fullPath = path.join('.').toLowerCase()
        const shouldMask = sensitiveKeys.some(key => 
          fullPath.includes(key) || path.some(p => p.toLowerCase().includes(key))
        )
        
        if (shouldMask) {
          return obj.length > 8 ? `${obj.substr(0, 4)}***${obj.substr(-4)}` : '***'
        }
        return obj
      }

      if (typeof obj === 'object' && !Array.isArray(obj)) {
        const result: any = {}
        for (const [key, value] of Object.entries(obj)) {
          const keyLower = key.toLowerCase()
          if (sensitiveKeys.some(sensitiveKey => keyLower.includes(sensitiveKey))) {
            result[key] = typeof value === 'string' && value.length > 8 
              ? `${value.substr(0, 4)}***${value.substr(-4)}`
              : '***'
          } else {
            result[key] = maskValue(value, [...path, key])
          }
        }
        return result
      }

      if (Array.isArray(obj)) {
        return obj.map((item, index) => maskValue(item, [...path, index.toString()]))
      }

      return obj
    }

    return maskValue(masked)
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: Record<string, any>,
    error?: Error | string,
    context?: LogContext
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: { ...this.context, ...context },
      data: data ? this.maskSensitiveData(data) : undefined,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    }

    return entry
  }

  /**
   * Format log entry for console output
   */
  private formatLogEntry(entry: LogEntry): string {
    const levelNames = ['🔧 DEBUG', '📝 INFO', '⚠️ WARN', '❌ ERROR']
    const levelName = levelNames[entry.level] || '🔍 LOG'
    
    const timestamp = entry.timestamp.toISOString()
    const component = entry.context?.component || 'Unknown'
    const operation = entry.context?.operation || ''
    
    let output = `${levelName} [${timestamp}] ${component}${operation ? ` - ${operation}` : ''}: ${entry.message}`
    
    if (entry.context && Object.keys(entry.context).length > 2) {
      const contextData = { ...entry.context }
      delete contextData.component
      delete contextData.operation
      output += `\n  Context: ${JSON.stringify(contextData, null, 2)}`
    }
    
    if (entry.data) {
      output += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`
    }
    
    if (entry.error) {
      output += `\n  Error: ${entry.error}`
    }
    
    if (entry.stack && this.isDevelopment) {
      output += `\n  Stack: ${entry.stack}`
    }
    
    if (entry.duration !== undefined) {
      output += `\n  Duration: ${entry.duration}ms`
    }
    
    return output
  }

  /**
   * Check if a log level should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: Record<string, any>, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data, undefined, context)
    console.log(this.formatLogEntry(entry))
  }

  /**
   * Info level logging
   */
  info(message: string, data?: Record<string, any>, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    const entry = this.createLogEntry(LogLevel.INFO, message, data, undefined, context)
    console.log(this.formatLogEntry(entry))
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: Record<string, any>, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    const entry = this.createLogEntry(LogLevel.WARN, message, data, undefined, context)
    console.warn(this.formatLogEntry(entry))
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | string, data?: Record<string, any>, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, data, error, context)
    console.error(this.formatLogEntry(entry))
  }

  /**
   * Log authentication events with structured data
   */
  logAuthEvent(event: AuthLogEvent): void {
    const startTime = Date.now()
    
    const context: LogContext = {
      ...this.context,
      operation: event.event,
      userId: event.userId,
      email: event.email ? this.maskSensitiveData({ email: event.email }).email : undefined
    }

    const data = {
      event: event.event,
      details: event.details ? this.maskSensitiveData(event.details) : undefined,
      duration: event.duration,
      attemptNumber: event.attemptNumber
    }

    if (event.error) {
      this.error(`Auth event failed: ${event.event}`, event.error, data, context)
    } else {
      this.info(`Auth event: ${event.event}`, data, context)
    }
  }

  /**
   * Time a function execution and log the result
   */
  async timeOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const startTime = Date.now()
    const operationContext = { ...context, operation: operationName }
    
    this.debug(`Starting operation: ${operationName}`, undefined, operationContext)
    
    try {
      const result = await operation()
      const duration = Date.now() - startTime
      
      this.info(`Operation completed: ${operationName}`, { duration }, operationContext)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      this.error(
        `Operation failed: ${operationName}`,
        error instanceof Error ? error : String(error),
        { duration },
        operationContext
      )
      throw error
    }
  }

  /**
   * Log HTTP request/response details
   */
  logHttpRequest(
    method: string,
    url: string,
    requestData?: any,
    responseData?: any,
    statusCode?: number,
    duration?: number,
    error?: Error | string
  ): void {
    const context: LogContext = {
      ...this.context,
      operation: 'http_request'
    }

    const data = {
      method,
      url: this.maskSensitiveData({ url }).url,
      statusCode,
      duration,
      requestData: requestData ? this.maskSensitiveData(requestData) : undefined,
      responseData: responseData ? this.maskSensitiveData(responseData) : undefined
    }

    if (error) {
      this.error(`HTTP ${method} ${url} failed`, error, data, context)
    } else if (statusCode && statusCode >= 400) {
      this.warn(`HTTP ${method} ${url} returned ${statusCode}`, data, context)
    } else {
      this.info(`HTTP ${method} ${url} completed`, data, context)
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): AuthLogger {
    const childLogger = new AuthLogger()
    childLogger.currentLogLevel = this.currentLogLevel
    childLogger.isDevelopment = this.isDevelopment
    childLogger.context = { ...this.context, ...context }
    return childLogger
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const context: LogContext = {
      ...this.context,
      operation: 'performance'
    }

    const data = {
      operation,
      duration,
      ...metadata
    }

    if (duration > 5000) {
      this.warn(`Slow operation detected: ${operation}`, data, context)
    } else if (duration > 2000) {
      this.info(`Operation took longer than expected: ${operation}`, data, context)
    } else {
      this.debug(`Performance: ${operation}`, data, context)
    }
  }

  /**
   * Log memory and resource usage
   */
  logResourceUsage(): void {
    if (!this.isDevelopment) return

    try {
      const memoryUsage = (performance as any).memory
      if (memoryUsage) {
        const data = {
          usedJSHeapSize: Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024),
          totalJSHeapSize: Math.round(memoryUsage.totalJSHeapSize / 1024 / 1024),
          jsHeapSizeLimit: Math.round(memoryUsage.jsHeapSizeLimit / 1024 / 1024)
        }

        this.debug('Resource usage', data, { operation: 'resource_monitoring' })
      }
    } catch (error) {
      // Memory API not available, skip
    }
  }

  /**
   * Log performance metrics (novo método para compatibilidade)
   */
  performance(message: string, context?: LogContext): void {
    this.info(`⏱️ ${message}`, undefined, context);
  }

  /**
   * API-specific logging (novo método para compatibilidade)
   */
  api(message: string, ...args: unknown[]): void {
    this.debug(`🌐 ${message}`, { args }, { component: 'API' });
  }
}

// Create singleton instance
export const authLogger = new AuthLogger()

// Export helper functions
export const logAuthEvent = (event: AuthLogEvent) => authLogger.logAuthEvent(event)
export const timeOperation = <T>(name: string, operation: () => Promise<T>, context?: LogContext) => 
  authLogger.timeOperation(name, operation, context)
export const createChildLogger = (context: LogContext) => authLogger.child(context)

// Adicionando funções auxiliares para compatibilidade
export const measureTime = <T>(
  fn: () => T | Promise<T>,
  label: string,
  context?: LogContext
): T | Promise<T> => {
  const start = performance.now();
  
  const logResult = (result: T) => {
    const end = performance.now();
    authLogger.performance(`${label} took ${(end - start).toFixed(2)}ms`, context);
    return result;
  };

  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then(logResult).catch(error => {
        const end = performance.now();
        authLogger.error(`${label} failed after ${(end - start).toFixed(2)}ms: ${error}`, undefined, context);
        throw error;
      });
    }
    
    return logResult(result);
  } catch (error) {
    const end = performance.now();
    authLogger.error(`${label} failed after ${(end - start).toFixed(2)}ms: ${error}`, undefined, context);
    throw error;
  }
};

export const createDebouncedLogger = (delay: number = 1000) => {
  const timeouts = new Map<string, NodeJS.Timeout>();
  
  return {
    debug: (key: string, message: string, context?: LogContext) => {
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key)!);
      }
      
      timeouts.set(key, setTimeout(() => {
        authLogger.debug(message, undefined, context);
        timeouts.delete(key);
      }, delay));
    },
    
    info: (key: string, message: string, context?: LogContext) => {
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key)!);
      }
      
      timeouts.set(key, setTimeout(() => {
        authLogger.info(message, undefined, context);
        timeouts.delete(key);
      }, delay));
    }
  };
};

// Mantendo compatibilidade com exportação esperada
export default {
  log: authLogger.info.bind(authLogger),
  warn: authLogger.warn.bind(authLogger),
  error: authLogger.error.bind(authLogger),
  debug: authLogger.debug.bind(authLogger),
  performance: authLogger.performance.bind(authLogger),
  api: authLogger.api.bind(authLogger),
  measureTime,
  createDebouncedLogger
};

