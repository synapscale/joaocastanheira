"use client"

import { useState } from "react"
import { nanoid } from "nanoid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NodeInput, NodeOutput } from "@/types/node-definition"
import { Trash2, Plus, Copy } from "lucide-react"

interface InputsOutputsEditorProps {
  inputs: NodeInput[]
  outputs: NodeOutput[]
  onInputsChange: (inputs: NodeInput[]) => void
  onOutputsChange: (outputs: NodeOutput[]) => void
}

export function InputsOutputsEditor({ inputs, outputs, onInputsChange, onOutputsChange }: InputsOutputsEditorProps) {
  const [activeTab, setActiveTab] = useState("inputs")
  const [selectedInputId, setSelectedInputId] = useState<string | null>(inputs.length > 0 ? inputs[0].id : null)
  const [selectedOutputId, setSelectedOutputId] = useState<string | null>(outputs.length > 0 ? outputs[0].id : null)

  // Input operations
  const addInput = () => {
    const newInput: NodeInput = {
      id: `input-${nanoid(6)}`,
      name: "New Input",
      description: "",
      required: false,
    }

    const updatedInputs = [...inputs, newInput]
    onInputsChange(updatedInputs)
    setSelectedInputId(newInput.id)
    setActiveTab("inputs")
  }

  const updateInput = (id: string, updates: Partial<NodeInput>) => {
    const updatedInputs = inputs.map((input) => (input.id === id ? { ...input, ...updates } : input))
    onInputsChange(updatedInputs)
  }

  const duplicateInput = (id: string) => {
    const inputToDuplicate = inputs.find((i) => i.id === id)
    if (!inputToDuplicate) return

    const newInput: NodeInput = {
      ...inputToDuplicate,
      id: `input-${nanoid(6)}`,
      name: `${inputToDuplicate.name} (copy)`,
    }

    const updatedInputs = [...inputs, newInput]
    onInputsChange(updatedInputs)
    setSelectedInputId(newInput.id)
    setActiveTab("inputs")
  }

  const deleteInput = (id: string) => {
    const updatedInputs = inputs.filter((input) => input.id !== id)
    onInputsChange(updatedInputs)

    if (selectedInputId === id) {
      setSelectedInputId(updatedInputs.length > 0 ? updatedInputs[0].id : null)
    }
  }

  // Output operations
  const addOutput = () => {
    const newOutput: NodeOutput = {
      id: `output-${nanoid(6)}`,
      name: "New Output",
      description: "",
    }

    const updatedOutputs = [...outputs, newOutput]
    onOutputsChange(updatedOutputs)
    setSelectedOutputId(newOutput.id)
    setActiveTab("outputs")
  }

  const updateOutput = (id: string, updates: Partial<NodeOutput>) => {
    const updatedOutputs = outputs.map((output) => (output.id === id ? { ...output, ...updates } : output))
    onOutputsChange(updatedOutputs)
  }

  const duplicateOutput = (id: string) => {
    const outputToDuplicate = outputs.find((o) => o.id === id)
    if (!outputToDuplicate) return

    const newOutput: NodeOutput = {
      ...outputToDuplicate,
      id: `output-${nanoid(6)}`,
      name: `${outputToDuplicate.name} (copy)`,
    }

    const updatedOutputs = [...outputs, newOutput]
    onOutputsChange(updatedOutputs)
    setSelectedOutputId(newOutput.id)
    setActiveTab("outputs")
  }

  const deleteOutput = (id: string) => {
    const updatedOutputs = outputs.filter((output) => output.id !== id)
    onOutputsChange(updatedOutputs)

    if (selectedOutputId === id) {
      setSelectedOutputId(updatedOutputs.length > 0 ? updatedOutputs[0].id : null)
    }
  }

  const selectedInput = inputs.find((i) => i.id === selectedInputId)
  const selectedOutput = outputs.find((o) => o.id === selectedOutputId)

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="outputs">Outputs</TabsTrigger>
        </TabsList>

        <TabsContent value="inputs">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 border rounded-md">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Input Ports</h3>
                  <Button size="sm" variant="ghost" onClick={addInput}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {inputs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No inputs defined. Click "Add" to create one.
                  </div>
                ) : (
                  inputs.map((input) => (
                    <div
                      key={input.id}
                      className={`flex items-center justify-between p-3 border-b cursor-pointer hover:bg-muted/50 ${
                        selectedInputId === input.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedInputId(input.id)}
                    >
                      <div>
                        <div className="font-medium text-sm">{input.name}</div>
                        <div className="text-xs text-muted-foreground">{input.required ? "Required" : "Optional"}</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateInput(input.id)
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteInput(input.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="col-span-2">
              {selectedInput ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Input Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="input-name">Name</Label>
                      <Input
                        id="input-name"
                        value={selectedInput.name}
                        onChange={(e) => updateInput(selectedInput.id, { name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="input-description">Description</Label>
                      <Textarea
                        id="input-description"
                        value={selectedInput.description || ""}
                        onChange={(e) => updateInput(selectedInput.id, { description: e.target.value })}
                        placeholder="Describe this input"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="input-required"
                        checked={selectedInput.required || false}
                        onCheckedChange={(checked) => updateInput(selectedInput.id, { required: checked })}
                      />
                      <Label htmlFor="input-required">Required</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="input-schema">Schema (JSON)</Label>
                      <Textarea
                        id="input-schema"
                        value={selectedInput.schema ? JSON.stringify(selectedInput.schema, null, 2) : ""}
                        onChange={(e) => {
                          try {
                            const schema = e.target.value ? JSON.parse(e.target.value) : undefined
                            updateInput(selectedInput.id, { schema })
                          } catch (error) {
                            // Handle JSON parse error
                          }
                        }}
                        placeholder='{"type": "object", "properties": {...}}'
                        className="font-mono text-sm min-h-[150px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Define the expected data structure for this input using JSON Schema.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full border rounded-md p-8">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">No Input Selected</h3>
                    <p className="text-muted-foreground mb-4">Select an input from the list or create a new one.</p>
                    <Button onClick={addInput}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Input
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="outputs">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 border rounded-md">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Output Ports</h3>
                  <Button size="sm" variant="ghost" onClick={addOutput}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {outputs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No outputs defined. Click "Add" to create one.
                  </div>
                ) : (
                  outputs.map((output) => (
                    <div
                      key={output.id}
                      className={`flex items-center justify-between p-3 border-b cursor-pointer hover:bg-muted/50 ${
                        selectedOutputId === output.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedOutputId(output.id)}
                    >
                      <div>
                        <div className="font-medium text-sm">{output.name}</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateOutput(output.id)
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteOutput(output.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="col-span-2">
              {selectedOutput ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Output Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="output-name">Name</Label>
                      <Input
                        id="output-name"
                        value={selectedOutput.name}
                        onChange={(e) => updateOutput(selectedOutput.id, { name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="output-description">Description</Label>
                      <Textarea
                        id="output-description"
                        value={selectedOutput.description || ""}
                        onChange={(e) => updateOutput(selectedOutput.id, { description: e.target.value })}
                        placeholder="Describe this output"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="output-schema">Schema (JSON)</Label>
                      <Textarea
                        id="output-schema"
                        value={selectedOutput.schema ? JSON.stringify(selectedOutput.schema, null, 2) : ""}
                        onChange={(e) => {
                          try {
                            const schema = e.target.value ? JSON.parse(e.target.value) : undefined
                            updateOutput(selectedOutput.id, { schema })
                          } catch (error) {
                            // Handle JSON parse error
                          }
                        }}
                        placeholder='{"type": "object", "properties": {...}}'
                        className="font-mono text-sm min-h-[150px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Define the data structure this output will produce using JSON Schema.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full border rounded-md p-8">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">No Output Selected</h3>
                    <p className="text-muted-foreground mb-4">Select an output from the list or create a new one.</p>
                    <Button onClick={addOutput}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Output
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
