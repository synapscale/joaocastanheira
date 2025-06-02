"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNodeDefinitions } from "@/context/node-definition-context"
import type { NodeDefinition, NodeCategory } from "@/types/node-definition"
import { Search, Code, Clock, Bot, Globe, Wrench, FileText, Settings2, Filter } from "lucide-react"

interface NodeTemplateSelectorProps {
  onSelect: (nodeDefinition: NodeDefinition) => void
  onClose: () => void
}

export function NodeTemplateSelector({ onSelect, onClose }: NodeTemplateSelectorProps) {
  const { nodeDefinitions } = useNodeDefinitions()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<NodeCategory | "all">("all")

  const filteredDefinitions = nodeDefinitions.filter((def) => {
    const matchesSearch =
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = activeCategory === "all" || def.category === activeCategory

    return matchesSearch && matchesCategory && !def.deprecated
  })

  // Group definitions by category
  const definitionsByCategory = filteredDefinitions.reduce(
    (acc, def) => {
      if (!acc[def.category]) {
        acc[def.category] = []
      }
      acc[def.category].push(def)
      return acc
    },
    {} as Record<NodeCategory, NodeDefinition[]>,
  )

  // Get icon for a node type
  const getNodeIcon = (type: string) => {
    switch (type) {
      case "code":
        return <Code className="h-5 w-5" />
      case "wait":
        return <Clock className="h-5 w-5" />
      case "ai":
        return <Bot className="h-5 w-5" />
      case "integration":
        return <Globe className="h-5 w-5" />
      case "action":
        return <Wrench className="h-5 w-5" />
      case "filter":
        return <Filter className="h-5 w-5" />
      case "transform":
        return <FileText className="h-5 w-5" />
      default:
        return <Settings2 className="h-5 w-5" />
    }
  }

  // Get color for a node category
  const getCategoryColor = (category: NodeCategory) => {
    switch (category) {
      case "triggers":
        return "text-orange-500 bg-orange-50"
      case "operations":
        return "text-blue-500 bg-blue-50"
      case "flow":
        return "text-purple-500 bg-purple-50"
      case "transformations":
        return "text-green-500 bg-green-50"
      case "ai":
        return "text-indigo-500 bg-indigo-50"
      case "integrations":
        return "text-cyan-500 bg-cyan-50"
      case "custom":
        return "text-gray-500 bg-gray-50"
      default:
        return "text-gray-500 bg-gray-50"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as NodeCategory | "all")}>
        <div className="border-b">
          <ScrollArea className="whitespace-nowrap">
            <TabsList className="w-full justify-start px-4 py-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="flow">Flow Control</TabsTrigger>
              <TabsTrigger value="transformations">Transformations</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="all" className="m-0 p-0">
            {Object.entries(definitionsByCategory).map(([category, definitions]) => (
              <div key={category} className="mb-4">
                <h3 className="text-sm font-medium px-4 py-2 bg-muted/50">{category}</h3>
                <div className="divide-y">
                  {definitions.map((def, index) => (
                    <button
                      key={`all-${category}-${def.id}-${index}`}
                      className="w-full flex items-start p-4 hover:bg-muted/50 text-left"
                      onClick={() => onSelect(def)}
                    >
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-md mr-3 ${getCategoryColor(def.category)}`}
                      >
                        {getNodeIcon(def.type)}
                      </div>
                      <div>
                        <div className="font-medium">{def.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{def.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(definitionsByCategory).length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No nodes found matching your search criteria.</p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            )}
          </TabsContent>

          {(
            ["triggers", "operations", "flow", "transformations", "ai", "integrations", "custom"] as NodeCategory[]
          ).map((category) => (
            <TabsContent key={category} value={category} className="m-0 p-0">
              {definitionsByCategory[category]?.length > 0 ? (
                <div className="divide-y">
                  {definitionsByCategory[category].map((def, index) => (
                    <button
                      key={`${category}-${def.id}-${index}`}
                      className="w-full flex items-start p-4 hover:bg-muted/50 text-left"
                      onClick={() => onSelect(def)}
                    >
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-md mr-3 ${getCategoryColor(def.category)}`}
                      >
                        {getNodeIcon(def.type)}
                      </div>
                      <div>
                        <div className="font-medium">{def.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{def.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No nodes found in this category.</p>
                  <Button variant="outline" onClick={() => setActiveCategory("all")}>
                    View All Nodes
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  )
}
