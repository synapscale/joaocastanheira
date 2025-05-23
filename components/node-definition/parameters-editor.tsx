"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MoveUp, MoveDown } from "lucide-react"
import type { NodeParameter } from "@/types/node-definition"

interface ParametersEditorProps {
  parameters: NodeParameter[]
  onChange: (parameters: NodeParameter[]) => void
}

export function ParametersEditor({ parameters, onChange }: ParametersEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentParameter, setCurrentParameter] = useState<NodeParameter | null>(null)
  const [parameterOptions, setParameterOptions] = useState<{ label: string; value: string }[]>([])
  const [optionInput, setOptionInput] = useState({ label: "", value: "" })

  const defaultParameter: NodeParameter = {
    id: `param-${Date.now()}`,
    name: "",
    key: "",
    type: "string",
    description: "",
    required: false,
  }

  const handleAddParameter = () => {
    setCurrentParameter(defaultParameter)
    setParameterOptions([])
    setIsDialogOpen(true)
  }

  const handleEditParameter = (parameter: NodeParameter) => {
    setCurrentParameter(parameter)
    setParameterOptions(parameter.options || [])
    setIsDialogOpen(true)
  }

  const handleDeleteParameter = (id: string) => {
    onChange(parameters.filter((param) => param.id !== id))
  }

  const handleMoveParameter = (index: number, direction: "up" | "down") => {
    const newParameters = [...parameters]
    if (direction === "up" && index > 0) {
      ;[newParameters[index], newParameters[index - 1]] = [newParameters[index - 1], newParameters[index]]
    } else if (direction === "down" && index < parameters.length - 1) {
      ;[newParameters[index], newParameters[index + 1]] = [newParameters[index + 1], newParameters[index]]
    }
    onChange(newParameters)
  }

  const handleAddOption = () => {
    if (optionInput.label.trim() && optionInput.value.trim()) {
      setParameterOptions([...parameterOptions, { ...optionInput }])
      setOptionInput({ label: "", value: "" })
    }
  }

  const handleRemoveOption = (index: number) => {
    setParameterOptions(parameterOptions.filter((_, i) => i !== index))
  }

  const handleSaveParameter = () => {
    if (!currentParameter || !currentParameter.name || !currentParameter.key) return

    const updatedParameter = {
      ...currentParameter,
      options: parameterOptions.length > 0 ? parameterOptions : undefined,
    }

    const newParameters =
      currentParameter.id && parameters.some((p) => p.id === currentParameter.id)
        ? parameters.map((p) => (p.id === currentParameter.id ? updatedParameter : p))
        : [...parameters, updatedParameter]

    onChange(newParameters)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Parameters</CardTitle>
              <CardDescription>Define the parameters that users can configure for this node</CardDescription>
            </div>
            <Button onClick={handleAddParameter}>
              <Plus className="h-4 w-4 mr-2" />
              Add Parameter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {parameters.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-muted/20">
              <p className="text-muted-foreground mb-4">No parameters defined yet</p>
              <Button onClick={handleAddParameter} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Parameter
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parameters.map((parameter, index) => (
                  <TableRow key={parameter.id}>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleMoveParameter(index, "up")}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleMoveParameter(index, "down")}
                          disabled={index === parameters.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{parameter.name}</TableCell>
                    <TableCell>{parameter.key}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{parameter.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {parameter.required ? <Badge>Required</Badge> : <Badge variant="outline">Optional</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditParameter(parameter)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteParameter(parameter.id)}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentParameter?.id && parameters.some((p) => p.id === currentParameter.id)
                ? "Edit Parameter"
                : "Add Parameter"}
            </DialogTitle>
            <DialogDescription>Define the properties of this parameter</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="API Key"
                  value={currentParameter?.name || ""}
                  onChange={(e) => setCurrentParameter((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                />
                <p className="text-xs text-muted-foreground">The display name shown to users</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Key</label>
                <Input
                  placeholder="apiKey"
                  value={currentParameter?.key || ""}
                  onChange={(e) => setCurrentParameter((prev) => (prev ? { ...prev, key: e.target.value } : null))}
                />
                <p className="text-xs text-muted-foreground">The internal key used in code (camelCase)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={currentParameter?.type || "string"}
                  onValueChange={(value) =>
                    setCurrentParameter((prev) => (prev ? { ...prev, type: value as any } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="select">Select (Dropdown)</SelectItem>
                    <SelectItem value="multiSelect">Multi-Select</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="dateTime">Date & Time</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">The data type of this parameter</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Required</label>
                <div className="flex items-center h-10 space-x-2">
                  <Switch
                    checked={currentParameter?.required || false}
                    onCheckedChange={(checked) =>
                      setCurrentParameter((prev) => (prev ? { ...prev, required: checked } : null))
                    }
                  />
                  <span>{currentParameter?.required ? "Required" : "Optional"}</span>
                </div>
                <p className="text-xs text-muted-foreground">Whether this parameter must be provided</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter the API key for authentication"
                value={currentParameter?.description || ""}
                onChange={(e) =>
                  setCurrentParameter((prev) => (prev ? { ...prev, description: e.target.value } : null))
                }
              />
              <p className="text-xs text-muted-foreground">Explain what this parameter is used for</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Default Value</label>
              <Input
                placeholder="Default value"
                value={currentParameter?.default || ""}
                onChange={(e) => setCurrentParameter((prev) => (prev ? { ...prev, default: e.target.value } : null))}
              />
              <p className="text-xs text-muted-foreground">The default value for this parameter</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Placeholder</label>
              <Input
                placeholder="Enter your API key..."
                value={currentParameter?.placeholder || ""}
                onChange={(e) =>
                  setCurrentParameter((prev) => (prev ? { ...prev, placeholder: e.target.value } : null))
                }
              />
              <p className="text-xs text-muted-foreground">Placeholder text shown in the input field</p>
            </div>

            {(currentParameter?.type === "select" || currentParameter?.type === "multiSelect") && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="options">
                  <AccordionTrigger>Options</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Label"
                          value={optionInput.label}
                          onChange={(e) => setOptionInput({ ...optionInput, label: e.target.value })}
                        />
                        <Input
                          placeholder="Value"
                          value={optionInput.value}
                          onChange={(e) => setOptionInput({ ...optionInput, value: e.target.value })}
                        />
                        <Button type="button" onClick={handleAddOption} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {parameterOptions.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Label</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {parameterOptions.map((option, index) => (
                                <TableRow key={index}>
                                  <TableCell>{option.label}</TableCell>
                                  <TableCell>{option.value}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveOption(index)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-sm text-muted-foreground">No options added yet</div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="validation">
                <AccordionTrigger>Validation</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {(currentParameter?.type === "string" || currentParameter?.type === "number") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Min</label>
                          <Input
                            type={currentParameter.type === "number" ? "number" : "text"}
                            placeholder={currentParameter.type === "number" ? "0" : "Min length"}
                            value={currentParameter?.validation?.min || ""}
                            onChange={(e) =>
                              setCurrentParameter((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      validation: {
                                        ...prev.validation,
                                        min: e.target.value ? Number(e.target.value) : undefined,
                                      },
                                    }
                                  : null,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Max</label>
                          <Input
                            type={currentParameter.type === "number" ? "number" : "text"}
                            placeholder={currentParameter.type === "number" ? "100" : "Max length"}
                            value={currentParameter?.validation?.max || ""}
                            onChange={(e) =>
                              setCurrentParameter((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      validation: {
                                        ...prev.validation,
                                        max: e.target.value ? Number(e.target.value) : undefined,
                                      },
                                    }
                                  : null,
                              )
                            }
                          />
                        </div>
                      </div>
                    )}

                    {currentParameter?.type === "string" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Pattern (Regex)</label>
                        <Input
                          placeholder="^[a-zA-Z0-9]+$"
                          value={currentParameter?.validation?.pattern || ""}
                          onChange={(e) =>
                            setCurrentParameter((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    validation: {
                                      ...prev.validation,
                                      pattern: e.target.value || undefined,
                                    },
                                  }
                                : null,
                            )
                          }
                        />
                        <p className="text-xs text-muted-foreground">Regular expression pattern for validation</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Custom Validation</label>
                      <Textarea
                        placeholder="function validate(value) { return value !== ''; }"
                        value={currentParameter?.validation?.customValidation || ""}
                        onChange={(e) =>
                          setCurrentParameter((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  validation: {
                                    ...prev.validation,
                                    customValidation: e.target.value || undefined,
                                  },
                                }
                              : null,
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">JavaScript function to validate this parameter</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="displayOptions">
                <AccordionTrigger>Display Conditions</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Show when parameter</label>
                      <Select
                        value={currentParameter?.displayOptions?.show?.parameter || ""}
                        onValueChange={(value) =>
                          setCurrentParameter((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  displayOptions: {
                                    ...prev.displayOptions,
                                    show: {
                                      ...prev.displayOptions?.show,
                                      parameter: value || undefined,
                                    },
                                  },
                                }
                              : null,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Always show</SelectItem>
                          {parameters
                            .filter((p) => p.id !== currentParameter?.id)
                            .map((p) => (
                              <SelectItem key={p.id} value={p.key}>
                                {p.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentParameter?.displayOptions?.show?.parameter && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Has value</label>
                        <Input
                          placeholder="true, 'option1', etc."
                          value={currentParameter?.displayOptions?.show?.value || ""}
                          onChange={(e) =>
                            setCurrentParameter((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    displayOptions: {
                                      ...prev.displayOptions,
                                      show: {
                                        ...prev.displayOptions?.show,
                                        value: e.target.value || undefined,
                                      },
                                    },
                                  }
                                : null,
                            )
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Show this parameter when the selected parameter has this value
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveParameter}>Save Parameter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
