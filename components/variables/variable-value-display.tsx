"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useVariables } from "@/context/variable-context"
import { Eye, EyeOff } from "lucide-react"
import type { Variable } from "@/types/variable"

interface VariableValueDisplayProps {
  variable: Variable
  maxLength?: number
}

export function VariableValueDisplay({ variable, maxLength = 50 }: VariableValueDisplayProps) {
  const { resolveVariableValue } = useVariables()
  const [showSecret, setShowSecret] = useState(false)
  const [showResolved, setShowResolved] = useState(false)

  // Get the display value
  const getDisplayValue = () => {
    if (showResolved && variable.type === "expression") {
      try {
        const resolvedValue = resolveVariableValue(variable.id)
        return formatValue(resolvedValue)
      } catch (error) {
        return <Badge variant="destructive">Error evaluating expression</Badge>
      }
    }

    return formatValue(variable.value)
  }

  // Format the value based on its type
  const formatValue = (value: any) => {
    if (value === undefined || value === null) {
      return <span className="text-muted-foreground italic">Empty</span>
    }

    if (variable.type === "secret" || variable.encrypted) {
      if (!showSecret) {
        return (
          <div className="flex items-center gap-2">
            <span>••••••••</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowSecret(true)}>
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        )
      } else {
        return (
          <div className="flex items-center gap-2">
            <span>{String(value)}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowSecret(false)}>
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        )
      }
    }

    if (variable.type === "boolean") {
      return <Badge variant={value ? "default" : "outline"}>{value ? "True" : "False"}</Badge>
    }

    if (variable.type === "date") {
      try {
        return new Date(value).toLocaleDateString()
      } catch {
        return String(value)
      }
    }

    if (variable.type === "json" || variable.type === "array" || typeof value === "object") {
      const stringValue = JSON.stringify(value)
      if (stringValue.length > maxLength) {
        return `${stringValue.substring(0, maxLength)}...`
      }
      return stringValue
    }

    if (variable.type === "expression") {
      return (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-1 py-0.5 rounded">{String(value).substring(0, maxLength)}</code>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowResolved(!showResolved)}>
            {showResolved ? "Show Expression" : "Evaluate"}
          </Button>
        </div>
      )
    }

    // Default string representation
    const stringValue = String(value)
    if (stringValue.length > maxLength) {
      return `${stringValue.substring(0, maxLength)}...`
    }
    return stringValue
  }

  return <div className="max-w-md overflow-hidden">{getDisplayValue()}</div>
}
