"use client"

/**
 * Contexto de Variáveis do Usuário - Integração Backend
 * Criado por José - O melhor Full Stack do mundo
 * Sistema completo de variáveis personalizado com sincronização backend
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "./auth-context"

// Types para variáveis do usuário
export interface UserVariable {
  id: number
  key: string
  value: string
  description?: string
  category: string
  is_encrypted: boolean
  is_active: boolean
  is_sensitive: boolean
  created_at: string
  updated_at: string
}

export interface UserVariableCreate {
  key: string
  value: string
  description?: string
  category?: string
  is_encrypted?: boolean
}

export interface UserVariableUpdate {
  value?: string
  description?: string
  category?: string
  is_active?: boolean
}

export interface UserVariableStats {
  total_variables: number
  active_variables: number
  inactive_variables: number
  sensitive_variables: number
  categories_count: Record<string, number>
  last_updated?: string
}

export interface UserVariableValidation {
  key: string
  is_valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

interface UserVariableContextType {
  // Estado
  variables: UserVariable[]
  categories: string[]
  stats: UserVariableStats | null
  loading: boolean
  error: string | null

  // Operações CRUD
  createVariable: (data: UserVariableCreate) => Promise<UserVariable | null>
  updateVariable: (id: number, data: UserVariableUpdate) => Promise<UserVariable | null>
  deleteVariable: (id: number) => Promise<boolean>
  
  // Operações em lote
  bulkCreateVariables: (variables: UserVariableCreate[]) => Promise<UserVariable[]>
  bulkDeleteVariables: (ids: number[]) => Promise<number>
  
  // Busca e filtros
  getVariableById: (id: number) => UserVariable | undefined
  getVariableByKey: (key: string) => UserVariable | undefined
  getVariablesByCategory: (category: string) => UserVariable[]
  searchVariables: (query: string) => UserVariable[]
  
  // Importação e exportação
  importFromEnv: (envContent: string, overwrite?: boolean, category?: string) => Promise<any>
  exportToEnv: (categories?: string[], includeSensitive?: boolean) => Promise<string>
  importFromFile: (file: File, overwrite?: boolean, category?: string) => Promise<any>
  
  // Validação
  validateKey: (key: string) => Promise<UserVariableValidation>
  
  // Utilitários
  refreshVariables: () => Promise<void>
  getEnvDict: () => Promise<Record<string, string>>
  getEnvString: () => Promise<string>
  
  // Estatísticas
  refreshStats: () => Promise<void>
}

const UserVariableContext = createContext<UserVariableContextType | undefined>(undefined)

export function UserVariableProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth()
  const [variables, setVariables] = useState<UserVariable[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [stats, setStats] = useState<UserVariableStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL base da API
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const API_VARIABLES = `${API_BASE}/api/v1/user-variables`

  // Headers para requisições autenticadas
  const getHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }), [token])

  // Função para fazer requisições à API
  const apiRequest = useCallback(async (
    endpoint: string, 
    options: RequestInit = {}
  ) => {
    if (!token) {
      throw new Error("Usuário não autenticado")
    }

    const response = await fetch(`${API_VARIABLES}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }, [API_VARIABLES, token, getHeaders])

  // Carregar variáveis do usuário
  const loadVariables = useCallback(async () => {
    if (!user || !token) return

    try {
      setLoading(true)
      setError(null)

      const data = await apiRequest("/")
      setVariables(data.variables || [])
      setCategories(data.categories || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar variáveis"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user, token, apiRequest])

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    if (!user || !token) return

    try {
      const data = await apiRequest("/stats/summary")
      setStats(data)
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err)
    }
  }, [user, token, apiRequest])

  // Carregar dados iniciais quando usuário faz login
  useEffect(() => {
    if (user && token) {
      loadVariables()
      loadStats()
    } else {
      // Limpar dados quando usuário faz logout
      setVariables([])
      setCategories([])
      setStats(null)
      setError(null)
    }
  }, [user, token, loadVariables, loadStats])

  // Criar variável
  const createVariable = useCallback(async (data: UserVariableCreate): Promise<UserVariable | null> => {
    try {
      setLoading(true)
      const newVariable = await apiRequest("/", {
        method: "POST",
        body: JSON.stringify(data)
      })

      setVariables(prev => [...prev, newVariable])
      toast.success(`Variável '${newVariable.key}' criada com sucesso`)
      
      // Atualizar estatísticas
      loadStats()
      
      return newVariable
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar variável"
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [apiRequest, loadStats])

  // Atualizar variável
  const updateVariable = useCallback(async (id: number, data: UserVariableUpdate): Promise<UserVariable | null> => {
    try {
      setLoading(true)
      const updatedVariable = await apiRequest(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      })

      setVariables(prev => prev.map(v => v.id === id ? updatedVariable : v))
      toast.success(`Variável atualizada com sucesso`)
      
      return updatedVariable
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar variável"
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [apiRequest])

  // Deletar variável
  const deleteVariable = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      await apiRequest(`/${id}`, {
        method: "DELETE"
      })

      setVariables(prev => prev.filter(v => v.id !== id))
      toast.success("Variável removida com sucesso")
      
      // Atualizar estatísticas
      loadStats()
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao remover variável"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [apiRequest, loadStats])

  // Criar múltiplas variáveis
  const bulkCreateVariables = useCallback(async (variablesData: UserVariableCreate[]): Promise<UserVariable[]> => {
    try {
      setLoading(true)
      const newVariables = await apiRequest("/bulk", {
        method: "POST",
        body: JSON.stringify({ variables: variablesData })
      })

      setVariables(prev => [...prev, ...newVariables])
      toast.success(`${newVariables.length} variáveis criadas com sucesso`)
      
      // Atualizar estatísticas
      loadStats()
      
      return newVariables
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar variáveis em lote"
      setError(errorMessage)
      toast.error(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [apiRequest, loadStats])

  // Deletar múltiplas variáveis
  const bulkDeleteVariables = useCallback(async (ids: number[]): Promise<number> => {
    try {
      setLoading(true)
      const result = await apiRequest("/bulk", {
        method: "DELETE",
        body: JSON.stringify(ids)
      })

      setVariables(prev => prev.filter(v => !ids.includes(v.id)))
      toast.success(`${result.deleted_count} variáveis removidas com sucesso`)
      
      // Atualizar estatísticas
      loadStats()
      
      return result.deleted_count
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao remover variáveis em lote"
      setError(errorMessage)
      toast.error(errorMessage)
      return 0
    } finally {
      setLoading(false)
    }
  }, [apiRequest, loadStats])

  // Importar de arquivo .env
  const importFromEnv = useCallback(async (
    envContent: string, 
    overwrite: boolean = false, 
    category: string = "CONFIG"
  ) => {
    try {
      setLoading(true)
      const result = await apiRequest("/import", {
        method: "POST",
        body: JSON.stringify({
          env_content: envContent,
          overwrite_existing: overwrite,
          default_category: category
        })
      })

      toast.success(`Importação concluída: ${result.created} criadas, ${result.updated} atualizadas`)
      
      // Recarregar variáveis
      await loadVariables()
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
  }, [apiRequest, loadVariables, loadStats])

  // Exportar para .env
  const exportToEnv = useCallback(async (
    categories?: string[], 
    includeSensitive: boolean = false
  ): Promise<string> => {
    try {
      const result = await apiRequest("/export", {
        method: "POST",
        body: JSON.stringify({
          format: "env",
          categories: categories,
          include_sensitive: includeSensitive
        })
      })

      return result.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao exportar variáveis"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [apiRequest])

  // Importar de arquivo
  const importFromFile = useCallback(async (
    file: File, 
    overwrite: boolean = false, 
    category: string = "CONFIG"
  ) => {
    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append("file", file)
      formData.append("overwrite_existing", overwrite.toString())
      formData.append("default_category", category)

      const response = await fetch(`${API_VARIABLES}/import/file`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erro ${response.status}`)
      }

      const result = await response.json()
      toast.success(`Arquivo importado: ${result.created} criadas, ${result.updated} atualizadas`)
      
      // Recarregar variáveis
      await loadVariables()
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
  }, [API_VARIABLES, token, loadVariables, loadStats])

  // Validar chave
  const validateKey = useCallback(async (key: string): Promise<UserVariableValidation> => {
    try {
      return await apiRequest(`/validate?key=${encodeURIComponent(key)}`, {
        method: "POST"
      })
    } catch (err) {
      throw err
    }
  }, [apiRequest])

  // Buscar variável por ID
  const getVariableById = useCallback((id: number): UserVariable | undefined => {
    return variables.find(v => v.id === id)
  }, [variables])

  // Buscar variável por chave
  const getVariableByKey = useCallback((key: string): UserVariable | undefined => {
    return variables.find(v => v.key.toLowerCase() === key.toLowerCase())
  }, [variables])

  // Buscar variáveis por categoria
  const getVariablesByCategory = useCallback((category: string): UserVariable[] => {
    return variables.filter(v => v.category === category)
  }, [variables])

  // Buscar variáveis
  const searchVariables = useCallback((query: string): UserVariable[] => {
    const searchTerm = query.toLowerCase()
    return variables.filter(v => 
      v.key.toLowerCase().includes(searchTerm) ||
      v.description?.toLowerCase().includes(searchTerm) ||
      v.category.toLowerCase().includes(searchTerm)
    )
  }, [variables])

  // Obter dicionário de variáveis
  const getEnvDict = useCallback(async (): Promise<Record<string, string>> => {
    try {
      return await apiRequest("/env/dict")
    } catch (err) {
      console.error("Erro ao obter dicionário de variáveis:", err)
      return {}
    }
  }, [apiRequest])

  // Obter string .env
  const getEnvString = useCallback(async (): Promise<string> => {
    try {
      const result = await apiRequest("/env/string")
      return result.env_content
    } catch (err) {
      console.error("Erro ao obter string .env:", err)
      return ""
    }
  }, [apiRequest])

  // Atualizar variáveis
  const refreshVariables = useCallback(async () => {
    await loadVariables()
  }, [loadVariables])

  // Atualizar estatísticas
  const refreshStats = useCallback(async () => {
    await loadStats()
  }, [loadStats])

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
    getEnvDict,
    getEnvString,
    
    // Estatísticas
    refreshStats
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

