"use client"

import type React from "react"

import { useState } from "react"
import { nanoid } from "nanoid"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useNodeDefinitions } from "@/context/node-definition-context"
import { PortsEditor } from "@/components/node-definition/ports-editor"
import { ParametersEditor } from "@/components/node-definition/parameters-editor"
import { CodeEditor } from "@/components/node-editor/code-editor"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, ArrowLeft } from "lucide-react"
import type { NodeDefinition, NodeParameter, NodePort } from "@/types/node-definition"

// Esquema de validação para o formulário
const nodeTemplateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  version: z.string().min(1, "Versão é obrigatória"),
  color: z.string().optional(),
  icon: z.string().optional(),
  author: z.string().optional(),
  deprecated: z.boolean().default(false),
  documentation: z.string().optional(),
})

type NodeTemplateFormValues = z.infer<typeof nodeTemplateSchema>

interface NodeTemplateCreatorProps {
  initialData?: NodeDefinition
  onCancel: () => void
}

export function NodeTemplateCreator({ initialData, onCancel }: NodeTemplateCreatorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { addNodeDefinition, updateNodeDefinition } = useNodeDefinitions()
  const [activeTab, setActiveTab] = useState("basic")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [parameters, setParameters] = useState<NodeParameter[]>(initialData?.parameters || [])
  const [inputs, setInputs] = useState<NodePort[]>(initialData?.inputs || [])
  const [outputs, setOutputs] = useState<NodePort[]>(initialData?.outputs || [])
  const [codeTemplate, setCodeTemplate] = useState<string>(
    initialData?.codeTemplate ||
      `// Este código será executado quando o nó for acionado
// $input contém os dados de entrada
// Você deve retornar os dados que serão passados para o próximo nó

// Exemplo: Adicionar um campo a cada item
return $input.map(item => {
  return {
    ...item,
    newField: "Valor adicionado pelo nó personalizado"
  };
});`,
  )

  // Inicializar o formulário com valores padrão ou existentes
  const form = useForm<NodeTemplateFormValues>({
    resolver: zodResolver(nodeTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      category: initialData?.category || "custom",
      description: initialData?.description || "",
      version: initialData?.version || "1.0.0",
      color: initialData?.color || "#6366f1",
      icon: initialData?.icon || "box",
      author: initialData?.author || "",
      deprecated: initialData?.deprecated || false,
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

  const onSubmit = (values: NodeTemplateFormValues) => {
    try {
      // Validar que temos pelo menos uma entrada e uma saída
      if (inputs.length === 0) {
        toast({
          title: "Erro de validação",
          description: "O nó deve ter pelo menos uma porta de entrada",
          variant: "destructive",
        })
        setActiveTab("ports")
        return
      }

      if (outputs.length === 0) {
        toast({
          title: "Erro de validação",
          description: "O nó deve ter pelo menos uma porta de saída",
          variant: "destructive",
        })
        setActiveTab("ports")
        return
      }

      // Criar ou atualizar a definição do nó
      const nodeDefinition: NodeDefinition = {
        id: initialData?.id || `node-def-${nanoid(8)}`,
        name: values.name,
        type: values.type,
        category: values.category,
        description: values.description,
        version: values.version,
        color: values.color,
        icon: values.icon,
        author: values.author,
        deprecated: values.deprecated,
        tags,
        inputs,
        outputs,
        parameters,
        codeTemplate,
        documentation: values.documentation,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      if (initialData) {
        updateNodeDefinition(initialData.id, nodeDefinition)
        toast({
          title: "Template de nó atualizado",
          description: `O template "${values.name}" foi atualizado com sucesso.`,
        })
      } else {
        addNodeDefinition(nodeDefinition)
        toast({
          title: "Template de nó criado",
          description: `O template "${values.name}" foi criado com sucesso.`,
        })
      }

      // Redirecionar para a lista de templates
      router.push("/node-definitions")
    } catch (error) {
      console.error("Erro ao salvar template de nó:", error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o template de nó.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onCancel} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">{initialData ? "Editar Template de Nó" : "Criar Novo Template de Nó"}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="ports">Portas</TabsTrigger>
          <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
          <TabsTrigger value="code">Código</TabsTrigger>
          <TabsTrigger value="documentation">Documentação</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>Defina as informações básicas para o seu template de nó.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Transformador de Dados" {...field} />
                          </FormControl>
                          <FormDescription>O nome de exibição do nó</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <FormControl>
                            <Input placeholder="dataTransformer" {...field} />
                          </FormControl>
                          <FormDescription>O identificador técnico do nó (camelCase)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="triggers">Gatilhos</SelectItem>
                              <SelectItem value="operations">Operações</SelectItem>
                              <SelectItem value="flow">Controle de Fluxo</SelectItem>
                              <SelectItem value="transformations">Transformações</SelectItem>
                              <SelectItem value="ai">IA</SelectItem>
                              <SelectItem value="integrations">Integrações</SelectItem>
                              <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>A categoria a que este nó pertence</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Versão</FormLabel>
                          <FormControl>
                            <Input placeholder="1.0.0" {...field} />
                          </FormControl>
                          <FormDescription>A versão deste template de nó</FormDescription>
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
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Este nó transforma dados de entrada aplicando operações personalizadas."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Uma breve descrição do que este nó faz</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ícone</FormLabel>
                          <FormControl>
                            <Input placeholder="box" {...field} />
                          </FormControl>
                          <FormDescription>O nome do ícone do Lucide (ex: box, code, database)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input type="text" placeholder="#6366f1" {...field} />
                            </FormControl>
                            <Input
                              type="color"
                              value={field.value || "#6366f1"}
                              onChange={field.onChange}
                              className="w-12 p-1 h-10"
                            />
                          </div>
                          <FormDescription>A cor principal para este nó</FormDescription>
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
                        <FormLabel>Autor</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu Nome" {...field} />
                        </FormControl>
                        <FormDescription>O autor deste template de nó</FormDescription>
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
                          <FormLabel className="text-base">Descontinuado</FormLabel>
                          <FormDescription>Marcar este nó como descontinuado</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div>
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
                        placeholder="Adicionar tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>Tags ajudam a categorizar e encontrar nós</FormDescription>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portas de Entrada e Saída</CardTitle>
                  <CardDescription>
                    Defina as portas de entrada e saída para o seu nó. Cada nó deve ter pelo menos uma porta de entrada
                    e uma de saída.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PortsEditor
                    inputs={inputs}
                    outputs={outputs}
                    onInputsChange={setInputs}
                    onOutputsChange={setOutputs}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parâmetros</CardTitle>
                  <CardDescription>Defina os parâmetros que os usuários podem configurar para este nó.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ParametersEditor parameters={parameters} onChange={setParameters} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template de Código</CardTitle>
                  <CardDescription>
                    Defina o código padrão que será executado quando este nó for acionado.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] border rounded-md">
                    <CodeEditor
                      value={codeTemplate}
                      onChange={setCodeTemplate}
                      language="javascript"
                      fontSize={14}
                      showLineNumbers={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use $input para acessar os dados de entrada e retorne os dados que serão passados para o próximo nó.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documentation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documentação</CardTitle>
                  <CardDescription>Forneça documentação detalhada sobre como usar este nó.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="documentation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="# Como usar este nó

## Entradas
Descreva as entradas esperadas.

## Parâmetros
Explique cada parâmetro.

## Saídas
Descreva as saídas geradas.

## Exemplos
Forneça exemplos de uso."
                            className="min-h-[400px] font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use Markdown para formatar a documentação. Inclua exemplos de uso.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {initialData ? "Atualizar Template" : "Criar Template"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}
