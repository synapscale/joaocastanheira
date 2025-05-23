"use client"

import { useState, useEffect } from "react"
import { useMarketplace } from "@/context/marketplace-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"

/**
 * Componente que exibe e gerencia filtros para o marketplace de templates.
 * Permite filtrar por categoria, tag, classificação e tipo de preço.
 */
export function MarketplaceFilters() {
  const { filters, setFilters, stats } = useMarketplace()

  // Estados locais para os filtros
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.categories)
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags)
  const [selectedRating, setSelectedRating] = useState<number | null>(filters.rating)
  const [selectedPricing, setSelectedPricing] = useState<string[]>(filters.pricing)

  /**
   * Aplica os filtros selecionados.
   * Atualiza o estado global de filtros com os valores locais.
   */
  const applyFilters = () => {
    setFilters({
      categories: selectedCategories,
      tags: selectedTags,
      rating: selectedRating,
      pricing: selectedPricing as ("free" | "paid" | "subscription")[],
    })
  }

  /**
   * Reseta todos os filtros para seus valores padrão.
   * Atualiza tanto os estados locais quanto o estado global.
   */
  const resetFilters = () => {
    // Resetar estados locais
    setSelectedCategories([])
    setSelectedTags([])
    setSelectedRating(null)
    setSelectedPricing([])

    // Resetar estado global
    setFilters({
      categories: [],
      tags: [],
      rating: null,
      pricing: [],
    })
  }

  /**
   * Alterna a seleção de uma categoria.
   * @param category - Categoria a ser alternada
   */
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  /**
   * Alterna a seleção de uma tag.
   * @param tag - Tag a ser alternada
   */
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  /**
   * Alterna a seleção de um tipo de preço.
   * @param pricing - Tipo de preço a ser alternado
   */
  const togglePricing = (pricing: string) => {
    setSelectedPricing((prev) => (prev.includes(pricing) ? prev.filter((p) => p !== pricing) : [...prev, pricing]))
  }

  // Atualiza os estados locais quando os filtros globais mudam
  useEffect(() => {
    setSelectedCategories(filters.categories)
    setSelectedTags(filters.tags)
    setSelectedRating(filters.rating)
    setSelectedPricing(filters.pricing)
  }, [filters])

  return (
    <Card className="p-4" role="region" aria-label="Filtros de busca">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Filtros</h3>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Resetar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Categorias */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium" id="category-filter-heading">
              Categorias
            </h4>
            <div className="space-y-1" role="group" aria-labelledby="category-filter-heading">
              {stats?.popularCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                    aria-label={`Categoria ${category.name}`}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm flex items-center justify-between w-full"
                  >
                    <span>{category.name}</span>
                    <span className="text-muted-foreground text-xs">({category.count})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium" id="tag-filter-heading">
              Tags Populares
            </h4>
            <div className="flex flex-wrap gap-1" role="group" aria-labelledby="tag-filter-heading">
              {stats?.popularTags.map((tag) => (
                <Badge
                  key={tag.name}
                  variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.name)}
                  aria-pressed={selectedTags.includes(tag.name)}
                >
                  {tag.name}
                  {selectedTags.includes(tag.name) && <X className="h-3 w-3 ml-1" aria-hidden="true" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Classificação */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium" id="rating-filter-heading">
              Classificação Mínima
            </h4>
            <div className="px-2" role="group" aria-labelledby="rating-filter-heading">
              <Slider
                defaultValue={[selectedRating || 0]}
                max={5}
                step={1}
                onValueChange={(value) => setSelectedRating(value[0] || null)}
                aria-label="Selecionar classificação mínima"
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={selectedRating || 0}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Qualquer</span>
                <span>5 Estrelas</span>
              </div>
            </div>
            {selectedRating !== null && selectedRating > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">{selectedRating}+ estrelas</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRating(null)}
                  className="h-6 px-2"
                  aria-label="Remover filtro de classificação"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium" id="pricing-filter-heading">
              Preço
            </h4>
            <div className="space-y-1" role="group" aria-labelledby="pricing-filter-heading">
              {[
                { id: "free", label: "Gratuito" },
                { id: "paid", label: "Pago" },
                { id: "subscription", label: "Assinatura" },
              ].map((pricing) => (
                <div key={pricing.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pricing-${pricing.id}`}
                    checked={selectedPricing.includes(pricing.id)}
                    onCheckedChange={() => togglePricing(pricing.id)}
                    aria-label={`Preço: ${pricing.label}`}
                  />
                  <label htmlFor={`pricing-${pricing.id}`} className="text-sm">
                    {pricing.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={applyFilters}>Aplicar Filtros</Button>
        </div>
      </div>
    </Card>
  )
}
