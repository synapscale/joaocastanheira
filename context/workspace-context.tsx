"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { apiService } from '../lib/api/service'
import type { Workspace, WorkspaceMember } from '../lib/api/service'
import { useAuth } from './auth-context'

// Tipos do contexto
export interface WorkspaceState {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  members: WorkspaceMember[]
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

export type WorkspaceAction =
  | { type: 'WORKSPACE_START' }
  | { type: 'WORKSPACE_SUCCESS'; payload: { workspaces: Workspace[]; current?: Workspace } }
  | { type: 'WORKSPACE_SET_CURRENT'; payload: Workspace }
  | { type: 'WORKSPACE_MEMBERS_SUCCESS'; payload: WorkspaceMember[] }
  | { type: 'WORKSPACE_ERROR'; payload: string }
  | { type: 'WORKSPACE_INITIALIZE' }
  | { type: 'WORKSPACE_RESET' }

export interface WorkspaceContextType {
  // Estado
  state: WorkspaceState
  
  // Ações
  loadWorkspaces: () => Promise<void>
  setCurrentWorkspace: (workspace: Workspace) => void
  createWorkspace: (data: Partial<Workspace>) => Promise<Workspace>
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<Workspace>
  deleteWorkspace: (id: string) => Promise<void>
  loadMembers: (workspaceId: string) => Promise<void>
  inviteMember: (workspaceId: string, email: string, role?: string) => Promise<void>
  
  // Getters
  getCurrentWorkspace: () => Workspace | null
  getWorkspaces: () => Workspace[]
  isWorkspaceOwner: (workspace?: Workspace) => boolean
}

// Estado inicial
const initialState: WorkspaceState = {
  currentWorkspace: null,
  workspaces: [],
  members: [],
  isLoading: false,
  isInitialized: false,
  error: null,
}

// Reducer
function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'WORKSPACE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case 'WORKSPACE_SUCCESS':
      return {
        ...state,
        workspaces: action.payload.workspaces,
        currentWorkspace: action.payload.current || state.currentWorkspace || action.payload.workspaces[0] || null,
        isLoading: false,
        error: null,
      }

    case 'WORKSPACE_SET_CURRENT':
      return {
        ...state,
        currentWorkspace: action.payload,
        error: null,
      }

    case 'WORKSPACE_MEMBERS_SUCCESS':
      return {
        ...state,
        members: action.payload,
        error: null,
      }

    case 'WORKSPACE_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }

    case 'WORKSPACE_INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
      }

    case 'WORKSPACE_RESET':
      return initialState

    default:
      return state
  }
}

// Contexto
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

// Provider
interface WorkspaceProviderProps {
  children: React.ReactNode
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState)
  const authContext = useAuth()

  /**
   * Cria workspace padrão se necessário
   */
  const createDefaultWorkspace = useCallback(async () => {
    if (!authContext.user) return

    try {
      const workspaceName = `Workspace de ${authContext.user.name || authContext.user.email}`
      
      const workspace = await apiService.createWorkspace({
        name: workspaceName,
        description: 'Workspace pessoal criado automaticamente',
        is_public: false,
        allow_guest_access: false,
        require_approval: false,
        max_members: 10,
        max_projects: 100,
        max_storage_mb: 1000,
        enable_real_time_editing: true,
        enable_comments: true,
        enable_chat: true,
        enable_video_calls: false,
        color: '#3B82F6'
      })
      
      console.log('✅ Workspace padrão criado:', workspace.name)
      return workspace
    } catch (error) {
      console.warn('⚠️ Erro ao criar workspace padrão:', error)
      throw error
    }
  }, [authContext.user])

  /**
   * Inicializa workspaces do usuário
   * IMPORTANTE: NÃO criar workspaces aqui - deixar para o ApiService
   */
  const initializeWorkspaces = useCallback(async () => {
    if (!authContext.user) return

    try {
      dispatch({ type: 'WORKSPACE_START' })
      
      console.log('🏢 Inicializando workspaces do usuário...')
      
      // Carregar workspaces existentes
      const workspaces = await apiService.getWorkspaces()
      console.log('📋 Workspaces encontrados:', workspaces.length)
      
      // REGRA DE NEGÓCIO: Não criar workspaces aqui!
      // O ApiService já cria automaticamente o workspace individual
      if (workspaces.length === 0) {
        console.log('⚠️ Nenhum workspace encontrado - aguardando ApiService criar automaticamente...')
        dispatch({ type: 'WORKSPACE_ERROR', payload: 'Aguardando criação de workspace individual' })
      } else {
        // Definir o primeiro workspace como atual se não houver um definido
        const savedWorkspaceId = localStorage.getItem('current_workspace_id')
        const currentWorkspace = savedWorkspaceId 
          ? workspaces.find(w => w.id === savedWorkspaceId) || workspaces[0]
          : workspaces[0]
        
        dispatch({ 
          type: 'WORKSPACE_SUCCESS', 
          payload: { workspaces, current: currentWorkspace } 
        })
        
        console.log('✅ Workspace atual definido:', currentWorkspace.name)
      }
    } catch (error) {
      console.warn('⚠️ Erro ao inicializar workspaces:', error)
      dispatch({ type: 'WORKSPACE_ERROR', payload: 'Erro ao carregar workspaces' })
    } finally {
      dispatch({ type: 'WORKSPACE_INITIALIZE' })
    }
  }, [authContext.user])

  // TEMPORARIAMENTE DESABILITADO - Inicializar workspaces quando usuário fizer login
  useEffect(() => {
    console.log('🔍 DEBUG WorkspaceContext useEffect:', {
      authInitialized: authContext.isInitialized,
      hasUser: !!authContext.user,
      userEmail: authContext.user?.email,
      workspaceInitialized: state.isInitialized,
      shouldInitialize: authContext.isInitialized && authContext.user && !state.isInitialized,
      TEMPORARIAMENTE_DESABILITADO: true
    })
    
    // TEMPORARIAMENTE DESABILITADO - requests automáticos para /workspaces
    // if (authContext.isInitialized && authContext.user && !state.isInitialized) {
    //   console.log('🚀 Iniciando inicialização de workspaces...')
    //   initializeWorkspaces()
    // } else if (!authContext.user && state.isInitialized) {
    //   // Reset quando usuário fizer logout
    //   console.log('🔄 Reset de workspaces - usuário fez logout')
    //   dispatch({ type: 'WORKSPACE_RESET' })
    // }
    
    console.log('🔴 WorkspaceContext: Inicialização automática DESABILITADA temporariamente para debug')
  }, [authContext.isInitialized, authContext.user, state.isInitialized, initializeWorkspaces])

  /**
   * Carrega lista de workspaces
   */
  const loadWorkspaces = useCallback(async () => {
    try {
      dispatch({ type: 'WORKSPACE_START' })
      const workspaces = await apiService.getWorkspaces()
      dispatch({ type: 'WORKSPACE_SUCCESS', payload: { workspaces } })
    } catch (error) {
      console.warn('⚠️ Erro ao carregar workspaces:', error)
      dispatch({ type: 'WORKSPACE_ERROR', payload: 'Erro ao carregar workspaces' })
    }
  }, [])

  // Escutar mudanças de workspace do ApiService
  useEffect(() => {
    if (!authContext.user) return

    const handleWorkspaceChange = () => {
      console.log('🔔 WorkspaceContext: Recebida notificação de mudança de workspace')
      if (authContext.user && state.isInitialized) {
        console.log('🔄 Recarregando workspaces após notificação...')
        loadWorkspaces()
      }
    }

    // Registrar listener
    apiService.onWorkspaceChange(handleWorkspaceChange)
    console.log('👂 WorkspaceContext: Listener de mudanças registrado')

    // Cleanup: remover listener quando componente for desmontado ou usuário mudar
    return () => {
      console.log('🧹 WorkspaceContext: Removendo listener de mudanças')
      apiService.offWorkspaceChange(handleWorkspaceChange)
    }
  }, [authContext.user, state.isInitialized, loadWorkspaces])

  /**
   * Define workspace atual
   */
  const setCurrentWorkspace = useCallback((workspace: Workspace) => {
    dispatch({ type: 'WORKSPACE_SET_CURRENT', payload: workspace })
    localStorage.setItem('current_workspace_id', workspace.id)
    console.log('🏢 Workspace atual alterado para:', workspace.name)
  }, [])

  /**
   * Cria novo workspace
   */
  const createWorkspace = useCallback(async (data: Partial<Workspace>): Promise<Workspace> => {
    try {
      const workspace = await apiService.createWorkspace(data as any)
      await loadWorkspaces() // Recarregar lista
      return workspace
    } catch (error) {
      console.warn('⚠️ Erro ao criar workspace:', error)
      throw error
    }
  }, [loadWorkspaces])

  /**
   * Atualiza workspace
   */
  const updateWorkspace = useCallback(async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
    try {
      const workspace = await apiService.updateWorkspace(id, data)
      await loadWorkspaces() // Recarregar lista
      return workspace
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar workspace:', error)
      throw error
    }
  }, [loadWorkspaces])

  /**
   * Deleta workspace
   */
  const deleteWorkspace = useCallback(async (id: string): Promise<void> => {
    try {
      await apiService.deleteWorkspace(id)
      await loadWorkspaces() // Recarregar lista
      
      // Se deletou o workspace atual, definir outro como atual
      if (state.currentWorkspace?.id === id && state.workspaces.length > 1) {
        const nextWorkspace = state.workspaces.find(w => w.id !== id)
        if (nextWorkspace) {
          setCurrentWorkspace(nextWorkspace)
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao deletar workspace:', error)
      throw error
    }
  }, [state.currentWorkspace, state.workspaces, loadWorkspaces, setCurrentWorkspace])

  /**
   * Carrega membros do workspace
   */
  const loadMembers = useCallback(async (workspaceId: string) => {
    try {
      const members = await apiService.getWorkspaceMembers(workspaceId)
      dispatch({ type: 'WORKSPACE_MEMBERS_SUCCESS', payload: members })
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
      dispatch({ type: 'WORKSPACE_ERROR', payload: 'Erro ao carregar membros' })
    }
  }, [])

  /**
   * Convida membro para workspace
   */
  const inviteMember = useCallback(async (workspaceId: string, email: string, role: string = 'member') => {
    try {
      await apiService.inviteWorkspaceMember(workspaceId, { email, role: role as any })
      await loadMembers(workspaceId) // Recarregar membros
    } catch (error) {
      console.error('Erro ao convidar membro:', error)
      throw error
    }
  }, [loadMembers])

  /**
   * Obtém workspace atual
   */
  const getCurrentWorkspace = useCallback(() => {
    return state.currentWorkspace
  }, [state.currentWorkspace])

  /**
   * Obtém lista de workspaces
   */
  const getWorkspaces = useCallback(() => {
    return state.workspaces
  }, [state.workspaces])

  /**
   * Verifica se usuário é owner do workspace
   */
  const isWorkspaceOwner = useCallback((workspace?: Workspace) => {
    const ws = workspace || state.currentWorkspace
    return ws ? ws.owner_id === authContext.user?.id : false
  }, [state.currentWorkspace, authContext.user])

  // Valor do contexto
  const contextValue: WorkspaceContextType = useMemo(() => ({
    state,
    loadWorkspaces,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    loadMembers,
    inviteMember,
    getCurrentWorkspace,
    getWorkspaces,
    isWorkspaceOwner,
  }), [state, loadWorkspaces, setCurrentWorkspace, createWorkspace, updateWorkspace, deleteWorkspace, loadMembers, inviteMember, getCurrentWorkspace, getWorkspaces, isWorkspaceOwner])

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  )
}

// Hook para usar o contexto
export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}

// Hooks utilitários
export function useCurrentWorkspace(): Workspace | null {
  const { getCurrentWorkspace } = useWorkspace()
  return getCurrentWorkspace()
}

export function useWorkspaces(): Workspace[] {
  const { getWorkspaces } = useWorkspace()
  return getWorkspaces()
}

export function useIsWorkspaceOwner(workspace?: Workspace): boolean {
  const { isWorkspaceOwner } = useWorkspace()
  return isWorkspaceOwner(workspace)
} 