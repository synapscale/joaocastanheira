"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  X,
  Plus,
  Filter,
  SortAsc,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Type,
  Brain,
  Settings,
  PanelRightClose,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Node data
const NODE_CATEGORIES = [
  {
    id: "data-input",
    name: "Entrada de Dados",
    icon: Type,
    color: "bg-blue-500",
    nodes: [
      {
        id: "text-input",
        name: "Entrada de Texto",
        description: "Permite inserir texto manualmente",
        inputs: 0,
        outputs: 1,
        isPopular: true,
      },
      {
        id: "number-input",
        name: "Entrada Numérica",
        description: "Permite inserir valores numéricos",
        inputs: 0,
        outputs: 1,
      },
      {
        id: "file-input",
        name: "Entrada de Arquivo",
        description: "Permite carregar arquivos",
        inputs: 0,
        outputs: 1,
      },
    ],
  },
  {
    id: "ai",
    name: "Inteligência Artificial",
    icon: Brain,
    color: "bg-purple-500",
    nodes: [
      {
        id: "text-generation",
        name: "Geração de Texto",
        description: "Gera texto usando modelos de linguagem",
        inputs: 1,
        outputs: 1,
        isNew: true,
      },
      {
        id: "image-generation",
        name: "Geração de Imagem",
        description: "Gera imagens a partir de descrições",
        inputs: 1,
        outputs: 1,
        isNew: true,
      },
      {
        id: "text-classification",
        name: "Classificação de Texto",
        description: "Classifica texto em categorias",
        inputs: 1,
        outputs: 2,
      },
    ],
  },
  {
    id: "data-transformation",
    name: "Transformação de Dados",
    icon: Settings,
    color: "bg-emerald-500",
    nodes: [
      {
        id: "text-transform",
        name: "Transformação de Texto",
        description: "Aplica transformações em texto",
        inputs: 1,
        outputs: 1,
      },
    ],
  },
]

interface NodeSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function NodeSidebar({ isOpen, onClose }: NodeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const searchInputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Initialize expanded categories
  useEffect(() => {
    const initialExpanded = NODE_CATEGORIES.reduce(
      (acc, category) => {
        acc[category.id] = true
        return acc
      },
      {} as Record<string, boolean>,
    )
    setExpandedCategories(initialExpanded)
  }, [])

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".floating-library-button")
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Focus search input when sidebar opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const filteredCategories = NODE_CATEGORIES.map((category) => ({
    ...category,
    nodes: category.nodes.filter(
      (node) =>
        !searchQuery ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter((category) => category.nodes.length > 0)

  if (!isOpen) return null

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "node-sidebar fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl z-40",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Biblioteca de Nodes</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Arraste para o canvas</p>
            </div>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Fechar biblioteca"
          >
            <PanelRightClose className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nodes..."
            className="pl-9 pr-9 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <Plus className="h-3 w-3 mr-1" />
            Novo
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <Filter className="h-3 w-3 mr-1" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
            <SortAsc className="h-3 w-3 mr-1" />
            Ordenar
          </Button>
        </div>
      </div>

      {/* Categories */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p className="text-sm">Nenhum node encontrado</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-blue-500 hover:text-blue-600 text-xs"
              >
                Limpar busca
              </Button>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                {/* Category header */}
                <button
                  className="w-full flex items-center justify-between p-2.5 text-left bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-5 h-5 rounded flex items-center justify-center", category.color)}>
                      <category.icon className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-xs text-slate-900 dark:text-slate-100">{category.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{category.nodes.length} nodes</p>
                    </div>
                  </div>
                  {expandedCategories[category.id] ? (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>

                {/* Category nodes */}
                {expandedCategories[category.id] && (
                  <div className="space-y-2 pl-1">
                    {category.nodes.map((node) => (
                      <div
                        key={node.id}
                        className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-grab hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({
                              type: "node",
                              id: node.id,
                              node,
                            }),
                          )
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-4 h-4 rounded flex items-center justify-center", category.color)}>
                              <category.icon className="h-2.5 w-2.5 text-white" />
                            </div>
                            <h4 className="font-medium text-xs text-slate-900 dark:text-slate-100">{node.name}</h4>
                          </div>
                          <div className="flex gap-1">
                            {node.isPopular && (
                              <Badge
                                variant="secondary"
                                className="text-xs h-4 px-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              >
                                Popular
                              </Badge>
                            )}
                            {node.isNew && (
                              <Badge
                                variant="secondary"
                                className="text-xs h-4 px-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              >
                                Novo
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                          {node.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>{node.inputs} entradas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{node.outputs} saídas</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Arraste e solte nodes no canvas</p>
      </div>
    </div>
  )
}
