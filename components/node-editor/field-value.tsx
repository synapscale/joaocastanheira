"use client"

import { memo, useMemo } from "react"

interface FieldValueProps {
  value: any
}

/**
 * Componente para renderizar o valor de um campo
 */
function FieldValueComponent({ value }: FieldValueProps) {
  const renderedValue = useMemo(() => {
    if (value === null || value === undefined) return "null"
    if (typeof value === "object") {
      if (Array.isArray(value)) return `Array(${value.length})`
      return "Object"
    }
    return String(value)
  }, [value])

  return (
    <div className="text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{renderedValue}</div>
  )
}

export const FieldValue = memo(FieldValueComponent)
