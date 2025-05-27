"use client"

import { useState } from "react"
import { ChevronDown, Sparkles, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useApp } from "@/context/app-context"

export default function PresetSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { preset, setPreset } = useApp()

  const options = [
    { id: "default", label: "Padrão", icon: <Settings className="h-4 w-4" /> },
    { id: "academic", label: "Acadêmico", icon: null },
    { id: "professional", label: "Profissional", icon: null },
    { id: "creative", label: "Criativo", icon: null },
  ]

  const selectedOption = options.find((option) => option.id === preset) || options[0]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1 h-6 px-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-purple-500 dark:text-gray-400 mr-1 text-[8px]">⚙</span>
          <span className="text-[10px]">{selectedOption.label}</span>
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
                option.id === preset ? "bg-primary/5 dark:bg-primary/10" : ""
              }`}
              onClick={() => {
                setPreset(option.id)
                setIsOpen(false)
              }}
            >
              <div className="flex items-center">
                {option.icon ? (
                  <span className="text-purple-500 dark:text-gray-400 mr-2">{option.icon}</span>
                ) : (
                  <span className="text-purple-500 dark:text-gray-400 mr-2">⚙</span>
                )}
                <span className="text-sm text-gray-800 dark:text-gray-200">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
