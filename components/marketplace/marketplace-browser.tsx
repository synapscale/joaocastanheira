"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MarketplaceService } from "@/services/marketplace-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, Grid, List, SlidersHorizontal } from "lucide-react"
import { MarketplaceItemCard } from "./marketplace-item-card"
import { ResponsiveGrid } from "../ui/responsive-grid"
import { CardSkeleton } from "../ui/skeletons/card-skeleton"
import { PaginationControls } from "../ui/pagination-controls"
import { useMarketplace } from "@/hooks/use-marketplace"
import { usePagination } from "@/hooks/use-pagination"
import { useDebounce } from "@/hooks/use-debounce"
import type { MarketplaceItem } from "@/types/marketplace-types"
import { cn } from "@/lib/utils"

interface MarketplaceBrowserProps {
  className?: string
}

export function MarketplaceBrowser({ className }: MarketplaceBrowserProps) {
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevancia")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const debouncedSearch = useDebounce(searchValue, 300)

  // Hooks
  const { importItem } = useMarketplace()

  // Responsive items per page
  const [windowWidth, setWindowWidth] = useState(1200)
  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth)
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const responsiveItemsPerPage = useMemo(() => {
    const isMobile = windowWidth < 640
    const isTablet = windowWidth < 1024

    if (viewMode === "list") {
      return isMobile ? 5 : isTablet ? 8 : 12
    }
    return isMobile ? 2 : isTablet ? 4 : 6
  }, [windowWidth, viewMode])

  // Pagination
  const pagination = usePagination({
    totalItems: 0,
    itemsPerPage: responsiveItemsPerPage,
    onPageChange: () => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
  })

  // Mock categories for filters
  const categories = [
    { id: "todos", name: "Todos", count: 4 },
    { id: "entrada-dados", name: "Entrada de Dados", count: 1 },
    { id: "transformacao", name: "Transformação", count: 1 },
    { id: "saida-dados", name: "Saída de Dados", count: 0 },
    { id: "controle-fluxo", name: "Controle de Fluxo", count: 1 },
    { id: "inteligencia-artificial", name: "Inteligência Artificial", count: 1 },
    { id: "utilitarios", name: "Utilitários", count: 0 },
  ]

  // Load items
  const loadItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const filters = {
        query: debouncedSearch,
        type: activeTab !== "todos" ? activeTab : undefined,
        categories: selectedCategories,
        sortBy,
        page: pagination.currentPage,
        pageSize: pagination.itemsPerPage,
      }

      const response = await MarketplaceService.searchItems(filters)
      setItems(response.items || [])
      pagination.setTotalItems(response.totalCount || 0)
    } catch (error) {
      console.error("Error loading items:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar itens do marketplace.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, activeTab, selectedCategories, sortBy, pagination, toast])

  // Effects
  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    pagination.reset()
  }, [debouncedSearch, activeTab, selectedCategories, sortBy])

  // Handlers
  const handleImportItem = async (item: MarketplaceItem) => {
    const success = await importItem(item)
    if (success) {
      router.push("/skills")
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const renderSkeletons = () =>
    Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} className={viewMode === "list" ? "h-24" : "h-80"} />)

  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
      <h3 className="text-xl font-semibold mb-2">Nenhum item encontrado</h3>
      <p className="text-muted-foreground mb-4">Tente ajustar sua busca ou filtros.</p>
      <Button
        onClick={() => {
          setSearchValue("")
          setSelectedCategories([])
          setActiveTab("todos")
        }}
      >
        Limpar filtros
      </Button>
    </div>
  )

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="border-b bg-background">
        <div className="p-4 space-y-4">
          {/* Title and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">Descubra e instale skills e nodes</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar skills, nodes, coleções..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs and Filters */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="nodes">Nodes</TabsTrigger>
                <TabsTrigger value="colecoes">Coleções</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filters Row */}
            <div className={cn("flex flex-col sm:flex-row gap-2", showFilters ? "block" : "hidden lg:flex")}>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevancia">Relevância</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                  <SelectItem value="avaliacao">Avaliação</SelectItem>
                  <SelectItem value="recentes">Mais recentes</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 4).map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryToggle(category.id)}
                    className="text-xs"
                  >
                    {category.name}
                    {category.count > 0 && <span className="ml-1 bg-background/20 px-1 rounded">{category.count}</span>}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Results Summary */}
          {!isLoading && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-muted-foreground">{pagination.getSummary()}</p>
            </div>
          )}

          {/* Items Grid/List */}
          {viewMode === "grid" ? (
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md" className="min-h-[400px]">
              {isLoading
                ? renderSkeletons()
                : items.length > 0
                  ? items.map((item) => (
                      <MarketplaceItemCard
                        key={item.id}
                        item={item}
                        onImport={() => handleImportItem(item)}
                        viewMode="grid"
                      />
                    ))
                  : renderEmptyState()}
            </ResponsiveGrid>
          ) : (
            <div className="space-y-3 min-h-[400px]">
              {isLoading
                ? renderSkeletons()
                : items.length > 0
                  ? items.map((item) => (
                      <MarketplaceItemCard
                        key={item.id}
                        item={item}
                        onImport={() => handleImportItem(item)}
                        viewMode="list"
                      />
                    ))
                  : renderEmptyState()}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && items.length > 0 && pagination.totalPages > 1 && (
            <div className="flex justify-center pt-6">
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.goToPage}
                isLoading={isLoading}
                showSummary={false}
                showItemsPerPage
                itemsPerPage={pagination.itemsPerPage}
                itemsPerPageOptions={viewMode === "list" ? [5, 10, 20] : [2, 4, 6, 12]}
                onItemsPerPageChange={pagination.setItemsPerPage}
                maxVisiblePages={windowWidth < 640 ? 3 : 5}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarketplaceBrowser
