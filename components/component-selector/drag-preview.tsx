"use client"

import { useEffect, useState } from "react"
import { Code, Package, FileCode, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DragPreviewProps {
  name: string
  path: string
  isHtmlElement?: boolean
  tagName?: string
  detectionMethod?: string
  position: { x: number; y: number }
}

export default function DragPreview({
  name,
  path,
  isHtmlElement,
  tagName,
  detectionMethod,
  position,
}: DragPreviewProps) {
  const [mounted, setMounted] = useState(false)

  // Efeito para animação de entrada
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Determina o ícone com base no tipo de componente
  const getIcon = () => {
    if (path.includes("/ui/")) {
      return <Package className="h-4 w-4 text-blue-500" />
    }
    if (path.includes("/chat/")) {
      return <Layers className="h-4 w-4 text-purple-500" />
    }
    if (isHtmlElement) {
      return <FileCode className="h-4 w-4 text-amber-500" />
    }
    return <Code className="h-4 w-4 text-emerald-500" />
  }

  // Determina o tipo de badge com base no método de detecção
  const getBadgeVariant = () => {
    switch (detectionMethod) {
      case "explicit":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "fiber":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "shadcn":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "inference":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const getComponentType = () => {
    if (isHtmlElement) return "Elemento HTML"
    if (path.includes("/ui/")) return "Componente UI"
    if (path.includes("/chat/")) return "Componente de Chat"
    return "Componente React"
  }

  return (
    <div
      className={`fixed pointer-events-none z-[9999] transition-opacity duration-200 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      style={{
        left: `${position.x + 15}px`,
        top: `${position.y + 15}px`,
        transform: "translate(0, 0)",
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] max-w-[300px]">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="font-medium text-gray-800 dark:text-gray-200">{name || "Componente Desconhecido"}</span>
          {isHtmlElement && tagName && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{`<${tagName.toLowerCase()}>`}</span>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">{path || "Caminho desconhecido"}</div>

        <div className="mt-2 flex items-center space-x-2">
          <Badge className={`text-[10px] ${getBadgeVariant()}`}>{detectionMethod || "dom"}</Badge>
          <span className="text-xs text-gray-400 dark:text-gray-500">{getComponentType()}</span>
        </div>
      </div>
    </div>
  )
}
