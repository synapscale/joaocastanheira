"use client"

import { memo } from "react"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogTitle } from "@/components/ui/dialog"
import { getNodeTypeInfo } from "@/utils/node-utils"
import type { Node } from "@/types/workflow"

interface DialogHeaderProps {
  node: Node
  nodeName: string
  setNodeName: (name: string) => void
  onClose: () => void
  workflowName?: string
}

/**
 * Componente de cabeçalho para o diálogo de edição de nó
 */
function DialogHeaderComponent({ node, nodeName, setNodeName, onClose, workflowName }: DialogHeaderProps) {
  const nodeTypeInfo = getNodeTypeInfo(node.type)

  return (
    <div className="px-6 pt-6 pb-2">
      <div className="flex items-center">
        <Button variant="outline" size="icon" className="mr-3" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className={`p-2 rounded-md mr-3 ${nodeTypeInfo.bgColor}`}>{nodeTypeInfo.icon}</div>
        <div>
          <DialogTitle className="text-xl flex items-center gap-2">
            Edit Node:
            <span
              className="cursor-pointer hover:bg-muted/50 px-1 rounded focus-within:ring-1 focus-within:ring-primary"
              onClick={() => {
                // Create an editable span for the title
                const titleElement = document.getElementById("node-title-editable")
                if (titleElement) {
                  titleElement.contentEditable = "true"
                  titleElement.focus()
                  // Select all text
                  const selection = window.getSelection()
                  const range = document.createRange()
                  range.selectNodeContents(titleElement)
                  selection?.removeAllRanges()
                  selection?.addRange(range)
                }
              }}
            >
              <span
                id="node-title-editable"
                onBlur={(e) => {
                  e.currentTarget.contentEditable = "false"
                  if (e.currentTarget.textContent) {
                    setNodeName(e.currentTarget.textContent)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    e.currentTarget.blur()
                  }
                }}
              >
                {nodeName}
              </span>
              <span className="text-xs text-muted-foreground ml-1">(click to edit)</span>
            </span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Node ID: {node.id} • Type: {nodeTypeInfo.name}
            {workflowName && ` • Workflow: ${workflowName}`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">Keyboard shortcuts: </span>
            <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted ml-1">Ctrl+S</kbd>
            <span className="ml-1">Save</span>
            <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted ml-3">Ctrl+Enter</kbd>
            <span className="ml-1">Test</span>
            <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted ml-3">Ctrl+`</kbd>
            <span className="ml-1">Console</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <ExternalLink className="h-4 w-4" />
            Docs
          </Button>
        </div>
      </div>
    </div>
  )
}

export const DialogHeader = memo(DialogHeaderComponent)
