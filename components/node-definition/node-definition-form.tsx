"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, Undo } from "lucide-react"
import type { NodeDefinition, NodeParameter, NodePort } from "@/types/node-definition"
import { ParametersEditor } from "./parameters-editor"
import { PortsEditor } from "./ports-editor"
import { ExecutionSettingsEditor } from "./execution-settings-editor"
import { DocumentationEditor } from "./documentation-editor"

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  version: z.string().min(1, "Version is required"),
  author: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  deprecated: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  documentation: z.string().optional(),
  // These will be handled separately
  inputs: z.array(z.any()).optional(),
  outputs: z.array(z.any()).optional(),
  parameters: z.array(z.any()).optional(),
  executionSettings: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NodeDefinitionFormProps {
  initialData?: NodeDefinition
  onSubmit: (data: Omit<NodeDefinition, "id" | "createdAt" | "updatedAt">) => void
  isSubmitting: boolean
  onCancel: () => void
}

export function NodeDefinitionForm({ initialData, onSubmit, isSubmitting, onCancel }: NodeDefinitionFormProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [parameters, setParameters] = useState<NodeParameter[]>(initialData?.parameters || [])
  const [inputs, setInputs] = useState<NodePort[]>(initialData?.inputs || [])
  const [outputs, setOutputs] = useState<NodePort[]>(initialData?.outputs || [])
  const [executionSettings, setExecutionSettings] = useState(initialData?.executionSettings || {})
  const [documentation, setDocumentation] = useState(initialData?.documentation || "")

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      category: initialData?.category || "",
      description: initialData?.description || "",
      version: initialData?.version || "1.0.0",
      author: initialData?.author || "",
      icon: initialData?.icon || "",
      color: initialData?.color || "#6366f1",
      deprecated: initialData?.deprecated || false,
      tags: initialData?.tags || [],
      documentation: initialData?.documentation || "",
    },
  })

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = (values: FormValues) => {
    // Combine form values with the separately managed state
    const formData = {
      ...values,
      tags,
      parameters,
      inputs,
      outputs,
      executionSettings,
      documentation,
    }

    onSubmit(formData)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="ports">Ports</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="HTTP Request" {...field} />
                          </FormControl>
                          <FormDescription>The display name of the node</FormDescription>
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
                            <Input placeholder="httpRequest" {...field} />
                          </FormControl>
                          <FormDescription>The internal type identifier (camelCase)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              <SelectItem value="Communication">Communication</SelectItem>
                              <SelectItem value="Data">Data</SelectItem>
                              <SelectItem value="Flow">Flow</SelectItem>
                              <SelectItem value="Analytics">Analytics</SelectItem>
                              <SelectItem value="Transformation">Transformation</SelectItem>
                              <SelectItem value="Utilities">Utilities</SelectItem>
                              <SelectItem value="AI">AI</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>The category this node belongs to</FormDescription>
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
                            <Input placeholder="1.0.0" {...field} />
                          </FormControl>
                          <FormDescription>The version of this node definition</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Makes an HTTP request to a specified URL"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>A brief description of what this node does</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormDescription>The author of this node definition</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <Input placeholder="globe" {...field} />
                          </FormControl>
                          <FormDescription>The icon name from Lucide icons</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input type="text" placeholder="#6366f1" {...field} />
                            </FormControl>
                            <Input
                              type="color"
                              value={field.value}
                              onChange={field.onChange}
                              className="w-12 p-1 h-10"
                            />
                          </div>
                          <FormDescription>The primary color for this node</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deprecated"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Deprecated</FormLabel>
                            <FormDescription>Mark this node as deprecated</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="col-span-2">
                      <FormLabel>Tags</FormLabel>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                        <Button type="button" onClick={addTag} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>Tags help categorize and find nodes</FormDescription>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-6 mt-6">
              <ParametersEditor parameters={parameters} onChange={setParameters} />
            </TabsContent>

            <TabsContent value="ports" className="space-y-6 mt-6">
              <PortsEditor inputs={inputs} outputs={outputs} onInputsChange={setInputs} onOutputsChange={setOutputs} />
            </TabsContent>

            <TabsContent value="execution" className="space-y-6 mt-6">
              <ExecutionSettingsEditor settings={executionSettings} onChange={setExecutionSettings} />
            </TabsContent>

            <TabsContent value="documentation" className="space-y-6 mt-6">
              <DocumentationEditor value={documentation} onChange={setDocumentation} />
            </TabsContent>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <Undo className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Node Definition"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}
