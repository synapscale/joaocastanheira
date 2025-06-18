"use client"

/**
 * Hooks para o Chat
 * 
 * Este arquivo contém hooks personalizados para uso nos componentes de chat.
 */


import { useRef, useCallback, useEffect, useState } from "react"
import { useChatContext } from "@/context/chat-context"
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
    state,
    sendMessage: sendChatMessage,
    createSession,
    switchSession,
  } = useChatContext();

  const currentSession = state.currentSession;

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (!content.trim() && (!files || files.length === 0)) return;

      try {
        // Se não há sessão atual, criar uma nova
        if (!currentSession) {
          const newSession = await createSession(content.slice(0, 30) + (content.length > 30 ? "..." : ""));
          await switchSession(newSession.id);
        }

        // Enviar mensagem através do contexto
        await sendChatMessage(content, files);

        return null; // Sucesso
      } catch (error) {
        console.error("Erro ao processar mensagem:", error);
        
        // Mostra notificação de erro
        showNotification({
          type: "error",
          message: "Erro ao processar mensagem. Por favor, tente novamente.",
        });
        
        return null;
      }
    },
    [currentSession, sendChatMessage, createSession, switchSession]
  );

  return {
    messages: currentSession?.messages || [],
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
