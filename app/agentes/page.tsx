"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X, 
  Copy, 
  Trash2, 
  MoreHorizontal, 
  Menu, 
  Bot, 
  Wrench, 
  Database, 
  LogOut, 
  User
} from "lucide-react"
import { formatDate } from "@/utils/date-utils"
import type { Agent } from "@/types/agent-types"
import { apiService } from "@/lib/api/service"
import { mapApiAgentToUiAgent } from "@/types/agent-types"
import { ProtectedRoute } from "@/components/auth/protected-route"

// Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

// Header Component
const Header = ({ onCreateAgent }: { onCreateAgent: () => void }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
      Agentes
    </h1>
    <Button 
      onClick={onCreateAgent} 
      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
    >
      <Plus className="mr-2 h-4 w-4" /> Novo Agente
    </Button>
  </div>
)

// Filters Component
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
  <div className="mb-8 space-y-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
      <Input
        type="text"
        placeholder="Buscar agentes..."
        value={searchQuery || ""}
        onChange={(e) => onSearchChange(e.target.value || "")}
        className="pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
      />
    </div>
    <div className="flex flex-wrap gap-2">
      <Badge 
        onClick={() => onStatusChange("all")} 
        variant={(statusFilter || "all") === "all" ? "default" : "outline"}
        className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          (statusFilter || "all") === "all" 
            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-indigo-800" 
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <Filter className="w-3.5 h-3.5 mr-1.5" />
        Todos
      </Badge>
      <Badge 
        onClick={() => onStatusChange("active")} 
        variant={(statusFilter || "all") === "active" ? "default" : "outline"}
        className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          (statusFilter || "all") === "active" 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800" 
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
        Ativos
      </Badge>
      <Badge 
        onClick={() => onStatusChange("draft")} 
        variant={(statusFilter || "all") === "draft" ? "default" : "outline"}
        className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          (statusFilter || "all") === "draft" 
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-800" 
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
        Rascunhos
      </Badge>
      <Badge 
        onClick={() => onStatusChange("archived")} 
        variant={(statusFilter || "all") === "archived" ? "default" : "outline"}
        className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          (statusFilter || "all") === "archived" 
            ? "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600" 
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-gray-500 mr-1.5"></span>
        Arquivados
      </Badge>
    </div>
  </div>
)

// Agent Card Component
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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800";
      case "archived": return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case "active": return "Ativo";
      case "draft": return "Rascunho";
      case "archived": return "Arquivado";
      default: return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onEdit}
      className="cursor-pointer h-full"
    >
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <div className="p-5 flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-green-500" : agent.status === "draft" ? "bg-yellow-500" : "bg-gray-500"}`}></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{agent.name}</h3>
            </div>
            <Badge className={`${getStatusColor(agent.status)}`}>
              {getStatusLabel(agent.status)}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">{agent.description || "Sem descrição"}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
                         <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/50">
               {agent.model}
             </Badge>
             <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/50">
               {agent.type}
             </Badge>
          </div>
          
          <Separator className="my-3 bg-gray-200 dark:bg-gray-700" />
          
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <div>
              <p className="font-medium">Criado:</p>
                             <p>{agent.createdAt ? formatDate(agent.createdAt) : "Data inválida"}</p>
            </div>
            <div>
              <p className="font-medium">Atualizado:</p>
                             <p>{agent.updatedAt ? formatDate(agent.updatedAt) : "Data inválida"}</p>
            </div>
          </div>
          
          <motion.div 
            className="flex gap-2 mt-4 justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              size="sm" 
              variant="outline" 
              onClick={e => { e.stopPropagation(); onDuplicate(); }}
              className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="sr-only">Duplicar</span>
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={e => { e.stopPropagation(); onDelete(); }}
              className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Excluir</span>
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

// Pagination Component
const EnhancedPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => (
  <Pagination className="mt-8">
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious
          onClick={() => onPageChange(currentPage - 1)}
          className={`${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        />
      </PaginationItem>
      
      {Array.from({ length: totalPages }).map((_, i) => {
        // Always show first, last, current and adjacent pages
        if (
          i === 0 || 
          i === totalPages - 1 || 
          i === currentPage - 1 || 
          i === currentPage - 2 || 
          i === currentPage
        ) {
          return (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => onPageChange(i + 1)}
                isActive={currentPage === i + 1}
                className="cursor-pointer"
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          )
        }
        
        // Show ellipsis for omitted pages
        if (
          (i === 1 && currentPage > 3) || 
          (i === totalPages - 2 && currentPage < totalPages - 2)
        ) {
          return (
            <PaginationItem key={i}>
              <PaginationEllipsis />
            </PaginationItem>
          )
        }
        
        return null
      })}
      
      <PaginationItem>
        <PaginationNext
          onClick={() => onPageChange(currentPage + 1)}
          className={`${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
)

// Empty State Component
const EmptyState = ({ onCreateAgent }: { onCreateAgent: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.4 }}
    className="text-center py-16 px-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 mt-8"
  >
    <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
      <Search className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
    </div>
    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">Nenhum agente encontrado</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Crie seu primeiro agente de IA para começar a automatizar tarefas e interagir com seus usuários.
    </p>
    <Button 
      onClick={onCreateAgent} 
      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
    >
      <Plus className="mr-2 h-4 w-4" /> Criar Agente
    </Button>
  </motion.div>
)

// Delete Confirmation Modal
const DeleteModal = ({ agent, onCancel, onConfirm }: { 
  agent: Agent | null
  onCancel: () => void
  onConfirm: () => void 
}) => {
  if (!agent) return null;
  
  return (
    <Dialog open={!!agent} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Confirmar exclusão</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Tem certeza que deseja excluir o agente <span className="font-semibold">"{agent.name}"</span>? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex justify-end gap-3">
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
      </DialogContent>
    </Dialog>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="container py-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
    
    <div className="mb-8 space-y-4">
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        ))}
      </div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="container py-6 flex flex-col items-center justify-center min-h-[300px]"
  >
    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
      <X className="h-8 w-8 text-red-600 dark:text-red-400" />
    </div>
    <div className="text-red-600 dark:text-red-400 font-semibold mb-4 text-center">{error}</div>
    <Button 
      onClick={onRetry} 
      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
    >
      Tentar novamente
    </Button>
  </motion.div>
);

// Number of items per page
const ITEMS_PER_PAGE = 6;

// Placeholder for Tools
const ToolsPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <Wrench className="w-12 h-12 mb-4 text-muted-foreground" />
    <h2 className="text-xl font-bold mb-2">Gerencie as ferramentas dos agentes</h2>
    <p className="text-muted-foreground mb-4">Aqui você poderá adicionar, editar e remover integrações e ferramentas disponíveis para seus agentes.</p>
    <Button variant="outline" disabled>Nova Ferramenta (em breve)</Button>
  </div>
);

// Placeholder for Knowledge Base
const KnowledgePlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <Database className="w-12 h-12 mb-4 text-muted-foreground" />
    <h2 className="text-xl font-bold mb-2">Base de Conhecimento dos agentes</h2>
    <p className="text-muted-foreground mb-4">Organize e gerencie as fontes de conhecimento que os agentes podem acessar.</p>
    <Button variant="outline" disabled>Nova Base (em breve)</Button>
  </div>
);

// Main Component
export default function AgentsPage() {
  const pathname = usePathname()
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load agents from API with server-side filtering
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    const params: any = { 
      page: currentPage, 
      size: ITEMS_PER_PAGE 
    }
    
    if (searchQuery) {
      params.search = searchQuery
    }

    apiService.getAgents(params)
      .then((res: any) => {
        const items = res.items || (res.data && res.data.items) || [];
        const totalPages = res.pages || (res.data && res.data.pages) || Math.ceil((res.total || (res.data && res.data.total) || 0) / ITEMS_PER_PAGE);

        setAgents(items.map(mapApiAgentToUiAgent))
        setTotalPages(totalPages)
        setIsLoading(false)
      })
      .catch((err) => {
        setError("Erro ao carregar agentes. Tente novamente.")
        setIsLoading(false)
      })
  }, [currentPage, searchQuery])

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Filter agents based on search query and status - now server-side
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesStatus = statusFilter === "all" || agent.status === statusFilter
      return matchesStatus
    })
  }, [agents, statusFilter])

  // Current agents are the loaded agents (server-side pagination)
  const currentAgents = filteredAgents;

  // Handle agent deletion
  const handleDeleteAgent = async () => {
    if (agentToDelete) {
      setIsLoading(true)
      try {
        await apiService.deleteAgent(agentToDelete.id)
        // Reload list after deletion
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
      // Use the dedicated duplicate endpoint
      await apiService.duplicateAgent(agent.id)
      // Reload list after duplication
      const res = await apiService.getAgents({ page: currentPage, size: ITEMS_PER_PAGE })
      setAgents(res.items.map(mapApiAgentToUiAgent))
    } catch (error) {
      setError("Erro ao duplicar agente. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to edit agent
  const handleEditAgent = (agent: Agent) => {
    router.push(`/agentes/${agent.id}`)
  }

  // Navigate to create new agent
  const handleCreateAgent = () => {
    router.push("/agentes/novo")
  }

  // Detectar se está em /agentes/tools ou /agentes/knowledge
  if (pathname === "/agentes/tools" || pathname === "/agentes/knowledge") {
    const isTools = pathname === "/agentes/tools"
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="flex flex-col items-center gap-2">
          {isTools ? <Wrench className="w-12 h-12 text-primary" /> : <Database className="w-12 h-12 text-primary" />}
          <h2 className="text-2xl font-bold">
            {isTools ? "Gerenciamento de Tools" : "Knowledge Base do Agente"}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {isTools
              ? "Aqui você poderá adicionar, remover e configurar ferramentas (tools) para seus agentes. Em breve!"
              : "Aqui você poderá gerenciar a base de conhecimento dos agentes, adicionar fontes, editar conteúdos e muito mais. Em breve!"}
          </p>
        </div>
        <Button onClick={() => router.push("/agentes")}>Voltar para Agentes</Button>
      </div>
    )
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        <div className="mb-8 space-y-4">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <X className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-red-600 dark:text-red-400 font-semibold mb-4 text-center">{error}</div>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Header onCreateAgent={handleCreateAgent} />
      <Filters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={(value) => setSearchQuery(String(value))}
        onStatusChange={(value) => setStatusFilter(String(value))}
      />
      <AnimatePresence mode="wait">
        {filteredAgents.length === 0 ? (
          <EmptyState onCreateAgent={handleCreateAgent} />
        ) : (
          <motion.div
            key="agent-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
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
      {filteredAgents.length > 0 && (
        <EnhancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      <DeleteModal
        agent={agentToDelete}
        onCancel={() => setAgentToDelete(null)}
        onConfirm={handleDeleteAgent}
      />
    </div>
  )
}
