"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DraggableNodeCardProps {
  node: {
    id: string
    name: string
    description: string
    category: string
  }
  icon?: React.ReactNode
  className?: string
}

export function DraggableNodeCard({ node, icon, className }: DraggableNodeCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)

    // Set drag data
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "node",
        node: node,
      }),
    )

    // Set drag effect
    e.dataTransfer.effectAllowed = "copy"

    // Create drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = "rotate(5deg)"
    dragImage.style.opacity = "0.8"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 50, 25)

    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "p-3 border rounded-lg bg-card hover:bg-accent/50 cursor-grab transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02]",
        isDragging && "opacity-50 scale-95",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{node.name}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{node.description}</p>
          <Badge variant="outline" className="mt-2 text-xs">
            {node.category}
          </Badge>
        </div>
      </div>
    </div>
  )
}
