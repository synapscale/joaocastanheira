"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  AlertCircle, Info, Plus, RefreshCw, Search, 
  X, Key, ExternalLink, Upload, Download, Copy, Check, 
  ChevronDown, Filter, Tag, Shield, Lock, Eye, EyeOff
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useVariables } from "@/context/variable-context"
import { useAuth } from "@/context/auth-context"
import ServiceLogo from "../../components/ui/service-logo"
import { BrandIdentity } from "../../components/ui/brand-identity"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

// Tipos para as variáveis do usuário baseados na API
type VariableCategory = "ai" | "analytics" | "ads" | "social" | "custom"

// Importamos Variable do contexto, não redefinimos aqui

// Interface para formulário de nova variável
interface NewVariableForm {
  key: string
  value: string
  description: string
  category: string
  is_encrypted: boolean
  is_active: boolean
}

// Templates de serviços de IA para facilitar criação
const serviceTemplates = [
  {
    id: "openai",
    name: "OpenAI API Key",
    key: "OPENAI_API_KEY",
    description: "Conecte sua conta OpenAI para usar GPT-4 e outros modelos",
    category: "ai",
    logo: "openai",
    placeholder: "sk-..."
  },
  {
    id: "anthropic",
    name: "Anthropic Claude API Key",
    key: "ANTHROPIC_API_KEY", 
    description: "Conecte sua conta Anthropic para usar modelos Claude",
    category: "ai",
    logo: "anthropic",
    placeholder: "sk-ant-..."
  },
  {
    id: "google",
    name: "Google AI API Key",
    key: "GOOGLE_API_KEY",
    description: "Conecte sua conta Google para usar modelos Gemini",
    category: "ai", 
    logo: "google",
    placeholder: "AI..."
  },
  {
    id: "groq",
    name: "Groq API Key",
    key: "GROQ_API_KEY",
    description: "Conecte sua conta Groq para modelos ultrarrápidos",
    category: "ai",
    logo: "groq",
    placeholder: "gsk_..."
  },
  {
    id: "perplexity",
    name: "Perplexity API Key", 
    key: "PERPLEXITY_API_KEY",
    description: "Conecte sua conta Perplexity para busca em tempo real",
    category: "ai",
    logo: "perplexity",
    placeholder: "pplx-..."
  }
]

export default function UserVariablesPage() {
  const { user, isAuthenticated } = useAuth()
  const {
    variables,
    loading,
    error,
    syncing,
    lastSync,
    addVariable,
    updateVariable,
    deleteVariable,
    syncVariables,
    loadVariables,
    clearError,
    getVariablesByCategory,
    importVariables,
    exportVariables
  } = useVariables()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<VariableCategory | "all">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedVariable, setSelectedVariable] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showValues, setShowValues] = useState(false)

  
  const [newVariableForm, setNewVariableForm] = useState<NewVariableForm>({
    key: "",
    value: "",
    description: "",
    category: "",
    is_encrypted: true,
    is_active: true
  })

  // Carrega variáveis apenas uma vez quando autenticado
  useEffect(() => {
    if (isAuthenticated && variables.length === 0 && !loading) {
      loadVariables()
    }
  }, [isAuthenticated])

  // Filtra variáveis baseado na busca e categoria
  const filteredVariables = variables.filter((variable) => {
    const keyMatch = variable.key ? variable.key.toLowerCase().includes(searchTerm.toLowerCase()) : false
    const descriptionMatch = variable.description ? variable.description.toLowerCase().includes(searchTerm.toLowerCase()) : false
    const matchesSearch = keyMatch || descriptionMatch
    
    const matchesCategory = selectedCategory === "all" || variable.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Obtém variáveis por categoria para estatísticas
  const aiVariables = getVariablesByCategory("ai")

  // Handlers para formulário
  const handleCreateVariable = async () => {
    if (!newVariableForm.key || !newVariableForm.value) {
      toast.error("Chave e valor são obrigatórios")
      return
    }

    if (isEditMode && selectedVariable) {
      // Modo de edição - atualizar variável existente
      const success = await updateVariable(selectedVariable.id, {
        value: newVariableForm.value,
        description: newVariableForm.description,
        category: newVariableForm.category,
        is_encrypted: newVariableForm.is_encrypted,
        is_active: newVariableForm.is_active
      })

      if (success) {
        toast.success("Variável atualizada com sucesso!")
        setIsCreateDialogOpen(false)
        setIsEditMode(false)
        setSelectedVariable(null)
        resetForm()
      }
    } else {
      // Modo de criação - criar nova variável
      const result = await addVariable({
        key: newVariableForm.key,
        value: newVariableForm.value,
        description: newVariableForm.description,
        category: newVariableForm.category,
        is_encrypted: newVariableForm.is_encrypted,
        is_active: newVariableForm.is_active,
        // Campos de compatibilidade obrigatórios
        name: newVariableForm.key,
        type: newVariableForm.is_encrypted ? 'secret' : 'string',
        scope: 'global',
        tags: newVariableForm.category ? [newVariableForm.category] : [],
        isSecret: newVariableForm.is_encrypted,
        isActive: newVariableForm.is_active
      })

      if (result) {
        toast.success("Variável criada com sucesso!")
        setIsCreateDialogOpen(false)
        resetForm()
      }
    }
  }

  const handleDeleteVariable = async (id: string) => {
    const success = await deleteVariable(id)
    if (success) {
      toast.success("Variável removida com sucesso!")
    }
  }

  const handleSync = async () => {
    const success = await syncVariables()
    if (success) {
      toast.success("Variáveis sincronizadas!")
    }
  }

  const handleImportFile = async () => {
    if (!selectedFile) return
    
    const success = await importVariables(selectedFile)
    if (success) {
      toast.success("Variáveis importadas com sucesso!")
      setImportDialogOpen(false)
      setSelectedFile(null)
    }
  }

  const handleExport = async (format: 'json' | 'env') => {
    await exportVariables(format)
    toast.success(`Variáveis exportadas como ${format.toUpperCase()}!`)
  }

  const resetForm = () => {
    setNewVariableForm({
      key: "",
      value: "",
      description: "",
      category: "",
      is_encrypted: true,
      is_active: true
    })
    setIsEditMode(false)
    setSelectedVariable(null)
  }

  const fillTemplateData = (template: typeof serviceTemplates[0]) => {
    // Verificar se já existe uma variável para este template
    const existingVariable = variables.find(v => v.key === template.key)
    
    if (existingVariable) {
      // Se existe, abrir modal de visualização/edição
      setSelectedVariable({...existingVariable, template})
      setIsViewDialogOpen(true)
    } else {
      // Se não existe, abrir modal de criação
      setNewVariableForm({
        key: template.key,
        value: "",
        description: template.description,
        category: template.category,
        is_encrypted: true,
        is_active: true
      })
      setIsCreateDialogOpen(true)
    }
  }

  // Helper functions for documentation
  const getHelpText = (serviceName: string) => {
    const helpTexts: Record<string, string> = {
      "OpenAI API Key": "Acesse sua conta OpenAI, vá em 'API Keys' no painel e gere uma nova chave.",
      "Anthropic Claude API Key": "Entre na console da Anthropic e crie uma nova API key na seção de configurações.",
      "Google AI API Key": "No Google Cloud Console, ative a API do Gemini e gere suas credenciais.",
      "Groq API Key": "Faça login no Groq Console e gere uma nova API key na seção de desenvolvimento.",
      "Perplexity API Key": "Acesse o painel da Perplexity e gere uma chave na seção de integrações."
    }
    return helpTexts[serviceName] || "Consulte a documentação oficial do serviço para obter sua API key."
  }

  const getDocumentationUrl = (serviceName: string) => {
    const urls: Record<string, string> = {
      "OpenAI API Key": "https://platform.openai.com/docs/quickstart",
      "Anthropic Claude API Key": "https://docs.anthropic.com/claude/docs/getting-access-to-claude",
      "Google AI API Key": "https://ai.google.dev/docs",
      "Groq API Key": "https://console.groq.com/docs/quickstart",
      "Perplexity API Key": "https://docs.perplexity.ai/"
    }
    return urls[serviceName] || "#"
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success("Copiado para a área de transferência!")
  }

  // Função para mascarar API key mostrando os primeiros 4 e últimos 4 caracteres reais
  const maskApiKey = (apiKey: string | null | undefined) => {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      return '••••••••••••••••'
    }
    
    if (apiKey.length <= 8) {
      return apiKey // Se for muito curto, mostra tudo
    }
    
    const first4 = apiKey.slice(0, 4)
    const last4 = apiKey.slice(-4)
    const maskedLength = Math.max(4, apiKey.length - 8)
    const masked = '*'.repeat(maskedLength)
    return first4 + masked + last4
  }

  // Função para iniciar edição de variável existente
  const handleEditVariable = () => {
    if (!selectedVariable) return
    
    setNewVariableForm({
      key: selectedVariable.key,
      value: selectedVariable.value || "",
      description: selectedVariable.description || "",
      category: selectedVariable.category || "",
      is_encrypted: selectedVariable.is_encrypted,
      is_active: selectedVariable.is_active
    })
    setIsEditMode(true)
    setIsViewDialogOpen(false)
    setIsCreateDialogOpen(true)
  }

  // Função para deletar variável do modal de visualização
  const handleDeleteFromModal = async () => {
    if (!selectedVariable) return
    
    const success = await deleteVariable(selectedVariable.id)
    if (success) {
      toast.success("Variável removida com sucesso!")
      setIsViewDialogOpen(false)
      setSelectedVariable(null)
    }
  }



  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Variáveis do Usuário</h1>
          <p className="text-muted-foreground">
            Gerencie suas chaves de API e conexões com serviços externos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialogOpen(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('env')}>
                Como arquivo .env
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Como JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sincronizar variáveis com o servidor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Variável
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-background/50 hover:bg-background/80 transition-colors border-l-4 border-l-primary/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{variables.length}</div>
                  <p className="text-xs text-muted-foreground">Total de Variáveis</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-background/50 hover:bg-background/80 transition-colors border-l-4 border-l-blue-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{aiVariables.length}</div>
                  <p className="text-xs text-muted-foreground">Provedores IA</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-background/50 hover:bg-background/80 transition-colors border-l-4 border-l-amber-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{variables.filter(v => v.is_encrypted).length}</div>
                  <p className="text-xs text-muted-foreground">Criptografadas</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-background/50 hover:bg-background/80 transition-colors border-l-4 border-l-green-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{variables.filter(v => v.is_active).length}</div>
                  <p className="text-xs text-muted-foreground">Ativas</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar variáveis..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
          <SelectTrigger className="w-full md:w-48">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por categoria" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="ai">Inteligência Artificial</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="ads">Publicidade</SelectItem>
            <SelectItem value="social">Redes Sociais</SelectItem>
            <SelectItem value="custom">Personalizadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && variables.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Carregando variáveis...</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading || variables.length > 0 ? (
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="templates" className="flex-1 md:flex-initial">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Templates de IA
              </div>
            </TabsTrigger>
            <TabsTrigger value="variables" className="flex-1 md:flex-initial">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Minhas Variáveis ({filteredVariables.length})
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">APIs de Inteligência Artificial</h3>
              <p className="text-sm text-gray-600">Conecte suas contas das principais plataformas de IA para usar em seus workflows</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {serviceTemplates.map((template, index) => {
                  const existingVariable = variables.find(v => v.key === template.key)
                  const isConnected = !!existingVariable
                  
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="w-full"
                    >
                      <div 
                        className={`
                          relative rounded-xl border-2 transition-all duration-300 cursor-pointer group overflow-hidden
                          ${isConnected 
                            ? 'border-green-500 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/60 hover:border-green-600' 
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 hover:shadow-lg'
                          }
                          h-28 w-full flex items-center justify-center transform hover:scale-105
                        `}
                        onClick={() => fillTemplateData(template)}
                      >
                        {/* Animated background glow for connected APIs */}
                        {isConnected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-green-400/20 animate-pulse"></div>
                        )}
                        

                        
                        {/* Content */}
                        <div className="relative z-10 flex items-center justify-center h-full w-full p-3">
                          <BrandIdentity brand={template.logo} className="w-full" />
                        </div>
                        
                        {/* Connection status indicator */}
                        <div className="absolute bottom-2 left-2 z-10">
                          <div className={`
                            px-2 py-1 rounded-full text-xs font-medium transition-all duration-300
                            ${isConnected 
                              ? 'bg-green-200/80 text-green-800 backdrop-blur-sm' 
                              : 'bg-gray-100/80 text-gray-600 backdrop-blur-sm opacity-0 group-hover:opacity-100'
                            }
                          `}>
                            {isConnected ? '✓ Conectado' : 'Conectar'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="variables" className="space-y-6">
            {filteredVariables.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma variável encontrada</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Tente ajustar os filtros de busca."
                    : "Comece criando sua primeira variável ou configure um template de IA."
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Variável
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {filteredVariables.map((variable, index) => (
                    <motion.div
                      key={variable.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Card 
                        className={`
                          hover:shadow-md transition-all duration-300 cursor-pointer group
                          ${variable.is_active 
                            ? 'border-l-4 border-l-green-500 hover:border-l-green-600 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20' 
                            : 'border-l-4 border-l-gray-300 hover:border-l-gray-400'
                          }
                        `}
                        onClick={() => {
                          // Encontrar template correspondente se existir
                          const template = serviceTemplates.find(t => t.key === variable.key)
                          setSelectedVariable({...variable, template})
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  {/* Logo do serviço se for um template conhecido */}
                                  {serviceTemplates.find(t => t.key === variable.key) && (
                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                      <ServiceLogo 
                                        service={serviceTemplates.find(t => t.key === variable.key)?.logo || 'key'} 
                                        size={16}
                                        className="w-4 h-4"
                                      />
                                    </div>
                                  )}
                                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                                    {variable.key}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge 
                                    variant={variable.is_active ? "default" : "secondary"} 
                                    className={`text-xs rounded-full ${
                                      variable.is_active 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                        : ''
                                    }`}
                                  >
                                    <Shield className="h-3 w-3 mr-1" />
                                    {variable.is_active ? 'Ativa' : 'Inativa'}
                                  </Badge>
                                  {variable.is_active && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  )}
                                </div>
                              </div>
                              
                              {variable.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {variable.description}
                                </p>
                              )}
                              
                              {/* API Key Preview */}
                              {variable.value && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Key className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium">API Key</span>
                                  </div>
                                  <div className="font-mono text-sm bg-muted/50 p-2 rounded border text-center group-hover:bg-muted transition-colors">
                                    {showValues ? variable.value : maskApiKey(variable.value)}
                                  </div>
                                </div>
                              )}
                              
                              {/* Show placeholder if no value */}
                              {!variable.value && variable.is_encrypted && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Key className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium">API Key</span>
                                  </div>
                                  <div className="font-mono text-sm bg-muted/30 p-2 rounded border text-center text-muted-foreground">
                                    ••••••••••••••••
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mt-3">
                                {variable.category && (
                                  <Badge variant="outline" className="text-xs rounded-full">
                                    {variable.category}
                                  </Badge>
                                )}
                                {serviceTemplates.find(t => t.key === variable.key) && (
                                  <Badge variant="outline" className="text-xs rounded-full bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                                    Serviço Oficial
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        copyToClipboard(variable.key, variable.id)
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      {copiedId === variable.id ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copiar identificador</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const template = serviceTemplates.find(t => t.key === variable.key)
                                        setSelectedVariable({...variable, template})
                                        setIsEditMode(true)
                                        setNewVariableForm({
                                          key: variable.key,
                                          value: variable.value || "",
                                          description: variable.description || "",
                                          category: variable.category || "",
                                          is_encrypted: variable.is_encrypted,
                                          is_active: variable.is_active
                                        })
                                        setIsCreateDialogOpen(true)
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Editar variável</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : null}

      {/* Create Variable Dialog - Refined Design */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <div className="bg-gradient-to-b from-primary/10 to-background pt-8 pb-6 px-6">
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-sm">
                {serviceTemplates.find(t => t.key === newVariableForm.key) ? (
                  <ServiceLogo 
                    service={serviceTemplates.find(t => t.key === newVariableForm.key)?.logo || 'key'} 
                    size={32}
                    className="w-8 h-8" 
                  />
                ) : (
                  <Key className="h-8 w-8 text-primary" />
                )}
              </div>
              <DialogTitle className="text-xl font-semibold">
                {isEditMode 
                  ? `Editar ${serviceTemplates.find(t => t.key === newVariableForm.key)?.name || newVariableForm.key}`
                  : (serviceTemplates.find(t => t.key === newVariableForm.key)?.name || "Nova Variável")
                }
              </DialogTitle>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1.5">
                {isEditMode 
                  ? "Atualize as configurações da sua variável"
                  : (newVariableForm.description || "Configure uma nova variável para conectar serviços externos")
                }
              </p>
            </DialogHeader>
          </div>
          
          <div className="px-6 py-5 space-y-5">
            {/* Service Information - Read Only */}
            {serviceTemplates.find(t => t.key === newVariableForm.key) && (
              <div className="bg-muted/30 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    Informações do Serviço
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Pré-configurado
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Serviço:</span>
                    <p className="font-medium">{serviceTemplates.find(t => t.key === newVariableForm.key)?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Categoria:</span>
                    <p className="font-medium capitalize">{newVariableForm.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Identificador:</span>
                    <p className="font-mono text-xs">{newVariableForm.key}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Segurança:</span>
                    <div className="flex items-center gap-1">
                      <Key className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 font-medium">Criptografado</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Key Input - Only for non-template variables */}
            {!serviceTemplates.find(t => t.key === newVariableForm.key) && (
              <div className="space-y-2">
                <Label htmlFor="custom-key" className="text-sm font-medium flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-primary" />
                  Nome da Variável
                </Label>
                <Input
                  id="custom-key"
                  value={newVariableForm.key}
                  onChange={(e) => setNewVariableForm(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                  placeholder="Ex: MY_API_KEY"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use letras maiúsculas e underscores para nomes de variáveis (ex: API_KEY)
                </p>
              </div>
            )}

            {/* Main Input - API Key */}
            <div className="space-y-2.5">
              <Label htmlFor="api-key" className="text-base font-medium flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                {serviceTemplates.find(t => t.key === newVariableForm.key)?.name 
                  ? `Sua ${serviceTemplates.find(t => t.key === newVariableForm.key)?.name}` 
                  : "Valor da Variável"}
              </Label>
              
              <div className="relative">
                <Textarea
                  id="api-key"
                  value={newVariableForm.value}
                  onChange={(e) => setNewVariableForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={
                    serviceTemplates.find(t => t.key === newVariableForm.key)
                      ? `Cole sua ${serviceTemplates.find(t => t.key === newVariableForm.key)?.name.toLowerCase()} aqui...`
                      : "Digite o valor da variável..."
                  }
                  className="font-mono text-base resize-none min-h-[80px] pr-20"
                  rows={3}
                />
                {newVariableForm.value && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Criptografado
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-300">Sua API key será criptografada</p>
                  <p className="text-blue-700 dark:text-blue-400">
                    Este valor será automaticamente criptografado e armazenado com segurança. 
                    Apenas você poderá visualizá-lo posteriormente.
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Description */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4.414 4.414z" />
                </svg>
                Notas (opcional)
              </Label>
              <Textarea
                id="notes"
                value={newVariableForm.description}
                onChange={(e) => setNewVariableForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Adicione observações sobre esta configuração..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {/* Help Section */}
            {serviceTemplates.find(t => t.key === newVariableForm.key) && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Como obter sua API key?</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {getHelpText(serviceTemplates.find(t => t.key === newVariableForm.key)?.name || "")}
                    </p>
                    <Button variant="outline" size="sm" className="text-xs h-7" asChild>
                      <a href={getDocumentationUrl(serviceTemplates.find(t => t.key === newVariableForm.key)?.name || "")} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Documentação oficial
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Category Selection for Custom Variables */}
            {!serviceTemplates.find(t => t.key === newVariableForm.key) && (
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-primary" />
                  <span>Categoria</span>
                </Label>
                <Select
                  value={newVariableForm.category}
                  onValueChange={(value) => setNewVariableForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">Inteligência Artificial</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="ads">Publicidade</SelectItem>
                    <SelectItem value="social">Redes Sociais</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex flex-row gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateVariable} 
              disabled={loading || !newVariableForm.value.trim() || !newVariableForm.key.trim()}
              className="flex-1 sm:flex-none gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {isEditMode 
                    ? "Salvar Alterações" 
                    : (serviceTemplates.find(t => t.key === newVariableForm.key) ? "Configurar" : "Salvar Variável")
                  }
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Manage Existing Variable Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          {selectedVariable && (
            <>
              <div className="bg-gradient-to-b from-green-50 via-green-100 to-emerald-50 dark:from-green-950 dark:via-green-900 dark:to-emerald-950 pt-8 pb-6 px-6 border-b border-green-200 dark:border-green-800">
                <DialogHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 border border-green-200 dark:border-green-800 shadow-sm">
                    {selectedVariable.template && (
                      <ServiceLogo 
                        service={selectedVariable.template.logo} 
                        size={32}
                        className="w-8 h-8" 
                      />
                    )}
                  </div>
                  <DialogTitle className="text-xl font-semibold text-green-800 dark:text-green-200">
                    {selectedVariable.template?.name || selectedVariable.key}
                  </DialogTitle>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Conectado e Ativo
                    </span>
                  </div>
                </DialogHeader>
              </div>
              
              <div className="px-6 py-5 space-y-5">
                {/* API Key Display */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Key className="h-5 w-5 text-green-600" />
                    API Key
                  </Label>
                  
                  <div className="relative">
                    <div className="font-mono text-lg bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-2 border-green-200 dark:border-green-800 text-center">
                      {showValues ? (selectedVariable.value || '') : maskApiKey(selectedVariable.value || '')}
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Criptografado
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedVariable.key, selectedVariable.id)}
                      className="text-xs h-8"
                    >
                      {copiedId === selectedVariable.id ? (
                        <Check className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      Copiar identificador
                    </Button>
                    
                    <Badge variant="outline" className="text-xs">
                      {selectedVariable.category || 'sem categoria'}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                {selectedVariable.description && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4.414 4.414z" />
                      </svg>
                      Descrição
                    </Label>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedVariable.description}
                    </p>
                  </div>
                )}

                {/* Status and Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Status</span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${selectedVariable.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-sm font-medium">
                        {selectedVariable.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Segurança</span>
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Criptografado</span>
                    </div>
                  </div>
                </div>

                {/* Help Section for Service */}
                {selectedVariable.template && (
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-sm">
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">Serviço Conectado</h4>
                        <p className="text-blue-700 dark:text-blue-400 mb-2">
                          {selectedVariable.template.description}
                        </p>
                        <Button variant="outline" size="sm" className="text-xs h-7" asChild>
                          <a href={getDocumentationUrl(selectedVariable.template.name)} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Documentação
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex flex-row gap-3 justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                  className="flex-1 sm:flex-none"
                >
                  Fechar
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleDeleteFromModal}
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Excluir
                  </Button>
                  <Button 
                    onClick={handleEditVariable}
                    className="gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Variáveis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <Input
                id="file-upload"
                type="file"
                accept=".env,.txt,.json"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium">Clique para selecionar um arquivo</span>
                <span className="text-sm text-muted-foreground">ou arraste e solte aqui</span>
                <span className="text-xs text-muted-foreground mt-2">Suporta arquivos .env, .txt e .json</span>
              </Label>
            </div>
            
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedFile(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImportFile} disabled={!selectedFile || loading} className="gap-2">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Importar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating toggle button for showing/hiding values */}
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValues(!showValues)}
                className="shadow-lg bg-background/95 backdrop-blur-sm border-primary/20 hover:bg-primary/5"
              >
                {showValues ? (
                  <EyeOff className="h-4 w-4 text-primary" />
                ) : (
                  <Eye className="h-4 w-4 text-primary" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{showValues ? "Ocultar valores das API keys" : "Mostrar valores das API keys"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
} 