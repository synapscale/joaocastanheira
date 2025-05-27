"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMarketplace } from "@/context/marketplace-context"
import { MarketplaceTemplateDetail } from "@/components/marketplace/marketplace-template-detail"
import { MarketplaceTemplateReviews } from "@/components/marketplace/marketplace-template-reviews"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Info, MessageSquare, Code } from "lucide-react"

/**
 * Página de detalhes de um template específico do marketplace.
 * Exibe informações detalhadas, código e avaliações do template.
 */
export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const {
    currentTemplate,
    currentTemplateReviews,
    isLoading,
    error,
    fetchTemplate,
    fetchTemplateReviews,
    installTemplate,
  } = useMarketplace()

  const id = params.id as string

  // Busca o template e suas avaliações na montagem do componente
  useEffect(() => {
    if (id) {
      fetchTemplate(id)
      fetchTemplateReviews(id)
    }
  }, [id, fetchTemplate, fetchTemplateReviews])

  /**
   * Manipula o clique no botão de voltar.
   * Navega para a página anterior.
   */
  const handleBack = () => {
    router.back()
  }

  /**
   * Manipula a instalação do template.
   * Chama o método de instalação do contexto.
   */
  const handleInstall = async () => {
    if (currentTemplate) {
      await installTemplate(currentTemplate.id)
    }
  }

  // Estado de carregamento
  if (isLoading && !currentTemplate) {
    return (
      <div className="container mx-auto py-6">
        <div
          className="flex flex-col gap-6 items-center justify-center min-h-[60vh]"
          aria-busy="true"
          aria-label="Carregando detalhes do template"
        >
          <div className="w-full max-w-3xl h-96 rounded-lg bg-muted animate-pulse" role="status" />
        </div>
      </div>
    )
  }

  // Estado de erro ou template não encontrado
  if (error || !currentTemplate) {
    return (
      <div className="container mx-auto py-6">
        <div
          className="flex flex-col gap-6 items-center justify-center min-h-[60vh]"
          role="alert"
          aria-live="assertive"
        >
          <h2 className="text-2xl font-bold">Template não encontrado</h2>
          <p className="text-muted-foreground">{error || "O template solicitado não pôde ser encontrado."}</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Voltar ao Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="w-fit flex items-center gap-2"
          aria-label="Voltar ao marketplace"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar ao Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Info className="h-4 w-4" aria-hidden="true" />
                  Detalhes
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" aria-hidden="true" />
                  Código
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Avaliações ({currentTemplateReviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <MarketplaceTemplateDetail template={currentTemplate} />
              </TabsContent>

              <TabsContent value="code">
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-medium">Código do Template</h3>
                  <Separator />
                  <pre className="p-4 bg-muted rounded-md overflow-auto text-sm" aria-label="Código JSON do template">
                    {JSON.stringify(currentTemplate, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <MarketplaceTemplateReviews reviews={currentTemplateReviews} templateId={currentTemplate.id} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">Informações do Template</h3>
              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Autor</span>
                  <span className="font-medium">{currentTemplate.author.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versão</span>
                  <span>{currentTemplate.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Licença</span>
                  <span>{currentTemplate.license}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Downloads</span>
                  <span>{currentTemplate.downloads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Classificação</span>
                  <span>
                    {currentTemplate.rating.toFixed(1)} ({currentTemplate.ratingCount} avaliações)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publicado</span>
                  <span>{new Date(currentTemplate.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado</span>
                  <span>{new Date(currentTemplate.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Separator />

              <Button onClick={handleInstall} className="w-full" aria-label="Instalar este template">
                Instalar Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
