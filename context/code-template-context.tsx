"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from "react"
import { apiService } from "@/lib/api/service"
import type { CodeTemplate } from "@/lib/api/openapi-types"
import { codeTemplates as defaultTemplates } from "@/data/code-templates"

interface CodeTemplateContextType {
  templates: CodeTemplate[]
  customTemplates: CodeTemplate[]
  isLoading: boolean
  error: string | null
  refreshTemplates: () => Promise<void>
  addCustomTemplate: (template: Omit<CodeTemplate, "id" | "user_id" | "created_at" | "updated_at" | "usage_count" | "rating_average" | "rating_count">) => void
  updateCustomTemplate: (id: string, template: Partial<CodeTemplate>) => void
  deleteCustomTemplate: (id: string) => void
}

const CodeTemplateContext = createContext<CodeTemplateContextType | undefined>(undefined)

export function CodeTemplateProvider({ children }: { children: ReactNode }) {
  const [apiTemplates, setApiTemplates] = useState<CodeTemplate[]>([])
  const [customTemplates, setCustomTemplates] = useState<CodeTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Usar apenas templates locais - API endpoint não existe
  const refreshTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // ❌ Endpoint /code-templates não existe na API oficial
      // Usando apenas templates estáticos locais por enquanto
      console.log('ℹ️ Code Templates API não implementada - usando templates locais apenas')
      
      setApiTemplates([]) // Limpar templates da API por enquanto
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar templates:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar templates')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load static templates on mount (não chama API)
  useEffect(() => {
    // Não chama refreshTemplates() automaticamente para evitar erro
    setIsLoading(false)
    setError(null)
    setApiTemplates([])
  }, [])



  // Funções para gerenciar templates customizados
  const addCustomTemplate = useCallback((template: Omit<CodeTemplate, "id" | "user_id" | "created_at" | "updated_at" | "usage_count" | "rating_average" | "rating_count">) => {
    const newTemplate: CodeTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      user_id: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
      rating_average: 0,
      rating_count: 0,
    }
    setCustomTemplates(prev => [...prev, newTemplate])
  }, [])

  const updateCustomTemplate = useCallback((id: string, template: Partial<CodeTemplate>) => {
    setCustomTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, ...template, updated_at: new Date().toISOString() } : t
    ))
  }, [])

  const deleteCustomTemplate = useCallback((id: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== id))
  }, [])

  // Combinar templates locais (estáticos) com templates da API (vazio por enquanto)
  const allTemplates = useMemo(() => {
    // Mapear templates locais para o formato da API
    const mappedLocalTemplates = defaultTemplates.map(template => ({
      ...template,
      user_id: "system",
      is_public: true,
      usage_count: 0,
      rating_average: 0,
      rating_count: 0,
      workspace_id: undefined,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    }))
    
    return [...mappedLocalTemplates, ...apiTemplates, ...customTemplates]
  }, [apiTemplates, customTemplates])

  const value: CodeTemplateContextType = {
    templates: allTemplates,
    customTemplates,
    isLoading,
    error,
    refreshTemplates,
    addCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
  }

  return (
    <CodeTemplateContext.Provider value={value}>
      {children}
    </CodeTemplateContext.Provider>
  )
}

export function useCodeTemplates() {
  const context = useContext(CodeTemplateContext)
  if (context === undefined) {
    throw new Error("useCodeTemplates must be used within a CodeTemplateProvider")
  }
  return context
}
