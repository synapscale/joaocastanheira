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

import { mapToApiModelName } from '@/lib/utils/model-mapper'

/**
 * Integração com a API de chat usando o endpoint /llm/chat (prefixo /api/v1/ adicionado automaticamente)
 * 
 * Envia mensagens para o LLM e retorna a resposta
 * @param messages Array de mensagens do chat (ou string única para compatibilidade)
 * @param conversationId Mantido para compatibilidade, mas não usado
 * @param options Opções adicionais
 * @returns Promessa com a resposta
 */
export async function sendChatMessage(
  messages: Array<{role: string; content: string}> | string,
  conversationId?: string, // Mantido para compatibilidade
  options?: {
    model?: string;
    provider?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stream?: boolean;
    files?: File[];
  }
): Promise<{
  content: string;
  model: string;
  provider: string;
  usage?: any;
  metadata?: any;
  finish_reason?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';
    const token = localStorage.getItem('synapsefrontend_auth_token');
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    // Converter string para array de mensagens se necessário
    let messageArray: Array<{role: string; content: string}>;
    if (typeof messages === 'string') {
      messageArray = [{ role: 'user', content: messages }];
    } else {
      messageArray = messages;
    }

    // Preparar dados da requisição conforme a especificação da API
    const requestData: any = {
      messages: messageArray,
    };

    // Adicionar opções se fornecidas
    if (options?.provider) requestData.provider = options.provider;
    if (options?.model) requestData.model = mapToApiModelName(options.model);
    if (options?.temperature !== undefined) requestData.temperature = options.temperature;
    if (options?.max_tokens) requestData.max_tokens = options.max_tokens;
    if (options?.top_p !== undefined) requestData.top_p = options.top_p;
    if (options?.frequency_penalty !== undefined) requestData.frequency_penalty = options.frequency_penalty;
    if (options?.presence_penalty !== undefined) requestData.presence_penalty = options.presence_penalty;
    if (options?.stream !== undefined) requestData.stream = options.stream;

          console.log('🔍 Enviando para LLM Chat:', {
        url: `${apiUrl}/llm/chat`,
        requestData
      });

    // Se houver arquivos, usar FormData
    if (options?.files && options.files.length > 0) {
      const formData = new FormData();
      formData.append('messages', JSON.stringify(messageArray));
      
      // Adicionar opções ao FormData
      if (options.provider) formData.append('provider', options.provider);
      if (options.model) formData.append('model', mapToApiModelName(options.model));
      if (options.temperature !== undefined) formData.append('temperature', options.temperature.toString());
      if (options.max_tokens) formData.append('max_tokens', options.max_tokens.toString());
      
      // Adicionar arquivos
      options.files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch(`${apiUrl}/llm/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro na API: ${response.statusText}`);
      }

      return await response.json();
    } else {
      // Enviar requisição JSON
      const response = await fetch(`${apiUrl}/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro na API: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta do LLM Chat:', result);
      
      return result;
    }

  } catch (error) {
    console.error('🚨 Erro ao enviar mensagem para LLM:', error);
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
