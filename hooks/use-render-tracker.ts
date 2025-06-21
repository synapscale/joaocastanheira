import { useEffect, useRef } from 'react'
import { logger } from '@/utils/logger'

/**
 * Hook para rastrear e debugar re-renders de componentes
 * Útil para identificar componentes que estão re-renderizando desnecessariamente
 */
export function useRenderTracker(
  componentName: string,
  props?: Record<string, any>,
  options: {
    enabled?: boolean
    logLevel?: 'debug' | 'info' | 'warn'
    maxRenders?: number
    timeWindow?: number // em ms
  } = {}
) {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logLevel = 'debug',
    maxRenders = 10,
    timeWindow = 5000 // 5 segundos
  } = options

  const renderCount = useRef(0)
  const firstRenderTime = useRef<number | null>(null)
  const lastRenderTime = useRef<number | null>(null)
  const propsRef = useRef<Record<string, any>>({})

  useEffect(() => {
    if (!enabled) return

    const now = Date.now()
    renderCount.current += 1

    if (firstRenderTime.current === null) {
      firstRenderTime.current = now
    }
    lastRenderTime.current = now

    // Verificar se há muitas re-renders em pouco tempo
    const timeElapsed = now - (firstRenderTime.current || now)
    if (renderCount.current > maxRenders && timeElapsed < timeWindow) {
      logger.warn(
        `${componentName} rendered ${renderCount.current} times in ${timeElapsed}ms - possible performance issue`,
        'RENDER_TRACKER'
      )
    }

    // Log de render com detalhes
    const logMessage = `${componentName} rendered (#${renderCount.current})`
    
    if (logLevel === 'debug') {
      logger.debug(logMessage, 'RENDER_TRACKER')
    } else if (logLevel === 'info') {
      logger.info(logMessage, 'RENDER_TRACKER')
    } else if (logLevel === 'warn') {
      logger.warn(logMessage, 'RENDER_TRACKER')
    }

    // Comparar props para identificar mudanças
    if (props) {
      const changedProps: string[] = []
      
      Object.keys(props).forEach(key => {
        if (propsRef.current[key] !== props[key]) {
          changedProps.push(key)
        }
      })

      if (changedProps.length > 0) {
        logger.debug(
          `${componentName} props changed: ${changedProps.join(', ')}`,
          'RENDER_TRACKER'
        )
      }

      propsRef.current = { ...props }
    }
  })

  return {
    renderCount: renderCount.current,
    avgRenderTime: firstRenderTime.current 
      ? (lastRenderTime.current! - firstRenderTime.current) / renderCount.current
      : 0
  }
}

/**
 * Hook para detectar re-renders causados por mudanças específicas
 */
export function useWhyDidYouUpdate(
  componentName: string,
  props: Record<string, any>,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const previousProps = useRef<Record<string, any>>()

  useEffect(() => {
    if (!enabled) return

    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props })
      const changedProps: Record<string, { from: any; to: any }> = {}

      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          }
        }
      })

      if (Object.keys(changedProps).length > 0) {
        logger.debug(
          `${componentName} re-rendered due to:`,
          'WHY_UPDATE',
          changedProps
        )
      }
    }

    previousProps.current = props
  })
}

/**
 * Hook para medir tempo de render de componentes
 */
export function useRenderTime(
  componentName: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const startTime = useRef<number>()

  // Marca o início do render
  if (enabled) {
    startTime.current = performance.now()
  }

  useEffect(() => {
    if (!enabled || !startTime.current) return

    const endTime = performance.now()
    const renderTime = endTime - startTime.current

    if (renderTime > 16) { // Mais de 16ms pode causar frame drops
      logger.warn(
        `${componentName} render took ${renderTime.toFixed(2)}ms`,
        'RENDER_TIME'
      )
    } else {
      logger.debug(
        `${componentName} render took ${renderTime.toFixed(2)}ms`,
        'RENDER_TIME'
      )
    }
  })
}

/**
 * Hook para detectar vazamentos de memória em componentes
 */
export function useMemoryLeakDetector(
  componentName: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const mountTime = useRef<number>()
  const timers = useRef<Set<NodeJS.Timeout>>(new Set())
  const intervals = useRef<Set<NodeJS.Timeout>>(new Set())
  const listeners = useRef<Set<() => void>>(new Set())

  useEffect(() => {
    if (!enabled) return

    mountTime.current = Date.now()

    return () => {
      const unmountTime = Date.now()
      const lifeTime = unmountTime - (mountTime.current || unmountTime)

      // Verificar se há timers/intervals não limpos
      if (timers.current.size > 0) {
        logger.warn(
          `${componentName} unmounted with ${timers.current.size} active timers - possible memory leak`,
          'MEMORY_LEAK'
        )
      }

      if (intervals.current.size > 0) {
        logger.warn(
          `${componentName} unmounted with ${intervals.current.size} active intervals - possible memory leak`,
          'MEMORY_LEAK'
        )
      }

      if (listeners.current.size > 0) {
        logger.warn(
          `${componentName} unmounted with ${listeners.current.size} active listeners - possible memory leak`,
          'MEMORY_LEAK'
        )
      }

      logger.debug(
        `${componentName} lifetime: ${lifeTime}ms`,
        'MEMORY_LEAK'
      )
    }
  }, [componentName, enabled])

  return {
    trackTimer: (timer: NodeJS.Timeout) => {
      timers.current.add(timer)
      return () => {
        timers.current.delete(timer)
        clearTimeout(timer)
      }
    },
    trackInterval: (interval: NodeJS.Timeout) => {
      intervals.current.add(interval)
      return () => {
        intervals.current.delete(interval)
        clearInterval(interval)
      }
    },
    trackListener: (cleanup: () => void) => {
      listeners.current.add(cleanup)
      return () => {
        listeners.current.delete(cleanup)
        cleanup()
      }
    }
  }
} 