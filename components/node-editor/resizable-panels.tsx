"use client"

import { memo, type ReactNode } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

interface ResizablePanelsProps {
  panelSizes: number[]
  setPanelSizes: (sizes: number[]) => void
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
  leftPanelMinSize?: number
  centerPanelMinSize?: number
  rightPanelMinSize?: number
}

/**
 * Componente para renderizar painéis redimensionáveis
 */
function ResizablePanelsComponent({
  panelSizes,
  setPanelSizes,
  leftPanel,
  centerPanel,
  rightPanel,
  leftPanelMinSize = 15,
  centerPanelMinSize = 40,
  rightPanelMinSize = 15,
}: ResizablePanelsProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full" onLayout={(sizes) => setPanelSizes(sizes)}>
      {/* Painel Esquerdo - Input */}
      <ResizablePanel defaultSize={panelSizes[0]} minSize={leftPanelMinSize} maxSize={30} collapsible={true}>
        {leftPanel}
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Painel Central - Editor de Código */}
      <ResizablePanel defaultSize={panelSizes[1]} minSize={centerPanelMinSize} className="overflow-hidden bg-white">
        {centerPanel}
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Painel Direito - Output */}
      <ResizablePanel defaultSize={panelSizes[2]} minSize={rightPanelMinSize} maxSize={30} collapsible={true}>
        {rightPanel}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export const ResizablePanels = memo(ResizablePanelsComponent)
