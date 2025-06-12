"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { apiService } from "@/lib/api/service"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { AgentBasicInfo } from "@/components/agents/agent-basic-info"
import { AgentPromptTab } from "@/components/agents/agent-prompt-tab"
import { AgentParametersTab } from "@/components/agents/agent-parameters-tab"
import { AgentConnectionsTab } from "@/components/agents/agent-connections-tab"
import { Save, X } from "lucide-react"

export default function EditAgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params?.id as string
  const [agent, setAgent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!agentId) return
    setIsLoading(true)
    setError(null)
    apiService.getAgent(agentId)
      .then(setAgent)
      .catch(() => setError("Erro ao carregar agente."))
      .finally(() => setIsLoading(false))
  }, [agentId])

  const handleSave = async () => {
    if (!agent) return
    setIsSaving(true)
    setError(null)
    try {
      await apiService.updateAgent(agentId, {
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
      setError("Erro ao salvar alterações. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="container py-6">Carregando agente...</div>
  }
  if (error) {
    return <div className="container py-6 text-red-600">{error}</div>
  }
  if (!agent) {
    return <div className="container py-6">Agente não encontrado.</div>
  }

  // Props obrigatórias para os componentes customizados
  const emptyFn = () => {}
  const emptyArr: any[] = []

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Editar Agente</h1>
      <Section title="Informações Básicas">
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
      <Section title="Prompt">
        <AgentPromptTab
          prompt={agent.prompt}
          onChangePrompt={(v: string) => setAgent({ ...agent, prompt: v })}
          onBlurPrompt={emptyFn}
          onOpenTemplates={emptyFn}
          promptError={undefined}
          className=""
          id={"agent-prompt-tab"}
          testId={"agent-prompt-tab"}
          ariaLabel={"Prompt do Agente"}
        />
      </Section>
      <Section title="Parâmetros">
        <AgentParametersTab
          maxTokens={agent.maxTokens?.toString() || ''}
          temperature={agent.temperature?.toString() || ''}
          topP={agent.topP?.toString() || ''}
          frequencyPenalty={agent.frequencyPenalty?.toString() || ''}
          presencePenalty={agent.presencePenalty?.toString() || ''}
          userDecision={false}
          onChangeMaxTokens={(v: string) => setAgent({ ...agent, maxTokens: Number(v) })}
          onChangeTemperature={(v: string) => setAgent({ ...agent, temperature: Number(v) })}
          onChangeTopP={(v: string) => setAgent({ ...agent, topP: Number(v) })}
          onChangeFrequencyPenalty={(v: string) => setAgent({ ...agent, frequencyPenalty: Number(v) })}
          onChangePresencePenalty={(v: string) => setAgent({ ...agent, presencePenalty: Number(v) })}
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
      <Section title="Conexões">
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
      {error && <div className="text-red-600 mt-4">{error}</div>}
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={() => router.back()} disabled={isSaving}><X className="h-4 w-4" /> Cancelar</Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 text-white"><Save className="h-4 w-4" /> Salvar</Button>
      </div>
    </div>
  )
} 