"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ConnectionPointProps {
  type: "input" | "output"
  isVisible: boolean
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: (e: React.MouseEvent) => void
  className?: string
}

/**
 * Ponto de conexão para entrada ou saída de um node
 */
export function ConnectionPoint({ type, isVisible, onMouseDown, onMouseUp, className }: ConnectionPointProps) {
  if (!isVisible) return null

  const colorClass = type === "input" ? "bg-blue-500" : "bg-green-500"

  return (
    <div
      className={cn(
        "absolute top-1/2 transform -translate-y-1/2",
        type === "input" ? "-left-1.5" : "-right-1.5",
        className,
      )}
    >
      <div
        className={cn(
          "w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 cursor-pointer hover:scale-125 transition-transform",
          colorClass,
        )}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      />
    </div>
  )
}
