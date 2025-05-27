"use client"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { cn } from "@/utils/component-utils"
import type { Category } from "@/types/shared-types"

interface CategoryListItemProps {
  category: Category
  onSelect: (categoryId: string) => void
}

/**
 * Renders a single category item in the sidebar
 */
export function CategoryListItem({ category, onSelect }: CategoryListItemProps) {
  const IconComponent = category.icon

  return (
    <Button
      variant="ghost"
      className="w-full justify-start h-auto p-4 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
      onClick={() => onSelect(category.id)}
    >
      <div className="flex items-center gap-4 w-full">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", category.color)}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-medium text-slate-900 dark:text-slate-100">{category.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{category.count} nodes disponíveis</div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </Button>
  )
}
