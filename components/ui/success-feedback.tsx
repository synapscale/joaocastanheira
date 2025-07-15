'use client'

import React, { useEffect, useState } from 'react'
import { Check, CheckCircle2, UserCheck, Shield, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SuccessType = 
  | 'login' 
  | 'registration' 
  | 'password_reset' 
  | 'verification' 
  | 'profile_update'
  | 'general'

export type SuccessVariant = 'minimal' | 'standard' | 'celebration' | 'toast'

export interface SuccessFeedbackProps {
  type: SuccessType
  variant?: SuccessVariant
  message?: string
  description?: string
  autoHide?: boolean
  autoHideDelay?: number
  showProgress?: boolean
  onComplete?: () => void
  onDismiss?: () => void
  className?: string
}

const successConfig = {
  login: {
    icon: LogIn,
    title: 'Login realizado com sucesso!',
    description: 'Redirecionando para o painel...',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-100',
    duration: 2500
  },
  registration: {
    icon: UserCheck,
    title: 'Conta criada com sucesso!',
    description: 'Bem-vindo à plataforma!',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    duration: 3000
  },
  password_reset: {
    icon: Shield,
    title: 'Senha redefinida!',
    description: 'Sua senha foi alterada com sucesso.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    duration: 3000
  },
  verification: {
    icon: CheckCircle2,
    title: 'Verificação concluída!',
    description: 'Sua conta foi verificada com sucesso.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    duration: 3000
  },
  profile_update: {
    icon: Check,
    title: 'Perfil atualizado!',
    description: 'Suas informações foram salvas.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    iconBg: 'bg-teal-100',
    duration: 2500
  },
  general: {
    icon: Check,
    title: 'Operação concluída!',
    description: 'Ação realizada com sucesso.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-100',
    duration: 2500
  }
}

export function SuccessFeedback({
  type,
  variant = 'standard',
  message,
  description,
  autoHide = true,
  autoHideDelay,
  showProgress = true,
  onComplete,
  onDismiss,
  className
}: SuccessFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLeaving, setIsLeaving] = useState(false)

  const config = successConfig[type]
  const finalDelay = autoHideDelay || config.duration
  const IconComponent = config.icon

  useEffect(() => {
    // Animar entrada
    const showTimer = setTimeout(() => setIsVisible(true), 50)

    if (autoHide) {
      // Animar progresso
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (finalDelay / 100))
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 100)

      // Auto-hide
      const hideTimer = setTimeout(() => {
        setIsLeaving(true)
        setTimeout(() => {
          onComplete?.()
        }, 300) // Tempo da animação de saída
      }, finalDelay)

      return () => {
        clearTimeout(showTimer)
        clearInterval(progressTimer)
        clearTimeout(hideTimer)
      }
    }

    return () => clearTimeout(showTimer)
  }, [autoHide, finalDelay, onComplete])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onDismiss?.()
    }, 300)
  }

  if (variant === 'minimal') {
    return (
      <div className={cn(
        "flex items-center space-x-2 p-3 rounded-lg transition-all duration-300 ease-out",
        isVisible && !isLeaving ? "opacity-100 scale-100" : "opacity-0 scale-95",
        config.bgColor,
        config.borderColor,
        "border",
        className
      )}>
        <div className={cn(
          "flex-shrink-0 p-1 rounded-full transition-transform duration-500 ease-out",
          config.iconBg,
          isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"
        )}>
          <IconComponent className={cn("h-4 w-4", config.color)} />
        </div>
        <span className={cn("text-sm font-medium", config.color)}>
          {message || config.title}
        </span>
      </div>
    )
  }

  if (variant === 'toast') {
    return (
      <div className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border transition-all duration-300 ease-out",
        isVisible && !isLeaving 
          ? "opacity-100 translate-x-0 scale-100" 
          : "opacity-0 translate-x-full scale-95",
        className
      )}>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className={cn(
              "flex-shrink-0 p-2 rounded-full transition-all duration-500 ease-out",
              config.iconBg,
              isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"
            )}>
              <IconComponent className={cn("h-5 w-5", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {message || config.title}
              </p>
              {(description || config.description) && (
                <p className="text-sm text-gray-600 mt-1">
                  {description || config.description}
                </p>
              )}
            </div>
            {onDismiss && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {showProgress && autoHide && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
              <div 
                className={cn("h-1 rounded-full transition-all duration-100 ease-linear", 
                  config.color.replace('text-', 'bg-'))}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'celebration') {
    return (
      <div className={cn(
        "relative overflow-hidden bg-white rounded-xl shadow-xl border transition-all duration-500 ease-out transform",
        isVisible && !isLeaving 
          ? "opacity-100 scale-100 translate-y-0" 
          : "opacity-0 scale-95 translate-y-4",
        className
      )}>
        {/* Efeito de confete de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 rounded-full animate-bounce opacity-60",
                i % 4 === 0 ? "bg-green-400" : 
                i % 4 === 1 ? "bg-blue-400" : 
                i % 4 === 2 ? "bg-yellow-400" : "bg-purple-400"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative p-6 text-center">
          <div className={cn(
            "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-700 ease-out",
            config.iconBg,
            isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"
          )}>
            <IconComponent className={cn("h-8 w-8", config.color)} />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {message || config.title}
          </h3>
          
          {(description || config.description) && (
            <p className="text-gray-600 mb-4">
              {description || config.description}
            </p>
          )}

          {showProgress && autoHide && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={cn("h-2 rounded-full transition-all duration-100 ease-linear", 
                  config.color.replace('text-', 'bg-'))}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Standard variant
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all duration-300 ease-out",
      isVisible && !isLeaving ? "opacity-100 scale-100" : "opacity-0 scale-95",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start space-x-3">
        <div className={cn(
          "flex-shrink-0 p-2 rounded-full transition-all duration-500 ease-out",
          config.iconBg,
          isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"
        )}>
          <IconComponent className={cn("h-5 w-5", config.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-semibold", config.color)}>
            {message || config.title}
          </h4>
          {(description || config.description) && (
            <p className="text-sm text-gray-600 mt-1">
              {description || config.description}
            </p>
          )}

          {showProgress && autoHide && (
            <div className="mt-3 w-full bg-white/50 rounded-full h-1.5">
              <div 
                className={cn("h-1.5 rounded-full transition-all duration-100 ease-linear", 
                  config.color.replace('text-', 'bg-'))}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Hook para usar facilmente o SuccessFeedback
export function useSuccessFeedback() {
  const [feedback, setFeedback] = useState<{
    type: SuccessType
    variant?: SuccessVariant
    message?: string
    description?: string
    autoHide?: boolean
    autoHideDelay?: number
    showProgress?: boolean
  } | null>(null)

  const showSuccess = (config: Parameters<typeof SuccessFeedback>[0]) => {
    setFeedback(config)
  }

  const hideSuccess = () => {
    setFeedback(null)
  }

  const SuccessFeedbackComponent = feedback ? (
    <SuccessFeedback
      {...feedback}
      onComplete={hideSuccess}
      onDismiss={hideSuccess}
    />
  ) : null

  return {
    showSuccess,
    hideSuccess,
    SuccessFeedbackComponent,
    isShowing: !!feedback
  }
}

export default SuccessFeedback 