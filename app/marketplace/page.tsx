"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useMarketplace } from "@/context/marketplace-context"
import { MarketplaceStats } from "@/components/marketplace/marketplace-stats"
import { MarketplaceTemplateCard } from "@/components/marketplace/marketplace-template-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight, Star, Clock, Download, Zap } from "lucide-react"

/**
 * Página inicial do marketplace de templates.
 * Exibe uma visão geral do marketplace com templates destacados, categorias populares,
 * templates mais baixados e templates recentes.
 */
export default function MarketplaceHomePage() {
  const router = useRouter()
  const { featuredTemplates, popularTemplates, recentTemplates, isLoading, setFilters } = useMarketplace()

  /**
   * Manipula o envio do formulário de busca.
   * Aplica o filtro de busca e navega para a página de templates.
   *
   * @param e - Evento de envio do formulário
   */
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get("search") as string

    if (search) {
      setFilters({ search })
      router.push("/marketplace/templates")
    }
  }

  /**
   * Navega para a página de templates.
   */
  const navigateToTemplates = () => {
    router.push("/marketplace/templates")
  }

  /**
   * Navega para a página de templates filtrada por categoria.
   *
   * @param category - Categoria para filtrar
   */
  const navigateToCategory = (category: string) => {
    setFilters({ categories: [category] })
    router.push("/marketplace/templates")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-8">
        {/* Seção de hero */}
        <section
          className="rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 p-8"
          aria-labelledby="marketplace-heading"
        >
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold" id="marketplace-heading">
              Marketplace de Templates
            </h1>
            <p className="text-xl text-muted-foreground">
              Descubra, compartilhe e use templates de workflow criados pela comunidade
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="relative max-w-xl mx-auto mt-6"
              role="search"
              aria-label="Buscar templates"
            >
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input
                name="search"
                placeholder="Buscar templates..."
                className="pl-10 h-12 text-base"
                aria-label="Termo de busca"
              />
              <Button type="submit" className="absolute right-1 top-1 h-10">
                Buscar
              </Button>
            </form>
          </div>
        </section>

        {/* Seção de estatísticas */}
        <MarketplaceStats />

        {/* Templates destacados */}
        <section className="space-y-4" aria-labelledby="featured-templates-heading">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" id="featured-templates-heading">
              Templates Destacados
            </h2>
            <Button
              variant="ghost"
              onClick={navigateToTemplates}
              className="flex items-center gap-1"
              aria-label="Ver todos os templates"
            >
              Ver todos <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-label="Lista de templates destacados"
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-lg bg-muted animate-pulse"
                    role="status"
                    aria-label="Carregando template"
                  />
                ))
              : featuredTemplates
                  .slice(0, 3)
                  .map((template) => <MarketplaceTemplateCard key={template.id} template={template} featured />)}
          </div>
        </section>

        {/* Categorias populares */}
        <section className="space-y-4" aria-labelledby="popular-categories-heading">
          <h2 className="text-2xl font-bold" id="popular-categories-heading">
            Categorias Populares
          </h2>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            role="navigation"
            aria-label="Categorias populares"
          >
            {[
              {
                id: "data-processing",
                name: "Processamento de Dados",
                icon: <Zap className="h-5 w-5" aria-hidden="true" />,
                color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
              },
              {
                id: "api-integration",
                name: "Integração de API",
                icon: <ArrowRight className="h-5 w-5" aria-hidden="true" />,
                color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
              },
              {
                id: "automation",
                name: "Automação",
                icon: <Clock className="h-5 w-5" aria-hidden="true" />,
                color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
              },
              {
                id: "custom",
                name: "Personalizado",
                icon: <Star className="h-5 w-5" aria-hidden="true" />,
                color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
              },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => navigateToCategory(category.id)}
                className={`flex items-center gap-3 p-4 rounded-lg ${category.color} hover:opacity-90 transition-opacity`}
                aria-label={`Ver templates da categoria ${category.name}`}
              >
                <div className="p-2 bg-white bg-opacity-30 rounded-md">{category.icon}</div>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Templates populares */}
        <section className="space-y-4" aria-labelledby="most-downloaded-heading">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2" id="most-downloaded-heading">
              <Download className="h-5 w-5" aria-hidden="true" />
              Mais Baixados
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setFilters({ sortBy: "downloads" })
                navigateToTemplates()
              }}
              className="flex items-center gap-1"
              aria-label="Ver todos os templates mais baixados"
            >
              Ver todos <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-label="Lista de templates mais baixados"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-lg bg-muted animate-pulse"
                    role="status"
                    aria-label="Carregando template"
                  />
                ))
              : popularTemplates.map((template) => <MarketplaceTemplateCard key={template.id} template={template} />)}
          </div>
        </section>

        {/* Templates recentes */}
        <section className="space-y-4" aria-labelledby="recently-added-heading">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2" id="recently-added-heading">
              <Clock className="h-5 w-5" aria-hidden="true" />
              Adicionados Recentemente
            </h2>
            <Button
              variant="ghost"
              onClick={() => {
                setFilters({ sortBy: "recent" })
                navigateToTemplates()
              }}
              className="flex items-center gap-1"
              aria-label="Ver todos os templates recentes"
            >
              Ver todos <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-label="Lista de templates recentes"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-lg bg-muted animate-pulse"
                    role="status"
                    aria-label="Carregando template"
                  />
                ))
              : recentTemplates.map((template) => <MarketplaceTemplateCard key={template.id} template={template} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
