"use client"

import * as React from "react"
import { Button } from "../ui/button"
import { Plus, Database, Code, FileText, Bot, BrainCircuit, Settings, MessageSquare, Sparkles, Zap } from "lucide-react"
import { cn } from "../../lib/utils"

interface PromptToolItem {
  id: string
  name: string
}

interface PromptToolsBarProps {
  tools: PromptToolItem[]
  onToolClick?: (toolId: string) => void
  className?: string
  id?: string
  "aria-label"?: string
}

// Mapeamento de IDs para ícones
const getIconForTool = (id: string) => {
  switch (id) {
    case "variables":
      return <Database className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    case "functions":
      return <Code className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    case "examples":
      return <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    case "persona":
      return <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    case "context":
      return <BrainCircuit className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    case "instructions":
      return <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    case "format":
      return <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    case "capabilities":
      return <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    case "constraints":
      return <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    default:
      return <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
  }
}

/**
 * PromptToolsBar - Barra de ferramentas para o editor de prompt
 */
export function PromptToolsBar({ tools, onToolClick, className, id, "aria-label": ariaLabel }: PromptToolsBarProps) {
  return (
    <div
      className={cn(
        "flex flex-nowrap gap-2 mb-3 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap sm:gap-3 scrollbar-hide",
        className,
      )}
      role="toolbar"
      aria-label={ariaLabel || "Ferramentas de prompt"}
      id={id}
    >
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant="outline"
          size="sm"
          className="h-7 sm:h-8 text-xs rounded-full whitespace-nowrap flex-shrink-0"
          onClick={() => onToolClick?.(tool.id)}
          aria-label={`Adicionar ${tool.name}`}
        >
          {getIconForTool(tool.id)}
          {tool.name}
          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1" aria-hidden="true" />
        </Button>
      ))}
    </div>
  )
}