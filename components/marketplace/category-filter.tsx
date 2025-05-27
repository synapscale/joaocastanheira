"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  count: number
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (categoryId: string | null) => void
  className?: string
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory, className }: CategoryFilterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Categorias</h3>
        {selectedCategory && (
          <Button variant="ghost" size="sm" onClick={() => onSelectCategory(null)} className="h-auto p-1 text-xs">
            Limpar
          </Button>
        )}
      </div>

      <ScrollArea className="h-auto max-h-32">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(null)}
            className="h-auto py-1 px-3"
          >
            Todas
            <Badge variant="secondary" className="ml-2">
              {categories.reduce((sum, cat) => sum + cat.count, 0)}
            </Badge>
          </Button>

          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectCategory(category.id)}
              className="h-auto py-1 px-3"
            >
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
