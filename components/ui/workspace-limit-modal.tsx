"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Zap, Users, Building, AlertTriangle } from "lucide-react"

interface WorkspaceLimitModalProps {
  isOpen: boolean
  onClose: () => void
  limitType: 'workspaces' | 'members' | 'storage' | 'general'
  currentCount: number
  maxAllowed: number
  planName: string
  onUpgrade?: () => void
}

export function WorkspaceLimitModal({
  isOpen,
  onClose,
  limitType,
  currentCount,
  maxAllowed,
  planName,
  onUpgrade
}: WorkspaceLimitModalProps) {
  
  const getLimitInfo = () => {
    switch (limitType) {
      case 'workspaces':
        return {
          title: 'Limite de Workspaces Atingido',
          description: `Você atingiu o limite de ${maxAllowed} workspace${maxAllowed !== 1 ? 's' : ''} do plano ${planName}.`,
          icon: <Building className="h-5 w-5 text-orange-500" />,
          suggestion: 'Para criar mais workspaces, faça upgrade do seu plano.'
        }
      case 'members':
        return {
          title: 'Limite de Membros Atingido',
          description: `Você atingiu o limite de ${maxAllowed} membro${maxAllowed !== 1 ? 's' : ''} por workspace do plano ${planName}.`,
          icon: <Users className="h-5 w-5 text-blue-500" />,
          suggestion: 'Para convidar mais membros, faça upgrade do seu plano.'
        }
      case 'storage':
        return {
          title: 'Limite de Armazenamento Atingido',
          description: `Você atingiu o limite de ${maxAllowed}GB de armazenamento do plano ${planName}.`,
          icon: <Zap className="h-5 w-5 text-purple-500" />,
          suggestion: 'Para ter mais espaço, faça upgrade do seu plano.'
        }
      default:
        return {
          title: 'Limite do Plano Atingido',
          description: `Você atingiu um limite do plano ${planName}.`,
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          suggestion: 'Para continuar usando todos os recursos, faça upgrade do seu plano.'
        }
    }
  }

  const limitInfo = getLimitInfo()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {limitInfo.icon}
            <DialogTitle>{limitInfo.title}</DialogTitle>
          </div>
          <DialogDescription className="space-y-3">
            <p>{limitInfo.description}</p>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Uso atual:</strong> {currentCount} de {maxAllowed === -1 ? 'ilimitado' : maxAllowed}
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <Crown className="h-3 w-3 mr-1" />
                Plano {planName}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {limitInfo.suggestion}
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Entendi
          </Button>
          {onUpgrade && (
            <Button onClick={onUpgrade} className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
              <Crown className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook para usar o modal de limite
export function useWorkspaceLimitModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [limitData, setLimitData] = React.useState<{
    limitType: 'workspaces' | 'members' | 'storage' | 'general'
    currentCount: number
    maxAllowed: number
    planName: string
  } | null>(null)

  const showLimitModal = (data: {
    limitType: 'workspaces' | 'members' | 'storage' | 'general'
    currentCount: number
    maxAllowed: number
    planName: string
  }) => {
    setLimitData(data)
    setIsOpen(true)
  }

  const hideLimitModal = () => {
    setIsOpen(false)
    setLimitData(null)
  }

  return {
    isOpen,
    limitData,
    showLimitModal,
    hideLimitModal
  }
} 