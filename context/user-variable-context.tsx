"use client"

/**
 * Contexto de Variáveis do Usuário - Integração Backend
 * Criado por José - O melhor Full Stack do mundo
 * Sistema completo de variáveis personalizado com sincronização backend
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "./auth-context"

// Types para variáveis do usuário (compatível com API)
export interface UserVariable {
  id: string
  key: string
  value?: string | null
  description?: string | null
  category?: string | null
  is_encrypted: boolean
  is_active: boolean
  created_at?: string | null
  updated_at?: string | null
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
  last_updated?: string | null
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
  updateVariable: (id: string, data: UserVariableUpdate) => Promise<UserVariable | null>
  deleteVariable: (id: string) => Promise<boolean>
  
  // Operações em lote
  bulkCreateVariables: (variables: UserVariableCreate[]) => Promise<UserVariable[]>
  bulkDeleteVariables: (ids: string[]) => Promise<number>
  
  // Busca e filtros
  getVariableById: (id: string) => UserVariable | undefined
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
  const { user, token, isAuthenticated } = useAuth()
  const [variables, setVariables] = useState<UserVariable[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [stats, setStats] = useState<UserVariableStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL base da API
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const API_VARIABLES = `${API_BASE}/api/v1/user-variables`

  // Headers para requisições autenticadas
  const getHeaders = useCallback((): HeadersInit => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    
    return headers
  }, [token])

  // Função para fazer requisições à API
  const apiRequest = useCallback(async (
    endpoint: string, 
    options: RequestInit = {}
  ) => {
    if (!token) {
      throw new Error("Usuário não autenticado")
    }

    const url = `${API_VARIABLES}${endpoint}`
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 UserVariableContext - Making request to:', url)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...getHeaders(),
          ...options.headers
        }
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('📡 UserVariableContext - Response status:', response.status)
      }

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch (parseError) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Could not parse error response as JSON')
          }
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ UserVariableContext - Response data:', data)
      }
      return data
    } catch (error) {
      console.warn('⚠️ UserVariableContext - Request failed:', error)
      throw error
    }
  }, [API_VARIABLES, token, getHeaders])

  // Carregar variáveis do usuário
  const loadVariables = useCallback(async () => {
    if (!user || !token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 UserVariableContext - No user or token, skipping load')
      }
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 UserVariableContext - Loading variables...')
      }
      const data = await apiRequest("/")
      
      // Verificar se a resposta tem a estrutura esperada
      if (data && typeof data === 'object') {
        setVariables(data.variables || [])
        setCategories(data.categories || [])
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ UserVariableContext - Variables loaded:', data.variables?.length || 0)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ UserVariableContext - Unexpected response structure:', data)
        }
        setVariables([])
        setCategories([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar variáveis"
      setError(errorMessage)
      console.warn("⚠️ UserVariableContext - Error loading variables:", err)
      
      // Reset para estado limpo em caso de erro
      setVariables([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [user, token, apiRequest])

  // Carregar estatísticas
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
      const data = await apiRequest("/stats/summary")
      
      // Verificar se a resposta tem a estrutura esperada
      if (data && typeof data === 'object') {
        setStats(data)
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ UserVariableContext - Stats loaded:', data)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ UserVariableContext - Unexpected stats response:', data)
        }
        setStats(null)
      }
    } catch (err) {
      console.warn("⚠️ UserVariableContext - Error loading stats:", err)
      // Não definir como erro crítico, apenas log
      setStats(null)
    }
  }, [user, token, apiRequest])

  // Carregar dados iniciais quando usuário faz login
  useEffect(() => {
    if (isAuthenticated && user && token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 UserVariableContext - User authenticated, loading data...')
      }
      
      // Aguardar um pouco para garantir que tudo está inicializado
      const timer = setTimeout(() => {
        loadVariables().then(() => {
          // Carregar stats apenas após as variáveis serem carregadas
          loadStats()
        })
      }, 1000)
      
      return () => clearTimeout(timer)
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 UserVariableContext - User not authenticated, clearing data')
      }
      // Limpar dados quando usuário faz logout
      setVariables([])
      setCategories([])
      setStats(null)
      setError(null)
    }
  }, [isAuthenticated, user, token, loadVariables, loadStats])

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
  const updateVariable = useCallback(async (id: string, data: UserVariableUpdate): Promise<UserVariable | null> => {
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
  const deleteVariable = useCallback(async (id: string): Promise<boolean> => {
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
  const bulkDeleteVariables = useCallback(async (ids: string[]): Promise<number> => {
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
  const getVariableById = useCallback((id: string): UserVariable | undefined => {
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
      v.category?.toLowerCase().includes(searchTerm)
    )
  }, [variables])

  // Obter dicionário de variáveis
  const getEnvDict = useCallback(async (): Promise<Record<string, string>> => {
    try {
      return await apiRequest("/env/dict")
    } catch (err) {
      console.warn("⚠️ Erro ao obter dicionário de variáveis:", err)
      return {}
    }
  }, [apiRequest])

  // Obter string .env
  const getEnvString = useCallback(async (): Promise<string> => {
    try {
      const result = await apiRequest("/env/string")
      return result.env_content
    } catch (err) {
      console.warn("⚠️ Erro ao obter string .env:", err)
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

