/**
 * Setup de variáveis de ambiente para Jest
 * Carrega variáveis de ambiente necessárias para testes
 */

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:8000'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.JWT_SECRET = 'test-jwt-secret'

// Configurar timezone para testes
process.env.TZ = 'UTC'

// Suprimir warnings desnecessários durante testes
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true'

// Configuração para React/Next.js
process.env.NEXT_PUBLIC_ENVIRONMENT = 'test'

// Configuração para testes de API
process.env.API_TEST_TIMEOUT = '10000'

// Configuração para mocks
process.env.MOCK_API_RESPONSES = 'true'
process.env.MOCK_WEBSOCKET = 'true'

// Configurar logging para testes
process.env.LOG_LEVEL = 'silent'

console.log('🔧 Environment variables loaded for tests')

// Mock do localStorage e sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}

// Definir propriedades como não-enumeráveis para evitar warnings
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
})

// Mock do location e history
delete window.location
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
}

// Mock do navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-user-agent',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    cookieEnabled: true
  },
  writable: true
})

// Mock do ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock do IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock do crypto (para geradores de ID)
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-1234'),
    getRandomValues: jest.fn(arr => arr.map(() => Math.floor(Math.random() * 256)))
  }
})

// Mock do console para testes mais limpos (opcional)
if (process.env.JEST_SILENT === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}

// Configuração de timeout para async operations
jest.setTimeout(10000)

/**
 * Environment setup para testes com detecção de vazamentos de memória
 */

// Configurar timezone para testes consistentes
process.env.TZ = 'UTC'

// Configurar flags para detecção de vazamentos
process.env.NODE_OPTIONS = '--trace-warnings --expose-gc'

// Configurar timeout padrão para testes
jest.setTimeout(30000)

// Monitoramento de memória global
let initialMemory = null
let testStartMemory = null

/**
 * Configurar detecção de handles abertos
 */
if (process.env.CI !== 'true') {
  // Só em ambiente local para não sobrecarregar CI
  process.env.NODE_OPTIONS += ' --trace-warnings'
}

/**
 * Setup global de memória
 */
beforeAll(() => {
  // Capturar uso inicial de memória
  if (global.gc) {
    global.gc()
  }
  initialMemory = process.memoryUsage()
  
  console.log('🔍 Monitoramento de memória iniciado:', {
    'RSS': `${Math.round(initialMemory.rss / 1024 / 1024)}MB`,
    'Heap Used': `${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`,
    'Heap Total': `${Math.round(initialMemory.heapTotal / 1024 / 1024)}MB`
  })
})

beforeEach(() => {
  // Capturar memória no início de cada teste
  if (global.gc) {
    global.gc()
  }
  testStartMemory = process.memoryUsage()
})

afterEach(() => {
  // Verificar crescimento de memória após cada teste
  if (testStartMemory && global.gc) {
    global.gc()
    const currentMemory = process.memoryUsage()
    const delta = {
      rss: currentMemory.rss - testStartMemory.rss,
      heapUsed: currentMemory.heapUsed - testStartMemory.heapUsed,
      heapTotal: currentMemory.heapTotal - testStartMemory.heapTotal
    }
    
    // Alertar se houver crescimento significativo
    const heapGrowthMB = delta.heapUsed / 1024 / 1024
    if (heapGrowthMB > 10) {
      console.warn(`⚠️ Possível vazamento de memória detectado: +${Math.round(heapGrowthMB)}MB`)
    }
  }
})

afterAll(() => {
  // Relatório final de memória
  if (initialMemory && global.gc) {
    global.gc()
    const finalMemory = process.memoryUsage()
    const totalDelta = {
      rss: finalMemory.rss - initialMemory.rss,
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal
    }
    
    console.log('📊 Relatório final de memória:', {
      'RSS Delta': `${Math.round(totalDelta.rss / 1024 / 1024)}MB`,
      'Heap Used Delta': `${Math.round(totalDelta.heapUsed / 1024 / 1024)}MB`,
      'Heap Total Delta': `${Math.round(totalDelta.heapTotal / 1024 / 1024)}MB`
    })
  }
})

/**
 * Configurar mocks globais básicos
 */
global.localStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(() => null)
}

global.sessionStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(() => null)
}

// Mock para fetch global
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'default',
    url: 'http://localhost:3000',
    body: null,
    bodyUsed: false,
    clone: () => ({ ok: true, status: 200 }),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
  })
)

// Mock para window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn()
  },
  writable: true
})

// Mock para console para capturar vazamentos de memória
const originalError = console.error
const originalWarn = console.warn

console.error = (...args) => {
  const message = args.join(' ')
  
  // Detectar avisos específicos de vazamentos
  if (message.includes('Warning: Can\'t perform a React state update on an unmounted component') ||
      message.includes('Warning: Memory leak detected') ||
      message.includes('MaxListenersExceededWarning')) {
    // Falhar o teste se detectar vazamentos
    throw new Error(`Vazamento de memória detectado: ${message}`)
  }
  
  originalError.apply(console, args)
}

console.warn = (...args) => {
  const message = args.join(' ')
  
  // Log específico para avisos de timers
  if (message.includes('Timers pendentes') ||
      message.includes('Referências pendentes')) {
    console.log(`🔍 ${message}`)
  }
  
  originalWarn.apply(console, args)
}

/**
 * Configurar limpeza entre testes
 */
afterEach(() => {
  // Limpar todos os timers
  jest.clearAllTimers()
  jest.clearAllMocks()
  
  // Limpar elementos DOM de teste
  if (typeof document !== 'undefined') {
    const testElements = document.querySelectorAll('[data-testid], [data-test]')
    testElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
  }
  
  // Reset de mocks globais
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    global.fetch.mockClear()
  }
  
  if (global.localStorage) {
    Object.values(global.localStorage).forEach(fn => {
      if (jest.isMockFunction(fn)) {
        fn.mockClear()
      }
    })
  }
  
  if (global.sessionStorage) {
    Object.values(global.sessionStorage).forEach(fn => {
      if (jest.isMockFunction(fn)) {
        fn.mockClear()
      }
    })
  }
})

// Configurar processo para capturar handles não fechados
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.error('⚠️ MaxListenersExceededWarning detectado:', warning.message)
  }
})

// Configurar unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection detectado:', reason)
  console.error('Em promise:', promise)
})

module.exports = {} 