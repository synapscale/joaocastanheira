"use client"

import React from "react"
import { useState, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Download,
  Star,
  Eye,
  Heart,
  Share2,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Package,
  Zap,
  Award,
  Verified,
  Play,
  Code2,
  GitBranch,
  Database,
  Brain,
  Upload,
  RefreshCw,
} from "lucide-react"
import { SKILL_CATEGORIES } from "@/config/node-system-config"
import { CategoryFilter } from "@/components/marketplace/category-filter"
import { SearchBar } from "@/components/ui/search-bar"
import { cn } from "@/lib/utils"

interface MarketplaceItem {
  id: string
  type: "skill" | "node" | "collection"
  name: string
  description: string
  category: string
  author: {
    id: string
    name: string
    avatar?: string
    verified: boolean
    reputation: number
  }
  stats: {
    downloads: number
    stars: number
    views: number
    likes: number
    forks: number
  }
  version: string
  tags: string[]
  createdAt: string
  updatedAt: string
  featured: boolean
  verified: boolean
  price: {
    type: "free" | "paid" | "freemium"
    amount?: number
    currency?: string
  }
  preview?: {
    image?: string
    demo?: string
  }
  complexity: "beginner" | "intermediate" | "advanced"
  compatibility: string[]
  license: string
}

interface FilterState {
  search: string
  category: string | null
  type: "all" | "skill" | "node" | "collection"
  pricing: "all" | "free" | "paid" | "freemium"
  complexity: "all" | "beginner" | "intermediate" | "advanced"
  verified: boolean | null
  featured: boolean | null
  sortBy: "relevance" | "downloads" | "stars" | "newest" | "updated" | "trending"
  sortOrder: "asc" | "desc"
}

/**
 * Hook para gerenciar filtros do marketplace
 * Encapsula toda lógica de filtragem e ordenação
 */
function useMarketplaceFilters(items: MarketplaceItem[]) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: null,
    type: "all",
    pricing: "all",
    complexity: "all",
    verified: null,
    featured: null,
    sortBy: "relevance",
    sortOrder: "desc",
  })

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const filteredItems = useMemo(() => {
    let filtered = [...items]

    // Filtro de busca
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          item.tags.some((tag) => tag.toLowerCase().includes(search)) ||
          item.author.name.toLowerCase().includes(search),
      )
    }

    // Filtro de categoria
    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category)
    }

    // Filtro de tipo
    if (filters.type !== "all") {
      filtered = filtered.filter((item) => item.type === filters.type)
    }

    // Filtro de preço
    if (filters.pricing !== "all") {
      filtered = filtered.filter((item) => item.price.type === filters.pricing)
    }

    // Filtro de complexidade
    if (filters.complexity !== "all") {
      filtered = filtered.filter((item) => item.complexity === filters.complexity)
    }

    // Filtro de verificado
    if (filters.verified !== null) {
      filtered = filtered.filter((item) => item.verified === filters.verified)
    }

    // Filtro de destaque
    if (filters.featured !== null) {
      filtered = filtered.filter((item) => item.featured === filters.featured)
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "downloads":
          comparison = a.stats.downloads - b.stats.downloads
          break
        case "stars":
          comparison = a.stats.stars - b.stats.stars
          break
        case "newest":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "updated":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case "trending":
          // Algoritmo simples de trending baseado em atividade recente
          const aScore = a.stats.downloads * 0.3 + a.stats.stars * 0.5 + a.stats.views * 0.2
          const bScore = b.stats.downloads * 0.3 + b.stats.stars * 0.5 + b.stats.views * 0.2
          comparison = aScore - bScore
          break
        default: // relevance
          comparison = a.stats.downloads + a.stats.stars - (b.stats.downloads + b.stats.stars)
      }

      return filters.sortOrder === "desc" ? -comparison : comparison
    })

    return filtered
  }, [items, filters])

  return { filteredItems, updateFilter, filters }
}

/**
 * ADVANCED MARKETPLACE BROWSER
 *
 * Interface completa para navegar, filtrar e instalar items do marketplace
 * Suporta busca avançada, múltiplas visualizações e detalhes completos
 *
 * AI-Friendly Features:
 * - Filtros tipados e bem estruturados
 * - Estado de UI separado da lógica de negócio
 * - Componentes reutilizáveis e modulares
 * - Performance otimizada com memoização
 */
export function AdvancedMarketplaceBrowser() {
  const router = useRouter()
  const { toast } = useToast()

  // Estados principais
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Mock data baseado nas skills do n8n
  const mockItems: MarketplaceItem[] = useMemo(
    () => [
      {
        id: "http-request-skill",
        type: "skill",
        name: "HTTP Request Advanced",
        description: "Skill avançada para requisições HTTP com retry, cache e autenticação automática",
        category: "data-input",
        author: {
          id: "user1",
          name: "API Master",
          verified: true,
          reputation: 4.8,
        },
        stats: {
          downloads: 15420,
          stars: 892,
          views: 45230,
          likes: 1205,
          forks: 234,
        },
        version: "2.1.0",
        tags: ["http", "api", "rest", "authentication", "retry"],
        createdAt: "2024-01-15",
        updatedAt: "2024-03-10",
        featured: true,
        verified: true,
        price: { type: "free" },
        complexity: "intermediate",
        compatibility: ["v1.0+"],
        license: "MIT",
      },
      {
        id: "ai-text-processor",
        type: "skill",
        name: "AI Text Processor",
        description: "Processamento avançado de texto com IA: análise de sentimento, extração de entidades, resumos",
        category: "ai",
        author: {
          id: "user2",
          name: "AI Innovator",
          verified: true,
          reputation: 4.9,
        },
        stats: {
          downloads: 8930,
          stars: 567,
          views: 23450,
          likes: 789,
          forks: 123,
        },
        version: "1.5.2",
        tags: ["ai", "nlp", "sentiment", "entities", "openai"],
        createdAt: "2024-02-20",
        updatedAt: "2024-03-15",
        featured: true,
        verified: true,
        price: { type: "freemium" },
        complexity: "advanced",
        compatibility: ["v1.2+"],
        license: "Apache-2.0",
      },
      {
        id: "data-transformer-pro",
        type: "node",
        name: "Data Transformer Pro",
        description: "Node completo para transformação de dados com múltiplas skills integradas",
        category: "data-transformation",
        author: {
          id: "user3",
          name: "Data Wizard",
          verified: false,
          reputation: 4.6,
        },
        stats: {
          downloads: 5670,
          stars: 234,
          views: 12890,
          likes: 345,
          forks: 67,
        },
        version: "3.0.1",
        tags: ["transformation", "mapping", "filtering", "validation"],
        createdAt: "2024-01-30",
        updatedAt: "2024-03-08",
        featured: false,
        verified: false,
        price: { type: "paid", amount: 9.99, currency: "USD" },
        complexity: "intermediate",
        compatibility: ["v1.0+"],
        license: "Commercial",
      },
      {
        id: "workflow-automation-collection",
        type: "collection",
        name: "Workflow Automation Essentials",
        description: "Coleção completa de skills para automação de workflows empresariais",
        category: "control-flow",
        author: {
          id: "user4",
          name: "Automation Expert",
          verified: true,
          reputation: 4.7,
        },
        stats: {
          downloads: 12340,
          stars: 678,
          views: 34560,
          likes: 890,
          forks: 156,
        },
        version: "2.3.0",
        tags: ["automation", "workflow", "enterprise", "collection"],
        createdAt: "2024-01-10",
        updatedAt: "2024-03-12",
        featured: true,
        verified: true,
        price: { type: "free" },
        complexity: "beginner",
        compatibility: ["v1.0+"],
        license: "MIT",
      },
    ],
    [],
  )

  const { filteredItems, updateFilter, filters } = useMarketplaceFilters(mockItems)

  // Categorias para filtro
  const categories = useMemo(() => {
    const categoryMap = new Map()

    Object.entries(SKILL_CATEGORIES).forEach(([key, category]) => {
      const count = mockItems.filter((item) => item.category === key).length
      categoryMap.set(key, {
        id: key,
        name: category.name,
        count,
      })
    })

    return Array.from(categoryMap.values())
  }, [mockItems])

  // Handlers
  const handleItemClick = useCallback((item: MarketplaceItem) => {
    setSelectedItem(item)
    setShowDetails(true)
  }, [])

  const handleInstall = useCallback(
    async (item: MarketplaceItem) => {
      try {
        // Simular instalação
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
          title: "Instalado com sucesso!",
          description: `${item.name} foi adicionado à sua biblioteca`,
        })
      } catch (error) {
        toast({
          title: "Erro na instalação",
          description: "Não foi possível instalar o item",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handlePreview = useCallback(
    (item: MarketplaceItem) => {
      // Abrir preview em modal ou nova aba
      toast({
        title: "Preview",
        description: `Abrindo preview de ${item.name}`,
      })
    },
    [toast],
  )

  // Ícones por categoria
  const getCategoryIcon = (category: string) => {
    const icons = {
      "data-input": Download,
      "data-transformation": RefreshCw,
      "control-flow": GitBranch,
      ai: Brain,
      "data-output": Upload,
    }
    return icons[category as keyof typeof icons] || Package
  }

  // Ícones por tipo
  const getTypeIcon = (type: string) => {
    const icons = {
      skill: Zap,
      node: Package,
      collection: Database,
    }
    return icons[type as keyof typeof icons] || Package
  }

  const MarketplaceItemCard = memo(
    ({
      item,
      viewMode,
      onItemClick,
      onInstall,
      onPreview,
    }: {
      item: MarketplaceItem
      viewMode: "grid" | "list"
      onItemClick: (item: MarketplaceItem) => void
      onInstall: (item: MarketplaceItem) => Promise<void>
      onPreview: (item: MarketplaceItem) => void
    }) => {
      const CategoryIcon = getCategoryIcon(item.category)
      const TypeIcon = getTypeIcon(item.type)

      if (viewMode === "list") {
        return (
          <Card
            key={item.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onItemClick(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {item.name}
                        {item.verified && <Verified className="w-4 h-4 text-blue-500" />}
                        {item.featured && <Award className="w-4 h-4 text-yellow-500" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CategoryIcon className="w-3 h-3" />
                        {SKILL_CATEGORIES[item.category as keyof typeof SKILL_CATEGORIES]?.name}
                      </Badge>
                      <Badge variant={item.price.type === "free" ? "secondary" : "default"}>
                        {item.price.type === "free"
                          ? "Gratuito"
                          : item.price.type === "paid"
                            ? `$${item.price.amount}`
                            : "Freemium"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{item.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{item.stats.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{item.stats.stars.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.stats.views.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPreview(item)
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onInstall(item)
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Instalar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }

      // Grid view
      return (
        <Card
          key={item.id}
          className="hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => onItemClick(item)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <TypeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-1">
                    {item.name}
                    {item.verified && <Verified className="w-3 h-3 text-blue-500" />}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">v{item.version}</p>
                </div>
              </div>
              {item.featured && <Award className="w-4 h-4 text-yellow-500" />}
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              <Badge variant="outline" className="text-xs">
                <CategoryIcon className="w-3 h-3 mr-1" />
                {SKILL_CATEGORIES[item.category as keyof typeof SKILL_CATEGORIES]?.name}
              </Badge>
              <Badge variant={item.price.type === "free" ? "secondary" : "default"} className="text-xs">
                {item.price.type === "free"
                  ? "Gratuito"
                  : item.price.type === "paid"
                    ? `$${item.price.amount}`
                    : "Freemium"}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>
                  {item.stats.downloads > 1000 ? `${Math.round(item.stats.downloads / 1000)}k` : item.stats.downloads}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>{item.stats.stars > 1000 ? `${Math.round(item.stats.stars / 1000)}k` : item.stats.stars}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{item.stats.likes > 1000 ? `${Math.round(item.stats.likes / 1000)}k` : item.stats.likes}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-xs">{item.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">{item.author.name}</span>
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview(item)
                }}
              >
                <Play className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onInstall(item)
                }}
              >
                <Download className="w-3 h-3 mr-1" />
                Instalar
              </Button>
            </div>
          </CardFooter>
        </Card>
      )
    },
  )

  // Renderizar item do marketplace
  const renderMarketplaceItem = (item: MarketplaceItem) => {
    return (
      <MarketplaceItemCard
        key={item.id}
        item={item}
        viewMode={viewMode}
        onItemClick={handleItemClick}
        onInstall={handleInstall}
        onPreview={handlePreview}
      />
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/skills/create")}>
              <Code2 className="w-4 h-4 mr-2" />
              Criar Skill
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <SearchBar
            value={filters.search}
            onChange={(value) => updateFilter("search", value)}
            placeholder="Buscar skills, nodes, coleções..."
            showFilterButton
            size="lg"
          />

          <div className="flex flex-wrap items-center gap-4">
            {/* Tabs de tipo */}
            <Tabs value={filters.type} onValueChange={(value) => updateFilter("type", value)}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="skill">Skills</TabsTrigger>
                <TabsTrigger value="node">Nodes</TabsTrigger>
                <TabsTrigger value="collection">Coleções</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filtros rápidos */}
            <div className="flex items-center gap-2">
              <Select value={filters.pricing} onValueChange={(value) => updateFilter("pricing", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.complexity} onValueChange={(value) => updateFilter("complexity", value)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Complexidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevância</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                  <SelectItem value="stars">Estrelas</SelectItem>
                  <SelectItem value="newest">Mais novos</SelectItem>
                  <SelectItem value="updated">Atualizados</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
              >
                {filters.sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>

              <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={filters.category}
            onSelectCategory={(category) => updateFilter("category", category)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? "resultado" : "resultados"} encontrados
          </p>

          {/* Filtros ativos */}
          <div className="flex items-center gap-2">
            {filters.verified && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Verified className="w-3 h-3" />
                Verificados
                <button onClick={() => updateFilter("verified", null)} className="ml-1">
                  ×
                </button>
              </Badge>
            )}
            {filters.featured && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                Destacados
                <button onClick={() => updateFilter("featured", null)} className="ml-1">
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Items Grid/List */}
        <div
          className={cn(
            "gap-4",
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4",
          )}
        >
          {filteredItems.map(renderMarketplaceItem)}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground mb-4">Tente ajustar seus filtros ou termos de busca</p>
            <Button variant="outline" onClick={() => updateFilter("search", "")}>
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {React.createElement(getTypeIcon(selectedItem.type), { className: "w-8 h-8 text-white" })}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl flex items-center gap-2">
                      {selectedItem.name}
                      {selectedItem.verified && <Verified className="w-5 h-5 text-blue-500" />}
                      {selectedItem.featured && <Award className="w-5 h-5 text-yellow-500" />}
                    </DialogTitle>
                    <DialogDescription className="text-base mt-1">{selectedItem.description}</DialogDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>v{selectedItem.version}</span>
                      <span>•</span>
                      <span>Por {selectedItem.author.name}</span>
                      <span>•</span>
                      <span>{selectedItem.license}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Download className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <div className="font-semibold">{selectedItem.stats.downloads.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Downloads</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                      <div className="font-semibold">{selectedItem.stats.stars.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Estrelas</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Eye className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <div className="font-semibold">{selectedItem.stats.views.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Visualizações</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
                      <div className="font-semibold">{selectedItem.stats.likes.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Curtidas</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Compatibilidade */}
                  <div>
                    <h3 className="font-semibold mb-2">Compatibilidade</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.compatibility.map((version) => (
                        <Badge key={version} variant="secondary">
                          {version}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Autor */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarFallback>{selectedItem.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold flex items-center gap-1">
                            {selectedItem.author.name}
                            {selectedItem.author.verified && <Verified className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {selectedItem.author.reputation} reputação
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver perfil
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Preço */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Preço</h3>
                      <div className="text-2xl font-bold">
                        {selectedItem.price.type === "free"
                          ? "Gratuito"
                          : selectedItem.price.type === "paid"
                            ? `$${selectedItem.price.amount}`
                            : "Freemium"}
                      </div>
                      {selectedItem.price.type === "freemium" && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Versão básica gratuita, recursos avançados pagos
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Complexidade */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Complexidade</h3>
                      <Badge
                        variant={
                          selectedItem.complexity === "beginner"
                            ? "secondary"
                            : selectedItem.complexity === "intermediate"
                              ? "default"
                              : "destructive"
                        }
                      >
                        {selectedItem.complexity === "beginner"
                          ? "Iniciante"
                          : selectedItem.complexity === "intermediate"
                            ? "Intermediário"
                            : "Avançado"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
                <Button variant="outline" onClick={() => handlePreview(selectedItem)}>
                  <Play className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={() => handleInstall(selectedItem)}>
                  <Download className="w-4 h-4 mr-2" />
                  Instalar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
