'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Mail, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiService } from '@/lib/api/service'
import { usePermissions } from '@/context/plan-context'
import type { WorkspaceResponse } from '@/types/workspace-types'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  workspace?: WorkspaceResponse
  onSuccess?: () => void
}

const WORKSPACE_ROLES = [
  { value: 'member', label: 'Membro', description: 'Permissões básicas de colaboração' },
  { value: 'admin', label: 'Administrador', description: 'Permissões avançadas de gerenciamento' },
  { value: 'viewer', label: 'Visualizador', description: 'Acesso somente leitura' }
]

export default function InviteMemberModal({ 
  isOpen, 
  onClose, 
  workspaceId, 
  workspace,
  onSuccess 
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { toast } = useToast()
  const { hasPermission } = usePermissions()

  // Reset form when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmail('')
      setRole('member')
      setMessage('')
      setError(null)
      onClose()
    }
  }

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email é obrigatório')
      return
    }

    if (!isValidEmail(email)) {
      setError('Email inválido')
      return
    }

    if (!workspaceId) {
      setError('Nenhum workspace selecionado')
      return
    }

    if (!hasPermission('members.invite')) {
      setError('Você não tem permissão para convidar membros')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await apiService.inviteWorkspaceMember(workspaceId, {
        email: email.trim(),
        role: role as any,
        message: message.trim() || undefined
      })

      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${email} como ${WORKSPACE_ROLES.find(r => r.value === role)?.label}`,
        variant: "default"
      })

      // Reset form and close modal
      setEmail('')
      setRole('member')
      setMessage('')
      onClose()
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess()
      }

    } catch (error: any) {
      console.error('Erro ao convidar membro:', error)
      
      // Handle specific error messages
      if (error.response?.status === 409) {
        setError('Este usuário já é membro deste workspace')
      } else if (error.response?.status === 403) {
        setError('Você não tem permissão para convidar membros')
      } else if (error.response?.status === 404) {
        setError('Workspace não encontrado')
      } else {
        setError(error.message || 'Erro ao enviar convite. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Check if form is valid
  const isFormValid = email.trim() && isValidEmail(email) && workspaceId && !loading

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Membro
          </DialogTitle>
          <DialogDescription>
            {workspace ? (
              <>Convide um novo membro para o workspace <strong>{workspace.name}</strong></>
            ) : workspaceId ? (
              <>Convide um novo membro para o workspace selecionado</>
            ) : (
              <>Selecione um workspace para convidar membros</>
            )}
          </DialogDescription>
        </DialogHeader>

        {!workspaceId ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Selecione um workspace específico para convidar membros.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email do Membro
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={error && !isValidEmail(email) ? 'border-red-500' : ''}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Função no Workspace
              </Label>
              <Select value={role} onValueChange={setRole} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKSPACE_ROLES.map((roleOption) => (
                    <SelectItem key={roleOption.value} value={roleOption.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{roleOption.label}</span>
                        <span className="text-xs text-muted-foreground">{roleOption.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem Personalizada (Opcional)</Label>
              <Textarea
                id="message"
                placeholder="Olá! Você foi convidado para colaborar no nosso workspace..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {message.length}/500 caracteres
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Preview */}
            {isValidEmail(email) && (
              <div className="p-3 bg-muted rounded-lg border">
                <p className="text-sm font-medium mb-2">Resumo do Convite:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Função:</span>
                    <Badge variant="outline">
                      {WORKSPACE_ROLES.find(r => r.value === role)?.label}
                    </Badge>
                  </div>
                  {workspace && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Workspace:</span>
                      <span>{workspace.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
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
          {workspaceId && (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Enviar Convite
                </div>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 