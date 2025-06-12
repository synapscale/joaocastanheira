"use client"

import { useVariables } from "@/context/variable-context"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VariableSelector } from "@/components/variables/variable-selector"
import type { NodeParameter } from "@/types/node-definition"

interface NodeParameterFieldProps {
  parameter: NodeParameter
  value: any
  onChange: (value: any) => void
  nodeId: string
}

export function NodeParameterField({ parameter, value, onChange, nodeId }: NodeParameterFieldProps) {
  const { evaluateExpression } = useVariables()

  // Check if the value is a variable reference
  const isVariableReference = typeof value === "string" && value.startsWith("{{variables.") && value.endsWith("}}")

  // If it's a variable reference, use the VariableSelector
  if (isVariableReference) {
    return (
      <VariableSelector
        value={value}
        onChange={onChange}
        nodeId={nodeId}
        parameterKey={parameter.key}
        allowedTypes={parameter.type === "select" ? ["string"] : undefined}
        placeholder={parameter.placeholder || `Enter ${parameter.name}`}
      />
    )
  }

  // Otherwise, render the appropriate input based on parameter type
  switch (parameter.type) {
    case "string":
      return (
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={parameter.placeholder} />
      )

    case "number":
      return (
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder={parameter.placeholder}
        />
      )

    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <Switch checked={Boolean(value)} onCheckedChange={onChange} />
          <span>{Boolean(value) ? "True" : "False"}</span>
        </div>
      )

    case "select":
      return (
        <Select value={String(value || "")} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={parameter.placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {parameter.options?.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "json":
    case "code":
      return (
        <Textarea
          value={typeof value === "object" ? JSON.stringify(value, null, 2) : value || ""}
          onChange={(e) => {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(e.target.value)
              onChange(parsed)
            } catch {
              // If not valid JSON, store as string
              onChange(e.target.value)
            }
          }}
          className="font-mono text-sm min-h-[100px]"
          placeholder={parameter.placeholder}
        />
      )

    default:
      return (
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={parameter.placeholder} />
      )
  }
}
