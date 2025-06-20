"use client"

import { useCallback } from 'react'
import { usePlan } from '@/context/plan-context'
import { useWorkspace } from '@/context/workspace-context'
import { useWorkspaceLimitModal } from '@/components/ui/workspace-limit-modal'
import { useToast } from '@/components/ui/use-toast'

export function useWorkspacePermissions() {
  const { currentPlan, hasPermission, usage, limits } = usePlan()
  const { getWorkspaces } = useWorkspace()
  const limitModal = useWorkspaceLimitModal()
  const { toast } = useToast()

  /**
   * Verifica se pode criar um novo workspace ADICIONAL
   * REGRA: Todo usuário tem 1 workspace individual obrigatório
   * Workspaces adicionais dependem do plano
   */
  const canCreateWorkspace = useCallback((): boolean => {
    if (!currentPlan) return false
    
    // Verificar se tem permissão básica
    if (!hasPermission('workspace.create')) {
      return false
    }
    
    // REGRA DE NEGÓCIO CRÍTICA:
    // Todo usuário sempre tem direito a 1 workspace individual
    // Os limites do plano se aplicam aos workspaces ADICIONAIS
    const individualWorkspaceCount = 1 // Sempre obrigatório
    const additionalWorkspacesAllowed = Math.max(0, (limits.max_workspaces || 1) - individualWorkspaceCount)
    const currentAdditionalWorkspaces = Math.max(0, usage.workspaces_count - individualWorkspaceCount)
    
    console.log('🔍 Verificação de criação de workspace:', {
      planName: currentPlan.name,
      totalLimit: limits.max_workspaces,
      individualRequired: individualWorkspaceCount,
      additionalAllowed: additionalWorkspacesAllowed,
      currentTotal: usage.workspaces_count,
      currentAdditional: currentAdditionalWorkspaces,
      canCreateAdditional: currentAdditionalWorkspaces < additionalWorkspacesAllowed
    })
    
    // Verificar limite de workspaces ADICIONAIS
    if (additionalWorkspacesAllowed === 0) {
      return false // Plano só permite workspace individual
    }
    
    if (currentAdditionalWorkspaces >= additionalWorkspacesAllowed) {
      return false // Atingiu limite de workspaces adicionais
    }
    
    return true
  }, [currentPlan, hasPermission, limits, usage])

  /**
   * Verifica se pode convidar membros
   */
  const canInviteMembers = useCallback((currentMemberCount: number = 0): boolean => {
    if (!currentPlan) return false
    
    // Verificar se tem permissão básica
    if (!hasPermission('members.invite')) {
      return false
    }
    
    // Verificar limite de membros por workspace
    if (limits.max_members_per_workspace !== -1 && currentMemberCount >= limits.max_members_per_workspace) {
      return false
    }
    
    return true
  }, [currentPlan, hasPermission, limits])

  /**
   * Tenta criar workspace com validação e feedback visual
   */
  const validateWorkspaceCreation = useCallback(() => {
    if (!currentPlan) {
      toast({
        title: "Erro",
        description: "Não foi possível verificar seu plano atual.",
        variant: "destructive"
      })
      return false
    }

    // Verificar permissão básica
    if (!hasPermission('workspace.create')) {
      toast({
        title: "Sem Permissão",
        description: "Você não tem permissão para criar workspaces.",
        variant: "destructive"
      })
      return false
    }

    // Verificar limite de workspaces
    if (limits.max_workspaces !== -1 && usage.workspaces_count >= limits.max_workspaces) {
      limitModal.showLimitModal({
        limitType: 'workspaces',
        currentCount: usage.workspaces_count,
        maxAllowed: limits.max_workspaces,
        planName: currentPlan.name
      })
      return false
    }

    // Tudo OK
    return true
  }, [currentPlan, hasPermission, limits, usage, limitModal])

  /**
   * Tenta convidar membro com validação e feedback visual
   */
  const validateMemberInvitation = useCallback((currentMemberCount: number = 0) => {
    if (!currentPlan) {
      toast({
        title: "Erro",
        description: "Não foi possível verificar seu plano atual.",
        variant: "destructive"
      })
      return false
    }

    // Verificar permissão básica
    if (!hasPermission('members.invite')) {
      toast({
        title: "Sem Permissão",
        description: "Você não tem permissão para convidar membros.",
        variant: "destructive"
      })
      return false
    }

    // Verificar limite de membros por workspace
    if (limits.max_members_per_workspace !== -1 && currentMemberCount >= limits.max_members_per_workspace) {
      limitModal.showLimitModal({
        limitType: 'members',
        currentCount: currentMemberCount,
        maxAllowed: limits.max_members_per_workspace,
        planName: currentPlan.name
      })
      return false
    }

    // Tudo OK
    return true
  }, [currentPlan, hasPermission, limits, limitModal])

  /**
   * Obtém status de limites para exibir na UI
   */
  const getLimitStatus = useCallback(() => {
    if (!currentPlan) return null

    const workspaceUsage = limits.max_workspaces === -1 
      ? { current: usage.workspaces_count, max: -1, percentage: 0 }
      : { 
          current: usage.workspaces_count, 
          max: limits.max_workspaces, 
          percentage: (usage.workspaces_count / limits.max_workspaces) * 100 
        }

    const memberUsage = limits.max_members_per_workspace === -1
      ? { current: usage.members_count, max: -1, percentage: 0 }
      : { 
          current: usage.members_count, 
          max: limits.max_members_per_workspace, 
          percentage: (usage.members_count / limits.max_members_per_workspace) * 100 
        }

    const storageUsage = limits.max_storage_gb === -1
      ? { current: usage.storage_used_gb, max: -1, percentage: 0 }
      : { 
          current: usage.storage_used_gb, 
          max: limits.max_storage_gb, 
          percentage: (usage.storage_used_gb / limits.max_storage_gb) * 100 
        }

    return {
      workspaces: workspaceUsage,
      members: memberUsage,
      storage: storageUsage,
      planName: currentPlan.name
    }
  }, [currentPlan, limits, usage])

  /**
   * Verifica se está próximo do limite (80% ou mais)
   */
  const isNearLimit = useCallback((type: 'workspaces' | 'members' | 'storage') => {
    const status = getLimitStatus()
    if (!status) return false

    const typeStatus = status[type]
    if (typeStatus.max === -1) return false // Ilimitado

    return typeStatus.percentage >= 80
  }, [getLimitStatus])

  /**
   * Verifica se atingiu o limite
   */
  const isAtLimit = useCallback((type: 'workspaces' | 'members' | 'storage') => {
    const status = getLimitStatus()
    if (!status) return false

    const typeStatus = status[type]
    if (typeStatus.max === -1) return false // Ilimitado

    return typeStatus.current >= typeStatus.max
  }, [getLimitStatus])

  return {
    // Verificações básicas
    canCreateWorkspace,
    canInviteMembers,
    
    // Validações com feedback visual
    validateWorkspaceCreation,
    validateMemberInvitation,
    
    // Status e informações
    getLimitStatus,
    isNearLimit,
    isAtLimit,
    
    // Dados do plano atual
    currentPlan,
    limits,
    usage
  }
} 