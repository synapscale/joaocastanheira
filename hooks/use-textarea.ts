"use client"

import { useState, useRef, type ChangeEvent, type KeyboardEvent } from "react"

interface UseTextareaProps {
  onSubmit: () => void
}

export function useTextarea({ onSubmit }: UseTextareaProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    setValue(textarea.value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const resetTextarea = () => {
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  return {
    value,
    setValue,
    textareaRef,
    handleInput,
    handleKeyDown,
    resetTextarea,
  }
}
