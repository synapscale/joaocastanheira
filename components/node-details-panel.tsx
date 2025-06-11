"use client"

import type React from "react"

import { useState, useCallback, memo } from "react"
import { X, Settings, Code, Database, Link, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWorkflow } from "@/context/workflow-context"
import type { Node } from "@/types/workflow"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

/**
 * Props para o componente NodeDetailsPanel
 */
interface NodeDetailsPanelProps {
  /** O nó a ser editado */
  node: Node
  /** Função de callback para fechar o painel */
  onClose: () => void
}

/**
 * Componente NodeDetailsPanel.
 *
 * Exibe um painel lateral para editar os detalhes de um nó.
 * Permite editar nome, descrição, tipo e outras configurações.
 */
export const NodeDetailsPanel = memo(function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  const { updateNode, removeNode } = useWorkflow()
  const [nodeName, setNodeName] = useState(node.name)
  const [nodeDescription, setNodeDescription] = useState(node.description || "")
  const [nodeEnabled, setNodeEnabled] = useState(true)
  const [nodeRetry, setNodeRetry] = useState(false)

  /**
   * Salva as alterações no nó
   */
  const handleSave = useCallback(() => {
    updateNode(node.id, {
      name: nodeName,
      description: nodeDescription,
      parameters: {
        ...(node.parameters || {}),
        enabled: nodeEnabled,
        retryOnFail: nodeRetry,
      },
    })
  }, [node.id, nodeName, nodeDescription, nodeEnabled, nodeRetry, updateNode])

  /**
   * Remove o nó e fecha o painel
   */
  const handleDelete = useCallback(() => {
    removeNode(node.id)
    onClose()
  }, [node.id, onClose, removeNode])

  /**
   * Atualiza o nome do nó
   */
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value)
  }, [])

  /**
   * Atualiza a descrição do nó
   */
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodeDescription(e.target.value)
  }, [])

  /**
   * Formata o código JSON do nó para exibição
   */
  const getNodeConfigJson = useCallback(() => {
    const nodeConfig = {
      id: node.id,
      type: node.type,
      name: node.name,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
      ...(node.inputs ? { inputs: node.inputs } : {}),
      ...(node.outputs ? { outputs: node.outputs } : {}),
      parameters: {
        enabled: nodeEnabled,
        retryOnFail: nodeRetry,
        maxRetries: 3,
      },
    }

    return JSON.stringify(nodeConfig, null, 2)
  }, [node, nodeEnabled, nodeRetry])

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-background border-l z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium truncate" title={node.name}>
          {node.name}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
          <X size={18} />
        </Button>
      </div>

      <Tabs defaultValue="settings" className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="mx-4 my-1">
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Settings size={14} />
              Settings
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1.5">
              <Code size={14} />
              Code
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1.5">
              <Database size={14} />
              Data
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-1.5">
              <Link size={14} />
              Connections
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="settings" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="node-name">Node Name</Label>
                <Input id="node-name" value={nodeName} onChange={handleNameChange} className="mt-1.5" />
              </div>

              <div>
                <Label htmlFor="node-type">Node Type</Label>
                <Select defaultValue={node.type}>
                  <SelectTrigger id="node-type" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trigger">Trigger</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="action">Action</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="node-description">Description</Label>
                <Textarea
                  id="node-description"
                  value={nodeDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Add a description..."
                  className="mt-1.5 resize-none"
                  rows={3}
                />
              </div>

              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="node-enabled" className="cursor-pointer">
                    Enable Node
                  </Label>
                  <Switch id="node-enabled" checked={nodeEnabled} onCheckedChange={setNodeEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="node-retry" className="cursor-pointer">
                    Retry on Failure
                  </Label>
                  <Switch id="node-retry" checked={nodeRetry} onCheckedChange={setNodeRetry} />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button className="flex-1 gap-1.5" onClick={handleSave}>
                  <Save size={16} />
                  Save Changes
                </Button>
                <Button variant="destructive" size="icon" onClick={handleDelete} aria-label="Delete node">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="code" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4">
              <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-auto">{getNodeConfigJson()}</pre>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="data" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-700">No data available. This node has not been executed yet.</p>
              </div>

              <Button className="w-full">Execute Node</Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="connections" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4 space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Input Connections</h4>
                {node.inputs && node.inputs.length > 0 ? (
                  <div className="space-y-2">
                    {node.inputs.map((input, index) => (
                      <div key={index} className="flex items-center p-2 bg-muted rounded-md">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                        <span className="text-sm">{input}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No input connections</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Output Connections</h4>
                {node.outputs && node.outputs.length > 0 ? (
                  <div className="space-y-2">
                    {node.outputs.map((output, index) => (
                      <div key={index} className="flex items-center p-2 bg-muted rounded-md">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                        <span className="text-sm">{output}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No output connections</p>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
})
