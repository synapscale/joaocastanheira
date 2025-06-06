"use client"

import { useState } from "react"
import { nanoid } from "nanoid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NodeParameter, ParameterDataType } from "@/types/node-definition"
import { Trash2, Plus, Copy } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface ParametersEditorProps {
  parameters: NodeParameter[]
  onChange: (parameters: NodeParameter[]) => void
}

export function ParametersEditor({ parameters, onChange }: ParametersEditorProps) {
  const [selectedParameterId, setSelectedParameterId] = useState<string | null>(
    parameters.length > 0 ? parameters[0].id : null,
  )

  // Corrigindo tipos e acessos conforme a interface NodeParameter
  // 1. Criação de novo parâmetro
  const addParameter = () => {
    const newParameter: NodeParameter = {
      id: `param-${nanoid(6)}`,
      name: "New Parameter",
      key: `newParam${parameters.length + 1}`,
      type: "string",
      description: "",
      required: false,
      options: [],
    }
    const updatedParameters = [...parameters, newParameter]
    onChange(updatedParameters)
    setSelectedParameterId(newParameter.id)
  }

  const updateParameter = (id: string, updates: Partial<NodeParameter>) => {
    const updatedParameters = parameters.map((param) => (param.id === id ? { ...param, ...updates } : param))
    onChange(updatedParameters)
  }

  // 2. Duplicação de parâmetro
  const duplicateParameter = (id: string) => {
    const paramToDuplicate = parameters.find((p) => p.id === id)
    if (!paramToDuplicate) return
    const newParameter: NodeParameter = {
      ...paramToDuplicate,
      id: `param-${nanoid(6)}`,
      name: `${paramToDuplicate.name} (copy)`,
      key: `${paramToDuplicate.key}Copy`,
    }
    const updatedParameters = [...parameters, newParameter]
    onChange(updatedParameters)
    setSelectedParameterId(newParameter.id)
  }

  const deleteParameter = (id: string) => {
    const updatedParameters = parameters.filter((param) => param.id !== id)
    onChange(updatedParameters)

    if (selectedParameterId === id) {
      setSelectedParameterId(updatedParameters.length > 0 ? updatedParameters[0].id : null)
    }
  }

  const moveParameter = (fromIndex: number, toIndex: number) => {
    const updatedParameters = [...parameters]
    const [movedItem] = updatedParameters.splice(fromIndex, 1)
    updatedParameters.splice(toIndex, 0, movedItem)
    onChange(updatedParameters)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const fromIndex = result.source.index
    const toIndex = result.destination.index

    moveParameter(fromIndex, toIndex)
  }

  const selectedParameter = parameters.find((p) => p.id === selectedParameterId)

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 border rounded-md">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Parameters</h3>
            <Button size="sm" variant="ghost" onClick={addParameter}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="parameters">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="max-h-[400px] overflow-y-auto">
                {parameters.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No parameters defined. Click "Add" to create one.
                  </div>
                ) : (
                  parameters.map((param, index) => (
                    <Draggable key={param.id} draggableId={param.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between p-3 border-b cursor-pointer hover:bg-muted/50 ${
                            selectedParameterId === param.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedParameterId(param.id)}
                        >
                          <div>
                            <div className="font-medium text-sm">{param.name}</div>
                            <div className="text-xs text-muted-foreground">{param.type}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateParameter(param.id)
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteParameter(param.id)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="col-span-2">
        {selectedParameter ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parameter Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="validation">Validation</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="param-name">Name</Label>
                      <Input
                        id="param-name"
                        value={selectedParameter.name}
                        onChange={(e) => updateParameter(selectedParameter.id, { name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="param-key">Key</Label>
                      <Input
                        id="param-key"
                        value={selectedParameter.key}
                        onChange={(e) => updateParameter(selectedParameter.id, { key: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="param-type">Type</Label>
                    <Select
                      value={selectedParameter.type}
                      onValueChange={(value) =>
                        updateParameter(selectedParameter.id, { type: value as NodeParameter["type"] })
                      }
                    >
                      <SelectTrigger id="param-type">
                        <SelectValue placeholder="Select parameter type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="multiSelect">MultiSelect</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                        <SelectItem value="color">Color</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="dateTime">DateTime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="param-description">Description</Label>
                    <Textarea
                      id="param-description"
                      value={selectedParameter.description || ""}
                      onChange={(e) => updateParameter(selectedParameter.id, { description: e.target.value })}
                      placeholder="Describe this parameter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="param-default">Default Value</Label>
                    <Input
                      id="param-default"
                      value={selectedParameter.default || ""}
                      onChange={(e) => updateParameter(selectedParameter.id, { default: e.target.value })}
                      placeholder="Default value"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="param-placeholder">Placeholder</Label>
                    <Input
                      id="param-placeholder"
                      value={selectedParameter.placeholder || ""}
                      onChange={(e) => updateParameter(selectedParameter.id, { placeholder: e.target.value })}
                      placeholder="Placeholder text"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="validation" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="param-required"
                      checked={selectedParameter.required || false}
                      onCheckedChange={(checked) => updateParameter(selectedParameter.id, { required: checked })}
                    />
                    <Label htmlFor="param-required">Required</Label>
                  </div>

                  {selectedParameter.type === "string" && (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Min/Max Length */}
                      <div className="space-y-2">
                        <Label htmlFor="param-min">Min Length</Label>
                        <Input
                          id="param-min"
                          type="number"
                          value={selectedParameter.validation?.min || ""}
                          onChange={(e) =>
                            updateParameter(selectedParameter.id, {
                              validation: {
                                ...(selectedParameter.validation || {}),
                                min: e.target.value ? Number.parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="param-max">Max Length</Label>
                        <Input
                          id="param-max"
                          type="number"
                          value={selectedParameter.validation?.max || ""}
                          onChange={(e) =>
                            updateParameter(selectedParameter.id, {
                              validation: {
                                ...(selectedParameter.validation || {}),
                                max: e.target.value ? Number.parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {selectedParameter.type === "string" && (
                    <div className="space-y-2">
                      <Label htmlFor="param-pattern">Pattern (Regex)</Label>
                      <Input
                        id="param-pattern"
                        value={selectedParameter.validation?.pattern || ""}
                        onChange={(e) =>
                          updateParameter(selectedParameter.id, {
                            validation: {
                              ...(selectedParameter.validation || {}),
                              pattern: e.target.value,
                            },
                          })
                        }
                        placeholder="Regular expression pattern"
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full border rounded-md p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No Parameter Selected</h3>
              <p className="text-muted-foreground mb-4">Select a parameter from the list or create a new one.</p>
              <Button onClick={addParameter}>
                <Plus className="h-4 w-4 mr-1" />
                Add Parameter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
