'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Edit, Shield, AlertTriangle, CheckCircle, Crown, Users } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiService } from '@/lib/api/service'
import { usePermissions } from '@/context/plan-context'

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

interface EditMemberModalProps {
  isOpen: boolean
  onClose: () => void
  member: TeamMember | null
  workspaceId: string
  onSuccess?: () => void
}

const WORKSPACE_ROLES = [
  { 
    value: 'member', 
    label: 'Membro', 
    description: 'Permissões básicas de colaboração',
    icon: Users 
  },
  { 
    value: 'admin', 
    label: 'Administrador', 
    description: 'Permissões avançadas de gerenciamento',
    icon: Shield 
  },
  { 
    value: 'viewer', 
    label: 'Visualizador', 
    description: 'Acesso somente leitura',
    icon: Users 
  }
]

export default function EditMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  workspaceId,
  onSuccess 
}: EditMemberModalProps) {
  const [newRole, setNewRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { toast } = useToast()
  const { hasPermission } = usePermissions()

  // Initialize role when member changes
  useEffect(() => {
    if (member) {
      setNewRole(member.role)
      setError(null)
    }
  }, [member])

  // Reset form when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewRole('')
      setError(null)
      onClose()
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!member || !workspaceId) {
      setError('Dados do membro ou workspace não encontrados')
      return
    }

    if (!newRole) {
      setError('Selecione uma função')
      return
    }

    if (newRole === member.role) {
      setError('Selecione uma função diferente da atual')
      return
    }

    if (!hasPermission('members.edit_roles')) {
      setError('Você não tem permissão para editar funções')
      return
    }

    if (member.role === 'owner') {
      setError('Não é possível alterar a função do proprietário')
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

      await apiService.updateWorkspaceMemberRole(workspaceId, parseInt(memberId), newRole)

      toast({
        title: "Função atualizada!",
        description: `Função de ${member.name} alterada para ${WORKSPACE_ROLES.find(r => r.value === newRole)?.label}`,
        variant: "default"
      })

      // Close modal and refresh data
      onClose()
      
      if (onSuccess) {
        onSuccess()
      }

    } catch (error: any) {
      console.error('Erro ao atualizar função do membro:', error)
      
      // Handle specific error messages
      if (error.response?.status === 403) {
        setError('Você não tem permissão para alterar funções')
      } else if (error.response?.status === 404) {
        setError('Membro ou workspace não encontrado')
      } else if (error.response?.status === 409) {
        setError('Conflito ao alterar função. Tente novamente.')
      } else {
        setError(error.message || 'Erro ao atualizar função. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get current role info
  const currentRoleInfo = WORKSPACE_ROLES.find(r => r.value === member?.role)
  const newRoleInfo = WORKSPACE_ROLES.find(r => r.value === newRole)

  // Check if form is valid
  const isFormValid = member && newRole && newRole !== member.role && !loading

  if (!member) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Membro
          </DialogTitle>
          <DialogDescription>
            Altere a função de <strong>{member.name}</strong> no workspace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member Info */}
          <div className="p-3 bg-muted rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                {currentRoleInfo?.icon && <currentRoleInfo.icon className="h-3 w-3" />}
                {currentRoleInfo?.label || member.role}
              </Badge>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Nova Função no Workspace
            </Label>
            <Select value={newRole} onValueChange={setNewRole} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                {WORKSPACE_ROLES.map((roleOption) => {
                  const Icon = roleOption.icon
                  const isCurrent = roleOption.value === member.role
                  
                  return (
                    <SelectItem 
                      key={roleOption.value} 
                      value={roleOption.value}
                      disabled={isCurrent}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {roleOption.label}
                            {isCurrent && " (Atual)"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {roleOption.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Change Preview */}
          {newRole && newRole !== member.role && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">Alteração Proposta:</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-700">De:</span>
                  <Badge variant="outline">
                    {currentRoleInfo?.label || member.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-700">Para:</span>
                  <Badge variant="default">
                    {newRoleInfo?.label}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Restrictions Warning */}
          {member.role === 'owner' && (
            <Alert variant="destructive">
              <Crown className="h-4 w-4" />
              <AlertDescription>
                Não é possível alterar a função do proprietário do workspace.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid || member.role === 'owner'}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Salvar Alteração
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 