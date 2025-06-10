"use client"

import { memo, useMemo } from "react"
import { TableRow } from "@/components/node-editor/table-row"

interface TableViewProps {
  data: any
  emptyMessage?: string
}

/**
 * Componente para visualizar dados em formato de tabela
 */
function TableViewComponent({ data, emptyMessage = "No data to display" }: TableViewProps) {
  // Memoizar a renderização da tabela
  const tableContent = useMemo(() => {
    if (!data) return <div className="text-center p-4 text-muted-foreground">{emptyMessage}</div>

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <div className="text-center p-4 text-muted-foreground">No data to display</div>
    }

    // Se não for um array, converta para um array com um único item
    const dataArray = Array.isArray(data) ? data : [data]

    // Extrair todas as chaves únicas de todos os objetos
    const allKeys = Array.from(new Set(dataArray.flatMap((item) => Object.keys(item))))

    return (
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              {allKeys.map((key) => (
                <th key={key} className="p-3 text-left border border-gray-200 font-medium">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataArray.map((item) => (
              <TableRow
                key={typeof item === "object" ? JSON.stringify(item) : String(item)}
                item={item}
                allKeys={allKeys}
              />
            ))}
          </tbody>
        </table>
      </div>
    )
  }, [data, emptyMessage])

  return tableContent
}

export const TableView = memo(TableViewComponent)
