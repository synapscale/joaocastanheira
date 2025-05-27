"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Save, Plus, Trash2, Code, TestTube, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useSkillsStore } from "@/stores/use-skills-store"
import type { Skill, SkillParameter, SkillValidationResult } from "@/types/skill-types"
import { useToast } from "@/hooks/use-toast"

interface EnhancedSkillEditorProps {
  skillId?: string
  onSave?: (skill: Skill) => void
  onCancel?: () => void
}

export function EnhancedSkillEditor({ skillId, onSave, onCancel }: EnhancedSkillEditorProps) {
  const { toast } = useToast()
  const { skills, addSkill, updateSkill, validateSkill, testSkill } = useSkillsStore()

  const existingSkill = skillId ? skills.find((s) => s.id === skillId) : null

  const [skill, setSkill] = useState<Partial<Skill>>(() => ({
    id: existingSkill?.id || "",
    name: existingSkill?.name || "",
    description: existingSkill?.description || "",
    category: existingSkill?.category || "general",
    version: existingSkill?.version || "1.0.0",
    author: existingSkill?.author || "",
    tags: existingSkill?.tags || [],
    parameters: existingSkill?.parameters || [],
    code: existingSkill?.code || "",
    isPublic: existingSkill?.isPublic || false,
    isActive: existingSkill?.isActive !== false,
    metadata: existingSkill?.metadata || {},
  }))

  const [validation, setValidation] = useState<SkillValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [newTag, setNewTag] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  // Validação em tempo real
  const handleValidation = useCallback(async () => {
    if (!skill.name || !skill.code) return

    setIsValidating(true)
    try {
      const result = await validateSkill(skill as Skill)
      setValidation(result)
    } catch (error) {
      console.error("Validation error:", error)
    } finally {
      setIsValidating(false)
    }
  }, [skill, validateSkill])

  // Teste da skill
  const handleTest = useCallback(async () => {
    if (!skill.code) return

    setIsTesting(true)
    try {
      const result = await testSkill(skill as Skill, {})
      setTestResults(result)
      toast({
        title: "Teste executado",
        description: "Skill testada com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao executar o teste da skill",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }, [skill, testSkill, toast])

  // Salvar skill
  const handleSave = useCallback(async () => {
    if (!skill.name || !skill.code) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e código são obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      const skillToSave = {
        ...skill,
        id: skill.id || `skill_${Date.now()}`,
        createdAt: existingSkill?.createdAt || new Date(),
        updatedAt: new Date(),
      } as Skill

      if (existingSkill) {
        updateSkill(skillToSave)
      } else {
        addSkill(skillToSave)
      }

      onSave?.(skillToSave)
      toast({
        title: "Skill salva",
        description: "Skill salva com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar a skill",
        variant: "destructive",
      })
    }
  }, [skill, existingSkill, addSkill, updateSkill, onSave, toast])

  // Adicionar parâmetro
  const addParameter = useCallback(() => {
    const newParam: SkillParameter = {
      name: "",
      type: "string",
      required: false,
      description: "",
      defaultValue: "",
    }
    setSkill((prev) => ({
      ...prev,
      parameters: [...(prev.parameters || []), newParam],
    }))
  }, [])

  // Remover parâmetro
  const removeParameter = useCallback((index: number) => {
    setSkill((prev) => ({
      ...prev,
      parameters: prev.parameters?.filter((_, i) => i !== index) || [],
    }))
  }, [])

  // Atualizar parâmetro
  const updateParameter = useCallback((index: number, field: keyof SkillParameter, value: any) => {
    setSkill((prev) => ({
      ...prev,
      parameters: prev.parameters?.map((param, i) => (i === index ? { ...param, [field]: value } : param)) || [],
    }))
  }, [])

  // Adicionar tag
  const addTag = useCallback(() => {
    if (newTag.trim() && !skill.tags?.includes(newTag.trim())) {
      setSkill((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }))
      setNewTag("")
    }
  }, [newTag, skill.tags])

  // Remover tag
  const removeTag = useCallback((tag: string) => {
    setSkill((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }))
  }, [])

  // Status da validação
  const validationStatus = useMemo(() => {
    if (isValidating) return { icon: Clock, color: "text-yellow-500", text: "Validando..." }
    if (!validation) return { icon: AlertCircle, color: "text-gray-400", text: "Não validado" }
    if (validation.isValid) return { icon: CheckCircle, color: "text-green-500", text: "Válido" }
    return { icon: AlertCircle, color: "text-red-500", text: "Inválido" }
  }, [validation, isValidating])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            {existingSkill ? "Editar Skill" : "Nova Skill"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidation}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              <validationStatus.icon className={`h-4 w-4 ${validationStatus.color}`} />
              {validationStatus.text}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isTesting || !skill.code}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isTesting ? "Testando..." : "Testar"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
              <TabsTrigger value="code">Código</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={skill.name || ""}
                    onChange={(e) => setSkill((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da skill"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={skill.category || "general"}
                    onValueChange={(value) => setSkill((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="ai">IA</SelectItem>
                      <SelectItem value="data">Dados</SelectItem>
                      <SelectItem value="automation">Automação</SelectItem>
                      <SelectItem value="integration">Integração</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={skill.description || ""}
                  onChange={(e) => setSkill((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da skill"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    value={skill.version || ""}
                    onChange={(e) => setSkill((prev) => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input
                    id="author"
                    value={skill.author || ""}
                    onChange={(e) => setSkill((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="Nome do autor"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skill.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => removeTag(tag)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nova tag"
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={skill.isActive !== false}
                    onCheckedChange={(checked) => setSkill((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Ativa</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={skill.isPublic || false}
                    onCheckedChange={(checked) => setSkill((prev) => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="isPublic">Pública</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Parâmetros</h3>
                <Button onClick={addParameter} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Parâmetro
                </Button>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {skill.parameters?.map((param, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                              value={param.name}
                              onChange={(e) => updateParameter(index, "name", e.target.value)}
                              placeholder="Nome do parâmetro"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={param.type} onValueChange={(value) => updateParameter(index, "type", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="array">Array</SelectItem>
                                <SelectItem value="object">Object</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <Label>Descrição</Label>
                          <Textarea
                            value={param.description || ""}
                            onChange={(e) => updateParameter(index, "description", e.target.value)}
                            placeholder="Descrição do parâmetro"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Valor Padrão</Label>
                            <Input
                              value={param.defaultValue || ""}
                              onChange={(e) => updateParameter(index, "defaultValue", e.target.value)}
                              placeholder="Valor padrão"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={param.required || false}
                                onCheckedChange={(checked) => updateParameter(index, "required", checked)}
                              />
                              <Label>Obrigatório</Label>
                            </div>

                            <Button variant="destructive" size="sm" onClick={() => removeParameter(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código da Skill *</Label>
                <Textarea
                  id="code"
                  value={skill.code || ""}
                  onChange={(e) => setSkill((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="// Código JavaScript da skill
function execute(params) {
  // Implementação da skill
  return { success: true, data: params };
}"
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>

              {validation && !validation.isValid && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-red-800 mb-2">Erros de Validação:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {testResults && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-green-800 mb-2">Resultado do Teste:</h4>
                    <pre className="text-sm text-green-700 bg-green-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações Avançadas</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timeout (ms)</Label>
                    <Input
                      type="number"
                      value={skill.metadata?.timeout || ""}
                      onChange={(e) =>
                        setSkill((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, timeout: Number.parseInt(e.target.value) || 0 },
                        }))
                      }
                      placeholder="5000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={skill.metadata?.priority || "normal"}
                      onValueChange={(value) =>
                        setSkill((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, priority: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dependências</Label>
                  <Textarea
                    value={skill.metadata?.dependencies?.join("\n") || ""}
                    onChange={(e) =>
                      setSkill((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          dependencies: e.target.value.split("\n").filter((d) => d.trim()),
                        },
                      }))
                    }
                    placeholder="lodash&#10;axios&#10;moment"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={skill.metadata?.cacheable || false}
                    onCheckedChange={(checked) =>
                      setSkill((prev) => ({
                        ...prev,
                        metadata: { ...prev.metadata, cacheable: checked },
                      }))
                    }
                  />
                  <Label>Resultado cacheável</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Skill
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
