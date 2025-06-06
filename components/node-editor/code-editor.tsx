"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CodeEditorToolbar } from "./code-editor-toolbar"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  isChanged?: boolean
  fontSize?: number
  height?: string
  onCopy?: (text: string) => void
  onFormat?: () => void
  language?: string
  showConsole?: boolean
  toggleConsole?: () => void
}

/**
 * CodeEditor component.
 *
 * A reusable code editor component with formatting and copy functionality.
 */
export function CodeEditor({
  value,
  onChange,
  isChanged = false,
  fontSize = 14,
  height = "200px",
  onCopy,
  onFormat,
  language = "javascript",
  showConsole,
  toggleConsole,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<{ start: number; end: number }>({ start: 0, end: 0 })

  // Auto-focus the editor when it mounts
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  // Save cursor position when it changes
  const handleSelectionChange = () => {
    if (editorRef.current) {
      setCursorPosition({
        start: editorRef.current.selectionStart,
        end: editorRef.current.selectionEnd,
      })
    }
  }

  // Handle inserting text at cursor position
  const insertTextAtCursor = useCallback(
    (text: string) => {
      if (!editorRef.current) return

      const { start, end } = cursorPosition
      const newValue = value.substring(0, start) + text + value.substring(end)

      onChange(newValue)

      // Set cursor position after the inserted text
      setTimeout(() => {
        if (editorRef.current) {
          const newPosition = start + text.length
          editorRef.current.focus()
          editorRef.current.setSelectionRange(newPosition, newPosition)
          setCursorPosition({ start: newPosition, end: newPosition })
        }
      }, 0)
    },
    [value, onChange, cursorPosition],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault()
      insertTextAtCursor("  ")
    }

    // Update cursor position
    handleSelectionChange()
  }

  const handleKeyUp = () => {
    handleSelectionChange()
  }

  const handleClick = () => {
    handleSelectionChange()
  }

  // Format code handler
  const handleFormat = () => {
    if (onFormat) {
      onFormat()
    }
  }

  // Copy code handler
  const handleCopy = () => {
    if (onCopy) {
      onCopy(value)
    }
  }

  // Insert variable reference
  const handleInsertVariable = (variableReference: string) => {
    insertTextAtCursor(variableReference)
  }

  // Insert code snippet
  const handleInsertSnippet = (snippet: string) => {
    insertTextAtCursor(snippet)
  }

  return (
    <div className="relative">
      <CodeEditorToolbar
        onCopy={handleCopy}
        onFormat={handleFormat}
        onInsertVariable={handleInsertVariable}
        onInsertSnippet={handleInsertSnippet}
        showConsole={showConsole || false}
        toggleConsole={toggleConsole || (() => {})}
        language={language}
      />

      <div className={cn("border rounded-md overflow-hidden", isChanged && "border-amber-300")}>
        <div className="bg-muted px-3 py-1.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-muted-foreground">Code</span>
            {isChanged && (
              <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1 border-amber-300 text-amber-600">
                Modified
              </Badge>
            )}
          </div>
        </div>
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onClick={handleClick}
          className="w-full p-3 font-mono focus:outline-none resize-none bg-black text-white"
          style={{
            minHeight: "200px",
            fontSize: `${fontSize}px`,
            height: height,
            lineHeight: "1.5",
            tabSize: "2",
          }}
          spellCheck="false"
        />
      </div>
    </div>
  )
}
