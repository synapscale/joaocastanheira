"use client"

import { Button } from "@/components/ui/button"
import { Library, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingLibraryButtonProps {
  onClick: () => void
}

export function FloatingLibraryButton({ onClick }: FloatingLibraryButtonProps) {
  return (
    <div className="floating-library-button absolute top-4 right-4 z-30">
      <Button
        onClick={onClick}
        className={cn(
          "h-12 w-12 rounded-full shadow-lg",
          "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
          "border border-slate-200 dark:border-slate-700",
          "hover:bg-white dark:hover:bg-slate-800",
          "hover:shadow-xl hover:scale-105",
          "transition-all duration-200",
          "text-slate-700 dark:text-slate-300",
          "hover:text-blue-600 dark:hover:text-blue-400",
        )}
        size="icon"
        title="Abrir biblioteca de nodes"
      >
        <div className="relative">
          <Library className="h-5 w-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-1.5 w-1.5 text-white" />
          </div>
        </div>
      </Button>
    </div>
  )
}
