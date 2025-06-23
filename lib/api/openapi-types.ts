/**
 * Tipos TypeScript gerados baseados na especificação OpenAPI do Synapscale
 * Garante compatibilidade total com o backend
 */

// === AUTENTICAÇÃO ===
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
  user: User;
}

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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

// === USER VARIABLES ===
export interface UserVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserVariableCreate {
  key: string;
  value: string;
  description?: string;
  is_encrypted?: boolean;
}

export interface UserVariableUpdate {
  value?: string;
  description?: string;
  is_encrypted?: boolean;
}

export interface UserVariableBulkCreate {
  variables: UserVariableCreate[];
}

export interface UserVariableStats {
  total: number;
  encrypted: number;
  api_keys: number;
  regular: number;
}

// === WORKFLOWS ===
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
  status: WorkflowStatus;
  definition: any;
  thumbnail_url?: string;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  updated_at: string;
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface WorkflowCreate {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  definition: any;
}

// === EXECUTIONS ===
export interface Execution {
  id: string;
  workflow_id: string;
  user_id: string;
  status: ExecutionStatus;
  inputs?: any;
  outputs?: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  execution_time_seconds?: number;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface ExecutionStats {
  total: number;
  completed: number;
  failed: number;
  average_time_seconds: number;
}

// === AGENTS ===
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
  status: AgentStatus;
  avatar_url?: string;
  conversation_count: number;
  message_count: number;
  rating_average: number;
  rating_count: number;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
}

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

// === CONVERSATIONS ===
export interface Conversation {
  id: string;
  user_id: string;
  agent_id?: string;
  workspace_id?: string;
  title?: string;
  status: ConversationStatus;
  message_count: number;
  total_tokens_used: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  attachments: any[];
  model_used?: string;
  tokens_used: number;
  processing_time_ms: number;
  created_at: string;
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

// === WORKSPACES ===
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  type: WorkspaceType;
  owner_id: string;
  is_active: boolean;
  member_count: number;
  project_count: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  created_at: string;
  updated_at: string;
}

export enum WorkspaceType {
  PERSONAL = 'personal',
  TEAM = 'team',
  ENTERPRISE = 'enterprise'
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  workspace_id: string;
  role: WorkspaceRole;
  joined_at: string;
  user: User;
}

export enum WorkspaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

// === TEMPLATES ===
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  license_type: LicenseType;
  rating_average: number;
  rating_count: number;
  downloads_count: number;
  author_id: string;
  is_featured: boolean;
  is_verified: boolean;
  workflow_definition: any;
  created_at: string;
  updated_at: string;
}

export enum LicenseType {
  FREE = 'free',
  PAID = 'paid',
  PREMIUM = 'premium'
}

// === MARKETPLACE ===
export interface MarketplaceComponent {
  id: string;
  name: string;
  description: string;
  type: ComponentType;
  category: string;
  tags: string[];
  price: number;
  rating_average: number;
  rating_count: number;
  downloads_count: number;
  author_id: string;
  status: ComponentStatus;
  created_at: string;
  updated_at: string;
}

export enum ComponentType {
  NODE = 'node',
  TEMPLATE = 'template',
  AGENT = 'agent'
}

export enum ComponentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

// === ANALYTICS ===
export interface AnalyticsOverview {
  total_users: number;
  total_workflows: number;
  total_executions: number;
  total_agents: number;
  active_users_today: number;
  executions_today: number;
  revenue_this_month: number;
}

export interface UserBehaviorMetrics {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  average_session_duration: number;
  bounce_rate: number;
  retention_rate: number;
}

// === GENERIC RESPONSES ===
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// === HEALTH CHECK ===
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
    redis: boolean;
    external_apis: boolean;
  };
} 