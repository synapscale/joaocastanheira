"use client"

import { Button } from "@/components/ui/button"
import { MarketplaceTemplateCard } from "./marketplace-template-card"
import { Search, RefreshCw } from "lucide-react"
import type { MarketplaceTemplate } from "@/types/marketplace-template"

/**
 * Props para o componente MarketplaceTemplateList.
 */
interface MarketplaceTemplateListProps {
  /** Lista de templates a serem exibidos */
  templates: MarketplaceTemplate[]
  /** Indica se está carregando dados */
  isLoading: boolean
  /** Mensagem de erro, se houver */
  error: string | null
  /** Função para tentar novamente em caso de erro */
  onRetry: () => void
}

/**
 * Componente que exibe uma lista de templates do marketplace.
 * Lida com estados de carregamento, erro e lista vazia.
 *
 * @param props - Propriedades do componente
 * @param props.templates - Lista de templates a serem exibidos
 * @param props.isLoading - Indica se está carregando dados
 * @param props.error - Mensagem de erro, se houver
 * @param props.onRetry - Função para tentar novamente em caso de erro
 */
export function MarketplaceTemplateList({ templates, isLoading, error, onRetry }: MarketplaceTemplateListProps) {
  // Estado de carregamento
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        aria-busy="true"
        aria-label="Carregando templates"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-lg bg-muted animate-pulse"
            role="status"
            aria-label="Carregando template"
          />
        ))}
      </div>
    )
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center" role="alert" aria-live="assertive">
        <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
          <RefreshCw className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-medium mb-2">Falha ao carregar templates</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={onRetry}>Tentar Novamente</Button>
      </div>
    )
  }

  // Estado de lista vazia
  if (templates.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        role="status"
        aria-label="Nenhum template encontrado"
      >
        <div className="rounded-full bg-muted p-3 mb-4">
          <Search className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-medium mb-2">Nenhum template encontrado</h3>
        <p className="text-muted-foreground">Tente ajustar seus filtros ou termos de busca</p>
      </div>
    )
  }

  // Lista de templates
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-label={`Lista de templates: ${templates.length} encontrados`}
    >
      {templates.map((template) => (
        <MarketplaceTemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}
