"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Filter, Clock, ArrowUpDown, MoreVertical, Activity, AlertTriangle, Clock3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { apiService } from "@/lib/api/service"
import type { Workflow as WorkflowApi } from "@/lib/api/service"

// Tipos para os workflows
type WorkflowStatus = "active" | "inactive"
type WorkflowVisibility = "personal" | "team" | "public"

interface WorkflowTag {
  id: string
  name: string
}

// Use a distinct name for the UI workflow type
interface WorkflowUI {
  id: string
  name: string
  description?: string
  status: WorkflowStatus
  visibility: WorkflowVisibility
  lastUpdated: string
  created: string
  tags: WorkflowTag[]
}

// Dados de exemplo para as métricas
const initialMetrics = {
  productionExecutions: "Coletando...",
  failedExecutions: "Coletando...",
  failureRate: "Coletando...",
  timeSaved: "Coletando...",
  runTimeAvg: "Coletando..."
}

// Map API Workflow to UI Workflow type for rendering
function mapApiWorkflowToUI(apiWorkflow: WorkflowApi): WorkflowUI {
  return {
    id: apiWorkflow.id,
    name: apiWorkflow.name,
    description: apiWorkflow.description,
    status: apiWorkflow.status as WorkflowStatus || "inactive",
    visibility: (apiWorkflow as any).visibility || "personal",
    lastUpdated: apiWorkflow.updated_at || "",
    created: apiWorkflow.created_at || "",
    tags: (apiWorkflow.tags || []).map((tag: string) => ({ id: tag, name: tag })),
  };
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowUI[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("workflows")
  const [sortBy, setSortBy] = useState("last-updated")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newWorkflowName, setNewWorkflowName] = useState("")
  const [metrics] = useState(initialMetrics)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null)

  // Carregar workflows da API ao iniciar
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    apiService.getWorkflows()
      .then(res => {
        setWorkflows(res.items.map(mapApiWorkflowToUI))
        setIsLoading(false)
      })
      .catch(() => {
        setError("Erro ao carregar workflows. Tente novamente.")
        setIsLoading(false)
      })
  }, [])

  // Manipular a criação de um novo workflow
  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast.error("O nome do workflow é obrigatório")
      return
    }
    setIsCreating(true)
    try {
      const newWorkflow = await apiService.createWorkflow({
        name: newWorkflowName,
        description: '',
        definition: {},
        // Adicione outros campos conforme necessário
      })
      setIsCreateDialogOpen(false)
      setNewWorkflowName("")
      // Redirecionar para o Canvas de edição do workflow criado
      window.location.href = `/canvas?id=${newWorkflow.id}`
    } catch (err) {
      toast.error("Erro ao criar workflow. Tente novamente.")
    } finally {
      setIsCreating(false)
    }
  }

  // Excluir um workflow
  const deleteWorkflow = async (id: string) => {
    setIsDeleting(id)
    try {
      await apiService.deleteWorkflow(id)
      setWorkflows(prev => prev.filter(workflow => workflow.id !== id))
      toast.success("Workflow excluído com sucesso!")
    } catch (err) {
      toast.error("Erro ao excluir workflow. Tente novamente.")
    } finally {
      setIsDeleting(null)
    }
  }

  // Duplicar um workflow
  const duplicateWorkflow = async (workflow: WorkflowUI) => {
    setIsDuplicating(workflow.id)
    try {
      const duplicatedWorkflow = await apiService.createWorkflow({
        name: `${workflow.name} (cópia)`,
        description: workflow.description || '',
        definition: {}, // ou copie a definição se disponível
        // Adicione outros campos conforme necessário
      })
      setWorkflows(prev => [mapApiWorkflowToUI(duplicatedWorkflow), ...prev])
      toast.success("Workflow duplicado com sucesso!")
    } catch (err) {
      toast.error("Erro ao duplicar workflow. Tente novamente.")
    } finally {
      setIsDuplicating(null)
    }
  }

  // Filtrar workflows com base na pesquisa
  const filteredWorkflows = workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animações para os cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Workflow
            </Button>
          </div>
          <p className="text-muted-foreground">
            Todos os workflows, credenciais e execuções que você tem acesso
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Prod. executions</span>
                <span className="text-sm text-muted-foreground">Últimos 7 dias</span>
                <span className="text-lg font-medium">{metrics.productionExecutions}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Failed prod. executions</span>
                <span className="text-sm text-muted-foreground">Últimos 7 dias</span>
                <span className="text-lg font-medium">{metrics.failedExecutions}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Failure rate</span>
                <span className="text-sm text-muted-foreground">Últimos 7 dias</span>
                <span className="text-lg font-medium">{metrics.failureRate}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Time saved</span>
                <span className="text-sm text-muted-foreground">Últimos 7 dias</span>
                <span className="text-lg font-medium">{metrics.timeSaved}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Run time (avg.)</span>
                <span className="text-sm text-muted-foreground">Últimos 7 dias</span>
                <span className="text-lg font-medium">{metrics.runTimeAvg}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Abas */}
        <Tabs 
          defaultValue="workflows" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger 
              value="workflows" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
              Workflows
            </TabsTrigger>
            <TabsTrigger 
              value="credentials" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
              Credentials
            </TabsTrigger>
            <TabsTrigger 
              value="executions" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
              Executions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="pt-4">
            <div className="flex flex-col space-y-4">
              {/* Barra de pesquisa e filtros */}
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar workflows..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        {sortBy === "last-updated" ? "Ordenar por última atualização" : "Ordenar por nome"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("last-updated")}>
                        <Clock className="h-4 w-4 mr-2" />
                        Última atualização
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("name")}>
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Nome
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Lista de workflows */}
              <div className="space-y-4">
                {filteredWorkflows.length > 0 ? (
                  filteredWorkflows.map((workflow, index) => (
                    <motion.div
                      key={workflow.id}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{workflow.name}</h3>
                                {workflow.status === "active" && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <Activity className="h-3 w-3 mr-1" />
                                    Ativo
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center text-sm text-muted-foreground">
                                <span className="mr-4">Última atualização {workflow.lastUpdated}</span>
                                <span className="mr-4">Criado {workflow.created}</span>
                                {workflow.tags.map(tag => (
                                  <Badge key={tag.id} variant="secondary" className="mr-1 mt-1">
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  Personal
                                </Badge>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={workflow.status === "active"}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {workflow.status === "active" ? "Ativo" : "Inativo"}
                                  </span>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={isDuplicating === workflow.id}>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => window.location.href = `/canvas?workflow=${workflow.id}`}>
                                    Editar no Canvas
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => duplicateWorkflow(workflow)} disabled={isDuplicating === workflow.id}>
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteWorkflow(workflow.id)} disabled={isDeleting === workflow.id} className="text-red-600">
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">Nenhum workflow encontrado</h3>
                    <p className="text-muted-foreground mt-1">
                      Tente ajustar sua pesquisa ou crie um novo workflow.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Workflow
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="credentials" className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Clock3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Credenciais em breve</h3>
              <p className="text-muted-foreground mt-1">
                Esta funcionalidade estará disponível em breve.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="executions" className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Execuções em breve</h3>
              <p className="text-muted-foreground mt-1">
                Esta funcionalidade estará disponível em breve.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de criação de workflow */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Nome do workflow</Label>
              <Input
                id="workflow-name"
                placeholder="Meu novo workflow"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={isCreating}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
