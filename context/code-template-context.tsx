"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { codeTemplates as defaultTemplates, type CodeTemplate } from "@/data/code-templates"

interface CodeTemplateContextType {
  templates: CodeTemplate[]
  customTemplates: CodeTemplate[]
  addCustomTemplate: (template: Omit<CodeTemplate, "id">) => void
  updateCustomTemplate: (id: string, template: Omit<CodeTemplate, "id">) => void
  deleteCustomTemplate: (id: string) => void
  getTemplatesByCategory: (category: string) => CodeTemplate[]
  getTemplatesByLanguage: (language: string) => CodeTemplate[]
}

const CodeTemplateContext = createContext<CodeTemplateContextType | undefined>(undefined)

export function CodeTemplateProvider({ children }: { children: ReactNode }) {
  const [customTemplates, setCustomTemplates] = useState<CodeTemplate[]>([])

  // Load custom templates from localStorage on mount
  useEffect(() => {
    const storedTemplates = localStorage.getItem("customCodeTemplates")
    if (storedTemplates) {
      try {
        setCustomTemplates(JSON.parse(storedTemplates))
      } catch (error) {
        console.error("Failed to parse stored templates:", error)
      }
    }
  }, [])

  // Save custom templates to localStorage when they change
  useEffect(() => {
    localStorage.setItem("customCodeTemplates", JSON.stringify(customTemplates))
  }, [customTemplates])

  // Add a new custom template
  const addCustomTemplate = (template: Omit<CodeTemplate, "id">) => {
    const newTemplate: CodeTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
    }
    setCustomTemplates((prev) => [...prev, newTemplate])
  }

  // Update an existing custom template
  const updateCustomTemplate = (id: string, template: Omit<CodeTemplate, "id">) => {
    setCustomTemplates((prev) => prev.map((t) => (t.id === id ? { ...template, id } : t)))
  }

  // Delete a custom template
  const deleteCustomTemplate = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  // Get all templates (default + custom)
  const templates = [...defaultTemplates, ...customTemplates]

  // Get templates by category
  const getTemplatesByCategory = (category: string) => {
    return templates.filter((t) => category === "all" || t.category === category)
  }

  // Get templates by language
  const getTemplatesByLanguage = (language: string) => {
    return templates.filter((t) => t.language === "all" || t.language === language)
  }

  return (
    <CodeTemplateContext.Provider
      value={{
        templates,
        customTemplates,
        addCustomTemplate,
        updateCustomTemplate,
        deleteCustomTemplate,
        getTemplatesByCategory,
        getTemplatesByLanguage,
      }}
    >
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
