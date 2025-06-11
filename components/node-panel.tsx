"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Search, Box, Plus } from "lucide-react"
import { NodeTemplateSelector } from "@/components/node-editor/node-template-selector"
import { useNodeDefinitions } from "@/context/node-definition-context"
import type { Position } from "@/types/workflow"
import type { NodeDefinition } from "@/types/node-definition"

interface NodePanelProps {
  position: Position | null
  onClose: () => void
  onAddNode: (type: string, data: { name: string; inputs?: string[]; outputs?: string[]; description?: string }) => void
}

export function NodePanel({ position, onClose, onAddNode }: NodePanelProps) {
  const { nodeDefinitions } = useNodeDefinitions()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("built-in")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    popular: true,
    "add-remove": true,
    combine: true,
    convert: true,
    triggers: false,
    ai: false,
  })
  const panelRef = useRef<HTMLDivElement>(null)

  // Fechar painel ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Adicionar event listener com um pequeno atraso para evitar fechamento imediato
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Manipular seleção de nó
  const handleNodeSelect = (nodeDefinition: NodeDefinition) => {
    // Mapear entradas e saídas para o formato esperado por onAddNode
    const inputs = nodeDefinition.inputs.map((input) => input.id)
    const outputs = nodeDefinition.outputs.map((output) => output.id)

    onAddNode(nodeDefinition.type, {
      name: nodeDefinition.name,
      inputs,
      outputs,
      description: nodeDefinition.description,
    })

    onClose()
  }

  // Alternar expansão de categoria
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Filtrar templates personalizados
  const customTemplates = nodeDefinitions.filter(
    (def) =>
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (def.tags && def.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
  )

  // Agrupar templates por categoria
  const groupedTemplates = customTemplates.reduce(
    (acc, template) => {
      const category = template.category || "other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(template)
      return acc
    },
    {} as Record<string, NodeDefinition[]>,
  )

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
      other: "Outros",
    }
    return translations[category] || category
  }

  return (
    <div
      className="absolute top-0 right-0 h-full w-80 bg-background border-l shadow-lg z-50 flex flex-col"
      ref={panelRef}
    >
      {/* Cabeçalho */}
      <div className="flex items-center p-4 border-b bg-muted/30">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2" aria-label="Voltar">
          <ArrowLeft size={18} />
        </Button>
        <h3 className="font-medium">Adicionar Nó</h3>
      </div>

      {/* Barra de pesquisa */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nós..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs para alternar entre nós integrados e personalizados */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 px-4 pt-2">
          <TabsTrigger value="built-in">Integrados</TabsTrigger>
          <TabsTrigger value="custom">Personalizados</TabsTrigger>
        </TabsList>

        <TabsContent value="built-in" className="flex-1 overflow-hidden">
          <NodeTemplateSelector onSelect={handleNodeSelect} onClose={onClose} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="custom" className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {Object.keys(groupedTemplates).length === 0 ? (
                <div className="text-center py-8">
                  <Box className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhum template personalizado</h3>
                  <p className="text-muted-foreground mb-4">Crie templates personalizados para adicionar aqui</p>
                  <Button onClick={() => window.open("/node-definitions", "_blank")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Template
                  </Button>
                </div>
              ) : (
                Object.entries(groupedTemplates).map(([category, templates]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      {translateCategory(category)} ({templates.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {templates.map((template) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="justify-start h-auto py-2 px-3"
                          onClick={() => handleNodeSelect(template)}
                        >
                          <div className="flex flex-col items-start text-left">
                            <span className="font-medium">{template.name}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{template.description}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Rodapé */}
      <div className="p-4 border-t bg-muted/30">
        <Button variant="outline" className="w-full" onClick={() => window.open("/node-definitions", "_blank")}>
          <Plus className="h-4 w-4 mr-2" />
          Gerenciar Templates
        </Button>
      </div>
    </div>
  )
}
