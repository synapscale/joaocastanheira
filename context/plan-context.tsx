/**
 * Context para planos e permissões
 * Versão funcional usando APENAS APIs oficiais do backend
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { apiService } from '@/lib/api/service'
import { adminService } from '@/lib/api/admin-service'
import type { AdminStats, RealCustomer } from '@/types/admin-types'
import type { Plan, Subscription, BillingInfo, PlanLimits } from '@/types/plan-types'
import { getApiUrl } from '@/lib/config'

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
  
  // Dados reais de admin (via apidof-mcp-server)
  adminStats: AdminStats | null
  realCustomers: RealCustomer[]
  
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
  refreshAdminData: () => Promise<void>
}

// ===== REAL DATA LOADING =====

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
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [usage, setUsage] = useState({
    workspaces_count: 0,
    members_count: 0,
    projects_count: 0,
    storage_used_gb: 0
  })
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [realCustomers, setRealCustomers] = useState<RealCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ===== LOAD REAL DATA =====
  
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true)
        const plansData = await apiService.getPlans()
        setPlans(plansData)
        
        // Set current plan
        const currentPlanId = getCurrentPlanId()
        const current = plansData.find(p => p.id === currentPlanId) || plansData[0]
        setCurrentPlan(current)
      } catch (err) {
        console.error('Error loading plans:', err)
        setError('Failed to load plans')
        // Set fallback default plan to prevent null errors
        setCurrentPlan({
          id: 'free',
          name: 'Free',
          slug: 'free',
          description: 'Free plan',
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
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadPlans()
  }, [])

  // Carregar dados reais dos workspaces
  const loadRealUsage = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 [PlanContext] Loading real usage data from workspaces...')

      // Usar APIs que realmente existem
      const workspaces = await apiService.getWorkspaces()
      
      let totalMembers = 0
      let totalProjects = 0
      
      // Calcular estatísticas reais
      for (const workspace of workspaces) {
        totalMembers += workspace.member_count || 0
        totalProjects += workspace.project_count || 0
      }

      const realUsage = {
        workspaces_count: workspaces.length,
        members_count: totalMembers,
        projects_count: totalProjects,
        storage_used_gb: Math.round(workspaces.reduce((total, ws) => total + (ws.storage_used_mb || 0), 0) / 1024 * 100) / 100
      }

      setUsage(realUsage)
      console.log('✅ [PlanContext] Real usage data loaded:', realUsage)

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
  }, [])

  // Atualizar plano atual baseado no localStorage
  useEffect(() => {
    const planId = getCurrentPlanId()
    const plan = plans.find(p => p.id === planId) || plans[0]
    setCurrentPlan(plan)
  }, [plans])

  // Carregar dados reais apenas quando solicitado manualmente
  // DESABILITADO temporariamente para evitar loops de polling
  // useEffect(() => {
  //   loadRealUsage()
  // }, [])

  // ===== PERMISSION LOGIC =====

  const hasPermission = useCallback((permission: string): boolean => {
    if (!currentPlan) return false

    switch (permission) {
      case 'admin.access':
        // Por enquanto, simular que planos Pro e Enterprise têm acesso admin
        return currentPlan.slug === 'pro' || currentPlan.slug === 'enterprise'
      
      case 'workspace.create':
        return currentPlan.limits?.max_workspaces === -1 || usage.workspaces_count < (currentPlan.limits?.max_workspaces || 0)
      
      case 'members.invite':
        return currentPlan.limits?.max_members_per_workspace === -1 || (currentPlan.limits?.max_members_per_workspace || 0) > 1
      
      case 'members.manage':
        return true // Todos os planos podem gerenciar membros básico
      
      case 'custom_roles.create':
        return currentPlan.limits?.can_create_custom_roles || false
      
      case 'data.export':
        return currentPlan.limits?.can_export_data || false
      
      case 'webhooks.use':
        return currentPlan.limits?.can_use_webhooks || false
      
      case 'integrations.use':
        return currentPlan.limits?.can_use_integrations || false
      
      case 'api.use':
        return currentPlan.limits?.can_use_api || false
      
      case 'sso.use':
        return currentPlan.limits?.can_use_sso || false
      
      default:
        return false
    }
  }, [currentPlan, usage.workspaces_count])

  const hasFeature = useCallback((feature: keyof PlanLimits): boolean => {
    if (!currentPlan?.limits) return false
    const value = currentPlan.limits[feature]
    
    if (typeof value === 'boolean') {
      return value
    }
    
    if (typeof value === 'number') {
      return value > 0 || value === -1 // -1 significa ilimitado
    }
    
    return false
  }, [currentPlan])

  // ===== REAL UPGRADE FUNCTION =====

  const upgradePlan = useCallback(async (planId: string): Promise<void> => {
    try {
      setLoading(true)
      
      const targetPlan = plans.find(p => p.id === planId)
      if (!targetPlan) {
        throw new Error('Plano não encontrado')
      }

      // Call real API endpoint
      const response = await fetch(getApiUrl('/plans/upgrade'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('synapsefrontend_auth_token')}`
        },
        body: JSON.stringify({ planId })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      setCurrentPlan(targetPlan)
      
      console.log(`✅ Upgrade realizado para plano: ${targetPlan.name}`)
      
    } catch (err) {
      console.warn('⚠️ Erro no upgrade:', err)
      setError('Erro ao fazer upgrade do plano')
      throw err
    } finally {
      setLoading(false)
    }
  }, [plans])

  // ===== REAL BILLING DATA =====
  
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  // Função para carregar dados reais de billing
  const loadBillingData = useCallback(async () => {
    try {
      // TODO: Implementar chamadas reais para API de billing quando disponível
      console.log('🔍 [PlanContext] Loading real billing data (API not implemented yet)')
      
      // Por enquanto, deixar null até API estar disponível
      setBillingInfo(null)
      setSubscription(null)
      
    } catch (error) {
      console.error('❌ [PlanContext] Error loading billing data:', error)
      setBillingInfo(null)
      setSubscription(null)
    }
  }, [])

  // ===== ADMIN DATA FUNCTIONS =====

  const refreshAdminData = useCallback(async () => {
    try {
      setLoading(true)
      const [stats, customers] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getRealCustomers()
      ])
      setAdminStats(stats)
      setRealCustomers(customers)
    } catch (err) {
      console.warn('⚠️ Error refreshing admin data:', err)
      setError('Erro ao carregar dados administrativos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar dados admin apenas quando solicitado manualmente
  // REMOVIDO: useEffect automático que estava causando loops
  // Os dados admin agora são carregados apenas quando refreshAdminData() é chamado manualmente

  // ===== CONTEXT VALUE =====

  const contextValue: PlanContextType = useMemo(() => ({
      plans,
      currentPlan,
      usage,
      adminStats,
      realCustomers,
      limits: currentPlan?.limits || {},
      hasPermission,
      hasFeature,
      billingInfo: billingInfo,
      subscription: subscription,
      upgradePlan,
      loading,
      error,
      refreshData: loadRealUsage,
      refreshAdminData
  }), [plans, currentPlan, usage, adminStats, realCustomers, billingInfo, subscription, hasPermission, hasFeature, upgradePlan, loading, error, loadRealUsage, refreshAdminData])

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