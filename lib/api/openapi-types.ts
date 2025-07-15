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
  workspace_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input_data: any;
  output_data?: any;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
  execution_time_ms?: number;
  steps_completed: number;
  total_steps: number;
  current_step?: string;
  logs?: ExecutionLog[];
  metadata?: any;
}

export interface ExecutionCreate {
  workflow_id: string;
  input_data: any;
  workspace_id?: string;
  metadata?: any;
}

export interface ExecutionLog {
  id: string;
  execution_id: string;
  step_id?: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  metadata?: any;
}

export interface ExecutionStats {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_execution_time_ms: number;
  executions_by_status: Record<string, number>;
  executions_by_workflow: Record<string, number>;
  recent_executions: Execution[];
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

// === WORKFLOW TEMPLATES ===
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  is_public: boolean;
  is_featured: boolean;
  author_id: string;
  author_name?: string;
  template_data: any;
  preview_image?: string;
  documentation?: string;
  install_count: number;
  rating_average: number;
  rating_count: number;
  created_at?: string;
  updated_at?: string;
  version: string;
  compatibility?: string[];
}

export interface WorkflowTemplateCreate {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  template_data: any;
  preview_image?: string;
  documentation?: string;
  version?: string;
  compatibility?: string[];
}

export interface WorkflowTemplateUpdate {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  template_data?: any;
  preview_image?: string;
  documentation?: string;
  version?: string;
  compatibility?: string[];
}

export interface TemplateInstallation {
  template_id: string;
  workspace_id?: string;
  configuration?: any;
}

export interface TemplateRating {
  rating: number;
  review?: string;
}

// === MARKETPLACE ===
export interface MarketplaceComponent {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: 'workflow' | 'node' | 'agent' | 'template';
  tags?: string[];
  is_featured: boolean;
  is_free: boolean;
  price?: number;
  currency?: string;
  author_id: string;
  author_name?: string;
  preview_image?: string;
  screenshots?: string[];
  documentation?: string;
  download_count: number;
  purchase_count: number;
  rating_average: number;
  rating_count: number;
  version: string;
  compatibility?: string[];
  requirements?: string[];
  created_at?: string;
  updated_at?: string;
  last_updated?: string;
}

export interface MarketplaceFilters {
  category?: string;
  type?: string;
  tags?: string[];
  is_free?: boolean;
  min_rating?: number;
  search?: string;
  sort_by?: 'name' | 'rating' | 'downloads' | 'recent' | 'featured';
  sort_order?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface MarketplacePurchase {
  component_id: string;
  payment_method?: string;
  workspace_id?: string;
}

export interface MarketplaceReview {
  id: string;
  component_id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  review?: string;
  is_helpful_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface MarketplaceReviewCreate {
  rating: number;
  review?: string;
}

export interface MarketplaceFavorite {
  component_id: string;
}

// === ANALYTICS ===
export interface AnalyticsOverview {
  total_users: number;
  total_workspaces: number;
  total_workflows: number;
  total_executions: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  executions_today: number;
  executions_week: number;
  executions_month: number;
  success_rate: number;
  average_execution_time: number;
}

export interface AnalyticsDashboard {
  overview: AnalyticsOverview;
  usage_trends: UsageTrend[];
  popular_workflows: PopularWorkflow[];
  performance_metrics: PerformanceMetric[];
  user_activity: UserActivity[];
}

export interface UsageTrend {
  date: string;
  users: number;
  executions: number;
  workflows_created: number;
}

export interface PopularWorkflow {
  workflow_id: string;
  workflow_name: string;
  execution_count: number;
  success_rate: number;
  average_execution_time: number;
}

export interface PerformanceMetric {
  metric_name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
}

export interface UserActivity {
  user_id: string;
  user_name?: string;
  last_active: string;
  executions_count: number;
  workflows_created: number;
  total_execution_time: number;
}

export interface AnalyticsReport {
  report_type: 'usage' | 'performance' | 'custom';
  start_date: string;
  end_date: string;
  data: any;
  generated_at: string;
}

export interface AnalyticsInsight {
  insight_type: string;
  title: string;
  description: string;
  recommendation?: string;
  impact: 'high' | 'medium' | 'low';
  data: any;
  generated_at: string;
}

export interface UserBehaviorMetrics {
  date_range: {
    start_date: string;
    end_date: string;
  };
  granularity: 'hour' | 'day' | 'week' | 'month';
  metrics: {
    sessions: number;
    page_views: number;
    unique_users: number;
    bounce_rate: number;
    average_session_duration: number;
    most_visited_pages: Array<{
      path: string;
      views: number;
    }>;
    user_flows: Array<{
      from: string;
      to: string;
      count: number;
    }>;
  }[];
}

// === LLM PROVIDER TYPES ===
export interface LLMProvider {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  is_available: boolean;
  supported_models: string[];
  pricing?: {
    input_price_per_token: number;
    output_price_per_token: number;
    currency: string;
  };
  features: string[];
  rate_limits?: {
    requests_per_minute: number;
    tokens_per_minute: number;
  };
}

export interface LLMModel {
  id: string;
  provider_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  context_length: number;
  max_output_tokens: number;
  supports_streaming: boolean;
  supports_functions: boolean;
  pricing?: {
    input_price_per_token: number;
    output_price_per_token: number;
    currency: string;
  };
}

export interface LLMGeneration {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface LLMGenerationResponse {
  id: string;
  content: string;
  model_used: string;
  tokens_used: {
    input: number;
    output: number;
    total: number;
  };
  processing_time_ms: number;
  finish_reason: 'stop' | 'length' | 'content_filter' | 'function_call';
  created_at: string;
}

export interface TokenCount {
  text: string;
  model?: string;
}

export interface TokenCountResponse {
  token_count: number;
  model_used: string;
}

// === FILES EXTENDED TYPES ===
export interface FileUpload {
  file: File;
  metadata?: {
    description?: string;
    tags?: string[];
    workspace_id?: string;
    is_public?: boolean;
  };
}

export interface FileInfo {
  id: string;
  filename: string;
  original_filename: string;
  content_type: string;
  size: number;
  url: string;
  download_url: string;
  is_public: boolean;
  user_id: string;
  workspace_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface FileUpdate {
  filename?: string;
  metadata?: any;
  is_public?: boolean;
}

export interface FileBulkUpload {
  files: FileUpload[];
  workspace_id?: string;
}

export interface FileBulkDelete {
  file_ids: string[];
}

// === WEBSOCKET EXTENDED TYPES ===
export interface WebSocketStatus {
  is_connected: boolean;
  connection_count: number;
  active_sessions: string[];
  server_time: string;
}

export interface WebSocketStats {
  total_connections: number;
  active_connections: number;
  messages_sent: number;
  messages_received: number;
  connection_duration_avg: number;
  peak_connections: number;
  error_count: number;
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

// === CODE TEMPLATES ===
export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  language: "javascript" | "typescript" | "python" | "all";
  tags: string[];
  code: string;
  user_id: string;
  workspace_id?: string;
  is_public: boolean;
  usage_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface CodeTemplateCreate {
  name: string;
  description: string;
  category: string;
  language: "javascript" | "typescript" | "python" | "all";
  tags: string[];
  code: string;
  is_public?: boolean;
}

export interface CodeTemplateUpdate {
  name?: string;
  description?: string;
  category?: string;
  language?: "javascript" | "typescript" | "python" | "all";
  tags?: string[];
  code?: string;
  is_public?: boolean;
}

export interface CodeTemplateFilters {
  category?: string;
  language?: string;
  tags?: string[];
  is_public?: boolean;
  search?: string;
  user_id?: string;
  workspace_id?: string;
}

export interface CodeTemplateBulkImport {
  templates: CodeTemplateCreate[];
  overwrite_existing?: boolean;
}

// === LLM SERVICE EXTENDED TYPES ===
export interface LLMService {
  id: string
  user_id: string
  workspace_id?: string
  name: string
  description?: string
  provider: string
  model: string
  api_key: string
  endpoint_url?: string
  max_tokens?: number
  temperature?: number
  timeout_seconds?: number
  rate_limit_requests_per_minute?: number
  is_active: boolean
  config: any
  created_at?: string
  updated_at?: string
  last_used_at?: string
  total_requests: number
  total_tokens_used: number
  total_cost: number
  error_count: number
}

export interface LLMServiceCreate {
  name: string
  description?: string
  provider: string
  model: string
  api_key: string
  endpoint_url?: string
  max_tokens?: number
  temperature?: number
  timeout_seconds?: number
  rate_limit_requests_per_minute?: number
  is_active?: boolean
  config?: any
  workspace_id?: string
}

export interface LLMServiceUpdate {
  name?: string
  description?: string
  api_key?: string
  endpoint_url?: string
  max_tokens?: number
  temperature?: number
  timeout_seconds?: number
  rate_limit_requests_per_minute?: number
  is_active?: boolean
  config?: any
}

export interface LLMServiceFilters {
  provider?: string
  model?: string
  is_active?: boolean
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  size?: number
  workspace_id?: string
}

export interface LLMUsage {
  service_id: string
  total_requests: number
  successful_requests: number
  failed_requests: number
  total_tokens_used: number
  input_tokens: number
  output_tokens: number
  total_cost: number
  average_response_time: number
  error_rate: number
  usage_by_date: Array<{
    date: string
    requests: number
    tokens: number
    cost: number
  }>
}

export interface LLMCompletion {
  id: string
  service_id: string
  model: string
  prompt: string
  completion: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost: number
  response_time_ms: number
  created_at: string
  metadata?: any
}

export interface LLMCompletionRequest {
  prompt: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string[]
  stream?: boolean
  metadata?: any
}

// === ANALYTICS EXTENDED TYPES ===
export interface AnalyticsEvent {
  id: string
  user_id?: string
  workspace_id?: string
  event_type: string
  timestamp: string
  properties: any
  session_id?: string
  device_info?: any
  location?: any
}

export interface AnalyticsEventCreate {
  event_type: string
  properties?: any
  session_id?: string
  device_info?: any
}

export interface AnalyticsMetrics {
  total_events: number
  unique_users: number
  events_by_type: Record<string, number>
  user_activity: Array<{
    date: string
    active_users: number
    total_events: number
  }>
}

export interface AnalyticsFilters {
  event_type?: string[]
  start_date?: string
  end_date?: string
  user_id?: string
  workspace_id?: string
  properties?: Record<string, any>
}

// === WORKFLOW TEMPLATE EXTENDED TYPES ===
export interface WorkflowTemplateFilters {
  category?: string
  tags?: string[]
  is_public?: boolean
  min_rating?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  size?: number
  author_id?: string
  workspace_id?: string
  difficulty?: string
} 