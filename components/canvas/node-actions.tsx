"use client"

import { useState } from "react"
import { Maximize2, Minimize2, Edit, Copy, Trash2, MoreHorizontal, Lock, Unlock, Eye, EyeOff } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { Node } from "@/types/node-types"

interface NodeActionsProps {
  node: Node
  isExpanded: boolean
  isSelected: boolean
  isLocked?: boolean
  isHidden?: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleLock?: () => void
  onToggleVisibility?: () => void
  className?: string
  showLabels?: boolean
  variant?: "icons" | "buttons" | "minimal" | "header"
  position?: "top-right" | "bottom-right" | "inline"
}

export function NodeActions({
  node,
  isExpanded,
  isSelected,
  isLocked = false,
  isHidden = false,
  onToggleExpand,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleLock,
  onToggleVisibility,
  className,
  showLabels = false,
  variant = "icons",
  position = "top-right",
}: NodeActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Posicionamento das ações
  const positionClasses = {
    "top-right": "absolute top-1 right-1 z-10",
    "bottom-right": "absolute bottom-1 right-1 z-10",
    inline: "relative",
  }

  // Variantes de estilo
  const variantClasses = {
    icons: "flex gap-1",
    buttons: "flex gap-1",
    minimal: "hidden group-hover:flex gap-1",
    header: "flex items-center",
  }

  // Tamanho dos ícones baseado na variante
  const iconSize = variant === "header" ? 14 : 16

  // Estilo dos botões baseado na variante
  const buttonVariant = variant === "buttons" ? "secondary" : "ghost"
  const buttonSize = variant === "header" ? "xs" : "sm"

  // Renderiza botões de ação
  const renderActionButtons = () => (
    <div
      className={cn(
        variantClasses[variant],
        position !== "inline" && positionClasses[position],
        "bg-background/80 backdrop-blur-sm rounded",
        className,
      )}
    >
      <TooltipProvider delayDuration={300}>
        {/* Botão Expandir/Colapsar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={buttonVariant}
              size={buttonSize}
              className="h-7 w-7 p-0"
              onClick={onToggleExpand}
              aria-label={isExpanded ? "Colapsar node" : "Expandir node"}
            >
              {isExpanded ? <Minimize2 size={iconSize} /> : <Maximize2 size={iconSize} />}
              {showLabels && <span className="ml-2 text-xs">{isExpanded ? "Colapsar" : "Expandir"}</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{isExpanded ? "Colapsar node" : "Expandir node"}</TooltipContent>
        </Tooltip>

        {/* Botão Editar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={buttonVariant}
              size={buttonSize}
              className="h-7 w-7 p-0"
              onClick={onEdit}
              aria-label="Editar node"
            >
              <Edit size={iconSize} />
              {showLabels && <span className="ml-2 text-xs">Editar</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Editar node</TooltipContent>
        </Tooltip>

        {/* Botão Duplicar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={buttonVariant}
              size={buttonSize}
              className="h-7 w-7 p-0"
              onClick={onDuplicate}
              aria-label="Duplicar node"
            >
              <Copy size={iconSize} />
              {showLabels && <span className="ml-2 text-xs">Duplicar</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Duplicar node</TooltipContent>
        </Tooltip>

        {/* Menu de mais opções */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant={buttonVariant} size={buttonSize} className="h-7 w-7 p-0" aria-label="Mais opções">
                  <MoreHorizontal size={iconSize} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Mais opções</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            {onToggleLock && (
              <DropdownMenuItem onClick={onToggleLock}>
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
              </DropdownMenuItem>
            )}

            {onToggleVisibility && (
              <DropdownMenuItem onClick={onToggleVisibility}>
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
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  )

  return (
    <>
      {renderActionButtons()}

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir node</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o node "{node.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete()
                setShowDeleteConfirm(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
