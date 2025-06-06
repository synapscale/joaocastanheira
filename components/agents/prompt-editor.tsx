"use client"

import { useRef } from "react"
import { Button } from "../ui/button"
import { FileText } from "lucide-react"

export function PromptEditor(props) {
  const { value, onChange, label, error, required, placeholder, minHeight = "200px", id, onBlur, onSelectTemplate } = props

  const textareaRef = useRef(null)
  const inputId = id || "prompt-editor"

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between">
          <label htmlFor={inputId} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {onSelectTemplate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSelectTemplate}
              className="h-6 text-xs text-gray-500 hover:text-gray-700"
            >
              <FileText className="mr-1 h-3.5 w-3.5" />
              Templates
            </Button>
          )}
        </div>
      )}

      <div className="relative border rounded-md">
        <textarea
          ref={textareaRef}
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm"
          style={{ minHeight, resize: "vertical" }}
          placeholder={placeholder}
          required={required}
          aria-invalid={!!error}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
