"use client"

import { useState, useEffect } from "react"
import { useVariables } from "@/context/variable-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { VariableIcon, ChevronDown } from "lucide-react"
import type { Variable, VariableScope } from "@/types/variable"

interface VariableSelectorProps {
  value: string
  onChange: (value: string) => void
  nodeId?: string
  parameterKey?: string
  allowedScopes?: VariableScope[]
  allowedTypes?: string[]
  placeholder?: string
}

export function VariableSelector({
  value,
  onChange,
  nodeId,
  parameterKey,
  allowedScopes = ["global", "workflow", "node"],
  allowedTypes,
  placeholder = "Select variable...",
}: VariableSelectorProps) {
  const { variables, trackVariableUsage } = useVariables()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter variables based on allowed scopes and types
  const filteredVariables = variables.filter((variable) => {
    // Filter by scope
    if (!allowedScopes.includes(variable.scope)) return false

    // Filter by type if specified
    if (allowedTypes && !allowedTypes.includes(variable.type)) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        variable.name.toLowerCase().includes(query) ||
        variable.key.toLowerCase().includes(query) ||
        variable.description?.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Track variable usage when a variable is selected
  useEffect(() => {
    if (value && value.startsWith("{{variables.") && value.endsWith("}}")) {
      const variableKey = value.slice(13, -2) // Extract key from {{variables.key}}
      const variable = variables.find((v) => v.key === variableKey)

      if (variable && nodeId && parameterKey) {
        trackVariableUsage({
          nodeId,
          parameterKey,
          variableId: variable.id,
        })
      }
    }
  }, [value, variables, nodeId, parameterKey, trackVariableUsage])

  const handleSelectVariable = (variable: Variable) => {
    const variableReference = `{{variables.${variable.key}}}`
    onChange(variableReference)
    setOpen(false)

    // Track usage if nodeId and parameterKey are provided
    if (nodeId && parameterKey) {
      trackVariableUsage({
        nodeId,
        parameterKey,
        variableId: variable.id,
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1" />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="px-2">
            <VariableIcon className="h-4 w-4 mr-1" />
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="end" alignOffset={0} sideOffset={5}>
          <Command>
            <CommandInput placeholder="Search variables..." value={searchQuery} onValueChange={setSearchQuery} />
            <CommandList>
              {filteredVariables.length === 0 ? (
                <CommandEmpty>No variables found</CommandEmpty>
              ) : (
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredVariables.map((variable) => (
                    <CommandItem
                      key={variable.id}
                      onSelect={() => handleSelectVariable(variable)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span>{variable.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {variable.key}
                          {variable.description && ` - ${variable.description}`}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {variable.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {variable.scope}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
