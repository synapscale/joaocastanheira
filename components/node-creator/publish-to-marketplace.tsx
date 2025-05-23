"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Check } from "lucide-react"
import type { NodeDefinition } from "@/types/node-definition"

interface PublishToMarketplaceProps {
  nodeDefinition: NodeDefinition
}

export function PublishToMarketplace({ nodeDefinition }: PublishToMarketplaceProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)

  // Campos adicionais para publicação
  const [additionalTags, setAdditionalTags] = useState("")
  const [publishNotes, setPublishNotes] = useState("")

  const handlePublish = async () => {
    try {
      setIsPublishing(true)

      // Em um app real, isso enviaria os dados para o servidor
      // Simular um atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setPublishSuccess(true)

      toast({
        title: "Nó publicado com sucesso",
        description: "Seu nó foi enviado para o marketplace e estará disponível após revisão.",
      })

      // Resetar o estado após alguns segundos
      setTimeout(() => {
        setIsOpen(false)
        setPublishSuccess(false)
        setIsPublishing(false)
      }, 3000)
    } catch (error) {
      toast({
        title: "Erro ao publicar nó",
        description: "Ocorreu um erro ao publicar seu nó. Tente novamente mais tarde.",
        variant: "destructive",
      })
      setIsPublishing(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Upload className="h-4 w-4" />
        Publicar no Marketplace
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Publicar no Marketplace</DialogTitle>
            <DialogDescription>
              Compartilhe seu nó com a comunidade. Após a publicação, ele estará disponível para todos os usuários.
            </DialogDescription>
          </DialogHeader>

          {publishSuccess ? (
            <div className="py-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nó publicado com sucesso!</h3>
              <p className="text-muted-foreground">
                Seu nó foi enviado para revisão e estará disponível no marketplace em breve.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="node-name">Nome do Nó</Label>
                <Input id="node-name" value={nodeDefinition.name} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-description">Descrição</Label>
                <Textarea id="node-description" value={nodeDefinition.description} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-tags">Tags Adicionais (separadas por vírgula)</Label>
                <Input
                  id="additional-tags"
                  placeholder="api, transformação, dados, etc."
                  value={additionalTags}
                  onChange={(e) => setAdditionalTags(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publish-notes">Notas de Publicação</Label>
                <Textarea
                  id="publish-notes"
                  placeholder="Descreva as principais funcionalidades e casos de uso do seu nó"
                  value={publishNotes}
                  onChange={(e) => setPublishNotes(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handlePublish} disabled={isPublishing}>
                  {isPublishing ? "Publicando..." : "Publicar Nó"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
