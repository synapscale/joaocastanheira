"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface NodeCategoryProps {
  id: string
  name: string
  description: string
  category: string
  isUserNode?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onPreview?: () => void
}

export function NodeCategory({
  id,
  name,
  description,
  category,
  isUserNode = false,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
}: NodeCategoryProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "node", id }))
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={cn(
        "group relative p-3 border rounded-lg cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
        isDragging && "opacity-50 scale-95",
        "bg-card hover:bg-accent/50",
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{name}</h4>
            {isUserNode && (
              <Badge variant="secondary" className="text-xs">
                Meu
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{description}</p>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>

        <div className="flex items-start">
          {onPreview && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onPreview()
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}

          {isUserNode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Indicador de drag */}
      <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
    </div>
  )
}
