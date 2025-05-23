"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Command } from "cmdk"
import { Search, X } from "lucide-react"

// Extrair os itens de comando para um componente separado
import { CommandItem } from "@/components/command/command-item"

interface CommandPaletteProps {
  onClose?: () => void
}

export function CommandPalette({ onClose = () => {} }: CommandPaletteProps) {
  const [open, setOpen] = useState(true)
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input when the command palette is opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false)
      if (typeof onClose === "function") {
        onClose()
      }
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        if (typeof onClose === "function") {
          onClose()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Close the command palette
  const handleClose = () => {
    setOpen(false)
    if (typeof onClose === "function") {
      onClose()
    }
  }

  // Handle command selection
  const handleSelect = (id: string) => {
    console.log(`Selected command: ${id}`)
    handleClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[20vh]"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="border-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-4 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          value={value}
          onValueChange={setValue}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Command.Input
              ref={inputRef}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Type a command or search..."
            />
            <button className="ml-2 p-1 rounded-md hover:bg-gray-100" onClick={handleClose} aria-label="Close">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">No results found.</Command.Empty>

            <Command.Group heading="Actions">
              <CommandItem id="add-node" name="Add Node" shortcut="⌘+N" onSelect={handleSelect} />
              <CommandItem id="add-connection" name="Add Connection" shortcut="⌘+E" onSelect={handleSelect} />
              <CommandItem id="delete-selected" name="Delete Selected" shortcut="Delete" onSelect={handleSelect} />
              <CommandItem id="copy-selected" name="Copy Selected" shortcut="⌘+C" onSelect={handleSelect} />
              <CommandItem id="paste" name="Paste" shortcut="⌘+V" onSelect={handleSelect} />
            </Command.Group>

            <Command.Group heading="View">
              <CommandItem id="zoom-in" name="Zoom In" shortcut="⌘+Plus" onSelect={handleSelect} />
              <CommandItem id="zoom-out" name="Zoom Out" shortcut="⌘+Minus" onSelect={handleSelect} />
              <CommandItem id="reset-view" name="Reset View" shortcut="⌘+0" onSelect={handleSelect} />
              <CommandItem id="toggle-grid" name="Toggle Grid" shortcut="⌘+G" onSelect={handleSelect} />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
