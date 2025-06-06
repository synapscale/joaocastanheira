"use client"

import { useState, useEffect } from "react"
import { useVariables } from "@/context/variable-context"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VariableValueEditor } from "./variable-value-editor"
import type { Variable, VariableType, VariableScope } from "@/types/variable"

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  key: z
    .string()
    .min(1, "Key is required")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Key must start with a letter and contain only letters, numbers, and underscores",
    ),
  type: z.enum(["string", "number", "boolean", "json", "secret", "array", "date", "expression"]),
  scope: z.enum(["global", "workflow", "node"]),
  description: z.string().optional(),
  encrypted: z.boolean().default(false),
  // Value will be handled separately
})

type FormValues = z.infer<typeof formSchema>

interface VariableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variable?: Variable
  defaultScope?: VariableScope
}

export function VariableDialog({ open, onOpenChange, variable, defaultScope = "global" }: VariableDialogProps) {
  const { addVariable, updateVariable, getVariableByKey } = useVariables()
  const [value, setValue] = useState<any>(variable?.value ?? "")
  const isEditing = !!variable

  // Initialize the form with default values or existing variable values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: variable?.name || "",
      key: variable?.key || "",
      type: variable?.type || "string",
      scope: variable?.scope || defaultScope,
      description: variable?.description || "",
      encrypted: variable?.encrypted || false,
    },
  })

  // Update form values when variable changes
  useEffect(() => {
    if (variable) {
      form.reset({
        name: variable.name,
        key: variable.key,
        type: variable.type,
        scope: variable.scope,
        description: variable.description || "",
        encrypted: variable.encrypted || false,
      })
      setValue(variable.value)
    } else {
      form.reset({
        name: "",
        key: "",
        type: "string",
        scope: defaultScope,
        description: "",
        encrypted: false,
      })
      setValue("")
    }
  }, [variable, form, defaultScope])

  // Auto-generate key from name
  const autoGenerateKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
  }

  // Handle name change to auto-generate key if key is empty
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name && !form.getValues("key")) {
        form.setValue("key", autoGenerateKey(value.name as string))
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = (formData: FormValues) => {
    // Check if a variable with the same key already exists
    const existingVariable = getVariableByKey(formData.key, formData.scope)
    if (existingVariable && (!variable || existingVariable.id !== variable.id)) {
      form.setError("key", {
        type: "manual",
        message: `A variable with key "${formData.key}" already exists in the ${formData.scope} scope`,
      })
      return
    }

    if (isEditing && variable) {
      updateVariable(variable.id, {
        ...formData,
        value,
      })
    } else {
      addVariable({
        ...formData,
        value,
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Variable" : "Create Variable"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the properties of this variable"
              : "Define a new variable that can be used in your workflow"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="value">Value</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="API Key" {...field} />
                        </FormControl>
                        <FormDescription>Display name for this variable</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key</FormLabel>
                        <FormControl>
                          <Input placeholder="apiKey" {...field} />
                        </FormControl>
                        <FormDescription>Used to reference this variable in code</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="array">Array</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="expression">Expression</SelectItem>
                            <SelectItem value="secret">Secret</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The data type of this variable</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scope</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isEditing && variable?.isSystem}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a scope" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="workflow">Workflow</SelectItem>
                            <SelectItem value="node">Node</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Determines where this variable can be used</FormDescription>
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
                        <Textarea
                          placeholder="Describe what this variable is used for"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional description to help others understand this variable</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="encrypted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Encrypt Value</FormLabel>
                        <FormDescription>Encrypt this variable's value for sensitive data</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={form.watch("type") === "expression"}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="value" className="pt-4">
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <VariableValueEditor
                    type={form.watch("type") as VariableType}
                    value={value}
                    onChange={setValue}
                    encrypted={form.watch("encrypted")}
                  />
                  <FormDescription>
                    {form.watch("type") === "expression"
                      ? "Define a JavaScript expression that will be evaluated when the variable is used"
                      : "The value stored in this variable"}
                  </FormDescription>
                </FormItem>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Update Variable" : "Create Variable"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
