/**
 * Hooks para o Chat
 * 
 * Este arquivo contém hooks personalizados para uso nos componentes de chat.
 */
"use client"

import { useRef, useCallback, useEffect } from "react"
import { useAppContext } from "@/contexts/app-context"
import { showNotification } from "@/components/ui/notification"
import { sendChatMessage } from "@/lib/ai-utils"
import { Message, Conversation } from "@/types/chat"

/**
 * Hook para textarea com auto-resize
 */
export function useTextarea({
  onEnter,
}: {
  onEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    
    // Set the height to scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && onEnter) {
        onEnter(e);
      }
    },
    [onEnter]
  );

  // Ajusta a altura inicial quando o componente é montado
  useEffect(() => {
    handleInput();
  }, [handleInput]);

  return {
    textareaRef,
    handleInput,
    handleKeyDown,
  };
}

/**
 * Hook para gerenciar o envio de mensagens no chat
 */
export function useChatMessages() {
  const {
    conversations,
    currentConversationId,
    addConversation,
    updateConversation,
  } = useAppContext();

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (!content.trim() && (!files || files.length === 0)) return;
      if (!currentConversationId) return;

      // Cria uma nova conversa se necessário
      if (!currentConversation) {
        const newConversation: Conversation = {
          id: currentConversationId,
          title: "Nova conversa",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        addConversation(newConversation);
      }

      // Cria a mensagem do usuário
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
        status: "sent",
        files: files
          ? files.map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
            }))
          : undefined,
      };

      // Adiciona a mensagem à conversa
      const updatedMessages = [...(currentConversation?.messages || []), userMessage];
      updateConversation(currentConversationId, {
        messages: updatedMessages,
        updatedAt: Date.now(),
      });

      try {
        // Envia a mensagem para a API
        const response = await sendChatMessage(
          content,
          currentConversationId,
          {
            files,
          }
        );

        // Cria a mensagem do assistente
        const assistantMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: response.reply,
          timestamp: Date.now(),
          status: "sent",
        };

        // Adiciona a mensagem à conversa
        const finalMessages = [...updatedMessages, assistantMessage];
        updateConversation(currentConversationId, {
          messages: finalMessages,
          updatedAt: Date.now(),
        });

        // Atualiza o título da conversa se for a primeira mensagem
        if (updatedMessages.length === 1) {
          const title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
          updateConversation(currentConversationId, { title });
        }

        return assistantMessage;
      } catch (error) {
        console.error("Erro ao processar mensagem:", error);
        
        // Mostra notificação de erro
        showNotification({
          type: "error",
          message: "Erro ao processar mensagem. Por favor, tente novamente.",
        });
        
        // Adiciona mensagem de erro
        const errorMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: "Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
          timestamp: Date.now(),
          status: "error",
        };
        
        updateConversation(currentConversationId, {
          messages: [...updatedMessages, errorMessage],
          updatedAt: Date.now(),
        });
        
        return errorMessage;
      }
    },
    [currentConversation, currentConversationId, addConversation, updateConversation]
  );

  return {
    messages: currentConversation?.messages || [],
    sendMessage,
  };
}

/**
 * Hook para gerenciar o drag and drop de arquivos
 */
export function useDragAndDrop() {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, callback: (files: File[]) => void) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        callback(files);
      }
    },
    []
  );

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

/**
 * Hook para gerenciar o scroll automático
 */
export function useAutoScroll(dependencies: any[] = []) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, dependencies);

  return endRef;
}

// Importação necessária para o hook de drag and drop
import { useState } from "react";
