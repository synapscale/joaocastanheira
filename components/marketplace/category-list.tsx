"use client"

import { useState, useCallback, useMemo } from "react"
import { useCustomCategories } from "@/context/custom-category-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Package, ExternalLink } from "lucide-react"
import { CategoryDialog } from "./category-dialog"
import { DeleteCategoryDialog } from "./delete-category-dialog"
import type { CustomCategory, UpdateCustomCategoryInput } from "@/types/custom-category"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Componente que exibe a lista de categorias personalizadas.
 */
export function CategoryList() {
  const router = useRouter()
  const { categories, updateCategory, deleteCategory, isLoading } = useCustomCategories()
  const [editCategory, setEditCategory] = useState<CustomCategory | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CustomCategory | null>(null)

  // Handlers memoizados para melhor performance
  const handleEditClick = useCallback((category: CustomCategory) => {
    setEditCategory(category)
  }, [])

  const handleDeleteClick = useCallback((category: CustomCategory) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }, [])

  const handleUpdateCategory = useCallback(
    async (data: UpdateCustomCategoryInput) => {
      await updateCategory(data)
      setEditCategory(null)
    },
    [updateCategory],
  )

  const handleDeleteCategory = useCallback(async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.id)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }, [categoryToDelete, deleteCategory])

  const navigateToCategory = useCallback(
    (categoryId: string) => {
      router.push(`/marketplace?category=${categoryId}&type=custom`)
    },
    [router],
  )

  const handleCreateFirstCategory = useCallback(() => {
    setEditCategory({} as CustomCategory)
  }, [])

  // Componente de loading
  const renderSkeletons = useMemo(() => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }, [])

  // Componente de estado vazio
  const renderEmptyState = useMemo(() => {
    return (
      <Card className="text-center p-6">
        <CardContent className="pt-6 pb-4">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-xl font-medium mb-2">Nenhuma categoria personalizada</h3>
          <p className="text-muted-foreground">
            Crie categorias personalizadas para organizar seus nós favoritos do marketplace.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleCreateFirstCategory}>Criar Primeira Categoria</Button>
        </CardFooter>
      </Card>
    )
  }, [handleCreateFirstCategory])

  // Renderização condicional baseada no estado
  if (isLoading) {
    return renderSkeletons
  }

  if (categories.length === 0) {
    return renderEmptyState
  }

  // Formatador de data reutilizável
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
        aria-label="Categorias personalizadas"
      >
        {categories.map((category) => (
          <Card key={category.id} role="listitem">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {category.icon && (
                  <span aria-hidden="true" className="text-lg">
                    {category.icon}
                  </span>
                )}
                <CardTitle className="flex-1">{category.name}</CardTitle>
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} aria-hidden="true" />
              </div>
              <CardDescription>{category.description || "Sem descrição"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {category.nodeCount} {category.nodeCount === 1 ? "nó" : "nós"}
                </Badge>
                <span className="text-xs text-muted-foreground">Criada em {formatDate(category.createdAt)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEditClick(category)}
                aria-label={`Editar categoria ${category.name}`}
              >
                <Pencil className="h-4 w-4 mr-1" aria-hidden="true" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigateToCategory(category.id)}
                aria-label={`Ver nós da categoria ${category.name}`}
              >
                <ExternalLink className="h-4 w-4 mr-1" aria-hidden="true" />
                Ver Nós
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDeleteClick(category)}
                aria-label={`Excluir categoria ${category.name}`}
              >
                <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {editCategory && (
        <CategoryDialog
          open={!!editCategory}
          onOpenChange={(open) => !open && setEditCategory(null)}
          category={editCategory}
          onSubmit={handleUpdateCategory}
        />
      )}

      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={categoryToDelete}
        onDelete={handleDeleteCategory}
      />
    </>
  )
}
