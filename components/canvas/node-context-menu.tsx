"use client"

import type React from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Maximize2,
  Minimize2,
  Edit,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MoveHorizontal,
  ArrowUpRight,
} from "lucide-react"
import type { Node } from "@/types/node-types"

interface NodeContextMenuProps {
  node: Node
  isExpanded: boolean
  isLocked?: boolean
  isHidden?: boolean
  children: React.ReactNode
  onToggleExpand: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleLock?: () => void
  onToggleVisibility?: () => void
  onBringToFront?: () => void
  onSendToBack?: () => void
  onOpenDetails?: () => void
}

export function NodeContextMenu({
  node,
  isExpanded,
  isLocked = false,
  isHidden = false,
  children,
  onToggleExpand,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleLock,
  onToggleVisibility,
  onBringToFront,
  onSendToBack,
  onOpenDetails,
}: NodeContextMenuProps) {
  // Determinar sistema operacional para exibir atalhos corretos
  const isMac = typeof navigator !== "undefined" ? navigator.platform.toUpperCase().indexOf("MAC") >= 0 : false
  const ctrlKey = isMac ? "⌘" : "Ctrl"

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={onEdit} disabled={isLocked}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={onToggleExpand}>
          {isExpanded ? (
            <>
              <Minimize2 className="mr-2 h-4 w-4" />
              <span>Colapsar</span>
            </>
          ) : (
            <>
              <Maximize2 className="mr-2 h-4 w-4" />
              <span>Expandir</span>
            </>
          )}
        </ContextMenuItem>

        <ContextMenuItem onClick={onDuplicate} disabled={isLocked}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicar</span>
          <ContextMenuShortcut>{ctrlKey}+D</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {onToggleLock && (
          <ContextMenuItem onClick={onToggleLock}>
            {isLocked ? (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                <span>Desbloquear</span>
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                <span>Bloquear</span>
              </>
            )}
          </ContextMenuItem>
        )}

        {onToggleVisibility && (
          <ContextMenuItem onClick={onToggleVisibility}>
            {isHidden ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                <span>Mostrar</span>
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                <span>Ocultar</span>
              </>
            )}
          </ContextMenuItem>
        )}

        {(onBringToFront || onSendToBack) && <ContextMenuSeparator />}

        {onBringToFront && (
          <ContextMenuItem onClick={onBringToFront} disabled={isLocked}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            <span>Trazer para frente</span>
          </ContextMenuItem>
        )}

        {onSendToBack && (
          <ContextMenuItem onClick={onSendToBack} disabled={isLocked}>
            <MoveHorizontal className="mr-2 h-4 w-4" />
            <span>Enviar para trás</span>
          </ContextMenuItem>
        )}

        {onOpenDetails && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onOpenDetails}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              <span>Abrir detalhes</span>
            </ContextMenuItem>
          </>
        )}

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onDelete} disabled={isLocked} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
          <ContextMenuShortcut>Delete</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
