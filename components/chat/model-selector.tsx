"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Infinity, Search, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/app-context"
import type { AIModel } from "@/types/chat"

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { selectedModel, setSelectedModel, userPreferences } = useApp()

  // Lista completa de modelos baseada nas imagens fornecidas
  const models: AIModel[] = [
    // ChatGPT models
    { id: "chatgpt-4.1-nano", name: "ChatGPT 4.1 nano", provider: "openai", isNew: true, isInfinite: true },
    { id: "chatgpt-4.1-mini", name: "ChatGPT 4.1 mini", provider: "openai", isNew: true },
    { id: "chatgpt-4.1", name: "ChatGPT 4.1", provider: "openai", isNew: true },
    { id: "chatgpt-4o-mini", name: "ChatGPT 4o mini", provider: "openai", isInfinite: true },
    { id: "chatgpt-4o", name: "ChatGPT 4o", provider: "openai", isInfinite: true },
    { id: "chatgpt-4o-latest", name: "ChatGPT 4o Latest", provider: "openai", isInfinite: true },

    // o models
    { id: "o4-mini-high", name: "o4 mini High", provider: "openai", isNew: true, isInfinite: true },
    { id: "o4-mini", name: "o4 mini", provider: "openai", isNew: true, isInfinite: true },
    { id: "o3", name: "o3", provider: "openai", isNew: true },
    { id: "o3-mini", name: "o3 mini", provider: "openai", isInfinite: true },
    { id: "o3-mini-high", name: "o3 mini High", provider: "openai", isInfinite: true },
    { id: "o1", name: "o1", provider: "openai" },
    { id: "o1-mini", name: "o1 mini", provider: "openai" },

    // DeepSeek models
    { id: "deepseek-r1", name: "DeepSeek R1", provider: "deepseek", isNew: true },
    { id: "deepseek-r1-small", name: "DeepSeek R1 Small", provider: "deepseek", isNew: true, isInfinite: true },
    { id: "deepseek-v3.1", name: "DeepSeek V3.1", provider: "deepseek", isUpdated: true },

    // Qwen models
    { id: "qwen-2.5-32b", name: "Qwen 2.5 32B", provider: "qwen", isNew: true, isInfinite: true },
    { id: "qwen-2.5-coder-32b", name: "Qwen 2.5 Coder 32B", provider: "qwen", isNew: true, isInfinite: true },
    { id: "qwen-qwq-32b", name: "Qwen QwQ 32B", provider: "qwen", isNew: true, isInfinite: true },

    // Gemini models
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", isNew: true, isBeta: true },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", isInfinite: true },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "google", isBeta: true, isInfinite: true },
    {
      id: "gemini-2.0-flash-thinking",
      name: "Gemini 2.0 Flash Thinking",
      provider: "google",
      isBeta: true,
      isInfinite: true,
    },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google", isBeta: true, isInfinite: true },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google", isInfinite: true },

    // Claude models
    { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "anthropic", isNew: true, isInfinite: true },
    { id: "claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "anthropic", isNew: true },
    { id: "claude-3.7-sonnet-thinking", name: "Claude 3.7 Sonnet Thinking", provider: "anthropic", isNew: true },
    { id: "claude-3-opus", name: "Claude 3 Opus", provider: "anthropic" },

    // Grok models
    { id: "grok-3-mini", name: "Grok 3 mini", provider: "xai", isNew: true },
    { id: "grok-3-mini-fast", name: "Grok 3 mini Fast", provider: "xai", isNew: true },
    { id: "grok-3", name: "Grok 3", provider: "xai", isNew: true },
    { id: "grok-3-fast", name: "Grok 3 Fast", provider: "xai", isNew: true },
    { id: "grok-2", name: "Grok 2", provider: "xai" },

    // Llama models
    { id: "llama-4-maverick", name: "Llama 4 Maverick", provider: "meta", isNew: true },
    { id: "llama-4-scout", name: "Llama 4 Scout", provider: "meta", isNew: true },
    { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "meta", isNew: true, isInfinite: true },
    { id: "llama-3.2-11b", name: "Llama 3.2 11B", provider: "meta", isInfinite: true },
  ]

  // Filtra modelos com base na pesquisa
  const filteredModels = models.filter(
    (model) =>
      searchQuery === "" ||
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Agrupar modelos por provedor
  const modelsByProvider = filteredModels.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    },
    {} as Record<string, AIModel[]>,
  )

  // Função para obter o ícone do provedor
  const getProviderIcon = (provider: string) => {
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
  }

  // Nomes de exibição para os provedores
  const providerNames: Record<string, string> = {
    openai: "OpenAI",
    deepseek: "DeepSeek",
    qwen: "Qwen",
    google: "Google",
    anthropic: "Anthropic",
    xai: "xAI",
    meta: "Meta",
  }

  useEffect(() => {
    // Função para fechar o popover quando clicar fora dele
    const handleClickOutside = (event: MouseEvent) => {
      const popoverElement = document.querySelector(".model-selector")
      if (popoverElement && !popoverElement.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    // Adiciona o event listener quando o popover estiver aberto
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Limpa o event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} className="model-selector">
      <PopoverTrigger asChild>
          <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1 h-6 px-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 rounded-full"
          data-component="ModelSelector"
          data-component-path="@/components/chat/model-selector"
          onClick={() => setIsOpen(true)}
        >
          <span className="w-3 h-3 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-[8px] mr-1">
            {typeof getProviderIcon(selectedModel.provider) === "string"
              ? getProviderIcon(selectedModel.provider)
              : getProviderIcon(selectedModel.provider)}
          </span>
          <span className="text-[10px]">{selectedModel.name}</span>
          {selectedModel.isInfinite && <Infinity className="h-2.5 w-2.5 ml-1 text-gray-500 dark:text-gray-400" />}
          <ChevronDown className="h-2 w-2 ml-1 text-gray-500 dark:text-gray-400 transform rotate-180" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[350px] p-0 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-colors duration-200"
        align="start"
        onInteractOutside={() => setIsOpen(false)}
        onEscapeKeyDown={() => setIsOpen(false)}
      >
        <Tabs defaultValue="all">
          <div className="border-b border-gray-100 dark:border-gray-700 px-3 py-2">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Buscar modelos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <ScrollArea className="h-80 scrollbar-thin">
              {Object.keys(modelsByProvider).length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">Nenhum modelo encontrado</div>
              ) : (
                Object.keys(modelsByProvider).map((provider) => (
                  <div key={provider} className="py-2">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {providerNames[provider] || provider}
                    </div>
                    <div className="space-y-0.5">
                      {modelsByProvider[provider].map((model) => (
                        <button
                          key={model.id}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200 ${
                            model.id === selectedModel.id ? "bg-primary/5 dark:bg-primary/10" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedModel(model)
                            setIsOpen(false)
                          }}
                        >
                          <div className="flex items-center">
                            <span className="w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] mr-2">
                              {typeof getProviderIcon(model.provider) === "string"
                                ? getProviderIcon(model.provider)
                                : getProviderIcon(model.provider)}
                            </span>
                            <span className="text-sm text-gray-800 dark:text-gray-200">{model.name}</span>
                            {model.isInfinite && <Infinity className="h-3 w-3 ml-1.5 text-gray-500 dark:text-gray-400" />}
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
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <ScrollArea className="h-80 scrollbar-thin">
              {userPreferences?.recentModels?.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center">
                  <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p>Nenhum modelo recente</p>
                  <p className="text-xs mt-1 max-w-[250px]">
                    Os modelos que você usar aparecerão aqui para acesso rápido
                  </p>
                </div>
              ) : (
                <div className="py-2 space-y-0.5">
                  {userPreferences?.recentModels?.map((model) => (
                    <button
                      key={model.id}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200 ${
                        model.id === selectedModel.id ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedModel(model)
                        setIsOpen(false)
                      }}
                    >
                      <div className="flex items-center">
                        <span className="w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] mr-2">
                          {typeof getProviderIcon(model.provider) === "string"
                            ? getProviderIcon(model.provider)
                            : getProviderIcon(model.provider)}
                        </span>
                        <span className="text-sm text-gray-800 dark:text-gray-200">{model.name}</span>
                        {model.isInfinite && <Infinity className="h-3 w-3 ml-1.5 text-gray-500 dark:text-gray-400" />}
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
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
