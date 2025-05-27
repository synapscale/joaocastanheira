"use client"

import type React from "react"

import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { NodeTemplateCardProps } from "@/types/core/node-types"

/**
 * NodeTemplateCard Component
 *
 * Displays a draggable card representing a node template that can be added to the canvas.
 * Supports actions like edit, duplicate, and delete through a dropdown menu.
 *
 * @example
 * \`\`\`tsx
 * <NodeTemplateCard
 *   name="Text Processor"
 *   description="Processes text input using NLP techniques"
 *   category="Text Processing"
 *   onEdit={() => handleEdit("template-id")}
 *   onDelete={() => handleDelete("template-id")}
 * />
 * \`\`\`
 */
export function NodeTemplateCard({
  // Required props
  name,
  description,
  category,

  // Optional action handlers
  onEdit,
  onDuplicate,
  onDelete,
  onClick,

  // Drag-related props
  isDraggable = true,
  dragData,
  onDragStart,
  onDragEnd,

  // Visual customization
  icon,
  isFeatured = false,
  badgeText,
  badgeColor,
  showActions = true,

  // State props
  disabled = false,

  // Tooltip props
  tooltip,
  tooltipPosition = "top",
  tooltipDelay = 500,
  tooltipDisabled = false,

  // Accessibility and testing
  className,
  testId,
  id,
  ariaLabel,

  // Other props
  ...otherProps
}: NodeTemplateCardProps) {
  // Prepare drag data
  const handleDragStart = (e: React.DragEvent) => {
    if (disabled || !isDraggable) {
      e.preventDefault()
      return
    }

    // Set drag data
    const data = dragData || { type: "template", name, category }
    e.dataTransfer.setData("application/json", JSON.stringify(data))

    // Call custom drag start handler if provided
    onDragStart?.(e)
  }

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    if (!disabled) {
      onClick?.(e)
    }
  }

  // Render the component
  const card = (
    <div
      id={id}
      className={cn(
        "relative flex flex-col gap-1 rounded-md border p-3 transition-colors",
        !disabled && "hover:bg-accent cursor-pointer group",
        disabled && "opacity-60 cursor-not-allowed",
        isFeatured && "border-primary/50 bg-primary/5",
        className,
      )}
      draggable={isDraggable && !disabled}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      data-testid={testId}
      aria-label={ariaLabel || `Node template: ${name}`}
      aria-disabled={disabled}
      {...otherProps}
    >
      {showActions && (
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                disabled={disabled}
                aria-label="Template options"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Mais opções</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                >
                  Editar
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate()
                  }}
                >
                  Duplicar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                >
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="flex items-start gap-2">
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium leading-none truncate">{name}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold">
          {category}
        </span>

        {badgeText && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
              badgeColor ? badgeColor : "bg-primary/10 text-primary",
            )}
          >
            {badgeText}
          </span>
        )}

        {isFeatured && !badgeText && (
          <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
            Featured
          </span>
        )}
      </div>
    </div>
  )

  // Add tooltip if provided
  if (tooltip && !tooltipDisabled) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={tooltipDelay}>
          <TooltipTrigger asChild>{card}</TooltipTrigger>
          <TooltipContent side={tooltipPosition}>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return card
}
