"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown, Settings, Plus, Save, Trash2, Star, StarOff, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useApp } from "@/context/app-context"
import { DEFAULT_PERSONALITIES } from "./personality-selector"
import { DEFAULT_TOOLS } from "./tool-selector"

// Interface para presets
interface ChatPreset {
  id: string
  name: string
  description?: string
  model: string
  tool: string
  personality: string
  temperature: number
  isFavorite: boolean
  createdAt: number
}

// Presets padrão do sistema
const SYSTEM_PRESETS: ChatPreset[] = [
  {
    id: "default",
    name: "Padrão",
    description: "Configuração equilibrada para uso geral",
    model: "gpt-4o",
    tool: "tools",
    personality: "natural",
    temperature: 0.7,
    isFavorite: false,
    createdAt: Date.now()
  },
  {
    id: "academic",
    name: "Acadêmico",
    description: "Ideal para pesquisa e análise acadêmica",
    model: "gpt-4o",
    tool: "deep-analysis",
    personality: "sistematica",
    temperature: 0.1,
    isFavorite: false,
    createdAt: Date.now()
  },
  {
    id: "creative",
    name: "Criativo",
    description: "Para brainstorming e ideias inovadoras",
    model: "gpt-4o",
    tool: "image-generation",
    personality: "imaginativa",
    temperature: 1.0,
    isFavorite: false,
    createdAt: Date.now()
  },
  {
    id: "research",
    name: "Pesquisa",
    description: "Para busca e análise de informações",
    model: "gpt-4o",
    tool: "internet",
    personality: "objetiva",
    temperature: 0.3,
    isFavorite: false,
    createdAt: Date.now()
  }
]

export default function PresetSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPresetName, setNewPresetName] = useState("")
  const [newPresetDescription, setNewPresetDescription] = useState("")
  const [userPresets, setUserPresets] = useState<ChatPreset[]>([])
  
  const { 
    preset, 
    setPreset, 
    selectedModel, 
    selectedTool, 
    selectedPersonality,
    applyPreset 
  } = useApp()

  // Carregar presets do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPresets = localStorage.getItem('chatPresets')
        if (savedPresets) {
          setUserPresets(JSON.parse(savedPresets))
        }
      } catch (error) {
        console.error('Erro ao carregar presets:', error)
      }
    }
  }, [])

  // Salvar presets no localStorage
  const savePresets = (presets: ChatPreset[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('chatPresets', JSON.stringify(presets))
        setUserPresets(presets)
      } catch (error) {
        console.error('Erro ao salvar presets:', error)
      }
    }
  }

  // Combinar presets do sistema com presets do usuário
  const allPresets = [...SYSTEM_PRESETS, ...userPresets]
  const selectedPreset = allPresets.find(p => p.id === preset) || SYSTEM_PRESETS[0]

  // Criar novo preset
  const createPreset = () => {
    if (!newPresetName.trim()) return

    // Obter temperature da personalidade atual
    const currentPersonality = DEFAULT_PERSONALITIES.find(p => p.id === selectedPersonality)
    const temperature = currentPersonality?.temperature || 0.7

    const newPreset: ChatPreset = {
      id: `user_${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDescription.trim() || undefined,
      model: selectedModel.id,
      tool: selectedTool,
      personality: selectedPersonality,
      temperature: temperature,
      isFavorite: false,
      createdAt: Date.now()
    }

    const updatedPresets = [...userPresets, newPreset]
    savePresets(updatedPresets)
    
    setNewPresetName("")
    setNewPresetDescription("")
    setIsCreateDialogOpen(false)
    
    // Aplicar o novo preset
    setPreset(newPreset.id)
  }

  // Deletar preset
  const deletePreset = (presetId: string) => {
    const updatedPresets = userPresets.filter(p => p.id !== presetId)
    savePresets(updatedPresets)
    
    // Se o preset deletado estava selecionado, voltar ao padrão
    if (preset === presetId) {
      setPreset("default")
    }
  }

  // Favoritar/desfavoritar preset
  const toggleFavorite = (presetId: string) => {
    const updatedPresets = userPresets.map(p => 
      p.id === presetId ? { ...p, isFavorite: !p.isFavorite } : p
    )
    savePresets(updatedPresets)
  }

  // Aplicar preset
  const handlePresetSelect = (selectedPreset: ChatPreset) => {
    setPreset(selectedPreset.id)
    applyPreset({
      model: selectedPreset.model,
      tool: selectedPreset.tool,
      personality: selectedPreset.personality
    })
    setIsOpen(false)
  }

  // Obter ícone do preset baseado na personalidade
  const getPresetIcon = (presetPersonality: string) => {
    const personalityObj = DEFAULT_PERSONALITIES.find(p => p.id === presetPersonality)
    return personalityObj?.icon || <Settings className="h-4 w-4" />
  }

  // Obter nome da ferramenta
  const getToolName = (toolId: string) => {
    const tool = DEFAULT_TOOLS.find(t => t.id === toolId)
    return tool?.name || toolId
  }

  // Obter nome da personalidade
  const getPersonalityName = (personalityId: string) => {
    const personalityObj = DEFAULT_PERSONALITIES.find(p => p.id === personalityId)
    return personalityObj?.name || personalityId
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="chat-selector-button h-5 relative overflow-hidden group"
              style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
              onClick={() => setIsOpen(true)}
            >
              <span className="text-purple-500 dark:text-gray-400 text-[8px] group-hover:text-purple-600 dark:group-hover:text-gray-300 transition-colors">
                {getPresetIcon(selectedPreset.personality) ? (
                  <span className="w-2 h-2 flex items-center justify-center">
                    {getPresetIcon(selectedPreset.personality)}
                  </span>
                ) : (
                  "⚙"
                )}
              </span>
              <span className="font-light text-[7px] tracking-tight mx-0.5">{selectedPreset.name}</span>
              <ChevronDown className="h-1.5 w-1.5 text-gray-400 dark:text-gray-500 ml-0.5 group-hover:text-primary/70 transition-colors" />
              
              {/* Efeito sutil de destaque */}
              <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm" />
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[340px] p-0 border border-gray-100 dark:border-gray-700 shadow-xl rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md transition-all duration-300"
          align="start"
        >
          {/* Header with Create Button */}
          <div className="p-4 border-b border-gray-100/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-800/50 dark:to-gray-900/30 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Presets de Configuração
            </span>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 px-3 rounded-lg bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-600 shadow-sm">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Criar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Preset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="preset-name">Nome do Preset</Label>
                    <Input
                      id="preset-name"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="Ex: Meu Preset Personalizado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preset-description">Descrição (opcional)</Label>
                    <Input
                      id="preset-description"
                      value={newPresetDescription}
                      onChange={(e) => setNewPresetDescription(e.target.value)}
                      placeholder="Descreva quando usar este preset"
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div><strong>Configuração atual:</strong></div>
                    <div>• Modelo: {selectedModel.name}</div>
                    <div>• Ferramenta: {getToolName(selectedTool)}</div>
                    <div>• Personalidade: {getPersonalityName(selectedPersonality)}</div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={createPreset}
                    disabled={!newPresetName.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Presets List */}
          <ScrollArea className="h-80 scrollbar-thin">
            <div className="py-1">
              {/* System Presets */}
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider bg-gradient-to-r from-gray-50/80 to-transparent dark:from-gray-700/50 dark:to-transparent border-l-2 border-purple-500/30">
                  Presets do Sistema
                </div>
                {SYSTEM_PRESETS.map((presetItem) => (
                  <button
                    key={presetItem.id}
                    className={`w-full px-3 py-2 text-left hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/40 dark:hover:from-gray-700/80 dark:hover:to-gray-600/40 flex items-center transition-all duration-300 rounded-lg mx-1 ${
                      presetItem.id === preset ? "bg-gradient-to-r from-purple-50/80 to-purple-100/40 dark:from-purple-900/20 dark:to-purple-800/10 shadow-sm border border-purple-200/50 dark:border-purple-700/50" : ""
                    }`}
                    onClick={() => handlePresetSelect(presetItem)}
                  >
                                          <div className="flex items-center w-full gap-2">
                        <div className="flex-shrink-0 h-6 w-6 rounded-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200/50 dark:border-purple-700/50">
                          {React.cloneElement(getPresetIcon(presetItem.personality) as React.ReactElement, { className: "h-3 w-3" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {presetItem.name}
                                </span>
                                {presetItem.id === preset && (
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                )}
                              </div>
                              {presetItem.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0 line-clamp-1">
                                  {presetItem.description}
                                </div>
                              )}
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1 py-0.5 rounded-sm">
                                  {getToolName(presetItem.tool)}
                                </span>
                                <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1 py-0.5 rounded-sm">
                                  {getPersonalityName(presetItem.personality)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </button>
                ))}
              </div>

              {/* User Presets */}
              {userPresets.length > 0 && (
                <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Meus Presets
                  </div>
                  {userPresets.map((presetItem) => (
                    <div
                      key={presetItem.id}
                      className={`group relative ${
                        presetItem.id === preset ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                    >
                      <button
                        className="w-full px-3 py-2 text-left hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/40 dark:hover:from-gray-700/80 dark:hover:to-gray-600/40 flex items-center transition-all duration-300"
                        onClick={() => handlePresetSelect(presetItem)}
                      >
                                                  <div className="flex items-center w-full gap-2">
                            <div className="flex-shrink-0 h-6 w-6 rounded-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200/50 dark:border-purple-700/50">
                              {presetItem.isFavorite ? (
                                <Star className="h-3 w-3 text-yellow-500" />
                              ) : (
                                React.cloneElement(getPresetIcon(presetItem.personality) as React.ReactElement, { className: "h-3 w-3" })
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {presetItem.name}
                                    </span>
                                    {presetItem.id === preset && (
                                      <Check className="h-3.5 w-3.5 text-primary" />
                                    )}
                                  </div>
                                                                     {presetItem.description && (
                                     <div className="text-xs text-gray-500 dark:text-gray-400 mt-0 line-clamp-1">
                                       {presetItem.description}
                                     </div>
                                   )}
                                   <div className="flex items-center gap-1 mt-0.5">
                                     <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1 py-0.5 rounded-sm">
                                       {getToolName(presetItem.tool)}
                                     </span>
                                     <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1 py-0.5 rounded-sm">
                                       {getPersonalityName(presetItem.personality)}
                                     </span>
                                   </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleFavorite(presetItem.id)
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                                  >
                                    {presetItem.isFavorite ? (
                                      <Star className="h-3 w-3 text-yellow-500" />
                                    ) : (
                                      <StarOff className="h-3 w-3 text-gray-400" />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deletePreset(presetItem.id)
                                    }}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  )
}
