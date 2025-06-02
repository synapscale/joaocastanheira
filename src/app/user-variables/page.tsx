"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Info, Check, X, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import ServiceLogo from "@/components/ui/service-logo"

// Tipos para as variáveis do usuário
type VariableCategory = "ai" | "analytics" | "ads" | "social"
type VariableStatus = "connected" | "not_connected"

interface UserVariable {
  id: string
  name: string
  description: string
  category: VariableCategory
  logoService: string
  status: VariableStatus
  value?: string
  color?: string
  bgColor?: string
  subtitle?: string
}

// Dados de exemplo para as variáveis com logos e cores reais
const initialVariables: UserVariable[] = [
  {
    id: "openai",
    name: "OpenAI API Key",
    description: "Conecte sua conta OpenAI para usar GPT-4 e outros modelos",
    category: "ai",
    logoService: "openai",
    status: "not_connected",
    color: "#10A37F",
    bgColor: "#F0FDF4"
  },
  {
    id: "gemini",
    name: "Gemini AI API Key", 
    description: "Conecte sua conta Google para usar modelos Gemini",
    category: "ai",
    logoService: "google-ads",
    status: "not_connected",
    color: "#4285F4",
    bgColor: "#F0F7FF"
  },
  {
    id: "claude",
    name: "Claude AI API Key",
    description: "Conecte sua conta Anthropic para usar modelos Claude",
    category: "ai",
    logoService: "openai",
    status: "not_connected",
    color: "#D97706",
    bgColor: "#FFFBEB"
  },
  {
    id: "llama",
    name: "LLama AI API Key",
    description: "Conecte sua conta Meta AI para usar modelos LLama",
    category: "ai",
    logoService: "facebook-pixel",
    status: "not_connected",
    color: "#1877F2",
    bgColor: "#F0F7FF"
  },
  {
    id: "grok",
    name: "Grok AI API Key",
    description: "Conecte sua conta Grok para usar modelos de IA",
    category: "ai",
    logoService: "twitter",
    status: "not_connected",
    color: "#1DA1F2",
    bgColor: "#F0F9FF"
  },
  {
    id: "tess",
    name: "Tess AI API Key",
    description: "Conecte sua conta Tess para usar modelos de IA",
    category: "ai",
    logoService: "openai",
    status: "not_connected",
    color: "#7C3AED",
    bgColor: "#F5F3FF"
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Conecte sua conta Google Analytics para rastreamento",
    subtitle: "App + Web",
    category: "analytics",
    logoService: "google-analytics",
    status: "not_connected",
    color: "#FF6D01",
    bgColor: "#FFF7ED"
  },
  {
    id: "facebook-pixel",
    name: "Pixel Facebook Ads",
    description: "Conecte seu Pixel do Facebook para rastreamento de conversões",
    category: "ads",
    logoService: "facebook-pixel",
    status: "not_connected",
    color: "#1877F2",
    bgColor: "#F0F7FF"
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Conecte sua conta Google Ads para campanhas publicitárias",
    category: "ads",
    logoService: "google-ads",
    status: "connected",
    color: "#4285F4",
    bgColor: "#E8F5E8",
    value: "sk-gads-***************"
  },
  {
    id: "tiktok-ads",
    name: "Pixel TikTok Ads",
    description: "Conecte seu Pixel do TikTok para rastreamento de conversões",
    category: "ads",
    logoService: "tiktok-ads",
    status: "not_connected",
    color: "#000000",
    bgColor: "#F9FAFB"
  },
  {
    id: "social-media",
    name: "Redes Sociais",
    description: "Conecte suas redes sociais para integração",
    category: "social",
    logoService: "instagram",
    status: "not_connected",
    color: "#6366F1",
    bgColor: "#F0F7FF"
  },
  {
    id: "bing-ads",
    name: "Bing Ads",
    description: "Conecte sua conta Microsoft Bing Ads",
    category: "ads",
    logoService: "bing-ads",
    status: "not_connected",
    color: "#00BCF2",
    bgColor: "#F0F9FF"
  },
  {
    id: "criteo",
    name: "Criteo",
    description: "Conecte sua conta Criteo para campanhas de retargeting",
    category: "ads",
    logoService: "criteo",
    status: "not_connected",
    color: "#FF6900",
    bgColor: "#FFF7ED"
  },
  {
    id: "funnelytics",
    name: "Funnelytics",
    description: "Conecte sua conta Funnelytics para análise de funis",
    category: "analytics",
    logoService: "funnelytics",
    status: "not_connected",
    color: "#2196F3",
    bgColor: "#F0F7FF"
  },
  {
    id: "infusionsoft",
    name: "Infusionsoft",
    description: "Conecte sua conta Infusionsoft para automação",
    category: "analytics",
    logoService: "infusionsoft",
    status: "not_connected",
    color: "#4CAF50",
    bgColor: "#F0FDF4"
  },
  {
    id: "kwai",
    name: "Kwai",
    description: "Conecte sua conta Kwai para campanhas",
    category: "ads",
    logoService: "kwai",
    status: "not_connected",
    color: "#FF6B35",
    bgColor: "#FFF7ED"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Conecte sua conta LinkedIn para campanhas B2B",
    category: "social",
    logoService: "linkedin",
    status: "not_connected",
    color: "#0A66C2",
    bgColor: "#F0F7FF"
  },
  {
    id: "outbrain",
    name: "Outbrain",
    description: "Conecte sua conta Outbrain para conteúdo nativo",
    category: "ads",
    logoService: "outbrain",
    status: "not_connected",
    color: "#FF6900",
    bgColor: "#FFF7ED"
  },
  {
    id: "pinterest",
    name: "Pinterest",
    description: "Conecte sua conta Pinterest para campanhas visuais",
    category: "social",
    logoService: "pinterest",
    status: "not_connected",
    color: "#BD081C",
    bgColor: "#FDF2F8"
  },
  {
    id: "taboola",
    name: "Taboola",
    description: "Conecte sua conta Taboola para descoberta de conteúdo",
    category: "ads",
    logoService: "taboola",
    status: "not_connected",
    color: "#1565C0",
    bgColor: "#F0F7FF"
  },
  {
    id: "twitter",
    name: "Twitter",
    description: "Conecte sua conta Twitter para campanhas sociais",
    category: "social",
    logoService: "twitter",
    status: "not_connected",
    color: "#1DA1F2",
    bgColor: "#F0F9FF"
  },
  {
    id: "webinarjam",
    name: "WebinarJam",
    description: "Conecte sua conta WebinarJam para webinars",
    category: "analytics",
    logoService: "webinarjam",
    status: "not_connected",
    color: "#D32F2F",
    bgColor: "#FDF2F8"
  },
  {
    id: "wicked-reports",
    name: "Wicked Reports",
    description: "Conecte sua conta Wicked Reports para análise avançada",
    category: "analytics",
    logoService: "wicked-reports",
    status: "not_connected",
    color: "#FF5722",
    bgColor: "#FFF7ED"
  },
  {
    id: "woopra",
    name: "Woopra",
    description: "Conecte sua conta Woopra para análise de comportamento",
    category: "analytics",
    logoService: "woopra",
    status: "not_connected",
    color: "#000000",
    bgColor: "#F9FAFB"
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
            : apiKeyValue,
          bgColor: "#E8F5E8" // Verde claro para conectado
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
          value: undefined,
          bgColor: v.category === "ai" ? "#F0FDF4" : 
                   v.category === "analytics" ? "#FFF7ED" :
                   v.category === "ads" ? "#F0F7FF" : "#F0F7FF"
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
        delay: i * 0.03,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Variáveis do Usuário</h1>
          <p className="text-muted-foreground text-lg">
            Conecte suas APIs e serviços externos para integração com o sistema
          </p>
        </div>

        <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar variáveis..."
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full lg:w-auto"
          >
            <TabsList className="grid grid-cols-5 w-full lg:w-auto h-11">
              <TabsTrigger value="all" className="text-sm">Todos</TabsTrigger>
              <TabsTrigger value="ai" className="text-sm">IA</TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="ads" className="text-sm">Ads</TabsTrigger>
              <TabsTrigger value="social" className="text-sm">Social</TabsTrigger>
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
                <Card 
                  className={`overflow-hidden border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
                    variable.status === "connected" 
                      ? "border-green-200 bg-green-50/30 shadow-sm" 
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div 
                              className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm border ${
                                variable.status === "connected" 
                                  ? "bg-green-500 border-green-600" 
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <ServiceLogo 
                                service={variable.logoService} 
                                size={28}
                                className={variable.status === "connected" ? "filter brightness-0 invert" : ""}
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-lg text-gray-900 truncate">{variable.name}</h3>
                              {variable.subtitle && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {variable.subtitle}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{variable.description}</p>
                          </div>
                        </div>
                        
                        {variable.status === "connected" && (
                          <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full flex-shrink-0 ml-2">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Badge 
                          variant={variable.status === "connected" ? "default" : "outline"}
                          className={`px-3 py-1 text-sm font-medium ${
                            variable.status === "connected" 
                              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" 
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {variable.status === "connected" ? "Conectado" : "Não conectado"}
                        </Badge>
                        
                        {variable.status === "connected" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(variable)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 px-3"
                          >
                            Desconectar
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleConnect(variable)}
                            className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Conectar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma variável encontrada</h3>
              <p className="text-gray-500 max-w-md">
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
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-gray-200">
                <ServiceLogo service={selectedVariable?.logoService || ""} size={24} />
              </div>
              <span>Conectar {selectedVariable?.name}</span>
            </DialogTitle>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveConnection}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

