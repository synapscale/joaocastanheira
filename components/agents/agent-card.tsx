"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Edit, Play, Copy, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AgentCardProps } from "@/types/component-params"

/**
 * Component for displaying an agent card in the listing
 *
 * This component displays an agent card with actions for viewing, editing,
 * testing, duplicating, and deleting the agent.
 *
 * @example
 * \`\`\`tsx
 * <AgentCard
 *   agent={agent}
 *   onDuplicate={handleDuplicate}
 *   onDelete={handleDelete}
 *   formatDate={formatDate}
 * />
 * \`\`\`
 *
 * @param props - Component properties
 * @returns React component
 */
export function AgentCard({
  // Required props
  agent,
  onDuplicate,
  onDelete,
  formatDate,

  // Optional props with defaults
  onView,
  onEdit,
  onTest,
  showActions = true,
  customActions = [],
  showFooter = true,
  showBadges = true,
  onClick,
  isSelected = false,
  selectable = false,
  onSelect,

  // Accessibility props
  className,
  id,
  testId,
  ariaLabel,
}: AgentCardProps) {
  const router = useRouter()

  const handleView = () => {
    if (onView) {
      onView(agent)
    } else {
      router.push(`/agentes/${agent.id}/view`)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(agent)
    } else {
      router.push(`/agentes/${agent.id}`)
    }
  }

  const handleTest = () => {
    if (onTest) {
      onTest(agent)
    } else {
      router.push(`/agentes/${agent.id}/test`)
    }
  }

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(agent)
    } else if (onClick) {
      onClick(agent)
    } else {
      handleEdit()
    }
  }

  const componentId = id || `agent-card-${agent.id}`

  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow",
        isSelected && "ring-2 ring-purple-500",
        selectable && "cursor-pointer",
        className,
      )}
      id={componentId}
      data-testid={testId}
      aria-label={ariaLabel || `Agente: ${agent.name}`}
      data-selected={isSelected}
      onClick={selectable || onClick ? handleClick : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="truncate">{agent.name}</CardTitle>
            <CardDescription className="truncate">{agent.description || "Sem descrição"}</CardDescription>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Opções do agente"
                  data-testid={`${componentId}-actions-trigger`}
                  onClick={(e) => e.stopPropagation()} // Prevent card click when clicking dropdown
                >
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Opções</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking menu items
              >
                <DropdownMenuItem onClick={handleView} data-testid={`${componentId}-view-action`}>
                  <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit} data-testid={`${componentId}-edit-action`}>
                  <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTest} data-testid={`${componentId}-test-action`}>
                  <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                  Testar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(agent)} data-testid={`${componentId}-duplicate-action`}>
                  <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                  Duplicar
                </DropdownMenuItem>
                {customActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => action.onClick(agent)}
                    className={action.className}
                    data-testid={`${componentId}-custom-action-${index}`}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => onDelete(agent)}
                  className="text-red-600 focus:text-red-600"
                  data-testid={`${componentId}-delete-action`}
                >
                  <Trash className="mr-2 h-4 w-4" aria-hidden="true" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent
        className={cn("pb-3", (onClick || selectable) && "cursor-pointer")}
        onClick={handleClick}
        data-testid={`${componentId}-content`}
      >
        {showBadges && (
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full"
              data-testid={`${componentId}-model-badge`}
            >
              {agent.model}
            </span>
            <span
              className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full"
              data-testid={`${componentId}-type-badge`}
            >
              {agent.type === "chat" ? "Chat" : agent.type === "texto" ? "Texto" : "Imagem"}
            </span>
            {agent.status && (
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  agent.status === "active"
                    ? "bg-green-100 text-green-800"
                    : agent.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800",
                )}
                data-testid={`${componentId}-status-badge`}
              >
                {agent.status === "active" ? "Ativo" : agent.status === "draft" ? "Rascunho" : "Arquivado"}
              </span>
            )}
          </div>
        )}
      </CardContent>
      {showFooter && (
        <CardFooter className="pt-0 flex justify-between text-xs text-gray-500" data-testid={`${componentId}-footer`}>
          <span>Criado: {formatDate(agent.createdAt)}</span>
          <span>Atualizado: {formatDate(agent.updatedAt)}</span>
        </CardFooter>
      )}
    </Card>
  )
}
