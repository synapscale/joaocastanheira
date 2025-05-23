"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MoveUp, MoveDown } from "lucide-react"
import type { NodePort } from "@/types/node-definition"

interface PortsEditorProps {
  inputs: NodePort[]
  outputs: NodePort[]
  onInputsChange: (inputs: NodePort[]) => void
  onOutputsChange: (outputs: NodePort[]) => void
}

export function PortsEditor({ inputs, outputs, onInputsChange, onOutputsChange }: PortsEditorProps) {
  const [activeTab, setActiveTab] = useState("inputs")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPort, setCurrentPort] = useState<NodePort | null>(null)
  const [portType, setPortType] = useState<"input" | "output">("input")

  const defaultPort: NodePort = {
    id: `port-${Date.now()}`,
    name: "",
    description: "",
    required: false,
    multiple: false,
  }

  const handleAddPort = (type: "input" | "output") => {
    setPortType(type)
    setCurrentPort(defaultPort)
    setIsDialogOpen(true)
  }

  const handleEditPort = (port: NodePort, type: "input" | "output") => {
    setPortType(type)
    setCurrentPort(port)
    setIsDialogOpen(true)
  }

  const handleDeletePort = (id: string, type: "input" | "output") => {
    if (type === "input") {
      onInputsChange(inputs.filter((port) => port.id !== id))
    } else {
      onOutputsChange(outputs.filter((port) => port.id !== id))
    }
  }

  const handleMovePort = (index: number, direction: "up" | "down", type: "input" | "output") => {
    if (type === "input") {
      const newInputs = [...inputs]
      if (direction === "up" && index > 0) {
        ;[newInputs[index], newInputs[index - 1]] = [newInputs[index - 1], newInputs[index]]
      } else if (direction === "down" && index < inputs.length - 1) {
        ;[newInputs[index], newInputs[index + 1]] = [newInputs[index + 1], newInputs[index]]
      }
      onInputsChange(newInputs)
    } else {
      const newOutputs = [...outputs]
      if (direction === "up" && index > 0) {
        ;[newOutputs[index], newOutputs[index - 1]] = [newOutputs[index - 1], newOutputs[index]]
      } else if (direction === "down" && index < outputs.length - 1) {
        ;[newOutputs[index], newOutputs[index + 1]] = [newOutputs[index + 1], newOutputs[index]]
      }
      onOutputsChange(newOutputs)
    }
  }

  const handleSavePort = () => {
    if (!currentPort || !currentPort.name) return

    if (portType === "input") {
      const newInputs =
        currentPort.id && inputs.some((p) => p.id === currentPort.id)
          ? inputs.map((p) => (p.id === currentPort.id ? currentPort : p))
          : [...inputs, { ...currentPort, id: `input-${Date.now()}` }]

      onInputsChange(newInputs)
    } else {
      const newOutputs =
        currentPort.id && outputs.some((p) => p.id === currentPort.id)
          ? outputs.map((p) => (p.id === currentPort.id ? currentPort : p))
          : [...outputs, { ...currentPort, id: `output-${Date.now()}` }]

      onOutputsChange(newOutputs)
    }

    setIsDialogOpen(false)
  }

  const renderPortsTable = (ports: NodePort[], type: "input" | "output") => {
    if (ports.length === 0) {
      return (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground mb-4">No {type} ports defined yet</p>
          <Button onClick={() => handleAddPort(type)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First {type === "input" ? "Input" : "Output"} Port
          </Button>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Required</TableHead>
            <TableHead>Multiple</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((port, index) => (
            <TableRow key={port.id}>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMovePort(index, "up", type)}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMovePort(index, "down", type)}
                    disabled={index === ports.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{port.name}</TableCell>
              <TableCell className="max-w-[200px] truncate">{port.description}</TableCell>
              <TableCell>
                {port.required ? <Badge>Required</Badge> : <Badge variant="outline">Optional</Badge>}
              </TableCell>
              <TableCell>
                {port.multiple ? <Badge variant="secondary">Multiple</Badge> : <Badge variant="outline">Single</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditPort(port, type)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePort(port.id, type)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inputs">
            Inputs
            {inputs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {inputs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outputs">
            Outputs
            {outputs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {outputs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inputs">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Input Ports</CardTitle>
                  <CardDescription>Define the input ports for receiving data from other nodes</CardDescription>
                </div>
                <Button onClick={() => handleAddPort("input")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Input
                </Button>
              </div>
            </CardHeader>
            <CardContent>{renderPortsTable(inputs, "input")}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outputs">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Output Ports</CardTitle>
                  <CardDescription>Define the output ports for sending data to other nodes</CardDescription>
                </div>
                <Button onClick={() => handleAddPort("output")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Output
                </Button>
              </div>
            </CardHeader>
            <CardContent>{renderPortsTable(outputs, "output")}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentPort?.id && (portType === "input" ? inputs : outputs).some((p) => p.id === currentPort.id)
                ? `Edit ${portType === "input" ? "Input" : "Output"} Port`
                : `Add ${portType === "input" ? "Input" : "Output"} Port`}
            </DialogTitle>
            <DialogDescription>Define the properties of this {portType} port</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Data Input"
                value={currentPort?.name || ""}
                onChange={(e) => setCurrentPort((prev) => (prev ? { ...prev, name: e.target.value } : null))}
              />
              <p className="text-xs text-muted-foreground">The display name of this port</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Receives data for processing"
                value={currentPort?.description || ""}
                onChange={(e) => setCurrentPort((prev) => (prev ? { ...prev, description: e.target.value } : null))}
              />
              <p className="text-xs text-muted-foreground">Explain what kind of data this port expects or provides</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Required</label>
                <div className="flex items-center h-10 space-x-2">
                  <Switch
                    checked={currentPort?.required || false}
                    onCheckedChange={(checked) =>
                      setCurrentPort((prev) => (prev ? { ...prev, required: checked } : null))
                    }
                  />
                  <span>{currentPort?.required ? "Required" : "Optional"}</span>
                </div>
                <p className="text-xs text-muted-foreground">Whether this port must be connected</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Multiple Connections</label>
                <div className="flex items-center h-10 space-x-2">
                  <Switch
                    checked={currentPort?.multiple || false}
                    onCheckedChange={(checked) =>
                      setCurrentPort((prev) => (prev ? { ...prev, multiple: checked } : null))
                    }
                  />
                  <span>{currentPort?.multiple ? "Multiple" : "Single"}</span>
                </div>
                <p className="text-xs text-muted-foreground">Whether this port can connect to multiple nodes</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Schema (JSON)</label>
              <Textarea
                placeholder='{"type": "object", "properties": {...}}'
                value={currentPort?.schema ? JSON.stringify(currentPort.schema, null, 2) : ""}
                onChange={(e) => {
                  try {
                    const schema = e.target.value ? JSON.parse(e.target.value) : undefined
                    setCurrentPort((prev) => (prev ? { ...prev, schema } : null))
                  } catch (error) {
                    // Handle invalid JSON
                  }
                }}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">JSON Schema defining the data structure (optional)</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePort}>Save {portType === "input" ? "Input" : "Output"} Port</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
