"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UrlInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddUrl: (url: { id: string; label: string; url: string }) => void
}

export function UrlInputDialog({
  open,
  onOpenChange,
  onAddUrl
}: UrlInputDialogProps) {
  const [url, setUrl] = useState("")
  const [label, setLabel] = useState("")
  const [error, setError] = useState("")

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!url.trim()) {
      setError("URL é obrigatória")
      return
    }

    if (!validateUrl(url)) {
      setError("URL inválida. Use formato: https://exemplo.com")
      return
    }

    if (!label.trim()) {
      setError("Nome/descrição é obrigatório")
      return
    }

    // Gerar ID único
    const id = `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    onAddUrl({
      id,
      label: label.trim(),
      url: url.trim()
    })

    // Limpar formulário
    setUrl("")
    setLabel("")
    setError("")
    onOpenChange(false)
  }

  const handleCancel = () => {
    setUrl("")
    setLabel("")
    setError("")
    onOpenChange(false)
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    setError("")
    
    // Auto-gerar label se estiver vazio
    if (!label && value) {
      try {
        const urlObj = new URL(value)
        setLabel(urlObj.hostname)
      } catch {
        // Ignore se URL ainda não estiver válida
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Adicionar URL Relacionada
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo URL */}
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={error && !url ? "border-destructive" : ""}
            />
          </div>

          {/* Campo Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Nome/Descrição *</Label>
            <Input
              id="label"
              placeholder="Ex: Documentação da API"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={error && !label ? "border-destructive" : ""}
            />
          </div>

          {/* Mensagem de erro */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
            >
              {error}
            </motion.div>
          )}

          {/* Preview da URL */}
          {url && validateUrl(url) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-accent rounded-md"
            >
              <p className="text-sm text-muted-foreground">Preview:</p>
              <div className="flex items-center gap-2 mt-1">
                <Link className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{label || new URL(url).hostname}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">{url}</p>
            </motion.div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!url || !label}>
              Adicionar URL
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 