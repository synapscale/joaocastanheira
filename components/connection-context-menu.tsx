"use client"

import type React from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useWorkflow } from "@/context/workflow-context"
import { useWorkflowConnections } from "@/hooks/use-workflow-connections"
import { PenLine, Trash2, ArrowRight, ArrowRightToLine, CornerRightDown } from "lucide-react"

interface ConnectionContextMenuProps {
  children: React.ReactNode
  connectionId: string
  position: {
    x: number
    y: number
  }
  onClose?: () => void
}

export function ConnectionContextMenu({ children, connectionId, position, onClose = () => {} }: ConnectionContextMenuProps) {
  const { removeConnection, updateConnectionType } = useWorkflow()
  const { getConnectionById } = useWorkflowConnections()

  const connection = getConnectionById(connectionId)
  if (!connection) return <>{children}</>

  const handleEditLabel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Use the WorkflowCanvas's label editor
    if (window.workflowCanvas && window.workflowCanvas.editConnectionLabel) {
      window.workflowCanvas.editConnectionLabel(connectionId, { x: e.clientX, y: e.clientY })
      onClose()
    }
  }

  const handleRemoveConnection = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeConnection(connectionId)
  }

  const handleChangeType = (type: "bezier" | "straight" | "step") => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateConnectionType(connectionId, type)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleEditLabel}>
          <PenLine className="mr-2 h-4 w-4" />
          Edit Label
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleChangeType("bezier")} disabled={connection.type === "bezier"}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Bezier Connection
        </ContextMenuItem>
        <ContextMenuItem onClick={handleChangeType("straight")} disabled={connection.type === "straight"}>
          <ArrowRightToLine className="mr-2 h-4 w-4" />
          Straight Connection
        </ContextMenuItem>
        <ContextMenuItem onClick={handleChangeType("step")} disabled={connection.type === "step"}>
          <CornerRightDown className="mr-2 h-4 w-4" />
          Step Connection
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleRemoveConnection} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Connection
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
