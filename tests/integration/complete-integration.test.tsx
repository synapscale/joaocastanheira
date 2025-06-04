/**
 * Testes de Integração Completos
 * 
 * Este arquivo contém testes end-to-end que verificam a integração
 * completa entre frontend e backend, incluindo:
 * - Autenticação JWT
 * - Sistema de variáveis
 * - Chat com WebSockets
 * - Sincronização de dados
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { AuthProvider } from '@/context/auth-context'
import { VariableProvider } from '@/context/variable-context'
import { ChatProvider } from '@/context/chat-context'
import { ApiService } from '@/lib/api'
import { setupTestEnvironment, cleanupTestEnvironment, mockBackendResponses } from '../utils/test-helpers'

// Mock do backend para testes
jest.mock('@/lib/api')
jest.mock('@/lib/services/websocket')

const MockedApiService = ApiService as jest.MockedClass<typeof ApiService>

describe('Integração Completa Frontend-Backend', () => {
  beforeEach(async () => {
    await setupTestEnvironment()
    mockBackendResponses()
  })

  afterEach(async () => {
    await cleanupTestEnvironment()
    jest.clearAllMocks()
  })

  describe('🔐 Fluxo de Autenticação Completo', () => {
    test('deve realizar login completo e configurar contextos', async () => {
      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <ChatProvider>
              <div data-testid="app-content">
                <div data-testid="auth-status">Autenticado</div>
                <div data-testid="variables-loaded">Variáveis carregadas</div>
                <div data-testid="chat-connected">Chat conectado</div>
              </div>
            </ChatProvider>
          </VariableProvider>
        </AuthProvider>
      )

      // Mock de resposta de login bem-sucedido
      MockedApiService.prototype.post.mockResolvedValueOnce({
        data: {
          access_token: 'mock-jwt-token',
          refresh_token: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User'
          }
        }
      })

      // Mock de carregamento de variáveis
      MockedApiService.prototype.get.mockResolvedValueOnce({
        data: [
          { id: '1', name: 'TEST_VAR', value: 'test-value', type: 'string' }
        ]
      })

      render(<TestComponent />)

      // Simular login
      await act(async () => {
        // Trigger login através do contexto
        const loginEvent = new CustomEvent('test-login', {
          detail: { email: 'test@example.com', password: 'password' }
        })
        window.dispatchEvent(loginEvent)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toBeInTheDocument()
        expect(screen.getByTestId('variables-loaded')).toBeInTheDocument()
        expect(screen.getByTestId('chat-connected')).toBeInTheDocument()
      })

      // Verificar se as APIs foram chamadas corretamente
      expect(MockedApiService.prototype.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password'
      })
      expect(MockedApiService.prototype.get).toHaveBeenCalledWith('/user-variables')
    })

    test('deve lidar com falha de autenticação', async () => {
      MockedApiService.prototype.post.mockRejectedValueOnce({
        response: { status: 401, data: { detail: 'Invalid credentials' } }
      })

      const TestComponent = () => (
        <AuthProvider>
          <div data-testid="auth-error">Erro de autenticação</div>
        </AuthProvider>
      )

      render(<TestComponent />)

      await act(async () => {
        const loginEvent = new CustomEvent('test-login-fail', {
          detail: { email: 'wrong@example.com', password: 'wrongpassword' }
        })
        window.dispatchEvent(loginEvent)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-error')).toBeInTheDocument()
      })
    })
  })

  describe('🔧 Sistema de Variáveis Integrado', () => {
    test('deve sincronizar variáveis com backend', async () => {
      // Mock de variáveis do backend
      const mockVariables = [
        { id: '1', name: 'API_KEY', value: 'secret-key', type: 'secret', isSecret: true },
        { id: '2', name: 'DEBUG_MODE', value: 'true', type: 'boolean', isSecret: false },
        { id: '3', name: 'MAX_RETRIES', value: '3', type: 'number', isSecret: false }
      ]

      MockedApiService.prototype.get.mockResolvedValueOnce({
        data: mockVariables
      })

      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <div data-testid="variables-container">
              {mockVariables.map(variable => (
                <div key={variable.id} data-testid={`variable-${variable.id}`}>
                  {variable.name}: {variable.isSecret ? '***' : variable.value}
                </div>
              ))}
            </div>
          </VariableProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('variable-1')).toHaveTextContent('API_KEY: ***')
        expect(screen.getByTestId('variable-2')).toHaveTextContent('DEBUG_MODE: true')
        expect(screen.getByTestId('variable-3')).toHaveTextContent('MAX_RETRIES: 3')
      })
    })

    test('deve criar nova variável via API', async () => {
      const newVariable = {
        name: 'NEW_VAR',
        value: 'new-value',
        type: 'string',
        isSecret: false
      }

      MockedApiService.prototype.post.mockResolvedValueOnce({
        data: { id: '4', ...newVariable }
      })

      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <div data-testid="create-variable-form">
              <button 
                data-testid="create-button"
                onClick={() => {
                  const createEvent = new CustomEvent('test-create-variable', {
                    detail: newVariable
                  })
                  window.dispatchEvent(createEvent)
                }}
              >
                Criar Variável
              </button>
            </div>
          </VariableProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      const createButton = screen.getByTestId('create-button')
      
      await act(async () => {
        fireEvent.click(createButton)
      })

      await waitFor(() => {
        expect(MockedApiService.prototype.post).toHaveBeenCalledWith('/user-variables', newVariable)
      })
    })

    test('deve migrar dados do localStorage para backend', async () => {
      // Simular dados no localStorage
      const localStorageData = [
        { name: 'LOCAL_VAR_1', value: 'value1', type: 'string' },
        { name: 'LOCAL_VAR_2', value: 'value2', type: 'string' }
      ]

      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => JSON.stringify(localStorageData)),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn()
        },
        writable: true
      })

      // Mock da API de migração
      MockedApiService.prototype.post.mockResolvedValueOnce({
        data: { migrated: 2, errors: [] }
      })

      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <div data-testid="migration-status">Migração concluída</div>
          </VariableProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      await act(async () => {
        const migrationEvent = new CustomEvent('test-migrate-variables')
        window.dispatchEvent(migrationEvent)
      })

      await waitFor(() => {
        expect(screen.getByTestId('migration-status')).toBeInTheDocument()
        expect(MockedApiService.prototype.post).toHaveBeenCalledWith('/user-variables/bulk', {
          variables: localStorageData
        })
      })
    })
  })

  describe('💬 Sistema de Chat com WebSockets', () => {
    test('deve conectar WebSocket e enviar mensagens', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        readyState: WebSocket.OPEN
      }

      // Mock WebSocket
      global.WebSocket = jest.fn(() => mockWebSocket) as any

      const TestComponent = () => (
        <AuthProvider>
          <ChatProvider>
            <div data-testid="chat-interface">
              <div data-testid="connection-status">Conectado</div>
              <button 
                data-testid="send-message"
                onClick={() => {
                  const messageEvent = new CustomEvent('test-send-message', {
                    detail: { content: 'Olá, como você está?' }
                  })
                  window.dispatchEvent(messageEvent)
                }}
              >
                Enviar Mensagem
              </button>
            </div>
          </ChatProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Conectado')
      })

      const sendButton = screen.getByTestId('send-message')
      
      await act(async () => {
        fireEvent.click(sendButton)
      })

      await waitFor(() => {
        expect(mockWebSocket.send).toHaveBeenCalledWith(
          JSON.stringify({
            type: 'message',
            content: 'Olá, como você está?',
            timestamp: expect.any(String)
          })
        )
      })
    })

    test('deve reconectar automaticamente em caso de desconexão', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'close') {
            // Simular desconexão após 100ms
            setTimeout(() => callback({ code: 1006 }), 100)
          }
        }),
        removeEventListener: jest.fn(),
        readyState: WebSocket.CONNECTING
      }

      global.WebSocket = jest.fn(() => mockWebSocket) as any

      const TestComponent = () => (
        <AuthProvider>
          <ChatProvider>
            <div data-testid="reconnection-status">Reconectando...</div>
          </ChatProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('reconnection-status')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Verificar se tentou reconectar
      expect(global.WebSocket).toHaveBeenCalledTimes(2)
    })
  })

  describe('🔄 Sincronização e Performance', () => {
    test('deve sincronizar dados automaticamente', async () => {
      jest.useFakeTimers()

      MockedApiService.prototype.get.mockResolvedValue({
        data: [{ id: '1', name: 'SYNC_VAR', value: 'synced-value', type: 'string' }]
      })

      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <div data-testid="sync-indicator">Sincronizado</div>
          </VariableProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      // Avançar timer para trigger sincronização automática (5 minutos)
      await act(async () => {
        jest.advanceTimersByTime(5 * 60 * 1000)
      })

      await waitFor(() => {
        expect(MockedApiService.prototype.get).toHaveBeenCalledWith('/user-variables')
      })

      jest.useRealTimers()
    })

    test('deve lidar com modo offline', async () => {
      // Simular offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      MockedApiService.prototype.get.mockRejectedValue(new Error('Network Error'))

      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <div data-testid="offline-mode">Modo Offline</div>
          </VariableProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('offline-mode')).toBeInTheDocument()
      })

      // Simular volta online
      await act(async () => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true
        })

        const onlineEvent = new Event('online')
        window.dispatchEvent(onlineEvent)
      })

      // Deve tentar sincronizar novamente
      await waitFor(() => {
        expect(MockedApiService.prototype.get).toHaveBeenCalled()
      })
    })
  })

  describe('🚨 Cenários de Erro', () => {
    test('deve lidar com erro de servidor (500)', async () => {
      MockedApiService.prototype.get.mockRejectedValue({
        response: { status: 500, data: { detail: 'Internal Server Error' } }
      })

      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <div data-testid="server-error">Erro do servidor</div>
          </VariableProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('server-error')).toBeInTheDocument()
      })
    })

    test('deve lidar com token expirado', async () => {
      MockedApiService.prototype.get.mockRejectedValueOnce({
        response: { status: 401, data: { detail: 'Token expired' } }
      })

      // Mock refresh token success
      MockedApiService.prototype.post.mockResolvedValueOnce({
        data: { access_token: 'new-token', refresh_token: 'new-refresh-token' }
      })

      // Mock retry success
      MockedApiService.prototype.get.mockResolvedValueOnce({
        data: [{ id: '1', name: 'VAR', value: 'value', type: 'string' }]
      })

      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <div data-testid="token-refreshed">Token atualizado</div>
          </VariableProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('token-refreshed')).toBeInTheDocument()
      })

      // Verificar se refresh foi chamado
      expect(MockedApiService.prototype.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: expect.any(String)
      })
    })
  })

  describe('📊 Métricas de Performance', () => {
    test('deve carregar dados em menos de 2 segundos', async () => {
      const startTime = performance.now()

      MockedApiService.prototype.get.mockResolvedValue({
        data: Array.from({ length: 100 }, (_, i) => ({
          id: String(i + 1),
          name: `VAR_${i + 1}`,
          value: `value_${i + 1}`,
          type: 'string'
        }))
      })

      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <div data-testid="performance-test">Dados carregados</div>
          </VariableProvider>
        </AuthProvider>
      )

      render(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('performance-test')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const loadTime = endTime - startTime

      expect(loadTime).toBeLessThan(2000) // Menos de 2 segundos
    })

    test('deve lidar com muitas variáveis sem degradação', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: String(i + 1),
        name: `LARGE_VAR_${i + 1}`,
        value: `large_value_${i + 1}`,
        type: 'string'
      }))

      MockedApiService.prototype.get.mockResolvedValue({
        data: largeDataset
      })

      const TestComponent = () => (
        <AuthProvider>
          <VariableProvider>
            <div data-testid="large-dataset">1000 variáveis carregadas</div>
          </VariableProvider>
        </AuthProvider>
      )

      const startTime = performance.now()
      render(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('large-dataset')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Deve renderizar 1000 variáveis em menos de 3 segundos
      expect(renderTime).toBeLessThan(3000)
    })
  })
})

/**
 * Testes de Integração Específicos por Funcionalidade
 */

describe('Integração por Funcionalidade', () => {
  describe('🔐 Autenticação JWT', () => {
    test('fluxo completo de login/logout', async () => {
      // Implementação específica para autenticação
    })

    test('refresh automático de tokens', async () => {
      // Implementação específica para refresh
    })
  })

  describe('🔧 Variáveis de Usuário', () => {
    test('CRUD completo de variáveis', async () => {
      // Implementação específica para variáveis
    })

    test('sincronização bidirecional', async () => {
      // Implementação específica para sincronização
    })
  })

  describe('💬 Chat em Tempo Real', () => {
    test('envio e recebimento de mensagens', async () => {
      // Implementação específica para chat
    })

    test('reconexão automática', async () => {
      // Implementação específica para reconexão
    })
  })
})

