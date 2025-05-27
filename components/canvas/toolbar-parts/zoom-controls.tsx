"use client"
import { ZoomIn, ZoomOut, Focus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToolbarButton } from "./toolbar-button"

interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onFitToScreen: () => void
  hasSelection?: boolean
}

/**
 * Zoom controls for the canvas toolbar
 */
export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitToScreen,
  hasSelection = false,
}: ZoomControlsProps) {
  return (
    <>
      <ToolbarButton
        icon={<ZoomOut className="h-4 w-4" />}
        label="Diminuir Zoom"
        onClick={onZoomOut}
        tooltipContent="Diminuir Zoom (-)"
      />

      <Button variant="ghost" size="sm" onClick={onResetView} className="px-2 min-w-[3rem] h-8" title="Resetar Zoom">
        <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
      </Button>

      <ToolbarButton
        icon={<ZoomIn className="h-4 w-4" />}
        label="Aumentar Zoom"
        onClick={onZoomIn}
        tooltipContent="Aumentar Zoom (+)"
      />

      <ToolbarButton
        icon={<Focus className="h-4 w-4" />}
        label={hasSelection ? "Zoom na Seleção" : "Ajustar à Tela"}
        onClick={onFitToScreen}
        tooltipContent={hasSelection ? "Zoom na Seleção" : "Ajustar à Tela (Ctrl+F)"}
      />
    </>
  )
}
