'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, AlertTriangle, Crown, Users, Shield } from 'lucide-react'
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

interface RemoveMemberModalProps {
  isOpen: boolean
  onClose: () => void
  member: TeamMember | null
  workspaceId: string
  onSuccess?: () => void
}

export default function RemoveMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  workspaceId,
  onSuccess 
}: RemoveMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmChecked, setConfirmChecked] = useState(false)
  
  const { toast } = useToast()
  const { hasPermission } = usePermissions()
  const { user } = useAuth()

  // Reset form when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmChecked(false)
      setError(null)
      onClose()
    }
  }

  // Handle member removal
  const handleRemoveMember = async () => {
    if (!member || !workspaceId) {
      setError('Dados do membro ou workspace não encontrados')
      return
    }

    if (!confirmChecked) {
      setError('Confirme que deseja remover o membro')
      return
    }

    if (!hasPermission('members.remove')) {
      setError('Você não tem permissão para remover membros')
      return
    }

    if (member.role === 'owner') {
      setError('Não é possível remover o proprietário do workspace')
      return
    }

    if (member.email === user?.email) {
      setError('Você não pode remover a si mesmo')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Extract member ID from the composite ID (format: "workspaceId-memberId")
      const memberId = member.id.split('-')[1]
      
      if (!memberId) {
        throw new Error('ID do membro inválido')
      }

      await apiService.removeWorkspaceMember(workspaceId, parseInt(memberId))

      toast({
        title: "Membro removido!",
        description: `${member.name} foi removido do workspace com sucesso`,
        variant: "default"
      })

      // Close modal and refresh data
      onClose()
      setConfirmChecked(false)
      
      if (onSuccess) {
        onSuccess()
      }

    } catch (error: any) {
      console.error('Erro ao remover membro:', error)
      
      // Handle specific error messages
      if (error.response?.status === 403) {
        setError('Você não tem permissão para remover membros')
      } else if (error.response?.status === 404) {
        setError('Membro ou workspace não encontrado')
      } else if (error.response?.status === 409) {
        setError('Não é possível remover este membro. Verifique as permissões.')
      } else {
        setError(error.message || 'Erro ao remover membro. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown
      case 'admin': return Shield
      default: return Users
    }
  }

  // Check if removal is blocked
  const isOwner = member?.role === 'owner'
  const isCurrentUser = member?.email === user?.email
  const canRemove = hasPermission('members.remove') && !isOwner && !isCurrentUser

  if (!member) {
    return null
  }

  const RoleIcon = getRoleIcon(member.role)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Remover Membro
          </DialogTitle>
          <DialogDescription>
            Esta ação é irreversível. O membro perderá acesso ao workspace imediatamente.
          </DialogDescription>
        </DialogHeader>

        {/* Member Info */}
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <RoleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-900">{member.name}</p>
              <p className="text-sm text-red-700">{member.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-red-700 border-red-300">
                  {member.role}
                </Badge>
                <Badge variant="secondary" className="text-red-700">
                  {member.workspace_count} workspace{member.workspace_count !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings and Restrictions */}
        {isOwner && (
          <Alert variant="destructive">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>Não é possível remover o proprietário</strong><br />
              O proprietário do workspace não pode ser removido. Para transferir a propriedade, 
              primeiro altere a função de outro membro para "owner".
            </AlertDescription>
          </Alert>
        )}

        {isCurrentUser && !isOwner && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Não é possível remover a si mesmo</strong><br />
              Para sair do workspace, use a opção "Sair do Workspace" nas configurações.
            </AlertDescription>
          </Alert>
        )}

        {!canRemove && !isOwner && !isCurrentUser && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Sem permissão</strong><br />
              Você não tem permissão para remover membros deste workspace.
            </AlertDescription>
          </Alert>
        )}

        {canRemove && (
          <>
            {/* Impact Warning */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Consequências da remoção:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>O membro perderá acesso imediato ao workspace</li>
                  <li>Projetos compartilhados podem ser afetados</li>
                  <li>Será necessário um novo convite para readmitir</li>
                  <li>Histórico de atividades será mantido</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Confirmation Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirm-remove"
                checked={confirmChecked}
                onCheckedChange={(checked) => setConfirmChecked(checked === true)}
                disabled={loading}
              />
              <label
                htmlFor="confirm-remove"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Confirmo que desejo remover <strong>{member.name}</strong> do workspace
              </label>
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          {canRemove && (
            <Button
              onClick={handleRemoveMember}
              disabled={!confirmChecked || loading}
              variant="destructive"
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Removendo...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Remover Membro
                </div>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 