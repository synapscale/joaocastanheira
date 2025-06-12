"use client"

import { useState, useCallback, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface IconPickerProps {
  icon: string
  onChange: (icon: string) => void
}

/**
 * Array de ícones de emoji predefinidos para seleção rápida.
 */
const presetIcons = [
  "📁",
  "📂",
  "📊",
  "📈",
  "📉",
  "📌",
  "📎",
  "📋",
  "📝",
  "📑",
  "📒",
  "📓",
  "📔",
  "📕",
  "📖",
  "📗",
  "📘",
  "📙",
  "📚",
  "📤",
  "📥",
  "📦",
  "📧",
  "📨",
  "📩",
  "📪",
  "📫",
  "📬",
  "📭",
  "📮",
  "🔍",
  "🔎",
  "🔒",
  "🔓",
  "🔏",
  "🔐",
  "🔑",
  "🔨",
  "🔧",
  "🔩",
  "🔗",
  "📱",
  "📲",
  "💻",
  "⌨️",
  "🖥️",
  "🖨️",
  "🖱️",
  "🖲️",
  "💾",
  "💿",
  "📀",
  "🧮",
  "🎮",
  "🕹️",
  "🎲",
  "♟️",
  "🧩",
  "🎯",
  "🎮",
  "🛠️",
  "⚙️",
  "🔌",
  "🔋",
  "🔍",
  "🧲",
  "🧪",
  "🧫",
  "🧬",
  "🔬",
  "🔭",
  "📡",
  "💡",
  "🔦",
  "🪔",
  "🧯",
  "🛢️",
  "💸",
  "💵",
  "💴",
  "💶",
  "💷",
  "💰",
  "💳",
  "💎",
  "⚖️",
  "🧰",
  "🔧",
  "🔨",
  "⚒️",
  "🛠️",
  "⛏️",
  "🔩",
  "⚙️",
  "🧱",
  "⚗️",
  "🧪",
  "🧫",
  "🧬",
  "🔬",
]

/**
 * Componente para seleção de ícones emoji com opções predefinidas.
 */
export function IconPicker({ icon, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const handleIconSelect = useCallback(
    (selectedIcon: string) => {
      onChange(selectedIcon)
      setOpen(false)
    },
    [onChange],
  )

  // Filtra os ícones com base na pesquisa
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return presetIcons
    // Esta é uma implementação simples. Em um caso real, você poderia usar
    // metadados de emoji ou tags para melhorar a pesquisa.
    return presetIcons
  }, [searchQuery])

  // Memoize o conteúdo do popover para evitar re-renderizações desnecessárias
  const popoverContent = useMemo(() => {
    return (
      <PopoverContent className="w-64 p-3">
        <ScrollArea className="h-[200px] pr-3">
          <div className="flex flex-wrap gap-1">
            {filteredIcons.map((presetIcon) => (
              <button
                key={presetIcon}
                type="button"
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center text-lg hover:bg-muted transition-colors",
                  icon === presetIcon && "bg-muted",
                )}
                onClick={() => handleIconSelect(presetIcon)}
                aria-label={`Selecionar ícone ${presetIcon}`}
                aria-selected={icon === presetIcon}
              >
                {presetIcon}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    )
  }, [filteredIcons, icon, handleIconSelect])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={handleToggle}
          aria-expanded={open}
          aria-haspopup="true"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              {icon}
            </span>
            <span>Selecionar ícone</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      {popoverContent}
    </Popover>
  )
}
