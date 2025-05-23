"use client"

import { useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCustomCategories } from "@/context/custom-category-context"
import { X } from "lucide-react"

interface NodeFiltersProps {
  categories: string[]
  tags: string[]
  selectedCategory: string | null
  selectedTags: string[]
  onCategoryChange: (category: string | null) => void
  onTagsChange: (tags: string[]) => void
  onReset: () => void
  selectedCategoryType?: "system" | "custom"
  onCategoryTypeChange?: (type: "system" | "custom") => void
  selectedCustomCategory?: string | null
  onCustomCategoryChange?: (categoryId: string | null) => void
}

/**
 * Componente de filtros para o marketplace de nós.
 */
export function NodeFilters({
  categories,
  tags,
  selectedCategory,
  selectedTags,
  onCategoryChange,
  onTagsChange,
  onReset,
  selectedCategoryType = "system",
  onCategoryTypeChange,
  selectedCustomCategory,
  onCustomCategoryChange,
}: NodeFiltersProps) {
  const { categories: customCategories, isLoading: isLoadingCategories } = useCustomCategories()

  /**
   * Traduz o nome da categoria para português.
   */
  const translateCategory = useCallback((category: string): string => {
    const translations: Record<string, string> = {
      triggers: "Gatilhos",
      operations: "Operações",
      flow: "Controle de Fluxo",
      transformations: "Transformações",
      ai: "IA",
      integrations: "Integrações",
      custom: "Personalizado",
    }
    return translations[category] || category
  }, [])

  /**
   * Manipula a alternância de tags selecionadas.
   */
  const handleTagToggle = useCallback(
    (tag: string) => {
      if (selectedTags.includes(tag)) {
        onTagsChange(selectedTags.filter((t) => t !== tag))
      } else {
        onTagsChange([...selectedTags, tag])
      }
    },
    [selectedTags, onTagsChange],
  )

  /**
   * Manipula a alternância entre categorias do sistema e personalizadas.
   */
  const handleCategoryTypeChange = useCallback(
    (type: "system" | "custom") => {
      if (onCategoryTypeChange) {
        onCategoryTypeChange(type)

        // Resetar a seleção de categoria quando mudar o tipo
        if (type === "system") {
          onCategoryChange(null)
          if (onCustomCategoryChange) onCustomCategoryChange(null)
        } else {
          onCategoryChange(null)
          if (onCustomCategoryChange) onCustomCategoryChange(null)
        }
      }
    },
    [onCategoryTypeChange, onCategoryChange, onCustomCategoryChange],
  )

  /**
   * Renderiza o conteúdo das categorias do sistema.
   */
  const systemCategoriesContent = useMemo(
    () => (
      <RadioGroup
        value={selectedCategory || ""}
        onValueChange={(value) => onCategoryChange(value || null)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="" id="category-all" />
          <Label htmlFor="category-all">Todas as categorias</Label>
        </div>

        {categories.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <RadioGroupItem value={category} id={`category-${category}`} />
            <Label htmlFor={`category-${category}`}>{translateCategory(category)}</Label>
          </div>
        ))}
      </RadioGroup>
    ),
    [categories, selectedCategory, onCategoryChange, translateCategory],
  )

  /**
   * Renderiza o conteúdo das categorias personalizadas.
   */
  const customCategoriesContent = useMemo(() => {
    if (isLoadingCategories) {
      return <div className="text-center py-2 text-sm text-muted-foreground">Carregando categorias...</div>
    }

    if (customCategories.length === 0) {
      return (
        <div className="text-center py-2 text-sm text-muted-foreground">Nenhuma categoria personalizada criada.</div>
      )
    }

    return (
      <RadioGroup
        value={selectedCustomCategory || ""}
        onValueChange={(value) => onCustomCategoryChange && onCustomCategoryChange(value || null)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="" id="custom-category-all" />
          <Label htmlFor="custom-category-all">Todas as categorias</Label>
        </div>

        {customCategories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <RadioGroupItem value={category.id} id={`custom-category-${category.id}`} />
            <Label htmlFor={`custom-category-${category.id}`} className="flex items-center gap-2">
              {category.icon && <span aria-hidden="true">{category.icon}</span>}
              {category.name}
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} aria-hidden="true" />
            </Label>
          </div>
        ))}
      </RadioGroup>
    )
  }, [customCategories, isLoadingCategories, selectedCustomCategory, onCustomCategoryChange])

  /**
   * Renderiza o conteúdo das tags.
   */
  const tagsContent = useMemo(
    () => (
      <ScrollArea className="h-48 pr-4">
        <div className="space-y-2">
          {tags.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag}`}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => handleTagToggle(tag)}
              />
              <Label htmlFor={`tag-${tag}`}>{tag}</Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    ),
    [tags, selectedTags, handleTagToggle],
  )

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Filtros</h3>
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2" aria-label="Limpar filtros">
            <X className="h-4 w-4 mr-1" aria-hidden="true" />
            Limpar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filtro de categorias */}
          <div>
            <h4 className="text-sm font-medium mb-2">Categorias</h4>

            {/* Tabs para alternar entre categorias do sistema e personalizadas */}
            <Tabs
              value={selectedCategoryType}
              onValueChange={(value) => handleCategoryTypeChange(value as "system" | "custom")}
              className="mb-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="system">Sistema</TabsTrigger>
                <TabsTrigger value="custom">Personalizadas</TabsTrigger>
              </TabsList>

              <TabsContent value="system" className="mt-2">
                {systemCategoriesContent}
              </TabsContent>

              <TabsContent value="custom" className="mt-2">
                {customCategoriesContent}
              </TabsContent>
            </Tabs>
          </div>

          {/* Filtro de tags */}
          <div>
            <h4 className="text-sm font-medium mb-2">Tags</h4>
            {tagsContent}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
