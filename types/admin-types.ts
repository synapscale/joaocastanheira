/**
 * Tipos TypeScript para Admin API - Baseados na API Specification descoberta
 * Gerados via apidof-mcp-server para garantir compatibilidade com backend
 */

// ===== ADMIN STATISTICS =====

export interface AdminStats {
  total_users: number
  total_workspaces: number
  total_revenue: number
  active_subscriptions: number
  growth_rate: number
  monthly_revenue: number
  new_users_this_month: number
  churn_rate: number
  avg_revenue_per_user: number
  top_plans: Array<{
    name: string
    count: number
    revenue: number
  }>
  last_updated: string
}

// ===== REVENUE REPORTS =====

export interface RevenueReport {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
  total_revenue: number
  total_transactions: number
  average_transaction_value: number
  revenue_by_plan: Array<{
    plan: string
    revenue: number
    transactions: number
    percentage: number
  }>
  revenue_timeline: Array<{
    date: string
    revenue: number
    transactions: number
  }>
  top_customers: Array<{
    id: string
    name: string
    revenue: number
    plan: string
  }>
  growth_metrics: {
    month_over_month: number
    quarter_over_quarter: number
    year_over_year: number
  }
  refunds: {
    total_amount: number
    total_count: number
    refund_rate: number
  }
  last_updated: string
}

// ===== DOWNLOADS REPORTS =====

export interface DownloadsReport {
  start_date: string
  end_date: string
  total_downloads: number
  unique_downloaders: number
  total_templates: number
  downloads_by_category: Array<{
    category: string
    downloads: number
    percentage: number
  }>
  top_templates: Array<{
    id: string
    name: string
    downloads: number
    rating: number
  }>
  downloads_timeline: Array<{
    date: string
    downloads: number
    unique_users: number
  }>
  user_engagement: {
    average_downloads_per_user: number
    return_users_percentage: number
    conversion_to_paid: number
  }
  popular_search_terms: Array<{
    term: string
    count: number
  }>
  last_updated: string
}

// ===== REAL CUSTOMERS (baseado em workspaces) =====

export interface RealCustomer {
  id: string
  name: string
  email: string
  plan: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  last_active: string
  total_spent: number
  workspace_count: number
  user_count: number
  subscription: {
    plan_name: string
    status: 'active' | 'cancelled' | 'expired'
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
  }
  usage_metrics: {
    workflows_created: number
    executions_this_month: number
    storage_used_mb: number
    api_calls_this_month: number
  }
}

// ===== API RESPONSES =====

export interface AdminStatsResponse {
  data: AdminStats
  success: boolean
  timestamp: string
}

export interface RevenueReportResponse {
  data: RevenueReport
  success: boolean
  timestamp: string
}

export interface DownloadsReportResponse {
  data: DownloadsReport
  success: boolean
  timestamp: string
}

export interface RealCustomersResponse {
  data: RealCustomer[]
  pagination: {
    page: number
    limit: number
    total: number
    has_next: boolean
    has_prev: boolean
  }
  success: boolean
  timestamp: string
}

// ===== ERROR TYPES =====

export interface AdminAPIError {
  error: string
  code?: string
  details?: any
  timestamp: string
}

// ===== REQUEST PARAMETERS =====

export interface RevenueReportParams {
  start_date?: string
  end_date?: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export interface DownloadsReportParams {
  start_date?: string
  end_date?: string
  category?: string
}

export interface CustomersListParams {
  page?: number
  limit?: number
  status?: 'active' | 'inactive' | 'suspended'
  plan?: string
  sort_by?: 'created_at' | 'last_active' | 'total_spent'
  sort_order?: 'asc' | 'desc'
}

// ===== DASHBOARD AGGREGATED DATA =====

export interface AdminDashboardData {
  stats: AdminStats
  revenue_summary: Pick<RevenueReport, 'total_revenue' | 'growth_metrics' | 'revenue_by_plan'>
  downloads_summary: Pick<DownloadsReport, 'total_downloads' | 'downloads_by_category'>
  recent_customers: RealCustomer[]
  alerts: Array<{
    type: 'info' | 'warning' | 'error' | 'success'
    message: string
    timestamp: string
  }>
  last_updated: string
}

// ===== COMPATIBILITY COM TIPOS EXISTENTES =====

// Mapeamento para compatibilidade com plan-types.ts existente
export interface PlanCompatibility {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  customer_count?: number
  revenue?: number
}

// Função helper para converter AdminStats em formato compatível
export function mapAdminStatsToPlans(stats: AdminStats): PlanCompatibility[] {
  return stats.top_plans.map((plan, index) => ({
    id: `plan_${index + 1}`,
    name: plan.name,
    slug: plan.name.toLowerCase().replace(/\s+/g, '-'),
    price: Math.round(plan.revenue / plan.count),
    currency: 'USD',
    interval: 'month' as const,
    features: [], // TODO: mapear features baseado no plano
    popular: index === 0, // Primeiro plano é o mais popular
    customer_count: plan.count,
    revenue: plan.revenue
  }))
} 