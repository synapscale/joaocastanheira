"use client"

import { useMemo } from "react"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { nanoid } from "nanoid"
import type { NodeTemplate, TemplateCategory, TemplateFilters } from "@/types/node-template"
import { useWorkflow } from "@/context/workflow-context"

// Default template categories
const defaultCategories: TemplateCategory[] = [
  { id: "data-processing", name: "Data Processing", color: "#4f46e5" },
  { id: "api-integration", name: "API Integration", color: "#0ea5e9" },
  { id: "automation", name: "Automation", color: "#10b981" },
  { id: "custom", name: "Custom", color: "#f59e0b" },
]

// Sample built-in templates
const builtInTemplates: NodeTemplate[] = [
  {
    id: "data-transformation",
    name: "Data Transformation Pipeline",
    description: "A template for transforming and processing data",
    category: "data-processing",
    tags: ["data", "transformation", "filter"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: "node-1",
        type: "dataInput",
        name: "Data Input",
        description: "Receives data from an external source",
        position: { x: 100, y: 200 },
        inputs: [],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-2",
        type: "transform",
        name: "Transform",
        description: "Transforms data format",
        position: { x: 300, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-3",
        type: "filter",
        name: "Filter",
        description: "Filters data based on conditions",
        position: { x: 500, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
    ],
    connections: [
      {
        id: "conn-1",
        from: "node-1",
        to: "node-2",
        type: "bezier",
      },
      {
        id: "conn-2",
        from: "node-2",
        to: "node-3",
        type: "bezier",
      },
    ],
    isBuiltIn: true,
  },
  {
    id: "api-webhook",
    name: "API Webhook Handler",
    description: "Template for handling webhook data from external APIs",
    category: "api-integration",
    tags: ["api", "webhook", "http"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: "node-1",
        type: "webhook",
        name: "Webhook",
        description: "Receives webhook data",
        position: { x: 100, y: 200 },
        inputs: [],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-2",
        type: "jsonParse",
        name: "Parse JSON",
        description: "Parses JSON data",
        position: { x: 300, y: 200 },
        inputs: ["input-1"],
        outputs: ["output-1"],
        width: 70,
        height: 70,
      },
      {
        id: "node-3",
        type: "dataOutput",
        name: "Data Output",
        description: "Outputs processed data",
        position: { x: 500, y: 200 },
        inputs: ["input-1"],
        outputs: [],
        width: 70,
        height: 70,
      },
    ],
    connections: [
      {
        id: "conn-1",
        from: "node-1",
        to: "node-2",
        type: "bezier",
      },
      {
        id: "conn-2",
        from: "node-2",
        to: "node-3",
        type: "bezier",
      },
    ],
    isBuiltIn: true,
  },
]

// Define the context type
interface TemplateContextType {
  templates: NodeTemplate[]
  categories: TemplateCategory[]
  filters: TemplateFilters
  setFilters: (filters: TemplateFilters) => void
  saveTemplate: (name: string, description: string, category: string, tags: string[]) => Promise<NodeTemplate>
  deleteTemplate: (id: string) => Promise<void>
  updateTemplate: (template: NodeTemplate) => Promise<NodeTemplate>
  applyTemplate: (templateId: string) => void
  filteredTemplates: NodeTemplate[]
  addCategory: (category: Omit<TemplateCategory, "id">) => Promise<TemplateCategory>
  deleteCategory: (id: string) => Promise<void>
  updateCategory: (category: TemplateCategory) => Promise<TemplateCategory>
  exportTemplates: () => string
  importTemplates: (jsonData: string) => Promise<number>
}

// Create the context
const TemplateContext = createContext<TemplateContextType | undefined>(undefined)

// Storage keys
const TEMPLATES_STORAGE_KEY = "n8n_templates"
const CATEGORIES_STORAGE_KEY = "n8n_template_categories"

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const { nodes, connections, addNode, addConnection, clearCanvas } = useWorkflow()
  const [templates, setTemplates] = useState<NodeTemplate[]>(builtInTemplates)
  const [categories, setCategories] = useState<TemplateCategory[]>(defaultCategories)
  const [filters, setFilters] = useState<TemplateFilters>({
    search: "",
    categories: [],
    tags: [],
  })

  // Load templates and categories from localStorage on mount
  useEffect(() => {
    const loadTemplates = () => {
      try {
        const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY)
        if (storedTemplates) {
          const parsedTemplates = JSON.parse(storedTemplates) as NodeTemplate[]
          // Combine built-in templates with stored templates
          setTemplates([...builtInTemplates, ...parsedTemplates])
        }
      } catch (error) {
        console.error("Error loading templates:", error)
      }
    }

    const loadCategories = () => {
      try {
        const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY)
        if (storedCategories) {
          const parsedCategories = JSON.parse(storedCategories) as TemplateCategory[]
          // Combine default categories with stored categories
          setCategories([...defaultCategories, ...parsedCategories])
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }

    loadTemplates()
    loadCategories()
  }, [])

  // Save templates to localStorage whenever they change
  useEffect(() => {
    try {
      // Only save user-created templates (not built-in ones)
      const userTemplates = templates.filter((template) => !template.isBuiltIn)
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(userTemplates))
    } catch (error) {
      console.error("Error saving templates:", error)
    }
  }, [templates])

  // Save categories to localStorage whenever they change
  useEffect(() => {
    try {
      // Only save user-created categories (not default ones)
      const userCategories = categories.filter(
        (category) => !defaultCategories.some((defaultCat) => defaultCat.id === category.id),
      )
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(userCategories))
    } catch (error) {
      console.error("Error saving categories:", error)
    }
  }, [categories])

  // Filter templates based on search, categories, and tags
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Filter by search term
      const matchesSearch =
        filters.search === "" ||
        template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        template.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()))

      // Filter by categories
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(template.category)

      // Filter by tags
      const matchesTags = filters.tags.length === 0 || filters.tags.some((tag) => template.tags.includes(tag))

      return matchesSearch && matchesCategory && matchesTags
    })
  }, [templates, filters])

  // Save current workflow as a template
  const saveTemplate = useCallback(
    async (name: string, description: string, category: string, tags: string[]): Promise<NodeTemplate> => {
      if (nodes.length === 0) {
        throw new Error("Cannot save an empty workflow as a template")
      }

      const newTemplate: NodeTemplate = {
        id: `template-${nanoid(6)}`,
        name,
        description,
        category,
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: JSON.parse(JSON.stringify(nodes)), // Deep copy
        connections: JSON.parse(JSON.stringify(connections)), // Deep copy
      }

      setTemplates((prev) => [...prev, newTemplate])
      return newTemplate
    },
    [nodes, connections],
  )

  // Delete a template
  const deleteTemplate = useCallback(
    async (id: string): Promise<void> => {
      // Check if it's a built-in template
      const template = templates.find((t) => t.id === id)
      if (template?.isBuiltIn) {
        throw new Error("Cannot delete a built-in template")
      }

      setTemplates((prev) => prev.filter((template) => template.id !== id))
    },
    [templates],
  )

  // Update a template
  const updateTemplate = useCallback(
    async (updatedTemplate: NodeTemplate): Promise<NodeTemplate> => {
      // Check if it's a built-in template
      const template = templates.find((t) => t.id === updatedTemplate.id)
      if (template?.isBuiltIn) {
        throw new Error("Cannot update a built-in template")
      }

      const updated = {
        ...updatedTemplate,
        updatedAt: new Date().toISOString(),
      }

      setTemplates((prev) => prev.map((template) => (template.id === updated.id ? updated : template)))

      return updated
    },
    [templates],
  )

  // Apply a template to the current workflow
  const applyTemplate = useCallback(
    (templateId: string) => {
      const template = templates.find((t) => t.id === templateId)
      if (!template) {
        console.error(`Template with ID ${templateId} not found`)
        return
      }

      // Clear the current canvas
      clearCanvas()

      // Generate new IDs for nodes to avoid conflicts
      const idMap = new Map<string, string>()

      // Add nodes from the template
      template.nodes.forEach((node) => {
        const newId = `node-${nanoid(6)}`
        idMap.set(node.id, newId)

        const newNode = {
          ...node,
          id: newId,
        }

        addNode(newNode)
      })

      // Add connections from the template, using the new node IDs
      template.connections.forEach((connection) => {
        const fromId = idMap.get(connection.from)
        const toId = idMap.get(connection.to)

        if (fromId && toId) {
          const newConnectionId = `conn-${nanoid(6)}`
          addConnection(fromId, toId, connection.type || "bezier", newConnectionId, connection.label)
        }
      })
    },
    [templates, clearCanvas, addNode, addConnection],
  )

  // Add a new category
  const addCategory = useCallback(async (category: Omit<TemplateCategory, "id">): Promise<TemplateCategory> => {
    const newCategory: TemplateCategory = {
      ...category,
      id: `category-${nanoid(6)}`,
    }

    setCategories((prev) => [...prev, newCategory])
    return newCategory
  }, [])

  // Delete a category
  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    // Check if it's a default category
    if (defaultCategories.some((cat) => cat.id === id)) {
      throw new Error("Cannot delete a default category")
    }

    setCategories((prev) => prev.filter((category) => category.id !== id))
  }, [])

  // Update a category
  const updateCategory = useCallback(async (updatedCategory: TemplateCategory): Promise<TemplateCategory> => {
    // Check if it's a default category
    const isDefault = defaultCategories.some((cat) => cat.id === updatedCategory.id)
    if (isDefault) {
      throw new Error("Cannot update a default category")
    }

    setCategories((prev) => prev.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)))

    return updatedCategory
  }, [])

  // Export templates as JSON
  const exportTemplates = useCallback((): string => {
    // Only export user-created templates
    const userTemplates = templates.filter((template) => !template.isBuiltIn)
    return JSON.stringify(userTemplates, null, 2)
  }, [templates])

  // Import templates from JSON
  const importTemplates = useCallback(async (jsonData: string): Promise<number> => {
    try {
      const importedTemplates = JSON.parse(jsonData) as NodeTemplate[]

      // Validate the imported data
      if (!Array.isArray(importedTemplates)) {
        throw new Error("Invalid template data: expected an array")
      }

      // Add imported templates to the existing ones
      const newTemplates = importedTemplates.map((template) => ({
        ...template,
        id: `template-${nanoid(6)}`, // Generate new IDs to avoid conflicts
        isBuiltIn: false, // Ensure imported templates are not marked as built-in
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      setTemplates((prev) => [...prev, ...newTemplates])
      return newTemplates.length
    } catch (error) {
      console.error("Error importing templates:", error)
      throw new Error("Failed to import templates: " + (error as Error).message)
    }
  }, [])

  const value = {
    templates,
    categories,
    filters,
    setFilters,
    saveTemplate,
    deleteTemplate,
    updateTemplate,
    applyTemplate,
    filteredTemplates,
    addCategory,
    deleteCategory,
    updateCategory,
    exportTemplates,
    importTemplates,
  }

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>
}

// Custom hook to use the template context
export function useTemplates() {
  const context = useContext(TemplateContext)
  if (context === undefined) {
    throw new Error("useTemplates must be used within a TemplateProvider")
  }
  return context
}
