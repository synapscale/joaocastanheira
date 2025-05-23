"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagInput({ tags, onChange, placeholder = "Adicionar tag...", maxTags = 10 }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      if (tags.length >= maxTags) return

      const newTag = inputValue.trim()
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInputValue("")
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 p-1.5 border rounded-md focus-within:ring-1 focus-within:ring-ring"
      onClick={handleContainerClick}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs py-0 px-2">
          {tag}
          <button
            type="button"
            className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
            onClick={() => removeTag(tag)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {tag}</span>
          </button>
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
      />
    </div>
  )
}
