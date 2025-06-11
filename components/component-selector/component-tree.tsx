"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, RefreshCw, X, Eye, DropletsIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import TreeNode from "./tree-node"
import { useApp } from "@/contexts/app-context"
import { useCustomAttributes } from "@/hooks/use-custom-attributes"

export interface ComponentNode {
  id: string
  name: string
  path: string
  element: HTMLElement
  children?: ComponentNode[]
  isHtmlElement?: boolean
  tagName?: string
  props?: Record<string, any>
  state?: Record<string, any>
  detectionMethod?: "explicit" | "fiber" | "shadcn" | "inference" | "dom" | "custom-attribute"
}

interface ComponentTreeProps {
  onSelectComponent: (element: HTMLElement) => void
  onClose: () => void
}

export default function ComponentTree({ onSelectComponent, onClose }: ComponentTreeProps) {
  const [tree, setTree] = useState<ComponentNode | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "react" | "html">("all")
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<ComponentNode | null>(null)
  const treeContainerRef = useRef<HTMLDivElement>(null)
  const { setLastAction } = useApp()
  const { getOrderedAttributes } = useCustomAttributes()

  // Função para extrair a árvore de componentes
  const extractComponentTree = () => {
    setLoading(true)

    try {
      // Começamos com o elemento raiz
      const rootElement = document.getElementById("__next") || document.body
      const rootNode = buildComponentTree(rootElement)
      setTree(rootNode)
    } catch (error) {
      console.error("Erro ao extrair árvore de componentes:", error)
    } finally {
      setLoading(false)
    }
  }

  // Função recursiva para construir a árvore de componentes
  const buildComponentTree = (element: HTMLElement, depth = 0): ComponentNode => {
    // Gera um ID único para o nó
    const nodeId = `node-${Math.random().toString(36).substring(2, 11)}`

    // Verifica atributos personalizados
    const customAttributes = getOrderedAttributes()
    let componentName: string | null = null
    let componentPath: string | null = null
    let detectionMethod: ComponentNode["detectionMethod"] = "dom"

    for (const attr of customAttributes) {
      try {
        // Verifica se o elemento corresponde ao seletor
        if (element.matches(attr.selector)) {
          // Extrai o nome do componente se configurado
          if (attr.extractName) {
            const attrName = attr.name.startsWith("data-") ? attr.name : `data-${attr.name}`
            componentName = element.getAttribute(attrName)

            // Aplica prefixo/sufixo se definidos
            if (componentName) {
              if (attr.namePrefix) componentName = attr.namePrefix + componentName
              if (attr.nameSuffix) componentName = componentName + attr.nameSuffix
              detectionMethod = "custom-attribute"
            }
          }

          // Extrai o caminho do componente se configurado
          if (attr.extractPath) {
            const attrName = attr.name.startsWith("data-")
              ? attr.name.replace("data-", "data-") + "-path"
              : `data-${attr.name}-path`
            componentPath = element.getAttribute(attrName)
            if (componentPath) detectionMethod = "custom-attribute"
          }

          // Se encontrou pelo menos um dos valores, interrompe a busca
          if (componentName || componentPath) {
            break
          }
        }
      } catch (error) {
        console.error(`Erro ao processar atributo personalizado ${attr.name}:`, error)
      }
    }

    // Tenta extrair informações do React Fiber
    const fiberInfo = extractReactFiber(element)
    if (fiberInfo) {
      componentName = componentName || fiberInfo.name
      componentPath = componentPath || fiberInfo.path
      detectionMethod = "fiber"
    }

    // Se ainda não temos um nome, tente outras estratégias
    if (!componentName) {
      // Tenta extrair de classes
      const classComponent = getComponentNameFromClass(element)
      if (classComponent) {
        componentName = classComponent
        detectionMethod = "inference"
      } else {
        // Usa o nome da tag como último recurso
        componentName = formatComponentName(element.tagName.toLowerCase())
      }
    }

    // Se ainda não temos um caminho, tente adivinhar
    if (!componentPath) {
      componentPath = guessComponentPath(componentName)
    }

    // Cria o nó atual
    const node: ComponentNode = {
      id: nodeId,
      name: componentName,
      path: componentPath,
      element: element,
      isHtmlElement: !fiberInfo,
      tagName: element.tagName,
      props: fiberInfo?.props,
      state: fiberInfo?.state,
      detectionMethod,
      children: [],
    }

    // Limita a profundidade para evitar loops infinitos e desempenho ruim
    if (depth > 15) return node

    // Processa os filhos
    const childElements = getChildElements(element)

    if (childElements.length > 0) {
      node.children = childElements.map((child) => buildComponentTree(child, depth + 1))
    }

    return node
  }

  // Função para obter os elementos filhos relevantes
  const getChildElements = (element: HTMLElement): HTMLElement[] => {
    // Filtra elementos que não queremos incluir na árvore
    const childElements: HTMLElement[] = []

    Array.from(element.children).forEach((child) => {
      const childElement = child as HTMLElement

      // Ignora elementos de script, style, e outros elementos não visuais
      if (
        childElement.tagName !== "SCRIPT" &&
        childElement.tagName !== "STYLE" &&
        childElement.tagName !== "LINK" &&
        childElement.tagName !== "META" &&
        !childElement.classList.contains("component-selector-overlay") &&
        !childElement.hasAttribute("data-component-selector")
      ) {
        childElements.push(childElement)
      }
    })

    return childElements
  }

  // Função para extrair informações do React Fiber
  const extractReactFiber = (element: HTMLElement): { name: string; path: string; props: any; state: any } | null => {
    try {
      // Acessa as propriedades internas do React
      const key = Object.keys(element).find(
        (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$"),
      )

      if (!key) return null

      // @ts-ignore - Acessando propriedades internas do React
      const fiber = element[key]
      if (!fiber) return null

      // Navega pelo fiber para encontrar o componente
      let fiberNode = fiber
      while (fiberNode) {
        if (fiberNode.type && typeof fiberNode.type === "function") {
          // Encontrou um componente React
          const componentName = fiberNode.type.displayName || fiberNode.type.name || "UnknownComponent"

          // Sanitiza as props para evitar referências circulares
          const sanitizeObject = (obj: any): any => {
            if (!obj) return {}

            const result: Record<string, any> = {}

            // Pega apenas as propriedades seguras
            Object.keys(obj).forEach((key) => {
              // Ignora propriedades internas ou complexas
              if (key.startsWith("_") || key === "children" || key === "ref") {
                return
              }

              const value = obj[key]

              // Trata diferentes tipos de valores
              if (value === null || value === undefined) {
                result[key] = value
              } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                result[key] = value
              } else if (typeof value === "function") {
                result[key] = "[Function]"
              } else if (Array.isArray(value)) {
                result[key] = "[Array]"
              } else if (value instanceof Node) {
                result[key] = "[DOM Element]"
              } else if (typeof value === "object") {
                result[key] = "[Object]"
              }
            })

            return result
          }

          // Tenta extrair props de forma segura
          const props = sanitizeObject(fiberNode.memoizedProps || {})

          // Tenta extrair estado de forma segura
          const state = sanitizeObject(fiberNode.memoizedState || {})

          // Tenta inferir o caminho com base no nome
          const path = guessComponentPath(componentName)

          return {
            name: componentName,
            path,
            props,
            state,
          }
        }

        // Continua navegando pelo fiber
        fiberNode = fiberNode.return
      }
    } catch (error) {
      console.error("Erro ao extrair informações do React Fiber:", error)
    }

    return null
  }

  // Função para extrair nomes de componentes a partir de classes:
  const getComponentNameFromClass = (element: HTMLElement): string | null => {
    const classes = Array.from(element.classList)

    // Procura por classes em PascalCase
    const pascalCaseClass = classes.find((cls) => /^[A-Z][a-zA-Z0-9]*$/.test(cls))
    if (pascalCaseClass) return pascalCaseClass

    // Procura por classes em kebab-case
    const kebabCaseClass = classes.find((cls) => /^[a-z]+(-[a-z]+)+$/.test(cls))
    if (kebabCaseClass) {
      return kebabCaseClass
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")
    }

    // Procura por classes BEM
    const bemClass = classes.find((cls) => cls.includes("__") || cls.includes("--"))
    if (bemClass) {
      const baseName = bemClass.split("__")[0].split("--")[0]
      return formatComponentName(baseName)
    }

    return null
  }

  // Função para formatar nomes:
  const formatComponentName = (name: string): string => {
    // Converte kebab-case ou snake_case para PascalCase
    if (name.includes("-") || name.includes("_")) {
      return name
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")
    }

    // Se for um elemento HTML padrão, apenas capitalize
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Função para tentar adivinhar o caminho do componente
  const guessComponentPath = (componentName: string): string => {
    // Converte PascalCase para kebab-case
    const kebabName = componentName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()

    // Componentes shadcn/ui
    const shadcnComponents = [
      "accordion",
      "alert",
      "avatar",
      "badge",
      "button",
      "card",
      "dialog",
      "dropdown-menu",
      "input",
      "popover",
      "scroll-area",
      "tabs",
    ]

    // Verifica se é um componente shadcn/ui
    for (const comp of shadcnComponents) {
      if (kebabName.includes(comp)) {
        return `@/components/ui/${comp}`
      }
    }

    // Componentes específicos da aplicação de chat
    if (kebabName.includes("chat-message")) return "@/components/chat/chat-message"
    if (kebabName.includes("chat-interface")) return "@/components/chat/chat-interface"
    if (kebabName.includes("model-selector")) return "@/components/chat/model-selector"
    if (kebabName.includes("tool-selector")) return "@/components/chat/tool-selector"
    if (kebabName.includes("personality-selector")) return "@/components/chat/personality-selector"
    if (kebabName.includes("conversation")) return "@/components/chat/conversation-sidebar"
    if (kebabName.includes("preset")) return "@/components/chat/preset-selector"
    if (kebabName.includes("header")) return "@/components/chat/conversation-header"

    // Tenta inferir a categoria com base no nome
    if (kebabName.includes("chat") || kebabName.includes("message")) {
      return `@/components/chat/${kebabName}`
    }

    if (kebabName.includes("ui") || kebabName.includes("button") || kebabName.includes("input")) {
      return `@/components/ui/${kebabName}`
    }

    // Caminho genérico para outros componentes
    return `@/components/${kebabName}`
  }

  // Função para filtrar a árvore com base na pesquisa e no filtro selecionado
  const filterTree = (node: ComponentNode, query: string, filter: "all" | "react" | "html"): ComponentNode | null => {
    // Verifica se o nó atual corresponde à consulta e ao filtro
    const matchesQuery = query === "" || node.name.toLowerCase().includes(query.toLowerCase())
    const matchesFilter =
      filter === "all" || (filter === "react" && !node.isHtmlElement) || (filter === "html" && node.isHtmlElement)

    // Se o nó atual corresponde, mantém ele e filtra seus filhos
    if (matchesQuery && matchesFilter) {
      const filteredChildren = node.children
        ?.map((child) => filterTree(child, query, filter))
        .filter((child): child is ComponentNode => child !== null)

      return {
        ...node,
        children: filteredChildren,
      }
    }

    // Se o nó atual não corresponde, verifica se algum de seus filhos corresponde
    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children
        .map((child) => filterTree(child, query, filter))
        .filter((child): child is ComponentNode => child !== null)

      if (filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        }
      }
    }

    // Se nem o nó atual nem seus filhos correspondem, retorna null
    return null
  }

  // Função para selecionar um nó da árvore
  const handleSelectNode = (node: ComponentNode) => {
    setSelectedNodeId(node.id)
    onSelectComponent(node.element)
  }

  // Função para lidar com o início do arrasto
  const handleDragStart = (node: ComponentNode) => {
    setIsDragging(true)
    setDraggedNode(node)
  }

  // Extrai a árvore de componentes quando o componente é montado
  useEffect(() => {
    extractComponentTree()
  }, [])

  // Filtra a árvore quando a consulta ou o filtro mudam
  const filteredTree = tree ? filterTree(tree, searchQuery, filter) : null

  return (
    <div
      ref={treeContainerRef}
      className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 w-80 h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col"
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
          <Eye className="h-4 w-4 mr-2 text-primary" />
          Árvore de Componentes
          {isDragging && (
            <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Arrastando</Badge>
          )}
        </h3>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={extractComponentTree}
            disabled={loading}
            title="Atualizar árvore"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 dark:text-gray-400 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onClose}
            title="Fechar"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>
      </div>

      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Buscar componentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20"
          />
        </div>

        <Tabs defaultValue="all" className="mt-2" onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="w-full grid grid-cols-3 h-8 rounded-full bg-gray-100 dark:bg-gray-700 p-1">
            <TabsTrigger
              value="all"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="react"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              React
            </TabsTrigger>
            <TabsTrigger
              value="html"
              className="rounded-full text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              HTML
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isDragging && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30 flex items-center">
          <DropletsIcon className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
          <span className="text-xs text-blue-700 dark:text-blue-300">
            Arraste para o chat ou editor de propriedades
          </span>
        </div>
      )}

      <ScrollArea className="flex-1 p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Carregando componentes...
            </div>
          </div>
        ) : filteredTree ? (
          <TreeNode
            node={filteredTree}
            level={0}
            onSelect={handleSelectNode}
            selectedNodeId={selectedNodeId}
            onDragStart={handleDragStart}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? "Nenhum componente encontrado" : "Nenhum componente disponível"}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {tree ? `${countNodes(tree)} componentes encontrados` : "Carregando..."}
        <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
          <span className="flex items-center">
            <GripVertical className="h-3 w-3 mr-1" /> Arraste componentes para o chat ou editor
          </span>
        </div>
      </div>
    </div>
  )
}

// Função auxiliar para contar o número total de nós na árvore
function countNodes(node: ComponentNode): number {
  let count = 1 // Conta o nó atual
  if (node.children) {
    node.children.forEach((child) => {
      count += countNodes(child)
    })
  }
  return count
}

// Adicione o ícone GripVertical que está faltando
function GripVertical(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  )
}
