"use client"

import { WorkflowCanvas } from "@/components/workflow-canvas"
import { WorkflowHeader } from "@/components/workflow-header"
import { NodePanel } from "@/components/node-panel"
import { NodeDetailsPanel } from "@/components/node-details-panel"
import { CommandPalette } from "@/components/command-palette"
import { useWorkflow } from "@/context/workflow-context"
import { useState, useCallback } from "react"
import type { Position } from "@/types/workflow"

export function WorkflowEditor() {
  const { selectedNodeId } = useWorkflow()
  const [showNodePanel, setShowNodePanel] = useState(false)
  const [nodePanelPosition, setNodePanelPosition] = useState<Position | null>(null)
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  const handleAddNode = useCallback((position: Position) => {
    setNodePanelPosition(position)
    setShowNodePanel(true)
  }, [])

  const handleCloseNodePanel = useCallback(() => {
    setShowNodePanel(false)
    setNodePanelPosition(null)
  }, [])

  const toggleCommandPalette = useCallback(() => {
    setShowCommandPalette((prev) => !prev)
  }, [])

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <WorkflowHeader onAddNode={() => handleAddNode({ x: 100, y: 100 })} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <WorkflowCanvas onAddNode={handleAddNode} />

          {/* Painéis condicionais */}
          {showNodePanel && (
            <NodePanel
              position={nodePanelPosition}
              onClose={handleCloseNodePanel}
              onAddNode={(type, data) => {
                // Implementação da adição de nó
                console.log("Adding node:", type, data)
                handleCloseNodePanel()
              }}
            />
          )}

          {selectedNodeId && <NodeDetailsPanel />}

          {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}
        </div>
      </div>
    </div>
  )
}
