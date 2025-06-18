"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Infinity, Search, Clock, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/app-context"
import { AVAILABLE_MODELS } from "@/constants/models"
import type { AIModel } from "@/types/chat"

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { selectedModel, setSelectedModel, userPreferences, enabledModels } = useApp()

  // Usar a lista centralizada de modelos, filtrada pelas configurações
  const models: AIModel[] = AVAILABLE_MODELS.filter(model => 
    enabledModels.length === 0 || enabledModels.includes(model.id)
  )

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

  // Função para obter o ícone do provedor (cores oficiais)
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "openai":
        return (
          <div className="w-4 h-4 bg-black dark:bg-white rounded-sm flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
            </svg>
          </div>
        )
      case "deepseek":
        return (
          <div className="w-4 h-4 bg-gradient-to-r from-[#1E40AF] to-[#7C3AED] rounded-sm flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">DS</span>
          </div>
        )
      case "qwen":
        return (
          <div className="w-4 h-4 bg-gradient-to-r from-[#DC2626] to-[#EA580C] rounded-sm flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">通</span>
          </div>
        )
      case "google":
        return (
          <div className="w-4 h-4 rounded-full overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        )
      case "anthropic":
        return (
          <div className="w-4 h-4 bg-gradient-to-r from-[#D97706] to-[#DC2626] rounded-sm flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">A</span>
          </div>
        )
      case "xai":
        return (
          <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        )
      case "meta":
        return (
          <div className="w-4 h-4 bg-gradient-to-r from-[#1877F2] to-[#0E4B99] rounded-full flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">M</span>
          </div>
        )
      default:
        return (
          <div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">?</span>
          </div>
        )
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
            data-component="ModelSelector"
            data-component-path="@/components/chat/model-selector"
            onClick={() => setIsOpen(true)}
          >
            <span className="w-2 h-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-[6px] group-hover:bg-primary/10 transition-colors">
              {typeof getProviderIcon(selectedModel.provider) === "string"
                ? getProviderIcon(selectedModel.provider)
                : getProviderIcon(selectedModel.provider)}
            </span>
            <span className="font-light text-[7px] tracking-tight mx-0.5">{selectedModel.name}</span>
            {selectedModel.isInfinite && <Infinity className="h-1.5 w-1.5 text-gray-400 dark:text-gray-500" />}
            <ChevronDown className="h-1.5 w-1.5 text-gray-400 dark:text-gray-500 ml-0.5 group-hover:text-primary/70 transition-colors" />
            
            {/* Efeito sutil de destaque */}
            <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm" />
          </Button>
        </motion.div>
      </PopoverTrigger>
              <PopoverContent
        className="w-[380px] p-0 border border-gray-100 dark:border-gray-700 shadow-xl rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md transition-all duration-300"
        align="start"
        onInteractOutside={() => setIsOpen(false)}
        onEscapeKeyDown={() => setIsOpen(false)}
      >
        <Tabs defaultValue="all" className="w-full">
          <div className="border-b border-gray-100/50 dark:border-gray-700/50 px-4 py-3 bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-800/50 dark:to-gray-900/30">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Buscar modelos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm rounded-xl bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 focus:border-primary/40 focus:ring-primary/30 shadow-sm backdrop-blur-sm"
              />
            </div>
            <TabsList className="w-full grid grid-cols-2 h-10 rounded-xl bg-white/60 dark:bg-gray-700/60 p-1 shadow-sm backdrop-blur-sm">
              <TabsTrigger
                value="all"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-[0.98] transition-all duration-200"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-[0.98] transition-all duration-200"
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
                    <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider bg-gradient-to-r from-gray-50/80 to-transparent dark:from-gray-700/50 dark:to-transparent border-l-2 border-primary/30">
                      {providerNames[provider] || provider}
                    </div>
                    <div className="space-y-0.5">
                      <AnimatePresence>
                        {modelsByProvider[provider].map((model) => (
                          <motion.button
                            key={model.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className={`w-full px-3 py-2.5 text-left hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/40 dark:hover:from-gray-700/80 dark:hover:to-gray-600/40 flex items-center justify-between transition-all duration-300 relative rounded-lg mx-1 ${
                              model.id === selectedModel.id ? "bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 shadow-sm border border-primary/20" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedModel(model)
                              setIsOpen(false)
                            }}
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <div className="w-5 h-5 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md mr-2.5 shadow-sm border border-gray-200/60 dark:border-gray-600/60 flex-shrink-0">
                                {getProviderIcon(model.provider)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{model.name}</span>
                                  {model.isInfinite && <Infinity className="h-3 w-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />}
                                </div>
                              </div>
                            </div>
                                                          <div className="flex items-center gap-1 flex-shrink-0">
                                {model.id === selectedModel.id && (
                                  <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-primary"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </motion.span>
                                )}
                                {model.isNew && (
                                  <span className="text-[10px] bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium shadow-sm border border-green-200/50 dark:border-green-700/50">
                                    Novo
                                  </span>
                                )}
                                {model.isBeta && (
                                  <span className="text-[10px] bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-medium shadow-sm border border-amber-200/50 dark:border-amber-700/50">
                                    Beta
                                  </span>
                                )}
                                {model.isUpdated && (
                                  <span className="text-[10px] bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium shadow-sm border border-blue-200/50 dark:border-blue-700/50">
                                    Atualizado
                                  </span>
                                )}
                              </div>
                            
                            {/* Efeito sutil de destaque */}
                            {model.id === selectedModel.id && (
                              <motion.span 
                                layoutId="selectedModelHighlight"
                                className="absolute inset-0 bg-primary/5 dark:bg-primary/10 border-l-2 border-primary"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <ScrollArea className="h-80 scrollbar-thin">
              {!userPreferences?.recentModels?.length ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                  </motion.div>
                  <p>Nenhum modelo recente</p>
                  <p className="text-xs mt-1 max-w-[250px]">
                    Os modelos que você usar aparecerão aqui para acesso rápido
                  </p>
                </div>
              ) : (
                <div className="py-2 space-y-0.5">
                  <AnimatePresence>
                    {userPreferences?.recentModels?.map((model) => (
                      <motion.button
                        key={model.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200 relative ${
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
                          {model.id === selectedModel.id && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="mr-1 text-primary"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </motion.span>
                          )}
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
                        
                        {/* Destaque sutil para modelo selecionado */}
                        {model.id === selectedModel.id && (
                          <motion.span 
                            layoutId="selectedModelHighlight"
                            className="absolute inset-0 bg-primary/5 dark:bg-primary/10 border-l-2 border-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
