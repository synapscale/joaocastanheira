"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle, 
  ArrowRight, 
  Building, 
  Users, 
  Workflow, 
  MessageSquare,
  Sparkles,
  Rocket
} from "lucide-react"
import { useAuth } from '@/context/auth-context'
import { useWorkspace, useCurrentWorkspace } from '@/context/workspace-context'
import { usePlan } from '@/context/plan-context'

interface PostSignupOnboardingProps {
  isOpen: boolean
  onComplete: () => void
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action?: () => void
  actionLabel?: string
  completed?: boolean
}

export function PostSignupOnboarding({ isOpen, onComplete }: PostSignupOnboardingProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { state: workspaceState } = useWorkspace()
  const currentWorkspace = useCurrentWorkspace()
  const { currentPlan } = usePlan()
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Bem-vindo, ${user?.name || user?.email}!`,
      description: 'Você criou sua conta com sucesso! Vamos configurar seu espaço de trabalho.',
      icon: <Sparkles className="h-6 w-6 text-yellow-500" />,
      completed: true
    },
    {
      id: 'workspace',
      title: 'Seu Workspace Pessoal',
      description: currentWorkspace 
        ? `Criamos automaticamente o workspace "${currentWorkspace.name}" para você.`
        : 'Criando seu workspace pessoal...',
      icon: <Building className="h-6 w-6 text-blue-500" />,
      completed: !!currentWorkspace
    },
    {
      id: 'plan',
      title: 'Plano Atual',
      description: `Você está no plano ${currentPlan?.name || 'Free'}. Você pode fazer upgrade a qualquer momento para ter mais recursos.`,
      icon: <Rocket className="h-6 w-6 text-purple-500" />,
      completed: !!currentPlan
    },
    {
      id: 'explore',
      title: 'Explorar Funcionalidades',
      description: 'Descubra o que você pode fazer com sua nova conta.',
      icon: <Workflow className="h-6 w-6 text-green-500" />,
      action: () => router.push('/canvas'),
      actionLabel: 'Ir para Editor'
    }
  ]

  const currentStep = steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Auto-avançar steps completados
  useEffect(() => {
    if (currentStep?.completed && currentStepIndex < steps.length - 1) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, currentStep.id]))
        setCurrentStepIndex(prev => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentStep, currentStepIndex, steps.length])

  const handleNext = () => {
    if (currentStep.action) {
      currentStep.action()
      return
    }

    if (currentStepIndex < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep.id]))
      setCurrentStepIndex(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    // Marcar onboarding como concluído
    localStorage.setItem('post_signup_onboarding_completed', 'true')
    onComplete()
  }

  const handleSkip = () => {
    handleComplete()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {currentStep.icon}
              </div>
              <div>
                <DialogTitle className="text-left">{currentStep.title}</DialogTitle>
                <DialogDescription className="text-left">
                  Passo {currentStepIndex + 1} de {steps.length}
                </DialogDescription>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Descrição do Step Atual */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">{currentStep.description}</p>
          </div>

          {/* Conteúdo Específico por Step */}
          {currentStep.id === 'workspace' && currentWorkspace && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {currentWorkspace.name}
                </CardTitle>
                <CardDescription>
                  Seu workspace pessoal para organizar projetos e colaborar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{currentWorkspace.member_count} membro(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <span>{currentWorkspace.project_count} projeto(s)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep.id === 'plan' && currentPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Plano {currentPlan.name}
                </CardTitle>
                <CardDescription>
                  {currentPlan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Workspaces:</span>
                    <span>
                      {currentPlan.limits.max_workspaces === -1 
                        ? 'Ilimitado' 
                        : `Até ${currentPlan.limits.max_workspaces}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Membros por workspace:</span>
                    <span>
                      {currentPlan.limits.max_members_per_workspace === -1 
                        ? 'Ilimitado' 
                        : `Até ${currentPlan.limits.max_members_per_workspace}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Armazenamento:</span>
                    <span>
                      {currentPlan.limits.max_storage_gb === -1 
                        ? 'Ilimitado' 
                        : `${currentPlan.limits.max_storage_gb}GB`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep.id === 'explore' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/canvas')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Workflow className="h-5 w-5" />
                    Editor de Workflow
                  </CardTitle>
                  <CardDescription>
                    Crie fluxos de automação visuais
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/chat')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5" />
                    Chat Interativo
                  </CardTitle>
                  <CardDescription>
                    Converse com seus agentes AI
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/team')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    Equipe & Workspaces
                  </CardTitle>
                  <CardDescription>
                    Gerencie sua equipe e workspaces
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/marketplace')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="h-5 w-5" />
                    Marketplace
                  </CardTitle>
                  <CardDescription>
                    Descubra templates e componentes
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Steps completados */}
          <div className="space-y-2">
            {steps.slice(0, currentStepIndex).map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Pular
          </Button>
          
          <Button onClick={handleNext}>
            {currentStep.actionLabel || (currentStepIndex === steps.length - 1 ? 'Concluir' : 'Próximo')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook para gerenciar o onboarding pós-signup
export function usePostSignupOnboarding() {
  const [shouldShow, setShouldShow] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { state: workspaceState } = useWorkspace()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Verificar se já completou o onboarding
    const hasCompletedOnboarding = localStorage.getItem('post_signup_onboarding_completed')
    
    // Verificar se é um usuário novo (criado há menos de 5 minutos)
    const isNewUser = user.createdAt && 
      (new Date().getTime() - new Date(user.createdAt).getTime()) < 5 * 60 * 1000

    // Mostrar onboarding se:
    // 1. Não completou ainda
    // 2. É um usuário novo
    // 3. Workspace foi inicializado
    if (!hasCompletedOnboarding && isNewUser && workspaceState.isInitialized) {
      setShouldShow(true)
    }
  }, [isAuthenticated, user, workspaceState.isInitialized])

  const hideOnboarding = () => {
    setShouldShow(false)
  }

  return {
    shouldShow,
    hideOnboarding
  }
} 