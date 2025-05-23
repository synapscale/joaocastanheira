"use client"

import type React from "react"

import { useState } from "react"
import { useTemplates } from "@/context/template-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Search, Play } from "lucide-react"

export function TemplateGallery() {
  const { filteredTemplates, categories, filters, setFilters, applyTemplate } = useTemplates()
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      search: e.target.value,
    })
  }

  // Handle category filter
  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId)

    if (categoryId === null) {
      setFilters({ ...filters, categories: [] })
    } else {
      setFilters({ ...filters, categories: [categoryId] })
    }
  }

  // Handle template application
  const handleApplyTemplate = (templateId: string) => {
    try {
      applyTemplate(templateId)
      toast({
        title: "Success",
        description: "Template applied successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to apply template",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates..." value={filters.search} onChange={handleSearch} className="pl-10" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryFilter(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryFilter(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[calc(100vh-240px)]">
        <div className="space-y-3 pr-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No templates found</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-3 hover:border-primary transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{template.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{template.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleApplyTemplate(template.id)}>
                  <Play className="h-3 w-3 mr-2" />
                  Apply
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
