"use client"

import { useWorkflow } from "@/context/workflow-context"

/**
 * SelectionBox component.
 *
 * Renders a visual selection box when the user is dragging to select multiple nodes.
 * The box is positioned and sized based on the current selection state.
 */
export function SelectionBox() {
  const { isMultiSelecting, selectionBox, zoom, panOffset } = useWorkflow()

  // Don't render if not multi-selecting or no selection box
  if (!isMultiSelecting || !selectionBox) return null

  const { start, end } = selectionBox

  // Calculate box dimensions
  const left = Math.min(start.x, end.x)
  const top = Math.min(start.y, end.y)
  const width = Math.abs(end.x - start.x)
  const height = Math.abs(end.y - start.y)

  return (
    <div
      className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
      style={{
        left: (left + panOffset.x) * zoom,
        top: (top + panOffset.y) * zoom,
        width: width * zoom,
        height: height * zoom,
        zIndex: 30,
      }}
    />
  )
}
