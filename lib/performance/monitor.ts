/**
 * Monitor de Performance
 * 
 * Sistema avançado de monitoramento de performance para detectar
 * gargalos, medir métricas e otimizar a aplicação em tempo real.
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  category: 'api' | 'render' | 'memory' | 'network' | 'user-interaction'
  metadata?: Record<string, any>
}

interface PerformanceThreshold {
  metric: string
  warning: number
  critical: number
  unit: 'ms' | 'mb' | 'count' | 'percentage'
}

interface PerformanceReport {
  summary: {
    totalMetrics: number
    averageApiTime: number
    averageRenderTime: number
    memoryUsage: number
    errorRate: number
  }
  metrics: PerformanceMetric[]
  alerts: PerformanceAlert[]
  recommendations: string[]
}

interface PerformanceAlert {
  level: 'warning' | 'critical'
  metric: string
  value: number
  threshold: number
  message: string
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  private thresholds: PerformanceThreshold[] = [
    { metric: 'api-response-time', warning: 1000, critical: 3000, unit: 'ms' },
    { metric: 'render-time', warning: 100, critical: 300, unit: 'ms' },
    { metric: 'memory-usage', warning: 50, critical: 80, unit: 'mb' },
    { metric: 'bundle-size', warning: 1, critical: 2, unit: 'mb' },
    { metric: 'error-rate', warning: 5, critical: 10, unit: 'percentage' }
  ]
  private alerts: PerformanceAlert[] = []
  private isMonitoring = false

  /**
   * Iniciar monitoramento de performance
   */
  start(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.setupPerformanceObservers()
    this.startMemoryMonitoring()
    this.startNetworkMonitoring()
    this.startUserInteractionMonitoring()

    console.log('🚀 Performance Monitor iniciado')
  }

  /**
   * Parar monitoramento de performance
   */
  stop(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []

    console.log('⏹️ Performance Monitor parado')
  }

  /**
   * Configurar observadores de performance
   */
  private setupPerformanceObservers(): void {
    // Observer para Navigation Timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordMetric({
              name: 'page-load-time',
              value: navEntry.loadEventEnd - navEntry.navigationStart,
              category: 'render',
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
                firstPaint: navEntry.responseEnd - navEntry.navigationStart,
                type: navEntry.type
              }
            })
          }
        })
      })

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navigationObserver)
      } catch (error) {
        console.warn('Navigation timing não suportado:', error)
      }

      // Observer para Resource Timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            this.recordMetric({
              name: 'resource-load-time',
              value: resourceEntry.responseEnd - resourceEntry.startTime,
              category: 'network',
              metadata: {
                name: resourceEntry.name,
                size: resourceEntry.transferSize,
                type: this.getResourceType(resourceEntry.name),
                cached: resourceEntry.transferSize === 0
              }
            })
          }
        })
      })

      try {
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (error) {
        console.warn('Resource timing não suportado:', error)
      }

      // Observer para Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric({
            name: 'largest-contentful-paint',
            value: entry.startTime,
            category: 'render',
            metadata: {
              element: (entry as any).element?.tagName,
              url: (entry as any).url
            }
          })
        })
      })

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (error) {
        console.warn('LCP não suportado:', error)
      }

      // Observer para First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric({
            name: 'first-input-delay',
            value: (entry as any).processingStart - entry.startTime,
            category: 'user-interaction',
            metadata: {
              name: (entry as any).name,
              target: (entry as any).target?.tagName
            }
          })
        })
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (error) {
        console.warn('FID não suportado:', error)
      }
    }
  }

  /**
   * Iniciar monitoramento de memória
   */
  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory
        this.recordMetric({
          name: 'memory-usage',
          value: memory.usedJSHeapSize / 1024 / 1024, // MB
          category: 'memory',
          metadata: {
            total: memory.totalJSHeapSize / 1024 / 1024,
            limit: memory.jsHeapSizeLimit / 1024 / 1024
          }
        })
      }

      // Verificar memória a cada 30 segundos
      const memoryInterval = setInterval(checkMemory, 30000)
      checkMemory() // Verificação inicial

      // Cleanup quando parar o monitor
      const originalStop = this.stop.bind(this)
      this.stop = () => {
        clearInterval(memoryInterval)
        originalStop()
      }
    }
  }

  /**
   * Iniciar monitoramento de rede
   */
  private startNetworkMonitoring(): void {
    // Interceptar fetch para medir tempo de API
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const url = typeof args[0] === 'string' ? args[0] : args[0].url

      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()

        this.recordMetric({
          name: 'api-response-time',
          value: endTime - startTime,
          category: 'api',
          metadata: {
            url,
            method: args[1]?.method || 'GET',
            status: response.status,
            success: response.ok
          }
        })

        return response
      } catch (error) {
        const endTime = performance.now()

        this.recordMetric({
          name: 'api-response-time',
          value: endTime - startTime,
          category: 'api',
          metadata: {
            url,
            method: args[1]?.method || 'GET',
            error: true,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        })

        throw error
      }
    }

    // Monitorar conexão de rede
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.recordMetric({
        name: 'network-connection',
        value: connection.downlink || 0,
        category: 'network',
        metadata: {
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData
        }
      })

      // Monitorar mudanças na conexão
      connection.addEventListener('change', () => {
        this.recordMetric({
          name: 'network-connection',
          value: connection.downlink || 0,
          category: 'network',
          metadata: {
            effectiveType: connection.effectiveType,
            rtt: connection.rtt,
            saveData: connection.saveData
          }
        })
      })
    }
  }

  /**
   * Iniciar monitoramento de interações do usuário
   */
  private startUserInteractionMonitoring(): void {
    // Monitorar cliques
    document.addEventListener('click', (event) => {
      const startTime = performance.now()
      
      // Usar requestAnimationFrame para medir tempo de resposta
      requestAnimationFrame(() => {
        const endTime = performance.now()
        this.recordMetric({
          name: 'click-response-time',
          value: endTime - startTime,
          category: 'user-interaction',
          metadata: {
            target: (event.target as Element)?.tagName,
            className: (event.target as Element)?.className,
            id: (event.target as Element)?.id
          }
        })
      })
    })

    // Monitorar scroll performance
    let scrollTimeout: NodeJS.Timeout
    document.addEventListener('scroll', () => {
      const startTime = performance.now()
      
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const endTime = performance.now()
        this.recordMetric({
          name: 'scroll-performance',
          value: endTime - startTime,
          category: 'user-interaction',
          metadata: {
            scrollY: window.scrollY,
            scrollHeight: document.documentElement.scrollHeight
          }
        })
      }, 100)
    })
  }

  /**
   * Registrar métrica de performance
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    }

    this.metrics.push(fullMetric)
    this.checkThresholds(fullMetric)

    // Manter apenas as últimas 1000 métricas
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Verificar se métricas excedem thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.find(t => t.metric === metric.name)
    if (!threshold) return

    let level: 'warning' | 'critical' | null = null
    let thresholdValue = 0

    if (metric.value >= threshold.critical) {
      level = 'critical'
      thresholdValue = threshold.critical
    } else if (metric.value >= threshold.warning) {
      level = 'warning'
      thresholdValue = threshold.warning
    }

    if (level) {
      const alert: PerformanceAlert = {
        level,
        metric: metric.name,
        value: metric.value,
        threshold: thresholdValue,
        message: `${metric.name} (${metric.value.toFixed(2)}${threshold.unit}) excedeu o limite ${level} (${thresholdValue}${threshold.unit})`,
        timestamp: metric.timestamp
      }

      this.alerts.push(alert)
      console.warn(`⚠️ Performance Alert [${level.toUpperCase()}]:`, alert.message)

      // Manter apenas os últimos 100 alertas
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100)
      }
    }
  }

  /**
   * Obter relatório de performance
   */
  getReport(): PerformanceReport {
    const apiMetrics = this.metrics.filter(m => m.category === 'api')
    const renderMetrics = this.metrics.filter(m => m.category === 'render')
    const memoryMetrics = this.metrics.filter(m => m.category === 'memory')
    const errorMetrics = this.metrics.filter(m => m.metadata?.error === true)

    const averageApiTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
      : 0

    const averageRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
      : 0

    const latestMemory = memoryMetrics[memoryMetrics.length - 1]
    const memoryUsage = latestMemory ? latestMemory.value : 0

    const errorRate = this.metrics.length > 0
      ? (errorMetrics.length / this.metrics.length) * 100
      : 0

    return {
      summary: {
        totalMetrics: this.metrics.length,
        averageApiTime,
        averageRenderTime,
        memoryUsage,
        errorRate
      },
      metrics: this.metrics.slice(-100), // Últimas 100 métricas
      alerts: this.alerts.slice(-20), // Últimos 20 alertas
      recommendations: this.generateRecommendations()
    }
  }

  /**
   * Gerar recomendações de otimização
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const report = this.getReport()

    // Recomendações baseadas em API
    if (report.summary.averageApiTime > 1000) {
      recommendations.push('Considere implementar cache para reduzir tempo de resposta das APIs')
      recommendations.push('Verifique se há consultas desnecessárias ao backend')
    }

    // Recomendações baseadas em render
    if (report.summary.averageRenderTime > 100) {
      recommendations.push('Considere usar React.memo() para componentes que re-renderizam frequentemente')
      recommendations.push('Implemente lazy loading para componentes pesados')
    }

    // Recomendações baseadas em memória
    if (report.summary.memoryUsage > 50) {
      recommendations.push('Monitore vazamentos de memória em event listeners')
      recommendations.push('Considere implementar cleanup em useEffect hooks')
    }

    // Recomendações baseadas em erros
    if (report.summary.errorRate > 5) {
      recommendations.push('Implemente tratamento de erro mais robusto')
      recommendations.push('Adicione retry automático para operações que falham')
    }

    // Recomendações baseadas em alertas recentes
    const recentAlerts = this.alerts.filter(a => Date.now() - a.timestamp < 300000) // 5 minutos
    if (recentAlerts.length > 5) {
      recommendations.push('Muitos alertas recentes - considere revisar a performance geral')
    }

    return recommendations
  }

  /**
   * Determinar tipo de recurso baseado na URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image'
    if (url.includes('.woff') || url.includes('.ttf')) return 'font'
    if (url.includes('/api/')) return 'api'
    return 'other'
  }

  /**
   * Exportar métricas para análise externa
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      report: this.getReport(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }, null, 2)
  }

  /**
   * Limpar métricas antigas
   */
  clearMetrics(): void {
    this.metrics = []
    this.alerts = []
    console.log('🧹 Métricas de performance limpas')
  }
}

// Instância global do monitor
export const performanceMonitor = new PerformanceMonitor()

// Hook para usar o monitor em componentes React
export const usePerformanceMonitor = () => {
  const [report, setReport] = useState<PerformanceReport | null>(null)

  useEffect(() => {
    // Iniciar monitor quando o hook é usado
    performanceMonitor.start()

    // Atualizar relatório a cada 30 segundos
    const interval = setInterval(() => {
      setReport(performanceMonitor.getReport())
    }, 30000)

    // Relatório inicial
    setReport(performanceMonitor.getReport())

    return () => {
      clearInterval(interval)
      // Não parar o monitor aqui pois pode ser usado em outros componentes
    }
  }, [])

  return {
    report,
    recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => 
      performanceMonitor.recordMetric(metric),
    exportMetrics: () => performanceMonitor.exportMetrics(),
    clearMetrics: () => performanceMonitor.clearMetrics()
  }
}

// Função para medir performance de operações específicas
export const measurePerformance = async <T>(
  operation: () => Promise<T> | T,
  name: string,
  category: PerformanceMetric['category'] = 'api'
): Promise<T> => {
  const startTime = performance.now()
  
  try {
    const result = await operation()
    const endTime = performance.now()
    
    performanceMonitor.recordMetric({
      name,
      value: endTime - startTime,
      category,
      metadata: { success: true }
    })
    
    return result
  } catch (error) {
    const endTime = performance.now()
    
    performanceMonitor.recordMetric({
      name,
      value: endTime - startTime,
      category,
      metadata: { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    })
    
    throw error
  }
}

// Decorator para medir performance de métodos de classe
export const measureMethod = (
  name?: string,
  category: PerformanceMetric['category'] = 'api'
) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const metricName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      return measurePerformance(
        () => originalMethod.apply(this, args),
        metricName,
        category
      )
    }

    return descriptor
  }
}

export default performanceMonitor

