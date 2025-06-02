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
import ServiceLogo from "../../components/ui/service-logo"

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
    logo: "openai",
    status: "not_connected"
  },
  {
    id: "gemini",
    name: "Gemini AI API Key",
    description: "Conecte sua conta Google para usar modelos Gemini",
    category: "ai",
    logo: "google-ads",
    status: "not_connected"
  },
  {
    id: "claude",
    name: "Claude AI API Key",
    description: "Conecte sua conta Anthropic para usar modelos Claude",
    category: "ai",
    logo: "openai",
    status: "not_connected"
  },
  {
    id: "llama",
    name: "LLama AI API Key",
    description: "Conecte sua conta Meta AI para usar modelos LLama",
    category: "ai",
    logo: "facebook-pixel",
    status: "not_connected"
  },
  {
    id: "grok",
    name: "Grok AI API Key",
    description: "Conecte sua conta Grok para usar modelos de IA",
    category: "ai",
    logo: "twitter",
    status: "not_connected"
  },
  {
    id: "tess",
    name: "Tess AI API Key",
    description: "Conecte sua conta Tess para usar modelos de IA",
    category: "ai",
    logo: "openai",
    status: "not_connected"
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Conecte sua conta Google Analytics para rastreamento",
    category: "analytics",
    logo: "google-analytics",
    status: "not_connected"
  },
  {
    id: "facebook-pixel",
    name: "Pixel Facebook Ads",
    description: "Conecte seu Pixel do Facebook para rastreamento de conversões",
    category: "ads",
    logo: "facebook-pixel",
    status: "not_connected"
  },
  {
    id: "google-ads",
    name: "Pixel Google Ads",
    description: "Conecte seu Pixel do Google Ads para rastreamento de conversões",
    category: "ads",
    logo: "google-ads",
    status: "not_connected"
  },
  {
    id: "tiktok-ads",
    name: "Pixel TikTok Ads",
    description: "Conecte seu Pixel do TikTok para rastreamento de conversões",
    category: "ads",
    logo: "tiktok-ads",
    status: "not_connected"
  },
  {
    id: "social-media",
    name: "Redes Sociais",
    description: "Conecte suas redes sociais para integração",
    category: "social",
    logo: "instagram",
    status: "not_connected"
  }
]

// Cores para as categorias
const categoryColors = {
  ai: "bg-blue-500",
  analytics: "bg-green-500", 
  ads: "bg-orange-500",
  social: "bg-purple-500"
}

// Contadores para as categorias
const categoryCounts = {
  todos: 16,
  ia: 47,
  analytics: 18,
  ads: 19,
  social: 20
}

export default function UserVariablesPage() {
  const [variables, setVariables] = useState<UserVariable[]>(initialVariables)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedVariable, setSelectedVariable] = useState<UserVariable | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [apiKeyValue, setApiKeyValue] = useState("")

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
    setIsDialogOpen(true)
  }

  // Salvar a conexão
  const handleSaveConnection = () => {
    if (!selectedVariable) return

    // Verificar se a chave API foi preenchida
    if (!apiKeyValue.trim()) {
      toast.error("A chave API é obrigatória")
      return
    }

    // Atualizar o estado da variável
    setVariables(prev => prev.map(v => {
      if (v.id === selectedVariable.id) {
        return {
          ...v,
          status: "connected",
          value: apiKeyValue
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
              className="pl-10 border-2 border-orange-200 focus:border-orange-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`relative ${selectedCategory === "all" ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-50"}`}
            >
              Todos
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                {categoryCounts.todos}
              </Badge>
            </Button>
            <Button
              variant={selectedCategory === "ai" ? "default" : "outline"}
              onClick={() => setSelectedCategory("ai")}
              className={`relative ${selectedCategory === "ai" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
            >
              IA
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                {categoryCounts.ia}
              </Badge>
            </Button>
            <Button
              variant={selectedCategory === "analytics" ? "default" : "outline"}
              onClick={() => setSelectedCategory("analytics")}
              className={`relative ${selectedCategory === "analytics" ? "bg-pink-600 hover:bg-pink-700" : "hover:bg-pink-50"}`}
            >
              Analytics
              <Badge variant="secondary" className="ml-2 bg-pink-100 text-pink-800">
                {categoryCounts.analytics}
              </Badge>
            </Button>
            <Button
              variant={selectedCategory === "ads" ? "default" : "outline"}
              onClick={() => setSelectedCategory("ads")}
              className={`relative ${selectedCategory === "ads" ? "bg-blue-700 hover:bg-blue-800" : "hover:bg-blue-50"}`}
            >
              Ads
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                {categoryCounts.ads}
              </Badge>
            </Button>
            <Button
              variant={selectedCategory === "social" ? "default" : "outline"}
              onClick={() => setSelectedCategory("social")}
              className={`relative ${selectedCategory === "social" ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-50"}`}
            >
              Social
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                {categoryCounts.social}
              </Badge>
            </Button>
          </div>
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
                <Card className="overflow-hidden border border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white">
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between p-6">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border">
                          <ServiceLogo service={variable.logo} size={32} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{variable.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{variable.description}</p>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Informações sobre {variable.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="px-6 pb-6 flex items-center justify-between">
                      {variable.status === "connected" ? (
                        <>
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Conectado</span>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDisconnect(variable)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Desconectar
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-gray-500">Não conectado</span>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleConnect(variable)}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Conectar
                          </Button>
                        </>
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConnection}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

