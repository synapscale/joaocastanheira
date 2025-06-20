/**
 * Context básico para planos e permissões
 * Versão simplificada sem dependências de APIs inexistentes
 */

'use client'

import React, { createContext, useContext } from 'react'

// ===== TYPES =====

interface Plan {
  id: string
  name: string
  description: string
  price: number
  limits: {
    max_workspaces: number
    max_members_per_workspace: number
    max_storage_gb: number
  }
}

interface PlanContextType {
  // Plans básicos
  plans: Plan[]
  currentPlan: Plan
  
  // Usage mock
  usage: {
    workspaces_count: number
    members_count: number
    projects_count: number
    storage_used_gb: number
  }
  
  // Limits
  limits: {
    max_workspaces: number
    max_members_per_workspace: number
    max_storage_gb: number
  }
  
  // Permissions básicas
  hasPermission: (permission: string) => boolean
  
  // Billing mock
  billingInfo: any
  subscription: any
  upgradePlan: (planId: string) => Promise<void>
}

// ===== MOCK DATA =====

const mockPlans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Plano gratuito para começar',
    price: 0,
    limits: {
      max_workspaces: 1,
      max_members_per_workspace: 3,
      max_storage_gb: 1
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Plano profissional',
    price: 29,
    limits: {
      max_workspaces: 5,
      max_members_per_workspace: 50,
      max_storage_gb: 100
    }
  }
]

const mockCurrentPlan = mockPlans[0] // Free plan por padrão

const mockUsage = {
  workspaces_count: 1,
  members_count: 1,
  projects_count: 1,
  storage_used_gb: 0.1
}

// ===== CONTEXT =====

const PlanContext = createContext<PlanContextType | undefined>(undefined)

// ===== PROVIDER =====

interface PlanProviderProps {
  children: React.ReactNode
}

export function PlanProvider({ children }: PlanProviderProps) {
  const hasPermission = (permission: string): boolean => {
    // Permissões básicas para todos os usuários
    return true
  }
  
  const upgradePlan = async (planId: string): Promise<void> => {
    console.log('Mock upgrade to plan:', planId)
  }

  const contextValue: PlanContextType = {
    plans: mockPlans,
    currentPlan: mockCurrentPlan,
    usage: mockUsage,
    limits: mockCurrentPlan.limits,
    hasPermission,
    billingInfo: null,
    subscription: null,
    upgradePlan
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
  const { hasPermission } = usePlan()
  return { hasPermission }
}

export function useBilling() {
  const { billingInfo, subscription, usage, limits, upgradePlan } = usePlan()
  return { billingInfo, subscription, usage, limits, upgradePlan }
} 