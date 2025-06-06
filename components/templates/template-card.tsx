"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { NodeTemplate } from "@/types/node-template"
import { Calendar, Clock } from "lucide-react"

interface TemplateCardProps {
  template: NodeTemplate
}

export function TemplateCard({ template }: TemplateCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Criado: {formatDate(template.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Atualizado: {formatDate(template.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 text-sm text-muted-foreground">
        {template.nodes.length} nós • {template.connections.length} conexões
      </CardFooter>
    </Card>
  )
}
