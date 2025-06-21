"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, User, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiService } from "@/lib/api/service"
import type { Agent } from "@/lib/api/service"

interface AgentSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectAgent: (agent: { id: string; label: string }) => void
  selectedAgentIds: string[]
}

export function AgentSelectorDialog({
  open,
  onOpenChange,
  onSelectAgent,
  selectedAgentIds
}: AgentSelectorDialogProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadAgents()
    }
  }, [open])

  const loadAgents = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getAgents({ page: 1, size: 50 })
      setAgents(response.items)
    } catch (error) {
      console.error("Erro ao carregar agentes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent =>
    !selectedAgentIds.includes(agent.id) &&
    (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     agent.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSelectAgent = (agent: Agent) => {
    onSelectAgent({
      id: agent.id,
      label: agent.name
    })
    onOpenChange(false)
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Selecionar Agente Relacionado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar agentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de agentes */}
          <ScrollArea className="h-[400px] w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "Nenhum agente encontrado" : "Nenhum agente disponível"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAgents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleSelectAgent(agent)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{agent.name}</h4>
                        {agent.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {agent.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {agent.agent_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {agent.model_name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Botões de ação */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 