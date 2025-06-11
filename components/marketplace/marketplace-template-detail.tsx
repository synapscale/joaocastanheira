"use client"

import { useState } from "react"
import { useMarketplace } from "@/context/marketplace-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Download, Star, Calendar, CheckCircle } from "lucide-react"
import type { MarketplaceTemplate } from "@/types/marketplace-template"

/**
 * Props para o componente MarketplaceTemplateDetail.
 */
interface MarketplaceTemplateDetailProps {
  /** Template a ser exibido em detalhes */
  template: MarketplaceTemplate
}

/**
 * Componente que exibe detalhes completos de um template do marketplace.
 * Mostra informações como descrição, prévia, nós e permite instalar o template.
 *
 * @param props - Propriedades do componente
 * @param props.template - Template a ser exibido
 */
export function MarketplaceTemplateDetail({ template }: MarketplaceTemplateDetailProps) {
  const { installTemplate } = useMarketplace()
  const [isInstalling, setIsInstalling] = useState(false)

  /**
   * Manipula a instalação do template.
   * Atualiza o estado de instalação e chama o método de instalação.
   */
  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      await installTemplate(template.id)
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {template.verified && (
              <CheckCircle
                className="h-5 w-5 text-primary"
                aria-label="Template verificado"
                title="Este template foi verificado pelos administradores"
              />
            )}
            <h2 className="text-2xl font-bold">{template.name}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center" title={`Classificação: ${template.rating.toFixed(1)} de 5 estrelas`}>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" aria-hidden="true" />
              <span className="font-medium">{template.rating.toFixed(1)}</span>
              <span className="text-muted-foreground ml-1">({template.ratingCount})</span>
            </div>

            <div
              className="flex items-center text-muted-foreground"
              title={`${template.downloads.toLocaleString()} downloads`}
            >
              <Download className="h-5 w-5 mr-1" aria-hidden="true" />
              <span>{template.downloads.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={template.author.avatarUrl || "/placeholder.svg"} alt={template.author.displayName} />
            <AvatarFallback>{template.author.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{template.author.displayName}</div>
            <div className="text-xs text-muted-foreground">@{template.author.username}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>{template.category}</Badge>
          {template.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div
            className="flex items-center gap-1"
            title={`Publicado em: ${new Date(template.publishedAt).toLocaleDateString()}`}
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>Publicado: {new Date(template.publishedAt).toLocaleDateString()}</span>
          </div>
          <div
            className="flex items-center gap-1"
            title={`Atualizado em: ${new Date(template.updatedAt).toLocaleDateString()}`}
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>Atualizado: {new Date(template.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-3">Descrição</h3>
        <p className="text-muted-foreground">{template.description}</p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Prévia do Template</h3>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted aspect-video flex items-center justify-center">
              <div className="text-muted-foreground">Prévia do Template</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Nós ({template.nodes.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {template.nodes.map((node) => (
            <Card key={node.id} className="p-3">
              <div className="font-medium">{node.name}</div>
              <div className="text-sm text-muted-foreground">{node.description}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={handleInstall} disabled={isInstalling} size="lg" className="px-8" aria-busy={isInstalling}>
          <Download className="h-5 w-5 mr-2" aria-hidden="true" />
          {isInstalling ? "Instalando..." : "Instalar Template"}
        </Button>
      </div>
    </div>
  )
}
