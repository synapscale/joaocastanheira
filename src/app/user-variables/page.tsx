"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Info, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

// Tipos para as variáveis do usuário
type VariableCategory = "ai" | "analytics" | "ads" | "social"
type VariableStatus = "connected" | "not_connected"

interface UserVariable {
  id: string
  name: string
  description: string
  category: VariableCategory
  logo: string
  status: VariableStatus
  value?: string
}

// Dados de exemplo para as variáveis
const initialVariables: UserVariable[] = [
  {
    id: "openai",
    name: "OpenAI API Key",
    description: "Conecte sua conta OpenAI para usar GPT-4 e outros modelos",
    category: "ai",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "gemini",
    name: "Gemini AI API Key",
    description: "Conecte sua conta Google para usar modelos Gemini",
    category: "ai",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "claude",
    name: "Claude AI API Key",
    description: "Conecte sua conta Anthropic para usar modelos Claude",
    category: "ai",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "llama",
    name: "LLama AI API Key",
    description: "Conecte sua conta Meta AI para usar modelos LLama",
    category: "ai",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "grok",
    name: "Grok AI API Key",
    description: "Conecte sua conta Grok para usar modelos de IA",
    category: "ai",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "tess",
    name: "Tess AI API Key",
    description: "Conecte sua conta Tess para usar modelos de IA",
    category: "ai",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Conecte sua conta Google Analytics para rastreamento",
    category: "analytics",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "facebook-pixel",
    name: "Pixel Facebook Ads",
    description: "Conecte seu Pixel do Facebook para rastreamento de conversões",
    category: "ads",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "google-ads",
    name: "Pixel Google Ads",
    description: "Conecte seu Pixel do Google Ads para rastreamento de conversões",
    category: "ads",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "tiktok-ads",
    name: "Pixel TikTok Ads",
    description: "Conecte seu Pixel do TikTok para rastreamento de conversões",
    category: "ads",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  },
  {
    id: "social-media",
    name: "Redes Sociais",
    description: "Conecte suas redes sociais para integração",
    category: "social",
    logo: "/placeholder-logo.svg",
    status: "not_connected"
  }
]

export default function UserVariablesPage() {
  const [variables, setVariables] = useState<UserVariable[]>(initialVariables)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedVariable, setSelectedVariable] = useState<UserVariable | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [apiKeyValue, setApiKeyValue] = useState("")
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: ""
  })

  // Filtrar variáveis com base na pesquisa e categoria
  const filteredVariables = variables.filter(variable => {
    const matchesSearch = variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         variable.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || variable.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Manipular a conexão de uma variável
  const handleConnect = (variable: UserVariable) => {
    setSelectedVariable(variable)
    setApiKeyValue("")
    setSocialLinks({
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      tiktok: ""
    })
    setIsDialogOpen(true)
  }

  // Salvar a conexão
  const handleSaveConnection = () => {
    if (!selectedVariable) return

    // Validar entrada
    if (selectedVariable.id === "social-media") {
      // Verificar se pelo menos uma rede social foi preenchida
      const hasAnySocialLink = Object.values(socialLinks).some(link => link.trim() !== "")
      if (!hasAnySocialLink) {
        toast.error("Adicione pelo menos uma rede social")
        return
      }
    } else {
      // Verificar se a chave API foi preenchida
      if (!apiKeyValue.trim()) {
        toast.error("A chave API é obrigatória")
        return
      }
    }

    // Atualizar o estado da variável
    setVariables(prev => prev.map(v => {
      if (v.id === selectedVariable.id) {
        return {
          ...v,
          status: "connected",
          value: selectedVariable.id === "social-media" 
            ? JSON.stringify(socialLinks) 
            : apiKeyValue
        }
      }
      return v
    }))

    // Fechar o diálogo e mostrar mensagem de sucesso
    setIsDialogOpen(false)
    toast.success(`${selectedVariable.name} conectado com sucesso!`)
  }

  // Desconectar uma variável
  const handleDisconnect = (variable: UserVariable) => {
    setVariables(prev => prev.map(v => {
      if (v.id === variable.id) {
        return {
          ...v,
          status: "not_connected",
          value: undefined
        }
      }
      return v
    }))
    toast.success(`${variable.name} desconectado com sucesso!`)
  }

  // Animações para os cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Variáveis do Usuário</h1>
          <p className="text-muted-foreground">
            Conecte suas APIs e serviços externos para integração com o sistema
          </p>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar variáveis..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-5 w-full md:w-auto">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="ai">IA</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="ads">Ads</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVariables.length > 0 ? (
            filteredVariables.map((variable, index) => (
              <motion.div
                key={variable.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className="overflow-hidden border border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <img 
                            src={variable.logo} 
                            alt={variable.name} 
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/image-error.png"
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{variable.name}</h3>
                          <p className="text-sm text-muted-foreground">{variable.description}</p>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Informações sobre {variable.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="p-6 flex items-center justify-between">
                      <Badge 
                        variant={variable.status === "connected" ? "success" : "outline"}
                        className={variable.status === "connected" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800" 
                          : ""}
                      >
                        {variable.status === "connected" ? (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Conectado
                          </span>
                        ) : "Não conectado"}
                      </Badge>
                      {variable.status === "connected" ? (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDisconnect(variable)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Desconectar
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleConnect(variable)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Conectar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Nenhuma variável encontrada</h3>
              <p className="text-muted-foreground mt-1">
                Tente ajustar sua pesquisa ou filtros para encontrar o que procura.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Diálogo para conectar variável */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar {selectedVariable?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedVariable?.id === "social-media" ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/seu-perfil"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/seu-perfil"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/seu-perfil"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/seu-perfil"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  placeholder="https://youtube.com/c/seu-canal"
                  value={socialLinks.youtube}
                  onChange={(e) => setSocialLinks({...socialLinks, youtube: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  placeholder="https://tiktok.com/@seu-perfil"
                  value={socialLinks.tiktok}
                  onChange={(e) => setSocialLinks({...socialLinks, tiktok: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="api-key">Chave API</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Insira sua chave API"
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Sua chave API é armazenada de forma segura e nunca compartilhada.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveConnection}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
