"use client"

import { useState } from "react"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Maximize2, Minimize2, Sparkles } from "lucide-react"
import { SearchInput } from "./search-input"
import { cn } from "@/lib/utils"

interface SidebarHeaderProps {
  view: "main" | "category" | "templates" | "my-nodes" | "create"
  searchQuery: string
  onSearchChange: (value: string) => void
  onBackClick: () => void
  selectedCategory?: {
    id: string
    name: string
    icon: React.ElementType
    color: string
  } | null
  userNodesCount?: number
  title: string
  subtitle?: string
  className?: string
}

/**
 * The header component for the node sidebar
 */
export function SidebarHeader({
  view,
  searchQuery,
  onSearchChange,
  onBackClick,
  selectedCategory,
  userNodesCount,
  title,
  subtitle,
  className,
}: SidebarHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    // Aqui você implementaria a lógica para expandir a sidebar
  }

  // Common header controls
  const headerControls = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullscreen}
        className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-700"
        aria-label={isFullscreen ? "Minimizar" : "Maximizar"}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
    </div>
  )

  // Render different headers based on the current view
  switch (view) {
    case "main":
      return (
        <div
          className={cn(
            "p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900",
            className,
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h2>
            </div>
            {headerControls}
          </div>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </div>
      )

    case "category":
      return (
        <div className={cn("p-6 border-b border-slate-200 dark:border-slate-700", className)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackClick}
                className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-xs ${selectedCategory.color}`}
                  >
                    {React.createElement(selectedCategory.icon, { className: "h-3 w-3" })}
                  </div>
                )}
                <h2 className="font-semibold text-lg">{selectedCategory ? selectedCategory.name : title}</h2>
              </div>
            </div>
            {headerControls}
          </div>
          <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="Buscar nodes..." />
        </div>
      )

    case "my-nodes":
      return (
        <div className={cn("p-6 border-b border-slate-200 dark:border-slate-700", className)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackClick}
                className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold text-lg">{title}</h2>
              {userNodesCount !== undefined && (
                <div className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-medium">
                  {userNodesCount}
                </div>
              )}
            </div>
            {headerControls}
          </div>
          <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="Buscar meus nodes..." />
        </div>
      )

    default:
      return (
        <div className={cn("p-6 border-b border-slate-200 dark:border-slate-700", className)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackClick}
                className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold text-lg">{title}</h2>
            </div>
            {headerControls}
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      )
  }
}
