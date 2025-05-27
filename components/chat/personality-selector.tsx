"use client"

import { useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useApp } from "@/context/app-context"

// Adicionando a exportação de DEFAULT_PERSONALITIES
export const DEFAULT_PERSONALITIES = [
  { id: "natural", name: "Natural", icon: <Sparkles className="h-4 w-4" /> },
  { id: "creative", name: "Criativo", icon: null },
  { id: "precise", name: "Preciso", icon: null },
]

export default function PersonalitySelector({ personalities, onPersonalitySelect, size, buttonIcon, buttonLabel } = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const { personality, setPersonality } = useApp()

  const options = personalities || DEFAULT_PERSONALITIES

  const selectedOption = options.find((option) => option.id === personality) || options[0]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1 h-6 px-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-blue-500 dark:text-gray-400 mr-1 text-[8px]">❄</span>
          <span className="text-[10px]">{buttonLabel || selectedOption.name || selectedOption.label}</span>
          <ChevronDown className="h-2 w-2 ml-1 text-gray-500 dark:text-gray-400 transform rotate-180" />
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
                option.id === personality ? "bg-primary/5 dark:bg-primary/10" : ""
              }`}
              onClick={() => {
                setPersonality(option.id)
                if (onPersonalitySelect) {
                  onPersonalitySelect(option)
                }
                setIsOpen(false)
              }}
            >
              <div className="flex items-center">
                {option.icon ? (
                  <span className="text-blue-500 dark:text-gray-400 mr-2">{option.icon}</span>
                ) : (
                  <span className="text-blue-500 dark:text-gray-400 mr-2">❄</span>
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
