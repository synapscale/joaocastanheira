"use client"

import { useState, useCallback } from "react"
import { useCustomCategories } from "@/context/custom-category-context"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CategoryList } from "@/components/marketplace/category-list"
import { CategoryDialog } from "@/components/marketplace/category-dialog"
import type { CreateCustomCategoryInput } from "@/types/custom-category"
import { Helmet } from "react-helmet" // Para SEO e acessibilidade

/**
 * Página para gerenciar categorias personalizadas.
 */
export default function CustomCategoriesPage() {
  const { addCategory } = useCustomCategories()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreateCategory = useCallback(
    async (data: CreateCustomCategoryInput) => {
      await addCategory(data)
      setDialogOpen(false)
    },
    [addCategory],
  )

  const openDialog = useCallback(() => {
    setDialogOpen(true)
  }, [])

  return (
    <>
      <Helmet>
        <title>Categorias Personalizadas | Workflow Canvas</title>
        <meta name="description" content="Crie e gerencie suas próprias categorias para organizar nós do marketplace" />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Categorias Personalizadas</h1>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie suas próprias categorias para organizar nós do marketplace
            </p>
          </div>
          <Button onClick={openDialog} className="flex items-center gap-2" aria-label="Criar nova categoria">
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Nova Categoria
          </Button>
        </div>

        <CategoryList />

        <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleCreateCategory} />
      </div>
    </>
  )
}
