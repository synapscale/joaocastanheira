"use client"

/**
 * Página de Variáveis do Usuário - Integração Backend
 * Criado por José - O melhor Full Stack do mundo
 * Sistema completo de variáveis personalizado
 */

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Plus, Info, Check, X, Settings, Upload, Download, 
  Eye, EyeOff, Edit, Trash2, Copy, RefreshCw, Filter,
  FileText, Key, Shield, AlertTriangle, CheckCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useUserVariables, type UserVariable, type UserVariableCreate } from "@/context/user-variable-context"
import { cn } from "@/lib/utils"

// Categorias predefinidas com cores e ícones
const CATEGORIES = {
  "AI": { color: "#10A37F", bgColor: "#F0FDF4", icon: "🤖" },
  "ANALYTICS": { color: "#FF6B35", bgColor: "#FFF7ED", icon: "📊" },
  "ADS": { color: "#1877F2", bgColor: "#EFF6FF", icon: "📢" },
  "SOCIAL": { color: "#E1306C", bgColor: "#FDF2F8", icon: "📱" },
  "DATABASE": { color: "#336791", bgColor: "#F0F9FF", icon: "🗄️" },
  "EMAIL": { color: "#EA4335", bgColor: "#FEF2F2", icon: "📧" },
  "PAYMENT": { color: "#635BFF", bgColor: "#F8FAFC", icon: "💳" },
  "CONFIG": { color: "#6B7280", bgColor: "#F9FAFB", icon: "⚙️" },
  "OTHER": { color: "#8B5CF6", bgColor: "#FAF5FF", icon: "🔧" }
}

export default function UserVariablesPage() {
  const {
    variables,
    categories,
    stats,
    loading,
    error,
    createVariable,
    updateVariable,
    deleteVariable,
    bulkDeleteVariables,
    importFromEnv,
    exportToEnv,
    importFromFile,
    searchVariables,
    getVariablesByCategory,
    refreshVariables,
    refreshStats
  } = useUserVariables()

  // Estados locais
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [selectedVariables, setSelectedVariables] = useState<number[]>([])
  const [showSensitive, setShowSensitive] = useState(false)
  const [editingVariable, setEditingVariable] = useState<UserVariable | null>(null)

  // Estados do formulário
  const [formData, setFormData] = useState<UserVariableCreate>({
    key: "",
    value: "",
    description: "",
    category: "CONFIG",
    is_encrypted: true
  })

  // Estados de importação
  const [importData, setImportData] = useState({
    content: "",
    overwrite: false,
    category: "CONFIG"
  })

  // Filtrar variáveis
  const filteredVariables = React.useMemo(() => {
    let filtered = variables

    // Filtrar por busca
    if (searchQuery) {
      filtered = searchVariables(searchQuery)
    }

    // Filtrar por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter(v => v.category === selectedCategory)
    }

    return filtered.sort((a, b) => a.key.localeCompare(b.key))
  }, [variables, searchQuery, selectedCategory, searchVariables])

  // Resetar formulário
  const resetForm = useCallback(() => {
    setFormData({
      key: "",
      value: "",
      description: "",
      category: "CONFIG",
      is_encrypted: true
    })
    setEditingVariable(null)
  }, [])

  // Criar variável
  const handleCreateVariable = useCallback(async () => {
    if (!formData.key || !formData.value) {
      toast.error("Chave e valor são obrigatórios")
      return
    }

    const success = await createVariable(formData)
    if (success) {
      setShowCreateDialog(false)
      resetForm()
    }
  }, [formData, createVariable, resetForm])

  // Atualizar variável
  const handleUpdateVariable = useCallback(async () => {
    if (!editingVariable) return

    const success = await updateVariable(editingVariable.id, {
      value: formData.value,
      description: formData.description,
      category: formData.category
    })

    if (success) {
      setShowCreateDialog(false)
      resetForm()
    }
  }, [editingVariable, formData, updateVariable, resetForm])

  // Deletar variável
  const handleDeleteVariable = useCallback(async (id: number) => {
    const success = await deleteVariable(id)
    if (success) {
      setSelectedVariables(prev => prev.filter(vid => vid !== id))
    }
  }, [deleteVariable])

  // Deletar múltiplas variáveis
  const handleBulkDelete = useCallback(async () => {
    if (selectedVariables.length === 0) return

    const deletedCount = await bulkDeleteVariables(selectedVariables)
    if (deletedCount > 0) {
      setSelectedVariables([])
    }
  }, [selectedVariables, bulkDeleteVariables])

  // Importar de .env
  const handleImportEnv = useCallback(async () => {
    if (!importData.content.trim()) {
      toast.error("Conteúdo do arquivo .env é obrigatório")
      return
    }

    try {
      await importFromEnv(importData.content, importData.overwrite, importData.category)
      setShowImportDialog(false)
      setImportData({ content: "", overwrite: false, category: "CONFIG" })
    } catch (error) {
      // Erro já tratado no contexto
    }
  }, [importData, importFromEnv])

  // Exportar para .env
  const handleExportEnv = useCallback(async () => {
    try {
      const envContent = await exportToEnv(
        selectedCategory === "all" ? undefined : [selectedCategory],
        showSensitive
      )

      // Criar e baixar arquivo
      const blob = new Blob([envContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `synapscale-variables-${new Date().toISOString().split('T')[0]}.env`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Arquivo .env exportado com sucesso")
      setShowExportDialog(false)
    } catch (error) {
      // Erro já tratado no contexto
    }
  }, [selectedCategory, showSensitive, exportToEnv])

  // Copiar valor
  const handleCopyValue = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success("Valor copiado para a área de transferência")
    } catch (error) {
      toast.error("Erro ao copiar valor")
    }
  }, [])

  // Editar variável
  const handleEditVariable = useCallback((variable: UserVariable) => {
    setEditingVariable(variable)
    setFormData({
      key: variable.key,
      value: variable.value,
      description: variable.description || "",
      category: variable.category,
      is_encrypted: variable.is_encrypted
    })
    setShowCreateDialog(true)
  }, [])

  // Selecionar/deselecionar variável
  const toggleVariableSelection = useCallback((id: number) => {
    setSelectedVariables(prev => 
      prev.includes(id) 
        ? prev.filter(vid => vid !== id)
        : [...prev, id]
    )
  }, [])

  // Selecionar todas as variáveis filtradas
  const toggleSelectAll = useCallback(() => {
    const filteredIds = filteredVariables.map(v => v.id)
    setSelectedVariables(prev => 
      prev.length === filteredIds.length 
        ? []
        : filteredIds
    )
  }, [filteredVariables])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Variáveis do Usuário</h1>
            <p className="text-muted-foreground">
              Gerencie suas chaves de API e variáveis de ambiente personalizadas
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshVariables}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Atualizar
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Variável
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total_variables}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ativas</p>
                    <p className="text-2xl font-bold">{stats.active_variables}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sensíveis</p>
                    <p className="text-2xl font-bold">{stats.sensitive_variables}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Categorias</p>
                    <p className="text-2xl font-bold">{Object.keys(stats.categories_count).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar variáveis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {Object.keys(CATEGORIES).map(category => (
                <SelectItem key={category} value={category}>
                  {CATEGORIES[category as keyof typeof CATEGORIES].icon} {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Ações em lote */}
        {selectedVariables.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm">
              {selectedVariables.length} variável(is) selecionada(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedVariables([])}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de variáveis */}
      <div className="space-y-4">
        {loading && variables.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Carregando variáveis...</p>
            </div>
          </div>
        ) : filteredVariables.length === 0 ? (
          <div className="text-center py-12">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma variável encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "all" 
                ? "Tente ajustar os filtros de busca"
                : "Comece criando sua primeira variável"
              }
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Variável
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header da lista */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                checked={selectedVariables.length === filteredVariables.length}
                onChange={toggleSelectAll}
                className="rounded"
              />
              <span className="text-sm font-medium">Selecionar todos</span>
            </div>

            {/* Variáveis */}
            <AnimatePresence>
              {filteredVariables.map((variable) => (
                <motion.div
                  key={variable.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={cn(
                    "transition-all duration-200 hover:shadow-md",
                    selectedVariables.includes(variable.id) && "ring-2 ring-primary"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedVariables.includes(variable.id)}
                          onChange={() => toggleVariableSelection(variable.id)}
                          className="rounded"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">
                              {CATEGORIES[variable.category as keyof typeof CATEGORIES]?.icon || "🔧"}
                            </span>
                            <h3 className="font-semibold truncate">{variable.key}</h3>
                            <Badge 
                              variant="secondary"
                              style={{
                                backgroundColor: CATEGORIES[variable.category as keyof typeof CATEGORIES]?.bgColor,
                                color: CATEGORIES[variable.category as keyof typeof CATEGORIES]?.color
                              }}
                            >
                              {variable.category}
                            </Badge>
                            {variable.is_encrypted && (
                              <Shield className="h-4 w-4 text-orange-500" />
                            )}
                            {!variable.is_active && (
                              <Badge variant="destructive">Inativa</Badge>
                            )}
                          </div>
                          
                          {variable.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {variable.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {showSensitive || !variable.is_encrypted 
                                ? variable.value 
                                : "••••••••••••••••"
                              }
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyValue(variable.value)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditVariable(variable)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteVariable(variable.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Deletar</TooltipContent>
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
      </div>

      {/* Dialog de Criar/Editar Variável */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingVariable ? "Editar Variável" : "Nova Variável"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key">Chave *</Label>
              <Input
                id="key"
                placeholder="Ex: OPENAI_API_KEY"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                disabled={!!editingVariable}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor *</Label>
              <Textarea
                id="value"
                placeholder="Valor da variável"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição opcional da variável"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CATEGORIES).map(category => (
                    <SelectItem key={category} value={category}>
                      {CATEGORIES[category as keyof typeof CATEGORIES].icon} {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="encrypted"
                checked={formData.is_encrypted}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_encrypted: checked }))}
              />
              <Label htmlFor="encrypted">Criptografar valor</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Valores criptografados são armazenados de forma segura
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={editingVariable ? handleUpdateVariable : handleCreateVariable}
              disabled={loading || !formData.key || !formData.value}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : editingVariable ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {editingVariable ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Importar */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Importar Variáveis</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Cole o conteúdo de um arquivo .env ou digite as variáveis no formato CHAVE=valor
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="import-content">Conteúdo do arquivo .env</Label>
              <Textarea
                id="import-content"
                placeholder={`OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
DATABASE_URL=postgresql://...`}
                value={importData.content}
                onChange={(e) => setImportData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="import-category">Categoria padrão</Label>
                <Select 
                  value={importData.category} 
                  onValueChange={(value) => setImportData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CATEGORIES).map(category => (
                      <SelectItem key={category} value={category}>
                        {CATEGORIES[category as keyof typeof CATEGORIES].icon} {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Opções</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="overwrite"
                    checked={importData.overwrite}
                    onCheckedChange={(checked) => setImportData(prev => ({ ...prev, overwrite: checked }))}
                  />
                  <Label htmlFor="overwrite">Sobrescrever existentes</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImportEnv}
              disabled={loading || !importData.content.trim()}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exportar */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Exportar Variáveis</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <p className="text-sm text-muted-foreground">
                {selectedCategory === "all" 
                  ? "Todas as categorias serão exportadas"
                  : `Apenas a categoria ${selectedCategory} será exportada`
                }
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="include-sensitive"
                checked={showSensitive}
                onCheckedChange={setShowSensitive}
              />
              <Label htmlFor="include-sensitive">Incluir variáveis sensíveis</Label>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                O arquivo exportado conterá valores em texto plano. Mantenha-o seguro.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExportEnv} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle para mostrar valores sensíveis */}
      <div className="fixed bottom-6 right-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitive(!showSensitive)}
                className="shadow-lg"
              >
                {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showSensitive ? "Ocultar valores" : "Mostrar valores"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

