"use client"
import { BadgeList } from "../ui/badge-list"
import { Section } from "../ui/section"

/**
 * Component for the connections tab of the agent form
 */
export function AgentConnectionsTab({
  // Required props
  agents,
  urls,
  onAddAgent,
  onRemoveAgent,
  onAddUrl,
  onRemoveUrl,

  // Optional props with defaults
  onEditAgent,
  onEditUrl,
  maxAgents = 10,
  maxUrls = 10,
  agentsEmptyMessage = "Nenhum agente relacionado. Clique em 'Adicionar Agente' para vincular agentes.",
  urlsEmptyMessage = "Nenhuma URL relacionada. Clique em 'Adicionar URL' para vincular URLs.",
  showAgentsSection = true,
  showUrlsSection = true,
  agentsSectionTitle = "Agentes Relacionados",
  urlsSectionTitle = "URLs Relacionadas",

  // Accessibility props
  className,
  id,
  testId,
  ariaLabel,
}) {
  const componentId = id || "agent-connections-tab"

  return (
    <div className={className} id={componentId} data-testid={testId} aria-label={ariaLabel || "Conexões do agente"}>
      {/* Seção de agentes relacionados */}
      {showAgentsSection && (
        <Section title={agentsSectionTitle} id={`${componentId}-agents-section`} aria-label={agentsSectionTitle}>
          <BadgeList
            items={agents}
            onAdd={onAddAgent}
            onRemove={onRemoveAgent}
            onEdit={onEditAgent}
            addLabel="Agente"
            maxItems={maxAgents}
            emptyMessage={agentsEmptyMessage}
            id={`${componentId}-agents-list`}
            aria-label="Lista de agentes relacionados"
          />
        </Section>
      )}

      {/* Seção de URLs */}
      {showUrlsSection && (
        <Section
          title={urlsSectionTitle}
          className="mt-4"
          id={`${componentId}-urls-section`}
          aria-label={urlsSectionTitle}
        >
          <BadgeList
            items={urls}
            onAdd={onAddUrl}
            onRemove={onRemoveUrl}
            onEdit={onEditUrl}
            addLabel="URL"
            maxItems={maxUrls}
            emptyMessage={urlsEmptyMessage}
            id={`${componentId}-urls-list`}
            aria-label="Lista de URLs relacionadas"
          />
        </Section>
      )}
    </div>
  )
}
