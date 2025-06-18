"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  AlertCircle, Info, Plus, RefreshCw, Search, 
  X, Key, ExternalLink, Upload, Download, Copy, Check, 
  ChevronDown, Filter, Tag, Shield, Lock
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

// Tipos para as variáveis do usuário baseados na API
type VariableCategory = "ai" | "analytics" | "ads" | "social" | "custom"

interface Variable {
  id: string
  key: string
  value?: string
  description?: string
  category?: string
  is_encrypted: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

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

  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  
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
  const filteredVariables = variables.filter((variable: Variable) => {
    const matchesSearch = variable.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
  }

  const fillTemplateData = (template: typeof serviceTemplates[0]) => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {serviceTemplates.map((template, index) => {
                  const existingVariable = variables.find(v => v.key === template.key)
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <ServiceLogo service={template.logo} size={32} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{template.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                              <Badge variant={existingVariable ? "default" : "secondary"} className="rounded-full">
                                {existingVariable ? "Configurado" : "Não configurado"}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant={existingVariable ? "outline" : "default"} 
                              size="sm"
                              onClick={() => fillTemplateData(template)}
                              className="gap-2"
                            >
                              {existingVariable ? "Reconfigurar" : "Configurar"}
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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
                      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary/10 hover:border-l-primary/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{variable.key}</h3>
                                <Badge variant="secondary" className="text-xs rounded-full">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Criptografado
                                </Badge>
                              </div>
                              {variable.description && (
                                <p className="text-sm text-muted-foreground mb-2">{variable.description}</p>
                              )}
                              {variable.category && (
                                <Badge variant="outline" className="text-xs rounded-full">
                                  {variable.category}
                                </Badge>
                              )}
                              
                              {variable.value && (
                                <div className="mt-2">
                                  <div className="font-mono text-xs bg-muted p-1.5 rounded truncate">
                                    ••••••••••••••••••••••••••
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                          {variable.is_active ? "Ativa" : "Inativa"}
                                        </span>
                                        <Switch
                                          checked={variable.is_active}
                                          onCheckedChange={async (checked) => {
                                            const success = await updateVariable(variable.id, {
                                              ...variable,
                                              is_active: checked
                                            })
                                            if (success) {
                                              toast.success(checked ? "Variável ativada!" : "Variável desativada!")
                                            }
                                          }}
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{variable.is_active ? "Desativar variável" : "Ativar variável"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(variable.key, variable.id)}
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
                                      <p>Copiar chave</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteVariable(variable.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Deletar variável</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
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
                {serviceTemplates.find(t => t.key === newVariableForm.key)?.name || "Nova Variável"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1.5">
                {newVariableForm.description || "Configure uma nova variável para conectar serviços externos"}
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
                  {serviceTemplates.find(t => t.key === newVariableForm.key) ? "Configurar" : "Salvar Variável"}
                </>
              )}
            </Button>
          </DialogFooter>
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
    </div>
  )
} 