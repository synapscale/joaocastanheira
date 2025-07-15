'use client'

import React from 'react'
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock, Shield } from 'lucide-react'

export interface LoadingFeedbackProps {
  isLoading: boolean
  error?: Error | string | null
  success?: boolean
  message?: string
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'inline' | 'overlay' | 'modal'
  showSpinner?: boolean
  showProgress?: boolean
  progress?: number
  className?: string
  onRetry?: () => void
  onDismiss?: () => void
  autoHideSuccess?: boolean
  autoHideDelay?: number
  operation?: 'login' | 'logout' | 'token_refresh' | 'token_save' | 'generic'
}

interface OperationConfig {
  icon: React.ComponentType<{ className?: string }>
  loadingMessage: string
  successMessage: string
  color: string
  bgColor: string
}

const OPERATION_CONFIGS: Record<string, OperationConfig> = {
  login: {
    icon: Shield,
    loadingMessage: 'Fazendo login...',
    successMessage: 'Login realizado com sucesso!',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  logout: {
    icon: Shield,
    loadingMessage: 'Fazendo logout...',
    successMessage: 'Logout realizado com sucesso!',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  token_refresh: {
    icon: Clock,
    loadingMessage: 'Renovando sessão...',
    successMessage: 'Sessão renovada com sucesso!',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  token_save: {
    icon: Shield,
    loadingMessage: 'Salvando credenciais...',
    successMessage: 'Credenciais salvas com sucesso!',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  generic: {
    icon: Loader2,
    loadingMessage: 'Processando...',
    successMessage: 'Operação realizada com sucesso!',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  }
}

export function LoadingFeedback({
  isLoading,
  error,
  success,
  message,
  loadingMessage,
  successMessage,
  errorMessage,
  size = 'md',
  variant = 'inline',
  showSpinner = true,
  showProgress = false,
  progress = 0,
  className = '',
  onRetry,
  onDismiss,
  autoHideSuccess = true,
  autoHideDelay = 3000,
  operation = 'generic'
}: LoadingFeedbackProps) {
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(true)

  const operationConfig = OPERATION_CONFIGS[operation]

  // Handle success state auto-hide
  React.useEffect(() => {
    if (success && autoHideSuccess) {
      setShowSuccessMessage(true)
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
        setIsVisible(false)
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [success, autoHideSuccess, autoHideDelay])

  // Don't render if not visible or no active state
  if (!isVisible || (!isLoading && !error && !success && !showSuccessMessage)) {
    return null
  }

  // Determine current state
  const getCurrentState = () => {
    if (isLoading) return 'loading'
    if (error) return 'error'
    if (success || showSuccessMessage) return 'success'
    return 'idle'
  }

  const currentState = getCurrentState()

  // Size configurations
  const sizes = {
    sm: {
      container: 'p-3',
      icon: 'w-4 h-4',
      text: 'text-sm',
      button: 'px-2 py-1 text-xs'
    },
    md: {
      container: 'p-4',
      icon: 'w-5 h-5',
      text: 'text-base',
      button: 'px-3 py-1.5 text-sm'
    },
    lg: {
      container: 'p-6',
      icon: 'w-6 h-6',
      text: 'text-lg',
      button: 'px-4 py-2 text-base'
    }
  }

  const currentSize = sizes[size]

  // Variant styles
  const variantStyles = {
    inline: 'border rounded-lg',
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    modal: 'rounded-lg shadow-lg max-w-md w-full mx-4'
  }

  // State-specific configurations
  const getStateConfig = () => {
    switch (currentState) {
      case 'loading':
        return {
          icon: showSpinner ? Loader2 : operationConfig.icon,
          iconColor: operationConfig.color,
          bgColor: operationConfig.bgColor,
          message: message || loadingMessage || operationConfig.loadingMessage,
          shouldSpin: showSpinner,
          showRetry: false,
          showDismiss: false
        }
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          message: message || successMessage || operationConfig.successMessage,
          shouldSpin: false,
          showRetry: false,
          showDismiss: !!onDismiss
        }
      case 'error':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          message: message || errorMessage || (typeof error === 'string' ? error : 'Ocorreu um erro'),
          shouldSpin: false,
          showRetry: !!onRetry,
          showDismiss: !!onDismiss
        }
      default:
        return {
          icon: AlertCircle,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          message: message || 'Aguardando...',
          shouldSpin: false,
          showRetry: false,
          showDismiss: false
        }
    }
  }

  const stateConfig = getStateConfig()
  const Icon = stateConfig.icon

  // Progress bar component
  const ProgressBar = () => {
    if (!showProgress || currentState !== 'loading') return null

    return (
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    )
  }

  // Main content
  const Content = () => (
    <div className={`${stateConfig.bgColor} ${currentSize.container} ${variant !== 'overlay' ? variantStyles[variant] : ''} ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${stateConfig.iconColor}`}>
          <Icon 
            className={`${currentSize.icon} ${stateConfig.shouldSpin ? 'animate-spin' : ''}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Message */}
          <p className={`${currentSize.text} font-medium ${stateConfig.iconColor}`}>
            {stateConfig.message}
          </p>

          {/* Progress bar */}
          <ProgressBar />

          {/* Action buttons */}
          {(stateConfig.showRetry || stateConfig.showDismiss) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {stateConfig.showRetry && (
                <button
                  onClick={onRetry}
                  className={`${currentSize.button} bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                >
                  Tentar novamente
                </button>
              )}

              {stateConfig.showDismiss && (
                <button
                  onClick={onDismiss}
                  className={`${currentSize.button} text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  Fechar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Render based on variant
  if (variant === 'overlay') {
    return (
      <div className={variantStyles.overlay}>
        <div className={`${variantStyles.modal} ${stateConfig.bgColor} ${currentSize.container}`}>
          <Content />
        </div>
      </div>
    )
  }

  return <Content />
}

// Hook for managing loading states
export function useLoadingState(initialState: boolean = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [error, setError] = React.useState<Error | string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const startLoading = React.useCallback(() => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
  }, [])

  const stopLoading = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  const setLoadingError = React.useCallback((error: Error | string) => {
    setIsLoading(false)
    setError(error)
    setSuccess(false)
  }, [])

  const setLoadingSuccess = React.useCallback(() => {
    setIsLoading(false)
    setError(null)
    setSuccess(true)
  }, [])

  const reset = React.useCallback(() => {
    setIsLoading(false)
    setError(null)
    setSuccess(false)
  }, [])

  return {
    isLoading,
    error,
    success,
    startLoading,
    stopLoading,
    setLoadingError,
    setLoadingSuccess,
    reset
  }
}

// Higher-order component for automatic loading state management
export function withLoadingFeedback<T extends object>(
  Component: React.ComponentType<T>,
  loadingProps?: Partial<LoadingFeedbackProps>
) {
  return function LoadingWrappedComponent(props: T & { 
    isLoading?: boolean
    error?: Error | string | null
    success?: boolean
  }) {
    const { isLoading = false, error = null, success = false, ...componentProps } = props

    return (
      <div className="relative">
        <Component {...(componentProps as T)} />
        <LoadingFeedback
          isLoading={isLoading}
          error={error}
          success={success}
          {...loadingProps}
        />
      </div>
    )
  }
}

export default LoadingFeedback 