"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle, AlertCircle, Loader2, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthErrorCategory, AuthErrorCode } from '@/lib/types/errors'

// Progress Types
export type ProgressStep = {
  id: string
  label: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'skipped'
  errorCode?: AuthErrorCode
  duration?: number
}

export type ProgressTheme = 'default' | 'auth' | 'minimal' | 'verbose'
export type ProgressSize = 'sm' | 'md' | 'lg'
export type ProgressOrientation = 'horizontal' | 'vertical'

export interface ProgressIndicatorProps {
  steps: ProgressStep[]
  currentStep?: string
  theme?: ProgressTheme
  size?: ProgressSize
  orientation?: ProgressOrientation
  showProgress?: boolean
  showTimeEstimate?: boolean
  className?: string
  onStepClick?: (stepId: string) => void
  onComplete?: () => void
  onError?: (stepId: string, errorCode?: AuthErrorCode) => void
}

// Auth Operation Steps Templates
export const AuthOperationSteps = {
  login: [
    { id: 'validate', label: 'Validando credenciais', description: 'Verificando email e senha', status: 'pending' as const },
    { id: 'authenticate', label: 'Autenticando', description: 'Conectando ao servidor', status: 'pending' as const },
    { id: 'token', label: 'Gerando sessão', description: 'Criando token de acesso', status: 'pending' as const },
    { id: 'permissions', label: 'Verificando permissões', description: 'Carregando perfil do usuário', status: 'pending' as const },
    { id: 'redirect', label: 'Redirecionando', description: 'Finalizando login', status: 'pending' as const }
  ],
  logout: [
    { id: 'cleanup', label: 'Limpando sessão', description: 'Removendo dados locais', status: 'pending' as const },
    { id: 'invalidate', label: 'Invalidando token', description: 'Notificando servidor', status: 'pending' as const },
    { id: 'redirect', label: 'Redirecionando', description: 'Voltando ao login', status: 'pending' as const }
  ],
  tokenRefresh: [
    { id: 'validate', label: 'Verificando token', description: 'Validando token atual', status: 'pending' as const },
    { id: 'refresh', label: 'Renovando sessão', description: 'Obtendo novo token', status: 'pending' as const },
    { id: 'update', label: 'Atualizando dados', description: 'Salvando nova sessão', status: 'pending' as const }
  ],
  recovery: [
    { id: 'analyze', label: 'Analisando erro', description: 'Identificando problema', status: 'pending' as const },
    { id: 'strategy', label: 'Definindo estratégia', description: 'Escolhendo recuperação', status: 'pending' as const },
    { id: 'execute', label: 'Executando recuperação', description: 'Aplicando correção', status: 'pending' as const },
    { id: 'verify', label: 'Verificando resultado', description: 'Validando sucesso', status: 'pending' as const }
  ]
}

// Progress Icons
const getStepIcon = (status: ProgressStep['status'], size: ProgressSize) => {
  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size]

  switch (status) {
    case 'completed':
      return <CheckCircle className={cn(iconSize, "text-green-600")} />
    case 'error':
      return <AlertCircle className={cn(iconSize, "text-red-600")} />
    case 'in-progress':
      return <Loader2 className={cn(iconSize, "text-blue-600 animate-spin")} />
    case 'pending':
      return <Clock className={cn(iconSize, "text-gray-400")} />
    case 'skipped':
      return <ArrowRight className={cn(iconSize, "text-yellow-600")} />
    default:
      return <Clock className={cn(iconSize, "text-gray-400")} />
  }
}

// Progress Bar Component
interface ProgressBarProps {
  progress: number
  size: ProgressSize
  theme: ProgressTheme
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, size, theme, className }) => {
  const barHeight = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }[size]

  const barColors = {
    default: 'bg-blue-600',
    auth: 'bg-emerald-600',
    minimal: 'bg-gray-600',
    verbose: 'bg-blue-600'
  }[theme]

  return (
    <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", barHeight, className)}>
      <div 
        className={cn("transition-all duration-500 ease-out rounded-full", barHeight, barColors)}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}

// Step Component
interface StepProps {
  step: ProgressStep
  index: number
  isLast: boolean
  size: ProgressSize
  theme: ProgressTheme
  orientation: ProgressOrientation
  showTimeEstimate: boolean
  onClick?: (stepId: string) => void
}

const Step: React.FC<StepProps> = ({ 
  step, 
  index, 
  isLast, 
  size, 
  theme, 
  orientation, 
  showTimeEstimate,
  onClick 
}) => {
  const stepSizes = {
    sm: { 
      container: 'p-2', 
      text: 'text-sm',
      description: 'text-xs'
    },
    md: { 
      container: 'p-3', 
      text: 'text-base',
      description: 'text-sm'
    },
    lg: { 
      container: 'p-4', 
      text: 'text-lg',
      description: 'text-base'
    }
  }[size]

  const stepColors = {
    completed: 'text-green-900 bg-green-50 border-green-200',
    error: 'text-red-900 bg-red-50 border-red-200',
    'in-progress': 'text-blue-900 bg-blue-50 border-blue-200',
    pending: 'text-gray-600 bg-gray-50 border-gray-200',
    skipped: 'text-yellow-800 bg-yellow-50 border-yellow-200'
  }[step.status]

  const isClickable = onClick && (step.status === 'completed' || step.status === 'error')

  const stepContent = (
    <div 
      className={cn(
        "rounded-lg border transition-all duration-200",
        stepSizes.container,
        stepColors,
        isClickable && "cursor-pointer hover:shadow-md",
        orientation === 'horizontal' ? 'flex-1' : 'w-full'
      )}
      onClick={() => isClickable && onClick(step.id)}
    >
      <div className="flex items-center space-x-3">
        {getStepIcon(step.status, size)}
        
        <div className="flex-1 min-w-0">
          <div className={cn("font-medium", stepSizes.text)}>
            {step.label}
          </div>
          
          {step.description && theme !== 'minimal' && (
            <div className={cn("opacity-80 mt-1", stepSizes.description)}>
              {step.description}
            </div>
          )}
          
          {showTimeEstimate && step.duration && step.status === 'in-progress' && (
            <div className={cn("text-blue-600 mt-1", stepSizes.description)}>
              ~{step.duration}s restantes
            </div>
          )}
          
          {step.errorCode && step.status === 'error' && theme === 'verbose' && (
            <div className={cn("text-red-600 mt-1 font-mono", stepSizes.description)}>
              {step.errorCode}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center">
        {stepContent}
        {!isLast && (
          <div className="mx-2 flex-shrink-0">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {stepContent}
      {!isLast && (
        <div className="ml-6 my-2 w-px h-4 bg-gray-300" />
      )}
    </div>
  )
}

// Main Progress Indicator Component
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  theme = 'default',
  size = 'md',
  orientation = 'vertical',
  showProgress = true,
  showTimeEstimate = false,
  className,
  onStepClick,
  onComplete,
  onError
}) => {
  const [internalSteps, setInternalSteps] = useState<ProgressStep[]>(steps)

  // Update steps when props change
  useEffect(() => {
    setInternalSteps(steps)
  }, [steps])

  // Calculate progress percentage
  const completedSteps = internalSteps.filter(step => step.status === 'completed').length
  const totalSteps = internalSteps.length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  // Check for completion or errors
  useEffect(() => {
    const hasError = internalSteps.some(step => step.status === 'error')
    const allCompleted = internalSteps.every(step => step.status === 'completed' || step.status === 'skipped')

    if (hasError) {
      const errorStep = internalSteps.find(step => step.status === 'error')
      if (errorStep && onError) {
        onError(errorStep.id, errorStep.errorCode)
      }
    } else if (allCompleted && onComplete) {
      onComplete()
    }
  }, [internalSteps, onComplete, onError])

  // Update step status
  const updateStep = useCallback((stepId: string, updates: Partial<ProgressStep>) => {
    setInternalSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }, [])

  // Auto-progress to current step
  useEffect(() => {
    if (currentStep) {
      const currentIndex = internalSteps.findIndex(step => step.id === currentStep)
      
      setInternalSteps(prev => prev.map((step, index) => {
        if (index < currentIndex) {
          return { ...step, status: 'completed' as const }
        } else if (index === currentIndex) {
          return { ...step, status: 'in-progress' as const }
        } else {
          return { ...step, status: 'pending' as const }
        }
      }))
    }
  }, [currentStep, internalSteps.length])

  const containerClasses = cn(
    "space-y-4",
    orientation === 'horizontal' && "space-y-0 space-x-2",
    className
  )

  const stepsContainerClasses = cn(
    "space-y-2",
    orientation === 'horizontal' && "flex items-center space-y-0 space-x-0"
  )

  return (
    <div className={containerClasses}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Progresso</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <ProgressBar 
            progress={progressPercentage} 
            size={size} 
            theme={theme} 
          />
        </div>
      )}

      {/* Steps */}
      <div className={stepsContainerClasses}>
        {internalSteps.map((step, index) => (
          <Step
            key={step.id}
            step={step}
            index={index}
            isLast={index === internalSteps.length - 1}
            size={size}
            theme={theme}
            orientation={orientation}
            showTimeEstimate={showTimeEstimate}
            onClick={onStepClick}
          />
        ))}
      </div>
    </div>
  )
}

// Hook for easy step management
export const useProgressSteps = (initialSteps: ProgressStep[]) => {
  const [steps, setSteps] = useState<ProgressStep[]>(initialSteps)
  const [currentStepId, setCurrentStepId] = useState<string | undefined>()

  const updateStep = useCallback((stepId: string, updates: Partial<ProgressStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }, [])

  const nextStep = useCallback(() => {
    const currentIndex = currentStepId 
      ? steps.findIndex(step => step.id === currentStepId)
      : -1
    
    if (currentIndex < steps.length - 1) {
      const nextStepId = steps[currentIndex + 1].id
      setCurrentStepId(nextStepId)
      return nextStepId
    }
    
    return null
  }, [currentStepId, steps])

  const completeStep = useCallback((stepId: string) => {
    updateStep(stepId, { status: 'completed' })
  }, [updateStep])

  const errorStep = useCallback((stepId: string, errorCode?: AuthErrorCode) => {
    updateStep(stepId, { status: 'error', errorCode })
  }, [updateStep])

  const skipStep = useCallback((stepId: string) => {
    updateStep(stepId, { status: 'skipped' })
  }, [updateStep])

  const resetSteps = useCallback(() => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })))
    setCurrentStepId(undefined)
  }, [])

  const startProgress = useCallback(() => {
    if (steps.length > 0) {
      setCurrentStepId(steps[0].id)
      updateStep(steps[0].id, { status: 'in-progress' })
    }
  }, [steps, updateStep])

  return {
    steps,
    currentStepId,
    updateStep,
    nextStep,
    completeStep,
    errorStep,
    skipStep,
    resetSteps,
    startProgress,
    setCurrentStepId
  }
} 