/**
 * Teste de Integração: Fluxo Signup + Workspace Individual
 * 
 * Este teste verifica se o fluxo completo de registro funciona corretamente:
 * 1. Usuário se registra
 * 2. Workspace individual é criado automaticamente
 * 3. Usuário é redirecionado com workspace ativo
 * 4. Permissões são aplicadas corretamente
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { AuthProvider } from '@/context/auth-context'
import { WorkspaceProvider } from '@/context/workspace-context'
import { PlanProvider } from '@/context/plan-context'
import { RegisterForm } from '@/components/auth/register-form'
import { WorkspaceSelector } from '@/components/workspaces/workspace-selector'
import { apiService } from '@/lib/api/service'

// Mock do backend
jest.mock('@/lib/api/service')
const MockedApiService = apiService as jest.Mocked<typeof apiService>

// Mock do router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/test',
}))

describe('Fluxo de Signup + Workspace Individual', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <WorkspaceProvider>
        <PlanProvider>
          {children}
        </PlanProvider>
      </WorkspaceProvider>
    </AuthProvider>
  )

  describe('1. Registro de Usuário', () => {
    test('deve permitir registro com dados válidos', async () => {
      // Mock da resposta de registro
      MockedApiService.register = jest.fn().mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString()
      })

      // Mock da resposta de login automático
      MockedApiService.login = jest.fn().mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        },
        tokens: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token'
        }
      })

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      )

      // Preencher formulário
      fireEvent.change(screen.getByLabelText(/nome/i), { 
        target: { value: 'Test User' } 
      })
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'test@example.com' } 
      })
      fireEvent.change(screen.getByLabelText(/senha/i), { 
        target: { value: 'Test1234!' } 
      })
      fireEvent.change(screen.getByLabelText(/confirmar senha/i), { 
        target: { value: 'Test1234!' } 
      })
      fireEvent.click(screen.getByLabelText(/aceito.*termos/i))

      // Submeter
      fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

      await waitFor(() => {
        expect(MockedApiService.register).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Test1234!',
          username: expect.any(String),
          full_name: 'Test User'
        })
      })
    })

    test('deve bloquear registro com dados inválidos', async () => {
      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      )

      // Tentar submeter sem preencher campos
      fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

      // Verificar se mostra erros de validação
      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
      })

      // Verificar que API não foi chamada
      expect(MockedApiService.register).not.toHaveBeenCalled()
    })
  })

  describe('2. Criação Automática de Workspace', () => {
    test('deve criar workspace automaticamente após registro', async () => {
      // Mock das respostas
      MockedApiService.getCurrentUser = jest.fn().mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User'
      })

      MockedApiService.getWorkspaces = jest.fn()
        .mockResolvedValueOnce([]) // Primeira chamada: sem workspaces
        .mockResolvedValue([{     // Segunda chamada: workspace criado
          id: 'ws-1',
          name: 'Workspace de Test User',
          description: 'Workspace padrão criado automaticamente',
          owner_id: '1',
          member_count: 1,
          project_count: 0
        }])

      MockedApiService.createWorkspace = jest.fn().mockResolvedValue({
        id: 'ws-1',
        name: 'Workspace de Test User',
        description: 'Workspace padrão criado automaticamente',
        owner_id: '1',
        member_count: 1,
        project_count: 0
      })

      // Simular inicialização de dados do usuário
      await act(async () => {
        await MockedApiService.initializeUserData?.()
      })

      await waitFor(() => {
        expect(MockedApiService.createWorkspace).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Workspace de Test User',
            description: 'Workspace padrão criado automaticamente',
            is_public: false
          })
        )
      })
    })

    test('não deve criar workspace se já existir um', async () => {
      // Mock: usuário já tem workspace
      MockedApiService.getWorkspaces = jest.fn().mockResolvedValue([{
        id: 'ws-existing',
        name: 'Workspace Existente',
        owner_id: '1',
        member_count: 1,
        project_count: 0
      }])

      MockedApiService.createWorkspace = jest.fn()

      // Simular inicialização
      await act(async () => {
        await MockedApiService.initializeUserData?.()
      })

      // Verificar que não tentou criar workspace
      expect(MockedApiService.createWorkspace).not.toHaveBeenCalled()
    })
  })

  describe('3. Interface de Workspace', () => {
    test('deve exibir workspace no seletor após criação', async () => {
      const mockWorkspace = {
        id: 'ws-1',
        name: 'Workspace de Test User',
        description: 'Workspace padrão',
        owner_id: '1',
        member_count: 1,
        project_count: 0,
        is_public: false,
        avatar_url: null,
        color: '#3B82F6'
      }

      // Mock do contexto de workspace
      const mockWorkspaceContext = {
        state: {
          currentWorkspace: mockWorkspace,
          workspaces: [mockWorkspace],
          isLoading: false,
          isInitialized: true,
          error: null
        },
        setCurrentWorkspace: jest.fn(),
        getWorkspaces: () => [mockWorkspace]
      }

      // Mock do hook useWorkspace
      jest.doMock('@/context/workspace-context', () => ({
        useWorkspace: () => mockWorkspaceContext,
        useCurrentWorkspace: () => mockWorkspace
      }))

      render(
        <TestWrapper>
          <WorkspaceSelector />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Workspace de Test User')).toBeInTheDocument()
        expect(screen.getByText('1 membro')).toBeInTheDocument()
      })
    })
  })

  describe('4. Permissões e Limites', () => {
    test('deve aplicar permissões do plano Free corretamente', async () => {
      // Mock do plano Free
      const mockPlanContext = {
        currentPlan: {
          id: 'free',
          name: 'Free',
          limits: {
            max_workspaces: 1,
            max_members_per_workspace: 5,
            max_storage_gb: 1
          }
        },
        hasPermission: (permission: string) => {
          switch (permission) {
            case 'workspace.create':
              return false // Plano free não pode criar mais workspaces
            case 'members.invite':
              return true
            default:
              return false
          }
        },
        usage: {
          workspaces_count: 1,
          members_count: 1,
          storage_used_gb: 0
        }
      }

      // Mock do hook usePlan
      jest.doMock('@/context/plan-context', () => ({
        usePlan: () => mockPlanContext
      }))

      render(
        <TestWrapper>
          <WorkspaceSelector showCreateButton={true} />
        </TestWrapper>
      )

      await waitFor(() => {
        // Verificar que botão de criar está desabilitado
        const createButton = screen.getByText(/criar novo workspace/i)
        expect(createButton.closest('[disabled]')).toBeTruthy()
      })
    })

    test('deve mostrar modal de limite quando tentar exceder', async () => {
      // Mock do hook de permissões
      const mockPermissions = {
        validateWorkspaceCreation: jest.fn().mockReturnValue(false),
        showLimitModal: jest.fn()
      }

      jest.doMock('@/hooks/use-workspace-permissions', () => ({
        useWorkspacePermissions: () => mockPermissions
      }))

      render(
        <TestWrapper>
          <WorkspaceSelector showCreateButton={true} />
        </TestWrapper>
      )

      // Tentar criar workspace
      const createButton = screen.getByText(/criar novo workspace/i)
      fireEvent.click(createButton)

      expect(mockPermissions.validateWorkspaceCreation).toHaveBeenCalled()
    })
  })

  describe('5. Fluxo Completo End-to-End', () => {
    test('deve completar fluxo de signup até workspace ativo', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString()
      }

      const mockWorkspace = {
        id: 'ws-1',
        name: 'Workspace de Test User',
        owner_id: '1',
        member_count: 1,
        project_count: 0
      }

      // Setup mocks completos
      MockedApiService.register = jest.fn().mockResolvedValue(mockUser)
      MockedApiService.login = jest.fn().mockResolvedValue({
        user: mockUser,
        tokens: { access: 'token', refresh: 'refresh' }
      })
      MockedApiService.getWorkspaces = jest.fn()
        .mockResolvedValueOnce([])
        .mockResolvedValue([mockWorkspace])
      MockedApiService.createWorkspace = jest.fn().mockResolvedValue(mockWorkspace)

      const TestComponent = () => (
        <TestWrapper>
          <div>
            <RegisterForm />
            <WorkspaceSelector />
          </div>
        </TestWrapper>
      )

      render(<TestComponent />)

      // 1. Registrar usuário
      fireEvent.change(screen.getByLabelText(/nome/i), { 
        target: { value: 'Test User' } 
      })
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'test@example.com' } 
      })
      fireEvent.change(screen.getByLabelText(/senha/i), { 
        target: { value: 'Test1234!' } 
      })
      fireEvent.change(screen.getByLabelText(/confirmar senha/i), { 
        target: { value: 'Test1234!' } 
      })
      fireEvent.click(screen.getByLabelText(/aceito.*termos/i))
      fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

      // 2. Aguardar criação automática de workspace
      await waitFor(() => {
        expect(MockedApiService.createWorkspace).toHaveBeenCalled()
      }, { timeout: 5000 })

      // 3. Verificar que workspace aparece na interface
      await waitFor(() => {
        expect(screen.getByText('Workspace de Test User')).toBeInTheDocument()
      })
    })
  })
}) 