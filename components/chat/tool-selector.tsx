"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronDown, Wrench, Search, Globe, Image, File, Brain, Twitter, Book, MessageCircle, Share2, Briefcase, Instagram, Facebook, Sparkles, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/app-context"

// Interface para ferramentas
interface Tool {
  id: string
  name: string
  description?: string
  icon?: React.ReactNode
  category?: string
}

// Interface para props do componente
interface ToolSelectorProps {
  tools?: Tool[]
  onToolSelect?: (tool: Tool) => void
  size?: string
  buttonIcon?: React.ReactNode
  buttonLabel?: string
}

// Lista completa de ferramentas conforme solicitado
export const DEFAULT_TOOLS: Tool[] = [
  { 
    id: "tools", 
    name: "Tools", 
    description: "Ferramentas gerais habilitadas",
    icon: <Wrench className="h-4 w-4" />,
    category: "general"
  },
  { 
    id: "no-tools", 
    name: "No Tools", 
    description: "Nenhuma ferramenta habilitada",
    icon: null,
    category: "general"
  },
  { 
    id: "gpt-search", 
    name: "GPT Search", 
    description: "Busca avançada com IA",
    icon: <Search className="h-4 w-4" />,
    category: "search"
  },
  { 
    id: "internet", 
    name: "Internet", 
    description: "Acesso à internet para busca em tempo real",
    icon: <Globe className="h-4 w-4" />,
    category: "search"
  },
  { 
    id: "image-generation", 
    name: "Image Generation", 
    description: "Geração de imagens com IA",
    icon: <Image className="h-4 w-4" />,
    category: "creation"
  },
  { 
    id: "manage-files", 
    name: "Manage Files", 
    description: "Gerenciamento e análise de arquivos",
    icon: <File className="h-4 w-4" />,
    category: "files"
  },
  { 
    id: "deep-analysis", 
    name: "Deep Analysis", 
    description: "Análise profunda e detalhada",
    icon: <Brain className="h-4 w-4" />,
    category: "analysis"
  },
  { 
    id: "twitter", 
    name: "Twitter", 
    description: "Integração com Twitter/X",
    icon: <Twitter className="h-4 w-4" />,
    category: "social"
  },
  { 
    id: "wikipedia", 
    name: "Wikipedia", 
    description: "Busca na Wikipedia",
    icon: <Book className="h-4 w-4" />,
    category: "knowledge"
  },
  { 
    id: "quora", 
    name: "Quora", 
    description: "Busca no Quora",
    icon: <MessageCircle className="h-4 w-4" />,
    category: "knowledge"
  },
  { 
    id: "reddit", 
    name: "Reddit", 
    description: "Busca no Reddit",
    icon: <Share2 className="h-4 w-4" />,
    category: "social"
  },
  { 
    id: "medium", 
    name: "Medium", 
    description: "Busca no Medium",
    icon: <Book className="h-4 w-4" />,
    category: "knowledge"
  },
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    description: "Integração com LinkedIn",
    icon: <Briefcase className="h-4 w-4" />,
    category: "professional"
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    description: "Integração com Instagram",
    icon: <Instagram className="h-4 w-4" />,
    category: "social"
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    description: "Integração com Facebook",
    icon: <Facebook className="h-4 w-4" />,
    category: "social"
  }
]

// Categorias para organização
const TOOL_CATEGORIES: Record<string, string> = {
  general: "Geral",
  search: "Busca",
  creation: "Criação",
  files: "Arquivos",
  analysis: "Análise",
  social: "Social",
  knowledge: "Conhecimento",
  professional: "Profissional"
}

export default function ToolSelector({ 
  tools, 
  onToolSelect, 
  size, 
  buttonIcon, 
  buttonLabel 
}: ToolSelectorProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { selectedTool, setSelectedTool, enabledTools } = useApp()

  // Filtrar ferramentas pelas configurações
  const allTools = tools || DEFAULT_TOOLS
  const options = allTools.filter(tool => 
    enabledTools.length === 0 || enabledTools.includes(tool.id)
  )

  // Filtrar ferramentas com base na pesquisa
  const filteredOptions = options.filter((tool: Tool) =>
    searchQuery === "" ||
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Agrupar por categoria
  const toolsByCategory = filteredOptions.reduce((acc: Record<string, Tool[]>, tool: Tool) => {
    const category = tool.category || "general"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(tool)
    return acc
  }, {})

  const selectedOption = options.find((option: Tool) => option.id === selectedTool) || options[0]

  // Focar no input de busca quando o dropdown abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

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
            <span className="text-amber-500 dark:text-amber-400 text-[8px] group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
              {selectedOption?.icon ? (
                <span className="w-2 h-2 flex items-center justify-center">
                  {selectedOption.icon}
                </span>
              ) : (
                "✦"
              )}
            </span>
            <span className="font-light text-[7px] tracking-tight mx-0.5">{buttonLabel || selectedOption?.name}</span>
            <ChevronDown className="h-1.5 w-1.5 text-gray-400 dark:text-gray-500 ml-0.5 group-hover:text-primary/70 transition-colors" />
            
            {/* Efeito sutil de destaque */}
            <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm" />
          </Button>
        </motion.div>
      </PopoverTrigger>
              <PopoverContent
        className="w-[320px] p-0 border border-gray-100 dark:border-gray-700 shadow-xl rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md transition-all duration-300"
        align="start"
        onInteractOutside={() => setIsOpen(false)}
        onEscapeKeyDown={() => setIsOpen(false)}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-100/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-800/50 dark:to-gray-900/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar ferramentas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm rounded-xl bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 focus:border-primary/40 focus:ring-primary/30 shadow-sm backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Tools List */}
        <ScrollArea className="h-[350px] overflow-y-auto scrollbar-thin">
          <div className="py-2">
            {Object.keys(toolsByCategory).length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Nenhuma ferramenta encontrada
              </div>
            ) : (
              Object.keys(toolsByCategory).map((category) => (
                <div key={category} className="py-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider bg-gradient-to-r from-gray-50/80 to-transparent dark:from-gray-700/50 dark:to-transparent border-l-2 border-amber-500/30">
                    {TOOL_CATEGORIES[category] || category}
                  </div>
                  <div className="space-y-0.5">
                    <AnimatePresence>
                      {toolsByCategory[category].map((tool) => (
                        <motion.button
                          key={tool.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/40 dark:hover:from-gray-700/80 dark:hover:to-gray-600/40 transition-all duration-300 relative rounded-lg mx-1 ${
                            tool.id === selectedTool ? "bg-gradient-to-r from-amber-50/80 to-amber-100/40 dark:from-amber-900/20 dark:to-amber-800/10 shadow-sm border border-amber-200/50 dark:border-amber-700/50" : ""
                          }`}
                          onClick={() => {
                            setSelectedTool(tool.id)
                            if (onToolSelect) {
                              onToolSelect(tool)
                            }
                            setIsOpen(false)
                          }}
                        >
                          <div className="flex-shrink-0 h-6 w-6 rounded-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-amber-200/50 dark:border-amber-700/50">
                            {tool.icon ? React.cloneElement(tool.icon as React.ReactElement, { className: "h-3 w-3" }) : <Sparkles className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {tool.name}
                                </span>
                                {tool.description && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0 line-clamp-1">
                                    {tool.description}
                                  </div>
                                )}
                              </div>
                              {tool.id === selectedTool && (
                                <motion.span 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-primary flex-shrink-0"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </motion.span>
                              )}
                            </div>
                          </div>
                          
                          {/* Efeito sutil de destaque */}
                          {tool.id === selectedTool && (
                            <motion.span 
                              layoutId="selectedToolHighlight"
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

                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
