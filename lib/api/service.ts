/**
 * Serviço de API completo para integração com o backend SynapScale
 */

import { config } from '../config'

// Configuração base da API
const API_BASE_URL = config.apiBaseUrl + '/api/v1';
const WS_BASE_URL = config.wsUrl;

// Tipos TypeScript
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  subscription_plan: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  workspace_id?: string;
  is_public: boolean;
  category?: string;
  tags: string[];
  version: string;
  status: string;
  definition: any;
  thumbnail_url?: string;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  execution_count: number;
  last_executed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Node {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  user_id: string;
  workspace_id?: string;
  is_public: boolean;
  status: string;
  version: string;
  icon: string;
  color: string;
  documentation?: string;
  examples: any[];
  downloads_count: number;
  usage_count: number;
  rating_average: number;
  rating_count: number;
  created_at?: string;
  updated_at?: string;
  code_template?: string;
  input_schema?: any;
  output_schema?: any;
  parameters_schema?: any;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  workspace_id?: string;
  agent_type: string;
  model_provider: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  status: string;
  avatar_url?: string;
  conversation_count: number;
  message_count: number;
  rating_average: number;
  rating_count: number;
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  agent_id?: string;
  workspace_id?: string;
  title?: string;
  status: string;
  message_count: number;
  total_tokens_used: number;
  last_message_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  attachments: any[];
  model_used?: string;
  tokens_used: number;
  processing_time_ms: number;
  created_at?: string;
}

// Tipagem estendida para permitir flag skipAuth em opções de requisição
interface ApiRequestOptions extends RequestInit {
  /** Se true, não adiciona o header Authorization mesmo se houver token */
  skipAuth?: boolean
}

// Classe principal do serviço de API
export class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.loadTokensFromStorage();
  }

  // Gerenciamento de tokens
  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  private saveTokensToStorage(tokens: AuthTokens) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
    }
  }

  private clearTokensFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  // Método base para requisições
  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const { skipAuth, ...fetchOptions } = options

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as any),
      },
      ...fetchOptions,
    }

    // Adicionar token de autorização se disponível e não for request sem auth
    if (this.accessToken && !skipAuth) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      }
    }

    try {
      const response = await fetch(url, config);

      // Tentar renovar token se expirado
      if (response.status === 401 && this.refreshToken) {
        const newTokens = await this.refreshAccessToken();
        if (newTokens) {
          // Repetir requisição com novo token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newTokens.access_token}`,
          };
          const retryResponse = await fetch(url, config);
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          return await retryResponse.json();
        } else {
          // Falha ao renovar token, fazer logout
          this.clearTokensFromStorage();
          throw new Error('Token expirado. Faça login novamente.');
        }
      }

      if (!response.ok) {
        // Em desenvolvimento, retornar dados mock para erros 401 em endpoints específicos
        if (response.status === 401 && process.env.NODE_ENV === 'development' && this.shouldUseMockData(endpoint)) {
          console.warn(`API unauthorized for ${endpoint}, returning mock data for development`)
          return this.getMockData<T>(endpoint)
        }

        const errorData = await response.json().catch(() => ({}))

        // Cria erro com código de status para permitir tratamento específico (ex.: 422)
        const err: Error & { status?: number; data?: any } = new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
        err.status = response.status
        err.data = errorData
        throw err
      }

      return await response.json();
    } catch (error) {
      // Em desenvolvimento, retornar dados mock para falhas de conexão em endpoints específicos
      if (process.env.NODE_ENV === 'development' && this.shouldUseMockData(endpoint)) {
        console.warn(`API request failed for ${endpoint}, returning mock data for development:`, error)
        return this.getMockData<T>(endpoint)
      }
      
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Verificar se deve usar dados mock para um endpoint
  private shouldUseMockData(endpoint: string): boolean {
    const mockEndpoints = ['/agents', '/conversations', '/workflows', '/templates', '/nodes']
    return mockEndpoints.some(mockEndpoint => endpoint.includes(mockEndpoint))
  }

  // Retornar dados mock para desenvolvimento
  private getMockData<T>(endpoint: string): T {
    if (endpoint.includes('/agents')) {
      return {
        items: [
          {
            id: "agent_1",
            name: "Assistente Geral",
            description: "Um assistente versátil para tarefas gerais",
            agent_type: "conversational",
            personality: "Prestativo e amigável",
            instructions: "Você é um assistente prestativo que ajuda com diversas tarefas",
            user_id: "demo_user",
            workspace_id: null,
            model_provider: "openai",
            model_name: "gpt-4",
            temperature: 0.7,
            max_tokens: 1000,
            status: "active",
            tools: ["web_search", "calculator"],
            knowledge_base: null,
            avatar_url: null,
            conversation_count: 15,
            message_count: 234,
            rating_average: 4.5,
            rating_count: 12,
            last_active_at: new Date().toISOString(),
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "agent_2", 
            name: "Especialista em Código",
            description: "Especialista em programação e desenvolvimento",
            agent_type: "coding",
            personality: "Técnico e preciso",
            instructions: "Você é um especialista em programação que ajuda com código e desenvolvimento",
            user_id: "demo_user",
            workspace_id: null,
            model_provider: "openai",
            model_name: "gpt-4",
            temperature: 0.3,
            max_tokens: 2000,
            status: "active",
            tools: ["code_analyzer", "documentation"],
            knowledge_base: null,
            avatar_url: null,
            conversation_count: 8,
            message_count: 156,
            rating_average: 4.8,
            rating_count: 8,
            last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          }
        ],
        total: 2,
        page: 1,
        size: 20,
        pages: 1
      } as T
    }

    if (endpoint.includes('/conversations')) {
      return {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0
      } as T
    }

    if (endpoint.includes('/workflows')) {
      return {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0
      } as T
    }

    // Retorno padrão para outros endpoints
    return {} as T
  }

  // Autenticação
  async login(email: string, password: string): Promise<AuthTokens> {
    // Use form-urlencoded as specified in the OpenAPI spec
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    const tokens = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    this.saveTokensToStorage(tokens);
    return tokens;
  }

  async register(userData: {
    email: string;
    password: string;
    username?: string;
    full_name?: string;
  }): Promise<User> {
    return await this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        username: userData.username || userData.email.split('@')[0],
        full_name: userData.full_name || '',
        password: userData.password
      }),
    });
  }

  async refreshAccessToken(): Promise<AuthTokens | null> {
    if (!this.refreshToken) return null;

    try {
      const tokens = await this.request<AuthTokens>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      this.saveTokensToStorage(tokens);
      return tokens;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearTokensFromStorage();
  }

  async getCurrentUser(): Promise<User> {
    return await this.request<User>('/auth/me');
  }

  // Workflows
  async getWorkflows(params?: {
    page?: number;
    size?: number;
    category?: string;
    is_public?: boolean;
  }): Promise<{ items: Workflow[]; total: number; page: number; size: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.is_public !== undefined) queryParams.append('is_public', params.is_public.toString());

    return await this.request<any>(`/workflows?${queryParams.toString()}`);
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return await this.request<Workflow>(`/workflows/${id}`);
  }

  async createWorkflow(workflowData: {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    is_public?: boolean;
    definition: any;
  }): Promise<Workflow> {
    return await this.request<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async updateWorkflow(id: string, workflowData: Partial<Workflow>): Promise<Workflow> {
    return await this.request<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflowData),
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.request(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async executeWorkflow(id: string, inputs?: any): Promise<{ execution_id: string }> {
    return await this.request<{ execution_id: string }>(`/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ inputs }),
    });
  }

  // Nodes
  async getNodes(params?: {
    page?: number;
    size?: number;
    type?: string;
    category?: string;
    is_public?: boolean;
  }): Promise<{ items: Node[]; total: number; page: number; size: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.is_public !== undefined) queryParams.append('is_public', params.is_public.toString());

    return await this.request<any>(`/nodes?${queryParams.toString()}`);
  }

  async getNode(id: string): Promise<Node> {
    return await this.request<Node>(`/nodes/${id}`);
  }

  async createNode(nodeData: {
    name: string;
    description?: string;
    type: string;
    category?: string;
    is_public?: boolean;
    code_template: string;
    input_schema: any;
    output_schema: any;
    parameters_schema?: any;
    icon?: string;
    color?: string;
    documentation?: string;
    examples?: any[];
  }): Promise<Node> {
    return await this.request<Node>('/nodes', {
      method: 'POST',
      body: JSON.stringify(nodeData),
    });
  }

  async updateNode(id: string, nodeData: Partial<Node>): Promise<Node> {
    return await this.request<Node>(`/nodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(nodeData),
    });
  }

  async deleteNode(id: string): Promise<void> {
    await this.request(`/nodes/${id}`, {
      method: 'DELETE',
    });
  }

  // Agents
  async getAgents(params?: {
    page?: number;
    size?: number;
    agent_type?: string;
  }): Promise<{ items: Agent[]; total: number; page: number; size: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.agent_type) queryParams.append('agent_type', params.agent_type);

    return await this.request<any>(`/agents?${queryParams.toString()}`);
  }

  async getAgent(id: string): Promise<Agent> {
    return await this.request<Agent>(`/agents/${id}`);
  }

  async createAgent(agentData: {
    name: string;
    description?: string;
    agent_type?: string;
    personality?: string;
    instructions?: string;
    model_provider?: string;
    model_name?: string;
    temperature?: number;
    max_tokens?: number;
    tools?: string[];
    knowledge_base?: any;
    avatar_url?: string;
  }): Promise<Agent> {
    return await this.request<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  async updateAgent(id: string, agentData: Partial<Agent>): Promise<Agent> {
    return await this.request<Agent>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  }

  async deleteAgent(id: string): Promise<void> {
    await this.request(`/agents/${id}`, {
      method: 'DELETE',
    });
  }

  // Conversations
  async getConversations(params?: {
    page?: number;
    size?: number;
    agent_id?: string;
  }): Promise<{ items: Conversation[]; total: number; page: number; size: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);

    return await this.request<any>(`/conversations?${queryParams.toString()}`);
  }

  async getConversation(id: string): Promise<Conversation> {
    return await this.request<Conversation>(`/conversations/${id}`);
  }

  async createConversation(conversationData: {
    agent_id?: string;
    title?: string;
    context?: any;
  }): Promise<Conversation> {
    return await this.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    });
  }

  async deleteConversation(id: string): Promise<void> {
    await this.request(`/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async getMessages(conversationId: string, params?: {
    page?: number;
    size?: number;
  }): Promise<{ items: Message[]; total: number; page: number; size: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());

    return await this.request<any>(`/conversations/${conversationId}/messages?${queryParams.toString()}`);
  }

  async sendMessage(conversationId: string, messageData: {
    content: string;
    attachments?: any[];
  }): Promise<Message> {
    return await this.request<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Files
  async uploadFile(file: File, metadata?: any): Promise<{ id: string; url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return await this.request<{ id: string; url: string; filename: string }>('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type header for FormData
    });
  }

  async getFile(id: string): Promise<{ id: string; url: string; filename: string; metadata: any }> {
    return await this.request<{ id: string; url: string; filename: string; metadata: any }>(`/files/${id}`);
  }

  async deleteFile(id: string): Promise<void> {
    await this.request(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Faz GET e retorna um Blob (útil para downloads/exportações)
   */
  async getBlob(endpoint: string, options: ApiRequestOptions = {}): Promise<Blob> {
    const url = `${this.baseURL}${endpoint}`

    const { skipAuth, ...fetchOptions } = options

    const config: RequestInit = {
      headers: {
        ...(fetchOptions.headers as any),
      },
      ...fetchOptions,
      method: fetchOptions.method || 'GET',
    }

    if (this.accessToken && !skipAuth) {
      config.headers = {
        ...(config.headers as any),
        Authorization: `Bearer ${this.accessToken}`,
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`)
        // @ts-ignore
        error.status = response.status
        throw error
      }

      return await response.blob()
    } catch (error) {
      console.error('API blob request failed:', error)
      throw error
    }
  }

  /**
   * Verifica o health check do backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/health', { skipAuth: true })
      return true
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Helper para requisições POST (JSON por padrão)
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData

    const headers = isFormData
      ? options.headers || {}
      : { 'Content-Type': 'application/json', ...(options.headers as any) }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? (data as FormData) : JSON.stringify(data ?? {}),
      ...options,
      headers,
    })
  }

  /**
   * Helper para requisições GET
   */
  async get<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  /**
   * Helper para requisições PUT
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data ?? {}),
      headers: { 'Content-Type': 'application/json', ...(options.headers as any) },
      ...options,
    })
  }

  /**
   * Helper para requisições DELETE
   */
  async delete<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options })
  }
}

// Instância global do serviço
export const apiService = new ApiService();

// WebSocket Service
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${WS_BASE_URL}?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.stopHeartbeat();
          this.attemptReconnect(token);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  offMessage(type: string): void {
    this.messageHandlers.delete(type);
  }

  private handleMessage(data: any): void {
    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'heartbeat' });
    }, 30000); // 30 segundos
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(token).catch(() => {
          // Falha na reconexão será tratada pelo onclose
        });
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
}

// Instância global do WebSocket
export const wsService = new WebSocketService();

export default apiService;

