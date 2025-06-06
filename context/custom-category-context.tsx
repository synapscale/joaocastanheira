"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import type {
  CustomCategory,
  CustomCategoryWithNodes,
  CreateCustomCategoryInput,
  UpdateCustomCategoryInput,
} from "@/types/custom-category"
import { useToast } from "@/components/ui/use-toast"

/**
 * Interface que define as operações disponíveis no contexto de categorias personalizadas.
 */
interface CustomCategoryContextType {
  /** Lista de todas as categorias personalizadas */
  categories: CustomCategory[]
  /** Lista de categorias com seus nós associados */
  categoriesWithNodes: CustomCategoryWithNodes[]
  /** Indica se os dados estão sendo carregados */
  isLoading: boolean
  /** Mensagem de erro, se houver */
  error: string | null
  /** Adiciona uma nova categoria personalizada */
  addCategory: (category: CreateCustomCategoryInput) => Promise<CustomCategory>
  /** Atualiza uma categoria existente */
  updateCategory: (category: UpdateCustomCategoryInput) => Promise<CustomCategory>
  /** Remove uma categoria existente */
  deleteCategory: (id: string) => Promise<boolean>
  /** Adiciona um nó a uma categoria */
  addNodeToCategory: (categoryId: string, nodeId: string) => Promise<boolean>
  /** Remove um nó de uma categoria */
  removeNodeFromCategory: (categoryId: string, nodeId: string) => Promise<boolean>
  /** Obtém todos os nós de uma categoria específica */
  getCategoryNodes: (categoryId: string) => string[]
  /** Obtém todas as categorias às quais um nó pertence */
  getNodeCategories: (nodeId: string) => CustomCategory[]
}

// Chaves para armazenamento no localStorage
const STORAGE_KEYS = {
  CATEGORIES: "customCategories",
  CATEGORIES_WITH_NODES: "customCategoriesWithNodes",
}

// Contexto com valor inicial undefined
const CustomCategoryContext = createContext<CustomCategoryContextType | undefined>(undefined)

/**
 * Hook personalizado para acessar o contexto de categorias personalizadas.
 * @returns O contexto de categorias personalizadas
 * @throws Error se usado fora de um CustomCategoryProvider
 */
export function useCustomCategories() {
  const context = useContext(CustomCategoryContext)
  if (context === undefined) {
    throw new Error("useCustomCategories must be used within a CustomCategoryProvider")
  }
  return context
}

interface CustomCategoryProviderProps {
  children: ReactNode
}

/**
 * Provedor de contexto para gerenciar categorias personalizadas.
 */
export function CustomCategoryProvider({ children }: CustomCategoryProviderProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<CustomCategory[]>([])
  const [categoriesWithNodes, setCategoriesWithNodes] = useState<CustomCategoryWithNodes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar categorias do localStorage na inicialização
  useEffect(() => {
    const loadCategories = () => {
      try {
        setIsLoading(true)

        // Carregar categorias do localStorage
        const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
        const savedCategoriesWithNodes = localStorage.getItem(STORAGE_KEYS.CATEGORIES_WITH_NODES)

        if (savedCategories) {
          setCategories(JSON.parse(savedCategories))
        }

        if (savedCategoriesWithNodes) {
          setCategoriesWithNodes(JSON.parse(savedCategoriesWithNodes))
        } else if (savedCategories) {
          // Se não existir, inicializar com as categorias, mas sem nós
          const initialCategoriesWithNodes = JSON.parse(savedCategories).map((cat: CustomCategory) => ({
            ...cat,
            nodes: [],
          }))
          setCategoriesWithNodes(initialCategoriesWithNodes)
        }
      } catch (err) {
        console.error("Error loading custom categories:", err)
        setError("Falha ao carregar categorias personalizadas")
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Salvar categorias no localStorage quando mudarem
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    }
  }, [categories])

  useEffect(() => {
    if (categoriesWithNodes.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES_WITH_NODES, JSON.stringify(categoriesWithNodes))
    }
  }, [categoriesWithNodes])

  /**
   * Adiciona uma nova categoria personalizada.
   */
  const addCategory = useCallback(
    async (categoryInput: CreateCustomCategoryInput): Promise<CustomCategory> => {
      try {
        const timestamp = new Date().toISOString()
        const newCategory: CustomCategory = {
          id: uuidv4(),
          ...categoryInput,
          userId: "current-user", // Em um app real, seria o ID do usuário atual
          createdAt: timestamp,
          updatedAt: timestamp,
          nodeCount: 0,
        }

        setCategories((prev) => [...prev, newCategory])

        // Adicionar também à lista de categorias com nós
        const newCategoryWithNodes: CustomCategoryWithNodes = {
          ...newCategory,
          nodes: [],
        }

        setCategoriesWithNodes((prev) => [...prev, newCategoryWithNodes])

        toast({
          title: "Categoria criada",
          description: `A categoria "${newCategory.name}" foi criada com sucesso.`,
        })

        return newCategory
      } catch (err) {
        console.error("Error creating category:", err)
        toast({
          title: "Erro ao criar categoria",
          description: "Ocorreu um erro ao criar a categoria. Tente novamente.",
          variant: "destructive",
        })
        throw new Error("Falha ao criar categoria")
      }
    },
    [toast],
  )

  /**
   * Atualiza uma categoria existente.
   */
  const updateCategory = useCallback(
    async (categoryInput: UpdateCustomCategoryInput): Promise<CustomCategory> => {
      try {
        const timestamp = new Date().toISOString()

        // Verificar se a categoria existe
        const categoryExists = categories.some((cat) => cat.id === categoryInput.id)
        if (!categoryExists) {
          throw new Error("Categoria não encontrada")
        }

        const updatedCategories = categories.map((cat) => {
          if (cat.id === categoryInput.id) {
            return {
              ...cat,
              ...categoryInput,
              updatedAt: timestamp,
            }
          }
          return cat
        })

        setCategories(updatedCategories)

        // Atualizar também na lista de categorias com nós
        const updatedCategoriesWithNodes = categoriesWithNodes.map((cat) => {
          if (cat.id === categoryInput.id) {
            return {
              ...cat,
              ...categoryInput,
              updatedAt: timestamp,
            }
          }
          return cat
        })

        setCategoriesWithNodes(updatedCategoriesWithNodes)

        const updatedCategory = updatedCategories.find((cat) => cat.id === categoryInput.id)

        if (!updatedCategory) {
          throw new Error("Categoria não encontrada após atualização")
        }

        toast({
          title: "Categoria atualizada",
          description: `A categoria "${updatedCategory.name}" foi atualizada com sucesso.`,
        })

        return updatedCategory
      } catch (err) {
        console.error("Error updating category:", err)
        toast({
          title: "Erro ao atualizar categoria",
          description: "Ocorreu um erro ao atualizar a categoria. Tente novamente.",
          variant: "destructive",
        })
        throw err
      }
    },
    [categories, categoriesWithNodes, toast],
  )

  /**
   * Exclui uma categoria existente.
   */
  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const categoryToDelete = categories.find((cat) => cat.id === id)

        if (!categoryToDelete) {
          throw new Error("Categoria não encontrada")
        }

        setCategories((prev) => prev.filter((cat) => cat.id !== id))
        setCategoriesWithNodes((prev) => prev.filter((cat) => cat.id !== id))

        toast({
          title: "Categoria excluída",
          description: `A categoria "${categoryToDelete.name}" foi excluída com sucesso.`,
        })

        return true
      } catch (err) {
        console.error("Error deleting category:", err)
        toast({
          title: "Erro ao excluir categoria",
          description: "Ocorreu um erro ao excluir a categoria. Tente novamente.",
          variant: "destructive",
        })
        return false
      }
    },
    [categories, toast],
  )

  /**
   * Adiciona um nó a uma categoria.
   */
  const addNodeToCategory = useCallback(
    async (categoryId: string, nodeId: string): Promise<boolean> => {
      try {
        const categoryIndex = categoriesWithNodes.findIndex((cat) => cat.id === categoryId)

        if (categoryIndex === -1) {
          throw new Error("Categoria não encontrada")
        }

        // Verificar se o nó já está na categoria
        if (categoriesWithNodes[categoryIndex].nodes.includes(nodeId)) {
          return true // Nó já está na categoria
        }

        // Adicionar o nó à categoria
        const updatedCategoriesWithNodes = [...categoriesWithNodes]
        updatedCategoriesWithNodes[categoryIndex] = {
          ...updatedCategoriesWithNodes[categoryIndex],
          nodes: [...updatedCategoriesWithNodes[categoryIndex].nodes, nodeId],
          nodeCount: updatedCategoriesWithNodes[categoryIndex].nodeCount + 1,
          updatedAt: new Date().toISOString(),
        }

        setCategoriesWithNodes(updatedCategoriesWithNodes)

        // Atualizar também a contagem de nós na lista de categorias
        const updatedCategories = categories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              nodeCount: cat.nodeCount + 1,
              updatedAt: new Date().toISOString(),
            }
          }
          return cat
        })

        setCategories(updatedCategories)

        return true
      } catch (err) {
        console.error("Error adding node to category:", err)
        toast({
          title: "Erro ao adicionar nó à categoria",
          description: "Ocorreu um erro ao adicionar o nó à categoria. Tente novamente.",
          variant: "destructive",
        })
        return false
      }
    },
    [categories, categoriesWithNodes, toast],
  )

  /**
   * Remove um nó de uma categoria.
   */
  const removeNodeFromCategory = useCallback(
    async (categoryId: string, nodeId: string): Promise<boolean> => {
      try {
        const categoryIndex = categoriesWithNodes.findIndex((cat) => cat.id === categoryId)

        if (categoryIndex === -1) {
          throw new Error("Categoria não encontrada")
        }

        // Verificar se o nó está na categoria
        if (!categoriesWithNodes[categoryIndex].nodes.includes(nodeId)) {
          return true // Nó não está na categoria
        }

        // Remover o nó da categoria
        const updatedCategoriesWithNodes = [...categoriesWithNodes]
        updatedCategoriesWithNodes[categoryIndex] = {
          ...updatedCategoriesWithNodes[categoryIndex],
          nodes: updatedCategoriesWithNodes[categoryIndex].nodes.filter((id) => id !== nodeId),
          nodeCount: Math.max(0, updatedCategoriesWithNodes[categoryIndex].nodeCount - 1),
          updatedAt: new Date().toISOString(),
        }

        setCategoriesWithNodes(updatedCategoriesWithNodes)

        // Atualizar também a contagem de nós na lista de categorias
        const updatedCategories = categories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              nodeCount: Math.max(0, cat.nodeCount - 1),
              updatedAt: new Date().toISOString(),
            }
          }
          return cat
        })

        setCategories(updatedCategories)

        return true
      } catch (err) {
        console.error("Error removing node from category:", err)
        toast({
          title: "Erro ao remover nó da categoria",
          description: "Ocorreu um erro ao remover o nó da categoria. Tente novamente.",
          variant: "destructive",
        })
        return false
      }
    },
    [categories, categoriesWithNodes, toast],
  )

  /**
   * Obtém todos os nós de uma categoria.
   */
  const getCategoryNodes = useCallback(
    (categoryId: string): string[] => {
      const category = categoriesWithNodes.find((cat) => cat.id === categoryId)
      return category ? category.nodes : []
    },
    [categoriesWithNodes],
  )

  /**
   * Obtém todas as categorias de um nó.
   */
  const getNodeCategories = useCallback(
    (nodeId: string): CustomCategory[] => {
      const nodeCategories = categoriesWithNodes
        .filter((cat) => cat.nodes.includes(nodeId))
        .map((cat) => {
          // Extrair apenas as propriedades da categoria sem os nós
          const { nodes, ...categoryWithoutNodes } = cat
          return categoryWithoutNodes
        })

      return nodeCategories
    },
    [categoriesWithNodes],
  )

  // Memoize o valor do contexto para evitar renderizações desnecessárias
  const contextValue = useMemo(
    () => ({
      categories,
      categoriesWithNodes,
      isLoading,
      error,
      addCategory,
      updateCategory,
      deleteCategory,
      addNodeToCategory,
      removeNodeFromCategory,
      getCategoryNodes,
      getNodeCategories,
    }),
    [
      categories,
      categoriesWithNodes,
      isLoading,
      error,
      addCategory,
      updateCategory,
      deleteCategory,
      addNodeToCategory,
      removeNodeFromCategory,
      getCategoryNodes,
      getNodeCategories,
    ],
  )

  return <CustomCategoryContext.Provider value={contextValue}>{children}</CustomCategoryContext.Provider>
}
