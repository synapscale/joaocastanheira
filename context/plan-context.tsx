/**
 * Context para planos e permissões
 * Versão funcional usando APENAS APIs oficiais do backend
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from '@/lib/api/service'
import type { Plan, Subscription, BillingInfo, PlanLimits } from '@/types/plan-types'

// ===== INTERFACES =====

interface PlanContextType {
  // Plans básicos (mockados até API existir)
  plans: Plan[]
  currentPlan: Plan
  
  // Usage real baseado em workspaces existentes
  usage: {
    workspaces_count: number
    members_count: number
    projects_count: number
    storage_used_gb: number
  }
  
  // Limits baseados no plano atual
  limits: PlanLimits
  
  // Permissions baseadas no plano
  hasPermission: (permission: string) => boolean
  hasFeature: (feature: keyof PlanLimits) => boolean
  
  // Billing (mockado)
  billingInfo: BillingInfo | null
  subscription: Subscription | null
  upgradePlan: (planId: string) => Promise<void>
  
  // Loading states
  loading: boolean
  error: string | null
  
  // Actions
  refreshData: () => Promise<void>
}

// ===== MOCK DATA ORGANIZADO =====

const mockPlans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    slug: 'free',
    description: 'Plano gratuito para começar',
    price: 0,
    currency: 'USD',
    billing_cycle: 'monthly',
    is_active: true,
    is_featured: false,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    features: [],
    limits: {
      max_workspaces: 1,
      max_members_per_workspace: 3,
      max_projects_per_workspace: 5,
      max_storage_gb: 1,
      max_api_requests_per_month: 1000,
      max_executions_per_month: 100,
      max_file_upload_size_mb: 10,
      can_create_custom_roles: false,
      can_use_api: true,
      can_export_data: false,
      can_use_webhooks: false,
      can_use_integrations: false,
      can_use_sso: false,
      has_priority_support: false
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    description: 'Plano profissional com recursos avançados',
    price: 29,
    currency: 'USD',
    billing_cycle: 'monthly',
    is_active: true,
    is_featured: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    features: [],
    limits: {
      max_workspaces: 5,
      max_members_per_workspace: 25,
      max_projects_per_workspace: 50,
      max_storage_gb: 50,
      max_api_requests_per_month: 10000,
      max_executions_per_month: 1000,
      max_file_upload_size_mb: 100,
      can_create_custom_roles: true,
      can_use_api: true,
      can_export_data: true,
      can_use_webhooks: true,
      can_use_integrations: true,
      can_use_sso: false,
      has_priority_support: true
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Plano enterprise com recursos ilimitados',
    price: 99,
    currency: 'USD',
    billing_cycle: 'monthly',
    is_active: true,
    is_featured: false,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    features: [],
    limits: {
      max_workspaces: -1, // ilimitado
      max_members_per_workspace: -1,
      max_projects_per_workspace: -1,
      max_storage_gb: -1,
      max_api_requests_per_month: -1,
      max_executions_per_month: -1,
      max_file_upload_size_mb: 1000,
      can_create_custom_roles: true,
      can_use_api: true,
      can_export_data: true,
      can_use_webhooks: true,
      can_use_integrations: true,
      can_use_sso: true,
      has_priority_support: true
    }
  }
]

// Simular plano atual (pode ser alterado via localStorage)
const getCurrentPlanId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('synapscale_current_plan') || 'free'
  }
  return 'free'
}

// ===== CONTEXT =====

const PlanContext = createContext<PlanContextType | undefined>(undefined)

// ===== PROVIDER =====

interface PlanProviderProps {
  children: React.ReactNode
}

export function PlanProvider({ children }: PlanProviderProps) {
  const [plans] = useState<Plan[]>(mockPlans)
  const [currentPlan, setCurrentPlan] = useState<Plan>(mockPlans[0])
  const [usage, setUsage] = useState({
    workspaces_count: 0,
    members_count: 0,
    projects_count: 0,
    storage_used_gb: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados reais dos workspaces
  const loadRealUsage = async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar APIs que realmente existem
      const workspaces = await apiService.getWorkspaces()
      
      let totalMembers = 0
      let totalProjects = 0
      
      // Calcular estatísticas reais
      for (const workspace of workspaces) {
        totalMembers += workspace.member_count || 0
        totalProjects += workspace.project_count || 0
      }

      setUsage({
        workspaces_count: workspaces.length,
        members_count: totalMembers,
        projects_count: totalProjects,
        storage_used_gb: workspaces.reduce((total, ws) => total + (ws.storage_used_mb || 0), 0) / 1024
      })

    } catch (err) {
      console.warn('⚠️ Erro ao carregar estatísticas:', err)
      setError('Erro ao carregar dados de uso')
      // Fallback para dados vazios em caso de erro
      setUsage({
        workspaces_count: 0,
        members_count: 0,
        projects_count: 0,
        storage_used_gb: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Atualizar plano atual baseado no localStorage
  useEffect(() => {
    const planId = getCurrentPlanId()
    const plan = plans.find(p => p.id === planId) || plans[0]
    setCurrentPlan(plan)
  }, [plans])

  // Carregar dados reais na inicialização
  useEffect(() => {
    loadRealUsage()
  }, [])

  // ===== PERMISSION LOGIC =====

  const hasPermission = (permission: string): boolean => {
    if (!currentPlan) return false

    switch (permission) {
      case 'workspace.create':
        return currentPlan.limits.max_workspaces === -1 || usage.workspaces_count < currentPlan.limits.max_workspaces
      
      case 'members.invite':
        return currentPlan.limits.max_members_per_workspace === -1 || currentPlan.limits.max_members_per_workspace > 1
      
      case 'members.manage':
        return true // Todos os planos podem gerenciar membros básico
      
      case 'custom_roles.create':
        return currentPlan.limits.can_create_custom_roles
      
      case 'data.export':
        return currentPlan.limits.can_export_data
      
      case 'webhooks.use':
        return currentPlan.limits.can_use_webhooks
      
      case 'integrations.use':
        return currentPlan.limits.can_use_integrations
      
      case 'api.use':
        return currentPlan.limits.can_use_api
      
      case 'sso.use':
        return currentPlan.limits.can_use_sso
      
      default:
        return false
    }
  }

  const hasFeature = (feature: keyof PlanLimits): boolean => {
    if (!currentPlan) return false
    const value = currentPlan.limits[feature]
    
    if (typeof value === 'boolean') {
      return value
    }
    
    if (typeof value === 'number') {
      return value > 0 || value === -1 // -1 significa ilimitado
    }
    
    return false
  }

  // ===== MOCK UPGRADE FUNCTION =====

  const upgradePlan = async (planId: string): Promise<void> => {
    try {
      setLoading(true)
      
      // Simular upgrade (salvar no localStorage)
      const targetPlan = plans.find(p => p.id === planId)
      if (!targetPlan) {
        throw new Error('Plano não encontrado')
      }

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (typeof window !== 'undefined') {
        localStorage.setItem('synapscale_current_plan', planId)
      }
      
      setCurrentPlan(targetPlan)
      
      console.log(`✅ Upgrade simulado para plano: ${targetPlan.name}`)
      
      // Mostrar feedback visual para o usuário
      if (typeof window !== 'undefined') {
        const message = `🎉 Upgrade realizado com sucesso!\n\nNovo plano: ${targetPlan.name}\nPreço: $${targetPlan.price}/mês\n\nRecursos desbloqueados:\n${targetPlan.limits.can_create_custom_roles ? '✅ Roles customizadas\n' : ''}${targetPlan.limits.can_export_data ? '✅ Exportar dados\n' : ''}${targetPlan.limits.can_use_webhooks ? '✅ Webhooks\n' : ''}${targetPlan.limits.can_use_integrations ? '✅ Integrações\n' : ''}${targetPlan.limits.can_use_sso ? '✅ SSO\n' : ''}`
        
        setTimeout(() => alert(message), 100)
      }
      
    } catch (err) {
      console.warn('⚠️ Erro no upgrade:', err)
      setError('Erro ao fazer upgrade do plano')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ===== MOCK BILLING INFO =====

  const mockSubscription: Subscription = {
    id: 'sub_123',
    user_id: 'user_123',
    plan_id: currentPlan.id,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plan: currentPlan
  }

  const mockBillingInfo: BillingInfo = {
    subscription: mockSubscription,
    usage_stats: {
      workspace_id: '',
      period_start: new Date().toISOString(),
      period_end: new Date().toISOString(),
      members_count: usage.members_count,
      projects_count: usage.projects_count,
      storage_used_gb: usage.storage_used_gb,
      api_requests_count: 150,
      executions_count: 25,
      file_uploads_count: 10,
      created_at: new Date().toISOString()
    },
    limits: currentPlan.limits,
    usage_percentage: {
      workspaces: currentPlan.limits.max_workspaces === -1 ? 0 : (usage.workspaces_count / currentPlan.limits.max_workspaces) * 100,
      members: currentPlan.limits.max_members_per_workspace === -1 ? 0 : (usage.members_count / currentPlan.limits.max_members_per_workspace) * 100,
      storage: currentPlan.limits.max_storage_gb === -1 ? 0 : (usage.storage_used_gb / currentPlan.limits.max_storage_gb) * 100,
      api_requests: currentPlan.limits.max_api_requests_per_month === -1 ? 0 : (150 / currentPlan.limits.max_api_requests_per_month) * 100,
      executions: currentPlan.limits.max_executions_per_month === -1 ? 0 : (25 / currentPlan.limits.max_executions_per_month) * 100
    },
    is_over_limit: false,
    next_billing_date: mockSubscription.current_period_end,
    amount_due: currentPlan.price
  }

  // ===== CONTEXT VALUE =====

  const contextValue: PlanContextType = {
    plans,
    currentPlan,
    usage,
    limits: currentPlan.limits,
    hasPermission,
    hasFeature,
    billingInfo: mockBillingInfo,
    subscription: mockSubscription,
    upgradePlan,
    loading,
    error,
    refreshData: loadRealUsage
  }

  return (
    <PlanContext.Provider value={contextValue}>
      {children}
    </PlanContext.Provider>
  )
}

// ===== HOOKS =====

export function usePlan(): PlanContextType {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider')
  }
  return context
}

export function usePermissions() {
  const { hasPermission, hasFeature } = usePlan()
  return { hasPermission, hasFeature }
}

export function useBilling() {
  const { billingInfo, subscription, usage, limits, upgradePlan, loading, error } = usePlan()
  return { billingInfo, subscription, usage, limits, upgradePlan, loading, error }
} 