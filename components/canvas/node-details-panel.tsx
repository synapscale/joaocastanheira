"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useCanvas } from "@/contexts/canvas-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"

interface NodeDetailsPanelProps {
  nodeId: string
}

/**
 * NodeDetailsPanel Component
 *
 * Panel to display and edit details of a selected node on the canvas.
 *
 * @param nodeId - ID of the selected node
 */
export function NodeDetailsPanel({ nodeId }: NodeDetailsPanelProps) {
  const { canvasNodes, updateCanvasNode, setSelectedNode, getNodeType } = useCanvas()
  const node = canvasNodes.find((n) => n.id === nodeId)
  const nodeType = node ? getNodeType(nodeId) : undefined

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [properties, setProperties] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState("general")
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form values when node changes
  useEffect(() => {
    if (node) {
      setName(node.data.name)
      setDescription(node.data.description)

      // Initialize properties based on node type
      if (nodeType) {
        const initialProperties = { ...nodeType.properties }

        // Override with custom values from the node, if they exist
        if (node.data.config) {
          try {
            const config = typeof node.data.config === "string" ? JSON.parse(node.data.config) : node.data.config

            Object.assign(initialProperties, config)
          } catch (error) {
            console.error("Error parsing node configuration:", error)
          }
        }

        setProperties(initialProperties)
      }
    }
    setHasChanges(false)
  }, [node, nodeType])

  // Return null if no node is selected
  if (!node) {
    return null
  }

  /**
   * Handle name change
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setHasChanges(true)
  }

  /**
   * Handle description change
   */
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
    setHasChanges(true)
  }

  /**
   * Handle property change
   */
  const handlePropertyChange = (key: string, value: any) => {
    setProperties((prev) => ({
      ...prev,
      [key]: value,
    }))
    setHasChanges(true)
  }

  /**
   * Save changes to the node
   */
  const handleSave = useCallback(() => {
    if (hasChanges) {
      updateCanvasNode(nodeId, {
        name,
        description,
        config: JSON.stringify(properties),
      })
      setHasChanges(false)
    }
  }, [name, description, properties, nodeId, updateCanvasNode, hasChanges])

  /**
   * Update when user leaves a field
   */
  const handleBlur = () => {
    handleSave()
  }

  /**
   * Render property control based on type
   */
  const renderPropertyControl = (key: string, value: any) => {
    if (typeof value === "string") {
      return (
        <Input
          id={`property-${key}`}
          value={value}
          onChange={(e) => handlePropertyChange(key, e.target.value)}
          onBlur={handleBlur}
        />
      )
    } else if (typeof value === "number") {
      return (
        <Input
          id={`property-${key}`}
          type="number"
          value={value}
          onChange={(e) => handlePropertyChange(key, Number.parseFloat(e.target.value))}
          onBlur={handleBlur}
        />
      )
    } else if (typeof value === "boolean") {
      return (
        <div className="flex items-center space-x-2">
          <input
            id={`property-${key}`}
            type="checkbox"
            checked={value}
            onChange={(e) => handlePropertyChange(key, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor={`property-${key}`} className="text-sm">
            {value ? "Sim" : "Não"}
          </label>
        </div>
      )
    } else if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
      return (
        <Textarea
          id={`property-${key}`}
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              handlePropertyChange(key, JSON.parse(e.target.value))
            } catch (error) {
              // Ignore parsing errors during typing
            }
          }}
          onBlur={handleBlur}
          className="font-mono text-xs h-24"
        />
      )
    }

    return (
      <Input
        id={`property-${key}`}
        value={String(value)}
        onChange={(e) => handlePropertyChange(key, e.target.value)}
        onBlur={handleBlur}
      />
    )
  }

  return (
    <div className="w-80 border-l bg-background p-4 overflow-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Detalhes do Node</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedNode(null)}
          aria-label="Fechar painel de detalhes"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="general" className="flex-1">
            Geral
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex-1">
            Propriedades
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex-1">
            Conexões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-name">Nome</Label>
            <Input id="node-name" value={name} onChange={handleNameChange} onBlur={handleBlur} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-description">Descrição</Label>
            <Textarea
              id="node-description"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={handleBlur}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="p-2 bg-muted rounded-md text-sm">{nodeType?.name || node.type}</div>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          {Object.entries(properties).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`property-${key}`} className="capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </Label>
              {renderPropertyControl(key, value)}
            </div>
          ))}

          {Object.keys(properties).length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              Este node não possui propriedades configuráveis.
            </div>
          )}
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          {nodeType && (
            <>
              {nodeType.inputs.length > 0 && (
                <div className="space-y-2">
                  <Label>Entradas</Label>
                  <div className="space-y-1">
                    {nodeType.inputs.map((input) => {
                      const portConnections = node.ports?.inputs.find((p) => p.id === input.id)?.connections || []
                      return (
                        <div key={input.id} className="p-2 bg-muted rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">{input.name}</span>
                            <span className="text-xs text-muted-foreground">{input.dataType}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {portConnections.length > 0 ? `${portConnections.length} conexão(ões)` : "Sem conexões"}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {nodeType.outputs.length > 0 && (
                <div className="space-y-2">
                  <Label>Saídas</Label>
                  <div className="space-y-1">
                    {nodeType.outputs.map((output) => {
                      const portConnections = node.ports?.outputs.find((p) => p.id === output.id)?.connections || []
                      return (
                        <div key={output.id} className="p-2 bg-muted rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">{output.name}</span>
                            <span className="text-xs text-muted-foreground">{output.dataType}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {portConnections.length > 0 ? `${portConnections.length} conexão(ões)` : "Sem conexões"}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {(!nodeType || (nodeType.inputs.length === 0 && nodeType.outputs.length === 0)) && (
            <div className="text-center text-muted-foreground py-4">Este node não possui portas de conexão.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
