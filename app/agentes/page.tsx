"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate } from "@/utils/date-utils"
import type { Agent } from "@/types/agent-types"
import { apiService } from "@/lib/api/service"
import { mapApiAgentToUiAgent } from "@/types/agent-types"

// Componentes
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"

// Componentes Header, Filters, AgentCard, Pagination, EmptyState
const Header = ({ onCreateAgent }: { onCreateAgent: () => void }) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold tracking-tight">Agentes</h1>
    <Button onClick={onCreateAgent} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
      <Plus className="mr-2 h-4 w-4" /> Novo Agente
    </Button>
  </div>
)

const Filters = ({ 
  searchQuery, 
  statusFilter, 
  onSearchChange, 
  onStatusChange 
}: { 
  searchQuery: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}) => (
  <div className="mb-6 space-y-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        type="text"
        placeholder="Buscar agentes..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
      />
    </div>
    <div className="flex flex-wrap gap-2">
      <Badge 
        onClick={() => onStatusChange("all")} 
        className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${statusFilter === "all" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
      >
        Todos
      </Badge>
      <Badge 
        onClick={() => onStatusChange("active")} 
        className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${statusFilter === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
      >
        Ativos
      </Badge>
      <Badge 
        onClick={() => onStatusChange("draft")} 
        className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${statusFilter === "draft" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
      >
        Rascunhos
      </Badge>
      <Badge 
        onClick={() => onStatusChange("archived")} 
        className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${statusFilter === "archived" ? "bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
      >
        Arquivados
      </Badge>
    </div>
  </div>
)

// Componente de Card de Agente
const AgentCard = ({ 
  agent, 
  onDuplicate, 
  onDelete, 
  onEdit 
}: { 
  agent: Agent
  onDuplicate: () => void
  onDelete: () => void
  onEdit: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
    transition={{ duration: 0.2 }}
    onClick={onEdit}
    style={{ cursor: 'pointer' }}
  >
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 h-full">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{agent.name}</h3>
          <div className="flex space-x-1">
            {agent.status === "active" && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Ativo</Badge>
            )}
            {agent.status === "draft" && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Rascunho</Badge>
            )}
            {agent.status === "archived" && (
              <Badge className="bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100">Arquivado</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{agent.description}</p>
        <div className="flex justify-between items-center">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">{agent.model}</Badge>
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">{agent.type}</Badge>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-2">
          <div>
            <p>Criado:</p>
            <p>{formatDate(agent.createdAt)}</p>
          </div>
          <div>
            <p>Atualizado:</p>
            <p>{formatDate(agent.updatedAt)}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); onDuplicate(); }}>Duplicar</Button>
          <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); onDelete(); }}>Excluir</Button>
        </div>
      </div>
    </Card>
  </motion.div>
)

// Componente de Paginação
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => (
  <div className="flex items-center justify-center space-x-2 mt-6">
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="flex items-center justify-center h-9 w-9 p-0 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
    
    {/* Renderização inteligente de páginas */}
    {Array.from({ length: totalPages }).map((_, i) => {
      // Sempre mostrar primeira, última, atual e páginas adjacentes
      if (
        i === 0 || 
        i === totalPages - 1 || 
        i === currentPage - 1 || 
        i === currentPage - 2 || 
        i === currentPage
      ) {
        return (
          <Button
            key={i}
            variant={currentPage === i + 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(i + 1)}
            className={`flex items-center justify-center h-9 w-9 p-0 rounded-full transition-colors duration-200 ${
              currentPage === i + 1 
                ? "bg-purple-600 text-white hover:bg-purple-700" 
                : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {i + 1}
          </Button>
        )
      }
      
      // Mostrar elipses para indicar páginas omitidas
      if (
        (i === 1 && currentPage > 3) || 
        (i === totalPages - 2 && currentPage < totalPages - 2)
      ) {
        return <span key={i} className="text-gray-500">...</span>
      }
      
      // Ocultar outras páginas
      return null
    })}
    
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="flex items-center justify-center h-9 w-9 p-0 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
)

const EmptyState = ({ onCreateAgent }: { onCreateAgent: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.3 }}
    className="text-center py-12 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 mt-8"
  >
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Nenhum agente encontrado</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Crie seu primeiro agente de IA para começar a automatizar tarefas e interagir com seus usuários.
    </p>
    <Button onClick={onCreateAgent} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
      <Plus className="mr-2 h-4 w-4" /> Criar Agente
    </Button>
  </motion.div>
)

// Número de itens por página
const ITEMS_PER_PAGE = 6;

// Componente de Modal de Exclusão
const DeleteModal = ({ agent, onCancel, onConfirm }: { 
  agent: Agent | null
  onCancel: () => void
  onConfirm: () => void 
}) => {
  if (!agent) return null;
  
  return (
    <Dialog open={!!agent} onOpenChange={() => onCancel()}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full"
        >
          <h2 className="text-xl font-bold mb-4">Confirmar exclusão</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Tem certeza que deseja excluir o agente "{agent.name}"? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
            >
              Excluir
            </Button>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
};

// Componente Principal da Página
export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Carregar agentes da API
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    apiService.getAgents({ page: currentPage, size: ITEMS_PER_PAGE })
      .then((res) => {
        setAgents(res.items.map(mapApiAgentToUiAgent))
        setIsLoading(false)
      })
      .catch((err) => {
        setError("Erro ao carregar agentes. Tente novamente.")
        setIsLoading(false)
      })
  }, [currentPage])

  // Filter agents based on search query and status
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === "all" || agent.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [agents, searchQuery, statusFilter])

  // Calcular o número total de páginas
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);

  // Obter os agentes da página atual
  const currentAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAgents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAgents, currentPage]);

  // Handle agent deletion
  const handleDeleteAgent = async () => {
    if (agentToDelete) {
      setIsLoading(true)
      try {
        await apiService.deleteAgent(agentToDelete.id)
        // Recarregar lista após deleção
        const res = await apiService.getAgents({ page: currentPage, size: ITEMS_PER_PAGE })
        setAgents(res.items.map(mapApiAgentToUiAgent))
      } catch (error) {
        setError("Erro ao excluir agente. Tente novamente.")
      } finally {
        setIsLoading(false)
        setAgentToDelete(null)
      }
    }
  }

  // Handle agent duplication
  const handleDuplicateAgent = async (agent: Agent) => {
    setIsLoading(true)
    try {
      const newAgent = {
        ...agent,
        id: undefined, // Deixe a API gerar o novo ID
        name: `${agent.name} (Cópia)`,
        createdAt: undefined,
        updatedAt: undefined,
        status: "draft",
      }
      await apiService.createAgent(newAgent)
      // Recarregar lista após duplicação
      const res = await apiService.getAgents({ page: currentPage, size: ITEMS_PER_PAGE })
      setAgents(res.items.map(mapApiAgentToUiAgent))
    } catch (error) {
      setError("Erro ao duplicar agente. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para editar agente
  const handleEditAgent = (agent: Agent) => {
    router.push(`/agentes/${agent.id}`)
  }

  // Navigate to create new agent
  const handleCreateAgent = () => {
    router.push("/agentes/novo")
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-pulse h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="animate-pulse h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="animate-pulse h-64 w-full max-w-lg bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-red-600 dark:text-red-400 font-semibold mb-4">{error}</div>
        <Button onClick={() => window.location.reload()} className="bg-purple-600 text-white">Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <Header onCreateAgent={handleCreateAgent} />

      {/* Filters */}
      <Filters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={(value) => setStatusFilter(value as "all" | "active" | "draft" | "archived")}
      />

      {/* Agent list */}
      <AnimatePresence mode="wait">
        {filteredAgents.length === 0 ? (
          <EmptyState onCreateAgent={handleCreateAgent} />
        ) : (
          <motion.div
            key="agent-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onDuplicate={() => handleDuplicateAgent(agent)}
                onDelete={() => setAgentToDelete(agent)}
                onEdit={() => handleEditAgent(agent)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {filteredAgents.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete confirmation modal */}
      <DeleteModal
        agent={agentToDelete}
        onCancel={() => setAgentToDelete(null)}
        onConfirm={handleDeleteAgent}
      />
    </div>
  )
}
