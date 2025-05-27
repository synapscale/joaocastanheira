"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Download, ArrowRight, Clock, CheckCircle } from "lucide-react"
import type { MarketplaceTemplate } from "@/types/marketplace-template"

/**
 * Props para o componente MarketplaceTemplateCard.
 */
interface MarketplaceTemplateCardProps {
  /** Template a ser exibido no card */
  template: MarketplaceTemplate
  /** Indica se o template é destacado */
  featured?: boolean
}

/**
 * Componente que exibe um card de template do marketplace.
 * Mostra informações resumidas sobre o template e permite navegar para a página de detalhes.
 *
 * @param props - Propriedades do componente
 * @param props.template - Template a ser exibido
 * @param props.featured - Indica se o template é destacado (altera o estilo visual)
 */
export function MarketplaceTemplateCard({ template, featured = false }: MarketplaceTemplateCardProps) {
  const router = useRouter()

  /**
   * Formata uma data para exibição relativa ou absoluta.
   * @param dateString - String de data ISO
   * @returns Data formatada para exibição
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} dias atrás`
    } else {
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    }
  }

  /**
   * Navega para a página de detalhes do template.
   */
  const navigateToDetail = () => {
    router.push(`/marketplace/templates/${template.id}`)
  }

  return (
    <Card
      className={`overflow-hidden flex flex-col h-full transition-all hover:shadow-md ${
        featured ? "border-primary/50 bg-primary/5" : ""
      }`}
    >
      <CardHeader className="p-4 pb-0 flex-row justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {template.verified && <CheckCircle className="h-4 w-4 text-primary" aria-label="Template verificado" />}
            <h3 className="font-medium text-base leading-none">{template.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={template.author.avatarUrl || "/placeholder.svg"} alt={template.author.displayName} />
              <AvatarFallback>{template.author.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{template.author.displayName}</span>
          </div>
        </div>

        {template.pricing?.type !== "free" && (
          <Badge variant={template.pricing?.type === "paid" ? "default" : "secondary"}>
            {template.pricing?.type === "paid" ? `$${template.pricing.price}` : "Assinatura"}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 flex-grow">
        <p className="text-sm line-clamp-3">{template.description}</p>

        <div className="flex flex-wrap gap-1 mt-3">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full text-sm">
          <div className="flex items-center gap-1" title={`Classificação: ${template.rating.toFixed(1)} de 5`}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span>{template.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground" title={`${template.downloads} downloads`}>
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{template.downloads.toLocaleString()}</span>
          </div>

          <div
            className="flex items-center gap-1 text-muted-foreground"
            title={`Publicado em ${new Date(template.publishedAt).toLocaleDateString()}`}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{formatDate(template.publishedAt)}</span>
          </div>
        </div>

        <Button
          onClick={navigateToDetail}
          className="w-full"
          variant={featured ? "default" : "outline"}
          aria-label={`Ver detalhes de ${template.name}`}
        >
          Ver Detalhes
          <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  )
}
