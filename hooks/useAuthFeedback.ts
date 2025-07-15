"use client"

import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/toast'
import { useProgressSteps, ProgressStep, AuthOperationSteps } from '@/components/ui/progress-indicator'
import { useErrorHandling } from '@/hooks/useErrorHandling'
import { useAuthLogger } from '@/hooks/useAuthLogger'
import { AuthErrorCode, AuthErrorCategory } from '@/lib/types/errors'

// Feedback Types
export type AuthOperation = 'login' | 'logout' | 'tokenRefresh' | 'recovery' | 'custom'

export type FeedbackState = {
  isActive: boolean
  operation: AuthOperation | null
  showProgress: boolean
  showToast: boolean
  currentMessage: string | null
}

export interface AuthFeedbackOptions {
  showProgress?: boolean
  showToast?: boolean
  autoComplete?: boolean
  estimatedDuration?: number
  customSteps?: ProgressStep[]
  toastPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export interface AuthFeedbackCallbacks {
  onStart?: (operation: AuthOperation) => void
  onProgress?: (stepId: string, progress: number) => void
  onComplete?: (operation: AuthOperation) => void
  onError?: (error: Error, operation: AuthOperation) => void
  onRetry?: (operation: AuthOperation, attempt: number) => void
}

// Main Hook
export const useAuthFeedback = (
  options: AuthFeedbackOptions = {},
  callbacks: AuthFeedbackCallbacks = {}
) => {
  const {
    showProgress = true,
    showToast = true,
    autoComplete = true,
    estimatedDuration = 5000,
    customSteps,
    toastPosition = 'top-right'
  } = options

  const {
    onStart,
    onProgress,
    onComplete,
    onError,
    onRetry
  } = callbacks

  // Hooks dependencies
  const toast = useToast()
  const logger = useAuthLogger({ component: 'AuthFeedback' })
  const { executeWithErrorHandling } = useErrorHandling({ 
    component: 'AuthFeedback',
    operation: 'feedback'
  })

  // State
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    isActive: false,
    operation: null,
    showProgress: false,
    showToast: false,
    currentMessage: null
  })

  // Progress steps management
  const [currentSteps, setCurrentSteps] = useState<ProgressStep[]>([])
  const progressSteps = useProgressSteps(currentSteps)

  // Refs for tracking
  const operationRef = useRef<AuthOperation | null>(null)
  const startTimeRef = useRef<number>(0)
  const toastIdRef = useRef<string | null>(null)

  // Get operation steps
  const getOperationSteps = useCallback((operation: AuthOperation): ProgressStep[] => {
    if (customSteps) return customSteps

    switch (operation) {
      case 'login':
        return AuthOperationSteps.login.map(step => ({
          ...step,
          duration: estimatedDuration / AuthOperationSteps.login.length / 1000
        }))
      case 'logout':
        return AuthOperationSteps.logout.map(step => ({
          ...step,
          duration: estimatedDuration / AuthOperationSteps.logout.length / 1000
        }))
      case 'tokenRefresh':
        return AuthOperationSteps.tokenRefresh.map(step => ({
          ...step,
          duration: estimatedDuration / AuthOperationSteps.tokenRefresh.length / 1000
        }))
      case 'recovery':
        return AuthOperationSteps.recovery.map(step => ({
          ...step,
          duration: estimatedDuration / AuthOperationSteps.recovery.length / 1000
        }))
      case 'custom':
        return customSteps || []
      default:
        return []
    }
  }, [customSteps, estimatedDuration])

  // Start feedback
  const startFeedback = useCallback(async (
    operation: AuthOperation,
    message?: string
  ) => {
    const steps = getOperationSteps(operation)
    
    // Set up state
    setFeedbackState({
      isActive: true,
      operation,
      showProgress,
      showToast,
      currentMessage: message || getOperationMessage(operation, 'start')
    })

    setCurrentSteps(steps)
    progressSteps.resetSteps()
    
    operationRef.current = operation
    startTimeRef.current = Date.now()

    // Log start
    logger.info(`Starting ${operation} feedback`, {
      operation,
      showProgress,
      showToast,
      stepsCount: steps.length
    })

    // Show initial toast
    if (showToast) {
      toastIdRef.current = toast.showAuthLoading(
        feedbackState.currentMessage || 'Processando...'
      )
    }

    // Start progress
    if (showProgress && steps.length > 0) {
      progressSteps.startProgress()
    }

    // Callback
    onStart?.(operation)

    return { steps, progressSteps }
  }, [
    getOperationSteps,
    showProgress,
    showToast,
    toastPosition,
    progressSteps,
    logger,
    toast,
    feedbackState.currentMessage,
    onStart
  ])

  // Update progress
  const updateProgress = useCallback((
    stepId: string,
    status: ProgressStep['status'],
    message?: string,
    errorCode?: AuthErrorCode
  ) => {
    const currentOperation = operationRef.current
    if (!currentOperation || !feedbackState.isActive) return

    // Update step
    progressSteps.updateStep(stepId, { status, errorCode })

    // Update current message
    if (message) {
      setFeedbackState(prev => ({
        ...prev,
        currentMessage: message
      }))
    }

    // Calculate progress percentage
    const completedSteps = progressSteps.steps.filter(step => 
      step.status === 'completed' || step.status === 'skipped'
    ).length
    const totalSteps = progressSteps.steps.length
    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

    // Log progress
    logger.info(`Progress update for ${currentOperation}`, {
      stepId,
      status,
      progress: progressPercentage,
      errorCode
    })

    // Update loading toast with progress (remove old and create new)
    if (showToast && toastIdRef.current && status === 'in-progress') {
      toast.removeToast(toastIdRef.current)
      toastIdRef.current = toast.showAuthLoading(
        message || feedbackState.currentMessage || 'Processando...'
      )
    }

    // Callback
    onProgress?.(stepId, progressPercentage)

    // Handle step completion
    if (status === 'completed' && autoComplete) {
      const nextStepId = progressSteps.nextStep()
      if (nextStepId) {
        progressSteps.updateStep(nextStepId, { status: 'in-progress' })
      }
    }
  }, [
    feedbackState.isActive,
    feedbackState.currentMessage,
    progressSteps,
    showToast,
    autoComplete,
    logger,
    toast,
    onProgress
  ])

  // Complete feedback
  const completeFeedback = useCallback((
    successMessage?: string,
    data?: any
  ) => {
    const currentOperation = operationRef.current
    if (!currentOperation) return

    const duration = Date.now() - startTimeRef.current

    // Complete all remaining steps
    progressSteps.steps.forEach(step => {
      if (step.status === 'pending' || step.status === 'in-progress') {
        progressSteps.updateStep(step.id, { status: 'completed' })
      }
    })

    // Update state
    setFeedbackState({
      isActive: false,
      operation: null,
      showProgress: false,
      showToast: false,
      currentMessage: null
    })

    // Log completion
    logger.info(`Completed ${currentOperation} feedback`, {
      operation: currentOperation,
      duration,
      data
    })

    // Show success toast
    if (showToast) {
      // Remove loading toast first
      if (toastIdRef.current) {
        toast.removeToast(toastIdRef.current)
      }

      // Show success toast
      toast.showAuthSuccess(
        successMessage || getOperationMessage(currentOperation, 'success')
      )
    }

    // Cleanup
    operationRef.current = null
    toastIdRef.current = null

    // Callback
    onComplete?.(currentOperation)
  }, [
    progressSteps,
    showToast,
    toastPosition,
    logger,
    toast,
    onComplete
  ])

  // Error feedback
  const errorFeedback = useCallback((
    error: Error,
    stepId?: string,
    errorCode?: AuthErrorCode
  ) => {
    const currentOperation = operationRef.current
    if (!currentOperation) return

    const duration = Date.now() - startTimeRef.current

    // Update step with error
    if (stepId) {
      progressSteps.updateStep(stepId, { status: 'error', errorCode })
    }

    // Log error
    logger.error(`Error in ${currentOperation} feedback`, error, {
      operation: currentOperation,
      stepId,
      errorCode,
      duration
    })

    // Show error toast
    if (showToast) {
      // Remove loading toast first
      if (toastIdRef.current) {
        toast.removeToast(toastIdRef.current)
      }

      // Show error toast
      toast.showAuthError(error)
    }

    // Callback
    onError?.(error, currentOperation)
  }, [
    progressSteps,
    showToast,
    toastPosition,
    logger,
    toast,
    onError
  ])

  // Execute with feedback
  const executeWithFeedback = useCallback(async <T>(
    operation: AuthOperation,
    asyncFn: () => Promise<T>,
    options: {
      startMessage?: string
      successMessage?: string
      steps?: { [stepId: string]: string }
    } = {}
  ): Promise<T> => {
    const { startMessage, successMessage, steps: stepMessages = {} } = options

    try {
      // Start feedback
      const { steps } = await startFeedback(operation, startMessage)

      // Execute with error handling and progress updates
      const result = await executeWithErrorHandling(
        async () => {
          let currentStepIndex = 0

          // Auto-advance through steps during execution
          const stepInterval = setInterval(() => {
            if (currentStepIndex < steps.length) {
              const step = steps[currentStepIndex]
              updateProgress(
                step.id,
                'completed',
                stepMessages[step.id]
              )
              currentStepIndex++
            } else {
              clearInterval(stepInterval)
            }
          }, estimatedDuration / steps.length)

          try {
            const result = await asyncFn()
            clearInterval(stepInterval)
            return result
          } catch (error) {
            clearInterval(stepInterval)
            throw error
          }
        },
        operation
      )

      // Complete feedback
      completeFeedback(successMessage)
      return result!

    } catch (error) {
      // Error feedback
      errorFeedback(error as Error)
      throw error
    }
  }, [
    startFeedback,
    updateProgress,
    completeFeedback,
    errorFeedback,
    executeWithErrorHandling,
    estimatedDuration,
    logger,
    onRetry
  ])

  // Helper to get operation messages
  const getOperationMessage = (operation: AuthOperation, type: 'start' | 'success'): string => {
    const messages = {
      login: {
        start: 'Fazendo login...',
        success: 'Login realizado com sucesso!'
      },
      logout: {
        start: 'Fazendo logout...',
        success: 'Logout realizado com sucesso!'
      },
      tokenRefresh: {
        start: 'Renovando sessão...',
        success: 'Sessão renovada com sucesso!'
      },
      recovery: {
        start: 'Recuperando sistema...',
        success: 'Sistema recuperado com sucesso!'
      },
      custom: {
        start: 'Processando...',
        success: 'Operação concluída com sucesso!'
      }
    }

    return messages[operation]?.[type] || messages.custom[type]
  }

  // Manual control functions
  const stopFeedback = useCallback(() => {
    setFeedbackState({
      isActive: false,
      operation: null,
      showProgress: false,
      showToast: false,
      currentMessage: null
    })

    if (showToast && toastIdRef.current) {
      toast.removeToast(toastIdRef.current)
    }

    operationRef.current = null
    toastIdRef.current = null
  }, [showToast, toast])

  return {
    // State
    feedbackState,
    progressSteps: progressSteps.steps,
    currentStepId: progressSteps.currentStepId,

    // Main functions
    startFeedback,
    updateProgress,
    completeFeedback,
    errorFeedback,
    executeWithFeedback,
    stopFeedback,

    // Progress control
    nextStep: progressSteps.nextStep,
    completeStep: progressSteps.completeStep,
    errorStep: progressSteps.errorStep,
    skipStep: progressSteps.skipStep,
    resetSteps: progressSteps.resetSteps,

    // Utilities
    isActive: feedbackState.isActive,
    currentOperation: feedbackState.operation,
    currentMessage: feedbackState.currentMessage
  }
}

// Specialized hooks for common operations
export const useLoginFeedback = (options?: AuthFeedbackOptions, callbacks?: AuthFeedbackCallbacks) => {
  const feedback = useAuthFeedback(options, callbacks)

  const executeLogin = useCallback(async (
    loginFn: () => Promise<any>,
    credentials?: { email: string }
  ) => {
    return feedback.executeWithFeedback('login', loginFn, {
      startMessage: credentials?.email ? `Autenticando ${credentials.email}...` : 'Fazendo login...',
      successMessage: 'Login realizado com sucesso! Redirecionando...',
      steps: {
        validate: 'Validando credenciais fornecidas...',
        authenticate: 'Conectando ao servidor de autenticação...',
        token: 'Gerando token de acesso seguro...',
        permissions: 'Carregando permissões do usuário...',
        redirect: 'Redirecionando para área restrita...'
      }
    })
  }, [feedback])

  return {
    ...feedback,
    executeLogin
  }
}

export const useLogoutFeedback = (options?: AuthFeedbackOptions, callbacks?: AuthFeedbackCallbacks) => {
  const feedback = useAuthFeedback(options, callbacks)

  const executeLogout = useCallback(async (logoutFn: () => Promise<any>) => {
    return feedback.executeWithFeedback('logout', logoutFn, {
      startMessage: 'Fazendo logout...',
      successMessage: 'Logout realizado com sucesso!',
      steps: {
        cleanup: 'Removendo dados de sessão local...',
        invalidate: 'Invalidando token no servidor...',
        redirect: 'Redirecionando para página de login...'
      }
    })
  }, [feedback])

  return {
    ...feedback,
    executeLogout
  }
}

export const useTokenRefreshFeedback = (options?: AuthFeedbackOptions, callbacks?: AuthFeedbackCallbacks) => {
  const feedback = useAuthFeedback(options, callbacks)

  const executeTokenRefresh = useCallback(async (refreshFn: () => Promise<any>) => {
    return feedback.executeWithFeedback('tokenRefresh', refreshFn, {
      startMessage: 'Renovando sessão...',
      successMessage: 'Sessão renovada com sucesso!',
      steps: {
        validate: 'Verificando token atual...',
        refresh: 'Solicitando novo token...',
        update: 'Atualizando dados de sessão...'
      }
    })
  }, [feedback])

  return {
    ...feedback,
    executeTokenRefresh
  }
} 