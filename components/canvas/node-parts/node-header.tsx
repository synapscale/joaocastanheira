"use client"

import type React from "react"
import { ChevronDown, ChevronUp, Settings, Copy, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ActionButton } from "../ui/action-button"
import type { Node } from "@/types/core/canvas-types"

interface NodeHeaderProps {
  node: Node
  headerBg?: string
  textColor?: string
  isExpanded: boolean
  onToggleExpand: (e: React.MouseEvent) => void
  onRemove: (e: React.MouseEvent) => void
  onDuplicate?: (e: React.MouseEvent) => void
  onSettings?: (e: React.MouseEvent) => void
  isHovered: boolean
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

/**
 * Cabeçalho do node com controles
 */
export function NodeHeader({
  node,
  headerBg = "bg-gradient-to-r from-blue-500 to-purple-500",
  textColor = "text-white",
  isExpanded,
  onToggleExpand,
  onRemove,
  onDuplicate,
  onSettings,
  isHovered,
  isSelected,
  onMouseDown,
}: NodeHeaderProps) {
  return (
    <div
      className={cn("node-header px-5 py-4 cursor-move relative overflow-hidden", headerBg, "border-b border-white/20")}
      onMouseDown={onMouseDown}
    >
      {/* Header Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"></div>
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Node Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg",
              "bg-white/25 backdrop-blur-sm border border-white/30",
            )}
          >
            <span className="text-lg">🔧</span>
          </div>

          {/* Node Information */}
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-bold text-base truncate", textColor)} title={node.data.name}>
              {node.data.name}
            </h3>
            <p className={cn("text-sm opacity-80 truncate", textColor)} title={node.type}>
              {node.type}
            </p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="text-xs bg-white/20 text-white border-white/30 shadow-sm px-2 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 inline-block animate-pulse"></div>
              Ativo
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-8 w-8 p-0 hover:bg-white/20 text-white transition-all duration-200"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {/* Context Menu - Enhanced Visibility */}
          <div
            className={cn(
              "flex items-center gap-1 transition-all duration-200",
              isHovered || isSelected ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2",
            )}
          >
            {onSettings && (
              <ActionButton
                icon={<Settings className="h-3.5 w-3.5" />}
                label="Configurações"
                onClick={onSettings}
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
              />
            )}

            {onDuplicate && (
              <ActionButton
                icon={<Copy className="h-3.5 w-3.5" />}
                label="Duplicar"
                onClick={onDuplicate}
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
              />
            )}

            <ActionButton
              icon={<Trash2 className="h-3.5 w-3.5" />}
              label="Remover"
              onClick={onRemove}
              className="h-8 w-8 p-0 hover:bg-red-500/30 text-white hover:text-red-200"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
