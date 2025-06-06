"use client"

import type React from "react"

import { useState, useCallback, memo } from "react"
import { Share, Save, MoreHorizontal, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkflow } from "@/context/workflow-context"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Props para o componente WorkflowHeader
 */
interface WorkflowHeaderProps {
  /** Função de callback quando o botão de adicionar nó é clicado */
  onAddNode: () => void
}

/**
 * Componente WorkflowHeader.
 *
 * Exibe o nome do workflow, controles de status e botões de ação.
 * Permite editar o nome do workflow inline.
 */
export const WorkflowHeader = memo(function WorkflowHeader({ onAddNode }: WorkflowHeaderProps) {
  const { workflowName, setWorkflowName, isActive, setIsActive, saveWorkflow } = useWorkflow()
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(workflowName)

  /**
   * Inicia a edição do nome do workflow
   */
  const handleNameClick = useCallback(() => {
    setTempName(workflowName)
    setIsEditing(true)
  }, [workflowName])

  /**
   * Salva o nome do workflow editado
   */
  const handleNameSave = useCallback(() => {
    if (tempName.trim()) {
      setWorkflowName(tempName)
    }
    setIsEditing(false)
  }, [tempName, setWorkflowName])

  /**
   * Manipula eventos de teclado durante a edição do nome
   * Enter: salva alterações, Escape: cancela a edição
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleNameSave()
      } else if (e.key === "Escape") {
        setIsEditing(false)
        setTempName(workflowName)
      }
    },
    [handleNameSave, workflowName],
  )

  /**
   * Atualiza o nome temporário durante a edição
   */
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(e.target.value)
  }, [])

  /**
   * Alterna o estado ativo do workflow
   */
  const toggleActive = useCallback(
    (checked: boolean) => {
      setIsActive(checked)
    },
    [setIsActive],
  )

  return (
    <div className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-4" onClick={onAddNode} aria-label="Add node">
          <Plus className="h-4 w-4" />
        </Button>

        <div className="flex items-center">
          {isEditing ? (
            <Input
              value={tempName}
              onChange={handleNameChange}
              onBlur={handleNameSave}
              onKeyDown={handleKeyDown}
              className="h-8 text-lg font-medium w-64"
              autoFocus
              aria-label="Edit workflow name"
              data-testid="workflow-name-input"
            />
          ) : (
            <h1
              className="text-lg font-medium mr-6 cursor-pointer hover:text-primary transition-colors"
              onClick={handleNameClick}
              data-testid="workflow-name"
            >
              {workflowName}
            </h1>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Agentes IA</span>
            <Badge variant="outline" className="text-xs">
              +1
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <span className={cn("mr-2 text-sm font-medium", isActive ? "text-green-600" : "text-muted-foreground")}>
            {isActive ? "Active" : "Inactive"}
          </span>
          <Switch checked={isActive} onCheckedChange={toggleActive} aria-label="Toggle workflow active state" />
        </div>

        <Button variant="outline" size="sm" className="flex items-center gap-1.5" aria-label="Share workflow">
          <Share className="h-4 w-4" />
          Share
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={saveWorkflow}
          aria-label="Save workflow"
        >
          <Save className="h-4 w-4" />
          Saved
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center border rounded-md px-3 py-1.5 border-border">
          <Star size={16} className="text-yellow-400 fill-yellow-400 mr-2" />
          <span className="text-sm font-medium">88,435</span>
        </div>
      </div>
    </div>
  )
})
