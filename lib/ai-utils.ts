/**
 * Utilitários para AI e Chat
 * 
 * Este arquivo contém funções utilitárias para trabalhar com modelos de IA,
 * estimativa de tokens, formatação de mensagens e outras funcionalidades
 * relacionadas ao chat.
 */

/**
 * Estima o número de tokens em um texto
 * Esta é uma implementação simplificada para exemplo
 * @param text Texto para estimar tokens
 * @returns Número estimado de tokens
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Implementação simplificada: aproximadamente 4 caracteres por token
  // Em produção, use uma biblioteca específica para o modelo usado
  return Math.ceil(text.length / 4);
}

/**
 * Formata uma data relativa (hoje, ontem, etc.)
 * @param timestamp Timestamp em milissegundos
 * @returns String formatada
 */
export function formatRelativeDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hoje";
  } else if (diffDays === 1) {
    return "Ontem";
  } else if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Formata um timestamp para exibição
 * @param timestamp Timestamp em milissegundos
 * @returns String formatada (hora:minuto)
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Trunca um texto para um tamanho máximo
 * @param text Texto para truncar
 * @param maxLength Tamanho máximo
 * @returns Texto truncado com "..." se necessário
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Gera um ID único baseado em timestamp
 * @param prefix Prefixo para o ID
 * @returns ID único
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Formata o tamanho de um arquivo para exibição
 * @param bytes Tamanho em bytes
 * @returns String formatada (KB, MB, etc.)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  else return (bytes / 1073741824).toFixed(1) + " GB";
}

/**
 * Verifica se um arquivo é uma imagem
 * @param file Arquivo para verificar
 * @returns Verdadeiro se for uma imagem
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Verifica se um arquivo é um documento
 * @param file Arquivo para verificar
 * @returns Verdadeiro se for um documento
 */
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "text/markdown",
  ];
  return documentTypes.includes(file.type);
}

/**
 * Integração com a API de chat
 * 
 * Envia uma mensagem para a API e retorna a resposta
 * @param message Mensagem do usuário
 * @param conversationId ID da conversa
 * @param options Opções adicionais
 * @returns Promessa com a resposta
 */
export async function sendChatMessage(
  message: string, 
  conversationId: string,
  options?: {
    model?: string;
    tools?: string[];
    personality?: string;
    files?: File[];
  }
): Promise<{
  reply: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  try {
    // Prepara o corpo da requisição
    const body: any = {
      message,
      conversationId,
    };

    // Adiciona opções se fornecidas
    if (options?.model) body.model = options.model;
    if (options?.tools) body.tools = options.tools;
    if (options?.personality) body.personality = options.personality;
    
    // Se houver arquivos, cria um FormData
    if (options?.files && options.files.length > 0) {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("conversationId", conversationId);
      
      if (options.model) formData.append("model", options.model);
      if (options.tools) formData.append("tools", JSON.stringify(options.tools));
      if (options.personality) formData.append("personality", options.personality);
      
      options.files.forEach((file) => {
        formData.append("files", file);
      });
      
      // Envia a requisição com FormData
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Envia a requisição com JSON
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw error;
  }
}

/**
 * Integração com a API de workflow
 * 
 * Obtém informações sobre um nó de workflow
 * @param nodeId ID do nó
 * @returns Promessa com as informações do nó
 */
export async function getWorkflowNodeInfo(nodeId: string): Promise<any> {
  try {
    const response = await fetch(`/api/workflow/node/${nodeId}`);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro ao obter informações do nó:", error);
    throw error;
  }
}

/**
 * Integração entre chat e workflow
 * 
 * Executa um workflow a partir do chat
 * @param workflowId ID do workflow
 * @param inputs Entradas para o workflow
 * @returns Promessa com o resultado da execução
 */
export async function executeWorkflowFromChat(
  workflowId: string,
  inputs?: Record<string, any>
): Promise<any> {
  try {
    const response = await fetch(`/api/workflow/execute/${workflowId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs }),
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro ao executar workflow:", error);
    throw error;
  }
}
