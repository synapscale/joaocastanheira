"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTemplates } from "@/context/template-context"
import { useMarketplace } from "@/context/marketplace-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Check } from "lucide-react"
import type { NodeTemplate } from "@/types/node-template"

/**
 * Props para o componente PublishTemplateDialog.
 */
interface PublishTemplateDialogProps {
  /** Template a ser publicado (opcional) */
  template?: NodeTemplate
  /** Elemento de gatilho personalizado (opcional) */
  trigger?: React.ReactNode
}

/**
 * Componente que exibe um diálogo para publicar um template no marketplace.
 * Permite selecionar um template, definir licença, preço e aceitar termos.
 *
 * @param props - Propriedades do componente
 * @param props.template - Template a ser publicado (opcional)
 * @param props.trigger - Elemento de gatilho personalizado (opcional)
 */
export function PublishTemplateDialog({ template, trigger }: PublishTemplateDialogProps) {
  const router = useRouter()
  const { templates, categories } = useTemplates()
  const { publishTemplate } = useMarketplace()

  // Estados do diálogo
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>(template?.id || "")
  const [license, setLicense] = useState("MIT")
  const [pricing, setPricing] = useState("free")
  const [price, setPrice] = useState("0")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  /**
   * Manipula a publicação do template.
   * Valida, publica e redireciona após o sucesso.
   */
  const handlePublish = async () => {
    if (!selectedTemplate || !termsAccepted) return

    setIsPublishing(true)
    try {
      const templateToPublish = templates.find((t) => t.id === selectedTemplate)
      if (!templateToPublish) return

      // Em uma aplicação real, obteríamos o ID do usuário da autenticação
      const userId = "user-10"
      await publishTemplate(templateToPublish, userId)

      setIsSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setIsSuccess(false)
        router.push("/marketplace/templates")
      }, 2000)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Publicar no Marketplace
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Publicar Template no Marketplace</DialogTitle>
          <DialogDescription>
            Compartilhe seu template com a comunidade. Após publicado, outros usuários poderão descobrir e usar seu
            template.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center" role="status" aria-live="polite">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium mb-2">Template Publicado!</h3>
            <p className="text-muted-foreground">Seu template foi publicado com sucesso no marketplace.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              {!template && (
                <div className="grid gap-2">
                  <Label htmlFor="template-select" id="template-label">
                    Selecionar Template
                  </Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                    aria-labelledby="template-label"
                    aria-required="true"
                  >
                    <SelectTrigger id="template-select">
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="license-select" id="license-label">
                  Licença
                </Label>
                <Select value={license} onValueChange={setLicense} aria-labelledby="license-label" aria-required="true">
                  <SelectTrigger id="license-select">
                    <SelectValue placeholder="Selecione uma licença" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIT">Licença MIT</SelectItem>
                    <SelectItem value="Apache-2.0">Licença Apache 2.0</SelectItem>
                    <SelectItem value="GPL-3.0">GNU GPL v3</SelectItem>
                    <SelectItem value="Commercial">Licença Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pricing-select" id="pricing-label">
                  Preço
                </Label>
                <Select value={pricing} onValueChange={setPricing} aria-labelledby="pricing-label" aria-required="true">
                  <SelectTrigger id="pricing-select">
                    <SelectValue placeholder="Selecione o tipo de preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="subscription">Assinatura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pricing !== "free" && (
                <div className="grid gap-2">
                  <Label htmlFor="price-input" id="price-label">
                    Preço (USD)
                  </Label>
                  <Input
                    id="price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    aria-labelledby="price-label"
                    aria-required="true"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="terms-checkbox"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  aria-required="true"
                />
                <label htmlFor="terms-checkbox" className="text-sm text-muted-foreground" id="terms-label">
                  Concordo com os termos e condições do marketplace
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isPublishing}>
                Cancelar
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!selectedTemplate || !termsAccepted || isPublishing}
                aria-busy={isPublishing}
              >
                {isPublishing ? "Publicando..." : "Publicar Template"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
