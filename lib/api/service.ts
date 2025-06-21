/**
 * Serviço de API completo para integração com o backend SynapScale
 */

import { config } from '../config'
import type { 
  WorkspaceResponse,
  WorkspaceCreate,
  WorkspaceUpdate,
  MemberResponse,
  MemberInvite,
  WorkspaceStats,
  WorkspaceSearchParams,
  WorkspaceCreationRules,
  InvitationResponse,
  ActivityResponse,
  IntegrationResponse,
  BulkMemberOperation,
  BulkProjectOperation,
  BulkOperationResponse
} from '@/types/workspace-types'

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

// Legacy type aliases for compatibility
export type Workspace = WorkspaceResponse;
export type WorkspaceMember = MemberResponse;



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
  
  // Listeners para mudanças de workspace
  private workspaceChangeCallbacks: (() => void)[] = []
  
  // Flag para controlar inicialização única
  private hasInitializedUserData: boolean = false;
  private isInitializingUserData: boolean = false;

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
    const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapsefrontend_auth_token';
    const refreshKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'synapsefrontend_refresh_token';
    
    if (e.key === tokenKey) {
      this.accessToken = e.newValue;
    }
    if (e.key === refreshKey) {
      this.refreshToken = e.newValue;
    }
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapsefrontend_auth_token';
      const refreshKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'synapsefrontend_refresh_token';
      
      this.accessToken = localStorage.getItem(tokenKey);
      this.refreshToken = localStorage.getItem(refreshKey);

      // Log para debug
      console.log('ApiService - Tokens carregados:', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
        accessTokenLength: this.accessToken?.length || 0
      });

      // Temporariamente desabilitado para evitar erros na inicialização
      // TODO: Reabilitar após correção dos endpoints de workspace
      // if (this.accessToken && !this.hasInitializedUserData && !this.isInitializingUserData) {
      //   this.initializeUserData();
      // }
    }
  }

  /**
   * Inicializa dados do usuário após login
   * Carrega workspaces e cria workspace padrão se necessário
   * REGRA DE NEGÓCIO: Todo usuário deve ter pelo menos um workspace
   */
  async initializeUserData() {
    if (this.isInitializingUserData || this.hasInitializedUserData) {
      console.log('⚠️ InitializeUserData já está em andamento ou foi concluído');
      return;
    }
    
    this.isInitializingUserData = true;
    
    try {
      console.log('🚀 Inicializando dados do usuário...');
      
      // Verificar se o usuário está autenticado
      if (!this.isAuthenticated()) {
        console.log('❌ Usuário não autenticado, cancelando inicialização');
        return;
      }
      
      // Carregar workspaces existentes
      const workspaces = await this.getWorkspaces();
      console.log('📋 Workspaces carregados:', workspaces.length);
      
      // Se não há workspaces, criar workspace individual obrigatório
      if (workspaces.length === 0) {
        console.log('🏗️ Nenhum workspace encontrado, criando workspace individual...');
        
        const user = await this.getCurrentUser();
        if (user) {
          const defaultWorkspace = await this.createDefaultWorkspace();
          
          // Criar projeto padrão no workspace
          if (defaultWorkspace) {
            console.log('🏗️ Criando projeto padrão...');
            await this.createDefaultProject(defaultWorkspace.id);
          }
        }
      } else {
        // Notificar que workspaces existentes foram carregados
        console.log('✅ Workspaces existentes carregados, notificando...');
        this.notifyWorkspaceChange();
      }
      
      this.hasInitializedUserData = true;
    } catch (error) {
      const initErrorDetails = {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        status: (error as any)?.status || 'No status',
        data: (error as any)?.data || 'No data',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      };
      console.error('❌ Erro ao inicializar dados do usuário:');
      console.error(JSON.stringify(initErrorDetails, null, 2));
      
      // Verificar tipos específicos de erro
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('conectar ao servidor')) {
          console.error('🌐 Problema de conectividade detectado durante inicialização');
        } else if ((error as any)?.status === 401) {
          console.error('🔐 Erro de autenticação durante inicialização - token pode estar inválido');
        } else if ((error as any)?.status === 403) {
          console.error('🚫 Acesso negado durante inicialização');
        }
      }
    } finally {
      this.isInitializingUserData = false;
    }
  }

  /**
   * Cria workspace individual obrigatório para novos usuários
   * REGRA DE NEGÓCIO: Todo usuário deve ter exatamente um workspace individual
   */
  private async createDefaultWorkspace(): Promise<Workspace | null> {
    try {
      const user = await this.getCurrentUser();
      
      // Verificar novamente se não existem workspaces (segurança dupla)
      const existingWorkspaces = await this.getWorkspaces();
      if (existingWorkspaces.length > 0) {
        console.log('⚠️ Usuário já possui workspaces, cancelando criação');
        return existingWorkspaces[0];
      }
      
      const workspaceName = `Workspace de ${user.full_name || user.email}`;
      
      // Definir configurações baseadas no plano do usuário
      const planLimits = this.getPlanLimits(user.subscription_plan);
      
      const workspaceData: WorkspaceCreate = {
        name: workspaceName,
        description: 'Workspace individual criado automaticamente',
        is_public: false,
        allow_guest_access: false,
        require_approval: false,
        max_members: planLimits.maxMembers,
        max_projects: planLimits.maxProjects,
        max_storage_mb: planLimits.maxStorageMB,
        enable_real_time_editing: true,
        enable_comments: true,
        enable_chat: true,
        enable_video_calls: planLimits.enableVideoCalls,
        color: '#3B82F6',
        type: 'individual',
        plan_id: null
      };

      const workspace = await this.createWorkspace(workspaceData);
      
      console.log('✅ Workspace individual criado com sucesso:', {
        name: workspace.name,
        plan: user.subscription_plan,
        limits: planLimits
      });
      
      // Notificar mudanças de workspace
      this.notifyWorkspaceChange();
      
      return workspace;
    } catch (error) {
      console.error('❌ Erro ao criar workspace individual:', error);
      return null;
    }
  }

  /**
   * Define limites baseados no plano do usuário
   */
  private getPlanLimits(plan: string) {
    const limits = {
      free: {
        maxMembers: 1,
        maxProjects: 3,
        maxStorageMB: 100,
        enableVideoCalls: false
      },
      pro: {
        maxMembers: 10,
        maxProjects: 100,
        maxStorageMB: 1000,
        enableVideoCalls: true
      },
      enterprise: {
        maxMembers: 100,
        maxProjects: 1000,
        maxStorageMB: 10000,
        enableVideoCalls: true
      }
    };

    return limits[plan as keyof typeof limits] || limits.free;
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
      tokenPrefix: this.accessToken?.substring(0, 20) + '...',
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

    // Garantir que o token esteja carregado do localStorage se não estiver em memória
    if (!this.accessToken && !skipAuth && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('synapsefrontend_auth_token');
      if (storedToken) {
        console.log('🔄 API Request: Carregando token do localStorage');
        this.accessToken = storedToken;
      }
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
        hasToken: !!this.accessToken,
        isWorkspaceEndpoint: url.includes('/workspaces'),
        isAuthEndpoint: url.includes('/auth')
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
        let errorData: any = {};
        let responseText = '';
        
        try {
          responseText = await response.text();
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.warn('Failed to parse error response as JSON:', parseError);
          errorData = { message: responseText || 'Unknown error' };
        }

        const apiErrorDetails = {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          responseText,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          requestHeaders: config.headers,
          requestBody: config.body
        };
        console.warn('🚨 API Response Error:', {
          url,
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorData?.detail || errorData?.message || 'Unknown error'
        });

        // Cria erro com código de status para permitir tratamento específico (ex.: 422)
        const errorMessage = errorData?.detail || errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        const err: Error & { status?: number; data?: any } = new Error(errorMessage);
        err.status = response.status;
        err.data = errorData;
        throw err;
      }

      // Verificar se a resposta tem conteúdo JSON válido
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        try {
          return text ? JSON.parse(text) : ({} as T);
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
      // Melhor tratamento de erro com informações mais detalhadas
      const errorInfo = {
        url,
        baseURL: this.baseURL,
        endpoint,
        method: config.method || 'GET',
        hasToken: !!this.accessToken,
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          status: (error as any)?.status,
          data: (error as any)?.data
        }
      };

      console.warn('🚨 API request failed:', {
        url,
        method: config.method || 'GET',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        status: (error as any)?.status
      });
      
      // Melhores mensagens de erro para usuário
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        const networkError = new Error(`Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${this.baseURL}`);
        console.error('🚨 Network Error:', networkError.message);
        throw networkError;
      }

      // Re-throw o erro original com informações adicionais
      if (error instanceof Error) {
        const requestErrorDetails = {
          message: error.message,
          status: (error as any).status,
          data: (error as any).data
        };
        console.warn('🚨 Request Error Details:', requestErrorDetails);
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

  async duplicateAgent(id: string): Promise<Agent> {
    return await this.request<Agent>(`/agents/${id}/duplicate`, {
      method: 'POST',
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
      console.log('🏥 Checking API health...');
      console.log('🔍 Health check URL:', `${this.baseURL}/health`);
      
      const response = await this.request<{ status: string; message?: string }>('/health', { 
        skipAuth: true,
        method: 'GET'
      });
      
      console.log('✅ Health check response:', response);
      return response.status === 'ok' || response.status === 'healthy';
    } catch (error) {
      console.error('❌ Health check failed:', {
        message: error instanceof Error ? error.message : String(error),
        status: (error as any)?.status || 'No status',
        baseURL: this.baseURL,
        fullUrl: `${this.baseURL}/health`
      });
      return false;
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

    // Temporariamente desabilitado para evitar erros na inicialização
    // TODO: Reabilitar após correção dos endpoints de workspace
    // if (!this.hasInitializedUserData && !this.isInitializingUserData) {
    //   this.initializeUserData();
    // }
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

  // Workspace Management - Endpoints da API Oficial
  async getWorkspaces(params?: WorkspaceSearchParams): Promise<Workspace[]> {
    try {
      console.log('🔍 DEBUG ApiService.getWorkspaces - Iniciando requisição...')
      console.log('🔍 DEBUG ApiService.getWorkspaces - Token disponível:', !!this.accessToken)
      console.log('🔍 DEBUG ApiService.getWorkspaces - Token value:', this.accessToken?.substring(0, 20) + '...')
      console.log('🔍 DEBUG ApiService.getWorkspaces - Base URL:', this.baseURL)
      console.log('🔍 DEBUG ApiService.getWorkspaces - Authenticated:', this.isAuthenticated())
      
      // Verificar se o usuário está autenticado
      if (!this.isAuthenticated()) {
        console.log('🔍 DEBUG ApiService.getWorkspaces - Usuário não autenticado, retornando array vazio')
        return [];
      }
      
      const queryParams = new URLSearchParams();
      
      // Usar os parâmetros corretos conforme a API spec
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      // Endpoint correto conforme OpenAPI spec
      const endpoint = `/workspaces/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('🔍 DEBUG ApiService.getWorkspaces - Endpoint final:', endpoint)
      console.log('🔍 DEBUG ApiService.getWorkspaces - URL completa:', this.baseURL + endpoint)
      
      const result = await this.get<Workspace[]>(endpoint);
      
      console.log('🔍 DEBUG ApiService.getWorkspaces - Resultado:', {
        count: result?.length || 0,
        workspaces: result
      })
      
      return result || [];
    } catch (error: any) {
      const workspaceErrorDetails = {
        message: error?.message || 'Unknown error',
        status: error?.status || 'No status',
        data: error?.data || 'No data',
        name: error?.name || 'Unknown error type',
        stack: error?.stack || 'No stack trace'
      };
      console.warn('⚠️ Error fetching workspaces:', workspaceErrorDetails);
      
      // Verificar se é erro de conectividade
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('conectar ao servidor')) {
        console.warn('🌐 Connectivity issue detected - backend may be down');
      }
      
      // Verificar se é erro de autenticação
      if (error?.status === 401) {
        console.warn('🔐 Authentication error - token may be invalid');
      }
      
      return [];
    }
  }

  async searchWorkspaces(params: WorkspaceSearchParams): Promise<Workspace[]> {
    return this.getWorkspaces(params);
  }

  async getWorkspaceCreationRules(): Promise<WorkspaceCreationRules> {
    try {
      return await this.get<WorkspaceCreationRules>('/workspaces/creation-rules');
    } catch (error) {
      console.warn('⚠️ Erro ao buscar regras de criação de workspace:', error);
      
      // Return default rules if API fails
      const defaultRules: WorkspaceCreationRules = {
        can_create: true,
        max_workspaces: null,
        current_workspaces: 0,
        max_members_per_workspace: null,
        max_projects_per_workspace: null,
        max_storage_per_workspace_mb: null,
        features: {
          public_workspaces: true,
          guest_access: true,
          real_time_editing: true,
          video_calls: false,
          integrations: true,
          custom_branding: false,
        },
        plan_name: 'Free',
        plan_type: 'free'
      };
      
      // If it's a 404 error, it means the endpoint doesn't exist yet
      if ((error as any)?.status === 404) {
        console.warn('⚠️ Endpoint /workspaces/creation-rules não encontrado. Usando regras padrão.');
      }
      
      return defaultRules;
    }
  }

  async createWorkspace(workspace: WorkspaceCreate): Promise<Workspace> {
    return await this.post<Workspace>('/workspaces/', workspace);
  }

  async updateWorkspace(id: string, updates: WorkspaceUpdate): Promise<Workspace> {
    return await this.put<Workspace>(`/workspaces/${id}`, updates);
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.delete(`/workspaces/${id}`);
  }

  async getWorkspaceMembers(workspaceId: string | number): Promise<WorkspaceMember[]> {
    try {
      console.log('🔍 DEBUG getWorkspaceMembers - Buscando membros para workspace:', workspaceId);
      const members = await this.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
      console.log('✅ DEBUG getWorkspaceMembers - Membros encontrados:', members?.length || 0);
      return members || [];
    } catch (error) {
      console.warn('⚠️ Error fetching workspace members:', error);
      return [];
    }
  }

  async inviteWorkspaceMember(workspaceId: string | number, invitation: MemberInvite): Promise<void> {
    await this.post(`/workspaces/${workspaceId}/members/invite`, invitation);
  }

  async updateWorkspaceMemberRole(workspaceId: string | number, memberId: number, role: string): Promise<void> {
    await this.put(`/workspaces/${workspaceId}/members/${memberId}/role`, { role });
  }

  async removeWorkspaceMember(workspaceId: string | number, memberId: number): Promise<void> {
    await this.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  }

  async getWorkspaceStats(workspaceId: string | number): Promise<WorkspaceStats> {
    try {
      console.log('🔍 DEBUG getWorkspaceStats - Buscando estatísticas para workspace:', workspaceId);
      const stats = await this.get<WorkspaceStats>(`/workspaces/${workspaceId}/stats`);
      console.log('✅ DEBUG getWorkspaceStats - Estatísticas encontradas:', stats);
      return stats;
    } catch (error) {
      console.warn('⚠️ Error fetching workspace stats:', error);
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

  async getWorkspaceActivities(workspaceId: string | number, params?: { limit?: number; offset?: number }): Promise<ActivityResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const endpoint = `/workspaces/${workspaceId}/activities${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await this.get<ActivityResponse[]>(endpoint);
    } catch (error) {
      console.warn('⚠️ Error fetching workspace activities:', error);
      return [];
    }
  }

  async getWorkspaceIntegrations(workspaceId: string | number): Promise<IntegrationResponse[]> {
    try {
      return await this.get<IntegrationResponse[]>(`/workspaces/${workspaceId}/integrations`);
    } catch (error) {
      console.warn('⚠️ Error fetching workspace integrations:', error);
      return [];
    }
  }

  async bulkOperationMembers(workspaceId: string | number, operation: BulkMemberOperation): Promise<BulkOperationResponse> {
    return await this.post<BulkOperationResponse>(`/workspaces/${workspaceId}/members/bulk`, operation);
  }

  async bulkOperationProjects(workspaceId: string | number, operation: BulkProjectOperation): Promise<BulkOperationResponse> {
    return await this.post<BulkOperationResponse>(`/workspaces/${workspaceId}/projects/bulk`, operation);
  }

  /**
   * Busca estatísticas agregadas de todos os workspaces do usuário
   */
  async getTeamStats(): Promise<{ 
    total_workspaces: number; 
    total_members: number; 
    total_storage_mb: number; 
    active_workspaces: number 
  }> {
    try {
      console.log('🔍 DEBUG getTeamStats - Buscando estatísticas da equipe...');
      
      const workspaces = await this.getWorkspaces();
      console.log('🔍 DEBUG getTeamStats - Workspaces encontrados:', workspaces.length);
      
      let totalMembers = 0;
      let totalStorageMb = 0;
      let activeWorkspaces = 0;
      
      // Buscar estatísticas de cada workspace
      for (const workspace of workspaces) {
        try {
          const stats = await this.getWorkspaceStats(workspace.id);
          totalMembers += stats.member_count;
          totalStorageMb += stats.storage_used_mb;
          if (workspace.status === 'active') activeWorkspaces++;
        } catch (error) {
          console.warn(`⚠️ Erro ao buscar stats do workspace ${workspace.id}:`, error);
        }
      }
      
      const teamStats = {
        total_workspaces: workspaces.length,
        total_members: totalMembers,
        total_storage_mb: totalStorageMb,
        active_workspaces: activeWorkspaces
      };
      
      console.log('✅ DEBUG getTeamStats - Estatísticas agregadas:', teamStats);
      return teamStats;
    } catch (error) {
      console.warn('⚠️ Error fetching team stats:', error);
      throw error; // NÃO retornar dados fake, deixar o erro subir
    }
  }

  /**
   * Busca estatísticas de execução do usuário (API oficial)
   */
  async getExecutionStats(): Promise<any> {
    try {
      console.log('🔍 DEBUG getExecutionStats - Buscando estatísticas de execução...');
      const stats = await this.get('/executions/stats');
      console.log('✅ DEBUG getExecutionStats - Estatísticas encontradas:', stats);
      return stats;
    } catch (error) {
      console.warn('⚠️ Error fetching execution stats:', error);
      throw error; // NÃO retornar dados fake
    }
  }

  /**
   * Busca estatísticas de variáveis do usuário (API oficial)
   */
  async getUserVariableStats(): Promise<any> {
    try {
      console.log('🔍 DEBUG getUserVariableStats - Buscando estatísticas de variáveis...');
      const stats = await this.get('/user-variables/stats/summary');
      console.log('✅ DEBUG getUserVariableStats - Estatísticas encontradas:', stats);
      return stats;
    } catch (error) {
      console.warn('⚠️ Error fetching user variable stats:', error);
      throw error; // NÃO retornar dados fake
    }
  }

  /**
   * Busca visão geral de analytics (API oficial)
   */
  async getAnalyticsOverview(): Promise<any> {
    try {
      console.log('🔍 DEBUG getAnalyticsOverview - Buscando visão geral de analytics...');
      const overview = await this.get('/analytics/overview');
      console.log('✅ DEBUG getAnalyticsOverview - Visão geral encontrada:', overview);
      return overview;
    } catch (error) {
      console.warn('⚠️ Error fetching analytics overview:', error);
      throw error; // NÃO retornar dados fake
    }
  }

  /**
   * Busca métricas de comportamento do usuário (API oficial)
   */
  async getUserBehaviorMetrics(startDate: string, endDate: string, granularity: string = 'day'): Promise<any> {
    try {
      console.log('🔍 DEBUG getUserBehaviorMetrics - Buscando métricas de comportamento...');
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        granularity: granularity
      });
      const metrics = await this.get(`/analytics/metrics/user-behavior?${params}`);
      console.log('✅ DEBUG getUserBehaviorMetrics - Métricas encontradas:', metrics);
      return metrics;
    } catch (error) {
      console.warn('⚠️ Error fetching user behavior metrics:', error);
      throw error; // NÃO retornar dados fake
    }
  }

  /**
   * Adiciona callback para mudanças de workspace
   */
  onWorkspaceChange(callback: () => void): void {
    this.workspaceChangeCallbacks.push(callback)
  }

  /**
   * Remove callback de mudanças de workspace
   */
  offWorkspaceChange(callback: () => void): void {
    const index = this.workspaceChangeCallbacks.indexOf(callback)
    if (index > -1) {
      this.workspaceChangeCallbacks.splice(index, 1)
    }
  }

  /**
   * Notifica todos os callbacks sobre mudanças de workspace
   */
  private notifyWorkspaceChange(): void {
    console.log('🔔 Notificando mudanças de workspace para', this.workspaceChangeCallbacks.length, 'listeners')
    this.workspaceChangeCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('Erro ao executar callback de workspace:', error)
      }
    })
  }

  /**
   * Método de debug para testar conectividade e configurações da API
   * Pode ser chamado no console do browser: apiService.debugApi()
   */
  async debugApi(): Promise<void> {
    console.log('🔧 === API DEBUG INFORMATION ===');
    console.log('🔍 Base URL:', this.baseURL);
    console.log('🔍 Environment:', process.env.NEXT_PUBLIC_APP_ENV);
    console.log('🔍 API URL from env:', process.env.NEXT_PUBLIC_API_URL);
    console.log('🔍 WS URL from env:', process.env.NEXT_PUBLIC_WS_URL);
    console.log('🔍 Has access token:', !!this.accessToken);
    console.log('🔍 Is authenticated:', this.isAuthenticated());
    
    if (this.accessToken) {
      console.log('🔍 Token preview:', this.accessToken.substring(0, 20) + '...');
    }
    
    // Test health endpoint
    console.log('\n🏥 Testing health endpoint...');
    const healthStatus = await this.healthCheck();
    console.log('🏥 Health status:', healthStatus ? '✅ OK' : '❌ FAILED');
    
    // Test authentication endpoint if token exists
    if (this.isAuthenticated()) {
      console.log('\n👤 Testing authentication...');
      try {
        const user = await this.getCurrentUser();
        console.log('👤 Current user:', user);
      } catch (error) {
        console.error('👤 Auth test failed:', error);
      }
    }
    
    // Test workspaces endpoint if authenticated
    if (this.isAuthenticated()) {
      console.log('\n🏢 Testing workspaces endpoint...');
      try {
        const workspaces = await this.getWorkspaces();
        console.log('🏢 Workspaces:', workspaces);
      } catch (error) {
        console.error('🏢 Workspaces test failed:', error);
      }
    }
    
    console.log('🔧 === END DEBUG INFORMATION ===');
  }

  /**
   * Método de teste para debug de serialização de erro
   * Para testar: apiService.testErrorHandling()
   */
  async testErrorHandling(): Promise<void> {
    console.log('🧪 Testing error handling...');
    
    try {
      // Teste 1: Criar um erro simples
      const simpleError = new Error('Test error message');
      console.log('🧪 Simple error:', simpleError);
      console.log('🧪 Simple error message:', simpleError.message);
      console.log('🧪 Simple error name:', simpleError.name);
      
      // Teste 2: Criar um erro com propriedades extras
      const enhancedError = new Error('Enhanced test error') as any;
      enhancedError.status = 500;
      enhancedError.data = { test: 'data' };
      console.log('🧪 Enhanced error:', enhancedError);
      console.log('🧪 Enhanced error message:', enhancedError.message);
      console.log('🧪 Enhanced error status:', enhancedError.status);
      console.log('🧪 Enhanced error data:', enhancedError.data);
      
      // Teste 3: Simular erro de fetch
      console.log('🧪 Testing fetch to invalid URL...');
      await fetch('http://invalid-url-that-should-fail.local');
      
    } catch (error) {
      // Log do erro capturado
      console.log('🧪 Caught error type:', typeof error);
      console.log('🧪 Caught error instanceof Error:', error instanceof Error);
      console.log('🧪 Caught error:', error);
      
      if (error instanceof Error) {
        console.log('🧪 Error message:', error.message);
        console.log('🧪 Error name:', error.name);
        console.log('🧪 Error stack:', error.stack);
      }
      
      // Teste de serialização manual
      const errorInfo = {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        status: (error as any)?.status,
        data: (error as any)?.data
      };
      console.log('🧪 Manual error serialization:', errorInfo);
    }
  }
}

// Instância global do serviço
export const apiService = new ApiService();

// Adicionar ao objeto global para debug no console do browser
if (typeof window !== 'undefined') {
  (window as any).apiService = apiService;
  console.log('🔧 ApiService disponível no console como: window.apiService');
  console.log('🔧 Para debug, use: apiService.debugApi()');
}

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

