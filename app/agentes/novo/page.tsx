"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AgentBasicInfo } from "@/components/agents/agent-basic-info"
import { AgentPromptTab } from "@/components/agents/agent-prompt-tab"
import { AgentParametersTab } from "@/components/agents/agent-parameters-tab"
import { AgentConnectionsTab } from "@/components/agents/agent-connections-tab"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, X } from "lucide-react"
import { Section } from "@/components/ui/section"
import { apiService } from "@/lib/api/service"

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
      agents: [],
      urls: []
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await apiService.createAgent({
        name: agent.name,
        description: agent.description,
        agent_type: agent.type,
        model_name: agent.model,
        temperature: agent.temperature,
        max_tokens: agent.maxTokens,
        // Adicione outros campos conforme necessário
      })
      router.push("/agentes")
    } catch (err) {
      setError("Erro ao criar agente. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar helpers para props obrigatórias
  const emptyFn = () => {}
  const emptyArr: any[] = []

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container py-6"
    >
      {/* Header com gradiente e animação */}
      <motion.div 
        className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
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
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Configure os detalhes do seu novo agente de IA
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        {/* Seção de Informações Básicas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Section 
            title="Informações Básicas" 
            description="Defina o nome, tipo e outras informações essenciais do seu agente"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            titleClassName="text-xl font-semibold text-gray-900 dark:text-white"
          >
            <AgentBasicInfo
              agent={agent}
              onChange={setAgent}
              nameError={undefined}
              className=""
              id={"agent-basic-info"}
              testId={"agent-basic-info"}
              ariaLabel={"Informações Básicas do Agente"}
            />
          </Section>
        </motion.div>

        {/* Seção de Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Section 
            title="Prompt" 
            description="Configure o prompt que será usado pelo seu agente"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            titleClassName="text-xl font-semibold text-gray-900 dark:text-white"
          >
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
          </Section>
        </motion.div>

        {/* Seção de Parâmetros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Section 
            title="Parâmetros" 
            description="Ajuste os parâmetros de geração do seu agente"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            titleClassName="text-xl font-semibold text-gray-900 dark:text-white"
          >
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
          </Section>
        </motion.div>

        {/* Seção de Conexões */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Section 
            title="Conexões" 
            description="Conecte seu agente a outros agentes ou recursos externos"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            titleClassName="text-xl font-semibold text-gray-900 dark:text-white"
          >
            <AgentConnectionsTab
              agents={agent.connections?.agents || emptyArr}
              urls={agent.connections?.urls || emptyArr}
              onAddAgent={emptyFn}
              onRemoveAgent={emptyFn}
              onAddUrl={emptyFn}
              onRemoveUrl={emptyFn}
              onEditAgent={emptyFn}
              onEditUrl={emptyFn}
              className=""
              id={"agent-connections-tab"}
              testId={"agent-connections-tab"}
              ariaLabel={"Conexões do Agente"}
            />
          </Section>
        </motion.div>

        {/* Botões de ação */}
        <motion.div 
          className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300"
            >
              <Save className="h-4 w-4" />
              Salvar Agente
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
