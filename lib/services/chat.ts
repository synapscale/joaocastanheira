/**
 * Chat Service - Gerencia operações de chat baseado na API Synapscale
 */

import { apiService } from '../api/service';

// API Response interfaces based on OpenAPI specification
export interface ConversationResponse {
  id: string
  title: string | null
  status: string
  user_id: string
  agent_id: string | null
  workspace_id: string | null
  tenant_id: string
  message_count: number
  total_tokens_used: number
  agent_name: string | null
  latest_message: any | null
  last_message_at: string | null
  created_at: string
  updated_at: string
  context: any | null
  settings: any | null
}

export interface MessageResponse {
  id: string
  conversation_id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  agent_id: string | null
  agent_name: string | null
  metadata: any
  tokens_used: number | null
  cost: number | null
  created_at: string
  updated_at: string
}

// Request interfaces
export interface ConversationCreate {
  title?: string | null
  status?: string
  agent_id?: string | null
  workspace_id?: string | null
  context?: any | null
  settings?: any | null
  metadata?: any | null
}

export interface MessageCreate {
  content: string
  role: 'user' | 'assistant' | 'system'
  agent_id?: string | null
  metadata?: any | null
  tokens_used?: number | null
  cost?: number | null
}

export class ChatService {
  private static instance: ChatService;

  private constructor() {
    // Use the global singleton instance instead of creating a new one
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Lista conversas do usuário com filtros e paginação
   */
  async getConversations(params?: {
    search?: string;
    status?: string;
    agent_id?: string;
    page?: number;
    size?: number;
  }): Promise<ConversationResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());

      const url = queryParams.toString() 
        ? `/conversations/?${queryParams.toString()}`
        : '/conversations/';

      return await apiService.get<ConversationResponse[]>(url);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      throw error;
    }
  }

  /**
   * Busca uma conversa específica
   */
  async getConversation(conversationId: string): Promise<ConversationResponse> {
    try {
      return await apiService.get<ConversationResponse>(`/conversations/${conversationId}`);
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova conversa
   */
  async createConversation(data: ConversationCreate): Promise<ConversationResponse> {
    try {
      return await apiService.post<ConversationResponse>('/conversations/', data);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      throw error;
    }
  }

  /**
   * Deleta uma conversa
   */
  async deleteConversation(conversationId: string): Promise<string> {
    try {
      return await apiService.delete<string>(`/conversations/${conversationId}`);
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      throw error;
    }
  }

  /**
   * Lista mensagens de uma conversa
   */
  async getMessages(conversationId: string, page: number = 1, size: number = 50): Promise<MessageResponse[]> {
    try {
      const url = `/conversations/${conversationId}/messages?page=${page}&size=${size}`;
      return await apiService.get<MessageResponse[]>(url);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  /**
   * Envia uma mensagem na conversa
   */
  async sendMessage(conversationId: string, messageData: MessageCreate): Promise<MessageResponse> {
    try {
      return await apiService.post<MessageResponse>(`/conversations/${conversationId}/messages`, messageData);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Busca histórico de mensagens com filtro de texto
   */
  async searchMessages(query: string, conversationId?: string): Promise<MessageResponse[]> {
    try {
      if (conversationId) {
        const messages = await this.getMessages(conversationId, 1, 100);
        return messages.filter(msg => 
          msg.content.toLowerCase().includes(query.toLowerCase())
        );
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  /**
   * Marca mensagem como lida (função local - não há endpoint específico)
   */
  async markAsRead(conversationId: string, messageId: string): Promise<void> {
    try {
      console.log(`Marcando mensagem ${messageId} como lida na conversa ${conversationId}`);
      // Implementar quando endpoint estiver disponível
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  }

  /**
   * Upload de arquivo (usar serviço de arquivos existente)
   */
  async uploadFile(file: File, workspaceId?: string, description?: string): Promise<{url: string; id: string}> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (workspaceId) formData.append('workspace_id', workspaceId);
      if (description) formData.append('description', description);

      const response = await apiService.post<{url: string; id: string}>('/files/upload', formData);
      return response;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Busca conversas por filtros específicos
   */
  async searchConversations(query: string): Promise<ConversationResponse[]> {
    try {
      return await this.getConversations({ search: query });
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      throw error;
    }
  }

  /**
   * Busca conversas arquivadas
   */
  async getArchivedConversations(): Promise<ConversationResponse[]> {
    try {
      return await this.getConversations({ status: 'archived' });
    } catch (error) {
      console.error('Erro ao buscar conversas arquivadas:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem com processamento de IA
   */
  async sendChatMessage(params: {
    message: string;
    conversationId: string;
    settings?: any;
    attachments?: File[];
  }): Promise<{
    userMessage: MessageResponse;
    assistantMessage: MessageResponse;
  }> {
    try {
      const { message, conversationId, settings, attachments } = params;

      // Debug: verificar autenticação antes de prosseguir
      const authToken = localStorage.getItem('synapsefrontend_auth_token');
      console.log('🔐 Debug auth - Token presente:', !!authToken);
      console.log('🔐 Debug auth - Token length:', authToken?.length || 0);
      
      // Usar o método sendMessageWithAI do chat-unified que já faz todo o fluxo
      const { chatUnifiedService } = await import('./chat-unified');
      
      const result = await chatUnifiedService.sendMessageWithAI(
        conversationId,
        message,
        {
          model: settings?.model,
          provider: settings?.provider,
          temperature: settings?.temperature,
          max_tokens: settings?.maxTokens
        }
      );

      return {
        userMessage: result.userMessage,
        assistantMessage: result.assistantMessage
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem com IA:', error);
      
      // Re-lançar erro com informações mais detalhadas
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Erro de autenticação. Por favor, faça login novamente.');
        } else if (error.message.includes('403')) {
          throw new Error('Você não tem permissão para acessar este recurso.');
        } else if (error.message.includes('404')) {
          throw new Error('Conversa não encontrada. Verifique se ela existe.');
        } else if (error.message.includes('429')) {
          throw new Error('Muitas requisições. Aguarde alguns segundos e tente novamente.');
        } else if (error.message.includes('500')) {
          throw new Error('Erro interno do servidor. Tente novamente em alguns minutos.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Gera resposta da IA usando o sistema LLM unificado
   */
  private async generateAIResponse(chatHistory: any[], settings?: any): Promise<{
    content: string;
    model: string;
    provider: string;
    tokens_used: number;
    cost: number;
    processing_time_ms: number;
  }> {
    try {
      // Usar chatUnifiedService para chamar IA
      const { chatUnifiedService } = await import('./chat-unified');
      
      const response = await chatUnifiedService.chatCompletion({
        messages: chatHistory,
        model: settings?.model || 'gpt-4o',
        provider: settings?.provider || 'openai',
        temperature: settings?.temperature || 0.7,
        max_tokens: settings?.maxTokens || 2048
      });

      return {
        content: response.choices[0].message.content,
        model: response.model,
        provider: response.provider,
        tokens_used: response.usage.total_tokens,
        cost: response.cost,
        processing_time_ms: Date.now() - new Date(response.created_at).getTime()
      };
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
      
      // Identificar tipo de erro e retornar mensagem apropriada
      let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('authentication')) {
          errorMessage = 'Erro de autenticação. Por favor, faça login novamente.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Você não tem permissão para acessar este recurso.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Serviço de IA não encontrado. Verifique a configuração.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Muitas requisições. Aguarde alguns segundos e tente novamente.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
      }
      
      return {
        content: errorMessage,
        model: settings?.model || 'gpt-4o',
        provider: settings?.provider || 'openai',
        tokens_used: 0,
        cost: 0,
        processing_time_ms: 0
      };
    }
  }

  /**
   * Método temporário para armazenar mensagens offline
   */
  private offlineMessages = new Map<string, MessageResponse[]>();

  /**
   * Salva mensagem offline
   */
  saveOfflineMessage(conversationId: string, message: MessageResponse): void {
    if (!this.offlineMessages.has(conversationId)) {
      this.offlineMessages.set(conversationId, []);
    }
    this.offlineMessages.get(conversationId)!.push(message);
  }

  /**
   * Obtém mensagens offline
   */
  getOfflineMessages(conversationId: string): MessageResponse[] {
    return this.offlineMessages.get(conversationId) || [];
  }

  /**
   * Limpa mensagens offline
   */
  clearOfflineMessages(conversationId: string): void {
    this.offlineMessages.delete(conversationId);
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();