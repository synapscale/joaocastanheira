/**
 * Utilitário de logging com controle de ambiente
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogConfig {
  level: LogLevel
  enableColors: boolean
  enableTimestamp: boolean
  enableContext: boolean
}

const defaultConfig: LogConfig = {
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  enableColors: true,
  enableTimestamp: process.env.NODE_ENV === 'development',
  enableContext: process.env.NODE_ENV === 'development'
}

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

const colors = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m'
}

class Logger {
  private config: LogConfig

  constructor(config: Partial<LogConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevels[level] >= logLevels[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    let formatted = ''
    
    if (this.config.enableTimestamp) {
      formatted += `[${new Date().toISOString()}] `
    }
    
    if (this.config.enableColors && typeof window === 'undefined') {
      formatted += `${colors[level]}${level.toUpperCase()}${colors.reset}`
    } else {
      formatted += level.toUpperCase()
    }
    
    if (context && this.config.enableContext) {
      formatted += ` [${context}]`
    }
    
    formatted += `: ${message}`
    
    return formatted
  }

  debug(message: string, context?: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context), ...args)
    }
  }

  info(message: string, context?: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context), ...args)
    }
  }

  warn(message: string, context?: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context), ...args)
    }
  }

  error(message: string, context?: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context), ...args)
    }
  }

  // Métodos de conveniência para contextos específicos
  api(message: string, ...args: unknown[]): void {
    this.debug(message, 'API', ...args)
  }

  ui(message: string, ...args: unknown[]): void {
    this.debug(message, 'UI', ...args)
  }

  auth(message: string, ...args: unknown[]): void {
    this.debug(message, 'AUTH', ...args)
  }

  performance(message: string, ...args: unknown[]): void {
    this.info(message, 'PERF', ...args)
  }
}

// Instância global do logger
export const logger = new Logger()

// Logger específico para desenvolvimento
export const devLogger = new Logger({
  level: 'debug',
  enableColors: true,
  enableTimestamp: true,
  enableContext: true
})

// Logger específico para produção
export const prodLogger = new Logger({
  level: 'error',
  enableColors: false,
  enableTimestamp: false,
  enableContext: false
})

// Função para medir performance
export const measureTime = <T>(
  fn: () => T | Promise<T>,
  label: string,
  context?: string
): T | Promise<T> => {
  const start = performance.now()
  
  const logResult = (result: T) => {
    const end = performance.now()
    logger.performance(`${label} took ${(end - start).toFixed(2)}ms`, context)
    return result
  }

  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.then(logResult).catch(error => {
        const end = performance.now()
        logger.error(`${label} failed after ${(end - start).toFixed(2)}ms: ${error}`, context)
        throw error
      })
    }
    
    return logResult(result)
  } catch (error) {
    const end = performance.now()
    logger.error(`${label} failed after ${(end - start).toFixed(2)}ms: ${error}`, context)
    throw error
  }
}

// Função para debounce de logs (evita spam)
export const createDebouncedLogger = (delay: number = 1000) => {
  const timeouts = new Map<string, NodeJS.Timeout>()
  
  return {
    debug: (key: string, message: string, context?: string, ...args: unknown[]) => {
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key)!)
      }
      
      timeouts.set(key, setTimeout(() => {
        logger.debug(message, context, ...args)
        timeouts.delete(key)
      }, delay))
    },
    
    info: (key: string, message: string, context?: string, ...args: unknown[]) => {
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key)!)
      }
      
      timeouts.set(key, setTimeout(() => {
        logger.info(message, context, ...args)
        timeouts.delete(key)
      }, delay))
    }
  }
}

// Manter compatibilidade com o logger anterior
export default {
  log: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  debug: logger.debug.bind(logger)
}
