"use client"

/**
 * ENHANCED SKILL EDITOR V2 - OTIMIZADO
 *
 * Editor avançado para criação e edição de skills
 * Otimizado com componentes base reutilizáveis mantendo aparência visual idêntica
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Configuração centralizada
import { CORE_SKILLS, SKILL_CATEGORIES, type DataType } from "@/config/node-system-config"
import { nodeTransformer } from "@/services/node-transformer-service"
import { skillValidator } from "@/services/skill-validation-service"

// Tipos
import type { Skill, SkillPort } from "@/types/skill-types"

// Store
import { useSkillsStore } from "@/stores/use-skills-store"

// Componentes base otimizados
import { ActionButton } from "@/components/ui/base/action-button"
import { FormField } from "@/components/ui/base/form-field"
import { ActionCard } from "@/components/ui/base/action-card"

// Componentes UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Ícones
import { Save, Play, Code, Info, Wand2, CheckCircle, AlertCircle, Lightbulb } from "lucide-react"

/**
 * Schema de validação
 */
const skillFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  type: z.string(),
  author: z.string().min(2, "Autor deve ter pelo menos 2 caracteres"),
  implementation: z.object({
    language: z.string(),
    code: z.string().min(1, "Código não pode estar vazio"),
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

/**
 * Props do componente
 */
interface EnhancedSkillEditorProps {
  skillId?: string
  onSave?: (skillId: string) => void
  onCancel?: () => void
}

/**
 * Hook para validação de código
 */
function useCodeValidation(code: string) {
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  })

  useEffect(() => {
    const validateCode = async () => {
      const errors: string[] = []
      const warnings: string[] = []

      try {
        new Function("inputs", "properties", "context", code)

        if (!code.includes("return")) {
          errors.push("Código deve conter declaração 'return'")
        }

        if (!code.includes("inputs")) {
          warnings.push("Código não utiliza parâmetro 'inputs'")
        }

        if (code.includes("eval(")) {
          warnings.push("Uso de 'eval()' não é recomendado por segurança")
        }
      } catch (error) {
        errors.push(`Erro de sintaxe: ${error.message}`)
      }

      setValidation({
        isValid: errors.length === 0,
        errors,
        warnings,
      })
    }

    if (code) {
      validateCode()
    }
  }, [code])

  return validation
}

/**
 * Hook para gerenciar templates
 */
function useTemplateManager() {
  const loadTemplate = useCallback((templateId: string) => {
    const template = CORE_SKILLS[templateId as keyof typeof CORE_SKILLS]
    if (!template) return null

    return {
      name: template.name,
      description: template.description,
      type: template.category,
      code: template.code,
      inputs: template.inputs.map((inputId, index) => ({
        id: inputId,
        name: inputId.charAt(0).toUpperCase() + inputId.slice(1),
        description: `Input ${inputId}`,
        dataType: "any" as DataType,
        required: index === 0,
      })),
      outputs: template.outputs.map((outputId) => ({
        id: outputId,
        name: outputId.charAt(0).toUpperCase() + outputId.slice(1),
        description: `Output ${outputId}`,
        dataType: "any" as DataType,
      })),
    }
  }, [])

  return { loadTemplate }
}

/**
 * Componente principal otimizado
 */
export function EnhancedSkillEditorV2({ skillId, onSave, onCancel }: EnhancedSkillEditorProps) {
  const { toast } = useToast()
  const { getSkill, addSkill, updateSkill } = useSkillsStore()
  const { loadTemplate } = useTemplateManager()

  // Estado local
  const [activeTab, setActiveTab] = useState("basic")
  const [inputs, setInputs] = useState<SkillPort[]>([])
  const [outputs, setOutputs] = useState<SkillPort[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [testInputs, setTestInputs] = useState<Record<string, any>>({})
  const [testResult, setTestResult] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Formulário com validação
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "data-transformation",
      author: "Usuário",
      implementation: {
        language: "javascript",
        code: `// Skill personalizada
// Use 'inputs' para acessar dados de entrada
// Retorne um objeto com as saídas

console.log("Inputs recebidos:", inputs);

// Exemplo de processamento
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

  // Validação de código
  const codeValidation = useCodeValidation(form.watch("implementation.code"))

  /**
   * Carrega dados de skill existente
   */
  const loadSkillData = useCallback(
    (skill: Skill) => {
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
      initializeTestInputs(skill.inputs)
    },
    [form],
  )

  /**
   * Inicializa inputs de teste
   */
  const initializeTestInputs = useCallback((skillInputs: SkillPort[]) => {
    const initialTestInputs: Record<string, any> = {}
    skillInputs.forEach((input) => {
      initialTestInputs[input.id] =
        input.defaultValue !== undefined ? input.defaultValue : getDefaultValueForType(input.dataType)
    })
    setTestInputs(initialTestInputs)
  }, [])

  /**
   * Obtém valor padrão baseado no tipo
   */
  const getDefaultValueForType = useCallback((dataType: DataType): any => {
    const defaults: Record<DataType, any> = {
      string: "",
      number: 0,
      boolean: false,
      array: [],
      object: {},
      date: new Date().toISOString(),
      buffer: null,
      any: null,
      json: {},
      xml: "<root></root>",
      csv: "header1,header2\nvalue1,value2",
      html: "<div></div>",
      binary: null,
    }
    return defaults[dataType]
  }, [])

  // Carrega skill existente ou template
  useEffect(() => {
    if (skillId) {
      const skill = getSkill(skillId)
      if (skill) {
        loadSkillData(skill)
      }
    } else if (selectedTemplate) {
      const templateData = loadTemplate(selectedTemplate)
      if (templateData) {
        form.setValue("name", templateData.name)
        form.setValue("description", templateData.description)
        form.setValue("type", templateData.type)
        form.setValue("implementation.code", templateData.code)
        setInputs(templateData.inputs)
        setOutputs(templateData.outputs)
        initializeTestInputs(templateData.inputs)
      }
    }
  }, [skillId, selectedTemplate, getSkill, loadSkillData, loadTemplate, form, initializeTestInputs])

  /**
   * Submete formulário
   */
  const handleSubmit = useCallback(
    (values: SkillFormValues) => {
      if (!codeValidation.isValid) {
        toast({
          title: "Erro de validação",
          description: "Corrija os erros no código antes de salvar",
          variant: "destructive",
        })
        return
      }

      const skillData = {
        name: values.name,
        description: values.description,
        type: values.type as any,
        author: values.author,
        inputs,
        outputs,
        implementation: {
          language: values.implementation.language as any,
          code: values.implementation.code,
          dependencies: values.implementation.dependencies,
        },
        metadata: values.metadata,
      }

      if (skillId) {
        updateSkill(skillId, skillData)
        onSave?.(skillId)
      } else {
        const newSkillId = addSkill(skillData)
        onSave?.(newSkillId)
      }

      toast({
        title: "Skill salva",
        description: `${values.name} foi salva com sucesso`,
      })
    },
    [codeValidation.isValid, inputs, outputs, skillId, updateSkill, addSkill, onSave, toast],
  )

  /**
   * Executa teste da skill
   */
  const handleRunTest = useCallback(async () => {
    setIsRunning(true)
    setTestResult(null)

    try {
      const formValues = form.getValues()
      const tempSkill: Skill = {
        id: skillId || "temp-skill",
        name: formValues.name,
        description: formValues.description,
        type: formValues.type as any,
        version: "test",
        author: formValues.author,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputs,
        outputs,
        implementation: {
          language: formValues.implementation.language as any,
          code: formValues.implementation.code,
          dependencies: formValues.implementation.dependencies,
        },
        metadata: formValues.metadata,
      }

      const result = await skillValidator.validateSkill(tempSkill)
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
  }, [form, skillId, inputs, outputs])

  /**
   * Gera preview do node
   */
  const generateCanvasPreview = useCallback(() => {
    try {
      const formValues = form.getValues()
      const tempSkill: Skill = {
        id: "preview",
        name: formValues.name,
        description: formValues.description,
        type: formValues.type as any,
        version: "1.0.0",
        author: formValues.author,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputs,
        outputs,
        implementation: {
          language: formValues.implementation.language as any,
          code: formValues.implementation.code,
          dependencies: formValues.implementation.dependencies,
        },
        metadata: formValues.metadata,
      }

      return nodeTransformer.skillToCanvasNode(tempSkill)
    } catch (error) {
      return null
    }
  }, [form, inputs, outputs])

  // Templates disponíveis
  const availableTemplates = useMemo(() => Object.entries(CORE_SKILLS), [])

  return (
    <div className="space-y-6">
      {/* Header otimizado com ActionButton */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{skillId ? "Editar Skill" : "Nova Skill"}</h2>
          <p className="text-muted-foreground">
            {selectedTemplate
              ? `Template: ${CORE_SKILLS[selectedTemplate as keyof typeof CORE_SKILLS]?.name}`
              : "Skill personalizada"}
          </p>
        </div>
        <div className="flex space-x-2">
          <ActionButton variant="outline" onClick={onCancel}>
            Cancelar
          </ActionButton>
          <ActionButton icon={Save} onClick={form.handleSubmit(handleSubmit)} disabled={!codeValidation.isValid}>
            Salvar
          </ActionButton>
        </div>
      </div>

      {/* Seletor de templates usando ActionCard */}
      {!skillId && (
        <ActionCard
          title="Templates Pré-definidos"
          description="Comece com um template baseado nas skills do n8n"
          headerActions={<Wand2 className="w-5 h-5" />}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableTemplates.map(([key, template]) => (
              <ActionButton
                key={key}
                variant={selectedTemplate === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTemplate(key)}
                className="justify-start h-auto p-3"
              >
                <div className="text-left">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.category}</div>
                </div>
              </ActionButton>
            ))}
          </div>
        </ActionCard>
      )}

      {/* Abas principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basic">
            <Info className="w-4 h-4 mr-2" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="ports">
            <Code className="w-4 h-4 mr-2" />
            Portas
          </TabsTrigger>
          <TabsTrigger value="implementation">
            <Code className="w-4 h-4 mr-2" />
            Código
          </TabsTrigger>
          <TabsTrigger value="test">
            <Play className="w-4 h-4 mr-2" />
            Testar
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Lightbulb className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Aba Básico usando FormField */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Nome"
              required
              {...form.register("name")}
              error={form.formState.errors.name?.message}
              placeholder="Nome da skill"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Categoria <span className="text-red-500">*</span>
              </label>
              <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <FormField
            type="textarea"
            label="Descrição"
            required
            {...form.register("description")}
            error={form.formState.errors.description?.message}
            placeholder="Descreva o que esta skill faz"
            rows={3}
          />

          <FormField label="Autor" {...form.register("author")} placeholder="Nome do autor" />
        </TabsContent>

        {/* Aba Implementação */}
        <TabsContent value="implementation" className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Código da Skill</label>

            {/* Indicadores de validação */}
            <div className="flex items-center space-x-2 mb-2">
              {codeValidation.isValid ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Código válido
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Erros encontrados
                </Badge>
              )}

              {codeValidation.warnings.length > 0 && (
                <Badge variant="secondary">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {codeValidation.warnings.length} avisos
                </Badge>
              )}
            </div>

            <FormField
              type="textarea"
              {...form.register("implementation.code")}
              className="font-mono h-80"
              placeholder="// Código da skill"
            />

            {/* Erros e avisos */}
            {(codeValidation.errors.length > 0 || codeValidation.warnings.length > 0) && (
              <div className="space-y-2">
                {codeValidation.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {error}
                  </div>
                ))}

                {codeValidation.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Ajuda contextual */}
            <ActionCard title="💡 Dicas de Implementação">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Use <code>inputs.nomeDoInput</code> para acessar dados de entrada
                </li>
                <li>
                  • Sempre retorne um objeto com as saídas: <code>{`return { output1: valor }`}</code>
                </li>
                <li>
                  • Use <code>console.log()</code> para debug (aparece nos logs de teste)
                </li>
                <li>
                  • Funções assíncronas são suportadas: <code>await fetch(...)</code>
                </li>
              </ul>
            </ActionCard>
          </div>
        </TabsContent>

        {/* Aba Preview */}
        <TabsContent value="preview" className="space-y-4 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview do Node no Canvas</h3>

            {(() => {
              const preview = generateCanvasPreview()
              return preview ? (
                <div className="space-y-4">
                  <ActionCard title={preview.name} description={preview.description}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Inputs</h4>
                        <div className="space-y-1">
                          {preview.inputs.map((input) => (
                            <div key={input.id} className="text-sm p-2 bg-blue-50 rounded">
                              <span className="font-medium">{input.name}</span>
                              <span className="text-muted-foreground"> ({input.type})</span>
                              {input.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Outputs</h4>
                        <div className="space-y-1">
                          {preview.outputs.map((output) => (
                            <div key={output.id} className="text-sm p-2 bg-green-50 rounded">
                              <span className="font-medium">{output.name}</span>
                              <span className="text-muted-foreground"> ({output.type})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ActionCard>

                  <ActionCard title="Configuração de Exportação">
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">{JSON.stringify(preview, null, 2)}</pre>
                  </ActionCard>
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md bg-muted">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Complete os campos obrigatórios para ver o preview</p>
                </div>
              )
            })()}
          </div>
        </TabsContent>

        {/* Aba Teste */}
        <TabsContent value="test" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Testar Skill</h3>
            <ActionButton
              icon={Play}
              onClick={handleRunTest}
              disabled={isRunning || !codeValidation.isValid}
              isLoading={isRunning}
              loadingText="Executando..."
            >
              {isRunning ? "Executando..." : "Executar Teste"}
            </ActionButton>
          </div>

          {/* Inputs de teste usando ActionCard */}
          <ActionCard title="Inputs de Teste">
            <div className="space-y-3">
              {inputs.map((input) => (
                <FormField
                  key={input.id}
                  label={`${input.name} (${input.dataType})`}
                  value={JSON.stringify(testInputs[input.id] || "")}
                  onChange={(e) => {
                    try {
                      const value = JSON.parse(e.target.value)
                      setTestInputs((prev) => ({ ...prev, [input.id]: value }))
                    } catch {
                      setTestInputs((prev) => ({ ...prev, [input.id]: e.target.value }))
                    }
                  }}
                  placeholder={`Valor para ${input.name}`}
                />
              ))}
            </div>
          </ActionCard>

          {/* Resultado do teste */}
          {testResult && (
            <ActionCard title="Resultado do Teste">
              <pre className="text-sm bg-muted p-3 rounded overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
            </ActionCard>
          )}
        </TabsContent>

        {/* Aba Portas */}
        <TabsContent value="ports" className="space-y-4 mt-4">
          <div className="text-center p-8 border rounded-md bg-muted">
            <Info className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Configuração de portas será implementada em versão futura</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
