"use client"
import React from "react";
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Skeleton } from "../../components/ui/skeleton"
import { AgentListHeader } from "../../components/agents/agent-list-header"
import { AgentListFilters } from "../../components/agents/agent-list-filters"
import { AgentListEmpty } from "../../components/agents/agent-list-empty"
import { AgentCard } from "../../components/agents/agent-card"
import { AgentDeleteDialog } from "../../components/agents/agent-delete-dialog"
import { formatDate } from "../../../../shared/utils/date-utils"
// Update the import path below to the correct location if needed
// Update the import path below to the correct location if needed
type AgentType = {
  id: string;
  name: string;
  type: string;
  model: string;
  description: string;
  status: "active" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
};
// If the above import fails, try the correct path below:
// import type { AgentType } from "../../../types/agent-types";
// Or define AgentType inline as a temporary fix:
// type AgentType = {
//   id: string;
//   name: string;
//   type: string;
//   model: string;
//   description: string;
//   status: "active" | "draft" | "archived";
//   createdAt: string;
//   updatedAt: string;
// };

// Sample agents data
const SAMPLE_AGENTS: AgentType[] = [
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
]

export default function AgentsPage() {
	const router = useRouter()
	const [agents, setAgents] = useLocalStorage<AgentType[]>("agents", SAMPLE_AGENTS)
	const [searchQuery, setSearchQuery] = useState("")
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all")
	const [isLoading, setIsLoading] = useState(true)
	const [agentToDelete, setAgentToDelete] = useState<AgentType | null>(null)

	// Simulate loading state
	useEffect(() => {
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

	// Handle agent deletion
	const handleDeleteAgent = () => {
		if (agentToDelete) {
			setAgents(agents.filter((agent) => agent.id !== agentToDelete.id))
			setAgentToDelete(null)
		}
	}

	// Handle agent duplication
	const handleDuplicateAgent = (agent: AgentType) => {
		const newAgent: AgentType = {
			...agent,
			id: Date.now().toString(),
			name: `${agent.name} (Cópia)`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			status: "draft",
		}

		setAgents([...agents, newAgent])
	}

	// Navigate to create new agent
	const handleCreateAgent = () => {
		router.push("/agentes/novo")
	}

	// Render loading state
	if (isLoading) {
		return (
			<div className="container py-6">
				<div className="flex justify-between items-center mb-6">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-10 w-32" />
				</div>

				<div className="flex items-center gap-4 mb-6">
					<Skeleton className="h-10 flex-1" />
					<Skeleton className="h-10 w-32" />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Skeleton key={i} className="h-48 w-full" />
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="container py-6">
			{/* Header */}
			<AgentListHeader onCreateAgent={handleCreateAgent} />

			{/* Filters */}
			<AgentListFilters
				searchQuery={searchQuery}
				statusFilter={statusFilter}
				onSearchChange={setSearchQuery}
				onStatusChange={(value: "all" | "active" | "draft" | "archived") => setStatusFilter(value)}
			/>

			{/* Agent list */}
			{filteredAgents.length === 0 ? (
				<AgentListEmpty onCreateAgent={handleCreateAgent} />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredAgents.map((agent: AgentType) => (
						<AgentCard
							key={agent.id}
							agent={agent}
							onDuplicate={handleDuplicateAgent}
							onDelete={setAgentToDelete}
							formatDate={formatDate}
						/>
					))}
				</div>
			)}

			{/* Delete confirmation dialog */}
			<AgentDeleteDialog
				agent={agentToDelete}
				onOpenChange={(open: boolean) => !open && setAgentToDelete(null)}
				onConfirm={handleDeleteAgent}
			/>
		</div>
	)
}
