/**
 * Hook personalizado para gerenciamento de variáveis
 * Integra o contexto local com o serviço do backend
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { variableService, type CreateVariableData, type UpdateVariableData, type VariableFilters } from '../lib/services/variables'
import type { Variable, VariableScope, VariableUsage } from '../types/variable'

/**
 * Interface para o estado de variáveis
 */
interface VariableState {
  variables: Variable[]
  loading: boolean
  error: string | null
  syncing: boolean
  lastSync: Date | null
}

/**
 * Interface para estatísticas de variáveis
 */
interface VariableStats {
  total: number
  byScope: Record<VariableScope, number>
  byType: Record<Variable['type'], number>
  mostUsed: Array<{ variable: Variable; usageCount: number }>
}

/**
 * Hook principal para gerenciamento de variáveis
 */
export function useVariables(filters?: VariableFilters) {
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState<VariableState>({
    variables: [],
    loading: false,
    error: null,
    syncing: false,
    lastSync: null,
  })

  /**
   * Carrega variáveis do backend
   */
  const loadVariables = useCallback(async (newFilters?: VariableFilters) => {
    if (!isAuthenticated) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await variableService.getVariables(newFilters || filters)
      setState(prev => ({
        ...prev,
        variables: response.variables,
        loading: false,
        lastSync: new Date(),
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar variáveis',
      }))
    }
  }, [isAuthenticated, filters])

  /**
   * Cria uma nova variável
   */
  const createVariable = useCallback(async (data: CreateVariableData): Promise<Variable | null> => {
    if (!isAuthenticated) return null

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const newVariable = await variableService.createVariable(data)
      setState(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable],
        loading: false,
      }))
      return newVariable
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao criar variável',
      }))
      return null
    }
  }, [isAuthenticated])

  /**
   * Atualiza uma variável existente
   */
  const updateVariable = useCallback(async (id: string, data: UpdateVariableData): Promise<boolean> => {
    if (!isAuthenticated) return false

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const updatedVariable = await variableService.updateVariable(id, data)
      setState(prev => ({
        ...prev,
        variables: prev.variables.map(v => v.id === id ? updatedVariable : v),
        loading: false,
      }))
      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar variável',
      }))
      return false
    }
  }, [isAuthenticated])

  /**
   * Deleta uma variável
   */
  const deleteVariable = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await variableService.deleteVariable(id)
      setState(prev => ({
        ...prev,
        variables: prev.variables.filter(v => v.id !== id),
        loading: false,
      }))
      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao deletar variável',
      }))
      return false
    }
  }, [isAuthenticated])

  /**
   * Cria múltiplas variáveis em lote
   */
  const createVariablesBulk = useCallback(async (variables: CreateVariableData[]): Promise<Variable[]> => {
    if (!isAuthenticated) return []

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const newVariables = await variableService.createVariablesBulk(variables)
      setState(prev => ({
        ...prev,
        variables: [...prev.variables, ...newVariables],
        loading: false,
      }))
      return newVariables
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao criar variáveis em lote',
      }))
      return []
    }
  }, [isAuthenticated])

  /**
   * Sincroniza variáveis locais com o servidor
   */
  const syncVariables = useCallback(async (localVariables?: Variable[]): Promise<boolean> => {
    if (!isAuthenticated) return false

    setState(prev => ({ ...prev, syncing: true, error: null }))

    try {
      const variablesToSync = localVariables || state.variables
      const result = await variableService.syncVariables(variablesToSync)
      
      setState(prev => ({
        ...prev,
        variables: result.synced,
        syncing: false,
        lastSync: new Date(),
      }))

      // Se houver conflitos, você pode implementar uma lógica para lidar com eles
      if (result.conflicts.length > 0) {
        console.warn('Conflitos encontrados durante a sincronização:', result.conflicts)
      }

      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        syncing: false,
        error: error instanceof Error ? error.message : 'Erro ao sincronizar variáveis',
      }))
      return false
    }
  }, [isAuthenticated, state.variables])

  /**
   * Obtém uma variável por ID
   */
  const getVariableById = useCallback((id: string): Variable | undefined => {
    return state.variables.find(v => v.id === id)
  }, [state.variables])

  /**
   * Obtém uma variável por chave e escopo
   */
  const getVariableByKey = useCallback((key: string, scope?: VariableScope): Variable | undefined => {
    return state.variables.find(v => 
      v.key === key && (scope ? v.scope === scope : true)
    )
  }, [state.variables])

  /**
   * Obtém variáveis por escopo
   */
  const getVariablesByScope = useCallback((scope: VariableScope): Variable[] => {
    return state.variables.filter(v => v.scope === scope)
  }, [state.variables])

  /**
   * Filtra variáveis
   */
  const filteredVariables = useMemo(() => {
    let filtered = state.variables

    if (filters?.scope) {
      filtered = filtered.filter(v => v.scope === filters.scope)
    }

    if (filters?.type) {
      filtered = filtered.filter(v => v.type === filters.type)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(search) ||
        v.key.toLowerCase().includes(search) ||
        v.description?.toLowerCase().includes(search)
      )
    }

    if (filters?.tags?.length) {
      filtered = filtered.filter(v => 
        v.tags?.some(tag => filters.tags!.includes(tag))
      )
    }

    if (filters?.isSecret !== undefined) {
      filtered = filtered.filter(v => v.isSecret === filters.isSecret)
    }

    return filtered
  }, [state.variables, filters])

  /**
   * Carrega variáveis quando o usuário está autenticado
   */
  useEffect(() => {
    if (isAuthenticated) {
      loadVariables()
    } else {
      setState({
        variables: [],
        loading: false,
        error: null,
        syncing: false,
        lastSync: null,
      })
    }
  }, [isAuthenticated, loadVariables])

  return {
    // Estado
    variables: filteredVariables,
    allVariables: state.variables,
    loading: state.loading,
    error: state.error,
    syncing: state.syncing,
    lastSync: state.lastSync,

    // Operações CRUD
    createVariable,
    updateVariable,
    deleteVariable,
    createVariablesBulk,

    // Operações de busca
    getVariableById,
    getVariableByKey,
    getVariablesByScope,

    // Operações de sincronização
    syncVariables,
    loadVariables,

    // Utilitários
    refresh: () => loadVariables(),
    clearError: () => setState(prev => ({ ...prev, error: null })),
  }
}

/**
 * Hook para estatísticas de variáveis
 */
export function useVariableStats() {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState<VariableStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const statsData = await variableService.getVariableStats()
      setStats(statsData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      loadStats()
    } else {
      setStats(null)
    }
  }, [isAuthenticated, loadStats])

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  }
}

/**
 * Hook para validação de expressões
 */
export function useVariableValidation() {
  const [validating, setValidating] = useState(false)

  const validateExpression = useCallback(async (
    expression: string, 
    context?: Record<string, any>
  ): Promise<{ isValid: boolean; error?: string; result?: any }> => {
    setValidating(true)

    try {
      const result = await variableService.validateExpression(expression, context)
      return result
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erro ao validar expressão',
      }
    } finally {
      setValidating(false)
    }
  }, [])

  return {
    validateExpression,
    validating,
  }
}

export default useVariables

