"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useReducer } from "react"
import { nanoid } from "nanoid"
import { useAuth } from "@/context/auth-context"
import { variableService, type CreateVariableData, type UpdateVariableData } from "@/lib/services/variables"
import type { Variable, VariableScope, VariableUsage } from "@/types/variable"

/**
 * Interface do contexto de variáveis
 */
interface VariableContextType {
  // Estado
  variables: Variable[]
  variableUsage: VariableUsage[]
  loading: boolean
  error: string | null
  syncing: boolean
  lastSync: Date | null

  // Operações CRUD
  addVariable: (variable: Omit<Variable, "id" | "createdAt" | "updatedAt">) => Promise<Variable | null>
  updateVariable: (id: string, updates: Partial<Omit<Variable, "id" | "createdAt" | "updatedAt">>) => Promise<boolean>
  deleteVariable: (id: string) => Promise<boolean>

  // Operações de variáveis
  getVariableById: (id: string) => Variable | undefined
  getVariableByKey: (key: string, scope?: VariableScope) => Variable | undefined
  getVariablesByScope: (scope: VariableScope) => Variable[]

  // Uso de variáveis
  trackVariableUsage: (usage: Omit<VariableUsage, "id">) => void
  removeVariableUsage: (nodeId: string, parameterKey: string) => void
  getNodeVariableUsage: (nodeId: string) => VariableUsage[]
  getVariableUsage: (variableId: string) => VariableUsage[]

  // Avaliação de variáveis
  evaluateExpression: (expression: string, nodeId?: string) => any
  resolveVariableValue: (variableId: string, path?: string) => any

  // Sincronização
  syncVariables: () => Promise<boolean>
  loadVariables: () => Promise<void>
  clearError: () => void
}

/**
 * Estado do reducer de variáveis
 */
interface VariableState {
  variables: Variable[]
  variableUsage: VariableUsage[]
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
  | { type: 'SET_VARIABLE_USAGE'; payload: VariableUsage[] }
  | { type: 'ADD_VARIABLE_USAGE'; payload: VariableUsage }
  | { type: 'REMOVE_VARIABLE_USAGE'; payload: { nodeId: string; parameterKey: string } }
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
    
    case 'SET_VARIABLE_USAGE':
      return { ...state, variableUsage: action.payload }
    
    case 'ADD_VARIABLE_USAGE':
      return { ...state, variableUsage: [...state.variableUsage, action.payload] }
    
    case 'REMOVE_VARIABLE_USAGE':
      return {
        ...state,
        variableUsage: state.variableUsage.filter(
          usage => !(usage.nodeId === action.payload.nodeId && usage.parameterKey === action.payload.parameterKey)
        )
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
 * Variáveis do sistema
 */
const systemVariables: Variable[] = [
  {
    id: "sys-timestamp",
    name: "Timestamp",
    key: "timestamp",
    type: "expression",
    value: "() => Date.now()",
    scope: "global",
    description: "Current timestamp in milliseconds",
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystem: true,
  },
  {
    id: "sys-date",
    name: "Current Date",
    key: "currentDate",
    type: "expression",
    value: "() => new Date().toISOString()",
    scope: "global",
    description: "Current date in ISO format",
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystem: true,
  },
  {
    id: "sys-workflow-id",
    name: "Workflow ID",
    key: "workflowId",
    type: "string",
    value: "current-workflow-id",
    scope: "workflow",
    description: "ID of the current workflow",
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystem: true,
  },
  {
    id: "sys-workflow-name",
    name: "Workflow Name",
    key: "workflowName",
    type: "string",
    value: "Current Workflow",
    scope: "workflow",
    description: "Name of the current workflow",
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystem: true,
  },
]

const VariableContext = createContext<VariableContextType | undefined>(undefined)

/**
 * Provider de variáveis com integração ao backend
 */
export function VariableProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  
  const [state, dispatch] = useReducer(variableReducer, {
    variables: systemVariables,
    variableUsage: [],
    loading: false,
    error: null,
    syncing: false,
    lastSync: null,
  })

  /**
   * Carrega variáveis do localStorage (fallback) e do backend
   */
  const loadVariables = useCallback(async () => {
    // Sempre carrega variáveis do localStorage primeiro (modo offline)
    try {
      const storedVariables = localStorage.getItem("workflow-variables")
      const storedUsage = localStorage.getItem("workflow-variable-usage")
      
      if (storedVariables) {
        const parsedVariables = JSON.parse(storedVariables)
        const mergedVariables = [
          ...systemVariables,
          ...parsedVariables.filter((v: Variable) => !systemVariables.some((sv) => sv.id === v.id)),
        ]
        dispatch({ type: 'SET_VARIABLES', payload: mergedVariables })
      }

      if (storedUsage) {
        dispatch({ type: 'SET_VARIABLE_USAGE', payload: JSON.parse(storedUsage) })
      }
    } catch (error) {
      console.error("Failed to load variables from localStorage:", error)
    }

    // Se autenticado, carrega do backend
    if (isAuthenticated) {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        const response = await variableService.getVariables()
        const mergedVariables = [
          ...systemVariables,
          ...response.variables.filter(v => !systemVariables.some(sv => sv.id === v.id)),
        ]
        dispatch({ type: 'SET_VARIABLES', payload: mergedVariables })
        
        // Salva no localStorage para uso offline
        const variablesToSave = response.variables.filter(v => !v.isSystem)
        localStorage.setItem("workflow-variables", JSON.stringify(variablesToSave))
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Erro ao carregar variáveis' 
        })
      }
    }
  }, [isAuthenticated])

  /**
   * Adiciona uma nova variável
   */
  const addVariable = useCallback(async (
    variable: Omit<Variable, "id" | "createdAt" | "updatedAt">
  ): Promise<Variable | null> => {
    dispatch({ type: 'SET_LOADING', payload: true })

    // Se autenticado, salva no backend
    if (isAuthenticated) {
      try {
        const createData: CreateVariableData = {
          name: variable.name,
          key: variable.key,
          type: variable.type,
          value: variable.value,
          scope: variable.scope,
          description: variable.description,
          isSecret: variable.isSecret,
          tags: variable.tags,
        }

        const newVariable = await variableService.createVariable(createData)
        dispatch({ type: 'ADD_VARIABLE', payload: newVariable })
        
        // Atualiza localStorage
        const variablesToSave = state.variables.filter(v => !v.isSystem)
        localStorage.setItem("workflow-variables", JSON.stringify([...variablesToSave, newVariable]))
        
        return newVariable
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Erro ao criar variável' 
        })
        return null
      }
    } else {
      // Modo offline - salva apenas localmente
      const newVariable: Variable = {
        ...variable,
        id: `var-${nanoid(6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      dispatch({ type: 'ADD_VARIABLE', payload: newVariable })
      
      // Salva no localStorage
      const variablesToSave = [...state.variables.filter(v => !v.isSystem), newVariable]
      localStorage.setItem("workflow-variables", JSON.stringify(variablesToSave))
      
      return newVariable
    }
  }, [isAuthenticated, state.variables])

  /**
   * Atualiza uma variável existente
   */
  const updateVariable = useCallback(async (
    id: string, 
    updates: Partial<Omit<Variable, "id" | "createdAt" | "updatedAt">>
  ): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true })

    // Se autenticado, atualiza no backend
    if (isAuthenticated) {
      try {
        const updateData: UpdateVariableData = {
          name: updates.name,
          value: updates.value,
          description: updates.description,
          isSecret: updates.isSecret,
          tags: updates.tags,
        }

        const updatedVariable = await variableService.updateVariable(id, updateData)
        dispatch({ type: 'UPDATE_VARIABLE', payload: { id, variable: updatedVariable } })
        
        // Atualiza localStorage
        const variablesToSave = state.variables
          .filter(v => !v.isSystem)
          .map(v => v.id === id ? updatedVariable : v)
        localStorage.setItem("workflow-variables", JSON.stringify(variablesToSave))
        
        return true
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Erro ao atualizar variável' 
        })
        return false
      }
    } else {
      // Modo offline - atualiza apenas localmente
      const variable = state.variables.find(v => v.id === id)
      if (variable) {
        const updatedVariable = {
          ...variable,
          ...updates,
          updatedAt: new Date(),
        }

        dispatch({ type: 'UPDATE_VARIABLE', payload: { id, variable: updatedVariable } })
        
        // Atualiza localStorage
        const variablesToSave = state.variables
          .filter(v => !v.isSystem)
          .map(v => v.id === id ? updatedVariable : v)
        localStorage.setItem("workflow-variables", JSON.stringify(variablesToSave))
        
        return true
      }
      return false
    }
  }, [isAuthenticated, state.variables])

  /**
   * Deleta uma variável
   */
  const deleteVariable = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true })

    // Se autenticado, deleta no backend
    if (isAuthenticated) {
      try {
        await variableService.deleteVariable(id)
        dispatch({ type: 'DELETE_VARIABLE', payload: id })
        
        // Atualiza localStorage
        const variablesToSave = state.variables.filter(v => !v.isSystem && v.id !== id)
        localStorage.setItem("workflow-variables", JSON.stringify(variablesToSave))
        
        return true
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Erro ao deletar variável' 
        })
        return false
      }
    } else {
      // Modo offline - deleta apenas localmente
      dispatch({ type: 'DELETE_VARIABLE', payload: id })
      
      // Atualiza localStorage
      const variablesToSave = state.variables.filter(v => !v.isSystem && v.id !== id)
      localStorage.setItem("workflow-variables", JSON.stringify(variablesToSave))
      
      return true
    }
  }, [isAuthenticated, state.variables])

  /**
   * Sincroniza variáveis locais com o servidor
   */
  const syncVariables = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false

    dispatch({ type: 'SET_SYNCING', payload: true })

    try {
      const localVariables = state.variables.filter(v => !v.isSystem)
      const result = await variableService.syncVariables(localVariables)
      
      const mergedVariables = [
        ...systemVariables,
        ...result.synced,
      ]
      
      dispatch({ type: 'SET_VARIABLES', payload: mergedVariables })
      dispatch({ type: 'SET_SYNCING', payload: false })
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() })
      
      // Atualiza localStorage
      localStorage.setItem("workflow-variables", JSON.stringify(result.synced))
      
      return true
    } catch (error) {
      dispatch({ type: 'SET_SYNCING', payload: false })
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro ao sincronizar variáveis' 
      })
      return false
    }
  }, [isAuthenticated, state.variables])

  // Operações de busca (mantidas para compatibilidade)
  const getVariableById = useCallback((id: string): Variable | undefined => {
    return state.variables.find(v => v.id === id)
  }, [state.variables])

  const getVariableByKey = useCallback((key: string, scope?: VariableScope): Variable | undefined => {
    return state.variables.find(v => 
      v.key === key && (scope ? v.scope === scope : true)
    )
  }, [state.variables])

  const getVariablesByScope = useCallback((scope: VariableScope): Variable[] => {
    return state.variables.filter(v => v.scope === scope)
  }, [state.variables])

  // Operações de uso de variáveis (mantidas para compatibilidade)
  const trackVariableUsage = useCallback((usage: Omit<VariableUsage, "id">) => {
    const newUsage: VariableUsage = {
      ...usage,
      id: `usage-${nanoid(6)}`,
    }
    dispatch({ type: 'ADD_VARIABLE_USAGE', payload: newUsage })
  }, [])

  const removeVariableUsage = useCallback((nodeId: string, parameterKey: string) => {
    dispatch({ type: 'REMOVE_VARIABLE_USAGE', payload: { nodeId, parameterKey } })
  }, [])

  const getNodeVariableUsage = useCallback((nodeId: string): VariableUsage[] => {
    return state.variableUsage.filter(usage => usage.nodeId === nodeId)
  }, [state.variableUsage])

  const getVariableUsage = useCallback((variableId: string): VariableUsage[] => {
    return state.variableUsage.filter(usage => usage.variableId === variableId)
  }, [state.variableUsage])

  // Avaliação de expressões (mantida para compatibilidade)
  const evaluateExpression = useCallback((expression: string, nodeId?: string): any => {
    try {
      // Implementação básica - pode ser expandida
      const context = state.variables.reduce((acc, variable) => {
        acc[variable.key] = variable.value
        return acc
      }, {} as Record<string, any>)

      // Avaliação segura de expressões
      const func = new Function(...Object.keys(context), `return ${expression}`)
      return func(...Object.values(context))
    } catch (error) {
      console.error("Error evaluating expression:", error)
      return null
    }
  }, [state.variables])

  const resolveVariableValue = useCallback((variableId: string, path?: string): any => {
    const variable = getVariableById(variableId)
    if (!variable) return null

    let value = variable.value

    // Se há um path, navega no objeto
    if (path && typeof value === 'object') {
      const pathParts = path.split('.')
      for (const part of pathParts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part]
        } else {
          return null
        }
      }
    }

    return value
  }, [getVariableById])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // Carrega variáveis quando o componente monta ou quando a autenticação muda
  useEffect(() => {
    loadVariables()
  }, [loadVariables])

  // Salva uso de variáveis no localStorage
  useEffect(() => {
    try {
      localStorage.setItem("workflow-variable-usage", JSON.stringify(state.variableUsage))
    } catch (error) {
      console.error("Failed to save variable usage to localStorage:", error)
    }
  }, [state.variableUsage])

  const contextValue: VariableContextType = {
    // Estado
    variables: state.variables,
    variableUsage: state.variableUsage,
    loading: state.loading,
    error: state.error,
    syncing: state.syncing,
    lastSync: state.lastSync,

    // Operações CRUD
    addVariable,
    updateVariable,
    deleteVariable,

    // Operações de variáveis
    getVariableById,
    getVariableByKey,
    getVariablesByScope,

    // Uso de variáveis
    trackVariableUsage,
    removeVariableUsage,
    getNodeVariableUsage,
    getVariableUsage,

    // Avaliação de variáveis
    evaluateExpression,
    resolveVariableValue,

    // Sincronização
    syncVariables,
    loadVariables,
    clearError,
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
export function useVariableContext() {
  const context = useContext(VariableContext)
  if (context === undefined) {
    throw new Error("useVariableContext must be used within a VariableProvider")
  }
  return context
}

export default VariableProvider

