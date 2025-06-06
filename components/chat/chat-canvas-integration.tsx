"use client"
/**
 * Componente de Integração entre Chat e Canvas
 * 
 * Este componente facilita a integração entre a interface de chat e o editor de workflow (canvas),
 * permitindo referências a nós, execução de workflows e compartilhamento de contexto.
 */

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Workflow, 
  ArrowRightLeft, 
  Play, 
  List, 
  ExternalLink 
} from "lucide-react"
import { executeWorkflowFromChat, getWorkflowNodeInfo } from "@/lib/ai-utils"
import Link from "next/link"

interface ChatCanvasIntegrationProps {
  currentConversationId: string | null
  onSendMessage: (content: string) => void
}

/**
 * Componente de integração entre chat e canvas
 */
export default function ChatCanvasIntegration({
  currentConversationId,
  onSendMessage
}: ChatCanvasIntegrationProps) {
  // Estados
  const [recentWorkflows, setRecentWorkflows] = useState([
    { id: "wf_1", name: "Automação de Marketing" },
    { id: "wf_2", name: "Processamento de Dados" },
    { id: "wf_3", name: "Integração de API" }
  ])
  
  const [isExecuting, setIsExecuting] = useState(false)
  
  /**
   * Executa um workflow a partir do chat
   */
  const handleExecuteWorkflow = useCallback(async (workflowId: string, workflowName: string) => {
    if (!currentConversationId) return
    
    try {
      setIsExecuting(true)
      
      // Envia mensagem informando sobre a execução
      onSendMessage(`Executando workflow "${workflowName}"...`)
      
      // Executa o workflow
      const result = await executeWorkflowFromChat(workflowId)
      
      // Envia o resultado para o chat
      onSendMessage(`Resultado da execução do workflow "${workflowName}":\n\n${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      console.error("Erro ao executar workflow:", error)
      onSendMessage(`Erro ao executar workflow "${workflowName}": ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsExecuting(false)
    }
  }, [currentConversationId, onSendMessage])
  
  /**
   * Referencia um nó do workflow no chat
   */
  const handleReferenceNode = useCallback(async (nodeId: string) => {
    if (!currentConversationId) return
    
    try {
      // Obtém informações sobre o nó
      const nodeInfo = await getWorkflowNodeInfo(nodeId)
      
      // Envia mensagem com referência ao nó
      onSendMessage(`Referência ao nó "${nodeInfo.name}" (ID: ${nodeId}):\n\n${nodeInfo.description || "Sem descrição disponível."}`)
    } catch (error) {
      console.error("Erro ao referenciar nó:", error)
      onSendMessage(`Erro ao referenciar nó ${nodeId}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [currentConversationId, onSendMessage])
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          <span>Workflows</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Integração com Workflows</h4>
            <Link href="/canvas" passHref>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="text-xs">Abrir Canvas</span>
              </Button>
            </Link>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-muted-foreground">Workflows Recentes</h5>
            <div className="space-y-1">
              {recentWorkflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between rounded-md p-2 hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{workflow.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleExecuteWorkflow(workflow.id, workflow.name)}
                      disabled={isExecuting}
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onSendMessage(`Quero discutir o workflow "${workflow.name}"`)}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-muted-foreground">Ações Rápidas</h5>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2"
                onClick={() => onSendMessage("Crie um novo workflow para mim")}
              >
                <Workflow className="h-3.5 w-3.5" />
                <span className="text-xs">Novo Workflow</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2"
                onClick={() => onSendMessage("Liste todos os meus workflows")}
              >
                <List className="h-3.5 w-3.5" />
                <span className="text-xs">Listar Todos</span>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
