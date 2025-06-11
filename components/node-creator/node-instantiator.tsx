"use client"

import { useState, useEffect } from "react"
import { nanoid } from "nanoid"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useWorkflow } from "@/context/workflow-context"
import { useNodeDefinitions } from "@/context/node-definition-context"
import type { NodeDefinition, NodeParameter } from "@/types/node-definition"
import type { Node } from "@/types/workflow"
import { NodeParameterField } from "@/components/node-editor/node-parameter-field"

// Esquema de validação para o formulário
const nodeInstanceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  disabled: z.boolean().default(false),
})

type NodeInstanceFormValues = z.infer<typeof nodeInstanceSchema>

interface NodeInstantiatorProps {
  templateId: string
  position?: { x: number; y: number }
  onClose: () => void
  onSuccess?: (nodeId: string) => void
}

export function NodeInstantiator({ templateId, position, onClose, onSuccess }: NodeInstantiatorProps) {
  const { toast } = useToast()
  const { addNode } = useWorkflow()
  const { getNodeDefinition, nodeDefinitions } = useNodeDefinitions()
  const [template, setTemplate] = useState<NodeDefinition | null>(null)
  const [paramValues, setParamValues] = useState<Record<string, any>>({})

  // Inicializar o formulário
  const form = useForm<NodeInstanceFormValues>({
    resolver: zodResolver(nodeInstanceSchema),
    defaultValues: {
      name: "",
      description: "",
      disabled: false,
    },
  })

  // Carregar o template quando o componente montar
  useEffect(() => {
    const nodeTemplate = getNodeDefinition(templateId)
    if (nodeTemplate) {
      setTemplate(nodeTemplate)
      form.setValue("name", nodeTemplate.name)

      // Inicializar valores padrão dos parâmetros
      const defaultValues: Record<string, any> = {}
      nodeTemplate.parameters.forEach((param) => {
        defaultValues[param.key] = param.default !== undefined ? param.default : null
      })
      setParamValues(defaultValues)
    }
  }, [templateId, getNodeDefinition, form])

  // Atualizar um valor de parâmetro
  const updateParamValue = (key: string, value: any) => {
    setParamValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Manipular o envio do formulário
  const onSubmit = (values: NodeInstanceFormValues) => {
    if (!template) {
      toast({
        title: "Erro",
        description: "Template de nó não encontrado.",
        variant: "destructive",
      })
      return
    }

    try {
      // Criar um novo nó a partir do template
      const newNode: Node = {
        id: `node-${nanoid(8)}`,
        type: template.type,
        name: values.name,
        description: values.description || "",
        position: position || { x: 100, y: 100 },
        inputs: template.inputs.map((input) => input.id),
        outputs: template.outputs.map((output) => output.id),
        width: 70,
        height: 70,
        data: {
          ...paramValues,
          templateId: template.id,
          code: template.codeTemplate || "",
        },
        locked: values.disabled,
      }

      // Adicionar o nó ao workflow
      addNode(newNode)

      toast({
        title: "Nó criado",
        description: `O nó "${values.name}" foi criado com sucesso.`,
      })

      // Chamar o callback de sucesso, se fornecido
      if (onSuccess) {
        onSuccess(newNode.id)
      }

      // Fechar o diálogo
      onClose()
    } catch (error) {
      console.error("Erro ao criar nó:", error)
      toast({
        title: "Erro ao criar nó",
        description: "Ocorreu um erro ao criar o nó.",
        variant: "destructive",
      })
    }
  }

  if (!template) {
    return (
      <div className="p-8 text-center">
        <p>Carregando template...</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Criar Nó: {template.name}</CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>O nome de exibição deste nó</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>Uma breve descrição deste nó (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {template.parameters.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Parâmetros</h3>
                  {template.parameters.map((param: NodeParameter) => (
                    <div key={param.id} className="space-y-2">
                      <NodeParameterField
                        parameter={param}
                        value={paramValues[param.key]}
                        onChange={(value) => updateParamValue(param.key, value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <FormField
                control={form.control}
                name="disabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Desabilitado</FormLabel>
                      <FormDescription>Desabilitar este nó no workflow</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Criar Nó</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
