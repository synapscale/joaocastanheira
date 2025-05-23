"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useNodeDefinitions } from "@/context/node-definition-context"
import { useCustomCategories } from "@/context/custom-category-context"
import { NodeCard } from "./node-card"
import { NodeDetailsDialog } from "./node-details-dialog"
import { NodeFilters } from "./node-filters"
import { Search, TrendingUp, Star, Clock, Filter, FolderPlus } from "lucide-react"
import { fetchMarketplaceNodes } from "@/lib/marketplace-api"
import type { MarketplaceNode } from "@/types/marketplace"
import Link from "next/link"

/**
 * Componente principal do marketplace de nós.
 */
export function NodeMarketplace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { addNodeDefinition } = useNodeDefinitions()
  const {
    categories: customCategories,
    addNodeToCategory,
    removeNodeFromCategory,
    getCategoryNodes,
    getNodeCategories,
  } = useCustomCategories()

  // Estado para os nós do marketplace
  const [marketplaceNodes, setMarketplaceNodes] = useState<MarketplaceNode[]>([])
  const [filteredNodes, setFilteredNodes] = useState<MarketplaceNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado para filtros e busca
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("popular")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Estado para categorias personalizadas
  const [selectedCategoryType, setSelectedCategoryType] = useState<"system" | "custom">("system")
  const [selectedCustomCategory, setSelectedCustomCategory] = useState<string | null>(null)

  // Estado para o diálogo de detalhes
  const [selectedNode, setSelectedNode] = useState<MarketplaceNode | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  /**
   * Processa parâmetros de URL para definir filtros iniciais.
   */
  useEffect(() => {
    const category = searchParams.get("category")
    const type = searchParams.get("type") as "system" | "custom" | null

    if (category) {
      if (type === "custom") {
        setSelectedCategoryType("custom")
        setSelectedCustomCategory(category)
      } else {
        setSelectedCategoryType("system")
        setSelectedCategory(category)
      }

      // Mostrar filtros automaticamente quando há um filtro de categoria na URL
      setShowFilters(true)
    }
  }, [searchParams])

  /**
   * Carrega os nós do marketplace.
   */
  useEffect(() => {
    const loadMarketplaceNodes = async () => {
      try {
        setIsLoading(true)
        const nodes = await fetchMarketplaceNodes()
        setMarketplaceNodes(nodes)
        setFilteredNodes(nodes)
      } catch (err) {
        console.error("Error fetching marketplace nodes:", err)
        setError("Falha ao carregar nós do marketplace")
      } finally {
        setIsLoading(false)
      }
    }

    loadMarketplaceNodes()
  }, [])

  /**
   * Filtra os nós com base nos critérios selecionados.
   */
  useEffect(() => {
    let result = [...marketplaceNodes]

    // Aplicar busca por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (node) =>
          node.name.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query) ||
          node.author.toLowerCase().includes(query) ||
          (node.tags && node.tags.some((tag) => tag.toLowerCase().includes(query))),
      )
    }

    // Aplicar filtro de categoria do sistema
    if (selectedCategoryType === "system" && selectedCategory) {
      result = result.filter((node) => node.category === selectedCategory)
    }

    // Aplicar filtro de categoria personalizada
    if (selectedCategoryType === "custom" && selectedCustomCategory) {
      const categoryNodes = getCategoryNodes(selectedCustomCategory)
      result = result.filter((node) => categoryNodes.includes(node.id))
    }

    // Aplicar filtro de tags
    if (selectedTags.length > 0) {
      result = result.filter((node) => node.tags && selectedTags.every((tag) => node.tags.includes(tag)))
    }

    // Aplicar ordenação baseada na aba ativa
    switch (activeTab) {
      case "popular":
        result.sort((a, b) => b.downloads - a.downloads)
        break
      case "trending":
        result.sort((a, b) => b.trending_score - a.trending_score)
        break
      case "newest":
        result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        break
      case "top-rated":
        result.sort((a, b) => b.rating - a.rating)
        break
    }

    setFilteredNodes(result)
  }, [
    marketplaceNodes,
    searchQuery,
    activeTab,
    selectedCategory,
    selectedTags,
    selectedCategoryType,
    selectedCustomCategory,
    getCategoryNodes,
  ])

  /**
   * Manipula o clique em um nó para abrir o diálogo de detalhes.
   */
  const handleNodeClick = useCallback((node: MarketplaceNode) => {
    setSelectedNode(node)
    setDetailsOpen(true)
  }, [])

  /**
   * Manipula a instalação de um nó.
   */
  const handleInstall = useCallback(
    async (node: MarketplaceNode) => {
      try {
        // Em um app real, isso faria uma requisição para obter os detalhes completos do nó
        // Por enquanto, vamos simular a conversão de um MarketplaceNode para NodeDefinition
        const nodeDefinition = {
          id: `marketplace-${node.id}`,
          name: node.name,
          type: node.type,
          category: node.category,
          description: node.description,
          version: node.version,
          author: node.author,
          icon: node.icon,
          color: node.color,
          tags: node.tags,
          inputs: node.inputs || [],
          outputs: node.outputs || [],
          parameters: node.parameters || [],
          documentation: node.documentation || "",
          codeTemplate: node.code_template || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await addNodeDefinition(nodeDefinition)

        toast({
          title: "Nó instalado com sucesso",
          description: `${node.name} foi adicionado à sua biblioteca de nós.`,
        })

        // Fechar o diálogo de detalhes
        setDetailsOpen(false)
      } catch (err) {
        console.error("Error installing node:", err)
        toast({
          title: "Falha ao instalar nó",
          description: "Ocorreu um erro ao instalar o nó. Tente novamente mais tarde.",
          variant: "destructive",
        })
      }
    },
    [addNodeDefinition, toast],
  )

  /**
   * Reseta todos os filtros.
   */
  const handleResetFilters = useCallback(() => {
    setSelectedCategory(null)
    setSelectedTags([])
    setSelectedCategoryType("system")
    setSelectedCustomCategory(null)
    setSearchQuery("")
  }, [])

  /**
   * Manipula a alternância entre categorias do sistema e personalizadas.
   */
  const handleCategoryTypeChange = useCallback((type: "system" | "custom") => {
    setSelectedCategoryType(type)

    // Resetar a seleção de categoria quando mudar o tipo
    if (type === "system") {
      setSelectedCustomCategory(null)
    } else {
      setSelectedCategory(null)
    }
  }, [])

  /**
   * Manipula a alteração da consulta de pesquisa.
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  /**
   * Alterna a visibilidade dos filtros.
   */
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev)
  }, [])

  /**
   * Renderiza o grid de nós.
   */
  const renderNodeGrid = useMemo(() => {
    return (
      <NodeGrid
        nodes={filteredNodes}
        isLoading={isLoading}
        error={error}
        onNodeClick={handleNodeClick}
        customCategories={customCategories}
        getNodeCategories={getNodeCategories}
        onAddToCategory={addNodeToCategory}
        onRemoveFromCategory={removeNodeFromCategory}
        onRetry={() => router.refresh()}
        onClearFilters={handleResetFilters}
      />
    )
  }, [
    filteredNodes,
    isLoading,
    error,
    handleNodeClick,
    customCategories,
    getNodeCategories,
    addNodeToCategory,
    removeNodeFromCategory,
    router,
    handleResetFilters,
  ])

  return (
    <div className="space-y-6">
      {/* Barra de busca e filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Buscar nós..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Buscar nós"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleFilters}
            className="md:w-auto w-full"
            aria-expanded={showFilters}
            aria-controls="filters-panel"
          >
            <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
            Filtros
          </Button>
          <Button variant="outline" asChild className="md:w-auto w-full">
            <Link href="/marketplace/categories" aria-label="Gerenciar categorias personalizadas">
              <FolderPlus className="h-4 w-4 mr-2" aria-hidden="true" />
              Categorias
            </Link>
          </Button>
        </div>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div id="filters-panel">
          <NodeFilters
            categories={Array.from(new Set(marketplaceNodes.map((node) => node.category)))}
            tags={Array.from(new Set(marketplaceNodes.flatMap((node) => node.tags || [])))}
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            onCategoryChange={setSelectedCategory}
            onTagsChange={setSelectedTags}
            onReset={handleResetFilters}
            selectedCategoryType={selectedCategoryType}
            onCategoryTypeChange={handleCategoryTypeChange}
            selectedCustomCategory={selectedCustomCategory}
            onCustomCategoryChange={setSelectedCustomCategory}
          />
        </div>
      )}

      {/* Tabs de navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Populares</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <Star className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Em Alta</span>
          </TabsTrigger>
          <TabsTrigger value="newest" className="flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Recentes</span>
          </TabsTrigger>
          <TabsTrigger value="top-rated" className="flex items-center gap-2">
            <Star className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Melhor Avaliados</span>
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das tabs (igual para todas, só muda a ordenação) */}
        <TabsContent value="popular" className="m-0">
          {renderNodeGrid}
        </TabsContent>
        <TabsContent value="trending" className="m-0">
          {renderNodeGrid}
        </TabsContent>
        <TabsContent value="newest" className="m-0">
          {renderNodeGrid}
        </TabsContent>
        <TabsContent value="top-rated" className="m-0">
          {renderNodeGrid}
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalhes do nó */}
      {selectedNode && (
        <NodeDetailsDialog
          node={selectedNode}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onInstall={() => handleInstall(selectedNode)}
          customCategories={customCategories}
          nodeCategories={getNodeCategories(selectedNode.id)}
          onAddToCategory={(categoryId) => addNodeToCategory(categoryId, selectedNode.id)}
          onRemoveFromCategory={(categoryId) => removeNodeFromCategory(categoryId, selectedNode.id)}
        />
      )}
    </div>
  )
}

// Componente de grid para exibir os nós
interface NodeGridProps {
  nodes: MarketplaceNode[]
  isLoading: boolean
  error: string | null
  onNodeClick: (node: MarketplaceNode) => void
  customCategories: any[]
  getNodeCategories: (nodeId: string) => any[]
  onAddToCategory: (categoryId: string, nodeId: string) => Promise<boolean>
  onRemoveFromCategory: (categoryId: string, nodeId: string) => Promise<boolean>
  onRetry: () => void
  onClearFilters: () => void
}

/**
 * Componente de grid para exibir os nós do marketplace.
 */
function NodeGrid({
  nodes,
  isLoading,
  error,
  onNodeClick,
  customCategories,
  getNodeCategories,
  onAddToCategory,
  onRemoveFromCategory,
  onRetry,
  onClearFilters,
}: NodeGridProps) {
  // Renderização de estado de carregamento
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        aria-busy="true"
        aria-label="Carregando nós do marketplace"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" role="status" aria-label="Carregando..." />
        ))}
      </div>
    )
  }

  // Renderização de estado de erro
  if (error) {
    return (
      <div className="text-center py-12" role="alert">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  // Renderização de estado vazio
  if (nodes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Nenhum nó encontrado com os filtros atuais.</p>
        <Button variant="outline" onClick={onClearFilters}>
          Limpar filtros
        </Button>
      </div>
    )
  }

  // Renderização do grid de nós
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      role="list"
      aria-label="Nós do marketplace"
    >
      {nodes.map((node) => (
        <NodeCard
          key={node.id}
          node={node}
          onClick={() => onNodeClick(node)}
          customCategories={customCategories}
          nodeCategories={getNodeCategories(node.id)}
          onAddToCategory={(categoryId) => onAddToCategory(categoryId, node.id)}
          onRemoveFromCategory={(categoryId) => onRemoveFromCategory(categoryId, node.id)}
        />
      ))}
    </div>
  )
}
