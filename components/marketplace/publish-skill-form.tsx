"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagInput } from "@/components/ui/tag-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"

/**
 * CollectionFormData - Interface for collection form data
 */
export interface CollectionFormData {
  name: string
  description: string
  tags: string[]
  visibility: "public" | "private" | "unlisted"
  category?: string
  imageUrl?: string
}

/**
 * PublishSkillFormProps - Interface for the PublishSkillForm component props
 */
interface PublishSkillFormProps {
  onSubmit: (formData: CollectionFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  mode?: "skill" | "collection"
  title?: string
  description?: string
  initialData?: Partial<CollectionFormData>
}

/**
 * PublishSkillForm - A form for publishing skills or creating collections
 */
export function PublishSkillForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "collection",
  title = "Criar Nova Coleção",
  description = "Preencha as informações abaixo para criar sua coleção",
  initialData = {},
}: PublishSkillFormProps) {
  // Form state
  const [formData, setFormData] = useState<CollectionFormData>({
    name: initialData.name || "",
    description: initialData.description || "",
    tags: initialData.tags || [],
    visibility: initialData.visibility || "public",
    category: initialData.category || "",
    imageUrl: initialData.imageUrl || "",
  })

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle form field changes
  const handleChange = (field: keyof CollectionFormData, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when field is changed
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "Pelo menos uma tag é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={mode === "collection" ? "Nome da coleção" : "Nome do skill"}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={mode === "collection" ? "Descreva sua coleção" : "Descreva seu skill"}
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>
              Tags <span className="text-red-500">*</span>
            </Label>
            <TagInput
              value={formData.tags}
              onChange={(tags) => handleChange("tags", tags)}
              placeholder="Adicione tags relevantes"
              className={errors.tags ? "border-red-500" : ""}
            />
            {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
          </div>

          {/* Visibilidade */}
          <div className="space-y-2">
            <Label>Visibilidade</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: "public" | "private" | "unlisted") => handleChange("visibility", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="unlisted">Não listado</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai">Inteligência Artificial</SelectItem>
                <SelectItem value="automation">Automação</SelectItem>
                <SelectItem value="data">Processamento de Dados</SelectItem>
                <SelectItem value="api">Integração de APIs</SelectItem>
                <SelectItem value="productivity">Produtividade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* URL da Imagem */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL da Imagem</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "collection" ? "Criar Coleção" : "Publicar Skill"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
