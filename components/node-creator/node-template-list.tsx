"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeDefinitions } from "@/context/node-definition-context"
import { useWorkflow } from "@/context/workflow-context"
import { NodeInstantiator } from "./node-instantiator"
import { Search, Plus, Edit, Trash2, Box } from "lucide-react"
import type { NodeDefinition } from "@/types/node-definition"

export function NodeTemplateList() {
  const router = useRouter()
  const { toast } = useToast()
  const { nodeDefinitions, deleteNodeDefinition } = useNodeDefinitions()
  const { selectedNode } = useWorkflow()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [instantiateDialogOpen, setInstantiateDialogOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  // Filtrar definições de nós
  const filteredDefinitions = nodeDefinitions.filter(
    (def) =>
      (selectedCategory === null || def.category === selectedCategory) &&
      (def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        def.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (def.tags && def.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))),
  )

  // Obter categorias únicas
  const categories = Array.from(new Set(nodeDefinitions.map((def) => def.category)))

  // Manipuladores de eventos
  const handleCreateNew = () => {
    router.push("/node-definitions/create")
  }

  const handleEdit = (definition: NodeDefinition) => {
    router.push(`/node-definitions/edit/${definition.id}`)
  }

  const handleDelete = (definition: NodeDefinition) => {
    deleteNodeDefinition(definition.id)
    toast({
      title: "Template de nó excluído",
      description: `"${definition.name}" foi excluído.`,
    })
  }

  const handleInstantiate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    setInstantiateDialogOpen(true)
  }

  // Traduzir categoria para português
  const translateCategory = (category: string): string => {
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
  }

  // Obter cor para a categoria
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      triggers: "bg-blue-100 text-blue-800",
      operations: "bg-purple-100 text-purple-800",
      flow: "bg-amber-100 text-amber-800",
      transformations: "bg-green-100 text-green-800",
      ai: "bg-pink-100 text-pink-800",
      integrations: "bg-cyan-100 text-cyan-800",
      custom: "bg-gray-100 text-gray-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Templates de Nós</CardTitle>
              <CardDescription>Gerencie seus templates de nós personalizados</CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates de nós..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {translateCategory(category)}
                </Button>
              ))}
            </div>
          </div>

          {filteredDefinitions.length === 0 ? (
            <div className="text-center py-8">
              <Box className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum template encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory
                  ? "Tente ajustar seus filtros de busca"
                  : "Crie seu primeiro template de nó"}
              </p>
              <Button onClick={handleCreateNew}>Criar template de nó</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDefinitions.map((definition) => (
                <Card key={definition.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{definition.name}</CardTitle>
                      <Badge className={`${getCategoryColor(definition.category)}`}>
                        {translateCategory(definition.category)}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{definition.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {definition.deprecated && <Badge variant="destructive">Descontinuado</Badge>}
                      <Badge variant="outline">v{definition.version}</Badge>
                      {definition.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-muted">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Criado: {new Date(definition.createdAt).toLocaleDateString()}</div>
                      <div>Atualizado: {new Date(definition.updatedAt).toLocaleDateString()}</div>
                      {definition.author && <div>Autor: {definition.author}</div>}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(definition)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Template de Nó</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{definition.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(definition)}
                              className="bg-red-500 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <Button size="sm" onClick={() => handleInstantiate(definition.id)}>
                      Criar Nó
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={instantiateDialogOpen} onOpenChange={setInstantiateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Criar Nó a partir do Template</DialogTitle>
            <DialogDescription>Configure as propriedades do novo nó</DialogDescription>
          </DialogHeader>
          {selectedTemplateId && (
            <NodeInstantiator
              templateId={selectedTemplateId}
              onClose={() => setInstantiateDialogOpen(false)}
              position={selectedNode ? { x: selectedNode.position.x + 200, y: selectedNode.position.y } : undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
