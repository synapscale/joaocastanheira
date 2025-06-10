"use client"

/**
 * Node Template Context
 *
 * This context manages workflow templates that users can apply to their projects.
 * It provides functionality for browsing, filtering, and applying templates.
 *
 * @module NodeTemplateContext
 */


import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { NodeTemplate } from "@/types/node-template"

/**
 * Interface defining the shape of the node template context
 */
interface NodeTemplateContextType {
  /** List of available templates */
  templates: NodeTemplate[]
  /** List of unique template categories */
  categories: string[]
  /** List of unique template tags */
  tags: string[]
  /** Whether templates are currently loading */
  loading: boolean
  /** Error message if template loading failed */
  error: string | null
  /** Get a template by its ID */
  getTemplateById: (id: string) => NodeTemplate | undefined
  /** Apply a template to the current workflow */
  applyTemplate: (templateId: string) => Promise<void>
  /** Add a new template */
  addTemplate: (template: NodeTemplate) => void
  /** Update an existing template */
  updateTemplate: (id: string, updates: Partial<NodeTemplate>) => void
  /** Delete a template */
  deleteTemplate: (id: string) => void
  /** Import multiple templates */
  importTemplates: (templates: NodeTemplate[]) => void
}

// Create the context with undefined default value
const NodeTemplateContext = createContext<NodeTemplateContextType | undefined>(undefined)

/**
 * Sample template data for initial state
 */
const sampleTemplates: NodeTemplate[] = [
  {
    id: "template-1",
    name: "Data Transformation",
    description: "A template for basic data transformation workflows",
    category: "Data Processing",
    tags: ["transformation", "data", "beginner"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
    connections: [],
  },
  {
    id: "template-2",
    name: "API Integration",
    description: "Connect to external APIs and process responses",
    category: "Integration",
    tags: ["api", "http", "integration"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
    connections: [],
  },
]

/**
 * Node Template Provider Component
 *
 * Provides template management functionality to all child components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function NodeTemplateProvider({ children }: { children: React.ReactNode }) {
  // State for templates and loading status
  const [templates, setTemplates] = useState<NodeTemplate[]>(sampleTemplates)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize templates - in a real app, this would load from API or storage
  useEffect(() => {
    // Simulate loading completion
    setLoading(false)
  }, [])

  // Derive categories from templates
  const categories = Array.from(new Set(templates.map((template) => template.category)))

  // Derive tags from templates
  const tags = Array.from(new Set(templates.flatMap((template) => template.tags)))

  /**
   * Get a template by its ID
   *
   * @param {string} id - The template ID to find
   * @returns {NodeTemplate | undefined} The found template or undefined
   */
  const getTemplateById = useCallback(
    (id: string) => {
      return templates.find((template) => template.id === id)
    },
    [templates],
  )

  /**
   * Apply a template to the current workflow
   *
   * @param {string} templateId - The ID of the template to apply
   * @returns {Promise<void>} A promise that resolves when the template is applied
   */
  const applyTemplate = useCallback(
    async (templateId: string) => {
      const template = templates.find((t) => t.id === templateId)
      if (!template) {
        console.warn(`Template with ID ${templateId} not found`)
        return
      }
      // In a real app, you would apply the template to the workflow
      console.log(`Applying template ${template.name}`)
    },
    [templates],
  )

  /**
   * Add a new template
   *
   * @param {NodeTemplate} template - The template to add
   */
  const addTemplate = useCallback((template: NodeTemplate) => {
    setTemplates((prev) => [...prev, template])
  }, [])

  /**
   * Update an existing template
   *
   * @param {string} id - The ID of the template to update
   * @param {Partial<NodeTemplate>} updates - The properties to update
   */
  const updateTemplate = useCallback((id: string, updates: Partial<NodeTemplate>) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id ? { ...template, ...updates, updatedAt: new Date().toISOString() } : template,
      ),
    )
  }, [])

  /**
   * Delete a template
   *
   * @param {string} id - The ID of the template to delete
   */
  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id))
  }, [])

  /**
   * Import multiple templates
   *
   * @param {NodeTemplate[]} templatesToImport - The templates to import
   */
  const importTemplates = useCallback((templatesToImport: NodeTemplate[]) => {
    setTemplates((prev) => [...prev, ...templatesToImport])
  }, [])

  // Create context value object
  const value = {
    templates,
    categories,
    tags,
    loading,
    error,
    getTemplateById,
    applyTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    importTemplates,
  }

  return <NodeTemplateContext.Provider value={value}>{children}</NodeTemplateContext.Provider>
}

/**
 * Custom hook to use the node template context
 *
 * @returns {NodeTemplateContextType} The node template context value
 * @throws {Error} If used outside of a NodeTemplateProvider
 */
export function useNodeTemplate() {
  const context = useContext(NodeTemplateContext)
  if (context === undefined) {
    throw new Error("useNodeTemplate must be used within a NodeTemplateProvider")
  }
  return context
}

/**
 * Alias for useNodeTemplate to maintain backward compatibility
 */
export { useNodeTemplate as useNodeTemplates }
