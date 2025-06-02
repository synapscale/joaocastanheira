"use client"

import { useState } from "react"
import { ChevronDown, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useApp } from "@/context/app-context"

// Adicionando a exportação de DEFAULT_TOOLS
export const DEFAULT_TOOLS = [
  { id: "enabled", name: "Ferramentas Ativadas", icon: <Wrench className="h-4 w-4" /> },
  { id: "disabled", name: "Sem Ferramentas", icon: null },
]

export default function ToolSelector({ tools, onToolSelect, size, buttonIcon, buttonLabel } = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const { toolsEnabled, setToolsEnabled } = useApp()

  const options = tools || DEFAULT_TOOLS

  const selectedOption = toolsEnabled ? options[0] : options[1]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-sm flex items-center gap-1.5 h-7 px-3 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full"
          style={{ fontFamily: 'Arial, sans-serif' }}
          onClick={() => setIsOpen(true)}
        >
          <span className="text-amber-500 dark:text-amber-400 mr-1 text-sm">✦</span>
          <span className="text-sm font-medium">{buttonLabel || (toolsEnabled ? "Tools" : "No Tools")}</span>
          <ChevronDown className="h-3 w-3 ml-auto text-gray-400 dark:text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[220px] p-0 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl bg-white dark:bg-gray-800"
        align="start"
      >
        <div className="py-1">
          {options.map((option) => (
            <button
              key={option.id}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center ${
                option.id === (toolsEnabled ? "enabled" : "disabled")
                  ? "bg-primary/5 dark:bg-primary/10"
                  : ""
              }`}
              onClick={() => {
                setToolsEnabled(option.id === "enabled")
                if (onToolSelect) {
                  onToolSelect(option)
                }
                setIsOpen(false)
              }}
            >
              <div className="flex items-center">
                {option.icon ? (
                  <span className="text-amber-500 dark:text-amber-400 mr-2">{option.icon}</span>
                ) : (
                  <span className="text-amber-500 dark:text-amber-400 mr-2">✦</span>
                )}
                <span className="text-sm text-gray-800 dark:text-gray-200">{option.name || option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
