/**
 * Timer Cleanup Utilities for Integration Tests
 * Prevents memory leaks from uncleaned timers
 */

export class TimerManager {
  private static timers: Set<number> = new Set()
  private static intervals: Set<number> = new Set()
  private static animationFrames: Set<number> = new Set()

  /**
   * Wrapper para setTimeout que rastreia o timer
   */
  static setTimeout(callback: () => void, delay: number): number {
    const timerId = window.setTimeout(() => {
      this.timers.delete(timerId)
      callback()
    }, delay)
    
    this.timers.add(timerId)
    return timerId
  }

  /**
   * Wrapper para setInterval que rastreia o timer
   */
  static setInterval(callback: () => void, delay: number): number {
    const timerId = window.setInterval(callback, delay)
    this.intervals.add(timerId)
    return timerId
  }

  /**
   * Wrapper para requestAnimationFrame que rastreia o frame
   */
  static requestAnimationFrame(callback: FrameRequestCallback): number {
    const frameId = window.requestAnimationFrame((time) => {
      this.animationFrames.delete(frameId)
      callback(time)
    })
    
    this.animationFrames.add(frameId)
    return frameId
  }

  /**
   * Limpa um timer específico
   */
  static clearTimeout(timerId: number): void {
    window.clearTimeout(timerId)
    this.timers.delete(timerId)
  }

  /**
   * Limpa um interval específico
   */
  static clearInterval(timerId: number): void {
    window.clearInterval(timerId)
    this.intervals.delete(timerId)
  }

  /**
   * Cancela um animation frame específico
   */
  static cancelAnimationFrame(frameId: number): void {
    window.cancelAnimationFrame(frameId)
    this.animationFrames.delete(frameId)
  }

  /**
   * Limpa todos os timers rastreados
   */
  static clearAllTimers(): void {
    // Limpar timeouts
    this.timers.forEach(timerId => {
      window.clearTimeout(timerId)
    })
    this.timers.clear()

    // Limpar intervals
    this.intervals.forEach(timerId => {
      window.clearInterval(timerId)
    })
    this.intervals.clear()

    // Limpar animation frames
    this.animationFrames.forEach(frameId => {
      window.cancelAnimationFrame(frameId)
    })
    this.animationFrames.clear()
  }

  /**
   * Verifica se há timers pendentes
   */
  static hasPendingTimers(): boolean {
    return this.timers.size > 0 || this.intervals.size > 0 || this.animationFrames.size > 0
  }

  /**
   * Retorna informações sobre timers pendentes
   */
  static getPendingTimersInfo(): {
    timeouts: number
    intervals: number
    animationFrames: number
    total: number
  } {
    return {
      timeouts: this.timers.size,
      intervals: this.intervals.size,
      animationFrames: this.animationFrames.size,
      total: this.timers.size + this.intervals.size + this.animationFrames.size
    }
  }

  /**
   * Reset completo para uso entre testes
   */
  static reset(): void {
    this.clearAllTimers()
  }
}

/**
 * Hook para setup automático de limpeza de timers
 */
export function setupTimerCleanup(): void {
  beforeEach(() => {
    // Limpar timers antes de cada teste
    TimerManager.reset()
    
    // Configurar Jest fake timers
    jest.useFakeTimers()
    jest.clearAllTimers()
  })

  afterEach(() => {
    // Limpar todos os timers após cada teste
    TimerManager.clearAllTimers()
    
    // Limpar Jest timers
    jest.clearAllTimers()
    jest.runOnlyPendingTimers()
    
    // Restaurar timers reais
    jest.useRealTimers()
    
    // Verificar se há timers pendentes
    const pendingInfo = TimerManager.getPendingTimersInfo()
    if (pendingInfo.total > 0) {
      console.warn('⚠️ Timers pendentes detectados:', pendingInfo)
    }
  })
}

/**
 * Função auxiliar para aguardar que todos os timers sejam executados
 */
export async function flushAllTimers(): Promise<void> {
  return new Promise(resolve => {
    // Executar todos os timers pendentes
    if (jest.isMockFunction(setTimeout)) {
      jest.runAllTimers()
    }
    
    // Aguardar próximo tick
    process.nextTick(resolve)
  })
}

/**
 * Wrapper para promessas com timeout automático
 */
export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = TimerManager.setTimeout(() => {
      reject(new Error(`Timeout de ${timeoutMs}ms excedido`))
    }, timeoutMs)

    promise
      .then(result => {
        TimerManager.clearTimeout(timeoutId)
        resolve(result)
      })
      .catch(error => {
        TimerManager.clearTimeout(timeoutId)
        reject(error)
      })
  })
}

/**
 * Delay controlado para testes
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    TimerManager.setTimeout(resolve, ms)
  })
}

/**
 * Monitor de memória para detectar vazamentos
 */
export class MemoryMonitor {
  private static initialMemory: NodeJS.MemoryUsage | null = null

  static startMonitoring(): void {
    this.initialMemory = process.memoryUsage()
  }

  static getMemoryDelta(): NodeJS.MemoryUsage | null {
    if (!this.initialMemory) return null

    const currentMemory = process.memoryUsage()
    return {
      rss: currentMemory.rss - this.initialMemory.rss,
      heapTotal: currentMemory.heapTotal - this.initialMemory.heapTotal,
      heapUsed: currentMemory.heapUsed - this.initialMemory.heapUsed,
      external: currentMemory.external - this.initialMemory.external,
      arrayBuffers: currentMemory.arrayBuffers - this.initialMemory.arrayBuffers
    }
  }

  static logMemoryUsage(): void {
    const delta = this.getMemoryDelta()
    if (delta) {
      console.log('📊 Memory Delta:', {
        'RSS': `${Math.round(delta.rss / 1024 / 1024)}MB`,
        'Heap Used': `${Math.round(delta.heapUsed / 1024 / 1024)}MB`,
        'Heap Total': `${Math.round(delta.heapTotal / 1024 / 1024)}MB`
      })
    }
  }

  static reset(): void {
    this.initialMemory = null
  }
}

export default TimerManager 