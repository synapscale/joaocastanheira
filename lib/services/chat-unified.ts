/**
 * Chat Service Unificado - Integração com sistema LLM otimizado do backend
 * Utiliza os endpoints /llm/* e /conversations/* do backend (prefixo /api/v1/ adicionado automaticamente)
 */

import { apiService } from '../api/service';

// Interfaces para o sistema LLM unificado
export interface LLMProvider {
  id: string;
  name: string;
  type: string;
  models: string[];
  is_available: boolean;
  config: any;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  context_window: number;
  max_tokens: number;
  pricing: {
    input_cost_per_1k: number;
    output_cost_per_1k: number;
  };
  capabilities: string[];
  is_available: boolean;
}

export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  provider?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  conversation_id?: string;
  user_id?: string;
}

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  provider: string;
  cost: number;
  created_at: string;
}

// Reutilizando as interfaces existentes de conversas
export interface ConversationResponse {
  id: string;
  title: string | null;
  status: string;
  user_id: string;
  agent_id: string | null;
  workspace_id: string | null;
  tenant_id: string;
  message_count: number;
  total_tokens_used: number;
  agent_name: string | null;
  latest_message: any | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  context: any | null;
  settings: any | null;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  agent_id: string | null;
  agent_name: string | null;
  metadata: any;
  tokens_used: number | null;
  cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationCreate {
  title?: string | null;
  status?: string;
  agent_id?: string | null;
  workspace_id?: string | null;
  context?: any | null;
  settings?: any | null;
  metadata?: any | null;
}

export interface MessageCreate {
  content: string;
  role: 'user' | 'assistant' | 'system';
  agent_id?: string | null;
  metadata?: any | null;
  tokens_used?: number | null;
  cost?: number | null;
}

export class ChatUnifiedService {
  private static instance: ChatUnifiedService;

  private constructor() {}

  static getInstance(): ChatUnifiedService {
    if (!ChatUnifiedService.instance) {
      ChatUnifiedService.instance = new ChatUnifiedService();
    }
    return ChatUnifiedService.instance;
  }

  // ==================== Sistema LLM Unificado ====================

  /**
   * Lista todos os provedores LLM disponíveis
   */
  async getProviders(): Promise<LLMProvider[]> {
    try {
      return await apiService.get<LLMProvider[]>('/llms/');
    } catch (error) {
      console.error('Erro ao buscar provedores LLM:', error);
      throw error;
    }
  }

  /**
   * Lista todos os modelos LLM disponíveis
   */
  async getModels(): Promise<LLMModel[]> {
    try {
      // Buscar todos os LLMs e extrair modelos
      const llms = await apiService.get<any[]>('/llms/');
      const models: LLMModel[] = [];
      
      for (const llm of llms) {
        if (llm.models && Array.isArray(llm.models)) {
          llm.models.forEach((model: any) => {
            models.push({
              id: model.id || model.name,
              name: model.name,
              provider: llm.provider || llm.name,
              context_window: model.context_window || 4096,
              max_tokens: model.max_tokens || 2048,
              pricing: model.pricing || {
                input_cost_per_1k: 0,
                output_cost_per_1k: 0
              },
              capabilities: model.capabilities || [],
              is_available: model.is_available !== false
            });
          });
        }
      }
      
      return models;
    } catch (error) {
      console.error('Erro ao buscar modelos LLM:', error);
      throw error;
    }
  }

  /**
   * Realiza chat completion usando o sistema LLM unificado
   * Implementa fluxo através de conversas temporárias
   */
  async chatCompletion(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Se request.conversation_id foi fornecido, usar conversa existente
      let conversationId = request.conversation_id;
      let shouldCleanup = false;
      
      if (!conversationId) {
        // 1. Criar conversa temporária apenas se não foi fornecida
        const conversation = await this.createConversation({
          title: 'Chat Completion Temporário',
          status: 'active',
          settings: {
            model: request.model,
            provider: request.provider,
            temperature: request.temperature,
            max_tokens: request.max_tokens
          }
        });
        conversationId = conversation.id;
        shouldCleanup = true;
      }

      // 2. Enviar apenas a última mensagem (assumindo que é a pergunta do usuário)
      const lastUserMessage = request.messages.filter(msg => msg.role === 'user').slice(-1)[0];
      if (!lastUserMessage) {
        throw new Error('Nenhuma mensagem do usuário encontrada');
      }

      const userMessage = await this.sendMessage(conversationId, {
        content: lastUserMessage.content,
        role: 'user'
      });

      // 3. Aguardar processamento da IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Buscar mensagens para encontrar a resposta da IA
      const messages = await this.getMessages(conversationId);
      const assistantMessage = messages.find(msg => 
        msg.role === 'assistant' && 
        new Date(msg.created_at) > new Date(userMessage.created_at)
      );

      if (!assistantMessage) {
        throw new Error('Resposta da IA não encontrada');
      }

      // 5. Montar resposta no formato ChatResponse
      const response: ChatResponse = {
        id: assistantMessage.id,
        object: 'chat.completion',
        created: Date.now(),
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: assistantMessage.content
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: assistantMessage.tokens_used || 0,
          completion_tokens: assistantMessage.tokens_used || 0,
          total_tokens: assistantMessage.tokens_used || 0
        },
        model: request.model || 'default',
        provider: request.provider || 'openai',
        cost: assistantMessage.cost || 0,
        created_at: assistantMessage.created_at
      };

      return response;
    } catch (error) {
      console.error('Erro no chat completion:', error);
      throw error;
    }
  }

  /**
   * Gera texto usando o sistema LLM unificado
   */
  async generateText(prompt: string, options?: {
    model?: string;
    provider?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<ChatResponse> {
    try {
      const request: ChatRequest = {
        messages: [{ role: 'user', content: prompt }],
        ...options
      };
      return await this.chatCompletion(request);
    } catch (error) {
      console.error('Erro na geração de texto:', error);
      throw error;
    }
  }

  // ==================== Gerenciamento de Conversas ====================

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
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await apiService.delete(`/conversations/${conversationId}`);
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      throw error;
    }
  }

  /**
   * Arquiva uma conversa
   */
  async archiveConversation(conversationId: string): Promise<void> {
    try {
      await apiService.post(`/conversations/${conversationId}/archive`);
    } catch (error) {
      console.error('Erro ao arquivar conversa:', error);
      throw error;
    }
  }

  /**
   * Desarquiva uma conversa
   */
  async unarchiveConversation(conversationId: string): Promise<void> {
    try {
      await apiService.post(`/conversations/${conversationId}/unarchive`);
    } catch (error) {
      console.error('Erro ao desarquivar conversa:', error);
      throw error;
    }
  }

  /**
   * Atualiza o título de uma conversa
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    try {
      await apiService.put(`/conversations/${conversationId}/title`, { title });
    } catch (error) {
      console.error('Erro ao atualizar título da conversa:', error);
      throw error;
    }
  }

  // ==================== Mensagens ====================

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
   * Envia uma mensagem e obtém resposta da IA usando o sistema LLM unificado
   */
  async sendMessageWithAI(conversationId: string, content: string, options?: {
    model?: string;
    provider?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<{
    userMessage: MessageResponse;
    assistantMessage: MessageResponse;
    llmResponse: ChatResponse;
  }> {
    try {
      // 1. Salvar mensagem do usuário
      const userMessage = await this.sendMessage(conversationId, {
        content,
        role: 'user'
      });

      // 2. Buscar contexto da conversa (mensagens anteriores)
      const messages = await this.getMessages(conversationId);
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 3. Fazer chamada para o LLM
      const llmRequest: ChatRequest = {
        messages: [...chatHistory, { role: 'user', content }],
        conversation_id: conversationId,
        ...options
      };

      const llmResponse = await this.chatCompletion(llmRequest);

      // 4. Salvar resposta do assistente
      const assistantMessage = await this.sendMessage(conversationId, {
        content: llmResponse.choices[0].message.content,
        role: 'assistant',
        metadata: {
          llm_response_id: llmResponse.id,
          model: llmResponse.model,
          provider: llmResponse.provider,
          cost: llmResponse.cost,
          usage: llmResponse.usage
        },
        tokens_used: llmResponse.usage.total_tokens,
        cost: llmResponse.cost
      });

      return {
        userMessage,
        assistantMessage,
        llmResponse
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem com IA:', error);
      throw error;
    }
  }

  /**
   * Envia uma mensagem na conversa (apenas salva, não processa com IA)
   */
  async sendMessage(conversationId: string, messageData: MessageCreate): Promise<MessageResponse> {
    try {
      return await apiService.post<MessageResponse>(`/conversations/${conversationId}/messages`, messageData);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  // ==================== Funcionalidades Auxiliares ====================

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
   * Busca conversas ativas
   */
  async getActiveConversations(): Promise<ConversationResponse[]> {
    try {
      return await this.getConversations({ status: 'active' });
    } catch (error) {
      console.error('Erro ao buscar conversas ativas:', error);
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
   * Obtém estatísticas de uso de uma conversa
   */
  async getConversationStats(conversationId: string): Promise<{
    messageCount: number;
    totalTokens: number;
    totalCost: number;
    modelsUsed: string[];
    providersUsed: string[];
  }> {
    try {
      const conversation = await this.getConversation(conversationId);
      const messages = await this.getMessages(conversationId);
      
      const stats = {
        messageCount: conversation.message_count,
        totalTokens: conversation.total_tokens_used,
        totalCost: messages.reduce((sum, msg) => sum + (msg.cost || 0), 0),
        modelsUsed: [...new Set(messages.map(msg => msg.metadata?.model).filter(Boolean))],
        providersUsed: [...new Set(messages.map(msg => msg.metadata?.provider).filter(Boolean))]
      };

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas da conversa:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatUnifiedService = ChatUnifiedService.getInstance();
