"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthErrorCategory, AuthErrorCode } from '@/lib/types/errors'

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
export type ToastDuration = number | 'persistent'

export interface ToastData {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: ToastDuration
  action?: {
    label: string
    onClick: () => void
  }
  errorCode?: AuthErrorCode
  errorCategory?: AuthErrorCategory
  onClose?: () => void
}

// Toast Context
interface ToastContextType {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => string
  removeToast: (id: string) => void
  clearAllToasts: () => void
  showAuthError: (error: any, action?: ToastData['action']) => string
  showAuthSuccess: (message: string, description?: string) => string
  showAuthLoading: (message: string, description?: string) => string
}

const ToastContext = createContext<ToastContextType | null>(null)

// Toast Hook
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}


// Toast Icons
const getToastIcon = (type: ToastType) => {
  const iconClass = "w-5 h-5 flex-shrink-0"
  
  switch (type) {
    case 'success':
      return <CheckCircle className={cn(iconClass, "text-green-600")} />
    case 'error':
      return <AlertCircle className={cn(iconClass, "text-red-600")} />
    case 'warning':
      return <AlertTriangle className={cn(iconClass, "text-yellow-600")} />
    case 'info':
      return <Info className={cn(iconClass, "text-blue-600")} />
    case 'loading':
      return <Loader2 className={cn(iconClass, "text-blue-600 animate-spin")} />
    default:
      return <Info className={cn(iconClass, "text-gray-600")} />
  }
}

// Toast Styling
const getToastStyles = (type: ToastType) => {
  const baseClasses = "relative w-full max-w-sm p-4 mb-3 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ease-in-out"
  
  switch (type) {
    case 'success':
      return cn(baseClasses, "bg-green-50/90 border-green-200 text-green-900")
    case 'error':
      return cn(baseClasses, "bg-red-50/90 border-red-200 text-red-900")
    case 'warning':
      return cn(baseClasses, "bg-yellow-50/90 border-yellow-200 text-yellow-900")
    case 'info':
      return cn(baseClasses, "bg-blue-50/90 border-blue-200 text-blue-900")
    case 'loading':
      return cn(baseClasses, "bg-blue-50/90 border-blue-200 text-blue-900")
    default:
      return cn(baseClasses, "bg-gray-50/90 border-gray-200 text-gray-900")
  }
}

// Auth Error Messages Mapping
const getAuthErrorMessage = (errorCode: AuthErrorCode): { title: string; description: string } => {
  const messages: Record<AuthErrorCode, { title: string; description: string }> = {
    // Network errors
    [AuthErrorCode.NETWORK_CONNECTION_FAILED]: {
      title: "Falha na conexão",
      description: "Não foi possível conectar ao servidor. Verifique sua internet."
    },
    [AuthErrorCode.NETWORK_TIMEOUT]: {
      title: "Tempo limite excedido",
      description: "A conexão demorou muito para responder. Tente novamente."
    },
    [AuthErrorCode.NETWORK_OFFLINE]: {
      title: "Sem conexão",
      description: "Verifique sua conexão com a internet e tente novamente."
    },
    
    // Validation errors
    [AuthErrorCode.VALIDATION_INVALID_EMAIL]: {
      title: "Email inválido",
      description: "Insira um endereço de email válido."
    },
    [AuthErrorCode.VALIDATION_INVALID_PASSWORD]: {
      title: "Senha inválida",
      description: "A senha fornecida não atende aos critérios."
    },
    [AuthErrorCode.VALIDATION_MISSING_FIELDS]: {
      title: "Campos obrigatórios",
      description: "Preencha todos os campos obrigatórios."
    },
    [AuthErrorCode.VALIDATION_PASSWORD_TOO_SHORT]: {
      title: "Senha muito curta",
      description: "A senha deve ter pelo menos 8 caracteres."
    },
    
    // Server errors
    [AuthErrorCode.SERVER_INTERNAL_ERROR]: {
      title: "Erro do servidor",
      description: "Nossos servidores estão com problemas. Tente novamente em alguns minutos."
    },
    [AuthErrorCode.SERVER_UNAVAILABLE]: {
      title: "Servidor indisponível",
      description: "O servidor está temporariamente indisponível."
    },
    [AuthErrorCode.SERVER_RATE_LIMITED]: {
      title: "Limite de requisições",
      description: "Você excedeu o limite de tentativas. Aguarde um momento."
    },
    [AuthErrorCode.SERVER_MAINTENANCE]: {
      title: "Manutenção do servidor",
      description: "O sistema está em manutenção. Tente novamente mais tarde."
    },
    
    // Token errors
    [AuthErrorCode.TOKEN_EXPIRED]: {
      title: "Sessão expirada",
      description: "Sua sessão expirou. Faça login novamente."
    },
    [AuthErrorCode.TOKEN_INVALID]: {
      title: "Token inválido",
      description: "Sua sessão é inválida. Faça login novamente."
    },
    [AuthErrorCode.TOKEN_MALFORMED]: {
      title: "Token malformado",
      description: "O token de autenticação está corrompido. Faça login novamente."
    },
    [AuthErrorCode.TOKEN_MISSING]: {
      title: "Token ausente",
      description: "Token de autenticação não encontrado. Faça login novamente."
    },
    [AuthErrorCode.TOKEN_SAVE_FAILED]: {
      title: "Erro ao salvar token",
      description: "Problema interno ao salvar credenciais. Tente novamente."
    },
    [AuthErrorCode.TOKEN_REFRESH_FAILED]: {
      title: "Falha ao renovar token",
      description: "Não foi possível renovar sua sessão. Faça login novamente."
    },
    
    // Authentication errors
    [AuthErrorCode.AUTH_INVALID_CREDENTIALS]: {
      title: "Credenciais inválidas",
      description: "Email ou senha incorretos. Verifique e tente novamente."
    },
    [AuthErrorCode.AUTH_ACCOUNT_LOCKED]: {
      title: "Conta bloqueada",
      description: "Sua conta foi temporariamente bloqueada. Contate o suporte."
    },
    [AuthErrorCode.AUTH_ACCOUNT_DISABLED]: {
      title: "Conta desabilitada",
      description: "Sua conta foi desabilitada. Contate o suporte para mais informações."
    },
    [AuthErrorCode.AUTH_LOGIN_FAILED]: {
      title: "Falha no login",
      description: "Não foi possível fazer login. Tente novamente."
    },
    [AuthErrorCode.AUTH_LOGOUT_FAILED]: {
      title: "Falha no logout",
      description: "Não foi possível sair da conta. Tente novamente."
    },
    [AuthErrorCode.AUTH_SESSION_EXPIRED]: {
      title: "Sessão expirada",
      description: "Sua sessão expirou. Faça login novamente."
    },
    
    // Authorization errors
    [AuthErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: {
      title: "Permissões insuficientes",
      description: "Sua conta não tem as permissões necessárias."
    },
    [AuthErrorCode.AUTH_FORBIDDEN]: {
      title: "Acesso negado",
      description: "Você não tem permissão para acessar este recurso."
    },
    [AuthErrorCode.AUTH_UNAUTHORIZED]: {
      title: "Não autorizado",
      description: "Você precisa fazer login para acessar este recurso."
    },
    
    // Internal errors
    [AuthErrorCode.INTERNAL_STATE_CORRUPTION]: {
      title: "Estado corrompido",
      description: "Dados internos foram corrompidos. Recarregue a página."
    },
    [AuthErrorCode.INTERNAL_RACE_CONDITION]: {
      title: "Conflito de operações",
      description: "Múltiplas operações simultâneas detectadas. Aguarde e tente novamente."
    },
    [AuthErrorCode.INTERNAL_UNEXPECTED_ERROR]: {
      title: "Erro inesperado",
      description: "Ocorreu um erro interno inesperado. Recarregue a página."
    },
    
    // Unknown errors
    [AuthErrorCode.UNKNOWN_ERROR]: {
      title: "Erro desconhecido",
      description: "Ocorreu um erro inesperado. Tente novamente."
    }
  }

  return messages[errorCode] || messages[AuthErrorCode.UNKNOWN_ERROR]
}

// Single Toast Component
interface ToastProps {
  toast: ToastData
  onClose: (id: string) => void
  position: ToastPosition
}

const Toast: React.FC<ToastProps> = ({ toast, onClose, position }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (toast.duration !== 'persistent' && typeof toast.duration === 'number') {
      const timer = setTimeout(() => {
        handleClose()
      }, toast.duration)
      
      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(toast.id)
      toast.onClose?.()
    }, 200)
  }, [toast.id, onClose, toast.onClose])

  const animationClasses = cn(
    "transform transition-all duration-300 ease-in-out",
    {
      // Entry animations - slide from outside
      "translate-x-full opacity-0": !isVisible && position.includes('right'),
      "-translate-x-full opacity-0": !isVisible && position.includes('left'),
      "translate-y-full opacity-0": !isVisible && position.includes('bottom'),
      "-translate-y-full opacity-0": !isVisible && position.includes('top'),
      
      // Visible state - center position with full opacity
      "translate-x-0 translate-y-0 opacity-100": isVisible && !isExiting,
      
      // Exit animations
      "scale-95 opacity-0": isExiting,
    }
  )

  return (
    <div className={cn(getToastStyles(toast.type), animationClasses)}>
      <div className="flex items-start space-x-3">
        {getToastIcon(toast.type)}
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">
            {toast.title}
          </div>
          
          {toast.description && (
            <div className="text-sm opacity-90 mt-1">
              {toast.description}
            </div>
          )}
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        {toast.duration !== 'persistent' && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Progress bar for timed toasts */}
      {toast.duration !== 'persistent' && typeof toast.duration === 'number' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-current opacity-50 animate-progress"
            style={{
              animationDuration: `${toast.duration}ms`,
              animationTimingFunction: 'linear'
            }}
          />
        </div>
      )}
    </div>
  )
}

// Toast Container Component
interface ToastContainerProps {
  position?: ToastPosition
  maxToasts?: number
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  position = 'top-right',
  maxToasts = 5 
}) => {
  const { toasts, removeToast } = useToast()
  
  const containerClasses = cn(
    "fixed z-50 p-4 pointer-events-none",
    {
      "top-4 right-4": position === 'top-right',
      "top-4 left-4": position === 'top-left',
      "bottom-4 right-4": position === 'bottom-right',
      "bottom-4 left-4": position === 'bottom-left',
      "top-4 left-1/2 transform -translate-x-1/2": position === 'top-center',
      "bottom-4 left-1/2 transform -translate-x-1/2": position === 'bottom-center',
    }
  )

  const visibleToasts = toasts.slice(0, maxToasts)

  return (
    <div className={containerClasses}>
      <div className="space-y-2 pointer-events-auto">
        {visibleToasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={removeToast}
            position={position}
          />
        ))}
      </div>
    </div>
  )
}

// Toast Provider Component
interface ToastProviderProps {
  children: React.ReactNode
  position?: ToastPosition
  maxToasts?: number
  defaultDuration?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((toastData: Omit<ToastData, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const toast: ToastData = {
      ...toastData,
      id,
      duration: toastData.duration ?? defaultDuration
    }
    
    setToasts(prev => [toast, ...prev])
    return id
  }, [defaultDuration])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const showAuthError = useCallback((error: any, action?: ToastData['action']): string => {
    let title = "Erro de autenticação"
    let description = "Ocorreu um erro durante a autenticação"
    let errorCode: AuthErrorCode | undefined
    let errorCategory: AuthErrorCategory | undefined

    // Extract error information
    if (error?.code && error?.category) {
      errorCode = error.code
      errorCategory = error.category
      const errorMessage = getAuthErrorMessage(error.code)
      title = errorMessage.title
      description = errorMessage.description
    } else if (error?.message) {
      description = error.message
    } else if (typeof error === 'string') {
      description = error
    }

    return addToast({
      type: 'error',
      title,
      description,
      action,
      errorCode,
      errorCategory,
      duration: 7000 // Longer duration for errors
    })
  }, [addToast])

  const showAuthSuccess = useCallback((message: string, description?: string): string => {
    return addToast({
      type: 'success',
      title: message,
      description,
      duration: 4000
    })
  }, [addToast])

  const showAuthLoading = useCallback((message: string, description?: string): string => {
    return addToast({
      type: 'loading',
      title: message,
      description,
      duration: 'persistent'
    })
  }, [addToast])

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showAuthError,
    showAuthSuccess,
    showAuthLoading
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position} maxToasts={maxToasts} />
    </ToastContext.Provider>
  )
}

// Export everything
export { ToastContainer }
