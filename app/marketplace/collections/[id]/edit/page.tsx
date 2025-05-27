"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { PublishSkillForm, type CollectionFormData } from "@/components/marketplace/publish-skill-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EditCollectionPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [initialData, setInitialData] = useState<Partial<CollectionFormData>>({})

  // Carregar dados da coleção
  useEffect(() => {
    const loadCollection = async () => {
      try {
        // Simular carregamento de dados
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Dados simulados
        setInitialData({
          name: "Minha Coleção de IA",
          description: "Uma coleção de ferramentas de inteligência artificial para automação",
          tags: ["ai", "automation", "productivity"],
          visibility: "public",
          category: "ai",
          imageUrl: "/ai-assistant-collection.png",
        })
      } catch (error) {
        console.error("Erro ao carregar coleção:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da coleção.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCollection()
  }, [params.id, toast])

  const handleSubmit = async (formData: CollectionFormData) => {
    setIsSubmitting(true)
    try {
      // Simular atualização da coleção
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Sucesso!",
        description: "Coleção atualizada com sucesso.",
      })

      // Redirecionar para a página de coleções
      router.push("/marketplace/collections")
    } catch (error) {
      console.error("Erro ao atualizar coleção:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a coleção. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando coleção...</span>
        </div>
      </div>
    )
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
            <h1 className="text-2xl font-bold">Editar Coleção</h1>
            <p className="text-muted-foreground">Atualize as informações da sua coleção</p>
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
            title="Editar Coleção"
            description="Atualize as informações da sua coleção"
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  )
}
