"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PublishSkillForm, type CollectionFormData } from "@/components/marketplace/publish-skill-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NewCollectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: CollectionFormData) => {
    setIsSubmitting(true)
    try {
      // Simular criação da coleção
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Sucesso!",
        description: "Coleção criada com sucesso.",
      })

      // Redirecionar para a página de coleções
      router.push("/marketplace/collections")
    } catch (error) {
      console.error("Erro ao criar coleção:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a coleção. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nova Coleção</h1>
            <p className="text-muted-foreground">Crie uma nova coleção para organizar seus skills e nodes</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <PublishSkillForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            mode="collection"
            title="Criar Nova Coleção"
            description="Preencha as informações abaixo para criar sua coleção"
          />
        </div>
      </div>
    </div>
  )
}
