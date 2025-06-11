"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Keyboard } from 'lucide-react'

interface KeyboardShortcutsProps {
  onOpen?: () => void
}

export function KeyboardShortcuts({ onOpen }: KeyboardShortcutsProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={onOpen}
            aria-label="Atalhos de teclado"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Atalhos de teclado</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default KeyboardShortcuts
