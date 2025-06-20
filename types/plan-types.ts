/**
 * Tipos para sistema de planos e assinaturas
 * Hierarquia: SaaS Admins → Plans → Customers → Workspaces → Members
 */

// ===== PLANOS E FEATURES =====

export interface Plan {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  billing_cycle: 'monthly' | 'yearly'
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  features: PlanFeature[]
  limits: PlanLimits
}

export interface PlanFeature {
  id: string
  plan_id: string
  feature_key: string
  feature_name: string
  feature_description: string
  is_enabled: boolean
  feature_type: 'boolean' | 'numeric' | 'text'
  feature_value?: string | number | boolean
}

export interface PlanLimits {
  max_workspaces: number // -1 = ilimitado
  max_members_per_workspace: number // -1 = ilimitado
  max_projects_per_workspace: number // -1 = ilimitado
  max_storage_gb: number // -1 = ilimitado
  max_api_requests_per_month: number // -1 = ilimitado
  max_executions_per_month: number // -1 = ilimitado
  max_file_upload_size_mb: number
  can_create_custom_roles: boolean
  can_use_api: boolean
  can_export_data: boolean
  can_use_webhooks: boolean
  can_use_integrations: boolean
  can_use_sso: boolean
  has_priority_support: boolean
}

// ===== ASSINATURAS =====

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  canceled_at?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  created_at: string
  updated_at: string
  plan: Plan
}

// ===== WORKSPACE ROLES E PERMISSIONS =====

export interface WorkspaceRole {
  id: string
  workspace_id: string
  name: string
  slug: string
  description: string
  is_system_role: boolean // owner, admin, member são system roles
  permissions: Permission[]
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  key: string
  name: string
  description: string
  category: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMemberWithRole {
  id: string
  workspace_id: string
  user_id: string
  role_id: string
  invited_by: string
  joined_at: string
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  role: WorkspaceRole
}

// ===== WORKSPACE ATUALIZADO =====

export interface WorkspaceDetailed {
  id: string
  name: string
  description: string
  slug: string
  is_public: boolean
  owner_id: string
  subscription_id: string
  settings: WorkspaceSettings
  member_count: number
  project_count: number
  storage_used_gb: number
  current_user_role: 'owner' | 'admin' | 'member' | 'guest'
  created_at: string
  updated_at: string
  owner: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  subscription: Subscription
}

export interface WorkspaceSettings {
  allow_public_projects: boolean
  require_approval_for_members: boolean
  default_member_role: string
  enable_notifications: boolean
  enable_integrations: boolean
  timezone: string
  language: string
}

// ===== USAGE E BILLING =====

export interface UsageStats {
  workspace_id: string
  period_start: string
  period_end: string
  members_count: number
  projects_count: number
  storage_used_gb: number
  api_requests_count: number
  executions_count: number
  file_uploads_count: number
  created_at: string
}

export interface BillingInfo {
  subscription: Subscription
  usage_stats: UsageStats
  limits: PlanLimits
  usage_percentage: {
    workspaces: number
    members: number
    storage: number
    api_requests: number
    executions: number
  }
  is_over_limit: boolean
  next_billing_date: string
  amount_due: number
}

// ===== PLAN COMPARISON =====

export interface PlanComparison {
  plans: Plan[]
  features: {
    category: string
    items: {
      key: string
      name: string
      description: string
      plans: Record<string, boolean | string | number>
    }[]
  }[]
}

// ===== ADMIN SAAS TYPES =====

export interface SaasAdmin {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'support'
  permissions: string[]
  last_login: string
  created_at: string
}

export interface CustomerOverview {
  id: string
  email: string
  name: string
  subscription: Subscription
  workspaces_count: number
  total_members: number
  total_storage_gb: number
  last_activity: string
  lifetime_value: number
  created_at: string
}

// ===== FEATURE FLAGS =====

export interface FeatureFlag {
  key: string
  name: string
  description: string
  is_enabled: boolean
  target_plans?: string[]
  target_users?: string[]
  rollout_percentage: number
  created_at: string
  updated_at: string
}

// ===== SYSTEM PERMISSIONS =====

export const SYSTEM_PERMISSIONS = {
  // Workspace Management
  'workspace.create': 'Criar workspaces',
  'workspace.edit': 'Editar workspace',
  'workspace.delete': 'Deletar workspace',
  'workspace.view_settings': 'Ver configurações do workspace',
  'workspace.manage_settings': 'Gerenciar configurações do workspace',
  
  // Member Management
  'members.invite': 'Convidar membros',
  'members.remove': 'Remover membros',
  'members.edit_roles': 'Editar funções dos membros',
  'members.view': 'Ver lista de membros',
  
  // Project Management
  'projects.create': 'Criar projetos',
  'projects.edit': 'Editar projetos',
  'projects.delete': 'Deletar projetos',
  'projects.view': 'Ver projetos',
  'projects.execute': 'Executar projetos',
  
  // Data Management
  'data.export': 'Exportar dados',
  'data.import': 'Importar dados',
  'data.backup': 'Fazer backup',
  
  // Integration Management
  'integrations.create': 'Criar integrações',
  'integrations.edit': 'Editar integrações',
  'integrations.delete': 'Deletar integrações',
  'integrations.view': 'Ver integrações',
  
  // API Access
  'api.read': 'Acesso de leitura à API',
  'api.write': 'Acesso de escrita à API',
  'api.admin': 'Acesso administrativo à API',
  
  // Billing
  'billing.view': 'Ver informações de cobrança',
  'billing.manage': 'Gerenciar cobrança',
  
  // Analytics
  'analytics.view': 'Ver analytics',
  'analytics.export': 'Exportar analytics',
} as const

export type SystemPermissionKey = keyof typeof SYSTEM_PERMISSIONS

// ===== DEFAULT ROLES =====

export const DEFAULT_WORKSPACE_ROLES = {
  owner: {
    name: 'Owner',
    slug: 'owner',
    description: 'Proprietário do workspace com acesso total',
    permissions: Object.keys(SYSTEM_PERMISSIONS) as SystemPermissionKey[]
  },
  admin: {
    name: 'Administrator',
    slug: 'admin',
    description: 'Administrador com quase todas as permissões',
    permissions: [
      'workspace.view_settings', 'workspace.manage_settings',
      'members.invite', 'members.remove', 'members.edit_roles', 'members.view',
      'projects.create', 'projects.edit', 'projects.delete', 'projects.view', 'projects.execute',
      'data.export', 'data.import',
      'integrations.create', 'integrations.edit', 'integrations.delete', 'integrations.view',
      'api.read', 'api.write',
      'analytics.view', 'analytics.export'
    ] as SystemPermissionKey[]
  },
  member: {
    name: 'Member',
    slug: 'member',
    description: 'Membro padrão com permissões básicas',
    permissions: [
      'projects.create', 'projects.edit', 'projects.view', 'projects.execute',
      'members.view',
      'api.read',
      'analytics.view'
    ] as SystemPermissionKey[]
  },
  guest: {
    name: 'Guest',
    slug: 'guest',
    description: 'Convidado com acesso somente leitura',
    permissions: [
      'projects.view',
      'members.view',
      'analytics.view'
    ] as SystemPermissionKey[]
  }
} as const

export type DefaultRoleKey = keyof typeof DEFAULT_WORKSPACE_ROLES 