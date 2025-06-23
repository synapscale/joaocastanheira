'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Settings, Edit, Trash2, Shield, AlertTriangle, Crown, Info } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiService } from '@/lib/api/service'
import { usePermissions } from '@/context/plan-context'
import { useAuth } from '@/context/auth-context'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'pending' | 'inactive'
  last_activity: string
  workspace_count: number
  created_at: string
}

interface MemberActionsDropdownProps {
  member: TeamMember
  workspaceId?: string
  onMemberUpdated?: () => void
  onEditMember?: (member: TeamMember) => void
  onRemoveMember?: (member: TeamMember) => void
}

export default function MemberActionsDropdown({ 
  member, 
  workspaceId,
  onMemberUpdated,
  onEditMember,
  onRemoveMember
}: MemberActionsDropdownProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { hasPermission } = usePermissions()
  const { user } = useAuth()

  // Check if current user can manage this member
  const canEditMember = hasPermission('members.edit_roles') && member.role !== 'owner' && member.email !== user?.email
  const canRemoveMember = hasPermission('members.remove') && member.role !== 'owner' && member.email !== user?.email
  const canViewDetails = true // Everyone can view member details

  // Check if member is the owner
  const isOwner = member.role === 'owner'
  const isCurrentUser = member.email === user?.email

  // Handle actions
  const handleEditRole = () => {
    if (onEditMember) {
      onEditMember(member)
    } else {
      toast({
        title: "Editar Membro",
        description: "Funcionalidade de edição será aberta em breve",
        variant: "default"
      })
    }
  }

  const handleRemoveMember = () => {
    if (onRemoveMember) {
      onRemoveMember(member)
    } else {
      toast({
        title: "Remover Membro",
        description: "Funcionalidade de remoção será aberta em breve",
        variant: "default"
      })
    }
  }

  const handleViewDetails = () => {
    toast({
      title: `Detalhes do Membro: ${member.name}`,
      description: (
        <div className="space-y-1 mt-2">
          <p><strong>Email:</strong> {member.email}</p>
          <p><strong>Função:</strong> {member.role}</p>
          <p><strong>Status:</strong> {member.status}</p>
          <p><strong>Workspaces:</strong> {member.workspace_count}</p>
          <p><strong>Última atividade:</strong> {new Date(member.last_activity).toLocaleDateString('pt-BR')}</p>
        </div>
      )
    })
  }

  // If no actions are available, don't render the dropdown
  if (!canEditMember && !canRemoveMember && !canViewDetails) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Ações do Membro
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* View Details - Always available */}
        <DropdownMenuItem onClick={handleViewDetails} className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          Ver Detalhes
        </DropdownMenuItem>

        {/* Edit Role - Only if user has permission and target is not owner/self */}
        {canEditMember && (
          <DropdownMenuItem onClick={handleEditRole} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Função
          </DropdownMenuItem>
        )}

        {/* Remove Member - Only if user has permission and target is not owner/self */}
        {canRemoveMember && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleRemoveMember} 
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Remover Membro
            </DropdownMenuItem>
          </>
        )}

        {/* Information about restrictions */}
        {(isOwner || isCurrentUser) && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {isOwner && (
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Proprietário do workspace
                </div>
              )}
              {isCurrentUser && !isOwner && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Você mesmo
                </div>
              )}
            </div>
          </>
        )}

        {/* Show workspace limitation for aggregated view */}
        {!workspaceId && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Alert className="p-2">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  Selecione um workspace específico para editar ou remover membros
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 