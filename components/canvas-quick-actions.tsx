"use client"

import { Plus, Settings, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper"
import { TooltipProvider } from "@/components/ui/tooltip"

interface CanvasQuickActionsProps {
  onOpenNodePanel: () => void
}

export function CanvasQuickActions({ onOpenNodePanel }: CanvasQuickActionsProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        <TooltipWrapper content="Add Node" side="left">
          <Button variant="secondary" size="icon" className="rounded-full shadow-md" onClick={onOpenNodePanel}>
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipWrapper>

        <TooltipWrapper content="Canvas Settings" side="left">
          <Button variant="outline" size="icon" className="rounded-full shadow-sm">
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipWrapper>

        <TooltipWrapper content="Layers" side="left">
          <Button variant="outline" size="icon" className="rounded-full shadow-sm">
            <Layers className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
      </div>
    </TooltipProvider>
  )
}
