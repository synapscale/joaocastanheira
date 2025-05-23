"use client"

import { useEffect, useRef, useState } from "react"
import { useWorkflow } from "@/context/workflow-context"
import { useWorkflowConnections } from "@/hooks/use-workflow-connections"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X } from "lucide-react"

interface ConnectionLabelEditorProps {
  connectionId: string
  position: { x: number; y: number }
  onClose: () => void
}

export function ConnectionLabelEditor({ connectionId, position, onClose }: ConnectionLabelEditorProps) {
  const { updateConnectionLabel } = useWorkflow()
  const { getConnectionById } = useWorkflowConnections()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const connection = getConnectionById(connectionId)

  const [labelText, setLabelText] = useState(connection?.label || "")
  const inputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  // Handle clicks outside the editor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        handleSave()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [labelText])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "Enter") {
        handleSave()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [labelText])

  const handleSave = () => {
    if (connection) {
      updateConnectionLabel(connectionId, labelText)
    }
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  if (!connection) return null

  return (
    <div
      ref={editorRef}
      className="fixed z-50 shadow-lg rounded-md p-2 border"
      style={{
        left: position.x - 100, // Center the editor
        top: position.y - 20,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        width: "200px",
      }}
    >
      <div className="flex flex-col gap-2">
        <Input
          ref={inputRef}
          value={labelText}
          onChange={(e) => setLabelText(e.target.value)}
          placeholder="Enter connection label"
          className="h-8 text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" className="h-7 px-2 py-1" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" className="h-7 px-2 py-1" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
