"use client"

import React from "react"
import { Plus } from "lucide-react"

interface EmptyCanvasPlaceholderProps {
  onAddFirstNode: () => void
}

/**
 * Componente que exibe um placeholder quando o canvas está vazio,
 * permitindo ao usuário adicionar o primeiro node de forma intuitiva.
 * Similar ao comportamento do n8n quando o canvas está vazio.
 */
export function EmptyCanvasPlaceholder({ onAddFirstNode }: EmptyCanvasPlaceholderProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div 
        className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-300 bg-white/50 cursor-pointer hover:bg-white/80 transition-colors"
        onClick={onAddFirstNode}
      >
        <div className="w-12 h-12 rounded-full bg-[#FF5C00] flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <p className="text-gray-600 font-medium text-lg">Adicionar primeiro node...</p>
        <p className="text-gray-500 text-sm mt-1">Clique para começar seu workflow</p>
      </div>
    </div>
  )
}
