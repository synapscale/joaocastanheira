"use client"

import { useState, useRef, useEffect } from "react"
import { useVariables } from "@/context/variable-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { VariableIcon, Search } from "lucide-react"
import type { Variable, VariableScope } from "@/types/variable"

interface VariableSelectorForEditorProps {
  onInsert: (variableReference: string) => void
  allowedScopes?: VariableScope[]
  allowedTypes?: string[]
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function VariableSelectorForEditor({
  onInsert,
  allowedScopes = ["global", "workflow", "node"],
  allowedTypes,
  buttonSize = "sm",
  buttonVariant = "outline",
}: VariableSelectorForEditorProps) {
  const { variables } = useVariables()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  // Group variables by scope
  const groupedVariables: Record<string, Variable[]> = {}
  filteredVariables.forEach((variable) => {
    if (!groupedVariables[variable.scope]) {
      groupedVariables[variable.scope] = []
    }
    groupedVariables[variable.scope].push(variable)
  })

  // Focus search input when popover opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const handleSelectVariable = (variable: Variable) => {
    const variableReference = `$variables.${variable.key}`
    onInsert(variableReference)
    setOpen(false)
    setSearchQuery("")
  }

  // Get scope display name
  const getScopeDisplayName = (scope: string): string => {
    switch (scope) {
      case "global":
        return "Global Variables"
      case "workflow":
        return "Workflow Variables"
      case "node":
        return "Node Variables"
      default:
        return scope.charAt(0).toUpperCase() + scope.slice(1) + " Variables"
    }
  }

  // Get variable type badge color
  const getTypeColor = (type: string): string => {
    switch (type) {
      case "string":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "number":
        return "bg-green-100 text-green-800 border-green-200"
      case "boolean":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "json":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "array":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "date":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "expression":
        return "bg-red-100 text-red-800 border-red-200"
      case "secret":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className="gap-1">
          <VariableIcon className="h-4 w-4" />
          <span>Variables</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80" align="start" sideOffset={5}>
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              ref={searchInputRef}
              placeholder="Search variables..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-auto">
            {Object.keys(groupedVariables).length === 0 ? (
              <CommandEmpty>No variables found</CommandEmpty>
            ) : (
              Object.entries(groupedVariables).map(([scope, scopeVariables]) => (
                <CommandGroup key={scope} heading={getScopeDisplayName(scope)}>
                  {scopeVariables.map((variable) => (
                    <CommandItem
                      key={variable.id}
                      onSelect={() => handleSelectVariable(variable)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{variable.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ${variable.key}
                          {variable.description && ` - ${variable.description}`}
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(variable.type)}`}>
                        {variable.type}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
          <div className="border-t p-2">
            <div className="text-xs text-muted-foreground">
              <p>
                Use <code className="bg-muted px-1 py-0.5 rounded">$variables.name</code> to reference variables in your
                code
              </p>
            </div>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
