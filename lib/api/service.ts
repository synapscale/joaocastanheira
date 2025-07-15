/**
 * Serviço de API completo para integração com o backend SynapScale
 */

import { config, isSystemEndpoint } from '../config'
import type { AuthTokens } from '../types/auth'
import type {
    WorkspaceResponse as WorkspaceResponseType,
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
} from '../../types/workspace-types'
// import type { CodeTemplate } from './openapi-types' // CodeTemplate não existe na API oficial

// Configuração base da API
const API_BASE_URL = config.apiBaseUrl;
const SYSTEM_API_BASE_URL = config.systemApiBaseUrl;
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

// Interface para resposta da API (formato snake_case)
interface ApiAuthResponse {
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

// Interface para estatísticas da equipe
export interface TeamStats {
    total_members: number;
    total_workspaces: number;
    total_projects: number;
    storage_used_gb: number;
    api_calls_this_month: number;
    active_executions: number;
}

export interface WorkspaceResponse {
    id: string
    name: string
    slug: string
    description: string | null
    avatar_url: string | null
    color: string | null
    is_public: boolean
    is_template: boolean
    type: 'individual' | 'team' | 'enterprise'
    owner_id: string
    tenant_id: string
    member_count: number
    project_count: number
    activity_count: number
    storage_used_mb: number
    api_calls_today: number | null
    api_calls_this_month: number | null
    status: string
    created_at: string
    updated_at: string
    last_activity_at: string
    max_members: number | null
    max_projects: number | null
    max_storage_mb: number | null
    // Configurações
    allow_guest_access: boolean
    require_approval: boolean
    enable_real_time_editing: boolean
    enable_comments: boolean
    enable_chat: boolean
    enable_video_calls: boolean
    email_notifications: boolean
    push_notifications: boolean
    feature_usage_count: Record<string, any> | null
    last_api_reset_daily: string | null
    last_api_reset_monthly: string | null
}

export interface WorkspaceListResponse {
    items: WorkspaceResponse[]
    total: number
}

export interface WorkspaceMemberResponse {
    id: number
    workspace_id: string
    user_id: string
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
    status: string
    custom_permissions: Record<string, any> | null
    notification_preferences: Record<string, any> | null
    is_favorite: boolean
    last_seen_at: string
    joined_at: string
    left_at: string | null
    user_name: string | null
    user_email: string | null
    user_avatar: string | null
}

export interface WorkspaceMemberListResponse {
    items: WorkspaceMemberResponse[]
    total: number
    page: number
    pages: number
    size: number
}



// Tipagem estendida para permitir flag skipAuth em opções de requisição
interface ApiRequestOptions extends RequestInit {
    /** Se true, não adiciona o header Authorization mesmo se houver token */
    skipAuth?: boolean
}

// Classe principal do serviço de API
export class ApiService {
    private baseURL: string;
    private systemBaseURL: string;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private currentToken: string | null = null;

    // Chaves para armazenamento de tokens
    private tokenKey: string = 'synapsefrontend_auth_token';
    private refreshTokenKey: string = 'synapsefrontend_refresh_token';

    // Listeners para mudanças de workspace
    private workspaceChangeCallbacks: (() => void)[] = []

    // Flag para controlar inicialização única
    private hasInitializedUserData: boolean = false;
    private isInitializingUserData: boolean = false;

    // Instância do Axios para interceptors
    private axiosInstance: any = {
        defaults: {
            headers: {
                common: {}
            }
        }
    };

    constructor() {
        this.baseURL = API_BASE_URL;
        this.systemBaseURL = SYSTEM_API_BASE_URL;

        // Configurar validação de certificado SSL para desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

        // Carregar tokens do localStorage ao inicializar
        this.loadTokensFromStorage();

        // Escutar mudanças no localStorage de outras abas
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', this.handleStorageChange.bind(this));
        }

        // REMOVIDO: this.initializeUserData() - não mais execução automática
        // initializeUserData() deve ser chamado apenas após login manual
        console.log('✅ ApiService inicializado sem execução automática de requests');
    }

    private handleStorageChange(e: StorageEvent) {
        // Evitar loop infinito: ignorar eventos artificiais disparados por nós mesmos
        if (e.storageArea === localStorage && e.key) {
            const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapsefrontend_auth_token';
            const refreshKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'synapsefrontend_refresh_token';

            // Prevent loops by ignoring auth_sync temporary keys
            if (e.key.startsWith('auth_sync_')) {
                return;
            }

            if (e.key === tokenKey) {
                this.accessToken = e.newValue;
                if (e.newValue && e.newValue !== this.currentToken) {
                    this.setTokenInMemory(e.newValue);
                } else if (!e.newValue) {
                    this.currentToken = null;
                }
            }
            if (e.key === refreshKey) {
                this.refreshToken = e.newValue;
            }
        }
    }

    private loadTokensFromStorage() {
        if (typeof window !== 'undefined') {
            const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapsefrontend_auth_token';
            const refreshKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'synapsefrontend_refresh_token';

            const token = localStorage.getItem(tokenKey);
            const refreshToken = localStorage.getItem(refreshKey);

            // Definir tokens em ambas as propriedades para garantir compatibilidade
            this.accessToken = token;
            this.refreshToken = refreshToken;

            // Definir também o currentToken e headers
            if (token) {
                this.setTokenInMemory(token);
            }

            // Log para debug
            console.log('ApiService - Tokens carregados:', {
                hasAccessToken: !!this.accessToken,
                hasRefreshToken: !!this.refreshToken,
                accessTokenLength: this.accessToken?.length || 0
            });

            // REMOVIDO: Verificação automática que causava requests automáticos
            // A inicialização de dados deve acontecer apenas após login manual
            // Mantemos apenas tokens em memória sem fazer requests para servidor
            console.log('🔒 ApiService: Tokens carregados em memória sem inicialização automática');
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

            // Tentar carregar workspaces existentes (pode falhar se endpoints não estiverem funcionando)
            try {
                const workspaces = await this.getWorkspaces();
                console.log('📋 Workspaces carregados:', workspaces.length);

                // Se não há workspaces, criar workspace individual obrigatório
                if (workspaces.length === 0) {
                    console.log('🏗️ Nenhum workspace encontrado, criando workspace individual...');

                    try {
                        const user = await this.getCurrentUser();
                        if (user) {
                            const defaultWorkspace = await this.createDefaultWorkspace();

                            // Criar projeto padrão no workspace
                            if (defaultWorkspace) {
                                console.log('🏗️ Criando projeto padrão...');
                                await this.createDefaultProject(defaultWorkspace.id);
                            }
                        }
                    } catch (userError) {
                        console.warn('⚠️ Não foi possível criar workspace padrão:', userError);
                        // Não falha a inicialização por problemas de workspace
                    }
                } else {
                    // Notificar que workspaces existentes foram carregados
                    console.log('✅ Workspaces existentes carregados, notificando...');
                    this.notifyWorkspaceChange();
                }
            } catch (workspaceError) {
                console.warn('⚠️ Não foi possível carregar workspaces durante inicialização:', workspaceError);
                // Não falha a inicialização por problemas de workspace
                // O usuário pode acessar a aplicação mesmo sem workspaces funcionando
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
            await this.post('/workspaces/' + workspaceId + '/projects', {
                name: 'Meu Primeiro Projeto',
                description: 'Projeto padrão criado automaticamente para começar',
                status: 'active'
            });

            console.log('✅ Projeto padrão criado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao criar projeto padrão:', error);
        }
    }

    /**
     * Salva tokens no localStorage e sincroniza com AuthService
     */
    private saveTokensToStorage(tokens: { accessToken: string; refreshToken?: string }) {
        if (typeof window === 'undefined') return

        try {
            // Salvar no localStorage
            localStorage.setItem(this.tokenKey, tokens.accessToken)
            if (tokens.refreshToken) {
                localStorage.setItem(this.refreshTokenKey, tokens.refreshToken)
            }

            // Sincronizar com AuthService (que irá definir os cookies)
            this.syncTokensWithAuthService()

            console.log('✅ ApiService: Tokens salvos no localStorage e sincronizados')

            // Verificar se os tokens foram salvos corretamente
            setTimeout(() => {
                const storedToken = localStorage.getItem(this.tokenKey)
                const storedRefreshToken = localStorage.getItem(this.refreshTokenKey)

                if (!storedToken) {
                    console.error('❌ ApiService: Token não foi salvo corretamente no localStorage')
                } else {
                    console.log('✅ ApiService: Token salvo com sucesso no localStorage')
                }

                if (tokens.refreshToken && !storedRefreshToken) {
                    console.error('❌ ApiService: Refresh token não foi salvo corretamente no localStorage')
                } else if (tokens.refreshToken) {
                    console.log('✅ ApiService: Refresh token salvo com sucesso no localStorage')
                }
            }, 50)

        } catch (error) {
            console.error('❌ ApiService: Erro ao salvar tokens no localStorage:', error)
        }
    }

    /**
     * Sincroniza tokens com AuthService
     */
    public syncTokensWithAuthService(): void {
        if (typeof window === 'undefined') return

        try {
            // Obter tokens do localStorage
            const token = localStorage.getItem(this.tokenKey)
            const refreshToken = localStorage.getItem(this.refreshTokenKey)

            if (token) {
                // Definir tokens na memória
                this.setTokenInMemory(token)
                console.log('✅ ApiService: Token sincronizado com AuthService')
            }

            if (refreshToken) {
                console.log('✅ ApiService: Refresh token sincronizado com AuthService')
            }

        } catch (error) {
            console.error('❌ ApiService: Erro ao sincronizar tokens com AuthService:', error)
        }
    }

    /**
     * Define o token na memória (para uso imediato)
     */
    private setTokenInMemory(token: string): void {
        this.currentToken = token

        // Configurar header Authorization padrão
        if (this.axiosInstance.defaults.headers.common) {
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }

        console.log('✅ ApiService: Token definido na memória e headers configurados')
    }

    /**
     * Obtém o token atual (prioridade: memória > localStorage)
     */
    public getToken(): string | null {
        if (this.currentToken) {
            return this.currentToken
        }

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(this.tokenKey)
            if (token) {
                this.setTokenInMemory(token)
                return token
            }
        }

        return null
    }

    /**
     * Verifica se o usuário está autenticado
     */
    public isAuthenticated(): boolean {
        const token = this.getToken()
        if (!token) return false

        try {
            // Verificar se o token não está expirado
            const payload = JSON.parse(atob(token.split('.')[1]))
            const now = Math.floor(Date.now() / 1000)

            if (payload.exp && payload.exp < now) {
                console.log('⚠️ ApiService: Token expirado')
                return false
            }

            return true
        } catch (error) {
            console.error('❌ ApiService: Erro ao verificar token:', error)
            return false
        }
    }

    /**
     * Limpa todos os tokens
     */
    public clearTokens(): void {
        this.currentToken = null
        this.accessToken = null
        this.refreshToken = null

        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.tokenKey)
            localStorage.removeItem(this.refreshTokenKey)
        }

        // Limpar headers
        if (this.axiosInstance.defaults.headers.common) {
            delete this.axiosInstance.defaults.headers.common['Authorization']
        }

        console.log('✅ ApiService: Tokens limpos da memória e localStorage')
    }

    // Workspaces operations (fix missing methods)
    /**
     * Get all workspaces for the user
     */
    public async getWorkspaces(): Promise<WorkspaceResponse[]> {
        const response = await this.request<WorkspaceListResponse>('/workspaces/')
        return response.items
    }

    /**
     * Analytics overview (substitui getTeamStats)
     */
    public async getAnalyticsOverview(): Promise<any> {
        return await this.request<any>('/analytics/overview')
    }

    /**
     * Get all workspace members across all workspaces
     */
    public async getAllWorkspaceMembers(): Promise<any[]> {
    return await this.request<any[]>('/workspace-members/')
    }

    /**
     * Get all team members (substitui getAllTeamMembers)
     */
    public async getAllTeamMembers(): Promise<WorkspaceMemberResponse[]> {
        try {
            // Usar endpoint agregado de workspace members
            const members = await this.getAllWorkspaceMembers();
            return members.map((member: any) => ({
                id: member.id,
                workspace_id: member.workspace_id,
                user_id: member.user_id,
                role: member.role,
                status: member.status,
                custom_permissions: member.custom_permissions,
                notification_preferences: member.notification_preferences,
                is_favorite: member.is_favorite,
                last_seen_at: member.last_seen_at,
                joined_at: member.joined_at,
                left_at: member.left_at,
                user_name: member.user_name,
                user_email: member.user_email,
                user_avatar: member.user_avatar
            }));
        } catch (error) {
            console.error('Erro ao obter membros da equipe:', error);
            return [];
        }
    }

    /**
     * Calcular estatísticas da equipe baseadas nos workspaces
     */
    public async getTeamStats(): Promise<TeamStats> {
        try {
            const workspaces = await this.getWorkspaces();
            
            // Calcular estatísticas agregadas
            const stats: TeamStats = {
                total_members: 0,
                total_workspaces: workspaces.length,
                total_projects: 0,
                storage_used_gb: 0,
                api_calls_this_month: 0,
                active_executions: 0
            };

            // Somar estatísticas de todos os workspaces
            for (const workspace of workspaces) {
                stats.total_members += workspace.member_count || 0;
                stats.total_projects += workspace.project_count || 0;
                stats.storage_used_gb += (workspace.storage_used_mb || 0) / 1024; // Converter MB para GB
                stats.api_calls_this_month += workspace.api_calls_this_month || 0;
                stats.active_executions += workspace.activity_count || 0;
            }

            return stats;
        } catch (error) {
            console.error('Erro ao calcular estatísticas da equipe:', error);
            // Retornar valores padrão em caso de erro
            return {
                total_members: 0,
                total_workspaces: 0,
                total_projects: 0,
                storage_used_gb: 0,
                api_calls_this_month: 0,
                active_executions: 0
            };
        }
    }

    /**
     * Create a new workspace
     */
    public async createWorkspace(workspaceData: any): Promise<Workspace> {
        return await this.request<Workspace>('/workspaces/', {
            method: 'POST',
            body: JSON.stringify(workspaceData),
        });
    }

    /**
     * Register a callback for workspace change events
     */
    public onWorkspaceChange(callback: () => void): void {
        this.workspaceChangeCallbacks.push(callback)
    }

    /**
     * Unregister a callback for workspace change events
     */
    public offWorkspaceChange(callback: () => void): void {
        this.workspaceChangeCallbacks = this.workspaceChangeCallbacks.filter(cb => cb !== callback)
    }

    /**
     * Notify registered callbacks about workspace changes
     */
    private notifyWorkspaceChange(): void {
        this.workspaceChangeCallbacks.forEach(cb => cb())
    }

    /**
     * Alias for clearTokens to include storage cleanup
     */
    public clearTokensFromStorage(): void {
        this.clearTokens()
    }

    // Método base para requisições
    public async request<T>(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<T> {
        // Escolher URL base baseada no tipo de endpoint
        const baseURL = isSystemEndpoint(endpoint) ? this.systemBaseURL : this.baseURL;
        const url = `${baseURL}${endpoint}`

        // Log de debug para verificar a URL sendo chamada
        console.log('🔍 API Request Debug:', {
            appBaseURL: this.baseURL,
            systemBaseURL: this.systemBaseURL,
            isSystemEndpoint: isSystemEndpoint(endpoint),
            selectedBaseURL: baseURL,
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
            const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'synapsefrontend_auth_token';
            const storedToken = localStorage.getItem(tokenKey);
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
                        Authorization: `Bearer ${newTokens.accessToken}`,
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
                console.log('🚨 API Request - Resposta com erro. Status:', response.status, 'URL:', url);
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

                // Enhanced error handling for specific backend errors
                const errorMessage = errorData?.detail || errorData?.message || `HTTP ${response.status}: ${response.statusText}`;

                // Handle specific backend database errors
                if (errorMessage.includes('Erro interno do banco de dados') ||
                    errorMessage.includes('Database error') ||
                    errorMessage.includes('Internal server error')) {
                    const dbError = new Error('O backend está enfrentando problemas de conectividade com o banco de dados. Tente novamente em alguns minutos.');
                    (dbError as any).status = response.status;
                    (dbError as any).data = errorData;
                    (dbError as any).isBackendError = true;
                    throw dbError;
                }

                // Handle authentication errors more gracefully
                if (response.status === 401) {
                    if (errorMessage.includes('Credenciais de autenticação necessárias') ||
                        errorMessage.includes('Authentication required')) {
                        const authError = new Error('Sessão expirada. Faça login novamente.');
                        (authError as any).status = 401;
                        (authError as any).data = errorData;
                        (authError as any).requiresReauth = true;

                        // Clear tokens on auth error
                        this.clearTokensFromStorage();
                        throw authError;
                    }
                }

                // Handle service unavailable errors (common with Render free tier)
                if (response.status === 503 || response.status === 502) {
                    const serviceError = new Error('O serviço está temporariamente indisponível. Aguarde alguns minutos e tente novamente.');
                    (serviceError as any).status = response.status;
                    (serviceError as any).data = errorData;
                    (serviceError as any).isServiceUnavailable = true;
                    throw serviceError;
                }

                // Create error with status code for specific handling
                const err: Error & { status?: number; data?: any } = new Error(errorMessage);
                err.status = response.status;
                err.data = errorData;
                throw err;
            }

            // Verificar se a resposta tem conteúdo JSON válido
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                let text = await response.text();

                // Log da resposta bruta para debug
                console.log('🔍 API Response Raw Text:', text);
                console.log('🔍 API Response Status:', response.status);
                console.log('🔍 API Response Content-Type:', contentType);

                // Para respostas de sucesso (200-299), tentar parse simples primeiro
                if (response.status >= 200 && response.status < 300) {
                    try {
                        let parsedData = JSON.parse(text);
                        console.log('✅ Parse simples bem-sucedido para resposta de sucesso:', parsedData);
                        return parsedData as T;
                    } catch (parseError) {
                        console.error('💥 ERRO: Parse falhou para resposta de sucesso! Status:', response.status);
                        console.error('💥 Texto recebido:', text);
                        console.error('💥 Erro de parse:', parseError);
                        throw new Error(`Falha ao processar resposta de sucesso: ${parseError}`);
                    }
                }

                // Para outras respostas, usar a lógica complexa existente
                try {
                    // Primeira tentativa: parse direto
                    let parsedData = JSON.parse(text);
                    console.log('✅ Parse direto bem-sucedido:', parsedData);
                    return parsedData as T;

                } catch (parseError) {
                    console.warn('❌ Parse direto falhou, tentando limpeza automática...', parseError);

                    // Segunda tentativa: limpeza básica da string
                    try {
                        // Remover caracteres estranhos comuns que podem corromper JSON
                        let cleanedText = text
                            .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove caracteres de controle
                            .replace(/\(\"/g, '{"')               // Corrigir ( para {
                            .replace(/\"\)/g, '"}')               // Corrigir ") para "}
                            .replace(/\'\"/g, '"')                // Corrigir '" para "
                            .replace(/\"\'/g, '"')                // Corrigir "' para "
                            .replace(/\"\s*\.\s*\"/g, '","')      // Corrigir ". para ","
                            .trim();

                        console.log('🧹 Texto limpo:', cleanedText);

                        let cleanedParsed = JSON.parse(cleanedText);
                        console.log('✅ Parse com limpeza bem-sucedido:', cleanedParsed);
                        return cleanedParsed as T;

                    } catch (cleanError) {
                        console.warn('❌ Parse com limpeza falhou, extraindo manualmente...', cleanError);

                        // Terceira tentativa: extração manual de dados estruturados
                        try {
                            // Procurar por objetos JSON válidos na string
                            const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
                            const matches = text.match(jsonPattern);

                            if (matches) {
                                console.log('🔍 JSONs encontrados:', matches);

                                for (const match of matches) {
                                    try {
                                        const extracted = JSON.parse(match);
                                        console.log('✅ JSON extraído com sucesso:', extracted);

                                        // Se contém tokens, é provavelmente nossa resposta
                                        if (extracted.access_token || extracted.data?.access_token) {
                                            return extracted as T;
                                        }

                                        // Se tem estrutura de sucesso com dados
                                        if (extracted.status === 'success' && extracted.data) {
                                            return extracted as T;
                                        }
                                    } catch (matchError) {
                                        console.warn('❌ Falha ao parsear match:', match.substring(0, 100), matchError);
                                    }
                                }
                            }

                            // Quarta tentativa: parsing manual de tokens específicos
                            const tokenPattern = /"access_token"\s*:\s*"([^"]+)"/;
                            const refreshPattern = /"refresh_token"\s*:\s*"([^"]+)"/;
                            const userPattern = /"user"\s*:\s*(\{[^}]+\})/;

                            const accessMatch = text.match(tokenPattern);
                            const refreshMatch = text.match(refreshPattern);

                            if (accessMatch && refreshMatch) {
                                console.log('🔧 Construindo resposta a partir de tokens extraídos...');

                                let userObj = {};
                                const userMatch = text.match(userPattern);
                                if (userMatch) {
                                    try {
                                        userObj = JSON.parse(userMatch[1]);
                                    } catch (userError) {
                                        console.warn('❌ Falha ao parsear user, usando fallback');
                                        userObj = {
                                            id: "extracted-user",
                                            email: "extracted@example.com",
                                            username: "extracted",
                                            full_name: "Extracted User"
                                        };
                                    }
                                }

                                const constructedResponse = {
                                    access_token: accessMatch[1],
                                    refresh_token: refreshMatch[1],
                                    token_type: 'Bearer',
                                    user: userObj
                                };

                                console.log('✅ Resposta construída manualmente:', constructedResponse);
                                return constructedResponse as T;
                            }

                            throw new Error(`Não foi possível extrair dados válidos da resposta: ${text.substring(0, 300)}...`);

                        } catch (extractError) {
                            console.error('💥 Todas as tentativas de parsing falharam:', extractError);
                            throw new Error(`Resposta JSON inválida do servidor. Raw response: ${text.substring(0, 500)}...`);
                        }
                    }
                }
            } else {
                // Se não for JSON, retornar texto ou resposta vazia
                const text = await response.text();
                return (text || {}) as T;
            }
        } catch (error) {
            console.log('🚨 API Request - Entrou no catch final. Erro:', error);
            console.log('🚨 API Request - Tipo do erro:', typeof error);

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

    public async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', ...options })
    }

    public async post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data), ...options })
    }

    public async put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data), ...options })
    }

    public async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', ...options })
    }

    // Autenticação
    /**
     * Login do usuário (compatível com resposta antiga e nova)
     */
    public async login(email: string, password: string): Promise<AuthTokens & { user: User }> {
        // Envia para o endpoint correto
        const apiResponse = await this.request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true,
        });

        // Extrai dados do wrapper da API (se existir)
        const loginData = apiResponse.data || apiResponse;

        // Normaliza resposta para AuthTokens & { user: User }
        const tokens: AuthTokens & { user: User } = {
            accessToken: loginData.accessToken || loginData.access_token,
            refreshToken: loginData.refreshToken || loginData.refresh_token,
            tokenType: loginData.tokenType || 'Bearer',
            expiresIn: loginData.expiresIn || 0,
            user: loginData.user
        };

        // Salva tokens para persistência e uso imediato
        this.saveTokensToStorage(tokens);
        return tokens;
    }

    /**
     * Logout do usuário
     */
    public async logout(): Promise<void> {
        await this.request<void>('/auth/logout', { method: 'POST' });
        this.clearTokensFromStorage();
    }

    /**
     * Buscar informações do usuário logado
     */
    public async getCurrentUser(): Promise<User> {
        return await this.request<User>('/users/me');
    }

    /**
     * Buscar todos os usuários (admin)
     */
    public async getUsers(): Promise<User[]> {
        return await this.request<User[]>('/users/');
    }

    /**
     * Buscar detalhes de um workspace
     */
    public async getWorkspace(workspaceId: string): Promise<Workspace> {
        return await this.request<Workspace>(`/workspaces/${workspaceId}`);
    }

    /**
     * Buscar membros de um workspace
     */
    public async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberResponse[]> {
    const response = await this.request<WorkspaceMemberListResponse>(`/workspaces/${workspaceId}/members`);
    return response.items;
    }

    /**
     * Atualizar workspace
     */
    public async updateWorkspace(workspaceId: string, workspaceData: any): Promise<Workspace> {
        return await this.request<Workspace>(`/workspaces/${workspaceId}`, {
            method: 'PUT',
            body: JSON.stringify(workspaceData),
        });
    }

    /**
     * Deletar workspace
     */
    public async deleteWorkspace(workspaceId: string): Promise<void> {
        await this.request<void>(`/workspaces/${workspaceId}`, { method: 'DELETE' });
    }

    async refreshAccessToken(): Promise<AuthTokens | null> {
        if (!this.refreshToken) return null;

        try {
            const apiResponse = await this.request<ApiAuthResponse>('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refresh_token: this.refreshToken }),
            });

            // Converter resposta da API para formato padrão
            const tokens: AuthTokens = {
                accessToken: apiResponse.access_token,
                refreshToken: apiResponse.refresh_token,
                tokenType: 'Bearer',
                expiresIn: 0
            };

            // Salvar tokens atualizados
            this.saveTokensToStorage(tokens);
            console.log('✅ Tokens refreshed and saved successfully');
            return tokens;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            return null;
        }
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
            // Health endpoint de sistema: /health (sem prefixo /api/v1/)
            const response = await this.get<string>('/health');
            console.log('✅ Backend Health Check:', response);
            return true;
        } catch (error) {
            console.warn('❌ Health check error:', error);
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

            // Usar o endpoint oficial de health check da API
            const healthStatus = await this.healthCheck();

            if (healthStatus) {
                console.log(`✅ Conectividade bem-sucedida com: ${configuredUrl}`);
                return {
                    success: true,
                    workingUrl: configuredUrl,
                    errors
                };
            } else {
                errors.push(`${configuredUrl}: Health check failed`);
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
    // isAuthenticated method already defined above - removing duplicate

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
        console.log('🔄 Recarregando tokens do localStorage');
        this.loadTokensFromStorage();
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

    // === CODE TEMPLATES - ENDPOINTS NÃO IMPLEMENTADOS NA API OFICIAL ===
    // NOTA: Os endpoints /code-templates/* não existem na especificação OpenAPI oficial
    // Mantendo métodos apenas para compatibilidade, mas retornam erro informativo

    async getCodeTemplates(params?: any): Promise<{ items: any[]; total: number; page: number; size: number; pages: number }> {
        throw new Error('⚠️ Endpoint /code-templates não implementado na API oficial. Use /templates para templates de workflow.');
    }

    async getCodeTemplate(id: string): Promise<any> {
        throw new Error('⚠️ Endpoint /code-templates não implementado na API oficial. Use /templates para templates de workflow.');
    }

    async createCodeTemplate(templateData: any): Promise<any> {
        throw new Error('⚠️ Endpoint /code-templates não implementado na API oficial. Use /templates para templates de workflow.');
    }

    async updateCodeTemplate(id: string, templateData: any): Promise<any> {
        throw new Error('⚠️ Endpoint /code-templates não implementado na API oficial. Use /templates para templates de workflow.');
    }

    async deleteCodeTemplate(id: string): Promise<void> {
        throw new Error('⚠️ Endpoint /code-templates não implementado na API oficial. Use /templates para templates de workflow.');
    }

    async cloneCodeTemplate(id: string, newName?: string): Promise<any> {
        throw new Error('⚠️ Endpoint /code-templates não implementado na API oficial. Use /templates para templates de workflow.');
    }

    async getCodeTemplateCategories(): Promise<string[]> {
        throw new Error('⚠️ Endpoint /code-templates não implementado na API oficial. Use /templates para templates de workflow.');
    }

    async getCodeTemplateLanguages(): Promise<string[]> {
        throw new Error('⚠️ Endpoint /code-templates não implementado na API oficial. Use /templates para templates de workflow.');
    }

    async bulkImportCodeTemplates(templates: any[], overwriteExisting: boolean = false): Promise<{ imported: number; skipped: number; errors: string[] }> {
        throw new Error('⚠️ Endpoint /code-templates não implementado na API oficial. Use /templates para templates de workflow.');
    }

    // === TEMPLATES API ===

    // === USER VARIABLES API - Endpoints Oficiais ===

    /**
     * Lista user variables conforme OpenAPI spec
     */
    async getUserVariables(params?: {
        category?: string;
        search?: string;
        is_active?: boolean;
        page?: number;
        size?: number;
    }): Promise<UserVariableListResponseSchema | UserVariableSchema[]> {
        try {
            const queryParams = new URLSearchParams();

            if (params?.category) queryParams.append('category', params.category);
            if (params?.search) queryParams.append('search', params.search);
            if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.size) queryParams.append('size', params.size.toString());

            const queryString = queryParams.toString();
            const endpoint = `/user-variables/${queryString ? '?' + queryString : ''}`;

            return await this.request<UserVariableSchema[]>(endpoint);
        } catch (error) {
            console.warn('⚠️ User variables endpoint not yet implemented on backend:', error);

            // Return empty paginated response structure for now
            return {
                items: [],
                total: 0,
                page: params?.page || 1,
                size: params?.size || 20,
                pages: 0
            };
        }
    }

    /**
     * Cria nova user variable conforme OpenAPI spec
     */
    async createUserVariable(variableData: UserVariableCreateSchema): Promise<UserVariableSchema> {
        try {
            return await this.request<UserVariableSchema>('/user-variables/', {
                method: 'POST',
                body: JSON.stringify(variableData),
            });
        } catch (error) {
            console.warn('⚠️ Create user variable endpoint not yet implemented on backend:', error);
            throw new Error('User variables feature is not yet available on the backend.');
        }
    }

    /**
     * Atualiza user variable conforme OpenAPI spec
     */
    async updateUserVariable(variableId: string, updates: UserVariableUpdateSchema): Promise<UserVariableSchema> {
        try {
            return await this.request<UserVariableSchema>(`/user-variables/${variableId}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
        } catch (error) {
            console.warn('⚠️ Update user variable endpoint not yet implemented on backend:', error);
            throw new Error('User variables feature is not yet available on the backend.');
        }
    }

    /**
     * Deleta user variable conforme OpenAPI spec
     */
    async deleteUserVariable(variableId: string): Promise<void> {
        try {
            await this.request(`/user-variables/${variableId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.warn('⚠️ Delete user variable endpoint not yet implemented on backend:', error);
            throw new Error('User variables feature is not yet available on the backend.');
        }
    }

    /**
     * Obtém user variable por ID conforme OpenAPI spec
     */
    async getUserVariable(variableId: string): Promise<UserVariableSchema> {
        try {
            return await this.request<UserVariableSchema>(`/user-variables/${variableId}`);
        } catch (error) {
            console.warn('⚠️ Get user variable endpoint not yet implemented on backend:', error);
            throw new Error('User variables feature is not yet available on the backend.');
        }
    }

    /**
     * Obtém user variable por chave conforme OpenAPI spec
     */
    async getUserVariableByKey(key: string): Promise<UserVariableSchema> {
        try {
            return await this.request<UserVariableSchema>(`/user-variables/key/${key}`);
        } catch (error) {
            console.warn('⚠️ Get user variable by key endpoint not yet implemented on backend:', error);
            throw new Error('User variables feature is not yet available on the backend.');
        }
    }

    // Note: Bulk operations, import/export, and validation endpoints are not available in the current API spec
    // Only the basic CRUD operations are implemented according to the OpenAPI specification

    /**
     * Placeholder for bulk operations - not implemented in current API
     */
    async bulkUpdateUserVariables(variables: UserVariableBulkUpdateRequestSchema['variables']): Promise<{ updated: number; errors: any[] }> {
        throw new Error('Bulk operations not implemented in current API');
    }

    async bulkCreateUserVariables(variables: UserVariableCreateSchema[]): Promise<{ created: number; errors: any[] }> {
        throw new Error('Bulk operations not implemented in current API');
    }

    async bulkDeleteUserVariables(variableIds: string[]): Promise<{ deleted: number; errors: any[] }> {
        throw new Error('Bulk operations not implemented in current API');
    }

    async importUserVariables(importData: UserVariableImportRequestSchema): Promise<{ imported: number; skipped: number; errors: any[] }> {
        throw new Error('Import operations not implemented in current API');
    }

    async exportUserVariables(exportOptions: UserVariableExportRequestSchema): Promise<{ data: any; format: string }> {
        throw new Error('Export operations not implemented in current API');
    }

    async validateUserVariableKey(key: string): Promise<UserVariableValidateResponseSchema> {
        throw new Error('Validation operations not implemented in current API');
    }

    async getUserVariablesAsDict(): Promise<Record<string, string>> {
        throw new Error('Dict format not implemented in current API');
    }

    async getUserVariablesAsEnvString(): Promise<string> {
        throw new Error('Env string format not implemented in current API');
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
        // TEMPORARIAMENTE DESABILITADO - heartbeat automático
        // this.heartbeatInterval = setInterval(() => {
        //   this.send({ type: 'heartbeat' });
        // }, 30000); // 30 segundos
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

// === USER VARIABLES INTERFACES - 100% Baseado na especificação OpenAPI oficial ===

export interface UserVariableSchema {
    id: string;
    key: string;
    value: string;
    user_id: string;
    description?: string | null;
    category?: string | null;
    is_secret: boolean;
    is_encrypted: boolean;
    is_active: boolean;
    tenant_id?: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserVariableCreateSchema {
    key: string;  // Pattern: ^[A-Z][A-Z0-9_]*$ (maxLength: 255, minLength: 1)
    value: string; // minLength: 1
    description?: string | null; // maxLength: 1000
    category?: string | null; // maxLength: 100
    is_encrypted?: boolean; // default: false
    // Note: is_secret e is_active não estão no Create schema oficial
}

export interface UserVariableUpdateSchema {
    value?: string;
    is_active?: boolean;
    description?: string | null;
    category?: string | null;
    // Note: key, is_secret e is_encrypted não estão no Update schema conforme OpenAPI spec
}

export interface UserVariableListResponseSchema {
    items: UserVariableSchema[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface UserVariableBulkCreateRequestSchema {
    variables: UserVariableCreateSchema[];
}

export interface UserVariableBulkUpdateRequestSchema {
    variables: Array<{
        id?: string;
        key: string;
        value: string;
        description?: string | null;
        category?: string | null;
        is_encrypted?: boolean;
        // Note: is_secret e is_active não estão no bulk update - são campos do response apenas
    }>;
}

export interface UserVariableBulkDeleteRequestSchema {
    ids: string[];
}

export interface UserVariableImportRequestSchema {
    variables: UserVariableCreateSchema[];
    overwrite_existing?: boolean;
    merge_strategy?: string;
}

export interface UserVariableExportRequestSchema {
    format?: string;
    include_secrets?: boolean;
    categories?: string[];
}

export interface UserVariableValidateRequestSchema {
    key: string;
}

export interface UserVariableValidateResponseSchema {
    is_valid: boolean;
    message?: string;
    suggestions?: string[];
}

// === EXISTING INTERFACES ===

