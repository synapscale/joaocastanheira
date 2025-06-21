"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  X,
  Settings,
  Brain,
  Zap,
  Globe,
  Save,
  RotateCcw,
  Search,
  Plus,
  Wrench,
  Sliders,
} from "lucide-react"
import { SETTINGS_MODELS } from '@/constants/models'
import { AVAILABLE_SETTINGS_TOOLS } from '@/constants/tools'
import { useApp } from '@/context/app-context'
import { Slider } from "@/components/ui/slider"

interface ChatSettingsSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface ModelItem {
  id: string
  name: string
  enabled: boolean
  maxOnly?: boolean
}

interface ToolItem {
  id: string
  name: string
  enabled: boolean
}

export function ChatSettingsSidebar({ isOpen, onClose }: ChatSettingsSidebarProps) {
  const { toast } = useToast()
  const { 
    setEnabledModels, 
    setEnabledTools,
    userPreferences,
    updateTemperature,
    updateMaxTokens,
    updateTopP,
    updateFrequencyPenalty,
    updatePresencePenalty
  } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // Obter configurações LLM do contexto
  const llmSettings = userPreferences?.llmSettings || {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
  }

  // Detectar cliques fora da sidebar para fechá-la
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Estados para modelos disponíveis - Usando lista centralizada
  const [models, setModels] = useState<ModelItem[]>(SETTINGS_MODELS)

  // Estados para ferramentas - Usando lista centralizada
  const [tools, setTools] = useState<ToolItem[]>(AVAILABLE_SETTINGS_TOOLS)

  // Configurações gerais
  const [generalSettings, setGeneralSettings] = useState({
    autoSave: true,
    showTimestamps: false,
    enableNotifications: true,
    language: "pt-BR",
    maxConversationHistory: 50,
    compactMode: false,
    enableAnalytics: true,
  })

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('chatSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (parsed.models) {
          setModels(parsed.models)
          // Sincronizar modelos habilitados com o contexto
          const enabledModelIds = parsed.models.filter((m: ModelItem) => m.enabled).map((m: ModelItem) => m.id)
          setEnabledModels(enabledModelIds)
        }
        if (parsed.tools) {
          setTools(parsed.tools)
          // Sincronizar ferramentas habilitadas com o contexto
          const enabledToolIds = parsed.tools.filter((t: ToolItem) => t.enabled).map((t: ToolItem) => t.id)
          setEnabledTools(enabledToolIds)
        }
        if (parsed.generalSettings) setGeneralSettings(parsed.generalSettings)
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    } else {
      // Se não há configurações salvas, inicializar com todos habilitados
      const initialEnabledModels = models.filter(m => m.enabled).map(m => m.id)
      const initialEnabledTools = tools.filter(t => t.enabled).map(t => t.id)
      setEnabledModels(initialEnabledModels)
      setEnabledTools(initialEnabledTools)
    }
  }, [models, tools, setEnabledModels, setEnabledTools])

  // Filtrar modelos por busca
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handlers
  const handleModelToggle = useCallback((modelId: string) => {
    setModels(prev => {
      const updatedModels = prev.map(model => 
        model.id === modelId 
          ? { ...model, enabled: !model.enabled }
          : model
      )
      
      // Atualizar o contexto com modelos habilitados
      const enabledModelIds = updatedModels.filter(m => m.enabled).map(m => m.id)
      setEnabledModels(enabledModelIds)
      
      return updatedModels
    })
  }, [setEnabledModels])

  const handleToolToggle = useCallback((toolId: string) => {
    setTools(prev => {
      const updatedTools = prev.map(tool => 
        tool.id === toolId 
          ? { ...tool, enabled: !tool.enabled }
          : tool
      )
      
      // Atualizar o contexto com ferramentas habilitadas
      const enabledToolIds = updatedTools.filter(t => t.enabled).map(t => t.id)
      setEnabledTools(enabledToolIds)
      
      return updatedTools
    })
  }, [setEnabledTools])

  const handleGeneralSettingChange = useCallback((key: string, value: any) => {
    setGeneralSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const handleSaveSettings = useCallback(() => {
    const settings = {
      models,
      tools,
      generalSettings,
      timestamp: Date.now()
    }
    
    localStorage.setItem('chatSettings', JSON.stringify(settings))
    
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram salvas com sucesso.",
    })
  }, [models, tools, generalSettings, toast])

  const handleResetSettings = useCallback(() => {
    // Reset para configurações padrão
    setModels(prev => prev.map(model => ({ ...model, enabled: true })))
    setTools(prev => prev.map(tool => ({ ...tool, enabled: tool.id !== 'image-generation' && tool.id !== 'data-visualization' })))
    setGeneralSettings({
      autoSave: true,
      showTimestamps: false,
      enableNotifications: true,
      language: "pt-BR",
      maxConversationHistory: 50,
      compactMode: false,
      enableAnalytics: true,
    })
    
    toast({
      title: "Configurações resetadas",
      description: "Todas as configurações foram restauradas ao padrão.",
    })
  }, [toast])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={sidebarRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 right-0 z-50 h-full w-80 border-l border-border bg-background/95 backdrop-blur-sm shadow-lg"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/10">
                  <Settings className="h-3.5 w-3.5 text-orange-500" />
                </div>
                <h2 className="text-base font-medium">Configurações</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-muted"
                aria-label="Fechar configurações"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground px-4 py-2.5 border-b border-border/40">
              Configure modelos, ferramentas e preferências.
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-6">
                {/* Seção de Modelos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-orange-500" />
                    <h3 className="font-medium text-sm">Modelos</h3>
                  </div>
                  
                  {/* Busca de modelos */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar modelo"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 text-sm bg-muted/40 border-input/50 rounded-lg"
                    />
                  </div>

                  {/* Lista de modelos */}
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model) => (
                        <div 
                          key={model.id} 
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/60 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className={`w-2 h-2 rounded-full ${model.enabled ? 'bg-orange-500' : 'bg-muted-foreground/30'}`} />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium truncate">{model.name}</span>
                              {model.maxOnly && (
                                <span className="text-xs text-muted-foreground">MAX Only</span>
                              )}
                            </div>
                          </div>
                          <Switch
                            checked={model.enabled}
                            onCheckedChange={() => handleModelToggle(model.id)}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                        Nenhum modelo encontrado
                      </div>
                    )}
                  </div>

                  {/* Botão adicionar modelo */}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-9 text-sm border-dashed border-border/70 hover:bg-muted/50" 
                    size="sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Adicionar modelo
                  </Button>
                </div>

                <Separator className="my-1" />

                {/* Seção de Ferramentas */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <h3 className="font-medium text-sm">Ferramentas</h3>
                  </div>
                  
                  <div className="space-y-1 rounded-lg overflow-hidden border border-border/40 divide-y divide-border/30">
                    {tools.map((tool) => (
                      <div 
                        key={tool.id} 
                        className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/40 transition-colors"
                      >
                        <Label className="text-sm font-medium cursor-pointer truncate" htmlFor={`tool-${tool.id}`}>
                          {tool.name}
                        </Label>
                        <Switch
                          id={`tool-${tool.id}`}
                          checked={tool.enabled}
                          onCheckedChange={() => handleToolToggle(tool.id)}
                          className="data-[state=checked]:bg-orange-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-1" />

                {/* Seção de Parâmetros LLM */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-orange-500" />
                    <h3 className="font-medium text-sm">Parâmetros LLM</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Temperatura */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-foreground/80">Temperatura</Label>
                        <span className="text-xs text-muted-foreground font-mono">{llmSettings.temperature}</span>
                      </div>
                      <Slider
                        value={[llmSettings.temperature]}
                        onValueChange={(value) => updateTemperature(value[0])}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Controla aleatoriedade (0 = determinístico, 2 = criativo)</p>
                    </div>

                    {/* Max Tokens */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-foreground/80">Máximo de Tokens</Label>
                      <Input
                        type="number"
                        value={llmSettings.maxTokens}
                        onChange={(e) => updateMaxTokens(parseInt(e.target.value) || 2048)}
                        min={1}
                        max={32000}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Limite de tokens na resposta</p>
                    </div>

                    {/* Top P */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-foreground/80">Top P</Label>
                        <span className="text-xs text-muted-foreground font-mono">{llmSettings.topP}</span>
                      </div>
                      <Slider
                        value={[llmSettings.topP]}
                        onValueChange={(value) => updateTopP(value[0])}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Diversidade via nucleus sampling</p>
                    </div>

                    {/* Frequency Penalty */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-foreground/80">Penalidade Frequência</Label>
                        <span className="text-xs text-muted-foreground font-mono">{llmSettings.frequencyPenalty}</span>
                      </div>
                      <Slider
                        value={[llmSettings.frequencyPenalty]}
                        onValueChange={(value) => updateFrequencyPenalty(value[0])}
                        max={2}
                        min={-2}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Reduz repetição de tokens</p>
                    </div>

                    {/* Presence Penalty */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-foreground/80">Penalidade Presença</Label>
                        <span className="text-xs text-muted-foreground font-mono">{llmSettings.presencePenalty}</span>
                      </div>
                      <Slider
                        value={[llmSettings.presencePenalty]}
                        onValueChange={(value) => updatePresencePenalty(value[0])}
                        max={2}
                        min={-2}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Encoraja novos tópicos</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-1" />

                {/* Configurações Gerais */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-500" />
                    <h3 className="font-medium text-sm">Configurações</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Configurações com switches */}
                    <div className="space-y-0 rounded-lg overflow-hidden border border-border/40 divide-y divide-border/30">
                      <div className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/40 transition-colors">
                        <Label className="text-sm font-medium">Auto-save</Label>
                        <Switch
                          checked={generalSettings.autoSave}
                          onCheckedChange={(checked) => handleGeneralSettingChange('autoSave', checked)}
                          className="data-[state=checked]:bg-orange-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/40 transition-colors">
                        <Label className="text-sm font-medium">Timestamps</Label>
                        <Switch
                          checked={generalSettings.showTimestamps}
                          onCheckedChange={(checked) => handleGeneralSettingChange('showTimestamps', checked)}
                          className="data-[state=checked]:bg-orange-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/40 transition-colors">
                        <Label className="text-sm font-medium">Notificações</Label>
                        <Switch
                          checked={generalSettings.enableNotifications}
                          onCheckedChange={(checked) => handleGeneralSettingChange('enableNotifications', checked)}
                          className="data-[state=checked]:bg-orange-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/40 transition-colors">
                        <Label className="text-sm font-medium">Modo compacto</Label>
                        <Switch
                          checked={generalSettings.compactMode}
                          onCheckedChange={(checked) => handleGeneralSettingChange('compactMode', checked)}
                          className="data-[state=checked]:bg-orange-500"
                        />
                      </div>
                    </div>

                    {/* Configurações com select */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-foreground/80">Idioma</Label>
                        <Select
                          value={generalSettings.language}
                          onValueChange={(value) => handleGeneralSettingChange('language', value)}
                        >
                          <SelectTrigger className="h-9 text-sm bg-muted/40 border-input/50 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português</SelectItem>
                            <SelectItem value="en-US">English</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-foreground/80">Max. conversas</Label>
                        <Select
                          value={generalSettings.maxConversationHistory.toString()}
                          onValueChange={(value) => handleGeneralSettingChange('maxConversationHistory', parseInt(value))}
                        >
                          <SelectTrigger className="h-9 text-sm bg-muted/40 border-input/50 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Botões de Ação */}
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveSettings} 
                  className="flex-1 h-10 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button 
                  onClick={handleResetSettings} 
                  variant="outline" 
                  className="flex-1 h-10 border-border/60 hover:bg-muted"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 