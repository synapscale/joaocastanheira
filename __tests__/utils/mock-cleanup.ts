/**
 * Mock and Reference Cleanup System for Integration Tests
 * Prevents memory leaks from uncleaned mocks and references
 */

export class MockManager {
  private static mocks: Map<string, jest.MockedFunction<any>> = new Map()
  private static domElements: Set<Element> = new Set()
  private static eventListeners: Array<{
    element: Element
    event: string
    listener: EventListener
    options?: boolean | AddEventListenerOptions
  }> = []
  private static globalState: Map<string, any> = new Map()

  /**
   * Registra um mock para limpeza automática
   */
  static registerMock(name: string, mock: jest.MockedFunction<any>): jest.MockedFunction<any> {
    this.mocks.set(name, mock)
    return mock
  }

  /**
   * Registra um elemento DOM para limpeza automática
   */
  static registerDOMElement(element: Element): Element {
    this.domElements.add(element)
    return element
  }

  /**
   * Registra um event listener para limpeza automática
   */
  static registerEventListener(
    element: Element,
    event: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, listener, options)
    this.eventListeners.push({ element, event, listener, options })
  }

  /**
   * Registra estado global para restauração
   */
  static registerGlobalState(key: string, value: any): void {
    if (!this.globalState.has(key)) {
      this.globalState.set(key, value)
    }
  }

  /**
   * Limpa todos os mocks registrados
   */
  static clearAllMocks(): void {
    // Limpar mocks individuais
    this.mocks.forEach((mock, name) => {
      mock.mockClear()
      mock.mockReset()
    })

    // Limpar todos os mocks do Jest
    jest.clearAllMocks()
    jest.restoreAllMocks()
    
    // Limpar o registro
    this.mocks.clear()
  }

  /**
   * Remove todos os elementos DOM criados nos testes
   */
  static cleanupDOMElements(): void {
    this.domElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    this.domElements.clear()

    // Limpar elementos órfãos do body
    const testElements = document.querySelectorAll('[data-testid], [data-test]')
    testElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
  }

  /**
   * Remove todos os event listeners registrados
   */
  static cleanupEventListeners(): void {
    this.eventListeners.forEach(({ element, event, listener, options }) => {
      element.removeEventListener(event, listener, options)
    })
    this.eventListeners = []
  }

  /**
   * Restaura estado global
   */
  static restoreGlobalState(): void {
    // Limpar localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }

    // Limpar sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear()
    }

    // Limpar cookies de teste
    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      })
    }

    this.globalState.clear()
  }

  /**
   * Limpeza completa de todas as referências
   */
  static cleanupAll(): void {
    this.clearAllMocks()
    this.cleanupEventListeners()
    this.cleanupDOMElements()
    this.restoreGlobalState()
  }

  /**
   * Verifica se há referências pendentes
   */
  static hasPendingReferences(): boolean {
    return (
      this.mocks.size > 0 ||
      this.domElements.size > 0 ||
      this.eventListeners.length > 0
    )
  }

  /**
   * Retorna informações sobre referências pendentes
   */
  static getPendingReferencesInfo(): {
    mocks: number
    domElements: number
    eventListeners: number
    total: number
  } {
    return {
      mocks: this.mocks.size,
      domElements: this.domElements.size,
      eventListeners: this.eventListeners.length,
      total: this.mocks.size + this.domElements.size + this.eventListeners.length
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
 * Utilitário para criar mocks seguros que são automaticamente limpos
 */
export class SafeMockFactory {
  /**
   * Cria um mock function que é automaticamente registrado para limpeza
   */
  static createMockFunction<T extends (...args: any[]) => any>(
    name: string,
    implementation?: T
  ): jest.MockedFunction<T> {
    const mock = jest.fn(implementation) as unknown as jest.MockedFunction<T>
    return MockManager.registerMock(name, mock)
  }

  /**
   * Cria um mock de módulo que é automaticamente limpo
   */
  static createModuleMock(moduleName: string, implementation: any): void {
    jest.doMock(moduleName, () => implementation)
    MockManager.registerMock(moduleName, implementation)
  }

  /**
   * Cria um mock de API fetch seguro
   */
  static createFetchMock(): jest.MockedFunction<typeof fetch> {
    const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>
    
    // Implementação padrão que retorna resposta válida
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(0),
      clone: () => ({ ok: true, status: 200 } as Response),
      headers: new Headers(),
      redirected: false,
      statusText: 'OK',
      type: 'default' as ResponseType,
      url: 'http://localhost:3000',
      body: null,
      bodyUsed: false
    } as Response)

    global.fetch = fetchMock
    return MockManager.registerMock('fetch', fetchMock)
  }

  /**
   * Cria mocks para localStorage e sessionStorage
   */
  static createStorageMocks(): {
    localStorage: Storage
    sessionStorage: Storage
  } {
    const createStorageMock = (): Storage => ({
      length: 0,
      clear: jest.fn(),
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      key: jest.fn(() => null)
    })

    const localStorageMock = createStorageMock()
    const sessionStorageMock = createStorageMock()

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true
    })

    MockManager.registerMock('localStorage', localStorageMock as any)
    MockManager.registerMock('sessionStorage', sessionStorageMock as any)

    return { localStorage: localStorageMock, sessionStorage: sessionStorageMock }
  }
}

/**
 * Hook para setup automático de limpeza de mocks
 */
export function setupMockCleanup(): void {
  beforeEach(() => {
    // Reset do mock manager
    MockManager.reset()
    
    // Configurar mocks básicos
    SafeMockFactory.createFetchMock()
    SafeMockFactory.createStorageMocks()
  })

  afterEach(() => {
    // Limpeza completa após cada teste
    MockManager.cleanupAll()
    
    // Verificar se há referências pendentes
    const pendingInfo = MockManager.getPendingReferencesInfo()
    if (pendingInfo.total > 0) {
      console.warn('⚠️ Referências pendentes detectadas:', pendingInfo)
    }
  })
}

/**
 * Utilitário para aguardar que todas as promesses pendentes sejam resolvidas
 */
export async function flushPromises(): Promise<void> {
  await new Promise(resolve => setImmediate(resolve))
}

/**
 * Utilitário para limpar todas as caches de módulos do Jest
 */
export function clearModuleCache(): void {
  jest.resetModules()
  jest.clearAllMocks()
}

/**
 * Wrapper para testes que garantem limpeza automática
 */
export function describeWithCleanup(
  name: string,
  fn: () => void,
  options?: { timeout?: number }
): void {
  describe(name, () => {
    beforeAll(() => {
      if (options?.timeout) {
        jest.setTimeout(options.timeout)
      }
    })

    afterAll(() => {
      MockManager.cleanupAll()
    })

    beforeEach(() => {
      MockManager.reset()
    })

    afterEach(() => {
      MockManager.cleanupAll()
    })

    fn()
  })
}

/**
 * Wrapper para testes individuais com limpeza automática
 */
export function itWithCleanup(
  name: string,
  fn: () => void | Promise<void>,
  timeout?: number
): void {
  it(name, async () => {
    try {
      await fn()
    } finally {
      MockManager.cleanupAll()
    }
  }, timeout)
}

export default MockManager 