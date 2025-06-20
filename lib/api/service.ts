/**
 * Serviço de API completo para integração com o backend SynapScale
 */

import { config } from '../config'
import type { WorkspaceStats } from '@/types/workspace-types'

// Configuração base da API
const API_BASE_URL = config.apiBaseUrl;
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

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  color?: string;
  is_public: boolean;
  allow_guest_access: boolean;
  require_approval: boolean;
  max_members: number;
  max_projects: number;
  max_storage_mb: number;
  enable_real_time_editing: boolean;
  enable_comments: boolean;
  enable_chat: boolean;
  enable_video_calls: boolean;
  notification_settings?: any;
  slug: string;
  owner_id: string;
  owner_name: string;
  member_count: number;
  project_count: number;
  activity_count: number;
  storage_used_mb: number;
  status: string;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: number;
  workspace_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  status: string;
  joined_at: string;
  last_active_at?: string;
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
    
    // Carregar tokens na inicialização
    this.loadTokensFromStorage();
    
    // Escutar mudanças no localStorage para sincronizar tokens
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  private handleStorageChange(e: StorageEvent) {
    if (e.key === 'synapsefrontend_auth_token') {
      this.accessToken = e.newValue;
    }
    if (e.key === 'synapsefrontend_refresh_token') {
      this.refreshToken = e.newValue;
    }
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('synapsefrontend_auth_token');
      this.refreshToken = localStorage.getItem('synapsefrontend_refresh_token');

      // Log para debug
      console.log('ApiService - Tokens carregados:', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
        accessTokenLength: this.accessToken?.length || 0
      });

      // Se temos tokens, inicializar dados básicos
      if (this.accessToken) {
        this.initializeUserData();
      }
    }
  }

  /**
   * Inicializa dados básicos do usuário após login
   */
  private async initializeUserData() {
    try {
      console.log('🔄 Inicializando dados do usuário...');
      
      // Verificar se o usuário tem workspaces
      const workspaces = await this.getWorkspaces();
      console.log('📋 Workspaces encontrados:', workspaces.length);
      
      // Se não tem workspaces, criar um padrão
      if (workspaces.length === 0) {
        console.log('🏗️ Criando workspace padrão...');
        const defaultWorkspace = await this.createDefaultWorkspace();
        
        // Criar projeto padrão no workspace
        if (defaultWorkspace) {
          console.log('🏗️ Criando projeto padrão...');
          await this.createDefaultProject(defaultWorkspace.id);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar dados do usuário:', error);
    }
  }

  /**
   * Cria workspace padrão para novos usuários
   */
  private async createDefaultWorkspace(): Promise<Workspace | null> {
    try {
      const user = await this.getCurrentUser();
      const workspaceName = `Workspace de ${user.full_name || user.email}`;
      
      const workspace = await this.createWorkspace({
        name: workspaceName,
        description: 'Workspace padrão criado automaticamente',
        is_public: false,
        allow_guest_access: false,
        require_approval: false,
        max_members: 10,
        max_projects: 100,
        max_storage_mb: 1000,
        enable_real_time_editing: true,
        enable_comments: true,
        enable_chat: true,
        enable_video_calls: false,
        color: '#3B82F6'
      });
      
      console.log('✅ Workspace padrão criado com sucesso');
      return workspace;
    } catch (error) {
      console.error('❌ Erro ao criar workspace padrão:', error);
      return null;
    }
  }

  /**
   * Cria projeto padrão para novos workspaces
   */
  private async createDefaultProject(workspaceId: string): Promise<void> {
    try {
      await this.post(`/workspaces/${workspaceId}/projects`, {
        name: 'Meu Primeiro Projeto',
        description: 'Projeto padrão criado automaticamente para começar',
        status: 'active'
      });
      
      console.log('✅ Projeto padrão criado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar projeto padrão:', error);
    }
  }

  private saveTokensToStorage(tokens: AuthTokens) {
    if (typeof window !== 'undefined') {
      // Usar as chaves configuradas no .env
      const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapsefrontend_auth_token';
      const refreshKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'synapsefrontend_refresh_token';
      localStorage.setItem(tokenKey, tokens.access_token);
      localStorage.setItem(refreshKey, tokens.refresh_token);
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
    }
  }

  private clearTokensFromStorage() {
    if (typeof window !== 'undefined') {
      // Usar as chaves configuradas no .env
      const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapsefrontend_auth_token';
      const refreshKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'synapsefrontend_refresh_token';
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(refreshKey);
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

    // Log de debug para verificar a URL sendo chamada
    console.log('🔍 API Request Debug:', {
      baseURL: this.baseURL,
      endpoint,
      fullUrl: url,
      hasToken: !!this.accessToken,
      environment: process.env.NEXT_PUBLIC_APP_ENV,
      apiFromEnv: process.env.NEXT_PUBLIC_API_URL
    });

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
      console.log('🔍 Full API Request:', {
        url,
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body,
        hasToken: !!this.accessToken
      });
      
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
        const errorData = await response.json().catch(() => ({}))

        console.error('🚨 API Response Error:', {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          requestHeaders: config.headers,
          requestBody: config.body
        });

        // Cria erro com código de status para permitir tratamento específico (ex.: 422)
        const err: Error & { status?: number; data?: any } = new Error(
          errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        )
        err.status = response.status
        err.data = errorData
        throw err
      }

            // Verificar se a resposta tem conteúdo JSON válido
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        try {
          return text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Response text:', text);
          throw new Error(`Invalid JSON response: ${text}`);
        }
             } else {
         // Se não for JSON, retornar texto ou resposta vazia
         const text = await response.text();
         return (text || {}) as T;
       }
    } catch (error) {
      console.error('🚨 API request failed:', {
        url,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        baseURL: this.baseURL,
        endpoint,
        config: {
          method: config.method,
          headers: config.headers
        }
      });
      
      // Melhores mensagens de erro para usuário
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${this.baseURL}`);
      }
      
      throw error;
    }
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
    search?: string;
  }): Promise<{ items: Workflow[]; total: number; page: number; size: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.is_public !== undefined) queryParams.append('is_public', params.is_public.toString());
    if (params?.search) queryParams.append('search', params.search);

    return await this.request<any>(`/workflows/?${queryParams.toString()}`);
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
    return await this.request<Workflow>('/workflows/', {
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
    search?: string;
  }): Promise<{ items: Node[]; total: number; page: number; size: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.is_public !== undefined) queryParams.append('is_public', params.is_public.toString());
    if (params?.search) queryParams.append('search', params.search);

    return await this.request<any>(`/nodes/?${queryParams.toString()}`);
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
    return await this.request<Node>('/nodes/', {
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
    search?: string;
  }): Promise<{ items: Agent[]; total: number; page: number; size: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.agent_type) queryParams.append('agent_type', params.agent_type);
    if (params?.search) queryParams.append('search', params.search);

    return await this.request<any>(`/agents/?${queryParams.toString()}`);
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
    return await this.request<Agent>('/agents/', {
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

  // Templates
  async getTemplates(params?: {
    search?: string;
    category?: string[];
    tags?: string[];
    license_type?: string[];
    price_min?: number;
    price_max?: number;
    rating_min?: number;
    complexity_min?: number;
    complexity_max?: number;
    is_featured?: boolean;
    is_verified?: boolean;
    author_id?: number;
    industries?: string[];
    use_cases?: string[];
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ items: any[]; total: number; page: number; per_page: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) params.category.forEach(cat => queryParams.append('category', cat));
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.license_type) params.license_type.forEach(type => queryParams.append('license_type', type));
    if (params?.price_min !== undefined) queryParams.append('price_min', params.price_min.toString());
    if (params?.price_max !== undefined) queryParams.append('price_max', params.price_max.toString());
    if (params?.rating_min !== undefined) queryParams.append('rating_min', params.rating_min.toString());
    if (params?.complexity_min !== undefined) queryParams.append('complexity_min', params.complexity_min.toString());
    if (params?.complexity_max !== undefined) queryParams.append('complexity_max', params.complexity_max.toString());
    if (params?.is_featured !== undefined) queryParams.append('is_featured', params.is_featured.toString());
    if (params?.is_verified !== undefined) queryParams.append('is_verified', params.is_verified.toString());
    if (params?.author_id !== undefined) queryParams.append('author_id', params.author_id.toString());
    if (params?.industries) params.industries.forEach(industry => queryParams.append('industries', industry));
    if (params?.use_cases) params.use_cases.forEach(useCase => queryParams.append('use_cases', useCase));
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    return await this.request<any>(`/templates/?${queryParams.toString()}`);
  }

  async createTemplate(templateData: {
    name: string;
    description?: string;
    category: string;
    tags?: string[];
    license_type?: string;
    price?: number;
    complexity?: number;
    industries?: string[];
    use_cases?: string[];
    workflow_definition?: any;
  }, workflowId?: number): Promise<any> {
    const queryParams = workflowId ? `?workflow_id=${workflowId}` : '';
    return await this.request<any>(`/templates/${queryParams}`, {
      method: 'POST',
      body: JSON.stringify(templateData),
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

    return await this.request<any>(`/conversations/?${queryParams.toString()}`);
  }

  async getConversation(id: string): Promise<Conversation> {
    return await this.request<Conversation>(`/conversations/${id}`);
  }

  async createConversation(conversationData: {
    agent_id?: string;
    title?: string;
    context?: any;
  }): Promise<Conversation> {
    return await this.request<Conversation>('/conversations/', {
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

    return await this.request<any>(`/conversations/${conversationId}/messages/?${queryParams.toString()}`);
  }

  async sendMessage(conversationId: string, messageData: {
    content: string;
    attachments?: any[];
  }): Promise<Message> {
    return await this.request<Message>(`/conversations/${conversationId}/messages/`, {
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
      console.log('🏥 Testando conectividade da API...');
      await this.request('/health', { skipAuth: true })
      console.log('✅ API está acessível');
      return true
    } catch (error) {
      console.error('❌ Health check failed:', error)
      return false
    }
  }

  /**
   * Testa conectividade com a URL configurada no .env
   */
  async testConnectivity(): Promise<{ success: boolean; workingUrl?: string; errors: string[] }> {
    const errors: string[] = [];
    const configuredUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!configuredUrl) {
      return {
        success: false,
        errors: ['NEXT_PUBLIC_API_URL não está definida no arquivo .env']
      };
    }

    try {
      console.log(`🔍 Testando conectividade com URL configurada: ${configuredUrl}`);
      
      // Remove /api/v1 se estiver presente para adicionar novamente
      const baseUrl = configuredUrl.replace(/\/api(\/v\d+)?$/, '');
      const testUrl = `${baseUrl}/api/v1/health`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log(`✅ Conectividade bem-sucedida com: ${baseUrl}`);
        return {
          success: true,
          workingUrl: baseUrl,
          errors
        };
      } else {
        errors.push(`${baseUrl}: HTTP ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`${configuredUrl}: ${errorMessage}`);
      console.log(`❌ Falha ao conectar com ${configuredUrl}:`, errorMessage);
    }

    return {
      success: false,
      errors
    };
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Método para atualizar tokens externamente (usado pelo AuthService)
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // Método para forçar recarregamento dos tokens do localStorage
  reloadTokens() {
    this.loadTokensFromStorage();
  }

  /**
   * Sincroniza tokens com o AuthService
   * Deve ser chamado quando o AuthService atualiza os tokens
   */
  syncTokensWithAuthService(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    console.log('🔄 ApiService - Tokens sincronizados com AuthService:', {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken
    });

    // Inicializar dados do usuário após sincronização dos tokens
    this.initializeUserData();
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

  // Workspace Management
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      return await this.get<Workspace[]>('/workspaces/');
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      return [];
    }
  }

  async createWorkspace(workspace: Omit<Workspace, 'id' | 'created_at' | 'updated_at' | 'owner_id' | 'owner_name' | 'slug' | 'member_count' | 'project_count' | 'activity_count' | 'storage_used_mb' | 'status' | 'last_activity_at'>): Promise<Workspace> {
    return await this.post<Workspace>('/workspaces/', {
      name: workspace.name,
      description: workspace.description || null,
      avatar_url: workspace.avatar_url || null,
      color: workspace.color || '#3B82F6',
      is_public: workspace.is_public || false,
      allow_guest_access: workspace.allow_guest_access || false,
      require_approval: workspace.require_approval !== false,
      max_members: workspace.max_members || 10,
      max_projects: workspace.max_projects || 50,
      max_storage_mb: workspace.max_storage_mb || 1000,
      enable_real_time_editing: workspace.enable_real_time_editing !== false,
      enable_comments: workspace.enable_comments !== false,
      enable_chat: workspace.enable_chat !== false,
      enable_video_calls: workspace.enable_video_calls || false,
      notification_settings: workspace.notification_settings || null
    });
  }

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    return await this.put<Workspace>(`/workspaces/${id}`, {
      name: updates.name || null,
      description: updates.description || null,
      avatar_url: updates.avatar_url || null,
      color: updates.color || null,
      is_public: updates.is_public !== undefined ? updates.is_public : null,
      allow_guest_access: updates.allow_guest_access !== undefined ? updates.allow_guest_access : null,
      require_approval: updates.require_approval !== undefined ? updates.require_approval : null,
      max_members: updates.max_members || null,
      max_projects: updates.max_projects || null,
      max_storage_mb: updates.max_storage_mb || null,
      enable_real_time_editing: updates.enable_real_time_editing !== undefined ? updates.enable_real_time_editing : null,
      enable_comments: updates.enable_comments !== undefined ? updates.enable_comments : null,
      enable_chat: updates.enable_chat !== undefined ? updates.enable_chat : null,
      enable_video_calls: updates.enable_video_calls !== undefined ? updates.enable_video_calls : null,
      notification_settings: updates.notification_settings || null
    });
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.delete(`/workspaces/${id}`);
  }

  async getWorkspaceMembers(workspaceId: string | number): Promise<WorkspaceMember[]> {
    try {
      return await this.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      return [];
    }
  }

  async inviteWorkspaceMember(workspaceId: string | number, invitation: { email: string; role?: 'owner' | 'admin' | 'member' | 'guest'; message?: string }): Promise<void> {
    await this.post(`/workspaces/${workspaceId}/invite`, {
      email: invitation.email,
      role: invitation.role || 'member',
      message: invitation.message || null
    });
  }

  async getWorkspaceStats(workspaceId: string | number): Promise<WorkspaceStats> {
    try {
      return await this.get<WorkspaceStats>(`/workspaces/${workspaceId}/stats`);
    } catch (error) {
      console.error('Error fetching workspace stats:', error);
      return {
        member_count: 0,
        project_count: 0,
        activity_count: 0,
        storage_used_mb: 0,
        storage_limit_mb: 1000,
        storage_usage_percent: 0,
        recent_activity_count: 0,
        active_projects: 0
      };
    }
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

