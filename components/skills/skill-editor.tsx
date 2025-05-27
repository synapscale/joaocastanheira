"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Skill, SkillType, SkillLanguage, SkillPort, DataType } from "@/types/skill-types"
import { useSkillsStore } from "@/stores/use-skills-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Plus, Trash, Save, Play, Code, Info, Tag, Database } from "lucide-react"
import { skillExecutionEngine } from "@/services/skill-execution-engine"

// Schema para validação do formulário
const skillFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  type: z.string(),
  author: z.string().min(2, "O autor deve ter pelo menos 2 caracteres"),
  implementation: z.object({
    language: z.string(),
    code: z.string().min(1, "O código não pode estar vazio"),
    dependencies: z.array(z.string()).optional(),
  }),
  metadata: z
    .object({
      tags: z.array(z.string()).optional(),
      category: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      documentation: z.string().optional(),
    })
    .optional(),
})

type SkillFormValues = z.infer<typeof skillFormSchema>

interface SkillEditorProps {
  skillId?: string
  onSave?: (skillId: string) => void
  onCancel?: () => void
}

/**
 * SkillEditor component
 *
 * Component to edit or create a skill.
 */
export function SkillEditor({ skillId, onSave, onCancel }: SkillEditorProps) {
  const { getSkill, addSkill, updateSkill } = useSkillsStore()
  const [activeTab, setActiveTab] = useState("basic")
  const [inputs, setInputs] = useState<SkillPort[]>([])
  const [outputs, setOutputs] = useState<SkillPort[]>([])
  const [isPortDialogOpen, setIsPortDialogOpen] = useState(false)
  const [currentPort, setCurrentPort] = useState<SkillPort | null>(null)
  const [isEditingPort, setIsEditingPort] = useState(false)
  const [isInputPort, setIsInputPort] = useState(true)
  const [testInputs, setTestInputs] = useState<Record<string, any>>({})
  const [testProperties, setTestProperties] = useState<Record<string, any>>({})
  const [testResult, setTestResult] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Inicializar o formulário
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "data-transformation",
      author: "Usuário",
      implementation: {
        language: "javascript",
        code: `// Código da skill
// Recebe inputs e properties, retorna outputs

// Exemplo:
// return {
//   result: inputs.value * 2
// };

// Você pode usar console.log para depuração
console.log("Inputs:", inputs);
console.log("Properties:", properties);

// Processamento
const result = inputs.value ? inputs.value * 2 : 0;

// Retornar outputs
return {
 result: result
};`,
        dependencies: [],
      },
      metadata: {
        tags: [],
        category: "",
        icon: "",
        color: "",
        documentation: "",
      },
    },
  })

  // Carregar skill existente, se fornecida
  useEffect(() => {
    if (skillId) {
      const skill = getSkill(skillId)
      if (skill) {
        form.reset({
          name: skill.name,
          description: skill.description,
          type: skill.type,
          author: skill.author,
          implementation: {
            language: skill.implementation.language,
            code: skill.implementation.code,
            dependencies: skill.implementation.dependencies || [],
          },
          metadata: {
            tags: skill.metadata?.tags || [],
            category: skill.metadata?.category || "",
            icon: skill.metadata?.icon || "",
            color: skill.metadata?.color || "",
            documentation: skill.metadata?.documentation || "",
          },
        })

        setInputs(skill.inputs)
        setOutputs(skill.outputs)

        // Inicializar inputs de teste
        const initialTestInputs: Record<string, any> = {}
        skill.inputs.forEach((input) => {
          initialTestInputs[input.id] = input.defaultValue !== undefined ? input.defaultValue : null
        })
        setTestInputs(initialTestInputs)
      }
    }
  }, [skillId, getSkill, form])

  /**
   * Handles the form submission.
   * @param values The form values.
   */
  const handleSubmit = (values: SkillFormValues) => {
    if (skillId) {
      // Atualizar skill existente
      updateSkill(skillId, {
        name: values.name,
        description: values.description,
        type: values.type as SkillType,
        author: values.author,
        inputs,
        outputs,
        implementation: {
          language: values.implementation.language as SkillLanguage,
          code: values.implementation.code,
          dependencies: values.implementation.dependencies,
        },
        metadata: values.metadata,
      })

      if (onSave) onSave(skillId)
    } else {
      // Criar nova skill
      const newSkillId = addSkill({
        name: values.name,
        description: values.description,
        type: values.type as SkillType,
        author: values.author,
        inputs,
        outputs,
        implementation: {
          language: values.implementation.language as SkillLanguage,
          code: values.implementation.code,
          dependencies: values.implementation.dependencies,
        },
        metadata: values.metadata,
      })

      if (onSave) onSave(newSkillId)
    }
  }

  /**
   * Handles adding a new port.
   * @param isInput Whether the port is an input or output.
   */
  const handleAddPort = (isInput: boolean) => {
    setIsInputPort(isInput)
    setIsEditingPort(false)
    setCurrentPort({
      id: "",
      name: "",
      description: "",
      dataType: "string",
      required: false,
      multiple: false,
    })
    setIsPortDialogOpen(true)
  }

  /**
   * Handles editing an existing port.
   * @param port The port to edit.
   * @param isInput Whether the port is an input or output.
   */
  const handleEditPort = (port: SkillPort, isInput: boolean) => {
    setIsInputPort(isInput)
    setIsEditingPort(true)
    setCurrentPort({ ...port })
    setIsPortDialogOpen(true)
  }

  /**
   * Handles saving a port.
   * @param port The port to save.
   */
  const handleSavePort = (port: SkillPort) => {
    if (isInputPort) {
      if (isEditingPort) {
        setInputs(inputs.map((p) => (p.id === port.id ? port : p)))
      } else {
        setInputs([...inputs, { ...port, id: port.id || `input_${Date.now()}` }])
      }
    } else {
      if (isEditingPort) {
        setOutputs(outputs.map((p) => (p.id === port.id ? port : p)))
      } else {
        setOutputs([...outputs, { ...port, id: port.id || `output_${Date.now()}` }])
      }
    }

    setIsPortDialogOpen(false)
  }

  /**
   * Handles removing a port.
   * @param portId The ID of the port to remove.
   * @param isInput Whether the port is an input or output.
   */
  const handleRemovePort = (portId: string, isInput: boolean) => {
    if (isInput) {
      setInputs(inputs.filter((p) => p.id !== portId))
    } else {
      setOutputs(outputs.filter((p) => p.id !== portId))
    }
  }

  /**
   * Handles running a test of the skill.
   */
  const handleRunTest = async () => {
    setIsRunning(true)
    setTestResult(null)

    try {
      // Criar uma skill temporária com os valores atuais do formulário
      const formValues = form.getValues()
      const tempSkill: Skill = {
        id: skillId || "temp-skill",
        name: formValues.name,
        description: formValues.description,
        type: formValues.type as SkillType,
        version: "test",
        author: formValues.author,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputs,
        outputs,
        implementation: {
          language: formValues.implementation.language as SkillLanguage,
          code: formValues.implementation.code,
          dependencies: formValues.implementation.dependencies,
        },
        metadata: formValues.metadata,
      }

      // Executar a skill
      const result = await skillExecutionEngine.executeSkill(tempSkill, testInputs, testProperties, {
        nodeId: "test-node",
        workflowId: "test-workflow",
        executionId: `test-${Date.now()}`,
        timestamp: Date.now(),
      })

      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        outputs: {},
        error: {
          message: error.message,
          details: error,
        },
      })
    } finally {
      setIsRunning(false)
    }
  }

  /**
   * Renders the test input editor based on the data type.
   * @param input The skill port.
   * @returns The test input editor.
   */
  const renderTestInputEditor = (input: SkillPort) => {
    const value = testInputs[input.id]

    switch (input.dataType) {
      case "string":
        return (
          <Input value={value || ""} onChange={(e) => setTestInputs({ ...testInputs, [input.id]: e.target.value })} />
        )
      case "number":
        return (
          <Input
            type="number"
            value={value !== undefined ? value : ""}
            onChange={(e) => setTestInputs({ ...testInputs, [input.id]: Number(e.target.value) })}
          />
        )
      case "boolean":
        return (
          <Select
            value={value !== undefined ? String(value) : "false"}
            onValueChange={(val) => setTestInputs({ ...testInputs, [input.id]: val === "true" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um valor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Verdadeiro</SelectItem>
              <SelectItem value="false">Falso</SelectItem>
            </SelectContent>
          </Select>
        )
      case "object":
      case "array":
        return (
          <Textarea
            value={value !== undefined ? JSON.stringify(value, null, 2) : ""}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                setTestInputs({ ...testInputs, [input.id]: parsed })
              } catch (error) {
                // Ignorar erros de parsing durante a digitação
              }
            }}
            className="font-mono text-xs"
          />
        )
      default:
        return (
          <Input value={value || ""} onChange={(e) => setTestInputs({ ...testInputs, [input.id]: e.target.value })} />
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{skillId ? "Editar Skill" : "Nova Skill"}</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basic">
            <Info className="w-4 h-4 mr-2" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="ports">
            <Database className="w-4 h-4 mr-2" />
            Portas
          </TabsTrigger>
          <TabsTrigger value="implementation">
            <Code className="w-4 h-4 mr-2" />
            Implementação
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Tag className="w-4 h-4 mr-2" />
            Metadados
          </TabsTrigger>
          <TabsTrigger value="test">
            <Play className="w-4 h-4 mr-2" />
            Testar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...form.register("name")} placeholder="Nome da skill" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data-transformation">Transformação de Dados</SelectItem>
                  <SelectItem value="data-input">Entrada de Dados</SelectItem>
                  <SelectItem value="data-output">Saída de Dados</SelectItem>
                  <SelectItem value="control-flow">Fluxo de Controle</SelectItem>
                  <SelectItem value="ui-interaction">Interação UI</SelectItem>
                  <SelectItem value="integration">Integração</SelectItem>
                  <SelectItem value="ai">Inteligência Artificial</SelectItem>
                  <SelectItem value="utility">Utilitário</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Descreva o que esta skill faz"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Autor</Label>
            <Input id="author" {...form.register("author")} placeholder="Nome do autor" />
            {form.formState.errors.author && (
              <p className="text-sm text-red-500">{form.formState.errors.author.message}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ports" className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Entradas</h3>
              <Button variant="outline" size="sm" onClick={() => handleAddPort(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Entrada
              </Button>
            </div>

            {inputs.length === 0 ? (
              <div className="text-center p-4 border rounded-md bg-muted">
                <p className="text-muted-foreground">Nenhuma entrada definida</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inputs.map((input) => (
                  <Card key={input.id}>
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base">{input.name}</CardTitle>
                          <CardDescription>{input.id}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPort(input, true)}>
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemovePort(input.id, true)}>
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Tipo:</span> {input.dataType}
                        </div>
                        <div>
                          <span className="font-medium">Obrigatório:</span> {input.required ? "Sim" : "Não"}
                        </div>
                        {input.description && (
                          <div className="col-span-2">
                            <span className="font-medium">Descrição:</span> {input.description}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Saídas</h3>
              <Button variant="outline" size="sm" onClick={() => handleAddPort(false)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Saída
              </Button>
            </div>

            {outputs.length === 0 ? (
              <div className="text-center p-4 border rounded-md bg-muted">
                <p className="text-muted-foreground">Nenhuma saída definida</p>
              </div>
            ) : (
              <div className="space-y-2">
                {outputs.map((output) => (
                  <Card key={output.id}>
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base">{output.name}</CardTitle>
                          <CardDescription>{output.id}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPort(output, false)}>
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemovePort(output.id, false)}>
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Tipo:</span> {output.dataType}
                        </div>
                        {output.description && (
                          <div className="col-span-2">
                            <span className="font-medium">Descrição:</span> {output.description}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="implementation.language">Linguagem</Label>
            <Select
              value={form.watch("implementation.language")}
              onValueChange={(value) => form.setValue("implementation.language", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma linguagem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementation.code">Código</Label>
            <Textarea
              id="implementation.code"
              {...form.register("implementation.code")}
              className="font-mono h-80"
              placeholder="// Código da skill"
            />
            {form.formState.errors.implementation?.code && (
              <p className="text-sm text-red-500">{form.formState.errors.implementation.code.message}</p>
            )}
          </div>

          <div className="p-4 border rounded-md bg-muted">
            <h4 className="font-medium mb-2">Ajuda</h4>
            <p className="text-sm text-muted-foreground mb-2">
              O código da skill deve retornar um objeto com as saídas definidas. Por exemplo:
            </p>
            <pre className="text-xs bg-background p-2 rounded">
              {`// Acessar entradas
const value = inputs.myInput;

// Processar dados
const result = value * 2;

// Retornar saídas
return {
 myOutput: result
};`}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="metadata.tags">Tags (separadas por vírgula)</Label>
            <Input
              id="metadata.tags"
              value={form.watch("metadata.tags")?.join(", ") || ""}
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                form.setValue("metadata.tags", tags)
              }}
              placeholder="data, transformation, string, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metadata.category">Categoria</Label>
              <Input id="metadata.category" {...form.register("metadata.category")} placeholder="Categoria da skill" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata.icon">Ícone</Label>
              <Input id="metadata.icon" {...form.register("metadata.icon")} placeholder="Nome do ícone (Lucide)" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata.color">Cor</Label>
            <div className="flex space-x-2">
              <Input type="color" id="metadata.color" {...form.register("metadata.color")} className="w-12" />
              <Input
                value={form.watch("metadata.color") || ""}
                onChange={(e) => form.setValue("metadata.color", e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata.documentation">Documentação</Label>
            <Textarea
              id="metadata.documentation"
              {...form.register("metadata.documentation")}
              placeholder="Documentação detalhada da skill"
              rows={5}
            />
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Entradas de Teste</h3>

              {inputs.length === 0 ? (
                <div className="text-center p-4 border rounded-md bg-muted">
                  <p className="text-muted-foreground">Nenhuma entrada definida</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inputs.map((input) => (
                    <div key={input.id} className="space-y-2">
                      <Label htmlFor={`test-input-${input.id}`}>
                        {input.name} ({input.dataType}){input.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderTestInputEditor(input)}
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-lg font-medium mt-6">Propriedades de Teste</h3>
              <Textarea
                value={JSON.stringify(testProperties, null, 2)}
                onChange={(e) => {
                  try {
                    setTestProperties(JSON.parse(e.target.value))
                  } catch (error) {
                    // Ignorar erros de parsing durante a digitação
                  }
                }}
                placeholder="{}"
                className="font-mono text-xs"
                rows={5}
              />

              <Button onClick={handleRunTest} disabled={isRunning} className="mt-4">
                {isRunning ? "Executando..." : "Executar Teste"}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resultado</h3>

              {testResult ? (
                <div className="space-y-4">
                  <div className={`p-2 rounded-md ${testResult.success ? "bg-green-100" : "bg-red-100"}`}>
                    <p className={`font-medium ${testResult.success ? "text-green-700" : "text-red-700"}`}>
                      {testResult.success ? "Sucesso" : "Erro"}
                    </p>
                    {!testResult.success && testResult.error && (
                      <p className="text-red-700 text-sm mt-1">{testResult.error.message}</p>
                    )}
                    {testResult.executionTime !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tempo de execução: {testResult.executionTime.toFixed(2)}ms
                      </p>
                    )}
                  </div>

                  {testResult.success && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Saídas:</h4>
                      <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                        {JSON.stringify(testResult.outputs, null, 2)}
                      </pre>
                    </div>
                  )}

                  {testResult.logs && testResult.logs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Logs:</h4>
                      <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                        {testResult.logs.join("\n")}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Execute o teste para ver os resultados</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo para adicionar/editar porta */}
      <Dialog open={isPortDialogOpen} onOpenChange={setIsPortDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingPort
                ? `Editar ${isInputPort ? "Entrada" : "Saída"}`
                : `Nova ${isInputPort ? "Entrada" : "Saída"}`}
            </DialogTitle>
            <DialogDescription>
              {isInputPort ? "Configure os detalhes da porta de entrada" : "Configure os detalhes da porta de saída"}
            </DialogDescription>
          </DialogHeader>

          {currentPort && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port-name">Nome</Label>
                  <Input
                    id="port-name"
                    value={currentPort.name}
                    onChange={(e) => setCurrentPort({ ...currentPort, name: e.target.value })}
                    placeholder="Nome da porta"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port-id">ID</Label>
                  <Input
                    id="port-id"
                    value={currentPort.id}
                    onChange={(e) => setCurrentPort({ ...currentPort, id: e.target.value })}
                    placeholder="ID da porta (sem espaços)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="port-description">Descrição</Label>
                <Textarea
                  id="port-description"
                  value={currentPort.description || ""}
                  onChange={(e) => setCurrentPort({ ...currentPort, description: e.target.value })}
                  placeholder="Descrição da porta"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port-dataType">Tipo de Dados</Label>
                <Select
                  value={currentPort.dataType}
                  onValueChange={(value) => setCurrentPort({ ...currentPort, dataType: value as DataType })}
                >
                  <SelectTrigger id="port-dataType">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4">
                {isInputPort && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="port-required"
                      checked={currentPort.required || false}
                      onChange={(e) => setCurrentPort({ ...currentPort, required: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="port-required">Obrigatório</Label>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="port-multiple"
                    checked={currentPort.multiple || false}
                    onChange={(e) => setCurrentPort({ ...currentPort, multiple: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="port-multiple">Múltiplos valores</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPortDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => currentPort && handleSavePort(currentPort)}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
