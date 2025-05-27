"use client"

import { memo } from "react"

interface TableRowProps {
  item: any
  allKeys: string[]
}

/**
 * Componente para renderizar uma linha de tabela
 */
function TableRowComponent({ item, allKeys }: TableRowProps) {
  return (
    <tr>
      {allKeys.map((key) => (
        <td
          key={key}
          className="p-3 border border-gray-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[300px]"
          title={item[key] !== undefined ? String(item[key]) : ""}
        >
          {item[key] !== undefined
            ? typeof item[key] === "object"
              ? JSON.stringify(item[key])
              : String(item[key])
            : ""}
        </td>
      ))}
    </tr>
  )
}

export const TableRow = memo(TableRowComponent)
