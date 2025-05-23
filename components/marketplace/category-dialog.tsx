"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CustomCategory, CreateCustomCategoryInput, UpdateCustomCategoryInput } from "@/types/custom-category"
import { ColorPicker } from "./color-picker"
import { IconPicker } from "./icon-picker"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: CustomCategory
  onSubmit: (data: CreateCustomCategoryInput | UpdateCustomCategoryInput) => void
}

/**
 * Diálogo para criar ou editar uma categoria personalizada.
 */
export function CategoryDialog({ open, onOpenChange, category, onSubmit }: CategoryDialogProps) {
  const isEditing = !!category?.id
  const [name, setName] = useState(category?.name || "")
  const [description, setDescription] = useState(category?.description || "")
  const [color, setColor] = useState(category?.color || "#3b82f6")
  const [icon, setIcon] = useState(category?.icon || "📁")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Atualizar o estado quando o category prop mudar
  useEffect(() => {
    if (category) {
      setName(category.name || "")
      setDescription(category.description || "")
      setColor(category.color || "#3b82f6")
      setIcon(category.icon || "📁")
    }
  }, [category])

  // Validar o formulário
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "O nome é obrigatório"
    }

    if (!color) {
      newErrors.color = "A cor é obrigatória"
    } else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      newErrors.color = "Formato de cor inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, color])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setIsSubmitting(true)

      try {
        const data = {
          ...(isEditing && { id: category!.id }),
          name,
          description,
          color,
          icon,
        }

        await onSubmit(data as any)
        resetForm()
      } catch (error) {
        console.error("Error submitting category:", error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [isEditing, category, name, description, color, icon, onSubmit, validateForm],
  )

  const resetForm = useCallback(() => {
    if (!isEditing) {
      setName("")
      setDescription("")
      setColor("#3b82f6")
      setIcon("📁")
      setErrors({})
    }
  }, [isEditing])

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value)
      if (errors.name) {
        setErrors((prev) => ({ ...prev, name: "" }))
      }
    },
    [errors.name],
  )

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
  }, [])

  const handleColorChange = useCallback(
    (newColor: string) => {
      setColor(newColor)
      if (errors.color) {
        setErrors((prev) => ({ ...prev, color: "" }))
      }
    },
    [errors.color],
  )

  const handleIconChange = useCallback((newIcon: string) => {
    setIcon(newIcon)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize os detalhes da categoria personalizada."
                : "Crie uma nova categoria personalizada para organizar seus nós."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Nome
              </Label>
              <div className="col-span-3">
                <Input
                  id="category-name"
                  value={name}
                  onChange={handleNameChange}
                  className={errors.name ? "border-red-500" : ""}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  required
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-xs mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="category-description" className="text-right pt-2">
                Descrição
              </Label>
              <Textarea
                id="category-description"
                value={description}
                onChange={handleDescriptionChange}
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Cor</Label>
              <div className="col-span-3">
                <ColorPicker
                  color={color}
                  onChange={handleColorChange}
                  hasError={!!errors.color}
                  errorMessage={errors.color}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Ícone</Label>
              <div className="col-span-3">
                <IconPicker icon={icon} onChange={handleIconChange} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
