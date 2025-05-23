/**
 * Componente de Integração entre Abas
 * 
 * Este componente facilita a navegação e integração entre as diferentes abas
 * do sistema (Canvas, Chat, Configurações), permitindo compartilhamento de contexto
 * e transições suaves.
 */
"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  LayoutGrid, 
  MessageSquare, 
  Settings,
  ArrowRight
} from "lucide-react"
import { useAppContext } from "@/contexts/app-context"

interface TabIntegrationProps {
  currentTab: "canvas" | "chat" | "settings"
}

/**
 * Componente de integração entre abas
 */
export default function TabIntegration({
  currentTab
}: TabIntegrationProps) {
  // Router para navegação
  const router = useRouter()
  
  // Contexto da aplicação
  const { 
    currentConversationId,
    updateConversation
  } = useAppContext()
  
  /**
   * Navega para o canvas com contexto
   */
  const navigateToCanvas = useCallback(() => {
    router.push("/canvas")
  }, [router])
  
  /**
   * Navega para o chat com contexto
   */
  const navigateToChat = useCallback(() => {
    router.push("/chat")
  }, [router])
  
  /**
   * Navega para as configurações
   */
  const navigateToSettings = useCallback(() => {
    router.push("/settings")
  }, [router])
  
  /**
   * Compartilha o workflow atual com o chat
   */
  const shareWorkflowWithChat = useCallback(() => {
    // Simula obtenção do workflow atual
    const currentWorkflow = {
      id: "wf_current",
      name: "Workflow Atual"
    }
    
    if (currentConversationId) {
      // Adiciona metadados à conversa atual
      updateConversation(currentConversationId, {
        metadata: {
          linkedWorkflow: currentWorkflow.id,
          linkedWorkflowName: currentWorkflow.name
        }
      })
    }
    
    // Navega para o chat
    router.push("/chat")
  }, [currentConversationId, router, updateConversation])
  
  /**
   * Compartilha a conversa atual com o canvas
   */
  const shareChatWithCanvas = useCallback(() => {
    // Navega para o canvas com parâmetro de conversa
    if (currentConversationId) {
      router.push(`/canvas?conversationId=${currentConversationId}`)
    } else {
      router.push("/canvas")
    }
  }, [currentConversationId, router])
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-40 rounded-full shadow-md">
          {currentTab === "canvas" && <MessageSquare className="h-5 w-5" />}
          {currentTab === "chat" && <LayoutGrid className="h-5 w-5" />}
          {currentTab === "settings" && <LayoutGrid className="h-5 w-5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Navegação Rápida</h4>
          </div>
          
          <div className="space-y-2">
            {currentTab !== "canvas" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={navigateToCanvas}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Editor de Workflow</span>
              </Button>
            )}
            
            {currentTab !== "chat" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={navigateToChat}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat Interativo</span>
              </Button>
            )}
            
            {currentTab !== "settings" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={navigateToSettings}
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-muted-foreground">Compartilhar Contexto</h5>
            
            {currentTab === "canvas" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={shareWorkflowWithChat}
              >
                <ArrowRight className="h-4 w-4" />
                <span>Compartilhar com Chat</span>
              </Button>
            )}
            
            {currentTab === "chat" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={shareChatWithCanvas}
              >
                <ArrowRight className="h-4 w-4" />
                <span>Compartilhar com Canvas</span>
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
