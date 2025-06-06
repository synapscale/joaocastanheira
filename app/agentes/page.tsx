"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate } from "@/utils/date-utils"
import type { Agent } from "@/types/agent-types"

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
  onDelete 
}: { 
  agent: Agent
  onDuplicate: () => void
  onDelete: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
    transition={{ duration: 0.2 }}
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

// Sample agents data - Garantindo que sempre haja dados mockados mesmo sem localStorage
const SAMPLE_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Assistente de Suporte Técnico",
    type: "chat",
    model: "gpt-4o",
    description: "Assistente especializado em resolver problemas técnicos",
    status: "active",
    createdAt: "2023-05-15T10:30:00.000Z",
    updatedAt: "2023-05-15T10:30:00.000Z",
  },
  {
    id: "2",
    name: "Gerador de Conteúdo para Blog",
    type: "texto",
    model: "gpt-4",
    description: "Cria artigos de blog sobre diversos temas",
    status: "draft",
    createdAt: "2023-05-10T14:20:00.000Z",
    updatedAt: "2023-05-14T09:15:00.000Z",
  },
  {
    id: "3",
    name: "Assistente de Pesquisa Acadêmica",
    type: "chat",
    model: "gpt-4",
    description: "Auxilia em pesquisas acadêmicas e formatação de trabalhos",
    status: "active",
    createdAt: "2023-05-05T08:45:00.000Z",
    updatedAt: "2023-05-12T16:30:00.000Z",
  },
  {
    id: "4",
    name: "Assistente de Escrita Criativa",
    type: "texto",
    model: "gpt-4",
    description: "Ajuda a desenvolver histórias e textos criativos",
    status: "active",
    createdAt: "2023-05-03T11:20:00.000Z",
    updatedAt: "2023-05-10T14:45:00.000Z",
  },
  {
    id: "5",
    name: "Analista de Dados",
    type: "chat",
    model: "gpt-4o",
    description: "Interpreta dados e gera insights para tomada de decisões",
    status: "draft",
    createdAt: "2023-05-01T09:15:00.000Z",
    updatedAt: "2023-05-08T16:30:00.000Z",
  },
  {
    id: "6",
    name: "Assistente de Marketing",
    type: "chat",
    model: "gpt-3.5-turbo",
    description: "Auxilia na criação de estratégias e conteúdos de marketing",
    status: "archived",
    createdAt: "2023-04-28T13:40:00.000Z",
    updatedAt: "2023-05-05T10:20:00.000Z",
  },
  {
    id: "7",
    name: "Gerador de Imagens",
    type: "imagem",
    model: "gpt-4o",
    description: "Cria imagens a partir de descrições textuais",
    status: "active",
    createdAt: "2023-04-25T15:30:00.000Z",
    updatedAt: "2023-05-02T11:45:00.000Z",
  },
  {
    id: "8",
    name: "Assistente de Programação",
    type: "chat",
    model: "gpt-4",
    description: "Ajuda a escrever e depurar código em várias linguagens",
    status: "active",
    createdAt: "2023-04-22T10:10:00.000Z",
    updatedAt: "2023-04-29T14:25:00.000Z",
  },
  {
    id: "9",
    name: "Tradutor Multilíngue",
    type: "texto",
    model: "gpt-4",
    description: "Traduz textos entre diversos idiomas",
    status: "draft",
    createdAt: "2023-04-20T08:50:00.000Z",
    updatedAt: "2023-04-27T13:15:00.000Z",
  }
]

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
  const [agents, setAgents] = useState<Agent[]>(SAMPLE_AGENTS)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Garantir que os dados mockados sejam carregados no localStorage
  useEffect(() => {
    try {
      const storedAgents = localStorage.getItem("agents");
      if (!storedAgents) {
        localStorage.setItem("agents", JSON.stringify(SAMPLE_AGENTS));
      } else {
        setAgents(JSON.parse(storedAgents));
      }
    } catch (error) {
      console.error("Erro ao acessar localStorage:", error);
      // Fallback para dados mockados em caso de erro
      setAgents(SAMPLE_AGENTS);
    }
    
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

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

  // Resetar para a primeira página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Handle agent deletion
  const handleDeleteAgent = () => {
    if (agentToDelete) {
      const updatedAgents = agents.filter((agent) => agent.id !== agentToDelete.id);
      setAgents(updatedAgents);
      try {
        localStorage.setItem("agents", JSON.stringify(updatedAgents));
      } catch (error) {
        console.error("Erro ao salvar no localStorage:", error);
      }
      setAgentToDelete(null);
    }
  }

  // Handle agent duplication
  const handleDuplicateAgent = (agent: Agent) => {
    const newAgent: Agent = {
      ...agent,
      id: Date.now().toString(),
      name: `${agent.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
    }

    const updatedAgents = [...agents, newAgent];
    setAgents(updatedAgents);
    try {
      localStorage.setItem("agents", JSON.stringify(updatedAgents));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  }

  // Navigate to create new agent
  const handleCreateAgent = () => {
    router.push("/agentes/novo")
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
          ))}
        </div>
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
