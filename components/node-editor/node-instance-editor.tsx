"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useNodeDefinitions } from "@/context/node-definition-context"
import { useVariables } from "@/context/variable-context"
import { NodeParameterField } from "./node-parameter-field"
import type { NodeParameter, NodeInstance } from "@/types/node-definition"
import { AvailableVariables } from "./available-variables"

interface NodeInstanceEditorProps {
  nodeInstance: NodeInstance
  onSave: (instance: NodeInstance) => void
  onCancel: () => void
}

export function NodeInstanceEditor({ nodeInstance, onSave, onCancel }: NodeInstanceEditorProps) {
  const { toast } = useToast()
  const { getNodeDefinition } = useNodeDefinitions()
  const { evaluateExpression } = useVariables()
  const [activeTab, setActiveTab] = useState("parameters")
  const [name, setName] = useState(nodeInstance.name)
  const [notes, setNotes] = useState(nodeInstance.notes || "")
  const [disabled, setDisabled] = useState(nodeInstance.disabled || false)
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(nodeInstance.parameterValues || {})

  // Get the node definition
  const nodeDefinition = getNodeDefinition(nodeInstance.definitionId)

  if (!nodeDefinition) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-medium mb-2">Node Definition Not Found</h3>
        <p className="text-muted-foreground mb-4">
          The definition for this node could not be found. It may have been deleted or is unavailable.
        </p>
        <Button onClick={onCancel}>Close</Button>
      </div>
    )
  }

  const handleParameterChange = (key: string, value: any) => {
    setParameterValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    try {
      const updatedInstance: NodeInstance = {
        ...nodeInstance,
        name,
        notes,
        disabled,
        parameterValues,
      }

      onSave(updatedInstance)

      toast({
        title: "Node saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving node:", error)
      toast({
        title: "Error saving node",
        description: "There was an error saving your changes.",
        variant: "destructive",
      })
    }
  }

  const renderParameter = (parameter: NodeParameter) => {
    const value = parameterValues[parameter.key] !== undefined ? parameterValues[parameter.key] : parameter.default

    // Check display conditions
    if (parameter.displayOptions) {
      const { show } = parameter.displayOptions

      if (show) {
        // Check if the condition parameter has a variable reference
        const conditionParamValue = parameterValues[show.parameter]

        // If it's a variable reference, try to evaluate it
        if (
          typeof conditionParamValue === "string" &&
          conditionParamValue.startsWith("{{variables.") &&
          conditionParamValue.endsWith("}}")
        ) {
          const evaluatedValue = evaluateExpression(conditionParamValue, nodeInstance.id)
          if (evaluatedValue !== show.value) return null
        }
        // Otherwise do a direct comparison
        else if (conditionParamValue !== show.value) {
          return null
        }
      }
    }

    return (
      <div key={parameter.id} className="space-y-2">
        <Label htmlFor={parameter.key}>
          {parameter.name}
          {parameter.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <NodeParameterField
          parameter={parameter}
          value={value}
          onChange={(newValue) => handleParameterChange(parameter.key, newValue)}
          nodeId={nodeInstance.id}
        />
        {parameter.description && <p className="text-xs text-muted-foreground">{parameter.description}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{nodeDefinition.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-name">Node Name</Label>
              <Input id="node-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="node-disabled" checked={disabled} onCheckedChange={setDisabled} />
              <Label htmlFor="node-disabled">Disabled</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-4 pt-4">
          {nodeDefinition.parameters.length === 0 ? (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">This node has no configurable parameters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Regular parameters */}
              <div className="space-y-4">
                {nodeDefinition.parameters.filter((param) => !param.advanced).map(renderParameter)}
              </div>

              {/* Advanced parameters */}
              {nodeDefinition.parameters.some((param) => param.advanced) && (
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-sm font-medium mb-4">Advanced Parameters</h3>
                  <div className="space-y-4">
                    {nodeDefinition.parameters.filter((param) => param.advanced).map(renderParameter)}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="variables">
          <div className="space-y-4 pt-4">
            <AvailableVariables nodeId={nodeInstance.id} />
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-4 pt-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this node..."
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              These notes are for your reference only and don't affect the node's behavior.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}
