"use client"

import { memo, useMemo } from "react"
import { JsonLine } from "@/components/node-editor/json-line"

interface JsonViewProps {
  data: any
  emptyMessage?: string
}

/**
 * Componente para visualizar dados em formato JSON
 */
function JsonViewComponent({ data, emptyMessage = "No data to display" }: JsonViewProps) {
  // Memoizar a renderização do JSON
  const jsonContent = useMemo(() => {
    if (!data) return <div className="text-center p-4 text-muted-foreground">{emptyMessage}</div>

    try {
      // Formatar o JSON com indentação adequada e realce de sintaxe
      const formattedJson = JSON.stringify(data, null, 2)

      // Dividir a string JSON em linhas para realce de sintaxe
      const lines = formattedJson.split("\n")

      return (
        <div className="bg-gray-50 rounded-md overflow-auto max-h-[400px] p-4">
          <pre className="font-mono text-sm whitespace-pre">
            {lines.map((line, i) => (
              <JsonLine key={i} line={line} index={i} />
            ))}
          </pre>
        </div>
      )
    } catch (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          Error rendering JSON: {error instanceof Error ? error.message : String(error)}
        </div>
      )
    }
  }, [data, emptyMessage])

  return jsonContent
}

export const JsonView = memo(JsonViewComponent)
