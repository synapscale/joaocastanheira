"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useReducer } from "react"
import { generateId } from "@/utils/id"
import { useAuth } from "@/context/auth-context"
import { variableService, type UserVariable, type UserVariableCreate, type UserVariableUpdate } from "@/lib/services/variables"

/**
 * Interface do contexto de variáveis (compatibilidade com o frontend existente)
 */
interface Variable extends UserVariable {
  name: string
  type: 'string' | 'secret' | 'number' | 'boolean' | 'json'
  scope: 'global' | 'workflow' | 'node'
  tags: string[]
  isSystem?: boolean
  isSecret?: boolean
  isActive?: boolean
}

interface VariableContextType {
  // Estado
  variables: Variable[]
  loading: boolean
  error: string | null
  syncing: boolean
  lastSync: Date | null

  // Operações CRUD
  addVariable: (variable: Omit<Variable, "id" | "created_at" | "updated_at">) => Promise<Variable | null>
  updateVariable: (id: string, updates: Partial<Omit<Variable, "id" | "created_at" | "updated_at">>) => Promise<boolean>
  deleteVariable: (id: string) => Promise<boolean>

  // Operações de variáveis
  getVariableById: (id: string) => Variable | undefined
  getVariableByKey: (key: string) => Variable | undefined
  getVariablesByCategory: (category: string) => Variable[]

  // Sincronização
  syncVariables: () => Promise<boolean>
  loadVariables: () => Promise<void>
  clearError: () => void

  // Operações especiais para user variables
  importVariables: (file: File, category?: string) => Promise<boolean>
  exportVariables: (format: 'json' | 'env') => Promise<void>
}

/**
 * Estado do reducer de variáveis
 */
interface VariableState {
  variables: Variable[]
  loading: boolean
  error: string | null
  syncing: boolean
  lastSync: Date | null
}

/**
 * Ações do reducer de variáveis
 */
type VariableAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_VARIABLES'; payload: Variable[] }
  | { type: 'ADD_VARIABLE'; payload: Variable }
  | { type: 'UPDATE_VARIABLE'; payload: { id: string; variable: Variable } }
  | { type: 'DELETE_VARIABLE'; payload: string }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'CLEAR_ERROR' }

/**
 * Reducer para gerenciar estado de variáveis
 */
function variableReducer(state: VariableState, action: VariableAction): VariableState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_SYNCING':
      return { ...state, syncing: action.payload }
    
    case 'SET_VARIABLES':
      return { ...state, variables: action.payload, loading: false, lastSync: new Date() }
    
    case 'ADD_VARIABLE':
      return { ...state, variables: [...state.variables, action.payload], loading: false }
    
    case 'UPDATE_VARIABLE':
      return {
        ...state,
        variables: state.variables.map(v => 
          v.id === action.payload.id ? action.payload.variable : v
        ),
        loading: false
      }
    
    case 'DELETE_VARIABLE':
      return {
        ...state,
        variables: state.variables.filter(v => v.id !== action.payload),
        loading: false
      }
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

/**
 * Função para converter UserVariable para Variable (compatibilidade)
 */
function userVariableToVariable(userVar: UserVariable): Variable {
  return {
    ...userVar,
    name: userVar.key, // Usar key como name para compatibilidade
    type: userVar.is_encrypted ? 'secret' : 'string',
    scope: 'global' as const,
    tags: userVar.category ? [userVar.category] : [],
    isSecret: userVar.is_encrypted,
    isActive: userVar.is_active,
  }
}

/**
 * Função para converter Variable para UserVariableCreate
 */
function variableToUserVariableCreate(variable: Omit<Variable, "id" | "created_at" | "updated_at">): UserVariableCreate {
  return {
    key: variable.key,
    value: variable.value || '',
    description: variable.description,
    is_encrypted: variable.type === 'secret' || variable.isSecret || false,
    is_active: variable.isActive !== false,
    category: variable.tags?.[0] || variable.category,
  }
}

/**
 * Função para converter atualizações de Variable para UserVariableUpdate
 */
function variableToUserVariableUpdate(updates: Partial<Variable>): UserVariableUpdate {
  return {
    value: updates.value,
    description: updates.description,
    is_encrypted: updates.type === 'secret' || updates.isSecret,
    is_active: updates.isActive,
    category: updates.tags?.[0] || updates.category,
  }
}

const VariableContext = createContext<VariableContextType | undefined>(undefined)

/**
 * Provider de variáveis com integração ao backend
 */
export function VariableProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  
  const [state, dispatch] = useReducer(variableReducer, {
    variables: [],
    loading: false,
    error: null,
    syncing: false,
    lastSync: null,
  })

  /**
   * Carrega variáveis do backend
   */
  const loadVariables = useCallback(async () => {
    if (!isAuthenticated) return

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    
    try {
      const response = await variableService.getVariables({
        include_values: false // Por segurança, não carregar valores por padrão
      })
      
      const variables = response.variables.map(userVariableToVariable)
      dispatch({ type: 'SET_VARIABLES', payload: variables })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao carregar variáveis' 
      })
    }
  }, [isAuthenticated])

  /**
   * Adiciona uma nova variável
   */
  const addVariable = useCallback(async (
    variable: Omit<Variable, "id" | "created_at" | "updated_at">
  ): Promise<Variable | null> => {
    if (!isAuthenticated) return null

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const createData = variableToUserVariableCreate(variable)
      const newUserVariable = await variableService.createVariable(createData)
      const newVariable = userVariableToVariable(newUserVariable)
      
      dispatch({ type: 'ADD_VARIABLE', payload: newVariable })
      return newVariable
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao criar variável' 
      })
      return null
    }
  }, [isAuthenticated])

  /**
   * Atualiza uma variável existente
   */
  const updateVariable = useCallback(async (
    id: string, 
    updates: Partial<Omit<Variable, "id" | "created_at" | "updated_at">>
  ): Promise<boolean> => {
    if (!isAuthenticated) return false

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const updateData = variableToUserVariableUpdate(updates)
      const updatedUserVariable = await variableService.updateVariable(id, updateData)
      const updatedVariable = userVariableToVariable(updatedUserVariable)
      
      dispatch({ type: 'UPDATE_VARIABLE', payload: { id, variable: updatedVariable } })
      return true
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao atualizar variável' 
      })
      return false
    }
  }, [isAuthenticated])

  /**
   * Deleta uma variável
   */
  const deleteVariable = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      await variableService.deleteVariable(id)
      dispatch({ type: 'DELETE_VARIABLE', payload: id })
      return true
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao deletar variável' 
      })
      return false
    }
  }, [isAuthenticated])

  /**
   * Sincroniza variáveis (recarrega do backend)
   */
  const syncVariables = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false

    dispatch({ type: 'SET_SYNCING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await variableService.getVariables({
        include_values: false
      })
      
      const variables = response.variables.map(userVariableToVariable)
      dispatch({ type: 'SET_VARIABLES', payload: variables })
      dispatch({ type: 'SET_SYNCING', payload: false })
      return true
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao sincronizar variáveis' 
      })
      dispatch({ type: 'SET_SYNCING', payload: false })
      return false
    }
  }, [isAuthenticated])

  /**
   * Importa variáveis de arquivo
   */
  const importVariables = useCallback(async (file: File, category?: string): Promise<boolean> => {
    if (!isAuthenticated) return false

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      await variableService.importVariablesFromFile(file, category, false)
      // Recarrega as variáveis após a importação
      const response = await variableService.getVariables({
        include_values: false
      })
      const variables = response.variables.map(userVariableToVariable)
      dispatch({ type: 'SET_VARIABLES', payload: variables })
      return true
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao importar variáveis' 
      })
      return false
    }
  }, [isAuthenticated])

  /**
   * Exporta variáveis
   */
  const exportVariables = useCallback(async (format: 'json' | 'env'): Promise<void> => {
    if (!isAuthenticated) return

    try {
      const blob = await variableService.exportVariables({
        format,
        include_encrypted: false // Por segurança
      })
      
      // Download do arquivo
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `user-variables.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao exportar variáveis' 
      })
    }
  }, [isAuthenticated])

  // Operações de consulta
  const getVariableById = useCallback((id: string) => {
    return state.variables.find(v => v.id === id)
  }, [state.variables])

  const getVariableByKey = useCallback((key: string) => {
    return state.variables.find(v => v.key === key)
  }, [state.variables])

  const getVariablesByCategory = useCallback((category: string) => {
    return state.variables.filter(v => v.tags.includes(category) || v.category === category)
  }, [state.variables])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // Carrega variáveis quando autenticado
  useEffect(() => {
    if (isAuthenticated && state.variables.length === 0 && !state.loading) {
      loadVariables()
    }
  }, [isAuthenticated])

  const contextValue: VariableContextType = {
    variables: state.variables,
    loading: state.loading,
    error: state.error,
    syncing: state.syncing,
    lastSync: state.lastSync,
    addVariable,
    updateVariable,
    deleteVariable,
    getVariableById,
    getVariableByKey,
    getVariablesByCategory,
    syncVariables,
    loadVariables,
    clearError,
    importVariables,
    exportVariables,
  }

  return (
    <VariableContext.Provider value={contextValue}>
      {children}
    </VariableContext.Provider>
  )
}

/**
 * Hook para usar o contexto de variáveis
 */
export const useVariables = () => {
  const context = useContext(VariableContext)
  if (context === undefined) {
    throw new Error("useVariables deve ser usado dentro de um VariableProvider")
  }
  return context
}

export default VariableProvider

