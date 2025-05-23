"use client"

import { useState, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Star, Code, MessageSquare, Info, Check, Plus } from "lucide-react"
import { NodeCode } from "./node-code"
import { NodeReviews } from "./node-reviews"
import type { MarketplaceNode } from "@/types/marketplace"
import type { CustomCategory } from "@/types/custom-category"

interface NodeDetailsDialogProps {
  node: MarketplaceNode
  open: boolean
  onOpenChange: (open: boolean) => void
  onInstall: () => void
  customCategories?: CustomCategory[]
  nodeCategories?: CustomCategory[]
  onAddToCategory?: (categoryId: string) => Promise<boolean>
  onRemoveFromCategory?: (categoryId: string) => Promise<boolean>
}

/**
 * Diálogo de detalhes de um nó do marketplace.
 */
export function NodeDetailsDialog({
  node,
  open,
  onOpenChange,
  onInstall,
  customCategories = [],
  nodeCategories = [],
  onAddToCategory,
  onRemoveFromCategory,
}: NodeDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [isInstalling, setIsInstalling] = useState(false)
  const [isCategoryActionInProgress, setIsCategoryActionInProgress] = useState(false)

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
   * Manipula a instalação do nó.
   */
  const handleInstall = useCallback(async () => {
    setIsInstalling(true)
    try {
      await onInstall()
    } catch (error) {
      console.error("Error installing node:", error)
    } finally {
      setIsInstalling(false)
    }
  }, [onInstall])

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
      if (!onAddToCategory || !onRemoveFromCategory || isCategoryActionInProgress) return

      setIsCategoryActionInProgress(true)
      try {
        if (isInCategory(categoryId)) {
          await onRemoveFromCategory(categoryId)
        } else {
          await onAddToCategory(categoryId)
        }
      } catch (error) {
        console.error("Error toggling category:", error)
      } finally {
        setIsCategoryActionInProgress(false)
      }
    },
    [onAddToCategory, onRemoveFromCategory, isCategoryActionInProgress, isInCategory],
  )

  /**
   * Renderiza os botões de categorias personalizadas.
   */
  const categoryButtons = useMemo(() => {
    if (customCategories.length === 0) return null

    return (
      <div>
        <h3 className="text-sm font-medium mb-1">Categorias Personalizadas</h3>
        <div className="flex flex-wrap gap-2">
          {customCategories.map((category) => (
            <Button
              key={category.id}
              variant={isInCategory(category.id) ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1 h-8"
              style={
                isInCategory(category.id)
                  ? {
                      backgroundColor: category.color,
                      color: "#fff",
                    }
                  : {}
              }
              onClick={() => handleCategoryToggle(category.id)}
              disabled={isCategoryActionInProgress}
              aria-pressed={isInCategory(category.id)}
              aria-label={`${isInCategory(category.id) ? "Remover de" : "Adicionar à"} categoria ${category.name}`}
            >
              {category.icon && <span aria-hidden="true">{category.icon}</span>}
              {category.name}
              {isInCategory(category.id) ? (
                <Check className="h-3 w-3 ml-1" aria-hidden="true" />
              ) : (
                <Plus className="h-3 w-3 ml-1" aria-hidden="true" />
              )}
            </Button>
          ))}
        </div>
      </div>
    )
  }, [customCategories, isInCategory, handleCategoryToggle, isCategoryActionInProgress])

  /**
   * Renderiza as informações do nó.
   */
  const nodeInfoContent = useMemo(() => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Autor</h3>
          <p className="text-sm">{node.author}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-1">Categoria</h3>
          <Badge variant="outline">{translateCategory(node.category)}</Badge>
        </div>

        {node.tags && node.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-1">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {node.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {categoryButtons}

        {node.inputs && node.inputs.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-1">Entradas</h3>
            <ul className="space-y-2">
              {node.inputs.map((input) => (
                <li key={input.id} className="text-sm">
                  <span className="font-medium">{input.name}</span>
                  {input.required && <span className="text-red-500 ml-1">*</span>}
                  {input.description && <p className="text-muted-foreground text-xs mt-0.5">{input.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {node.outputs && node.outputs.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-1">Saídas</h3>
            <ul className="space-y-2">
              {node.outputs.map((output) => (
                <li key={output.id} className="text-sm">
                  <span className="font-medium">{output.name}</span>
                  {output.description && <p className="text-muted-foreground text-xs mt-0.5">{output.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {node.parameters && node.parameters.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-1">Parâmetros</h3>
            <ul className="space-y-2">
              {node.parameters.map((param) => (
                <li key={param.id} className="text-sm">
                  <span className="font-medium">{param.name}</span>
                  {param.required && <span className="text-red-500 ml-1">*</span>}
                  <span className="text-muted-foreground ml-1">({param.type})</span>
                  {param.description && <p className="text-muted-foreground text-xs mt-0.5">{param.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {node.documentation && (
          <div>
            <h3 className="text-sm font-medium mb-1">Documentação</h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="text-xs p-4 bg-muted rounded-md overflow-auto">{node.documentation}</pre>
            </div>
          </div>
        )}
      </div>
    )
  }, [node, translateCategory, categoryButtons])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {node.icon && (
              <span className="text-2xl" aria-hidden="true">
                {node.icon}
              </span>
            )}
            <DialogTitle>{node.name}</DialogTitle>
            <Badge variant="outline" className="ml-2">
              v{node.version}
            </Badge>
          </div>
          <DialogDescription>{node.description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="info" className="flex items-center gap-1">
                <Info className="h-4 w-4" aria-hidden="true" />
                Informações
              </TabsTrigger>
              {node.code_template && (
                <TabsTrigger value="code" className="flex items-center gap-1">
                  <Code className="h-4 w-4" aria-hidden="true" />
                  Código
                </TabsTrigger>
              )}
              <TabsTrigger value="reviews" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Avaliações
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" aria-hidden="true" />
                <span className="font-medium">{node.rating.toFixed(1)}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground">{node.downloads.toLocaleString()} downloads</span>
            </div>
          </div>

          <TabsContent value="info" className="flex-1 overflow-auto mt-4">
            {nodeInfoContent}
          </TabsContent>

          {node.code_template && (
            <TabsContent value="code" className="flex-1 overflow-auto mt-4">
              <NodeCode code={node.code_template} />
            </TabsContent>
          )}

          <TabsContent value="reviews" className="flex-1 overflow-auto mt-4">
            <NodeReviews nodeId={node.id} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleInstall} disabled={isInstalling} className="w-full sm:w-auto" aria-busy={isInstalling}>
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            {isInstalling ? "Instalando..." : "Instalar Nó"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
