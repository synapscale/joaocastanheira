"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useWorkflow } from "@/context/workflow-context"
import type { Connection } from "@/types/workflow"
import { useTheme } from "next-themes"
import { X } from "lucide-react"

interface ConnectionEditorProps {
  connection: Connection
  position: { x: number; y: number }
  onClose: () => void
}

export function ConnectionEditor({ connection, position, onClose }: ConnectionEditorProps) {
  const { updateConnection } = useWorkflow()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [label, setLabel] = useState(connection.label || "")
  const [color, setColor] = useState(connection.style?.color || "#6b7280")
  const [width, setWidth] = useState(connection.style?.width || 1.5)
  const [dashed, setDashed] = useState(connection.style?.dashed || false)
  const [animated, setAnimated] = useState(connection.style?.animated || false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input when the editor opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const handleSave = () => {
    updateConnection(connection.id, {
      ...connection,
      label,
      style: {
        color,
        width,
        dashed,
        animated,
      },
    })
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  // Colors based on theme
  const bgColor = isDark ? "#1f2937" : "#ffffff"
  const borderColor = isDark ? "#374151" : "#e5e7eb"
  const textColor = isDark ? "#e5e7eb" : "#4b5563"

  return (
    <div
      className="absolute z-50 p-3 rounded-lg shadow-lg border"
      style={{
        top: position.y - 120,
        left: position.x - 100,
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
        width: "200px",
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Edit Connection</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="connection-label" className="block text-xs mb-1">
            Label
          </label>
          <input
            ref={inputRef}
            id="connection-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-2 py-1 text-sm rounded border bg-transparent"
            style={{ borderColor }}
            placeholder="Connection label"
          />
        </div>

        <div>
          <label htmlFor="connection-color" className="block text-xs mb-1">
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="connection-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-2 py-1 text-sm rounded border bg-transparent"
              style={{ borderColor }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="connection-width" className="block text-xs mb-1">
              Width
            </label>
            <input
              type="number"
              id="connection-width"
              min="0.5"
              max="5"
              step="0.5"
              value={width}
              onChange={(e) => setWidth(Number.parseFloat(e.target.value))}
              className="w-full px-2 py-1 text-sm rounded border bg-transparent"
              style={{ borderColor }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={dashed}
                onChange={(e) => setDashed(e.target.checked)}
                className="rounded"
              />
              Dashed
            </label>

            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={animated}
                onChange={(e) => setAnimated(e.target.checked)}
                className="rounded"
              />
              Animated
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 text-xs rounded border" style={{ borderColor }}>
            Cancel
          </button>
          <button onClick={handleSave} className="px-3 py-1 text-xs rounded bg-blue-500 text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
