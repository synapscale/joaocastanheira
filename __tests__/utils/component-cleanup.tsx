/**
 * Component and Hook Cleanup Utilities for Integration Tests
 * Prevents memory leaks from React components and hooks
 */

import React from 'react'
import { render, cleanup, RenderResult } from '@testing-library/react'
import { TimerManager } from './timer-cleanup'
import { MockManager } from './mock-cleanup'

export class ComponentManager {
  private static renderResults: Set<RenderResult> = new Set()
  private static portalElements: Set<Element> = new Set()
  private static subscriptions: Set<() => void> = new Set()
  private static abortControllers: Set<AbortController> = new Set()

  /**
   * Wrapper seguro para render que rastreia o resultado
   */
  static safeRender(ui: React.ReactElement, options?: any): RenderResult {
    const result = render(ui, options)
    this.renderResults.add(result)
    return result
  }

  /**
   * Registra um elemento portal para limpeza
   */
  static registerPortal(element: Element): Element {
    this.portalElements.add(element)
    return element
  }

  /**
   * Registra uma subscription para limpeza
   */
  static registerSubscription(unsubscribe: () => void): () => void {
    this.subscriptions.add(unsubscribe)
    return unsubscribe
  }

  /**
   * Registra um AbortController para limpeza
   */
  static registerAbortController(controller: AbortController): AbortController {
    this.abortControllers.add(controller)
    return controller
  }

  /**
   * Limpa todos os componentes renderizados
   */
  static cleanupComponents(): void {
    // Cleanup do React Testing Library
    cleanup()
    
    // Limpar resultados de render rastreados
    this.renderResults.clear()
  }

  /**
   * Limpa elementos portal
   */
  static cleanupPortals(): void {
    this.portalElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    this.portalElements.clear()
  }

  /**
   * Limpa subscriptions
   */
  static cleanupSubscriptions(): void {
    this.subscriptions.forEach(unsubscribe => {
      try {
        unsubscribe()
      } catch (error) {
        console.warn('Erro ao executar unsubscribe:', error)
      }
    })
    this.subscriptions.clear()
  }

  /**
   * Cancela AbortControllers
   */
  static cleanupAbortControllers(): void {
    this.abortControllers.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort()
      }
    })
    this.abortControllers.clear()
  }

  /**
   * Limpeza completa de todos os componentes e recursos
   */
  static cleanupAll(): void {
    this.cleanupAbortControllers()
    this.cleanupSubscriptions()
    this.cleanupPortals()
    this.cleanupComponents()
  }

  /**
   * Verifica se há recursos pendentes
   */
  static hasPendingResources(): boolean {
    return (
      this.renderResults.size > 0 ||
      this.portalElements.size > 0 ||
      this.subscriptions.size > 0 ||
      this.abortControllers.size > 0
    )
  }

  /**
   * Retorna informações sobre recursos pendentes
   */
  static getPendingResourcesInfo(): {
    renderResults: number
    portals: number
    subscriptions: number
    abortControllers: number
    total: number
  } {
    return {
      renderResults: this.renderResults.size,
      portals: this.portalElements.size,
      subscriptions: this.subscriptions.size,
      abortControllers: this.abortControllers.size,
      total: this.renderResults.size + this.portalElements.size + 
             this.subscriptions.size + this.abortControllers.size
    }
  }

  /**
   * Reset completo para uso entre testes
   */
  static reset(): void {
    this.cleanupAll()
  }
}

/**
 * Hook personalizado para testes com limpeza automática
 */
export function useTestCleanup() {
  const abortController = React.useRef<AbortController>()
  const subscriptions = React.useRef<Set<() => void>>(new Set())

  React.useEffect(() => {
    // Criar AbortController para o componente
    abortController.current = new AbortController()
    ComponentManager.registerAbortController(abortController.current)

    return () => {
      // Limpar subscriptions do componente
      subscriptions.current.forEach(unsubscribe => {
        try {
          unsubscribe()
        } catch (error) {
          console.warn('Erro na limpeza de subscription:', error)
        }
      })

      // Abortar operações pendentes
      if (abortController.current && !abortController.current.signal.aborted) {
        abortController.current.abort()
      }
    }
  }, [])

  const addSubscription = React.useCallback((unsubscribe: () => void) => {
    subscriptions.current.add(unsubscribe)
    ComponentManager.registerSubscription(unsubscribe)
  }, [])

  const getAbortSignal = React.useCallback(() => {
    return abortController.current?.signal
  }, [])

  return {
    addSubscription,
    getAbortSignal
  }
}

/**
 * Hook para criar timeouts seguros que são automaticamente limpos
 */
export function useSafeTimeout() {
  const { getAbortSignal } = useTestCleanup()

  const safeSetTimeout = React.useCallback((
    callback: () => void,
    delay: number
  ): number => {
    const signal = getAbortSignal()
    
    const timerId = TimerManager.setTimeout(() => {
      if (!signal?.aborted) {
        callback()
      }
    }, delay)

    return timerId
  }, [getAbortSignal])

  const safeClearTimeout = React.useCallback((timerId: number) => {
    TimerManager.clearTimeout(timerId)
  }, [])

  return {
    setTimeout: safeSetTimeout,
    clearTimeout: safeClearTimeout
  }
}

/**
 * Hook para fetch seguro com cleanup automático
 */
export function useSafeFetch() {
  const { getAbortSignal } = useTestCleanup()

  const safeFetch = React.useCallback(async (
    url: string,
    options?: RequestInit
  ): Promise<Response> => {
    const signal = getAbortSignal()
    
    return fetch(url, {
      ...options,
      signal: signal
    })
  }, [getAbortSignal])

  return {
    fetch: safeFetch
  }
}

/**
 * Wrapper para contextos que garantem limpeza
 */
export function createTestContext<T>(
  defaultValue: T,
  displayName: string = 'TestContext'
): {
  Provider: React.ComponentType<{ children: React.ReactNode; value?: T }>
  Consumer: React.ComponentType<{ children: (value: T) => React.ReactNode }>
  useContext: () => T
} {
  const Context = React.createContext<T>(defaultValue)
  Context.displayName = displayName

  const Provider: React.FC<{ children: React.ReactNode; value?: T }> = ({ 
    children, 
    value = defaultValue 
  }) => {
    const { addSubscription } = useTestCleanup()

    React.useEffect(() => {
      // Registrar cleanup se necessário
      return () => {
        // Cleanup específico do contexto
      }
    }, [addSubscription])

    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    )
  }

  const Consumer = Context.Consumer

  const useContext = () => {
    const context = React.useContext(Context)
    if (context === undefined) {
      throw new Error(`use${displayName} must be used within a ${displayName}Provider`)
    }
    return context
  }

  return {
    Provider,
    Consumer,
    useContext
  }
}

/**
 * Hook para setup automático de limpeza de componentes
 */
export function setupComponentCleanup(): void {
  beforeEach(() => {
    // Reset do component manager
    ComponentManager.reset()
  })

  afterEach(() => {
    // Limpeza completa após cada teste
    ComponentManager.cleanupAll()
    
    // Verificar se há recursos pendentes
    const pendingInfo = ComponentManager.getPendingResourcesInfo()
    if (pendingInfo.total > 0) {
      console.warn('⚠️ Recursos de componentes pendentes detectados:', pendingInfo)
    }
  })
}

/**
 * Utilitário para esperar que todos os efeitos sejam executados
 */
export async function flushEffects(): Promise<void> {
  await new Promise<void>(resolve => {
    // Usar setTimeout para aguardar próximo tick
    TimerManager.setTimeout(() => resolve(), 0)
  })
}

/**
 * Utilitário para aguardar states assíncronos
 */
export async function waitForAsyncState(
  condition: () => boolean,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now()
  
  while (!condition() && (Date.now() - startTime) < timeout) {
    await new Promise<void>(resolve => TimerManager.setTimeout(() => resolve(), 10))
  }
  
  if (!condition()) {
    throw new Error(`Timeout aguardando condição após ${timeout}ms`)
  }
}

/**
 * Wrapper para componentes de teste com limpeza automática
 */
export function withTestCleanup<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  const ComponentWithCleanup = (props: P) => {
    useTestCleanup()
    
    return <WrappedComponent {...props} />
  }

  ComponentWithCleanup.displayName = `withTestCleanup(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return ComponentWithCleanup
}

export default ComponentManager 