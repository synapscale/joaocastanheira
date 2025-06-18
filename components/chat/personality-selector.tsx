"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown, Brain, Target, User, Sparkles, Zap, Thermometer, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useApp } from "@/context/app-context"

// Interface para personalidades
interface Personality {
  id: string
  name: string
  description?: string
  icon?: React.ReactNode
  temperature: number
}

// Interface para props do componente
interface PersonalitySelectorProps {
  personalities?: Personality[]
  onPersonalitySelect?: (personality: Personality) => void
  size?: string
  buttonIcon?: React.ReactNode
  buttonLabel?: string
}

// Lista completa de personalidades conforme solicitado com mapeamento de temperature
export const DEFAULT_PERSONALITIES: Personality[] = [
  { 
    id: "sistematica", 
    name: "Sistemática", 
    description: "Respostas estruturadas e metodológicas",
    icon: <Brain className="h-4 w-4" />,
    temperature: 0.1
  },
  { 
    id: "objetiva", 
    name: "Objetiva", 
    description: "Respostas diretas e concisas",
    icon: <Target className="h-4 w-4" />,
    temperature: 0.3
  },
  { 
    id: "natural", 
    name: "Natural", 
    description: "Respostas equilibradas e conversacionais",
    icon: <User className="h-4 w-4" />,
    temperature: 0.7
  },
  { 
    id: "criativa", 
    name: "Criativa", 
    description: "Respostas inovadoras e originais",
    icon: <Sparkles className="h-4 w-4" />,
    temperature: 0.9
  },
  { 
    id: "imaginativa", 
    name: "Imaginativa", 
    description: "Respostas altamente criativas e exploratórias",
    icon: <Zap className="h-4 w-4" />,
    temperature: 1.0
  }
]

export default function PersonalitySelector({ 
  personalities, 
  onPersonalitySelect, 
  size, 
  buttonIcon, 
  buttonLabel 
}: PersonalitySelectorProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedPersonality, setSelectedPersonality } = useApp()

  const options = personalities || DEFAULT_PERSONALITIES

  const selectedOption = options.find((option: Personality) => option.id === selectedPersonality) || options[2] // Default to "Natural"

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="chat-selector-button h-5 relative overflow-hidden group"
            style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
            onClick={() => setIsOpen(true)}
          >
            <span className="text-blue-500 dark:text-gray-400 text-[8px] group-hover:text-blue-600 dark:group-hover:text-gray-300 transition-colors">
              {selectedOption.icon ? (
                <span className="w-2 h-2 flex items-center justify-center">
                  {selectedOption.icon}
                </span>
              ) : (
                "❄"
              )}
            </span>
            <span className="font-light text-[7px] tracking-tight mx-0.5">{buttonLabel || selectedOption.name}</span>
            <ChevronDown className="h-1.5 w-1.5 text-gray-400 dark:text-gray-500 ml-0.5 group-hover:text-primary/70 transition-colors" />
            
            {/* Efeito sutil de destaque */}
            <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm" />
          </Button>
        </motion.div>
      </PopoverTrigger>
              <PopoverContent
        className="w-[300px] p-0 border border-gray-100 dark:border-gray-700 shadow-xl rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md transition-all duration-300"
        align="start"
        onInteractOutside={() => setIsOpen(false)}
        onEscapeKeyDown={() => setIsOpen(false)}
      >
        <div className="py-1 bg-gradient-to-b from-gray-50/30 to-transparent dark:from-gray-800/30 dark:to-transparent">
          <AnimatePresence>
            {options.map((option) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className={`w-full px-3 py-2 text-left hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/40 dark:hover:from-gray-700/80 dark:hover:to-gray-600/40 flex items-center transition-all duration-300 relative rounded-lg mx-1 ${
                  option.id === selectedPersonality ? "bg-gradient-to-r from-blue-50/80 to-blue-100/40 dark:from-blue-900/20 dark:to-blue-800/10 shadow-sm border border-blue-200/50 dark:border-blue-700/50" : ""
                }`}
                onClick={() => {
                  setSelectedPersonality(option.id)
                  if (onPersonalitySelect) {
                    onPersonalitySelect(option)
                  }
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center w-full gap-2">
                  <div className={`flex-shrink-0 h-6 w-6 rounded-md flex items-center justify-center transition-all duration-300 shadow-sm border ${
                    option.id === selectedPersonality 
                      ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-700/50" 
                      : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-blue-500 dark:text-gray-400 border-gray-200/50 dark:border-gray-600/50"
                  }`}>
                    {option.icon ? React.cloneElement(option.icon as React.ReactElement, { className: "h-3 w-3" }) : <Thermometer className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.name}
                        </span>
                        {option.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0 line-clamp-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {option.id === selectedPersonality && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-primary"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </motion.span>
                        )}
                        <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-700/50 px-1 py-0.5 rounded-sm">
                          <Thermometer className="h-2 w-2 text-blue-500 dark:text-blue-400" />
                          <span className="text-[9px] font-medium text-gray-600 dark:text-gray-300">
                            {option.temperature.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Efeito sutil de destaque */}
                {option.id === selectedPersonality && (
                  <motion.span 
                    layoutId="selectedPersonalityHighlight"
                    className="absolute inset-0 bg-primary/5 dark:bg-primary/10 border-l-2 border-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  )
}
