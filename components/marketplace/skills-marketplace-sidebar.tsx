"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Download, User, Filter } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Mock data for skills
const mockSkills = [
  {
    id: "skill1",
    name: "Processamento de Texto",
    description: "Extrai informações de textos usando NLP",
    category: "ai",
    author: { displayName: "AI Team", isVerified: true },
    tags: ["NLP", "Text", "AI"],
    rating: 4.5,
    downloads: 1250,
    publishedAt: new Date("2023-01-15").toISOString(),
  },
  {
    id: "skill2",
    name: "Conexão REST API",
    description: "Conecta com APIs REST externas",
    category: "apis",
    author: { displayName: "Integration Team", isVerified: false },
    tags: ["API", "REST", "Integration"],
    rating: 4.2,
    downloads: 980,
    publishedAt: new Date("2023-02-20").toISOString(),
  },
  {
    id: "skill3",
    name: "Automação de Email",
    description: "Envia emails automaticamente baseado em gatilhos",
    category: "automacao",
    author: { displayName: "Automation Team", isVerified: true },
    tags: ["Email", "Automation", "Workflow"],
    rating: 4.7,
    downloads: 1560,
    publishedAt: new Date("2023-03-10").toISOString(),
  },
  {
    id: "skill4",
    name: "Análise de Sentimento",
    description: "Analisa o sentimento de textos usando IA",
    category: "ai",
    author: { displayName: "NLP Team", isVerified: true },
    tags: ["Sentiment", "AI", "Text"],
    rating: 4.3,
    downloads: 890,
    publishedAt: new Date("2023-04-05").toISOString(),
  },
  {
    id: "skill5",
    name: "Processamento de Dados",
    description: "Transforma e processa dados em diferentes formatos",
    category: "dados",
    author: { displayName: "Data Team", isVerified: true },
    tags: ["Data", "ETL", "Processing"],
    rating: 4.6,
    downloads: 1320,
    publishedAt: new Date("2023-05-12").toISOString(),
  },
]

interface SkillsMarketplaceSidebarProps {
  onItemSelect?: () => void
  className?: string
}

export function SkillsMarketplaceSidebar({ onItemSelect, className }: SkillsMarketplaceSidebarProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [draggedSkill, setDraggedSkill] = useState<string | null>(null)

  // Filter skills based on search query and selected category
  const filteredSkills = mockSkills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent, skillId: string) => {
      setDraggedSkill(skillId)

      const skill = mockSkills.find((s) => s.id === skillId)
      if (!skill) return

      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          type: "skill",
          skill: {
            ...skill,
            inputs: [{ id: "input-1", name: "Input", type: "any", connected: false }],
            outputs: [{ id: "output-1", name: "Output", type: "any", connected: false }],
          },
        }),
      )
      e.dataTransfer.effectAllowed = "copy"

      toast({
        title: "Arraste para o canvas",
        description: "Solte a skill no canvas para criar um novo node",
        duration: 3000,
      })
    },
    [toast],
  )

  const handleDragEnd = useCallback(() => {
    setDraggedSkill(null)
  }, [])

  // Get unique categories
  const categories = [
    { id: "all", name: "Todos", count: mockSkills.length },
    { id: "ai", name: "IA", count: mockSkills.filter((s) => s.category === "ai").length },
    { id: "apis", name: "APIs", count: mockSkills.filter((s) => s.category === "apis").length },
    { id: "automacao", name: "Automação", count: mockSkills.filter((s) => s.category === "automacao").length },
    { id: "dados", name: "Dados", count: mockSkills.filter((s) => s.category === "dados").length },
  ]

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Skills Marketplace
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar skills..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Categorias</h3>
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs h-7"
              >
                {category.name}
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className={cn(
                  "transition-all duration-200 cursor-move",
                  draggedSkill === skill.id ? "opacity-50 scale-95" : "",
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, skill.id)}
                onDragEnd={handleDragEnd}
                onClick={onItemSelect}
              >
                <div className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm line-clamp-1">{skill.name}</h4>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                      {skill.rating}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{skill.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <User className="h-3 w-3 mr-1" />
                      {skill.author.displayName}
                      {skill.author.isVerified && <span className="ml-1 text-blue-500">✓</span>}
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground">
                      <Download className="h-3 w-3 mr-1" />
                      {skill.downloads}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {skill.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs h-5 px-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Nenhuma skill encontrada</h3>
              <p className="text-sm text-muted-foreground">Tente ajustar sua busca</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
