"use client"

import { memo, useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TreeViewProps {
  data: any
  emptyMessage?: string
}

interface TreeNodeProps {
  name: string
  value: any
  depth: number
  expanded: boolean
  onToggle: () => void
}

/**
 * TreeView component for visualizing nested object structures
 */
function TreeViewComponent({ data, emptyMessage = "No data to display" }: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]))

  // If no data or invalid data, show empty message
  if (!data || typeof data !== "object") {
    return <div className="text-center p-4 text-muted-foreground">{emptyMessage}</div>
  }

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const renderTreeNode = (name: string, value: any, path: string, depth = 0) => {
    const isExpanded = expandedNodes.has(path)
    const isObject = value !== null && typeof value === "object"

    return (
      <div key={path} className="font-mono text-sm">
        <div
          className={cn("flex items-center hover:bg-gray-100 py-1 px-2 rounded cursor-pointer", depth > 0 && "ml-4")}
          onClick={() => isObject && toggleNode(path)}
        >
          {isObject ? (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 mr-1 text-gray-500" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 mr-1 text-gray-500" />
            )
          ) : (
            <span className="w-3.5 h-3.5 mr-1" />
          )}

          <span className="font-medium text-blue-600">{name}</span>

          {isObject ? (
            <span className="text-gray-500 ml-2">{Array.isArray(value) ? `Array(${value.length})` : "Object"}</span>
          ) : (
            <span className="ml-2">
              {value === null ? (
                <span className="text-gray-500">null</span>
              ) : value === undefined ? (
                <span className="text-gray-500">undefined</span>
              ) : typeof value === "string" ? (
                <span className="text-green-600">"{value}"</span>
              ) : typeof value === "number" ? (
                <span className="text-orange-600">{value}</span>
              ) : typeof value === "boolean" ? (
                <span className="text-purple-600">{String(value)}</span>
              ) : (
                <span>{String(value)}</span>
              )}
            </span>
          )}
        </div>

        {isObject && isExpanded && (
          <div className="ml-4">
            {Array.isArray(value)
              ? value.map((item, index) => renderTreeNode(String(index), item, `${path}.${index}`, depth + 1))
              : Object.entries(value).map(([key, val]) => renderTreeNode(key, val, `${path}.${key}`, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return <div className="p-4 overflow-auto max-h-[400px]">{renderTreeNode("root", data, "root")}</div>
}

export const TreeView = memo(TreeViewComponent)
