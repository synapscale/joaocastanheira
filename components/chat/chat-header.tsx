"use client"

import { useCallback, useState } from "react"
import { useApp } from "@/context/app-context"
import type { Conversation } from "@/types/chat"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Share, Download, Eye, Maximize, MoreVertical, Trash, Pencil, Copy, History, PanelRight, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
}: ChatHeaderProps) {
  const { focusMode, setFocusMode, isComponentSelectorActive } = useApp()
  const { toast } = useToast()
  
  // Estados para o modal de edição de título
  const [isEditTitleDialogOpen, setIsEditTitleDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  
  // Estado para o modal de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Estado para o dropdown de histórico
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false)
  
  // Estado para controlar a visibilidade do ícone de edição
  const [showEditIcon, setShowEditIcon] = useState(false)

  const handleToggleFocusMode = useCallback(() => {
    if (onToggleFocusMode) {
      onToggleFocusMode()
    } else if (setFocusMode) {
      setFocusMode(!focusMode)
      
      // Feedback visual
      toast({
        title: focusMode ? "Modo foco desativado" : "Modo foco ativado",
        description: focusMode 
          ? "Voltando ao modo de visualização normal." 
          : "Modo foco ativado para melhor concentração.",
      })
    }
  }, [onToggleFocusMode, setFocusMode, focusMode, toast])

  const handleShareConversation = useCallback(() => {
    if (!currentConversation) return
    
    // Simular compartilhamento copiando para a área de transferência
    const shareUrl = `${window.location.origin}/chat/${currentConversation.id}`
    navigator.clipboard.writeText(shareUrl)
    
    // Feedback visual
    toast({
      title: "Link copiado",
      description: "O link da conversa foi copiado para a área de transferência.",
    })
  }, [currentConversation, toast])

  const handleExportConversation = useCallback(() => {
    if (!currentConversation) return
    
    // Executar a exportação
    onExportConversation()
    
    // Feedback visual
    toast({
      title: "Conversa exportada",
      description: "O arquivo de texto foi baixado com sucesso.",
    })
  }, [currentConversation, onExportConversation, toast])

  const handleDeleteCurrentConversation = useCallback(() => {
    if (!currentConversationId) return
    
    // Abrir modal de confirmação
    setIsDeleteDialogOpen(true)
  }, [currentConversationId])
  
  const confirmDeleteConversation = useCallback(() => {
    if (!currentConversationId) return
    
    // Executar a exclusão
    onDeleteConversation(currentConversationId)
    
    // Feedback visual
    toast({
      title: "Conversa excluída",
      description: "A conversa foi removida permanentemente.",
    })
    
    // Fechar modal
    setIsDeleteDialogOpen(false)
  }, [currentConversationId, onDeleteConversation, toast])

  const handleToggleSidebar = useCallback(() => {
    onToggleSidebar()
  }, [onToggleSidebar])
  
  const handleToggleHistorySidebar = useCallback(() => {
    onToggleHistorySidebar()
    
    // Feedback visual
    toast({
      title: isHistorySidebarOpen ? "Histórico fechado" : "Histórico aberto",
      description: isHistorySidebarOpen 
        ? "O painel de histórico de conversas foi fechado." 
        : "O painel de histórico de conversas foi aberto.",
    })
  }, [onToggleHistorySidebar, isHistorySidebarOpen, toast])
  
  const handleEditTitle = useCallback(() => {
    if (!currentConversation) return
    
    // Inicializar o formulário com o título atual
    setNewTitle(currentConversation.title || "Nova conversa")
    setIsEditTitleDialogOpen(true)
  }, [currentConversation])
  
  const confirmEditTitle = useCallback(() => {
    if (!newTitle.trim()) {
      toast({
        title: "Título inválido",
        description: "O título da conversa não pode estar vazio.",
        variant: "destructive"
      })
      return
    }
    
    // Atualizar o título
    onUpdateConversationTitle(newTitle)
    
    // Feedback visual
    toast({
      title: "Título atualizado",
      description: "O título da conversa foi atualizado com sucesso.",
    })
    
    // Fechar modal
    setIsEditTitleDialogOpen(false)
  }, [newTitle, onUpdateConversationTitle, toast])
  
  const handleCopyConversation = useCallback(() => {
    if (!currentConversation) return
    
    // Criar uma nova conversa baseada na atual
    onNewConversation()
    
    // Feedback visual
    toast({
      title: "Conversa duplicada",
      description: "Uma cópia da conversa atual foi criada.",
    })
  }, [currentConversation, onNewConversation, toast])
  
  const handleSelectConversation = useCallback((id: string) => {
    onSelectConversation(id)
    setIsHistoryDropdownOpen(false)
  }, [onSelectConversation])

  return (
    <>
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between w-full px-4 h-14">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={handleToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </Button>

            <div 
              className="flex items-center relative group opacity-0 hover:opacity-100 transition-opacity duration-200"
              onMouseEnter={() => setShowEditIcon(true)}
              onMouseLeave={() => setShowEditIcon(false)}
            >
              <h1 
                className="text-base font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:underline truncate max-w-[200px] md:max-w-[300px]"
                onClick={handleEditTitle}
              >
                {currentConversation?.title || "Nova conversa"}
              </h1>
              {/* Ícone de edição que aparece apenas no hover */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditTitle}
                className={`ml-0.5 h-5 w-5 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity duration-200 ${
                  showEditIcon ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1">
            {/* Botão de Nova Conversa - Agora à esquerda */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewConversation}
              aria-label="Nova conversa"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1 text-xs py-1 px-3 h-8 border border-gray-200 dark:border-gray-700 rounded-full"
              title="Iniciar nova conversa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>Nova conversa</span>
            </Button>
            
            {/* Botão de Histórico de Conversas - Agora à direita do botão Nova Conversa */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleHistorySidebar}
              aria-label="Histórico de conversas"
              className={`${
                isHistorySidebarOpen ? "text-gray-700 hover:text-gray-900" : "text-gray-500 hover:text-gray-700"
              } dark:text-gray-400 dark:hover:text-gray-300 h-8 w-8 p-1.5`}
              title="Histórico de conversas"
            >
              <History className="h-4 w-4" />
            </Button>

            {/* Botão de Compartilhar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShareConversation}
              aria-label="Share conversation"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 h-8 w-8 p-1.5"
            >
              <Share className="h-4 w-4" />
            </Button>

            {/* Botão de Exportar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportConversation}
              aria-label="Export conversation"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 h-8 w-8 p-1.5"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Botão de Modo Foco */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFocusMode}
              aria-label="Toggle focus mode"
              className={`${
                focusMode ? "text-gray-700 hover:text-gray-900" : "text-gray-500 hover:text-gray-700"
              } dark:text-gray-400 dark:hover:text-gray-300 h-8 w-8 p-1.5`}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Botão de Componentes (se disponível) */}
            {onToggleComponentSelector && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleComponentSelector}
                aria-label="Toggle component selector"
                className={`${
                  isComponentSelectorActive ? "text-gray-700 hover:text-gray-900" : "text-gray-500 hover:text-gray-700"
                } dark:text-gray-400 dark:hover:text-gray-300 h-8 w-8 p-1.5`}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            )}

            {/* Alternador de Tema */}
            <ThemeToggle />
            
            {/* Menu de Mais Opções - REMOVIDO do header principal conforme solicitado */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="More options"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditTitle}>
                  <Pencil className="h-4 w-4 mr-2" />
                  <span>Editar título</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyConversation}>
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Duplicar conversa</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDeleteCurrentConversation}
                  className="text-red-600 hover:text-red-700 focus:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  <span>Excluir conversa</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>
      </header>
      
      {/* Modal de edição de título */}
      <Dialog open={isEditTitleDialogOpen} onOpenChange={setIsEditTitleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar título da conversa</DialogTitle>
            <DialogDescription>
              Insira um novo título para identificar esta conversa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTitleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmEditTitle}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir conversa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteConversation}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
