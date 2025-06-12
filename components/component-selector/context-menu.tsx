"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, Code, Info, X, Activity, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
// Importe o novo componente InsertFormatSelector e o tipo InsertFormat
import InsertFormatSelector, { type InsertFormat } from "./insert-format-selector"

interface ContextMenuProps {
  x: number
  y: number
  componentInfo: ComponentInfo | null
  onClose: () => void
  onInspectEvents: (element: HTMLElement) => void
  onEditProperties: (element: HTMLElement) => void
}

export interface ComponentInfo {
  name: string
  path: string
  props?: Record<string, any>
  children?: boolean
  state?: Record<string, any>
  detectionMethod?: "explicit" | "fiber" | "shadcn" | "inference" | "dom"
  element?: HTMLElement
}

export default function ContextMenu({
  x,
  y,
  componentInfo,
  onClose,
  onInspectEvents,
  onEditProperties,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x, y })
  const { setLastAction } = useApp()
  // Adicione o estado para controlar o diálogo de seleção de formato
  const [insertFormatDialogOpen, setInsertFormatDialogOpen] = useState(false)

  // Ajusta a posição do menu para garantir que ele não saia da tela
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      let newX = x
      let newY = y

      if (x + rect.width > windowWidth) {
        newX = windowWidth - rect.width - 10
      }

      if (y + rect.height > windowHeight) {
        newY = windowHeight - rect.height - 10
      }

      setPosition({ x: newX, y: newY })
    }
  }, [x, y])

  // Fecha o menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const copyComponentInfo = () => {
    if (!componentInfo) return

    const formatObject = (obj: Record<string, any> | undefined): string => {
      if (!obj || Object.keys(obj).length === 0) return "{}"

      try {
        // Função para sanitizar objetos e remover referências circulares
        const getCircularReplacer = () => {
          const seen = new WeakSet()
          return (key: string, value: any) => {
            // Ignora propriedades que começam com _ ou __ (geralmente internas)
            if (key.startsWith("_")) return "[Internal]"

            // Trata funções, DOM nodes e objetos complexos
            if (typeof value === "function") return "[Function]"
            if (value instanceof Node) return `[${value.nodeName}]`
            if (typeof value === "object" && value !== null) {
              if (seen.has(value)) return "[Circular]"
              seen.add(value)
            }
            return value
          }
        }

        return JSON.stringify(obj, getCircularReplacer(), 2)
      } catch (error) {
        console.error("Erro ao formatar objeto:", error)
        return "{...} [Objeto complexo]"
      }
    }

    const infoText = `Componente: ${componentInfo.name}
Caminho: ${componentInfo.path}
${componentInfo.detectionMethod ? `Método de detecção: ${componentInfo.detectionMethod}` : ""}
${componentInfo.props ? `Props: ${formatObject(componentInfo.props)}` : ""}
${componentInfo.state ? `Estado: ${formatObject(componentInfo.state)}` : ""}
${componentInfo.children ? "Contém componentes filhos" : ""}
`

    navigator.clipboard.writeText(infoText)
    setLastAction("Informações do componente copiadas para a área de transferência")
    onClose()
  }

  const copyComponentReference = () => {
    if (!componentInfo) return

    const reference = `<${componentInfo.name} /> (${componentInfo.path})`
    navigator.clipboard.writeText(reference)
    setLastAction("Referência do componente copiada para a área de transferência")
    onClose()
  }

  // Modifique a função insertIntoChat para abrir o diálogo de seleção de formato
  const insertIntoChat = () => {
    if (!componentInfo) return
    setInsertFormatDialogOpen(true)
  }

  // Adicione a função handleInsertFormat para lidar com a seleção do formato
  const handleInsertFormat = (format: InsertFormat) => {
    if (!componentInfo) return

    // Obtenha o elemento de entrada de texto do chat
    const chatInput = document.querySelector("textarea") as HTMLTextAreaElement
    if (!chatInput) return

    const cursorPos = chatInput.selectionStart || 0
    const textBefore = chatInput.value.substring(0, cursorPos)
    const textAfter = chatInput.value.substring(cursorPos)

    let insertText = ""

    switch (format) {
      case "reference":
        // Cria um marcador especial que será interpretado pelo chat
        insertText = `[ComponentReference:${JSON.stringify({
          name: componentInfo.name,
          path: componentInfo.path,
          props: componentInfo.props,
          detectionMethod: componentInfo.detectionMethod,
        })}]`
        break
      case "snippet":
        // Gera um snippet de código JSX
        insertText = `\`\`\`jsx
<${componentInfo.name}
  ${
    componentInfo.props
      ? Object.entries(componentInfo.props)
          .filter(([_, value]) => typeof value !== "function" && typeof value !== "object")
          .map(([key, value]) => {
            if (typeof value === "string") return `${key}="${value}"`
            if (typeof value === "boolean" && value) return key
            return `${key}={${JSON.stringify(value)}}`
          })
          .join("\n  ")
      : ""
  }
/>
\`\`\``
        break
      case "markdown":
        // Gera uma referência em markdown
        insertText = `**Componente:** \`${componentInfo.name}\`  
**Caminho:** \`${componentInfo.path}\`  
${componentInfo.detectionMethod ? `**Método de detecção:** ${componentInfo.detectionMethod}  ` : ""}
${
  componentInfo.props && Object.keys(componentInfo.props).length > 0
    ? `**Props:** ${JSON.stringify(componentInfo.props, null, 2)}`
    : ""
}`
        break
      case "jsx":
        // Apenas o nome do componente em formato JSX
        insertText = `<${componentInfo.name} />`
        break
    }

    // Insere o texto no chat
    chatInput.value = textBefore + insertText + textAfter

    // Dispara um evento de input para atualizar o estado React
    const event = new Event("input", { bubbles: true })
    chatInput.dispatchEvent(event)

    // Foca no input e posiciona o cursor após o texto inserido
    chatInput.focus()
    chatInput.selectionStart = chatInput.selectionEnd = cursorPos + insertText.length

    setLastAction("Referência do componente inserida no chat")
    onClose()
  }

  const handleInspectEvents = () => {
    if (!componentInfo || !componentInfo.element) return
    onInspectEvents(componentInfo.element)
    onClose()
  }

  const handleEditProperties = () => {
    if (!componentInfo || !componentInfo.element) return
    onEditProperties(componentInfo.element)
    onClose()
  }

  if (!componentInfo) return null

  return (
    <>
      <div
        ref={menuRef}
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-64 overflow-hidden"
        style={{ left: position.x, top: position.y }}
      >
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-200">{componentInfo.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="truncate">{componentInfo.path}</div>
        </div>

        <div className="p-2 max-h-40 overflow-auto text-xs bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          {componentInfo.detectionMethod && (
            <div className="mb-1">
              <span className="text-gray-500 dark:text-gray-400">Detecção: </span>
              <span className="text-gray-700 dark:text-gray-300">{componentInfo.detectionMethod}</span>
            </div>
          )}

          {componentInfo.props && Object.keys(componentInfo.props).length > 0 && (
            <div className="mb-1">
              <span className="text-gray-500 dark:text-gray-400">Props: </span>
              <span className="text-gray-700 dark:text-gray-300">
                {Object.keys(componentInfo.props).slice(0, 3).join(", ")}
                {Object.keys(componentInfo.props).length > 3 ? "..." : ""}
              </span>
            </div>
          )}

          {componentInfo.state && Object.keys(componentInfo.state).length > 0 && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Estado: </span>
              <span className="text-gray-700 dark:text-gray-300">
                {Object.keys(componentInfo.state).slice(0, 2).join(", ")}
                {Object.keys(componentInfo.state).length > 2 ? "..." : ""}
              </span>
            </div>
          )}
        </div>

        <div className="p-1">
          <button
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
            onClick={copyComponentInfo}
          >
            <Info className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            Copiar informações detalhadas
          </button>

          <button
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
            onClick={copyComponentReference}
          >
            <Copy className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            Copiar referência
          </button>

          <button
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
            onClick={insertIntoChat}
          >
            <Code className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            Inserir no chat
          </button>

          <button
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
            onClick={handleInspectEvents}
          >
            <Activity className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            Inspecionar eventos
          </button>

          <button
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
            onClick={handleEditProperties}
          >
            <Settings className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            Editar propriedades
          </button>
        </div>
      </div>

      <InsertFormatSelector
        open={insertFormatDialogOpen}
        onOpenChange={setInsertFormatDialogOpen}
        onSelect={handleInsertFormat}
        componentName={componentInfo?.name || ""}
      />
    </>
  )
}
