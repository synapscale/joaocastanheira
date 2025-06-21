/**
 * Tipos para workspaces baseados na especificação oficial da API Synapscale
 */

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';
export type WorkspaceType = 'individual' | 'team' | 'organization' | 'enterprise';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Schema principal do Workspace baseado na API oficial
export interface WorkspaceResponse {
  id: string;
  name: string;
  description?: string | null;
  avatar_url?: string | null;
  color?: string | null;
  is_public: boolean;
  allow_guest_access: boolean;
  require_approval: boolean;
  max_members?: number | null;
  max_projects?: number | null;
  max_storage_mb?: number | null;
  enable_real_time_editing: boolean;
  enable_comments: boolean;
  enable_chat: boolean;
  enable_video_calls: boolean;
  notification_settings?: any | null;
  slug: string;
  type: WorkspaceType;
  owner_id: string;
  owner_name?: string | null;
  plan_id: string;
  plan_name?: string | null;
  plan_type?: string | null;
  is_template: boolean;
  member_count: number;
  project_count: number;
  activity_count: number;
  storage_used_mb: number;
  status: string;
  last_activity_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Schema para criação de workspace baseado na API oficial
export interface WorkspaceCreate {
  name: string;
  description?: string | null;
  avatar_url?: string | null;
  color?: string | null;
  is_public?: boolean;
  allow_guest_access?: boolean;
  require_approval?: boolean;
  max_members?: number;
  max_projects?: number;
  max_storage_mb?: number;
  enable_real_time_editing?: boolean;
  enable_comments?: boolean;
  enable_chat?: boolean;
  enable_video_calls?: boolean;
  notification_settings?: any | null;
  type?: WorkspaceType;
  plan_id?: string | null;
}

// Schema para atualização de workspace
export interface WorkspaceUpdate {
  name?: string;
  description?: string | null;
  avatar_url?: string | null;
  color?: string | null;
  is_public?: boolean;
  allow_guest_access?: boolean;
  require_approval?: boolean;
  max_members?: number | null;
  max_projects?: number | null;
  max_storage_mb?: number | null;
  enable_real_time_editing?: boolean;
  enable_comments?: boolean;
  enable_chat?: boolean;
  enable_video_calls?: boolean;
  notification_settings?: any | null;
  type?: WorkspaceType;
  plan_id?: string | null;
}

// Schema de membro baseado na API oficial
export interface MemberResponse {
  id: number;
  workspace_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string | null;
  role: WorkspaceRole;
  status: string;
  joined_at: string;
  last_active_at?: string | null;
}

// Schema para convite de membro
export interface MemberInvite {
  email: string;
  role?: WorkspaceRole;
  message?: string;
}

// Estatísticas de workspace
export interface WorkspaceStats {
  member_count: number;
  project_count: number;
  activity_count: number;
  storage_used_mb: number;
  storage_limit_mb?: number;
  storage_usage_percent?: number;
  recent_activity_count?: number;
  active_projects?: number;
  last_activity_at?: string | null;
}

// Schema de convite baseado na API oficial
export interface InvitationResponse {
  id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_description?: string | null;
  workspace_avatar_url?: string | null;
  email: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  invited_by: string;
  invited_by_name: string;
  message?: string | null;
  expires_at: string;
  created_at: string;
}

// Schema de projeto para workspace
export interface ProjectResponse {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  status: 'active' | 'archived' | 'draft';
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

// Schema de atividade para workspace
export interface ActivityResponse {
  id: string;
  workspace_id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  resource_name?: string | null;
  metadata?: any | null;
  created_at: string;
}

// Schema de integração para workspace
export interface IntegrationResponse {
  id: string;
  workspace_id: string;
  type: 'github' | 'slack' | 'discord' | 'teams' | 'aws' | 'gcp' | 'azure' | 'custom';
  name: string;
  description?: string | null;
  config: any;
  status: 'active' | 'inactive' | 'error';
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Configurações de notificação
export interface NotificationSettings {
  email_notifications?: boolean;
  push_notifications?: boolean;
  slack_notifications?: boolean;
  digest_frequency?: 'never' | 'daily' | 'weekly' | 'monthly';
  activity_types?: string[];
}

// Parâmetros de busca de workspaces
export interface WorkspaceSearchParams {
  query?: string | null;
  is_public?: boolean | null;
  has_projects?: boolean | null;
  min_members?: number | null;
  max_members?: number | null;
  sort_by?: 'activity' | 'members' | 'projects' | 'created' | 'name';
  limit?: number;
  offset?: number;
}

// Regras de criação de workspace baseadas no plano
export interface WorkspaceCreationRules {
  can_create: boolean;
  max_workspaces: number | null;
  current_workspaces: number;
  max_members_per_workspace: number | null;
  max_projects_per_workspace: number | null;
  max_storage_per_workspace_mb: number | null;
  features: {
    public_workspaces: boolean;
    guest_access: boolean;
    real_time_editing: boolean;
    video_calls: boolean;
    integrations: boolean;
    custom_branding: boolean;
  };
  plan_name: string;
  plan_type: string;
}

// Operações em lote para membros
export interface BulkMemberOperation {
  operation: 'invite' | 'remove' | 'update_role' | 'deactivate' | 'activate';
  member_ids?: number[];
  emails?: string[];
  role?: WorkspaceRole;
  data?: any;
}

// Operações em lote para projetos
export interface BulkProjectOperation {
  operation: 'archive' | 'unarchive' | 'delete' | 'transfer';
  project_ids: string[];
  data?: any;
}

// Resposta de operação em lote
export interface BulkOperationResponse {
  success_count: number;
  error_count: number;
  total_count: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

// Aliases para compatibilidade com código existente
export type Workspace = WorkspaceResponse;
export type WorkspaceMember = MemberResponse;
export type WorkspaceInvitation = InvitationResponse;
export type WorkspaceProject = ProjectResponse;
export type WorkspaceActivity = ActivityResponse;
export type WorkspaceIntegration = IntegrationResponse; 