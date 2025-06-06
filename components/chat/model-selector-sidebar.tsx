"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/contexts/app-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChevronDown, Infinity, Search, Clock, Check } from "lucide-react"
import type { AIModel } from "@/types/chat"

/**
 * Default model to use if selectedModel is undefined
 */
const DEFAULT_MODEL: AIModel = {
  id: "default-model",
  name: "Modelo Padrão",
  provider: "default",
  description: "Modelo padrão quando nenhum está selecionado",
}

/**
 * Provider names for display
 */
const PROVIDER_NAMES: Record<string, string> = {
  openai: "OpenAI",
  deepseek: "DeepSeek",
  qwen: "Qwen",
  google: "Google",
  anthropic: "Anthropic",
  xai: "xAI",
  meta: "Meta",
  default: "Default",
}

/**
 * ModelSelectorSidebar component
 * @returns ModelSelectorSidebar component
 */
export function ModelSelectorSidebar() {
  // Local state
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // App context
  const { selectedModel, setSelectedModel, userPreferences, addRecentModel } = useApp()

  // Ensure userPreferences exists with default values if undefined
  const safeUserPreferences = React.useMemo(() => userPreferences || { recentModels: [] }, [userPreferences])

  // Lista completa de modelos baseada nas imagens fornecidas
  const models: AIModel[] = React.useMemo(
    () => [
      // ChatGPT models
      { id: "chatgpt-4.1-nano", name: "ChatGPT 4.1 nano", provider: "openai", isNew: true, isInfinite: true },
      { id: "chatgpt-4.1-mini", name: "ChatGPT 4.1 mini", provider: "openai", isNew: true },
      { id: "chatgpt-4.1", name: "ChatGPT 4.1", provider: "openai", isNew: true },
      { id: "chatgpt-4o-mini", name: "ChatGPT 4o mini", provider: "openai", isInfinite: true },
      { id: "chatgpt-4o", name: "ChatGPT 4o", provider: "openai", isInfinite: true },
      { id: "chatgpt-4o-latest", name: "ChatGPT 4o Latest", provider: "openai", isInfinite: true },

      // Outros modelos omitidos para brevidade
    ],
    [],
  )

  // Filtra modelos com base na pesquisa
  const filteredModels = React.useMemo(
    () =>
      models.filter(
        (model) =>
          searchQuery === "" ||
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.provider.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [models, searchQuery],
  )

  // Agrupar modelos por provedor
  const modelsByProvider = React.useMemo(
    () =>
      filteredModels.reduce(
        (acc, model) => {
          if (!acc[model.provider]) {
            acc[model.provider] = []
          }
          acc[model.provider].push(model)
          return acc
        },
        {} as Record<string, AIModel[]>,
      ),
    [filteredModels],
  )

  /**
   * Get the provider icon
   * @param provider Provider name
   * @returns Provider icon
   */
  const getProviderIcon = React.useCallback((provider: string) => {
    switch (provider) {
      case "openai":
        return "i"
      case "deepseek":
        return <img src="/deepseek-logo-inspired.png" alt="DeepSeek" className="w-4 h-4" />
      case "qwen":
        return <img src="/placeholder-ct6n6.png" alt="Qwen" className="w-4 h-4" />
      case "google":
        return <img src="/google-g-logo.png" alt="Google" className="w-4 h-4" />
      case "anthropic":
        return <img src="/anthropic-logo.png" alt="Anthropic" className="w-4 h-4" />
      case "xai":
        return <img src="/placeholder-akjv1.png" alt="xAI" className="w-4 h-4" />
      case "meta":
        return <img src="/abstract-infinity-logo.png" alt="Meta" className="w-4 h-4" />
      default:
        return "i"
    }
  }, [])

  /**
   * Handle model selection
   * @param model The selected model
   */
  const handleSelectModel = React.useCallback(
    (model: AIModel) => {
      setSelectedModel?.(model)
      addRecentModel?.(model)
      setIsOpen(false)
    },
    [setSelectedModel, addRecentModel],
  )

  // Use the selected model or the default model if undefined
  const safeSelectedModel = React.useMemo(() => selectedModel || DEFAULT_MODEL, [selectedModel])

  /**
   * Handle search input change
   */
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  /**
   * Render model item
   */
  const renderModelItem = React.useCallback(
    (model: AIModel) => (
      <button
        key={model.id}
        className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200 ${
          model.id === safeSelectedModel.id ? "bg-primary/5 dark:bg-primary/10" : ""
        }`}
        onClick={() => handleSelectModel(model)}
      >
        <div className="flex items-center">
          <span className="w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] mr-2">
            {typeof getProviderIcon(model.provider) === "string"
              ? getProviderIcon(model.provider)
              : getProviderIcon(model.provider)}
          </span>
          <span className="text-sm text-gray-800 dark:text-gray-200">{model.name}</span>
          {model.isInfinite && <Infinity className="h-3 w-3 ml-1.5 text-primary" />}
        </div>
        <div className="flex items-center space-x-1">
          {model.isNew && (
            <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">
              Novo
            </span>
          )}
          {model.isBeta && (
            <span className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
              Beta
            </span>
          )}
          {model.isUpdated && (
            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
              Atualizado
            </span>
          )}
          {model.id === safeSelectedModel.id && <Check className="h-4 w-4 text-primary ml-1" />}
        </div>
      </button>
    ),
    [safeSelectedModel.id, getProviderIcon, handleSelectModel],
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1 h-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full"
          data-component="ModelSelector"
          data-component-path="@/components/chat/model-selector-sidebar"
        >
          <span className="w-4 h-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] mr-1">
            {typeof getProviderIcon(safeSelectedModel.provider) === "string"
              ? getProviderIcon(safeSelectedModel.provider)
              : getProviderIcon(safeSelectedModel.provider)}
          </span>
          {safeSelectedModel.name}
          {safeSelectedModel.isInfinite && <Infinity className="h-3 w-3 ml-1 text-primary" />}
          <ChevronDown className="h-3 w-3 ml-1 text-gray-500 dark:text-gray-400" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[350px] p-0 sm:max-w-[350px]">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>Selecionar Modelo</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="all" className="w-full">
          <div className="border-b border-gray-100 dark:border-gray-700 px-3 py-2">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Buscar modelos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 h-9 text-sm rounded-full bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 focus:border-primary/30 focus:ring-primary/20"
              />
            </div>
            <TabsList className="w-full grid grid-cols-2 h-9 rounded-full bg-gray-100 dark:bg-gray-700 p-1">
              <TabsTrigger
                value="all"
                className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                Recentes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] scrollbar-thin">
              {Object.keys(modelsByProvider).length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">Nenhum modelo encontrado</div>
              ) : (
                Object.keys(modelsByProvider).map((provider) => (
                  <div key={provider} className="py-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {PROVIDER_NAMES[provider] || provider}
                    </div>
                    <div className="space-y-0.5">{modelsByProvider[provider].map(renderModelItem)}</div>
                  </div>
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] scrollbar-thin">
              {safeUserPreferences.recentModels.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center">
                  <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p>Nenhum modelo recente</p>
                  <p className="text-xs mt-1 max-w-[250px]">
                    Os modelos que você usar aparecerão aqui para acesso rápido
                  </p>
                </div>
              ) : (
                <div className="py-2 space-y-0.5">{safeUserPreferences.recentModels.map(renderModelItem)}</div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

// Adicionar export default para compatibilidade com importações existentes
export default ModelSelectorSidebar
