"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMarketplace } from "@/context/marketplace-context"
import { MarketplaceTemplateList } from "@/components/marketplace/marketplace-template-list"
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters"
import { MarketplaceStats } from "@/components/marketplace/marketplace-stats"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, SlidersHorizontal } from "lucide-react"

/**
 * Página de listagem de templates do marketplace.
 * Exibe templates com opções de busca, filtragem e ordenação.
 */
export default function MarketplacePage() {
  const { templates, isLoading, error, filters, setFilters, fetchTemplates } = useMarketplace()

  // Estados locais
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  /**
   * Manipula a mudança no campo de busca.
   * @param e - Evento de mudança do input
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  /**
   * Manipula o envio do formulário de busca.
   * @param e - Evento de envio do formulário
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ search: searchQuery })
  }

  /**
   * Manipula a mudança de aba de ordenação.
   * @param value - Valor da aba selecionada
   */
  const handleTabChange = (value: string) => {
    setFilters({ sortBy: value as "popular" | "recent" | "rating" | "downloads" })
  }

  /**
   * Alterna a visibilidade dos filtros avançados.
   */
  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  /**
   * Reseta todos os filtros aplicados.
   */
  const resetFilters = () => {
    setFilters({
      search: "",
      categories: [],
      tags: [],
      rating: null,
      pricing: [],
    })
    setSearchQuery("")
  }

  // Inicializa o campo de busca com o valor do filtro atual
  useEffect(() => {
    setSearchQuery(filters.search)
  }, [filters.search])

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Marketplace de Templates</h1>
          <p className="text-muted-foreground">Descubra e instale templates de workflow criados pela comunidade</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative" role="search" aria-label="Buscar templates">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
              aria-label="Termo de busca"
            />
          </form>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={toggleFilters}
              aria-expanded={showFilters}
              className="flex items-center gap-2"
              aria-controls="advanced-filters"
              aria-label="Mostrar filtros avançados"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>Filtros</span>
            </Button>
            {(filters.categories.length > 0 ||
              filters.tags.length > 0 ||
              filters.rating !== null ||
              filters.pricing.length > 0) && (
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="flex items-center gap-2"
                aria-label="Limpar todos os filtros"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div id="advanced-filters">
            <MarketplaceFilters />
          </div>
        )}

        <MarketplaceStats />

        <Tabs
          defaultValue={filters.sortBy}
          onValueChange={handleTabChange}
          className="space-y-4"
          aria-label="Ordenar templates"
        >
          <TabsList>
            <TabsTrigger value="popular">Populares</TabsTrigger>
            <TabsTrigger value="recent">Recentes</TabsTrigger>
            <TabsTrigger value="rating">Melhor Avaliados</TabsTrigger>
            <TabsTrigger value="downloads">Mais Baixados</TabsTrigger>
          </TabsList>

          <TabsContent value={filters.sortBy} className="space-y-4">
            <MarketplaceTemplateList
              templates={templates}
              isLoading={isLoading}
              error={error}
              onRetry={fetchTemplates}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
