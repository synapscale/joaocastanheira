"use client"

import { memo, useMemo } from "react"
import { FieldValue } from "@/components/node-editor/field-value"

interface SchemaViewProps {
  data: any
  emptyMessage?: string
}

/**
 * Componente para visualizar o esquema de dados
 */
function SchemaViewComponent({ data, emptyMessage = "No data to display" }: SchemaViewProps) {
  // Função auxiliar para obter o tipo de valor
  const getValueType = (value: any): string => {
    if (value === null) return "null"
    if (value === undefined) return "undefined"
    if (Array.isArray(value)) return "array"
    if (value instanceof Date) return "date"
    return typeof value
  }

  // Memoizar a renderização do schema
  const schemaContent = useMemo(() => {
    if (!data) return <div className="text-center p-4 text-muted-foreground">{emptyMessage}</div>

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <div className="text-center p-4 text-muted-foreground">No schema available</div>
    }

    // Se for um array, use o primeiro item para extrair o schema
    const sampleItem = Array.isArray(data) ? data[0] : data

    if (!sampleItem || typeof sampleItem !== "object") {
      return <div className="text-center p-4 text-muted-foreground">Cannot extract schema from data</div>
    }

    const fields = Object.keys(sampleItem).map((key) => {
      const value = sampleItem[key]
      const type = getValueType(value)

      // Determinar o indicador de tipo
      let typeIndicator = "A" // Padrão para string
      if (type === "number") typeIndicator = "#"
      if (type === "boolean") typeIndicator = "B"
      if (type === "object" || type === "array") typeIndicator = "O"

      return { name: key, type, typeIndicator }
    })

    return (
      <div className="overflow-auto max-h-[400px]">
        {Array.isArray(data) && (
          <div className="flex items-center px-4 py-2 border-b">
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="font-medium">
                {Array.isArray(data) && data.length > 0
                  ? `${data[0].name || "Item"} | ${data[0].description || ""}`
                  : "Data"}
              </span>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              {data.length} item{data.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        <div className="divide-y">
          {fields.map((field, index) => (
            <div key={index} className="flex items-start py-2 px-4 hover:bg-muted/30">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded mr-3 text-gray-500 font-medium">
                {field.typeIndicator}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{field.name}</div>
                <FieldValue value={Array.isArray(data) ? data[0][field.name] : sampleItem[field.name]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }, [data, emptyMessage])

  return schemaContent
}

export const SchemaView = memo(SchemaViewComponent)
