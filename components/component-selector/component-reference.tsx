"use client"

import { useState } from "react"
import { Code, Copy, Eye, Settings, ChevronDown, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"

interface ComponentReferenceProps {
  name: string
  path: string
  props?: Record<string, any>
  detectionMethod?: string
  onSelect?: () => void
}

export default function ComponentReference({ name, path, props, detectionMethod, onSelect }: ComponentReferenceProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const { setLastAction } = useApp()

  // Formata as props para exibição
  const formatProps = (props: Record<string, any> | undefined): string => {
    if (!props || Object.keys(props).length === 0) return "{}"

    try {
      return JSON.stringify(props, null, 2)
    } catch (error) {
      return "{...}"
    }
  }

  // Gera um snippet de código para o componente
  const generateSnippet = (): string => {
    if (!props || Object.keys(props).length === 0) {
      return `<${name} />`
    }

    // Filtra apenas props simples (string, number, boolean)
    const simpleProps = Object.entries(props).filter(([_, value]) => {
      return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    })

    if (simpleProps.length === 0) {
      return `<${name} />`
    }

    // Formata as props para JSX
    const propsString = simpleProps
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `${key}="${value}"`
        } else if (typeof value === "boolean" && value) {
          return key
        } else {
          return `${key}={${JSON.stringify(value)}}`
        }
      })
      .join("\n  ")

    return `<${name}\n  ${propsString}\n/>`
  }

  // Copia o snippet para a área de transferência
  const copySnippet = () => {
    navigator.clipboard.writeText(generateSnippet())
    setCopied(true)
    setLastAction("Snippet copiado para a área de transferência")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center">
          <Code className="h-4 w-4 text-primary mr-2" />
          <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({path})</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={copySnippet}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </Button>
          {onSelect && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={onSelect}
            >
              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-3">
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Snippet:</div>
            <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">{generateSnippet()}</pre>
          </div>

          {detectionMethod && (
            <div className="mb-2">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Método de detecção:</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{detectionMethod}</div>
            </div>
          )}

          {props && Object.keys(props).length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Props:</div>
              <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                {formatProps(props)}
              </pre>
            </div>
          )}

          <div className="mt-3 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-full"
              onClick={() => {
                if (onSelect) onSelect()
              }}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Selecionar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-full"
              onClick={() => {
                window.open(`https://github.com/search?q=${encodeURIComponent(path)}`, "_blank")
              }}
            >
              <Code className="h-3.5 w-3.5 mr-1.5" /> Documentação
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-full"
              onClick={() => {
                if (onSelect) onSelect()
                // Simula a abertura do editor de propriedades
                setLastAction("Abrindo editor de propriedades...")
              }}
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" /> Editar Props
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
