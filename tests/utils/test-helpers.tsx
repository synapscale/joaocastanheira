/**
 * Utilitários para Testes
 * 
 * Este arquivo contém funções auxiliares para configurar e executar
 * testes de integração, incluindo mocks, setup de ambiente e helpers.
 */

import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/context/auth-context'
import { VariableProvider } from '@/context/variable-context'
import { ChatProvider } from '@/context/chat-context'
import { ApiService } from '@/lib/api'

// Tipos para testes
export interface TestUser {
  id: string
  email: string
  name: string
  access_token?: string
  refresh_token?: string
}

export interface TestVariable {
  id: string
  name: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'secret'
  isSecret?: boolean
  category?: string
}

export interface TestMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  sessionId?: string
}

export interface TestEnvironment {
  user: TestUser
  variables: TestVariable[]
  messages: TestMessage[]
  isOnline: boolean
}

/**
 * Configuração padrão do ambiente de teste
 */
export const defaultTestEnvironment: TestEnvironment = {
  user: {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    access_token: 'mock-jwt-token',
    refresh_token: 'mock-refresh-token'
  },
  variables: [
    {
      id: 'var-1',
      name: 'API_KEY',
      value: 'secret-api-key',
      type: 'secret',
      isSecret: true,
      category: 'authentication'
    },
    {
      id: 'var-2',
      name: 'DEBUG_MODE',
      value: 'true',
      type: 'boolean',
      isSecret: false,
      category: 'development'
    },
    {
      id: 'var-3',
      name: 'MAX_RETRIES',
      value: '3',
      type: 'number',
      isSecret: false,
      category: 'configuration'
    }
  ],
  messages: [
    {
      id: 'msg-1',
      content: 'Olá! Como posso ajudar?',
      role: 'assistant',
      timestamp: new Date().toISOString(),
      sessionId: 'session-1'
    }
  ],
  isOnline: true
}

/**
 * Provider personalizado para testes que inclui todos os contextos
 */
interface AllTheProvidersProps {
  children: React.ReactNode
  initialState?: Partial<TestEnvironment>
}

export const AllTheProviders = ({ children, initialState }: AllTheProvidersProps) => {
  const testEnv = { ...defaultTestEnvironment, ...initialState }

  return (
    <AuthProvider initialUser={testEnv.user}>
      <VariableProvider initialVariables={testEnv.variables}>
        <ChatProvider initialMessages={testEnv.messages}>
          {children}
        </ChatProvider>
      </VariableProvider>
    </AuthProvider>
  )
}

/**
 * Função customizada de render que inclui todos os providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialState?: Partial<TestEnvironment>
  }
) => {
  const { initialState, ...renderOptions } = options || {}

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders initialState={initialState}>
      {children}
    </AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Setup do ambiente de teste
 */
export const setupTestEnvironment = async (): Promise<void> => {
  // Limpar localStorage
  localStorage.clear()
  sessionStorage.clear()

  // Configurar mocks globais
  setupGlobalMocks()

  // Configurar variáveis de ambiente para teste
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'
  process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:8000'

  // Configurar fetch mock
  global.fetch = jest.fn()

  // Configurar WebSocket mock
  setupWebSocketMock()

  // Configurar timers
  jest.useFakeTimers()
}

/**
 * Cleanup do ambiente de teste
 */
export const cleanupTestEnvironment = async (): Promise<void> => {
  // Limpar todos os mocks
  jest.clearAllMocks()
  jest.clearAllTimers()
  jest.useRealTimers()

  // Limpar storage
  localStorage.clear()
  sessionStorage.clear()

  // Resetar fetch
  if (global.fetch && typeof global.fetch.mockRestore === 'function') {
    global.fetch.mockRestore()
  }

  // Limpar event listeners
  window.removeEventListener('online', jest.fn())
  window.removeEventListener('offline', jest.fn())
  window.removeEventListener('visibilitychange', jest.fn())
}

/**
 * Configurar mocks globais
 */
export const setupGlobalMocks = (): void => {
  // Mock do navigator
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true
  })

  // Mock do document.visibilityState
  Object.defineProperty(document, 'visibilityState', {
    writable: true,
    value: 'visible'
  })

  // Mock do performance.now
  global.performance = {
    ...global.performance,
    now: jest.fn(() => Date.now())
  }

  // Mock do console para evitar logs desnecessários
  global.console = {
    ...global.console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}

/**
 * Configurar mock do WebSocket
 */
export const setupWebSocketMock = (): void => {
  const mockWebSocket = {
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readyState: WebSocket.OPEN,
    url: '',
    protocol: '',
    extensions: '',
    bufferedAmount: 0,
    binaryType: 'blob' as BinaryType,
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null,
    dispatchEvent: jest.fn()
  }

  global.WebSocket = jest.fn(() => mockWebSocket) as any
  global.WebSocket.CONNECTING = 0
  global.WebSocket.OPEN = 1
  global.WebSocket.CLOSING = 2
  global.WebSocket.CLOSED = 3
}

/**
 * Mock das respostas do backend
 */
export const mockBackendResponses = (): void => {
  const mockApiService = ApiService as jest.MockedClass<typeof ApiService>

  // Mock de autenticação
  mockApiService.prototype.post = jest.fn().mockImplementation((endpoint: string, data: any) => {
    if (endpoint === '/auth/login') {
      return Promise.resolve({
        data: {
          access_token: 'mock-jwt-token',
          refresh_token: 'mock-refresh-token',
          user: defaultTestEnvironment.user
        }
      })
    }

    if (endpoint === '/auth/refresh') {
      return Promise.resolve({
        data: {
          access_token: 'new-mock-jwt-token',
          refresh_token: 'new-mock-refresh-token'
        }
      })
    }

    if (endpoint === '/user-variables') {
      return Promise.resolve({
        data: { id: 'new-var', ...data }
      })
    }

    if (endpoint === '/user-variables/bulk') {
      return Promise.resolve({
        data: { migrated: data.variables.length, errors: [] }
      })
    }

    return Promise.resolve({ data: {} })
  })

  // Mock de GET requests
  mockApiService.prototype.get = jest.fn().mockImplementation((endpoint: string) => {
    if (endpoint === '/user-variables') {
      return Promise.resolve({
        data: defaultTestEnvironment.variables
      })
    }

    if (endpoint === '/health') {
      return Promise.resolve({
        data: { status: 'healthy', timestamp: new Date().toISOString() }
      })
    }

    if (endpoint.startsWith('/chat/sessions')) {
      return Promise.resolve({
        data: [
          {
            id: 'session-1',
            title: 'Test Session',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      })
    }

    return Promise.resolve({ data: [] })
  })

  // Mock de PUT requests
  mockApiService.prototype.put = jest.fn().mockImplementation((endpoint: string, data: any) => {
    if (endpoint.includes('/user-variables/')) {
      return Promise.resolve({
        data: { id: endpoint.split('/').pop(), ...data }
      })
    }

    return Promise.resolve({ data: {} })
  })

  // Mock de DELETE requests
  mockApiService.prototype.delete = jest.fn().mockImplementation((endpoint: string) => {
    return Promise.resolve({ data: {} })
  })
}

/**
 * Simular eventos de rede
 */
export const simulateNetworkEvents = {
  goOffline: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    window.dispatchEvent(new Event('offline'))
  },

  goOnline: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
    window.dispatchEvent(new Event('online'))
  },

  changeVisibility: (state: 'visible' | 'hidden') => {
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: state
    })
    window.dispatchEvent(new Event('visibilitychange'))
  }
}

/**
 * Helpers para testes de performance
 */
export const performanceHelpers = {
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const start = performance.now()
    renderFn()
    const end = performance.now()
    return end - start
  },

  measureAsyncOperation: async (operation: () => Promise<any>): Promise<number> => {
    const start = performance.now()
    await operation()
    const end = performance.now()
    return end - start
  },

  createLargeDataset: (size: number): TestVariable[] => {
    return Array.from({ length: size }, (_, i) => ({
      id: `var-${i + 1}`,
      name: `LARGE_VAR_${i + 1}`,
      value: `large_value_${i + 1}`,
      type: 'string' as const,
      isSecret: i % 5 === 0, // 20% são secretas
      category: `category-${Math.floor(i / 10)}`
    }))
  }
}

/**
 * Helpers para testes de WebSocket
 */
export const websocketHelpers = {
  simulateMessage: (content: string, role: 'user' | 'assistant' = 'assistant') => {
    const mockWS = (global.WebSocket as any).mock.results[0]?.value
    if (mockWS && mockWS.onmessage) {
      mockWS.onmessage({
        data: JSON.stringify({
          type: 'message',
          content,
          role,
          timestamp: new Date().toISOString()
        })
      })
    }
  },

  simulateConnection: () => {
    const mockWS = (global.WebSocket as any).mock.results[0]?.value
    if (mockWS && mockWS.onopen) {
      mockWS.readyState = WebSocket.OPEN
      mockWS.onopen({})
    }
  },

  simulateDisconnection: (code: number = 1006) => {
    const mockWS = (global.WebSocket as any).mock.results[0]?.value
    if (mockWS && mockWS.onclose) {
      mockWS.readyState = WebSocket.CLOSED
      mockWS.onclose({ code, reason: 'Connection lost' })
    }
  },

  simulateError: (error: string = 'WebSocket error') => {
    const mockWS = (global.WebSocket as any).mock.results[0]?.value
    if (mockWS && mockWS.onerror) {
      mockWS.onerror({ message: error })
    }
  }
}

/**
 * Helpers para testes de autenticação
 */
export const authHelpers = {
  simulateLogin: (credentials: { email: string; password: string }) => {
    const loginEvent = new CustomEvent('test-login', { detail: credentials })
    window.dispatchEvent(loginEvent)
  },

  simulateLogout: () => {
    const logoutEvent = new CustomEvent('test-logout')
    window.dispatchEvent(logoutEvent)
  },

  simulateTokenExpiry: () => {
    const expiryEvent = new CustomEvent('test-token-expired')
    window.dispatchEvent(expiryEvent)
  },

  createMockToken: (payload: any = {}) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = btoa(JSON.stringify({
      sub: 'test-user-1',
      email: 'test@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora
      ...payload
    }))
    const signature = 'mock-signature'
    return `${header}.${body}.${signature}`
  }
}

/**
 * Helpers para testes de variáveis
 */
export const variableHelpers = {
  createVariable: (data: Partial<TestVariable>) => {
    const createEvent = new CustomEvent('test-create-variable', { detail: data })
    window.dispatchEvent(createEvent)
  },

  updateVariable: (id: string, data: Partial<TestVariable>) => {
    const updateEvent = new CustomEvent('test-update-variable', { 
      detail: { id, ...data } 
    })
    window.dispatchEvent(updateEvent)
  },

  deleteVariable: (id: string) => {
    const deleteEvent = new CustomEvent('test-delete-variable', { detail: { id } })
    window.dispatchEvent(deleteEvent)
  },

  triggerMigration: () => {
    const migrationEvent = new CustomEvent('test-migrate-variables')
    window.dispatchEvent(migrationEvent)
  },

  triggerSync: () => {
    const syncEvent = new CustomEvent('test-sync-variables')
    window.dispatchEvent(syncEvent)
  }
}

/**
 * Helpers para testes de chat
 */
export const chatHelpers = {
  sendMessage: (content: string, sessionId?: string) => {
    const messageEvent = new CustomEvent('test-send-message', { 
      detail: { content, sessionId } 
    })
    window.dispatchEvent(messageEvent)
  },

  createSession: (title?: string) => {
    const sessionEvent = new CustomEvent('test-create-session', { 
      detail: { title } 
    })
    window.dispatchEvent(sessionEvent)
  },

  deleteSession: (sessionId: string) => {
    const deleteEvent = new CustomEvent('test-delete-session', { 
      detail: { sessionId } 
    })
    window.dispatchEvent(deleteEvent)
  },

  switchSession: (sessionId: string) => {
    const switchEvent = new CustomEvent('test-switch-session', { 
      detail: { sessionId } 
    })
    window.dispatchEvent(switchEvent)
  }
}

/**
 * Matchers customizados para Jest
 */
export const customMatchers = {
  toBeWithinRange: (received: number, floor: number, ceiling: number) => {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      }
    }
  },

  toHaveBeenCalledWithToken: (received: jest.Mock, expectedToken?: string) => {
    const calls = received.mock.calls
    const hasTokenCall = calls.some(call => {
      const headers = call[1]?.headers || call[0]?.headers
      return headers?.Authorization?.includes('Bearer')
    })

    if (hasTokenCall) {
      return {
        message: () => `expected function not to be called with Authorization header`,
        pass: true
      }
    } else {
      return {
        message: () => `expected function to be called with Authorization header`,
        pass: false
      }
    }
  }
}

// Exportar tudo como default também para facilitar imports
export default {
  renderWithProviders,
  setupTestEnvironment,
  cleanupTestEnvironment,
  mockBackendResponses,
  simulateNetworkEvents,
  performanceHelpers,
  websocketHelpers,
  authHelpers,
  variableHelpers,
  chatHelpers,
  customMatchers,
  defaultTestEnvironment
}

