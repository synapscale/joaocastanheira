/**
 * Serviço de API completo para integração com o backend SynapScale
 */

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

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

// Classe principal do serviço de API
class ApiService {
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
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autorização se disponível
    if (this.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Autenticação
  async login(email: string, password: string): Promise<AuthTokens> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const tokens = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      headers: {},
      body: formData,
    });

    this.saveTokensToStorage(tokens);
    return tokens;
  }

  async register(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<User> {
    return await this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
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

    return await this.request<any>('/files/upload', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async getFile(id: string): Promise<{ id: string; url: string; filename: string; metadata: any }> {
    return await this.request<any>(`/files/${id}`);
  }

  async deleteFile(id: string): Promise<void> {
    await this.request(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
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

