"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Info, Check, X, RefreshCw, Sync, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useVariableContext } from "@/context/variable-context"
import { useAuth } from "@/context/auth-context"
import ServiceLogo from "../../components/ui/service-logo"
import type { Variable, VariableScope } from "@/types/variable"

// Tipos para as variáveis do usuário
type VariableCategory = "ai" | "analytics" | "ads" | "social" | "custom"
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

// Dados de exemplo para as variáveis de serviços
const serviceVariables: UserVariable[] = [
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
    name: "Claude API Key",
    description: "Conecte sua conta Anthropic para usar Claude",
    category: "ai",
    logo: "anthropic",
    status: "not_connected"
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Conecte sua conta Google Analytics para métricas",
    category: "analytics",
    logo: "google-analytics",
    status: "not_connected"
  },
  {
    id: "facebook-ads",
    name: "Facebook Ads",
    description: "Conecte sua conta Facebook Ads para campanhas",
    category: "ads",
    logo: "facebook",
    status: "not_connected"
  },
  {
    id: "instagram",
    name: "Instagram Business",
    description: "Conecte sua conta Instagram Business",
    category: "social",
    logo: "instagram",
    status: "not_connected"
  }
]

// Interface para formulário de nova variável
interface NewVariableForm {
  name: string
  key: string
  type: Variable['type']
  value: string
  scope: VariableScope
  description: string
  isSecret: boolean
  tags: string[]
}

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
    clearError
  } = useVariableContext()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<VariableCategory | "all">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  
  const [newVariableForm, setNewVariableForm] = useState<NewVariableForm>({
    name: "",
    key: "",
    type: "string",
    value: "",
    scope: "user",
    description: "",
    isSecret: false,
    tags: []
  })

  // Filtra variáveis baseado na busca e categoria
  const filteredVariables = variables.filter(variable => {
    const matchesSearch = variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || 
                           (selectedCategory === "custom" && !variable.isSystem)
    
    return matchesSearch && matchesCategory
  })

  // Separa variáveis por tipo
  const userVariables = filteredVariables.filter(v => !v.isSystem)
  const systemVariables = filteredVariables.filter(v => v.isSystem)

  // Handlers para formulário
  const handleCreateVariable = async () => {
    if (!newVariableForm.name || !newVariableForm.key) {
      toast.error("Nome e chave são obrigatórios")
      return
    }

    const result = await addVariable({
      name: newVariableForm.name,
      key: newVariableForm.key,
      type: newVariableForm.type,
      value: newVariableForm.value,
      scope: newVariableForm.scope,
      description: newVariableForm.description,
      isSecret: newVariableForm.isSecret,
      tags: newVariableForm.tags
    })

    if (result) {
      toast.success("Variável criada com sucesso!")
      setIsCreateDialogOpen(false)
      setNewVariableForm({
        name: "",
        key: "",
        type: "string",
        value: "",
        scope: "user",
        description: "",
        isSecret: false,
        tags: []
      })
    }
  }

  const handleUpdateVariable = async (variable: Variable) => {
    if (!editingVariable) return

    const success = await updateVariable(variable.id, {
      name: editingVariable.name,
      value: editingVariable.value,
      description: editingVariable.description,
      isSecret: editingVariable.isSecret,
      tags: editingVariable.tags
    })

    if (success) {
      toast.success("Variável atualizada com sucesso!")
      setEditingVariable(null)
    }
  }

  const handleDeleteVariable = async (variableId: string) => {
    const success = await deleteVariable(variableId)
    if (success) {
      toast.success("Variável deletada com sucesso!")
    }
  }

  const handleSync = async () => {
    const success = await syncVariables()
    if (success) {
      toast.success("Variáveis sincronizadas com sucesso!")
    }
  }

  const toggleShowSecret = (variableId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [variableId]: !prev[variableId]
    }))
  }

  // Componente para exibir valor da variável
  const VariableValue = ({ variable }: { variable: Variable }) => {
    const isSecret = variable.isSecret
    const shouldHide = isSecret && !showSecrets[variable.id]
    
    return (
      <div className="flex items-center gap-2">
        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {shouldHide ? "••••••••" : String(variable.value)}
        </code>
        {isSecret && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleShowSecret(variable.id)}
          >
            {shouldHide ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        )}
      </div>
    )
  }

  // Componente para card de variável
  const VariableCard = ({ variable }: { variable: Variable }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{variable.name}</h3>
              <Badge variant={variable.isSystem ? "secondary" : "default"}>
                {variable.scope}
              </Badge>
              {variable.isSecret && (
                <Badge variant="outline" className="text-orange-600">
                  Secreto
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {variable.description}
            </p>
            
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500">Chave:</span>
                <code className="ml-2 text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                  {variable.key}
                </code>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Valor:</span>
                <div className="ml-2">
                  <VariableValue variable={variable} />
                </div>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Tipo:</span>
                <Badge variant="outline" className="ml-2">
                  {variable.type}
                </Badge>
              </div>
              
              {variable.tags && variable.tags.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Tags:</span>
                  <div className="flex flex-wrap gap-1 ml-2">
                    {variable.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {!variable.isSystem && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingVariable(variable)}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteVariable(variable.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Variáveis do Usuário</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas variáveis e conecte serviços externos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sync className="h-4 w-4 mr-2" />
                )}
                Sincronizar
              </Button>
              
              {lastSync && (
                <span className="text-sm text-gray-500">
                  Última sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
            </>
          )}
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Variável
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Variável</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newVariableForm.name}
                    onChange={(e) => setNewVariableForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da variável"
                  />
                </div>
                
                <div>
                  <Label htmlFor="key">Chave</Label>
                  <Input
                    id="key"
                    value={newVariableForm.key}
                    onChange={(e) => setNewVariableForm(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="chave_da_variavel"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={newVariableForm.type}
                    onValueChange={(value: Variable['type']) => 
                      setNewVariableForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                      <SelectItem value="array">Array</SelectItem>
                      <SelectItem value="expression">Expression</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="scope">Escopo</Label>
                  <Select
                    value={newVariableForm.scope}
                    onValueChange={(value: VariableScope) => 
                      setNewVariableForm(prev => ({ ...prev, scope: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="node">Node</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="value">Valor</Label>
                  <Textarea
                    id="value"
                    value={newVariableForm.value}
                    onChange={(e) => setNewVariableForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Valor da variável"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newVariableForm.description}
                    onChange={(e) => setNewVariableForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da variável"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isSecret"
                    checked={newVariableForm.isSecret}
                    onCheckedChange={(checked) => 
                      setNewVariableForm(prev => ({ ...prev, isSecret: checked }))
                    }
                  />
                  <Label htmlFor="isSecret">Variável secreta</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateVariable} disabled={loading}>
                  {loading ? "Criando..." : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status e Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 dark:text-yellow-200">
              Faça login para sincronizar suas variáveis com o servidor
            </span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar variáveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={(value: VariableCategory | "all") => setSelectedCategory(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="custom">Personalizadas</SelectItem>
            <SelectItem value="ai">IA</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="ads">Anúncios</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo */}
      <Tabs defaultValue="custom" className="space-y-6">
        <TabsList>
          <TabsTrigger value="custom">Variáveis Personalizadas ({userVariables.length})</TabsTrigger>
          <TabsTrigger value="system">Variáveis do Sistema ({systemVariables.length})</TabsTrigger>
          <TabsTrigger value="services">Serviços Externos</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando variáveis...</span>
            </div>
          )}
          
          {!loading && userVariables.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma variável personalizada encontrada</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira variável
              </Button>
            </div>
          )}
          
          <div className="grid gap-4">
            {userVariables.map(variable => (
              <VariableCard key={variable.id} variable={variable} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4">
            {systemVariables.map(variable => (
              <VariableCard key={variable.id} variable={variable} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serviceVariables.map(service => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ServiceLogo service={service.logo} size="sm" />
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <Badge variant={service.status === "connected" ? "default" : "secondary"}>
                        {service.status === "connected" ? "Conectado" : "Não conectado"}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>
                  
                  <Button
                    variant={service.status === "connected" ? "outline" : "default"}
                    className="w-full"
                  >
                    {service.status === "connected" ? "Gerenciar" : "Conectar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      {editingVariable && (
        <Dialog open={!!editingVariable} onOpenChange={() => setEditingVariable(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Variável</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingVariable.name}
                  onChange={(e) => setEditingVariable(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-value">Valor</Label>
                <Textarea
                  id="edit-value"
                  value={String(editingVariable.value)}
                  onChange={(e) => setEditingVariable(prev => prev ? { ...prev, value: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingVariable.description || ""}
                  onChange={(e) => setEditingVariable(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isSecret"
                  checked={editingVariable.isSecret || false}
                  onCheckedChange={(checked) => 
                    setEditingVariable(prev => prev ? { ...prev, isSecret: checked } : null)
                  }
                />
                <Label htmlFor="edit-isSecret">Variável secreta</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingVariable(null)}>
                Cancelar
              </Button>
              <Button onClick={() => handleUpdateVariable(editingVariable)} disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

