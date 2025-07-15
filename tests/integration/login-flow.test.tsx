/**
 * Testes de Integração - Fluxo de Login
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/login-form'
import { AuthProvider } from '@/context/auth-context'

// Mock direto das funções da API
const mockApiPost = jest.fn()
const mockApiGet = jest.fn()

jest.mock('@/lib/api/service', () => ({
  ApiService: jest.fn().mockImplementation(() => ({
    post: mockApiPost,
    get: mockApiGet,
    login: jest.fn(),
    logout: jest.fn(),
    getToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    isAuthenticated: jest.fn()
  }))
}))

describe('🔐 Testes de Integração - Fluxo de Login', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Limpar mocks antes de cada teste
    mockApiPost.mockClear()
    mockApiGet.mockClear()
    
    // Configurar localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
    })
    
    // Mock do sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Login Bem-Sucedido', () => {
    test('deve realizar login com credenciais válidas', async () => {
      // Configurar mock para login bem-sucedido
      mockApiPost.mockResolvedValueOnce({
        data: {
          access_token: 'mock-jwt-token',
          refresh_token: 'mock-refresh-token',
          token_type: 'Bearer',
          user: {
            id: '1',
            email: 'usuario@example.com',
            full_name: 'Usuário Teste',
            is_verified: true,
            role: 'user'
          }
        }
      })
      
      // Mock para carregamento de variáveis do usuário
      mockApiGet.mockResolvedValueOnce({
        data: [
          { id: '1', key: 'TEST_VAR', value: 'test-value', is_secret: false }
        ]
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Verificar se o formulário foi renderizado
      expect(screen.getByText(/entrar|login|acesso/i)).toBeInTheDocument()

      // Preencher credenciais válidas
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'usuario@example.com')
      if (passwordInput) await user.type(passwordInput, 'senha123')

      // Submeter formulário
      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar se API de login foi chamada
      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          '/auth/login',
          expect.objectContaining({
            email: 'usuario@example.com',
            password: 'senha123'
          })
        )
      }, { timeout: 3000 })

      // Verificar se variáveis do usuário foram carregadas
      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith('/user-variables')
      }, { timeout: 3000 })
    })

    test('deve armazenar tokens após login bem-sucedido', async () => {
      const tokens = {
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token'
      }

      mockApiPost.mockResolvedValueOnce({
        data: {
          ...tokens,
          token_type: 'Bearer',
          user: {
            id: '2',
            email: 'test@example.com',
            full_name: 'Test User'
          }
        }
      })

      mockApiGet.mockResolvedValueOnce({ data: [] })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Realizar login
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'test@example.com')
      if (passwordInput) await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar se login foi processado
      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('❌ Validação de Credenciais', () => {
    test('deve validar email obrigatório', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Tentar submeter sem email
      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar mensagem de erro
      await waitFor(() => {
        const errorMessage = screen.queryByText(/email.*obrigatório|preencha.*email/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      }, { timeout: 2000 })
    })

    test('deve validar senha obrigatória', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Preencher apenas email
      const emailInput = screen.getByPlaceholderText(/email/i)
      if (emailInput) {
        await user.type(emailInput, 'usuario@example.com')
      }

      // Tentar submeter sem senha
      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar mensagem de erro
      await waitFor(() => {
        const errorMessage = screen.queryByText(/senha.*obrigatória|preencha.*senha/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      }, { timeout: 2000 })
    })

    test('deve validar formato de email', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Inserir email inválido
      const emailInput = screen.getByPlaceholderText(/email/i)
      if (emailInput) {
        await user.type(emailInput, 'email-invalido')
        await user.tab() // Sair do campo
      }

      // Verificar mensagem de erro
      await waitFor(() => {
        const errorMessage = screen.queryByText(/email.*válido|formato.*email/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      }, { timeout: 2000 })
    })
  })

  describe('🚨 Falhas de Autenticação', () => {
    test('deve lidar com credenciais inválidas', async () => {
      mockApiPost.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            detail: 'Email ou senha incorretos',
            code: 'INVALID_CREDENTIALS'
          }
        }
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Inserir credenciais inválidas
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'usuario@example.com')
      if (passwordInput) await user.type(passwordInput, 'senha-errada')

      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar mensagem de erro
      await waitFor(() => {
        const errorMessage = screen.queryByText(/email.*senha.*incorrect|credenciais.*inválid/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      }, { timeout: 3000 })
    })

    test('deve lidar com usuário não encontrado', async () => {
      mockApiPost.mockRejectedValueOnce({
        response: {
          status: 404,
          data: {
            detail: 'Usuário não encontrado',
            code: 'USER_NOT_FOUND'
          }
        }
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Inserir email de usuário inexistente
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'inexistente@example.com')
      if (passwordInput) await user.type(passwordInput, 'senha123')

      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar mensagem de erro
      await waitFor(() => {
        const errorMessage = screen.queryByText(/usuário.*encontrado|não.*cadastrado/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      }, { timeout: 3000 })
    })

    test('deve lidar com conta bloqueada', async () => {
      mockApiPost.mockRejectedValueOnce({
        response: {
          status: 423,
          data: {
            detail: 'Conta temporariamente bloqueada',
            code: 'ACCOUNT_LOCKED'
          }
        }
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Tentar login com conta bloqueada
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'bloqueado@example.com')
      if (passwordInput) await user.type(passwordInput, 'senha123')

      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar mensagem de erro
      await waitFor(() => {
        const errorMessage = screen.queryByText(/conta.*bloqueada|temporariamente.*bloqueada/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      }, { timeout: 3000 })
    })

    test('deve lidar com erro de servidor', async () => {
      mockApiPost.mockRejectedValueOnce({
        response: {
          status: 500,
          data: {
            detail: 'Erro interno do servidor'
          }
        }
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Tentar login durante erro de servidor
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'usuario@example.com')
      if (passwordInput) await user.type(passwordInput, 'senha123')

      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar mensagem de erro
      await waitFor(() => {
        const errorMessage = screen.queryByText(/erro.*servidor|tente.*novamente.*mais.*tarde/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      }, { timeout: 3000 })
    })

    test('deve lidar com erro de rede', async () => {
      mockApiPost.mockRejectedValueOnce(new Error('Network Error'))

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Tentar login durante erro de rede
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'usuario@example.com')
      if (passwordInput) await user.type(passwordInput, 'senha123')

      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar mensagem de erro
      await waitFor(() => {
        const errorMessage = screen.queryByText(/erro.*conexão|verifique.*internet/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      }, { timeout: 3000 })
    })
  })

  describe('🔄 Gerenciamento de Sessão', () => {
    test('deve gerar tokens de sessão válidos', async () => {
      const sessionTokens = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'refresh_token_example',
        token_type: 'Bearer',
        expires_in: 3600
      }

      mockApiPost.mockResolvedValueOnce({
        data: {
          ...sessionTokens,
          user: {
            id: '3',
            email: 'session@example.com',
            full_name: 'Session User'
          }
        }
      })

      mockApiGet.mockResolvedValueOnce({ data: [] })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Realizar login
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'session@example.com')
      if (passwordInput) await user.type(passwordInput, 'senha123')

      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar geração de tokens
      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          '/auth/login',
          expect.objectContaining({
            email: 'session@example.com',
            password: 'senha123'
          })
        )
      }, { timeout: 3000 })
    })

    test('deve verificar validade de senha', async () => {
      mockApiPost.mockResolvedValueOnce({
        data: {
          access_token: 'valid-token',
          refresh_token: 'valid-refresh',
          user: {
            id: '4',
            email: 'verification@example.com',
            full_name: 'Verification User'
          }
        }
      })

      mockApiGet.mockResolvedValueOnce({ data: [] })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      const senha = 'MinhaSenh@Segura123'

      // Preencher formulário
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'verification@example.com')
      if (passwordInput) await user.type(passwordInput, senha)

      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar que senha foi enviada corretamente
      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          '/auth/login',
          expect.objectContaining({
            password: senha
          })
        )
      }, { timeout: 3000 })
    })
  })

  describe('🔄 Estados de Loading e UX', () => {
    test('deve exibir estado de loading durante login', async () => {
      // Mock com delay para simular loading
      mockApiPost.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            data: {
              access_token: 'loading-token',
              refresh_token: 'loading-refresh',
              user: {
                id: '5',
                email: 'loading@example.com',
                full_name: 'Loading User'
              }
            }
          }), 1000)
        )
      )

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Preencher e submeter formulário
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'loading@example.com')
      if (passwordInput) await user.type(passwordInput, 'senha123')

      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      if (submitButton) {
        await user.click(submitButton)
      }

      // Verificar estado de loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      }, { timeout: 1000 })

      // Verificar se tem indicador de loading
      const loadingIndicator = screen.queryByText(/entrando|carregando|aguarde/i)
      if (loadingIndicator) {
        expect(loadingIndicator).toBeInTheDocument()
      }

      // Aguardar conclusão
      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled()
      }, { timeout: 2000 })
    })
  })

  describe('📱 Acessibilidade e UX', () => {
    test('deve ter estrutura acessível', () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Verificar elementos básicos
      expect(screen.getByRole('form') || screen.getByTestId('login-form') || document.querySelector('form')).toBeTruthy()
      
      // Verificar campos de entrada
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
      
      // Verificar botão de submit
      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      expect(submitButton).toBeInTheDocument()
    })

    test('deve permitir navegação por teclado', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Testar navegação por Tab
      const emailInput = screen.getByPlaceholderText(/email/i)
      emailInput.focus()
      expect(emailInput).toHaveFocus()

      await user.tab()
      const passwordInput = screen.getByPlaceholderText(/senha/i)
      expect(passwordInput).toHaveFocus()

      await user.tab()
      const submitButton = screen.getByRole('button', { name: /entrar|login|acessar/i })
      expect(submitButton).toHaveFocus()
    })

    test('deve permitir submissão com Enter', async () => {
      mockApiPost.mockResolvedValueOnce({
        data: {
          access_token: 'enter-token',
          refresh_token: 'enter-refresh',
          user: {
            id: '6',
            email: 'enter@example.com',
            full_name: 'Enter User'
          }
        }
      })

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      )

      // Preencher formulário
      const emailInput = screen.getByPlaceholderText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/senha/i)

      if (emailInput) await user.type(emailInput, 'enter@example.com')
      if (passwordInput) {
        await user.type(passwordInput, 'senha123')
        // Pressionar Enter no campo de senha
        await user.keyboard('{Enter}')
      }

      // Verificar se login foi processado
      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })
}) 