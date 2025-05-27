"use client"

import { useState, useEffect, useCallback } from "react"

// Mock data para demonstração
const MOCK_ITEMS = [
  {
    id: "1",
    name: "AI Assistant",
    description: "Assistente de IA para automação",
    category: "ai",
    tags: ["ai", "automation", "assistant"],
    rating: 4.5,
    reviews: 23,
    author: "João Silva",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Data Processor",
    description: "Processador de dados avançado",
    category: "data",
    tags: ["data", "processing", "analytics"],
    rating: 4.2,
    reviews: 15,
    author: "Maria Santos",
    createdAt: "2024-01-10",
  },
]

const MOCK_CATEGORIES = [
  { id: "ai", name: "Inteligência Artificial", count: 12 },
  { id: "data", name: "Processamento de Dados", count: 8 },
  { id: "automation", name: "Automação", count: 15 },
]

export function useMarketplace() {
  const [items, setItems] = useState(MOCK_ITEMS)
  const [categories, setCategories] = useState(MOCK_CATEGORIES)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshItems = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simular carregamento
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setItems(MOCK_ITEMS)
      setError(null)
    } catch (err) {
      setError("Erro ao carregar itens do marketplace")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshItems()
  }, [refreshItems])

  return {
    items,
    categories,
    isLoading,
    error,
    refreshItems,
  }
}
