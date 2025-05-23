"use client"

import { useState } from "react"
import { nanoid } from "nanoid"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import type { NodeDefinition, NodeCategory, NodeOperationMode } from "@/types/node-definition"
import { ParametersEditor } from "./parameters-editor"
import { InputsOutputsEditor } from "./inputs-outputs-editor"
import { ExecutionSettingsEditor } from "./execution-settings-editor"
import { CodeTemplateEditor } from "./code-template-editor"
import { DocumentationEditor } from "./documentation-editor"

// Validation schema for the node definition form
const nodeDefinitionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  category: z.string() as z.ZodType<NodeCategory>,
  description: z.string().min(1, "Description is required"),
  version: z.number().positive(),
  icon: z.string().optional(),
  iconColor: z.string().optional(),
  documentation: z.string().optional(),
  codeTemplate: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  deprecated: z.boolean().optional(),
})

type NodeDefinitionFormValues = z.infer<typeof nodeDefinitionSchema>

interface NodeDefinitionEditorProps {
  nodeDefinition?: NodeDefinition
  onSave: (definition: NodeDefinition) => void
  onCancel: () => void
}

export function NodeDefinitionEditor({ nodeDefinition, onSave, onCancel }: NodeDefinitionEditorProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [parameters, setParameters] = useState(nodeDefinition?.parameters || [])
  const [inputs, setInputs] = useState(nodeDefinition?.inputs || [])
  const [outputs, setOutputs] = useState(nodeDefinition?.outputs || [])
  const [execution, setExecution] = useState(
    nodeDefinition?.execution || {
      mode: "singleItem" as NodeOperationMode,
      timeout: 30000,
      retry: {
        enabled: false,
        count: 3,
        interval: 1000,
      },
      continueOnFail: false,
      throttle: {
        enabled: false,
        rate: 1,
        interval: "second",
      },
    },
  )

  // Initialize the form with existing values or defaults
  const form = useForm<NodeDefinitionFormValues>({
    resolver: zodResolver(nodeDefinitionSchema),
    defaultValues: {
      name: nodeDefinition?.name || "",
      type: nodeDefinition?.type || "",
      category: nodeDefinition?.category || "operations",
      description: nodeDefinition?.description || "",
      version: nodeDefinition?.version || 1,
      icon: nodeDefinition?.icon || "",
      iconColor: nodeDefinition?.iconColor || "#000000",
      documentation: nodeDefinition?.documentation || "",
      codeTemplate: nodeDefinition?.codeTemplate || "",
      author: nodeDefinition?.author || "",
      tags: nodeDefinition?.tags || [],
      deprecated: nodeDefinition?.deprecated || false,
    },
  })

  const onSubmit = (data: NodeDefinitionFormValues) => {
    try {
      const newDefinition: NodeDefinition = {
        id: nodeDefinition?.id || `node-def-${nanoid(6)}`,
        ...data,
        inputs,
        outputs,
        parameters,
        execution,
        createdAt: nodeDefinition?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      onSave(newDefinition)

      toast({
        title: "Node definition saved",
        description: "Your node definition has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving node definition:", error)
      toast({
        title: "Error saving node definition",
        description: "There was an error saving your node definition.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>{nodeDefinition ? "Edit Node Definition" : "Create Node Definition"}</CardTitle>
          <CardDescription>Define the properties, parameters, inputs, and outputs for your node.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="io">Inputs/Outputs</TabsTrigger>
                  <TabsTrigger value="execution">Execution</TabsTrigger>
                  <TabsTrigger value="code">Code Template</TabsTrigger>
                  <TabsTrigger value="docs">Documentation</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Node name" {...field} />
                          </FormControl>
                          <FormDescription>The display name of the node.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Node type" {...field} />
                          </FormControl>
                          <FormDescription>The technical type identifier for the node.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="triggers">Triggers</SelectItem>
                              <SelectItem value="operations">Operations</SelectItem>
                              <SelectItem value="flow">Flow Control</SelectItem>
                              <SelectItem value="transformations">Transformations</SelectItem>
                              <SelectItem value="ai">AI</SelectItem>
                              <SelectItem value="integrations">Integrations</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>The category this node belongs to.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>The version number of this node definition.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe what this node does" className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormDescription>A brief description of the node's functionality.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <Input placeholder="Icon name or URL" {...field} />
                          </FormControl>
                          <FormDescription>The icon name or URL for this node.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="iconColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" className="w-12 h-10 p-1" {...field} />
                              <Input type="text" placeholder="#000000" value={field.value} onChange={field.onChange} />
                            </div>
                          </FormControl>
                          <FormDescription>The color of the node's icon.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input placeholder="Author name" {...field} />
                        </FormControl>
                        <FormDescription>The creator of this node definition.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="parameters">
                  <ParametersEditor parameters={parameters} onChange={setParameters} />
                </TabsContent>

                <TabsContent value="io">
                  <InputsOutputsEditor
                    inputs={inputs}
                    outputs={outputs}
                    onInputsChange={setInputs}
                    onOutputsChange={setOutputs}
                  />
                </TabsContent>

                <TabsContent value="execution">
                  <ExecutionSettingsEditor execution={execution} onChange={setExecution} />
                </TabsContent>

                <TabsContent value="code">
                  <CodeTemplateEditor
                    value={form.watch("codeTemplate") || ""}
                    onChange={(value) => form.setValue("codeTemplate", value)}
                  />
                </TabsContent>

                <TabsContent value="docs">
                  <DocumentationEditor
                    value={form.watch("documentation") || ""}
                    onChange={(value) => form.setValue("documentation", value)}
                  />
                </TabsContent>
              </Tabs>

              <CardFooter className="flex justify-between px-0">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">Save Node Definition</Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
