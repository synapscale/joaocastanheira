"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ConnectionPointProps {
  type: "input" | "output"
  isVisible: boolean
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: (e: React.MouseEvent) => void
}

export function ConnectionPoint({ type, isVisible, onMouseDown, onMouseUp }: ConnectionPointProps) {
  if (!isVisible) return null

  const colorClass = type === "input" ? "bg-blue-500" : "bg-green-500"

  return (
    <div
      className={cn(
        "absolute top-1/2 transform -translate-y-1/2",
        type === "input" ? "-left-1" : "-right-1",
        "flex flex-col gap-2",
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
