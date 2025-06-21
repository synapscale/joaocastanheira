"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AgentBasicInfo } from "@/components/agents/agent-basic-info"
import { AgentPromptTab } from "@/components/agents/agent-prompt-tab"
import { AgentParametersTab } from "@/components/agents/agent-parameters-tab"
import { AgentConnectionsTab } from "@/components/agents/agent-connections-tab"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, X, ChevronDown, ChevronUp, Sparkles, User, Sliders, Network, Loader2 } from "lucide-react"
import { Section } from "@/components/ui/section"
import { apiService } from "@/lib/api/service"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AgentSelectorDialog } from "@/components/agents/agent-selector-dialog"
import { UrlInputDialog } from "@/components/agents/url-input-dialog"

export default function NovoAgentePage() {
  const router = useRouter()
  const [agent, setAgent] = useState({
    name: "",
    type: "chat",
    model: "gpt-4o",
    description: "",
    status: "draft",
    prompt: "",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    connections: {
      agents: [] as Array<{ id: string; label: string }>,
      urls: [] as Array<{ id: string; label: string; url: string }>
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>("basic")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    prompt: true,
    parameters: true,
    connections: true
  })
  const [showAgentDialog, setShowAgentDialog] = useState(false)
  const [showUrlDialog, setShowUrlDialog] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await apiService.createAgent({
        name: agent.name,
        description: agent.description || undefined,
        agent_type: agent.type,
        personality: undefined,
        instructions: agent.prompt || undefined,
        model_provider: "openai",
        model_name: agent.model,
        temperature: agent.temperature,
        max_tokens: agent.maxTokens,
        tools: [],
        knowledge_base: undefined,
        avatar_url: undefined
      })
      router.push("/agentes")
    } catch (err) {
      setError("Erro ao criar agente. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handlers para conexões
  const handleAddAgent = () => {
    setShowAgentDialog(true)
  }

  const handleSelectAgent = (selectedAgent: { id: string; label: string }) => {
    setAgent(prev => ({
      ...prev,
      connections: {
        ...prev.connections,
        agents: [...prev.connections.agents, selectedAgent]
      }
    }))
  }

  const handleRemoveAgent = (agentId: string) => {
    setAgent(prev => ({
      ...prev,
      connections: {
        ...prev.connections,
        agents: prev.connections.agents.filter(agent => agent.id !== agentId)
      }
    }))
  }

  const handleAddUrl = () => {
    setShowUrlDialog(true)
  }

  const handleAddUrlSubmit = (newUrl: { id: string; label: string; url: string }) => {
    setAgent(prev => ({
      ...prev,
      connections: {
        ...prev.connections,
        urls: [...prev.connections.urls, newUrl]
      }
    }))
  }

  const handleRemoveUrl = (urlId: string) => {
    setAgent(prev => ({
      ...prev,
      connections: {
        ...prev.connections,
        urls: prev.connections.urls.filter(url => url.id !== urlId)
      }
    }))
  }

  // Helpers para props obrigatórias
  const emptyFn = () => {}
  const emptyArr: any[] = []

  // Validation check for enabling save button
  const canSave = agent.name.trim() !== "" && agent.model !== ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container py-6 max-w-5xl mx-auto"
    >
      {/* Header com gradiente e animação */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </Button>
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Criar Novo Agente
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure os detalhes do seu novo agente de IA
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-destructive/15 text-destructive px-4 py-2 rounded-lg text-sm font-medium"
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="form" className="relative">
            Formulário
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
              Ativo
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="preview" disabled>
            Pré-visualização
            <Badge variant="outline" className="ml-2 bg-muted text-muted-foreground">
              Em breve
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="space-y-6">
          {/* Seção de Informações Básicas */}
          <Card className="overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div 
              className={`flex items-center justify-between p-6 cursor-pointer ${expandedSections.basic ? 'border-b border-border/30' : ''}`}
              onClick={() => toggleSection("basic")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Informações Básicas</h3>
                  <p className="text-sm text-muted-foreground">Defina o nome, tipo e outras informações essenciais</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                {expandedSections.basic ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
            
            <AnimatePresence>
              {expandedSections.basic && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-6">
                    <AgentBasicInfo
                      agent={agent}
                      onChange={setAgent}
                      nameError={undefined}
                      className=""
                      id={"agent-basic-info"}
                      testId={"agent-basic-info"}
                      ariaLabel={"Informações Básicas do Agente"}
                    />
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Seção de Prompt */}
          <Card className="overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div 
              className={`flex items-center justify-between p-6 cursor-pointer ${expandedSections.prompt ? 'border-b border-border/30' : ''}`}
              onClick={() => toggleSection("prompt")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Prompt</h3>
                  <p className="text-sm text-muted-foreground">Configure o prompt que será usado pelo seu agente</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                {expandedSections.prompt ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
            
            <AnimatePresence>
              {expandedSections.prompt && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-6">
                    <AgentPromptTab
                      prompt={agent.prompt}
                      onChangePrompt={(value: string) => setAgent({ ...agent, prompt: value })}
                      onBlurPrompt={emptyFn}
                      onOpenTemplates={emptyFn}
                      promptError={undefined}
                      className=""
                      id={"agent-prompt-tab"}
                      testId={"agent-prompt-tab"}
                      ariaLabel={"Prompt do Agente"}
                    />
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Seção de Parâmetros */}
          <Card className="overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div 
              className={`flex items-center justify-between p-6 cursor-pointer ${expandedSections.parameters ? 'border-b border-border/30' : ''}`}
              onClick={() => toggleSection("parameters")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                  <Sliders className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Parâmetros</h3>
                  <p className="text-sm text-muted-foreground">Ajuste os parâmetros de geração do seu agente</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                {expandedSections.parameters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
            
            <AnimatePresence>
              {expandedSections.parameters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-6">
                    <AgentParametersTab
                      maxTokens={agent.maxTokens.toString()}
                      temperature={agent.temperature.toString()}
                      topP={agent.topP.toString()}
                      frequencyPenalty={agent.frequencyPenalty.toString()}
                      presencePenalty={agent.presencePenalty.toString()}
                      userDecision={false}
                      onChangeMaxTokens={(value: string) => setAgent({ ...agent, maxTokens: Number(value) })}
                      onChangeTemperature={(value: string) => setAgent({ ...agent, temperature: Number(value) })}
                      onChangeTopP={(value: string) => setAgent({ ...agent, topP: Number(value) })}
                      onChangeFrequencyPenalty={(value: string) => setAgent({ ...agent, frequencyPenalty: Number(value) })}
                      onChangePresencePenalty={(value: string) => setAgent({ ...agent, presencePenalty: Number(value) })}
                      onChangeUserDecision={emptyFn}
                      onBlurMaxTokens={emptyFn}
                      onBlurTemperature={emptyFn}
                      onBlurTopP={emptyFn}
                      onBlurFrequencyPenalty={emptyFn}
                      onBlurPresencePenalty={emptyFn}
                      maxTokensError={undefined}
                      temperatureError={undefined}
                      topPError={undefined}
                      frequencyPenaltyError={undefined}
                      presencePenaltyError={undefined}
                      className=""
                      id={"agent-params-tab"}
                      testId={"agent-params-tab"}
                      ariaLabel={"Parâmetros do Agente"}
                    />
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Seção de Conexões */}
          <Card className="overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div 
              className={`flex items-center justify-between p-6 cursor-pointer ${expandedSections.connections ? 'border-b border-border/30' : ''}`}
              onClick={() => toggleSection("connections")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <Network className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Conexões</h3>
                  <p className="text-sm text-muted-foreground">Conecte seu agente a outros agentes ou recursos externos</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                {expandedSections.connections ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
            
            <AnimatePresence>
              {expandedSections.connections && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-6">
                    <AgentConnectionsTab
                      agents={agent.connections?.agents || []}
                      urls={agent.connections?.urls || []}
                      onAddAgent={handleAddAgent}
                      onRemoveAgent={handleRemoveAgent}
                      onAddUrl={handleAddUrl}
                      onRemoveUrl={handleRemoveUrl}
                      onEditAgent={emptyFn}
                      onEditUrl={emptyFn}
                      className=""
                      id={"agent-connections-tab"}
                      testId={"agent-connections-tab"}
                      ariaLabel={"Conexões do Agente"}
                    />
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botões de ação */}
      <motion.div 
        className="flex justify-end gap-4 pt-6 mt-6 border-t border-border/40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg border border-border hover:bg-accent transition-all duration-300"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancelar e voltar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleSave}
                  disabled={!canSave || isLoading}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Agente
                    </>
                  )}
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Salvar e criar agente</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

             {/* Progress indicator */}
       <div className="mt-8 flex items-center justify-center gap-2">
         <div className={`h-2 w-2 rounded-full ${agent.name ? 'bg-primary' : 'bg-muted'} transition-colors duration-300`} />
         <div className={`h-2 w-2 rounded-full ${agent.prompt ? 'bg-primary' : 'bg-muted'} transition-colors duration-300`} />
         <div className={`h-2 w-2 rounded-full ${agent.model ? 'bg-primary' : 'bg-muted'} transition-colors duration-300`} />
         <div className={`h-2 w-2 rounded-full ${agent.connections.agents.length > 0 || agent.connections.urls.length > 0 ? 'bg-primary' : 'bg-muted'} transition-colors duration-300`} />
       </div>

       {/* Dialogs */}
       <AgentSelectorDialog
         open={showAgentDialog}
         onOpenChange={setShowAgentDialog}
         onSelectAgent={handleSelectAgent}
         selectedAgentIds={agent.connections.agents.map(a => a.id)}
       />

       <UrlInputDialog
         open={showUrlDialog}
         onOpenChange={setShowUrlDialog}
         onAddUrl={handleAddUrlSubmit}
       />
    </motion.div>
  )
}
