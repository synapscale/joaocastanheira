"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/hooks/use-toast'
import {
  UserVariable,
  UserVariableStats,
  UserVariableCreate,
  UserVariableUpdate,
  UserVariableListResponse,
  variableService
} from '@/lib/services/variables'

// Interface para compatibilidade com componentes existentes
interface Variable {
  id: string
  key: string
  value: string
  isSecret: boolean
  isEncrypted: boolean
  isActive: boolean
  category?: string
  description?: string
  createdAt: string
  updatedAt: string
}

// Interface para estatísticas de variáveis
interface VariableStats {
  total: number
  active: number
  inactive: number
  sensitive: number
  categories: Record<string, number>
  lastUpdated: string | null
}

// Interface para parâmetros de busca
interface SearchParams {
  query?: string
  category?: string
  isActive?: boolean
  isSecret?: boolean
  page?: number
  size?: number
}

interface VariableContextType {
  variables: Variable[]
  stats: VariableStats
  loading: boolean
  error: string | null
  searchParams: SearchParams
  pagination: {
    total: number
    page: number
    pages: number
    size: number
  }

  // Ações
  loadVariables: (params?: SearchParams) => Promise<void>
  createVariable: (data: UserVariableCreate) => Promise<boolean>
  updateVariable: (id: string, data: UserVariableUpdate) => Promise<boolean>
  deleteVariable: (id: string) => Promise<boolean>
  duplicateVariable: (id: string) => Promise<boolean>
  bulkUpdateVariables: (ids: string[], data: Partial<UserVariableUpdate>) => Promise<boolean>
  bulkDeleteVariables: (ids: string[]) => Promise<boolean>
  bulkOperation: (operation: 'update' | 'delete', payload: any) => Promise<boolean>
  refreshStats: () => Promise<void>
  setSearchParams: (params: SearchParams) => void
  
  // Função para filtrar variáveis por escopo (compatibilidade)
  getVariablesByScope: (scope: string) => Variable[]
  resolveVariableValue: (variable: Variable) => any
}

const VariableContext = createContext<VariableContextType | undefined>(undefined)

export function VariableProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()

  // Estados
  const [variables, setVariables] = useState<Variable[]>([])
  const [stats, setStats] = useState<VariableStats>({
    total: 0,
    active: 0,
    inactive: 0,
    sensitive: 0,
    categories: {},
    lastUpdated: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({ page: 1, size: 20 })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    size: 20
  })

  // Função para transformar UserVariable em Variable (compatibilidade)
  const transformUserVariable = (userVar: UserVariable): Variable => ({
    id: userVar.id,
    key: userVar.key,
    value: userVar.value,
    isSecret: userVar.is_secret,
    isEncrypted: userVar.is_encrypted,
    isActive: userVar.is_active,
    category: userVar.category ?? undefined,
    description: userVar.description ?? undefined,
    createdAt: userVar.created_at,
    updatedAt: userVar.updated_at
  })

  // Função para transformar Variable em UserVariable (API)
  const transformVariable = (variable: Variable): UserVariable => ({
    id: variable.id,
    key: variable.key,
    value: variable.value,
    user_id: user?.id || '',
    is_secret: variable.isSecret,
    is_encrypted: variable.isEncrypted,
    is_active: variable.isActive,
    category: variable.category,
    description: variable.description,
         tenant_id: undefined,
    created_at: variable.createdAt,
    updated_at: variable.updatedAt
  })

  // Função para transformar stats da API
  const transformStats = (apiStats: UserVariableStats): VariableStats => ({
    total: apiStats.total_variables,
    active: apiStats.active_variables,
    inactive: apiStats.inactive_variables,
    sensitive: apiStats.sensitive_variables,
    categories: apiStats.categories_count,
    lastUpdated: apiStats.last_updated
  })

  // Carregar variáveis
  const loadVariables = useCallback(async (params?: SearchParams) => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const newParams = { ...searchParams, ...params }
      setSearchParams(newParams)

                    const response = await variableService.listVariables(newParams)

       setVariables(response.items.map(transformUserVariable))
       setPagination({
         total: response.total,
         page: response.page,
         pages: response.pages,
         size: response.size
       })

    } catch (err) {
      console.error('Erro ao carregar variáveis:', err)
      setError('Erro ao carregar variáveis')
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as variáveis',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [user, searchParams, toast])

  // Carregar estatísticas
  const refreshStats = useCallback(async () => {
    if (!user) return

    try {
      const apiStats = await variableService.getVariableStats()
      setStats(transformStats(apiStats))
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }, [user])

  // Criar variável
  const createVariable = useCallback(async (data: UserVariableCreate): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)

      await variableService.createVariable(data)

      toast({
        title: 'Sucesso',
        description: 'Variável criada com sucesso'
      })

      await loadVariables()
      await refreshStats()

      return true

    } catch (err) {
      console.error('Erro ao criar variável:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a variável',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [user, loadVariables, refreshStats, toast])

  // Atualizar variável
  const updateVariable = useCallback(async (id: string, data: UserVariableUpdate): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)

      await variableService.updateVariable(id, data)

      toast({
        title: 'Sucesso',
        description: 'Variável atualizada com sucesso'
      })

      await loadVariables()
      await refreshStats()

      return true

    } catch (err) {
      console.error('Erro ao atualizar variável:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a variável',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [user, loadVariables, refreshStats, toast])

  // Deletar variável
  const deleteVariable = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)

      await variableService.deleteVariable(id)

      toast({
        title: 'Sucesso',
        description: 'Variável removida com sucesso'
      })

      await loadVariables()
      await refreshStats()

      return true

    } catch (err) {
      console.error('Erro ao deletar variável:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a variável',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [user, loadVariables, refreshStats, toast])

  // Duplicar variável
  const duplicateVariable = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)

      const original = variables.find(v => v.id === id)
      if (!original) {
        throw new Error('Variável não encontrada')
      }

      const duplicateData: UserVariableCreate = {
        key: `${original.key}_copy`,
        value: original.value,
        is_encrypted: original.isEncrypted,
        category: original.category,
        description: original.description ? `${original.description} (cópia)` : undefined
      }

      await variableService.createVariable(duplicateData)

      toast({
        title: 'Sucesso',
        description: 'Variável duplicada com sucesso'
      })

      await loadVariables()
      await refreshStats()

      return true

    } catch (err) {
      console.error('Erro ao duplicar variável:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar a variável',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [user, variables, loadVariables, refreshStats, toast])

  // Atualização em massa
  const bulkUpdateVariables = useCallback(async (ids: string[], data: Partial<UserVariableUpdate>): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)

      // Build variables for bulk update
      const updateVariables = ids.map(id => ({
        id,
        key: '', // Will be filled during processing
        value: data.value || '',
        description: data.description,
        category: data.category,
        is_secret: false,
        is_active: data.is_active ?? true
      }));

      const result = await variableService.bulkUpdate(updateVariables)

      toast({
        title: 'Sucesso',
        description: `${result.updated} variáveis atualizadas com sucesso`
      })

      await loadVariables()
      await refreshStats()

      return true

    } catch (err) {
      console.error('Erro ao atualizar variáveis em massa:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as variáveis',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [user, loadVariables, refreshStats, toast])

  // Deleção em massa
  const bulkDeleteVariables = useCallback(async (ids: string[]): Promise<boolean> => {
    if (!user) return false

    try {
      setLoading(true)

      const result = await variableService.bulkDelete(ids)

      toast({
        title: 'Sucesso',
        description: `${result.deleted} variáveis removidas com sucesso`
      })

      await loadVariables()
      await refreshStats()

      return true

    } catch (err) {
      console.error('Erro ao deletar variáveis em massa:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível remover as variáveis',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [user, loadVariables, refreshStats, toast])

  // Operação em massa genérica
  const bulkOperation = useCallback(async (operation: 'update' | 'delete', payload: any): Promise<boolean> => {
    if (operation === 'update') {
      return bulkUpdateVariables(payload.ids, payload.data)
    } else if (operation === 'delete') {
      return bulkDeleteVariables(payload.ids)
    }
    return false
  }, [bulkUpdateVariables, bulkDeleteVariables])

  // Carregar dados iniciais apenas uma vez quando o usuário está autenticado
  useEffect(() => {
    if (user) {
      // DESABILITADO TEMPORARIAMENTE - PODE ESTAR CAUSANDO LOOP
      // setTimeout(() => {
      //   loadVariables()
      //   refreshStats()
      // }, 100)
      console.log('🔴 VariableContext: Auto-load DESABILITADO temporariamente para debug de loops')
    }
  }, [user]) // Remover loadVariables e refreshStats das dependências para evitar loops

  // Função para filtrar variáveis por escopo (compatibilidade com componentes existentes)
  const getVariablesByScope = useCallback((scope: string) => {
    return variables.filter(variable => 
      variable.category === scope || 
      (scope === 'global' && !variable.category)
    )
  }, [variables])

  // Função para resolver valor de variável
  const resolveVariableValue = useCallback((variable: Variable) => {
    return variable.value
  }, [])

  const value: VariableContextType = useMemo(() => ({
    variables,
    stats,
    loading,
    error,
    searchParams,
    pagination,
    loadVariables,
    createVariable,
    updateVariable,
    deleteVariable,
    duplicateVariable,
    bulkUpdateVariables,
    bulkDeleteVariables,
    bulkOperation,
    refreshStats,
    setSearchParams,
    getVariablesByScope,
    resolveVariableValue
  }), [variables, stats, loading, error, searchParams, pagination, loadVariables, createVariable, updateVariable, deleteVariable, duplicateVariable, bulkUpdateVariables, bulkDeleteVariables, bulkOperation, refreshStats, setSearchParams, getVariablesByScope, resolveVariableValue])

  return (
    <VariableContext.Provider value={value}>
      {children}
    </VariableContext.Provider>
  )
}

export function useVariables() {
  const context = useContext(VariableContext)
  if (context === undefined) {
    throw new Error('useVariables must be used within a VariableProvider')
  }
  return context
}

export default VariableProvider

