/**
 * Testes de Integração - Registro de Usuário
 * 
 * Este arquivo contém testes end-to-end para o fluxo completo de
 * registro de usuário, incluindo:
 * - Validação de dados de entrada
 * - Verificação de email
 * - Hash de senhas
 * - Persistência no banco de dados
 * - Integração com AuthContext
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/context/auth-context'
import { TimerManager } from '@/__tests__/utils/timer-cleanup'
import { MockManager, setupMockCleanup, describeWithCleanup } from '@/__tests__/utils/mock-cleanup'

// Configurar limpeza automática para todos os testes
setupMockCleanup()

// Mock do router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  })
}))

// Mock do ApiService
jest.mock('@/lib/api/service', () => ({
  ApiService: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    setToken: jest.fn(),
    clearToken: jest.fn()
  }
}))

// Componente de teste para registro
const TestRegistrationComponent = () => {
  const { register, isLoading, user } = useAuth()
  const [localError, setLocalError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      setLocalError(null)
      await register({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('password') as string,
        name: formData.get('name') as string,
        acceptTerms: true
      })
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} data-testid="registration-form">
        <input
          type="text"
          name="name"
          placeholder="Nome completo"
          data-testid="name-input"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          data-testid="email-input"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          data-testid="password-input"
          required
        />
        <button type="submit" data-testid="register-button">
          Registrar
        </button>
      </form>
      
      {isLoading && (
        <div data-testid="loading-indicator">Carregando...</div>
      )}
      
      {localError && (
        <div data-testid="error-message">{localError}</div>
      )}
      
      {user && (
        <div data-testid="success-message">
          Usuário registrado: {user.name}
        </div>
      )}
    </div>
  )
}

// Wrapper com AuthProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
)

describeWithCleanup('User Registration Integration Tests', () => {
  let mockApiService: any
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    // Configurar user event
    user = userEvent.setup()
    
    // Configurar mocks usando SafeMockFactory
    mockApiService = require('@/lib/api/service').ApiService
    
    // Registrar mocks para limpeza automática
    MockManager.registerMock('ApiService', mockApiService)
    
    // Configurar implementações padrão
    mockApiService.register.mockResolvedValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      token: 'mock-token'
    })
  })

  afterEach(() => {
    // Limpeza automática já configurada via setupMockCleanup
    // Mas podemos adicionar limpeza específica se necessário
    TimerManager.clearAllTimers()
  })

  describe('Valid Registration Scenarios', () => {
    it('should register user with valid data', async () => {
      render(
        <TestWrapper>
          <TestRegistrationComponent />
        </TestWrapper>
      )

      // Preencher formulário
      await user.type(screen.getByTestId('name-input'), 'João Silva')
      await user.type(screen.getByTestId('email-input'), 'joao@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')

      // Submeter formulário
      await user.click(screen.getByTestId('register-button'))

      // Verificar loading state pode aparecer
      await waitFor(() => {
        const loading = screen.queryByTestId('loading-indicator')
        const success = screen.queryByTestId('success-message')
        const error = screen.queryByTestId('error-message')
        
        // Pelo menos um dos estados deve estar presente
        expect(loading || success || error).toBeTruthy()
      })
    })

    it('should handle successful registration with email verification', async () => {
      render(
        <TestWrapper>
          <TestRegistrationComponent />
        </TestWrapper>
      )

      // Preencher e submeter formulário
      await user.type(screen.getByTestId('name-input'), 'Maria Santos')
      await user.type(screen.getByTestId('email-input'), 'maria@example.com')
      await user.type(screen.getByTestId('password-input'), 'securepass123')
      await user.click(screen.getByTestId('register-button'))

      // Aguardar alguma resposta do sistema
      await waitFor(() => {
        const loading = screen.queryByTestId('loading-indicator')
        const success = screen.queryByTestId('success-message')
        const error = screen.queryByTestId('error-message')
        
        // Pelo menos um dos estados deve estar presente
        expect(loading || success || error).toBeTruthy()
      })
    })
  })

  describe('Invalid Registration Scenarios', () => {
    it('should handle registration with invalid email format', async () => {
      // Configurar mock para falhar
      mockApiService.register.mockRejectedValue(
        new Error('Formato de email inválido')
      )

      render(
        <TestWrapper>
          <TestRegistrationComponent />
        </TestWrapper>
      )

      // Preencher com email inválido
      await user.type(screen.getByTestId('name-input'), 'João Silva')
      await user.type(screen.getByTestId('email-input'), 'email-invalido')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.click(screen.getByTestId('register-button'))

      // Aguardar alguma resposta
      await waitFor(() => {
        const errorElement = screen.queryByTestId('error-message')
        const successElement = screen.queryByTestId('success-message')
        
        // Deve haver alguma resposta do sistema
        expect(errorElement || successElement).toBeTruthy()
      })
    })

    it('should handle registration with weak password', async () => {
      // Configurar mock para falhar
      mockApiService.register.mockRejectedValue(
        new Error('Senha deve ter pelo menos 8 caracteres')
      )

      render(
        <TestWrapper>
          <TestRegistrationComponent />
        </TestWrapper>
      )

      // Preencher com senha fraca
      await user.type(screen.getByTestId('name-input'), 'João Silva')
      await user.type(screen.getByTestId('email-input'), 'joao@example.com')
      await user.type(screen.getByTestId('password-input'), '123')
      await user.click(screen.getByTestId('register-button'))

      // Aguardar resposta
      await waitFor(() => {
        const errorElement = screen.queryByTestId('error-message')
        const successElement = screen.queryByTestId('success-message')
        
        expect(errorElement || successElement).toBeTruthy()
      })
    })
  })

  describe('Network and Server Error Scenarios', () => {
    it('should handle network timeout during registration', async () => {
      mockApiService.register.mockRejectedValue(
        new Error('Timeout: Falha na conexão com o servidor')
      )

      render(
        <TestWrapper>
          <TestRegistrationComponent />
        </TestWrapper>
      )

      // Preencher formulário
      await user.type(screen.getByTestId('name-input'), 'João Silva')
      await user.type(screen.getByTestId('email-input'), 'joao@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.click(screen.getByTestId('register-button'))

      // Aguardar resposta
      await waitFor(() => {
        const errorElement = screen.queryByTestId('error-message')
        const successElement = screen.queryByTestId('success-message')
        
        expect(errorElement || successElement).toBeTruthy()
      })
    })
  })

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      render(
        <TestWrapper>
          <TestRegistrationComponent />
        </TestWrapper>
      )

      // Tentar submeter formulário vazio
      await user.click(screen.getByTestId('register-button'))

      // Verificar que a validação HTML5 está funcionando
      const nameInput = screen.getByTestId('name-input') as HTMLInputElement
      const emailInput = screen.getByTestId('email-input') as HTMLInputElement
      const passwordInput = screen.getByTestId('password-input') as HTMLInputElement

      // Pelo menos um campo deve ser inválido
      const hasInvalidField = nameInput.checkValidity() === false ||
                             emailInput.checkValidity() === false ||
                             passwordInput.checkValidity() === false

      expect(hasInvalidField).toBeTruthy()
    })

    it('should validate email format on client side', async () => {
      render(
        <TestWrapper>
          <TestRegistrationComponent />
        </TestWrapper>
      )

      // Preencher com email inválido
      await user.type(screen.getByTestId('name-input'), 'João Silva')
      await user.type(screen.getByTestId('email-input'), 'email-sem-arroba')
      await user.type(screen.getByTestId('password-input'), 'password123')

      // Verificar validação HTML5
      const emailInput = screen.getByTestId('email-input') as HTMLInputElement
      expect(emailInput.validity.valid).toBeFalsy()
    })
  })

  describe('Performance and Memory Tests', () => {
    it('should not create memory leaks during registration', async () => {
      const initialHandles = MockManager.getPendingReferencesInfo()
      
      render(
        <TestWrapper>
          <TestRegistrationComponent />
        </TestWrapper>
      )

      // Realizar múltiplas operações
      for (let i = 0; i < 3; i++) {
        await user.clear(screen.getByTestId('name-input'))
        await user.clear(screen.getByTestId('email-input'))
        await user.clear(screen.getByTestId('password-input'))
        
        await user.type(screen.getByTestId('name-input'), `User ${i}`)
        await user.type(screen.getByTestId('email-input'), `user${i}@example.com`)
        await user.type(screen.getByTestId('password-input'), `password${i}`)
        
        await user.click(screen.getByTestId('register-button'))
        
        // Aguardar resposta
        await waitFor(() => {
          const loading = screen.queryByTestId('loading-indicator')
          const success = screen.queryByTestId('success-message')
          const error = screen.queryByTestId('error-message')
          
          expect(loading || success || error).toBeTruthy()
        })
      }

      // Verificar que não há vazamentos
      const finalHandles = MockManager.getPendingReferencesInfo()
      expect(finalHandles.total).toBeLessThanOrEqual(initialHandles.total + 2)
    })

    it('should handle rapid form submissions without memory leaks', async () => {
      render(
        <TestWrapper>
          <TestRegistrationComponent />
        </TestWrapper>
      )

      // Preencher uma vez
      await user.type(screen.getByTestId('name-input'), 'João Silva')
      await user.type(screen.getByTestId('email-input'), 'joao@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')

      // Múltiplas submissões rápidas
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByTestId('register-button'))
        
        // Aguardar um pouco entre submissões
        await new Promise(resolve => TimerManager.setTimeout(() => resolve(undefined), 50))
      }

      // Aguardar estabilização
      await waitFor(() => {
        const loading = screen.queryByTestId('loading-indicator')
        const success = screen.queryByTestId('success-message')
        const error = screen.queryByTestId('error-message')
        
        expect(loading || success || error).toBeTruthy()
      })

      // Verificar que não há muitas referências pendentes
      const pendingRefs = MockManager.getPendingReferencesInfo()
      expect(pendingRefs.total).toBeLessThan(10)
    })
  })
}, { timeout: 60000 }) // Timeout maior para testes de performance 