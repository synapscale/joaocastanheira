"use client"

import { memo, type ReactNode } from "react"
import { Command } from "cmdk"

interface CommandGroupProps {
  heading: string
  children: ReactNode
}

/**
 * Componente para renderizar um grupo de comandos
 */
function CommandGroupComponent({ heading, children }: CommandGroupProps) {
  return (
    <Command.Group heading={heading} className="px-1 py-2">
      {children}
    </Command.Group>
  )
}

export const CommandGroup = memo(CommandGroupComponent)
