"use client"

import { useCallback, useState } from "react"
import { useApp } from "@/context/app-context"
import type { Conversation } from "@/types/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Share, 
  Download, 
  Eye, 
  EyeOff, 
  Trash, 
  Pencil, 
  Copy, 
  History, 
  Plus, 
  Settings, 
  MessageSquare,
  Check,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatHeaderProps {
  currentConversation: Conversation | undefined
  currentConversationId: string | null
  conversations: Conversation[]
  onNewConversation: () => void
  onUpdateConversationTitle: (title: string) => void
  onDeleteConversation: (id: string) => void
  onExportConversation: () => void
  onToggleSidebar: () => void
  onToggleHistorySidebar: () => void
  onSelectConversation: (id: string) => void
  isHistorySidebarOpen: boolean
  onToggleComponentSelector?: () => void
  onToggleFocusMode?: () => void
  onToggleChatSettings?: () => void
}

export function ChatHeader({
  currentConversation,
  currentConversationId,
  conversations,
  onNewConversation,
  onUpdateConversationTitle,
  onDeleteConversation,
  onExportConversation,
  onToggleSidebar,
  onToggleHistorySidebar,
  onSelectConversation,
  isHistorySidebarOpen,
  onToggleComponentSelector,
  onToggleFocusMode,
  onToggleChatSettings,
}: ChatHeaderProps) {
  const { focusMode, setFocusMode, isComponentSelectorActive } = useApp()
  const { toast } = useToast()
  
  // Estados para edição inline do título
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTitle, setEditingTitle] = useState("")
  
  // Estado para o modal de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleToggleFocusMode = useCallback(() => {
    if (onToggleFocusMode) {
      onToggleFocusMode()
    } else if (setFocusMode) {
      setFocusMode(!focusMode)
      
      toast({
        title: focusMode ? "Modo foco desativado" : "Modo foco ativado",
        description: focusMode 
          ? "Voltando ao modo normal" 
          : "Modo foco ativado",
        duration: 2000,
      })
    }
  }, [onToggleFocusMode, setFocusMode, focusMode, toast])

  const handleShareConversation = useCallback(() => {
    if (!currentConversation) return
    
    const shareUrl = `${window.location.origin}/chat/${currentConversation.id}`
    navigator.clipboard.writeText(shareUrl)
    
    toast({
      title: "Link copiado",
      description: "Link da conversa copiado",
      duration: 2000,
    })
  }, [currentConversation, toast])

  const handleExportConversation = useCallback(() => {
    if (!currentConversation) return
    onExportConversation()
  }, [currentConversation, onExportConversation])

  const handleDeleteCurrentConversation = useCallback(() => {
    if (!currentConversationId) return
    setIsDeleteDialogOpen(true)
  }, [currentConversationId])
  
  const confirmDeleteConversation = useCallback(() => {
    if (!currentConversationId) return
    onDeleteConversation(currentConversationId)
    setIsDeleteDialogOpen(false)
  }, [currentConversationId, onDeleteConversation])

  const handleCopyConversation = useCallback(() => {
    if (!currentConversation) return
    onNewConversation()
    
    toast({
      title: "Conversa duplicada",
      description: "Cópia da conversa criada",
      duration: 2000,
    })
  }, [currentConversation, onNewConversation, toast])

  // Edição inline do título
  const startEditingTitle = useCallback(() => {
    if (!currentConversation) return
    setEditingTitle(currentConversation.title || "Nova conversa")
    setIsEditingTitle(true)
  }, [currentConversation])

  const saveTitle = useCallback(() => {
    if (!editingTitle.trim()) {
      toast({
        title: "Título inválido",
        description: "O título não pode estar vazio",
        variant: "destructive"
      })
      return
    }
    
    onUpdateConversationTitle(editingTitle)
    setIsEditingTitle(false)
    
    toast({
      title: "Título atualizado",
      description: "Título da conversa atualizado",
      duration: 2000,
    })
  }, [editingTitle, onUpdateConversationTitle, toast])

  const cancelEditingTitle = useCallback(() => {
    setIsEditingTitle(false)
    setEditingTitle("")
  }, [])

  return (
    <TooltipProvider>
      {/* Header principal com design moderno e refinado */}
      <header className="bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-lg border-b border-border/40 sticky top-0 z-40 transition-all duration-300 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Lado esquerdo - Título editável com visual refinado */}
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 flex-1 bg-background/50 rounded-md px-2 py-1 border border-border/50 shadow-sm">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={saveTitle}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle()
                        if (e.key === 'Escape') cancelEditingTitle()
                      }}
                      className="flex-1 h-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveTitle}
                      className="h-7 w-7 p-0 rounded-full hover:bg-primary/10"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditingTitle}
                      className="h-7 w-7 p-0 rounded-full hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0 group">
                    <h1 
                      className="text-xl font-semibold truncate cursor-pointer hover:text-primary transition-colors duration-200"
                      onClick={startEditingTitle}
                      title="Clique para editar"
                    >
                      {currentConversation?.title || "Nova conversa"}
                    </h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startEditingTitle}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-200 rounded-full hover:bg-primary/10 hover:text-primary hover:scale-105"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Lado direito - Ações com tooltips e design refinado */}
            <div className="flex items-center gap-2">
              {/* Nova conversa */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNewConversation}
                    className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-foreground text-background font-medium">Nova conversa</TooltipContent>
              </Tooltip>

              {/* Histórico */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleHistorySidebar}
                    className={`h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-105 ${
                      isHistorySidebarOpen 
                        ? 'bg-primary/20 text-primary' 
                        : 'hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-foreground text-background font-medium">Histórico de conversas</TooltipContent>
              </Tooltip>

              {/* Configurações do chat */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleChatSettings}
                    className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-foreground text-background font-medium">Configurações do chat</TooltipContent>
              </Tooltip>

              {/* Modo foco */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFocusMode}
                    className={`h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-105 ${
                      focusMode 
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                        : 'hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600'
                    }`}
                  >
                    {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-foreground text-background font-medium">
                  {focusMode ? "Desativar modo foco" : "Ativar modo foco"}
                </TooltipContent>
              </Tooltip>

              {/* Compartilhar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShareConversation}
                    disabled={!currentConversation}
                    className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-foreground text-background font-medium">Compartilhar conversa</TooltipContent>
              </Tooltip>

              {/* Duplicar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyConversation}
                    disabled={!currentConversation}
                    className="h-9 w-9 p-0 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-foreground text-background font-medium">Duplicar conversa</TooltipContent>
              </Tooltip>

              {/* Exportar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportConversation}
                    disabled={!currentConversation}
                    className="h-9 w-9 p-0 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-foreground text-background font-medium">Exportar conversa</TooltipContent>
              </Tooltip>

              {/* Deletar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteCurrentConversation}
                    disabled={!currentConversation}
                    className="h-9 w-9 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-red-600 text-white font-medium">Deletar conversa</TooltipContent>
              </Tooltip>

              {/* Theme toggle */}
              <div className="ml-1">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de confirmação de exclusão com design refinado */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Tem certeza de que deseja excluir esta conversa? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteConversation}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
