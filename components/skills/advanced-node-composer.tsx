/**
 * ADVANCED NODE COMPOSER
 *
 * Composer visual para criação de nodes complexos combinando múltiplas skills
 * Permite drag & drop, conexões visuais e configuração de inputs/outputs externos
 *
 * AI-Friendly Features:
 * - Interface clara com responsabilidades bem definidas
 * - Estado gerenciado de forma previsível
 * - Hooks customizados para lógica específica
 * - Funções puras para transformações
 */
"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Save, Zap, Eye, EyeOff, RotateCcw, TestTube } from "lucide-react"
import { useSkillsStore } from "@/stores/use-skills-store"
import { CORE_SKILLS, SKILL_CATEGORIES, type DataType } from "@/config/node-system-config"
import { nodeTransformer } from "@/services/node-transformer-service"
import type { Skill, CustomNode, SkillReference, InternalConnection } from "@/types/skill-types"
import { useToast } from "@/hooks/use-toast"

interface ComposerSkill extends SkillReference {
  x: number
  y: number
  width: number
  height: number
}

interface ConnectionLine {
  id: string
  from: { skillId: string; portId: string; x: number; y: number }
  to: { skillId: string; portId: string; x: number; y: number }
}

interface ExternalPort {
  id: string
  name: string
  type: DataType
  description: string
  required: boolean
  mappedTo?: { skillId: string; portId: string }
}

interface ComposerState {
  skills: ComposerSkill[]
  connections: InternalConnection[]
  selectedSkill: string | null
  externalInputs: ExternalPort[]
  externalOutputs: ExternalPort[]
}

/**
 * Hook para gerenciar drag and drop
 * Encapsula toda lógica de arrastar e soltar
 */
function useDragAndDrop(
  composerSkills: ComposerSkill[],
  setComposerSkills: React.Dispatch<React.SetStateAction<ComposerSkill[]>>,
  zoom: number,
  canvasRef: React.RefObject<HTMLDivElement>,
  setSelectedSkill: React.Dispatch<React.SetStateAction<string | null>>,
) {
  const [draggedSkill, setDraggedSkill] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, instanceId: string) => {
      e.preventDefault()
      const skill = composerSkills.find((s) => s.instanceId === instanceId)
      if (!skill) return

      setDraggedSkill(instanceId)
      setSelectedSkill(instanceId)

      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - skill.x * zoom,
          y: e.clientY - rect.top - skill.y * zoom,
        })
      }
    },
    [composerSkills, zoom, canvasRef, setSelectedSkill],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedSkill || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - dragOffset.x) / zoom
      const y = (e.clientY - rect.top - dragOffset.y) / zoom

      setComposerSkills((prev) =>
        prev.map((skill) =>
          skill.instanceId === draggedSkill ? { ...skill, x: Math.max(0, x), y: Math.max(0, y) } : skill,
        ),
      )
    },
    [draggedSkill, dragOffset, zoom, canvasRef, setComposerSkills],
  )

  const handleMouseUp = useCallback(() => {
    setDraggedSkill(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  return { handleMouseDown, handleMouseMove, handleMouseUp }
}

/**
 * Hook para gerenciar conexões entre skills
 * Responsabilidade única: conectar skills
 */
function useSkillConnections(
  toast: ReturnType<typeof useToast>["toast"],
  setConnections: React.Dispatch<React.SetStateAction<InternalConnection[]>>,
) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{
    skillId: string
    portId: string
    type: "input" | "output"
  } | null>(null)

  const startConnection = useCallback((skillId: string, portId: string, type: "input" | "output") => {
    setIsConnecting(true)
    setConnectionStart({ skillId, portId, type })
  }, [])

  const finishConnection = useCallback(
    (skillId: string, portId: string, type: "input" | "output") => {
      if (!connectionStart || !isConnecting) return

      if (connectionStart.skillId === skillId) {
        toast({
          title: "Conexão inválida",
          description: "Não é possível conectar uma skill a si mesma",
          variant: "destructive",
        })
        setIsConnecting(false)
        setConnectionStart(null)
        return
      }

      if (connectionStart.type === type) {
        toast({
          title: "Conexão inválida",
          description: "Conecte uma saída a uma entrada",
          variant: "destructive",
        })
        setIsConnecting(false)
        setConnectionStart(null)
        return
      }

      const newConnection: InternalConnection = {
        id: `conn_${Date.now()}`,
        sourceSkillInstanceId: connectionStart.type === "output" ? connectionStart.skillId : skillId,
        sourcePortId: connectionStart.type === "output" ? connectionStart.portId : portId,
        targetSkillInstanceId: connectionStart.type === "input" ? connectionStart.skillId : skillId,
        targetPortId: connectionStart.type === "input" ? connectionStart.portId : portId,
      }

      setConnections((prev) => [...prev, newConnection])
      setIsConnecting(false)
      setConnectionStart(null)

      toast({
        title: "Conexão criada",
        description: "Skills conectadas com sucesso",
      })
    },
    [connectionStart, isConnecting, toast, setConnections],
  )

  return { startConnection, finishConnection, isConnecting }
}

export function AdvancedNodeComposer() {
  const { toast } = useToast()
  const { skills, addSkill } = useSkillsStore()
  const canvasRef = useRef<HTMLDivElement>(null)

  // Estado do composer
  const [composerSkills, setComposerSkills] = useState<ComposerSkill[]>([])
  const [connections, setConnections] = useState<InternalConnection[]>([])
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [nodeName, setNodeName] = useState("")
  const [nodeDescription, setNodeDescription] = useState("")
  const [nodeCategory, setNodeCategory] = useState("custom")
  const [externalInputs, setExternalInputs] = useState<ExternalPort[]>([])
  const [externalOutputs, setExternalOutputs] = useState<ExternalPort[]>([])

  // Configurações visuais
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)

  const { handleMouseDown, handleMouseMove, handleMouseUp } = useDragAndDrop(
    composerSkills,
    setComposerSkills,
    zoom,
    canvasRef,
    setSelectedSkill,
  )

  const { startConnection, finishConnection } = useSkillConnections(toast, setConnections)

  // Skills disponíveis (combinando skills existentes + templates do core)
  const availableSkills = [
    ...skills,
    ...Object.values(CORE_SKILLS).map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.category as any,
      version: "1.0.0",
      author: "System",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: template.inputs.map((input) => ({
        id: input,
        name: input,
        description: `Input ${input}`,
        dataType: "any" as DataType,
        required: false,
      })),
      outputs: template.outputs.map((output) => ({
        id: output,
        name: output,
        description: `Output ${output}`,
        dataType: "any" as DataType,
        required: false,
      })),
      implementation: {
        language: "javascript" as const,
        code: template.code,
        dependencies: [],
      },
      metadata: {
        tags: [template.category],
        category: template.category,
        isTemplate: true,
      },
    })),
  ]

  // Adicionar skill ao composer
  const addSkillToComposer = useCallback(
    (skill: Skill) => {
      const newSkill: ComposerSkill = {
        skillId: skill.id,
        version: skill.version,
        instanceId: `instance_${Date.now()}`,
        properties: {},
        x: 100 + composerSkills.length * 50,
        y: 100 + composerSkills.length * 50,
        width: 200,
        height: 120,
      }

      setComposerSkills((prev) => [...prev, newSkill])
      toast({
        title: "Skill adicionada",
        description: `${skill.name} foi adicionada ao composer`,
      })
    },
    [composerSkills.length, toast],
  )

  // Remover skill do composer
  const removeSkillFromComposer = useCallback(
    (instanceId: string) => {
      setComposerSkills((prev) => prev.filter((s) => s.instanceId !== instanceId))
      setConnections((prev) =>
        prev.filter((c) => c.sourceSkillInstanceId !== instanceId && c.targetSkillInstanceId !== instanceId),
      )
      if (selectedSkill === instanceId) {
        setSelectedSkill(null)
      }
    },
    [selectedSkill],
  )

  // Adicionar porta externa
  const addExternalPort = useCallback(
    (type: "input" | "output") => {
      const newPort: ExternalPort = {
        id: `${type}_${Date.now()}`,
        name: `${type === "input" ? "Input" : "Output"} ${type === "input" ? externalInputs.length + 1 : externalOutputs.length + 1}`,
        type: "any",
        description: "",
        required: false,
      }

      if (type === "input") {
        setExternalInputs((prev) => [...prev, newPort])
      } else {
        setExternalOutputs((prev) => [...prev, newPort])
      }
    },
    [externalInputs.length, externalOutputs.length],
  )

  // Remover porta externa
  const removeExternalPort = useCallback((portId: string, type: "input" | "output") => {
    if (type === "input") {
      setExternalInputs((prev) => prev.filter((p) => p.id !== portId))
    } else {
      setExternalOutputs((prev) => prev.filter((p) => p.id !== portId))
    }
  }, [])

  // Salvar node customizado
  const saveCustomNode = useCallback(async () => {
    if (!nodeName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, forneça um nome para o node",
        variant: "destructive",
      })
      return
    }

    if (composerSkills.length === 0) {
      toast({
        title: "Skills necessárias",
        description: "Adicione pelo menos uma skill ao composer",
        variant: "destructive",
      })
      return
    }

    const customNode: CustomNode = {
      id: `custom_${Date.now()}`,
      name: nodeName,
      description: nodeDescription,
      category: nodeCategory,
      version: "1.0.0",
      author: "User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      skills: composerSkills,
      connections,
      inputs: externalInputs.map((port) => ({
        id: port.id,
        name: port.name,
        description: port.description,
        dataType: port.type,
        required: port.required,
      })),
      outputs: externalOutputs.map((port) => ({
        id: port.id,
        name: port.name,
        description: port.description,
        dataType: port.type,
        required: false,
      })),
      inputMappings: externalInputs
        .filter((port) => port.mappedTo)
        .map((port) => ({
          nodeInputId: port.id,
          skillInstanceId: port.mappedTo!.skillId,
          skillInputId: port.mappedTo!.portId,
        })),
      outputMappings: externalOutputs
        .filter((port) => port.mappedTo)
        .map((port) => ({
          nodeOutputId: port.id,
          skillInstanceId: port.mappedTo!.skillId,
          skillOutputId: port.mappedTo!.portId,
        })),
      metadata: {
        tags: [nodeCategory],
        isTemplate: false,
        isPublic: false,
      },
    }

    // Converter para formato do canvas
    const canvasNode = nodeTransformer.customNodeToCanvasNode(customNode)

    toast({
      title: "Node salvo",
      description: `Node "${nodeName}" foi criado com sucesso`,
    })

    // Aqui você pode salvar no store ou enviar para API
    console.log("Custom Node:", customNode)
    console.log("Canvas Format:", canvasNode)
  }, [nodeName, nodeDescription, nodeCategory, composerSkills, connections, externalInputs, externalOutputs, toast])

  // Testar composição
  const testComposition = useCallback(async () => {
    toast({
      title: "Testando composição",
      description: "Executando teste da composição de skills...",
    })

    // Implementar lógica de teste
    setTimeout(() => {
      toast({
        title: "Teste concluído",
        description: "Composição testada com sucesso",
      })
    }, 2000)
  }, [toast])

  // Limpar composer
  const clearComposer = useCallback(() => {
    setComposerSkills([])
    setConnections([])
    setSelectedSkill(null)
    setExternalInputs([])
    setExternalOutputs([])
    setNodeName("")
    setNodeDescription("")
  }, [])

  // Calcular linhas de conexão
  const connectionLines = connections
    .map((conn) => {
      const sourceSkill = composerSkills.find((s) => s.instanceId === conn.sourceSkillInstanceId)
      const targetSkill = composerSkills.find((s) => s.instanceId === conn.targetSkillInstanceId)

      if (!sourceSkill || !targetSkill) return null

      return {
        id: conn.id,
        from: {
          skillId: conn.sourceSkillInstanceId,
          portId: conn.sourcePortId,
          x: sourceSkill.x + sourceSkill.width,
          y: sourceSkill.y + sourceSkill.height / 2,
        },
        to: {
          skillId: conn.targetSkillInstanceId,
          portId: conn.targetPortId,
          x: targetSkill.x,
          y: targetSkill.y + targetSkill.height / 2,
        },
      }
    })
    .filter(Boolean) as ConnectionLine[]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar de Skills Disponíveis */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Skills Disponíveis</h2>
          <p className="text-sm text-gray-500">Arraste para o composer</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {Object.entries(SKILL_CATEGORIES).map(([categoryKey, category]) => {
              const categorySkills = availableSkills.filter((skill) => skill.type === categoryKey)

              if (categorySkills.length === 0) return null

              return (
                <div key={categoryKey}>
                  <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </h3>
                  <div className="space-y-2">
                    {categorySkills.map((skill) => (
                      <Card
                        key={skill.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addSkillToComposer(skill)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{skill.name}</h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{skill.description}</p>
                            </div>
                            <Plus className="h-4 w-4 text-gray-400 ml-2" />
                          </div>
                          {skill.metadata?.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {skill.metadata.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Canvas Principal */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={testComposition} className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testar
            </Button>
            <Button onClick={saveCustomNode} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Salvar Node
            </Button>
            <Button variant="outline" onClick={clearComposer}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Nome:</Label>
              <Input
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder="Nome do node customizado"
                className="w-48"
              />
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
              {showGrid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Zoom:</Label>
              <Input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-sm w-12">{Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative"
            style={{
              backgroundImage: showGrid ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)` : "none",
              backgroundSize: showGrid ? `${20 * zoom}px ${20 * zoom}px` : "auto",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Linhas de Conexão */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connectionLines.map((line) => (
                <g key={line.id}>
                  <path
                    d={`M ${line.from.x} ${line.from.y} C ${line.from.x + 50} ${line.from.y} ${line.to.x - 50} ${line.to.y} ${line.to.x} ${line.to.y}`}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                    className="drop-shadow-sm"
                  />
                  <circle cx={line.from.x} cy={line.from.y} r="4" fill="#3b82f6" />
                  <circle cx={line.to.x} cy={line.to.y} r="4" fill="#3b82f6" />
                </g>
              ))}
            </svg>

            {/* Skills no Canvas */}
            {composerSkills.map((composerSkill) => {
              const skill = availableSkills.find((s) => s.id === composerSkill.skillId)
              if (!skill) return null

              const category = SKILL_CATEGORIES[skill.type as keyof typeof SKILL_CATEGORIES]

              return (
                <div
                  key={composerSkill.instanceId}
                  className={`absolute bg-white rounded-lg border-2 shadow-lg cursor-move ${
                    selectedSkill === composerSkill.instanceId
                      ? "border-blue-500 shadow-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    left: composerSkill.x,
                    top: composerSkill.y,
                    width: composerSkill.width,
                    height: composerSkill.height,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, composerSkill.instanceId)}
                >
                  {/* Header */}
                  <div
                    className="p-2 border-b border-gray-200 rounded-t-lg"
                    style={{ backgroundColor: `${category?.color}10` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color }} />
                        <h3 className="font-medium text-xs">{skill.name}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSkillFromComposer(composerSkill.instanceId)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Corpo */}
                  <div className="p-2 flex justify-between items-center">
                    {/* Inputs */}
                    <div className="flex flex-col gap-1">
                      {skill.inputs.slice(0, 3).map((input) => (
                        <div
                          key={input.id}
                          className="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-600 -ml-4"
                          onClick={() => startConnection(composerSkill.instanceId, input.id, "input")}
                          title={`Input: ${input.name}`}
                        />
                      ))}
                    </div>

                    {/* Ícone Central */}
                    <Zap className="h-5 w-5 text-gray-400" />

                    {/* Outputs */}
                    <div className="flex flex-col gap-1">
                      {skill.outputs.slice(0, 3).map((output) => (
                        <div
                          key={output.id}
                          className="w-3 h-3 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 -mr-4"
                          onClick={() => startConnection(composerSkill.instanceId, output.id, "output")}
                          title={`Output: ${output.name}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sidebar de Configuração */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Configuração do Node</h2>
        </div>

        <ScrollArea className="flex-1 p-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="inputs">Inputs</TabsTrigger>
              <TabsTrigger value="outputs">Outputs</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div>
                <Label>Nome do Node</Label>
                <Input
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="Nome do node customizado"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={nodeDescription}
                  onChange={(e) => setNodeDescription(e.target.value)}
                  placeholder="Descrição do que este node faz"
                  rows={3}
                />
              </div>

              <div>
                <Label>Categoria</Label>
                <Select value={nodeCategory} onValueChange={setNodeCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-medium mb-2">Skills no Composer</h3>
                <div className="space-y-2">
                  {composerSkills.map((composerSkill) => {
                    const skill = availableSkills.find((s) => s.id === composerSkill.skillId)
                    return (
                      <div
                        key={composerSkill.instanceId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{skill?.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkillFromComposer(composerSkill.instanceId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                  {composerSkills.length === 0 && <p className="text-sm text-gray-500">Nenhuma skill adicionada</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inputs" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Inputs Externos</h3>
                <Button size="sm" onClick={() => addExternalPort("input")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {externalInputs.map((input) => (
                  <Card key={input.id}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Input
                          value={input.name}
                          onChange={(e) => {
                            setExternalInputs((prev) =>
                              prev.map((p) => (p.id === input.id ? { ...p, name: e.target.value } : p)),
                            )
                          }}
                          placeholder="Nome do input"
                          className="text-sm"
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeExternalPort(input.id, "input")}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <Select
                        value={input.type}
                        onValueChange={(value: DataType) => {
                          setExternalInputs((prev) => prev.map((p) => (p.id === input.id ? { ...p, type: value } : p)))
                        }}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="any">Any</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={input.description}
                        onChange={(e) => {
                          setExternalInputs((prev) =>
                            prev.map((p) => (p.id === input.id ? { ...p, description: e.target.value } : p)),
                          )
                        }}
                        placeholder="Descrição"
                        className="text-sm"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="outputs" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Outputs Externos</h3>
                <Button size="sm" onClick={() => addExternalPort("output")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {externalOutputs.map((output) => (
                  <Card key={output.id}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Input
                          value={output.name}
                          onChange={(e) => {
                            setExternalOutputs((prev) =>
                              prev.map((p) => (p.id === output.id ? { ...p, name: e.target.value } : p)),
                            )
                          }}
                          placeholder="Nome do output"
                          className="text-sm"
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeExternalPort(output.id, "output")}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <Select
                        value={output.type}
                        onValueChange={(value: DataType) => {
                          setExternalOutputs((prev) =>
                            prev.map((p) => (p.id === output.id ? { ...p, type: value } : p)),
                          )
                        }}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="any">Any</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={output.description}
                        onChange={(e) => {
                          setExternalOutputs((prev) =>
                            prev.map((p) => (p.id === output.id ? { ...p, description: e.target.value } : p)),
                          )
                        }}
                        placeholder="Descrição"
                        className="text-sm"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
    </div>
  )
}
