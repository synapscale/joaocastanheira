"use client"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Package, Eye, Edit, CheckCircle, XCircle, Clock, Download, Star, TrendingUp } from "lucide-react"
import { SKILL_CATEGORIES } from "@/config/node-system-config"

interface PublishableItem {
  id: string
  name: string
  description: string
  type: "skill" | "node"
  category: string
  version: string
  status: "draft" | "published" | "pending" | "rejected"
  createdAt: string
  updatedAt: string
  stats?: {
    downloads: number
    stars: number
    views: number
  }
}

interface PublishFormData {
  name: string
  description: string
  category: string
  tags: string[]
  license: string
  pricing: "free" | "paid" | "freemium"
  price?: number
  isPublic: boolean
  changelog: string
}

export function PublishManager() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("my-items")
  const [selectedItem, setSelectedItem] = useState<PublishableItem | null>(null)
  const [showPublishForm, setShowPublishForm] = useState(false)
  const [publishForm, setPublishForm] = useState<PublishFormData>({
    name: "",
    description: "",
    category: "",
    tags: [],
    license: "MIT",
    pricing: "free",
    isPublic: true,
    changelog: "",
  })

  // Mock data dos itens do usuário
  const myItems: PublishableItem[] = [
    {
      id: "my-skill-1",
      name: "Custom HTTP Handler",
      description: "Skill personalizada para requisições HTTP com retry automático",
      type: "skill",
      category: "data-input",
      version: "1.0.0",
      status: "published",
      createdAt: "2024-03-01",
      updatedAt: "2024-03-10",
      stats: {
        downloads: 234,
        stars: 18,
        views: 567,
      },
    },
    {
      id: "my-node-1",
      name: "Data Processor Pro",
      description: "Node completo para processamento de dados",
      type: "node",
      category: "data-transformation",
      version: "2.1.0",
      status: "pending",
      createdAt: "2024-02-15",
      updatedAt: "2024-03-08",
    },
    {
      id: "my-skill-2",
      name: "AI Text Analyzer",
      description: "Análise de texto com IA",
      type: "skill",
      category: "ai",
      version: "1.5.0",
      status: "draft",
      createdAt: "2024-03-05",
      updatedAt: "2024-03-12",
    },
  ]

  const handlePublish = useCallback(
    async (item: PublishableItem) => {
      try {
        // Simular publicação
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
          title: "Publicado com sucesso!",
          description: `${item.name} foi enviado para revisão`,
        })
      } catch (error) {
        toast({
          title: "Erro na publicação",
          description: "Não foi possível publicar o item",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleUnpublish = useCallback(
    async (item: PublishableItem) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        toast({
          title: "Item despublicado",
          description: `${item.name} foi removido do marketplace`,
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível despublicar o item",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Edit className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Publicado"
      case "pending":
        return "Pendente"
      case "rejected":
        return "Rejeitado"
      default:
        return "Rascunho"
    }
  }

  const renderMyItems = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meus Itens</h2>
        <Button onClick={() => setShowPublishForm(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Publicar Novo Item
        </Button>
      </div>

      <div className="grid gap-4">
        {myItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant="outline">{item.type}</Badge>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      <span className="text-sm">{getStatusText(item.status)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>v{item.version}</span>
                    <span>Categoria: {SKILL_CATEGORIES[item.category as keyof typeof SKILL_CATEGORIES]?.name}</span>
                    <span>Atualizado: {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>

                  {item.stats && (
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{item.stats.downloads}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>{item.stats.stars}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{item.stats.views}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  {item.status === "published" ? (
                    <Button variant="outline" size="sm" onClick={() => handleUnpublish(item)}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Despublicar
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handlePublish(item)}>
                      <Upload className="w-4 h-4 mr-1" />
                      Publicar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics</h2>

      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Itens Publicados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">234</div>
            <div className="text-sm text-muted-foreground">Total Downloads</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">18</div>
            <div className="text-sm text-muted-foreground">Total Estrelas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">4.6</div>
            <div className="text-sm text-muted-foreground">Avaliação Média</div>
          </CardContent>
        </Card>
      </div>

      {/* Itens mais populares */}
      <Card>
        <CardHeader>
          <CardTitle>Itens Mais Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myItems
              .filter((item) => item.stats)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.type}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{item.stats?.downloads}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{item.stats?.stars}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Publicações</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my-items">Meus Itens</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <Tabs value={activeTab}>
          <TabsContent value="my-items">{renderMyItems()}</TabsContent>

          <TabsContent value="analytics">{renderAnalytics()}</TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Configurações de Publicação</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Perfil Público</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="display-name">Nome de Exibição</Label>
                    <Input id="display-name" placeholder="Seu nome público" />
                  </div>
                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea id="bio" placeholder="Conte sobre você e suas skills..." />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="public-profile" />
                    <Label htmlFor="public-profile">Perfil público visível</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Notificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="email-downloads" />
                    <Label htmlFor="email-downloads">Notificar por email sobre downloads</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="email-reviews" />
                    <Label htmlFor="email-reviews">Notificar sobre avaliações</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="email-updates" />
                    <Label htmlFor="email-updates">Notificar sobre atualizações do marketplace</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
