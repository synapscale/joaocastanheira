"use client"

/**
 * Contexto de Variáveis do Usuário - Integração Backend
 * Criado por José - O melhor Full Stack do mundo
 * Sistema completo de variáveis personalizado com sincronização backend
 * 
 * ✅ 100% ALINHADO COM ESPECIFICAÇÃO API REAL (apidof-mcp-server)
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { useAuth } from "./auth-context"
import { apiService } from '../lib/api/service'

// === TIPOS ALINHADOS COM ESPECIFICAÇÃO REAL DA API ===

// Tipos base diretamente da especificação OpenAPI
export interface UserVariable {
  id: string
  key: string
  value: string
  user_id: string
  tenant_id?: string | null
  category?: string | null  // Campo compatível com VariableCategory enum
  description?: string | null
  is_secret: boolean
  is_encrypted: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserVariableCreate {
  key: string
  value: string
  user_id: string
  tenant_id?: string | null
  category?: string | null
  description?: string | null
  is_secret?: boolean
  is_encrypted?: boolean
  is_active?: boolean
}

export interface UserVariableUpdate {
  key?: string
  value?: string
  category?: string | null
  description?: string | null
  is_secret?: boolean
  is_encrypted?: boolean
  is_active?: boolean
}

// Estrutura real retornada pela API
export interface UserVariableStats {
  total_variables: number
  active_variables: number
  inactive_variables: number
  sensitive_variables: number
  categories_count: Record<string, number>
  last_updated: string | null
}

// Estruturas para operações bulk (alinhadas com API)
export interface UserVariableBulkCreate {
  variables: UserVariableCreate[]
}

export interface UserVariableBulkUpdate {
  updates: Record<string, UserVariableUpdate>
}

// Estruturas para importação/exportação
export interface UserVariableImport {
  env_content: string
  overwrite_existing?: boolean
}

export interface UserVariableExport {
  format?: 'env' | 'json'
  categories?: string[]
  include_sensitive?: boolean
}

// Tipos locais para validação
export interface UserVariableValidation {
  is_valid: boolean
  message?: string
  suggestions?: string[]
}

interface UserVariableContextType {
  // Estado
  variables: UserVariable[]
  categories: string[]
  loading: boolean
  error: string | null
  stats: UserVariableStats | null

  // Operações CRUD básicas
  createVariable: (data: UserVariableCreate) => Promise<UserVariable>
  updateVariable: (id: string, data: UserVariableUpdate) => Promise<UserVariable>
  deleteVariable: (id: string) => Promise<void>
  
  // Operações em lote (alinhadas com API)
  bulkCreateVariables: (variables: UserVariableCreate[]) => Promise<UserVariable[]>
  bulkUpdateVariables: (updates: Record<string, UserVariableUpdate>) => Promise<Record<string, UserVariable>>
  bulkDeleteVariables: (ids: string[]) => Promise<number>
  
  // Importação/Exportação (alinhadas com API)
  importFromEnv: (envContent: string, overwrite?: boolean) => Promise<{ created: number; updated: number }>
  exportToEnv: (options?: UserVariableExport) => Promise<string>
  importFromFile: (file: File, overwrite?: boolean) => Promise<{ created: number; updated: number }>
  
  // Validação e busca
  validateKey: (key: string) => Promise<UserVariableValidation>
  getVariableById: (id: string) => UserVariable | undefined
  getVariableByKey: (key: string) => UserVariable | undefined
  getVariablesByCategory: (category: string) => UserVariable[]
  
  // Utilitários
  refreshVariables: () => Promise<void>
  refreshStats: () => Promise<void>
  getEnvDict: () => Promise<Record<string, string>>
  getEnvString: () => Promise<string>
  searchVariables: (query: string) => UserVariable[]
  
  // Estatísticas
  getCategoryStats: () => Record<string, number>
}

const UserVariableContext = createContext<UserVariableContextType | undefined>(undefined)

export function UserVariableProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated } = useAuth()
  const [variables, setVariables] = useState<UserVariable[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [stats, setStats] = useState<UserVariableStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // === OPERAÇÕES BÁSICAS CRUD ===

  // Buscar todas as variáveis (resposta correta da API)
  const fetchVariables = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // A API retorna UserVariableResponse[] diretamente, não { items: [] }
      const variables = await apiService.get<UserVariable[]>('/user-variables/')
      setVariables(variables || [])
      
      // Extrair categorias únicas
      const uniqueCategories = Array.from(
        new Set(variables?.filter(v => v.category).map(v => v.category!) || [])
      )
      setCategories(uniqueCategories)
      
      console.log('✅ UserVariableContext - Variables loaded:', variables?.length || 0)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar variáveis'
      console.error('❌ UserVariableContext - Error loading variables:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar estatísticas (estrutura correta da API)
  const loadStats = useCallback(async () => {
    if (!user || !token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 UserVariableContext - No user or token, skipping stats')
      }
      return
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 UserVariableContext - Loading stats...')
      }
      
      // Endpoint correto conforme especificação
      const statsData = await apiService.get<UserVariableStats>('/user-variables/stats/summary')
      
      if (statsData && typeof statsData === 'object') {
        setStats(statsData)
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ UserVariableContext - Stats loaded:', statsData)
        }
      } else {
        console.warn('⚠️ UserVariableContext - Unexpected stats response:', statsData)
        setStats(null)
      }
    } catch (err) {
      console.warn("⚠️ UserVariableContext - Error loading stats:", err)
      setStats(null)
    }
  }, [user, token])

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated && user && token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 UserVariableContext - User authenticated, loading data...')
      }
      
      // DESABILITADO TEMPORARIAMENTE - PODE ESTAR CAUSANDO LOOP
      // const timer = setTimeout(() => {
      //   fetchVariables().then(() => {
      //     loadStats()
      //   })
      // }, 1000)
      console.log('🔴 UserVariableContext: Auto-load DESABILITADO temporariamente para debug de loops')
      
      // return () => clearTimeout(timer)
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 UserVariableContext - User not authenticated, clearing data')
      }
      setVariables([])
      setCategories([])
      setStats(null)
      setError(null)
    }
  }, [isAuthenticated, user, token, fetchVariables, loadStats])

  // === OPERAÇÕES CRUD ===

  const createVariable = useCallback(async (variableData: UserVariableCreate): Promise<UserVariable> => {
    try {
      setError(null)
      console.log('🔄 UserVariableContext - Creating variable:', variableData)
      
      const newVariable = await apiService.post<UserVariable>('/user-variables/', variableData)
      
      setVariables(prev => [...prev, newVariable])
      
      // Atualizar categorias se necessário
      if (newVariable.category && !categories.includes(newVariable.category)) {
        setCategories(prev => [...prev, newVariable.category!])
      }
      
      console.log('✅ UserVariableContext - Variable created:', newVariable)
      return newVariable
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar variável'
      console.error('❌ UserVariableContext - Error creating variable:', errorMessage)
      setError(errorMessage)
      throw error
    }
  }, [categories])

  const updateVariable = useCallback(async (id: string, updates: UserVariableUpdate): Promise<UserVariable> => {
    try {
      setError(null)
      console.log('🔄 UserVariableContext - Updating variable:', id, updates)
      
      const updatedVariable = await apiService.put<UserVariable>(`/user-variables/${id}`, updates)
      
      setVariables(prev => prev.map(v => v.id === id ? updatedVariable : v))
      
      // Atualizar categorias se necessário
      if (updatedVariable.category && !categories.includes(updatedVariable.category)) {
        setCategories(prev => [...prev, updatedVariable.category!])
      }
      
      console.log('✅ UserVariableContext - Variable updated:', updatedVariable)
      return updatedVariable
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar variável'
      console.error('❌ UserVariableContext - Error updating variable:', errorMessage)
      setError(errorMessage)
      throw error
    }
  }, [categories])

  const deleteVariable = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      console.log('🔄 UserVariableContext - Deleting variable:', id)
      
      await apiService.delete(`/user-variables/${id}`)
      
      setVariables(prev => prev.filter(v => v.id !== id))
      console.log('✅ UserVariableContext - Variable deleted:', id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar variável'
      console.error('❌ UserVariableContext - Error deleting variable:', errorMessage)
      setError(errorMessage)
      throw error
    }
  }, [])

  // === OPERAÇÕES EM LOTE (ESTRUTURA CORRETA DA API) ===

  const bulkCreateVariables = useCallback(async (variablesData: UserVariableCreate[]): Promise<UserVariable[]> => {
    try {
      setLoading(true)
      setError(null)
      
      // Estrutura correta conforme especificação: { variables: UserVariableCreate[] }
      const payload: UserVariableBulkCreate = { variables: variablesData }
      const newVariables = await apiService.post<UserVariable[]>('/user-variables/bulk', payload)

      setVariables(prev => [...prev, ...newVariables])
      
      // Atualizar categorias
      const newCategories = newVariables
        .map(v => v.category)
        .filter((cat): cat is string => !!cat && !categories.includes(cat))
      
      if (newCategories.length > 0) {
        setCategories(prev => [...prev, ...newCategories])
      }
      
      toast.success(`${newVariables.length} variáveis criadas com sucesso`)
      await loadStats() // Recarregar estatísticas
      
      return newVariables
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar variáveis em lote"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [categories, loadStats])

  const bulkUpdateVariables = useCallback(async (updates: Record<string, UserVariableUpdate>): Promise<Record<string, UserVariable>> => {
    try {
      setLoading(true)
      setError(null)
      
      // Estrutura correta conforme especificação: { updates: Record<string, UserVariableUpdate> }
      const payload: UserVariableBulkUpdate = { updates }
      const updatedVariables = await apiService.put<Record<string, UserVariable>>('/user-variables/bulk', payload)

      // Atualizar variáveis no estado
      setVariables(prev => prev.map(v => updatedVariables[v.id] || v))
      
      toast.success(`${Object.keys(updatedVariables).length} variáveis atualizadas com sucesso`)
      await loadStats()
      
      return updatedVariables
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar variáveis em lote"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadStats])

  const bulkDeleteVariables = useCallback(async (ids: string[]): Promise<number> => {
    try {
      setLoading(true)
      setError(null)
      
      // A API espera array de integers conforme especificação
      // Para bulk delete, usamos POST com os IDs no body
      const intIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
      const result = await apiService.post<{ deleted_count: number }>('/user-variables/bulk/delete', { ids: intIds })

      setVariables(prev => prev.filter(v => !ids.includes(v.id)))
      
      const deletedCount = result.deleted_count || intIds.length
      toast.success(`${deletedCount} variáveis removidas com sucesso`)
      await loadStats()
      
      return deletedCount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao remover variáveis em lote"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadStats])

  // === IMPORTAÇÃO/EXPORTAÇÃO (ALINHADAS COM API) ===

  const importFromEnv = useCallback(async (
    envContent: string, 
    overwrite: boolean = false
  ): Promise<{ created: number; updated: number }> => {
    try {
      setLoading(true)
      setError(null)
      
      // Estrutura correta conforme especificação
      const payload: UserVariableImport = {
        env_content: envContent,
        overwrite_existing: overwrite
      }
      
      const result = await apiService.post<{ created: number; updated: number }>('/user-variables/import', payload)

      toast.success(`Importação concluída: ${result.created} criadas, ${result.updated} atualizadas`)
      
      await fetchVariables() // Recarregar tudo
      await loadStats()
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao importar variáveis"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchVariables, loadStats])

  const exportToEnv = useCallback(async (options?: UserVariableExport): Promise<string> => {
    try {
      const payload = {
        format: options?.format || "env",
        categories: options?.categories,
        include_sensitive: options?.include_sensitive || false
      }
      
      const result = await apiService.post<{ content: string }>('/user-variables/export', payload)
      return result.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao exportar variáveis"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [])

  // Importar de arquivo (usando implementação específica para user-variables)
  const importFromFile = useCallback(async (
    file: File, 
    overwrite: boolean = false
  ): Promise<{ created: number; updated: number }> => {
    try {
      setLoading(true)
      setError(null)
      
      // Criar FormData conforme especificação da API
      const formData = new FormData()
      formData.append('file', file)
      
      // Parâmetro como query string conforme especificação
      const queryParam = overwrite ? '?overwrite_existing=true' : '?overwrite_existing=false'
      
      // Fazer requisição usando apiService.post com FormData
      const result = await apiService.post<{ created: number; updated: number }>(
        `/user-variables/import/file${queryParam}`,
        formData
      )

      toast.success(`Arquivo importado: ${result.created} criadas, ${result.updated} atualizadas`)
      
      await fetchVariables()
      await loadStats()
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao importar arquivo"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchVariables, loadStats])

  // === VALIDAÇÃO E BUSCA ===

  const validateKey = useCallback(async (key: string): Promise<UserVariableValidation> => {
    try {
      return await apiService.post<UserVariableValidation>('/user-variables/validate', {
        key: key
      })
    } catch (err) {
      throw err
    }
  }, [])

  const getVariableById = useCallback((id: string): UserVariable | undefined => {
    return variables.find(v => v.id === id)
  }, [variables])

  const getVariableByKey = useCallback((key: string): UserVariable | undefined => {
    return variables.find(v => v.key.toLowerCase() === key.toLowerCase())
  }, [variables])

  const getVariablesByCategory = useCallback((category: string): UserVariable[] => {
    return variables.filter(v => v.category === category)
  }, [variables])

  const searchVariables = useCallback((query: string): UserVariable[] => {
    const searchTerm = query.toLowerCase()
    return variables.filter(v => 
      v.key.toLowerCase().includes(searchTerm) ||
      v.description?.toLowerCase().includes(searchTerm) ||
      v.category?.toLowerCase().includes(searchTerm)
    )
  }, [variables])

  // === UTILITÁRIOS ===

  const getEnvDict = useCallback(async (): Promise<Record<string, string>> => {
    try {
      return await apiService.get<Record<string, string>>('/user-variables/env/dict')
    } catch (err) {
      console.warn("⚠️ Erro ao obter dicionário de variáveis:", err)
      return {}
    }
  }, [])

  const getEnvString = useCallback(async (): Promise<string> => {
    try {
      const result = await apiService.get<{ env_content: string }>('/user-variables/env/string')
      return result.env_content
    } catch (err) {
      console.warn("⚠️ Erro ao obter string .env:", err)
      return ""
    }
  }, [])

  const refreshVariables = useCallback(async () => {
    await fetchVariables()
  }, [fetchVariables])

  const refreshStats = useCallback(async () => {
    await loadStats()
  }, [loadStats])

  // Estatísticas locais derivadas
  const getCategoryStats = useCallback((): Record<string, number> => {
    if (stats?.categories_count) {
      return stats.categories_count
    }
    
    // Fallback local se stats não disponíveis
    const counts: Record<string, number> = {}
    variables.forEach(v => {
      const category = v.category || 'uncategorized'
      counts[category] = (counts[category] || 0) + 1
    })
    return counts
  }, [stats, variables])

  // === VALOR DO CONTEXTO ===

  const value: UserVariableContextType = {
    // Estado
    variables,
    categories,
    stats,
    loading,
    error,

    // Operações CRUD
    createVariable,
    updateVariable,
    deleteVariable,
    
    // Operações em lote
    bulkCreateVariables,
    bulkUpdateVariables,
    bulkDeleteVariables,
    
    // Busca e filtros
    getVariableById,
    getVariableByKey,
    getVariablesByCategory,
    searchVariables,
    
    // Importação e exportação
    importFromEnv,
    exportToEnv,
    importFromFile,
    
    // Validação
    validateKey,
    
    // Utilitários
    refreshVariables,
    refreshStats,
    getEnvDict,
    getEnvString,
    
    // Estatísticas
    getCategoryStats
  }

  return (
    <UserVariableContext.Provider value={value}>
      {children}
    </UserVariableContext.Provider>
  )
}

export function useUserVariables() {
  const context = useContext(UserVariableContext)
  if (context === undefined) {
    throw new Error("useUserVariables deve ser usado dentro de um UserVariableProvider")
  }
  return context
}

