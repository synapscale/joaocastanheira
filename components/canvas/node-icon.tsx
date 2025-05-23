"use client"

import { memo } from "react"
import { MessageSquare, Code, Edit, Clock, Bot, Globe, Wrench, FileText } from "lucide-react"

interface NodeIconProps {
  type: string
  size?: number
}

/**
 * Componente que renderiza o ícone apropriado para um tipo de nó
 */
function NodeIconComponent({ type, size = 24 }: NodeIconProps) {
  switch (type) {
    case "trigger":
      return <MessageSquare size={size} className="text-orange-500" />
    case "ai":
      return <Bot size={size} className="text-purple-600" />
    case "integration":
      return <Globe size={size} className="text-blue-500" />
    case "action":
      return <Wrench size={size} className="text-gray-600" />
    case "filter":
      return <MessageSquare size={size} className="text-blue-500" />
    case "code":
      return <Code size={size} className="text-orange-500" />
    case "edit":
      return <Edit size={size} className="text-indigo-600" />
    case "wait":
      return <Clock size={size} className="text-purple-600" />
    default:
      return <FileText size={size} className="text-gray-600" />
  }
}

export const NodeIcon = memo(NodeIconComponent)
