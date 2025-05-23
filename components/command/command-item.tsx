"use client"

import type React from "react"

import { memo } from "react"
import { Command } from "cmdk"

interface CommandItemProps {
  id: string
  name: string
  shortcut?: string
  icon?: React.ReactNode
  onSelect: (id: string) => void
  disabled?: boolean
}

/**
 * Componente para renderizar um item de comando
 */
function CommandItemComponent({ id, name, shortcut, icon, onSelect, disabled = false }: CommandItemProps) {
  return (
    <Command.Item
      className="flex items-center gap-2 aria-selected:bg-gray-100 hover:bg-gray-100 cursor-pointer"
      onSelect={() => onSelect(id)}
      disabled={disabled}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-gray-700">{name}</span>
      {shortcut && <span className="ml-auto text-xs text-gray-500">{shortcut}</span>}
    </Command.Item>
  )
}

export const CommandItem = memo(CommandItemComponent)
