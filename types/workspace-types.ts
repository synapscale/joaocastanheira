/**
 * Tipos para workspaces baseados na especificação da API
 */

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  avatar_url?: string | null;
  color?: string | null;
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
  notification_settings?: any | null;
  slug: string;
  owner_id: string;
  owner_name: string;
  member_count: number;
  project_count: number;
  activity_count: number;
  storage_used_mb: number;
  status: string;
  last_activity_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceCreate {
  name: string;
  description?: string;
  avatar_url?: string;
  color?: string;
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
  notification_settings?: any;
}

export interface WorkspaceUpdate {
  name?: string;
  description?: string;
  avatar_url?: string;
  color?: string;
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
  notification_settings?: any;
}

export interface WorkspaceMember {
  id: number;
  workspace_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  role: WorkspaceRole;
  status: string;
  joined_at: string;
  last_active_at?: string;
}

export interface MemberInvite {
  email: string;
  role?: WorkspaceRole;
  message?: string;
}

export interface WorkspaceStats {
  member_count: number;
  project_count: number;
  activity_count: number;
  storage_used_mb: number;
  storage_limit_mb: number;
  storage_usage_percent: number;
  recent_activity_count: number;
  active_projects: number;
}

// Invitation types
export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  workspace_name: string;
  email: string;
  role: WorkspaceRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invited_by: string;
  invited_by_name: string;
  message?: string;
  expires_at: string;
  created_at: string;
}

// Project types for workspace context
export interface WorkspaceProject {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'draft';
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

// Activity types for workspace
export interface WorkspaceActivity {
  id: string;
  workspace_id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  metadata?: any;
  created_at: string;
}

// Integration types
export interface WorkspaceIntegration {
  id: string;
  workspace_id: string;
  type: 'github' | 'slack' | 'discord' | 'teams' | 'aws' | 'gcp' | 'azure' | 'custom';
  name: string;
  description?: string;
  config: any;
  status: 'active' | 'inactive' | 'error';
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Notification settings
export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  slack_notifications: boolean;
  digest_frequency: 'never' | 'daily' | 'weekly' | 'monthly';
  activity_types: string[];
} 