"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Download, Star, MoreVertical } from "lucide-react"
import type { MarketplaceNode } from "@/types/marketplace"
import type { CustomCategory } from "@/types/custom-category"

interface NodeCardProps {
  node: MarketplaceNode
  onClick: () => void
  customCategories: CustomCategory[]
  nodeCategories: CustomCategory[]
  onAddToCategory: (categoryId: string) => Promise<boolean>
  onRemoveFromCategory: (categoryId: string) => Promise<boolean>
}

/**
 * Componente de card para exibir um nó no marketplace.
 */
export function NodeCard({
  node,
  onClick,
  customCategories,
  nodeCategories,
  onAddToCategory,
  onRemoveFromCategory,
}: NodeCardProps) {
  const [isAddingToCategory, setIsAddingToCategory] = useState(false)

  /**
   * Traduz o nome da categoria para português.
   */
  const translateCategory = useCallback((category: string): string => {
    const translations: Record<string, string> = {
      triggers: "Gatilhos",
      operations: "Operações",
      flow: "Controle de Fluxo",
      transformations: "Transformações",
      ai: "IA",
      integrations: "Integrações",
      custom: "Personalizado",
    }
    return translations[category] || category
  }, [])

  /**
   * Verifica se o nó está em uma categoria específica.
   */
  const isInCategory = useCallback(
    (categoryId: string): boolean => {
      return nodeCategories.some((cat) => cat.id === categoryId)
    },
    [nodeCategories],
  )

  /**
   * Manipula a adição/remoção de um nó de uma categoria.
   */
  const handleCategoryToggle = useCallback(
    async (categoryId: string) => {
      if (isAddingToCategory) return

      setIsAddingToCategory(true)
      try {
        if (isInCategory(categoryId)) {
          await onRemoveFromCategory(categoryId)
        } else {
          await onAddToCategory(categoryId)
        }
      } catch (error) {
        console.error("Error toggling category:", error)
      } finally {
        setIsAddingToCategory(false)
      }
    },
    [isAddingToCategory, isInCategory, onAddToCategory, onRemoveFromCategory],
  )

  /**
   * Renderiza o menu de categorias.
   */
  const categoriesMenu = useMemo(() => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Opções do nó">
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={onClick}>Ver detalhes</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Adicionar à categoria</DropdownMenuLabel>
          {customCategories.length === 0 ? (
            <DropdownMenuItem disabled>Nenhuma categoria personalizada</DropdownMenuItem>
          ) : (
            customCategories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.id}
                checked={isInCategory(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
                disabled={isAddingToCategory}
              >
                <div className="flex items-center gap-2">
                  {category.icon && <span aria-hidden="true">{category.icon}</span>}
                  <span>{category.name}</span>
                  <div
                    className="h-2 w-2 rounded-full ml-auto"
                    style={{ backgroundColor: category.color }}
                    aria-hidden="true"
                  />
                </div>
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }, [customCategories, isInCategory, handleCategoryToggle, isAddingToCategory, onClick])

  /**
   * Renderiza os badges de categorias personalizadas.
   */
  const categoryBadges = useMemo(() => {
    if (nodeCategories.length === 0) return null

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {nodeCategories.slice(0, 2).map((category) => (
          <Badge
            key={category.id}
            variant="secondary"
            className="text-xs flex items-center gap-1"
            style={{
              backgroundColor: `${category.color}20`,
              borderColor: category.color,
              color: category.color,
            }}
          >
            {category.icon && <span aria-hidden="true">{category.icon}</span>}
            {category.name}
          </Badge>
        ))}
        {nodeCategories.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{nodeCategories.length - 2}
          </Badge>
        )}
      </div>
    )
  }, [nodeCategories])

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-0 flex-row justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {node.icon && (
              <span className="text-lg" aria-hidden="true">
                {node.icon}
              </span>
            )}
            <h3 className="font-medium text-base leading-none">{node.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            por {node.author} • v{node.version}
          </p>
        </div>
        {categoriesMenu}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm line-clamp-3">{node.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-stretch gap-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {translateCategory(node.category)}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="text-xs font-medium">{node.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onClick}
            aria-label={`Ver detalhes de ${node.name}`}
          >
            Detalhes
          </Button>
          <Button size="sm" className="flex-1 text-xs" onClick={onClick} aria-label={`Instalar ${node.name}`}>
            <Download className="h-3 w-3 mr-1" aria-hidden="true" />
            Instalar
          </Button>
        </div>
        {categoryBadges}
      </CardFooter>
    </Card>
  )
}
