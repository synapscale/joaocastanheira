"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Settings, Play, Save, Zap, Eye, EyeOff, RotateCcw } from "lucide-react"
import { useSkillsStore } from "@/stores/use-skills-store"
import type { Skill, ComposedNode, NodeConnection } from "@/types/skill-types"
import { useToast } from "@/hooks/use-toast"

interface EnhancedNodeComposerProps {
  onSave?: (composition: ComposedNode[]) => void
  onCancel?: () => void
  initialComposition?: ComposedNode[]
}

interface CanvasNode extends ComposedNode {
  x: number
  y: number
  width: number
  height: number
}

interface ConnectionLine {
  from: { nodeId: string; port: string; x: number; y: number }
  to: { nodeId: string; port: string; x: number; y: number }
}

export function EnhancedNodeComposer({ onSave, onCancel, initialComposition = [] }: EnhancedNodeComposerProps) {
  const { toast } = useToast()
  const { skills } = useSkillsStore()
  const canvasRef = useRef<HTMLDivElement>(null)

  const [nodes, setNodes] = useState<CanvasNode[]>(() =>
    initialComposition.map((node, index) => ({
      ...node,
      x: 100 + (index % 3) * 300,
      y: 100 + Math.floor(index / 3) * 200,
      width: 250,
      height: 150,
    })),
  )

  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string
    port: string
    type: "input" | "output"
  } | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)

  // Adicionar skill como node
  const addSkillNode = useCallback(
    (skill: Skill) => {
      const newNode: CanvasNode = {
        id: `node_${Date.now()}`,
        skillId: skill.id,
        name: skill.name,
        parameters: {},
        x: 100 + nodes.length * 50,
        y: 100 + nodes.length * 50,
        width: 250,
        height: 150,
      }

      setNodes((prev) => [...prev, newNode])
      toast({
        title: "Node adicionado",
        description: `Skill "${skill.name}" adicionada ao canvas`,
      })
    },
    [nodes.length, toast],
  )

  // Remover node
  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId))
      setConnections((prev) => prev.filter((c) => c.from !== nodeId && c.to !== nodeId))
      if (selectedNode === nodeId) {
        setSelectedNode(null)
      }
    },
    [selectedNode],
  )

  // Iniciar drag do node
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault()
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      setDraggedNode(nodeId)
      setSelectedNode(nodeId)

      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - node.x * zoom,
          y: e.clientY - rect.top - node.y * zoom,
        })
      }
    },
    [nodes, zoom],
  )

  // Drag do node
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedNode || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - dragOffset.x) / zoom
      const y = (e.clientY - rect.top - dragOffset.y) / zoom

      setNodes((prev) =>
        prev.map((node) => (node.id === draggedNode ? { ...node, x: Math.max(0, x), y: Math.max(0, y) } : node)),
      )
    },
    [draggedNode, dragOffset, zoom],
  )

  // Finalizar drag
  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  // Iniciar conexão
  const startConnection = useCallback((nodeId: string, port: string, type: "input" | "output") => {
    setIsConnecting(true)
    setConnectionStart({ nodeId, port, type })
  }, [])

  // Finalizar conexão
  const finishConnection = useCallback(
    (nodeId: string, port: string, type: "input" | "output") => {
      if (!connectionStart || !isConnecting) return

      // Validar conexão
      if (connectionStart.nodeId === nodeId) {
        toast({
          title: "Conexão inválida",
          description: "Não é possível conectar um node a si mesmo",
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

      // Criar conexão
      const newConnection: NodeConnection = {
        id: `conn_${Date.now()}`,
        from: connectionStart.type === "output" ? connectionStart.nodeId : nodeId,
        to: connectionStart.type === "input" ? connectionStart.nodeId : nodeId,
        fromPort: connectionStart.type === "output" ? connectionStart.port : port,
        toPort: connectionStart.type === "input" ? connectionStart.port : port,
      }

      setConnections((prev) => [...prev, newConnection])
      setIsConnecting(false)
      setConnectionStart(null)

      toast({
        title: "Conexão criada",
        description: "Nodes conectados com sucesso",
      })
    },
    [connectionStart, isConnecting, toast],
  )

  // Remover conexão
  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId))
  }, [])

  // Atualizar parâmetro do node
  const updateNodeParameter = useCallback((nodeId: string, paramName: string, value: any) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              parameters: { ...node.parameters, [paramName]: value },
            }
          : node,
      ),
    )
  }, [])

  // Salvar composição
  const handleSave = useCallback(() => {
    const composition = nodes.map(({ x, y, width, height, ...node }) => node)
    onSave?.(composition)
    toast({
      title: "Composição salva",
      description: "Composição de nodes salva com sucesso",
    })
  }, [nodes, onSave, toast])

  // Executar composição
  const handleExecute = useCallback(async () => {
    // Implementar lógica de execução
    toast({
      title: "Executando composição",
      description: "Iniciando execução dos nodes...",
    })
  }, [toast])

  // Resetar canvas
  const handleReset = useCallback(() => {
    setNodes([])
    setConnections([])
    setSelectedNode(null)
  }, [])

  // Calcular linhas de conexão
  const connectionLines = connections
    .map((conn) => {
      const fromNode = nodes.find((n) => n.id === conn.from)
      const toNode = nodes.find((n) => n.id === conn.to)

      if (!fromNode || !toNode) return null

      return {
        from: {
          nodeId: conn.from,
          port: conn.fromPort,
          x: fromNode.x + fromNode.width,
          y: fromNode.y + fromNode.height / 2,
        },
        to: {
          nodeId: conn.to,
          port: conn.toPort,
          x: toNode.x,
          y: toNode.y + toNode.height / 2,
        },
      }
    })
    .filter(Boolean) as ConnectionLine[]

  // Skill selecionada para detalhes
  const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode) : null
  const selectedSkill = selectedNodeData ? skills.find((s) => s.id === selectedNodeData.skillId) : null

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar de Skills */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Skills Disponíveis</h2>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {skills.map((skill) => (
              <Card
                key={skill.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addSkillNode(skill)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{skill.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {skill.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Canvas Principal */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={handleExecute} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Executar
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          <div className="flex items-center gap-2">
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
              {connectionLines.map((line, index) => (
                <g key={index}>
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

            {/* Nodes */}
            {nodes.map((node) => {
              const skill = skills.find((s) => s.id === node.skillId)
              if (!skill) return null

              return (
                <div
                  key={node.id}
                  className={`absolute bg-white rounded-lg border-2 shadow-lg cursor-move ${
                    selectedNode === node.id
                      ? "border-blue-500 shadow-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                  {/* Header do Node */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{node.name}</h3>
                        <p className="text-xs text-gray-500">{skill.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedNode(node.id)
                          }}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNode(node.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Corpo do Node */}
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      {/* Portas de Entrada */}
                      <div className="flex flex-col gap-2">
                        {skill.parameters?.slice(0, 3).map((param) => (
                          <div
                            key={param.name}
                            className="w-3 h-3 bg-green-500 rounded-full cursor-pointer hover:bg-green-600 -ml-6"
                            onClick={() => startConnection(node.id, param.name, "input")}
                            title={`Input: ${param.name}`}
                          />
                        ))}
                      </div>

                      {/* Status/Ícone */}
                      <div className="flex-1 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-gray-400" />
                      </div>

                      {/* Portas de Saída */}
                      <div className="flex flex-col gap-2">
                        <div
                          className="w-3 h-3 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 -mr-6"
                          onClick={() => startConnection(node.id, "output", "output")}
                          title="Output"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sidebar de Propriedades */}
      {selectedNodeData && selectedSkill && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Propriedades do Node</h2>
            <p className="text-sm text-gray-500">{selectedNodeData.name}</p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nome do Node</Label>
                <Input
                  value={selectedNodeData.name}
                  onChange={(e) => {
                    setNodes((prev) => prev.map((n) => (n.id === selectedNode ? { ...n, name: e.target.value } : n)))
                  }}
                  className="mt-1"
                />
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">Parâmetros</h3>
                <div className="space-y-3">
                  {selectedSkill.parameters?.map((param) => (
                    <div key={param.name}>
                      <Label className="text-sm">{param.name}</Label>
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                      <Input
                        value={selectedNodeData.parameters[param.name] || param.defaultValue || ""}
                        onChange={(e) => updateNodeParameter(selectedNode!, param.name, e.target.value)}
                        placeholder={param.description}
                        className="mt-1"
                      />
                      {param.description && <p className="text-xs text-gray-500 mt-1">{param.description}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Informações da Skill</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Categoria:</span> {selectedSkill.category}
                  </p>
                  <p>
                    <span className="font-medium">Versão:</span> {selectedSkill.version}
                  </p>
                  <p>
                    <span className="font-medium">Autor:</span> {selectedSkill.author}
                  </p>
                </div>

                {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-sm mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSkill.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
