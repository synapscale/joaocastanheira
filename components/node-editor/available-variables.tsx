"use client"

import { useState } from "react"
import { useVariables } from "@/context/variable-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import type { VariableScope } from "@/types/variable"

interface AvailableVariablesProps {
  nodeId?: string
}

export function AvailableVariables({ nodeId }: AvailableVariablesProps) {
  const { variables, getVariablesByScope, resolveVariableValue } = useVariables()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<VariableScope>("global")

  // Filter variables based on search query and active tab
  const filteredVariables = getVariablesByScope(activeTab).filter((variable) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      variable.name.toLowerCase().includes(query) ||
      variable.key.toLowerCase().includes(query) ||
      variable.description?.toLowerCase().includes(query)
    )
  })

  // Format variable value for display
  const formatValue = (value: any, type: string): string => {
    if (value === undefined || value === null) return "null"

    switch (type) {
      case "string":
        return `"${value}"`
      case "json":
      case "array":
        try {
          return JSON.stringify(value, null, 2)
        } catch (e) {
          return String(value)
        }
      case "expression":
        // For expressions, try to evaluate them
        try {
          const evaluated = resolveVariableValue(value)
          return String(evaluated)
        } catch (e) {
          return String(value)
        }
      default:
        return String(value)
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Available Variables</CardTitle>
        <CardDescription>Variables that can be used in your code</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as VariableScope)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="node">Node</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filteredVariables.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No {activeTab} variables found</div>
              ) : (
                <div className="space-y-3">
                  {filteredVariables.map((variable) => (
                    <div key={variable.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{variable.name}</h4>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">$variables.{variable.key}</code>
                        </div>
                        <Badge variant="outline" className={`text-xs ${getTypeColor(variable.type)}`}>
                          {variable.type}
                        </Badge>
                      </div>
                      {variable.description && (
                        <p className="text-sm text-muted-foreground mb-2">{variable.description}</p>
                      )}
                      <div className="mt-2 text-sm">
                        <div className="font-medium text-xs text-muted-foreground mb-1">Value:</div>
                        <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-24">
                          {formatValue(variable.value, variable.type)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
