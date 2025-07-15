'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock, Shield, User, Settings } from 'lucide-react'
import { AuthError, AuthErrorCategory, AuthErrorCode } from '../../lib/types/errors'

export interface ErrorDisplayProps {
  error: AuthError | Error | string | null
  title?: string
  showDetails?: boolean
  showRetryButton?: boolean
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: 'inline' | 'modal' | 'toast'
  size?: 'sm' | 'md' | 'lg'
}

interface ErrorIconConfig {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

// Icon mapping for different error categories
const ERROR_ICONS: Record<AuthErrorCategory, ErrorIconConfig> = {
  [AuthErrorCategory.NETWORK]: {
    icon: WifiOff,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  [AuthErrorCategory.VALIDATION]: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  [AuthErrorCategory.SERVER]: {
    icon: Settings,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  [AuthErrorCategory.TOKEN]: {
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  [AuthErrorCategory.AUTHENTICATION]: {
    icon: User,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  [AuthErrorCategory.AUTHORIZATION]: {
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  [AuthErrorCategory.INTERNAL]: {
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  [AuthErrorCategory.UNKNOWN]: {
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
}

// Extended user-friendly messages with more context
const USER_FRIENDLY_MESSAGES: Record<AuthErrorCode, {
  title: string
  message: string
  actions: string[]
  severity: 'low' | 'medium' | 'high'
  autoRetryable: boolean
}> = {
  // Network errors
  [AuthErrorCode.NETWORK_CONNECTION_FAILED]: {
    title: 'Problema de Conexão',
    message: 'Não foi possível conectar aos nossos servidores. Verifique sua conexão com a internet.',
    actions: ['Verifique se está conectado à internet', 'Tente novamente em alguns segundos'],
    severity: 'medium',
    autoRetryable: true
  },
  [AuthErrorCode.NETWORK_TIMEOUT]: {
    title: 'Conexão Lenta',
    message: 'A operação está demorando mais que o esperado.',
    actions: ['Aguarde alguns segundos', 'Verifique sua conexão', 'Tente novamente'],
    severity: 'medium',
    autoRetryable: true
  },
  [AuthErrorCode.NETWORK_OFFLINE]: {
    title: 'Sem Conexão',
    message: 'Você parece estar offline. Conecte-se à internet para continuar.',
    actions: ['Conecte-se a uma rede Wi-Fi ou dados móveis', 'Verifique suas configurações de rede'],
    severity: 'high',
    autoRetryable: false
  },

  // Validation errors
  [AuthErrorCode.VALIDATION_INVALID_EMAIL]: {
    title: 'Email Inválido',
    message: 'O endereço de email inserido não está em um formato válido.',
    actions: ['Verifique se o email está digitado corretamente', 'Use o formato: exemplo@email.com'],
    severity: 'low',
    autoRetryable: false
  },
  [AuthErrorCode.VALIDATION_INVALID_PASSWORD]: {
    title: 'Senha Inválida',
    message: 'A senha inserida não atende aos requisitos de segurança.',
    actions: ['Verifique os requisitos de senha', 'Use pelo menos 8 caracteres'],
    severity: 'low',
    autoRetryable: false
  },
  [AuthErrorCode.VALIDATION_MISSING_FIELDS]: {
    title: 'Campos Obrigatórios',
    message: 'Alguns campos obrigatórios não foram preenchidos.',
    actions: ['Preencha todos os campos marcados como obrigatórios', 'Verifique se não há campos em branco'],
    severity: 'low',
    autoRetryable: false
  },
  [AuthErrorCode.VALIDATION_PASSWORD_TOO_SHORT]: {
    title: 'Senha Muito Curta',
    message: 'A senha deve ter pelo menos 8 caracteres.',
    actions: ['Use uma senha com pelo menos 8 caracteres', 'Combine letras, números e símbolos'],
    severity: 'low',
    autoRetryable: false
  },

  // Server errors
  [AuthErrorCode.SERVER_INTERNAL_ERROR]: {
    title: 'Erro do Servidor',
    message: 'Ocorreu um problema temporário em nossos servidores.',
    actions: ['Aguarde alguns minutos e tente novamente', 'Se persistir, entre em contato conosco'],
    severity: 'medium',
    autoRetryable: true
  },
  [AuthErrorCode.SERVER_UNAVAILABLE]: {
    title: 'Serviço Indisponível',
    message: 'Nossos serviços estão temporariamente indisponíveis.',
    actions: ['Tente novamente em alguns minutos', 'Verifique nossas redes sociais para atualizações'],
    severity: 'high',
    autoRetryable: true
  },
  [AuthErrorCode.SERVER_RATE_LIMITED]: {
    title: 'Muitas Tentativas',
    message: 'Você fez muitas tentativas em pouco tempo. Aguarde antes de tentar novamente.',
    actions: ['Aguarde alguns minutos', 'Evite múltiplas tentativas seguidas'],
    severity: 'medium',
    autoRetryable: false
  },
  [AuthErrorCode.SERVER_MAINTENANCE]: {
    title: 'Manutenção do Sistema',
    message: 'Estamos realizando manutenção no sistema. Voltaremos em breve.',
    actions: ['Aguarde o fim da manutenção', 'Acompanhe nossas atualizações'],
    severity: 'high',
    autoRetryable: false
  },

  // Token errors
  [AuthErrorCode.TOKEN_EXPIRED]: {
    title: 'Sessão Expirada',
    message: 'Sua sessão expirou por motivos de segurança.',
    actions: ['Faça login novamente', 'Suas informações estão seguras'],
    severity: 'medium',
    autoRetryable: false
  },
  [AuthErrorCode.TOKEN_INVALID]: {
    title: 'Problema de Autenticação',
    message: 'Houve um problema com sua autenticação.',
    actions: ['Faça login novamente', 'Limpe o cache se o problema persistir'],
    severity: 'medium',
    autoRetryable: false
  },
  [AuthErrorCode.TOKEN_MALFORMED]: {
    title: 'Erro de Autenticação',
    message: 'Informações de autenticação corrompidas.',
    actions: ['Faça login novamente', 'Entre em contato se o problema persistir'],
    severity: 'medium',
    autoRetryable: false
  },
  [AuthErrorCode.TOKEN_MISSING]: {
    title: 'Login Necessário',
    message: 'Você precisa fazer login para acessar esta área.',
    actions: ['Clique em "Entrar" para fazer login', 'Verifique se os cookies estão habilitados'],
    severity: 'medium',
    autoRetryable: false
  },
  [AuthErrorCode.TOKEN_SAVE_FAILED]: {
    title: 'Erro ao Salvar Credenciais',
    message: 'Não foi possível salvar suas credenciais de login.',
    actions: ['Verifique se os cookies estão habilitados', 'Limpe o cache do navegador', 'Tente novamente'],
    severity: 'medium',
    autoRetryable: true
  },
  [AuthErrorCode.TOKEN_REFRESH_FAILED]: {
    title: 'Erro ao Renovar Sessão',
    message: 'Não foi possível renovar sua sessão automaticamente.',
    actions: ['Faça login novamente', 'Suas informações estão seguras'],
    severity: 'medium',
    autoRetryable: false
  },

  // Authentication errors
  [AuthErrorCode.AUTH_INVALID_CREDENTIALS]: {
    title: 'Email ou Senha Incorretos',
    message: 'As credenciais inseridas não conferem com nossos registros.',
    actions: ['Verifique seu email e senha', 'Use "Esqueci minha senha" se necessário'],
    severity: 'low',
    autoRetryable: false
  },
  [AuthErrorCode.AUTH_ACCOUNT_LOCKED]: {
    title: 'Conta Bloqueada',
    message: 'Sua conta foi temporariamente bloqueada por segurança.',
    actions: ['Entre em contato com o suporte', 'Verifique seu email para instruções'],
    severity: 'high',
    autoRetryable: false
  },
  [AuthErrorCode.AUTH_ACCOUNT_DISABLED]: {
    title: 'Conta Desabilitada',
    message: 'Sua conta está desabilitada.',
    actions: ['Entre em contato com o suporte', 'Verifique se há emails sobre sua conta'],
    severity: 'high',
    autoRetryable: false
  },
  [AuthErrorCode.AUTH_LOGIN_FAILED]: {
    title: 'Falha no Login',
    message: 'Não foi possível completar o login.',
    actions: ['Verifique suas credenciais', 'Tente novamente em alguns segundos'],
    severity: 'medium',
    autoRetryable: true
  },
  [AuthErrorCode.AUTH_LOGOUT_FAILED]: {
    title: 'Erro ao Sair',
    message: 'Houve um problema ao fazer logout.',
    actions: ['Tente novamente', 'Feche o navegador se necessário'],
    severity: 'low',
    autoRetryable: true
  },
  [AuthErrorCode.AUTH_SESSION_EXPIRED]: {
    title: 'Sessão Expirada',
    message: 'Sua sessão expirou. Faça login novamente para continuar.',
    actions: ['Clique em "Entrar" para fazer novo login', 'Suas informações estão seguras'],
    severity: 'medium',
    autoRetryable: false
  },

  // Authorization errors
  [AuthErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: {
    title: 'Acesso Negado',
    message: 'Você não tem permissão para acessar este recurso.',
    actions: ['Entre em contato com o administrador', 'Verifique se está na conta correta'],
    severity: 'medium',
    autoRetryable: false
  },
  [AuthErrorCode.AUTH_FORBIDDEN]: {
    title: 'Acesso Proibido',
    message: 'O acesso a este recurso foi negado.',
    actions: ['Verifique suas permissões', 'Entre em contato com o suporte se necessário'],
    severity: 'medium',
    autoRetryable: false
  },
  [AuthErrorCode.AUTH_UNAUTHORIZED]: {
    title: 'Não Autorizado',
    message: 'Você precisa fazer login para acessar este recurso.',
    actions: ['Faça login novamente', 'Verifique se está na conta correta'],
    severity: 'medium',
    autoRetryable: false
  },

  // Internal errors
  [AuthErrorCode.INTERNAL_STATE_CORRUPTION]: {
    title: 'Erro Interno',
    message: 'Ocorreu um problema interno. Recarregue a página.',
    actions: ['Recarregue a página (F5)', 'Limpe o cache se necessário'],
    severity: 'medium',
    autoRetryable: true
  },
  [AuthErrorCode.INTERNAL_RACE_CONDITION]: {
    title: 'Erro Temporário',
    message: 'Ocorreu um erro temporário. Tente novamente.',
    actions: ['Aguarde alguns segundos', 'Tente a operação novamente'],
    severity: 'low',
    autoRetryable: true
  },
  [AuthErrorCode.INTERNAL_UNEXPECTED_ERROR]: {
    title: 'Erro Inesperado',
    message: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
    actions: ['Tente novamente', 'Entre em contato se o problema persistir'],
    severity: 'medium',
    autoRetryable: true
  },

  // Unknown errors
  [AuthErrorCode.UNKNOWN_ERROR]: {
    title: 'Erro Desconhecido',
    message: 'Ocorreu um erro que não conseguimos identificar.',
    actions: ['Tente novamente', 'Recarregue a página se necessário', 'Entre em contato conosco'],
    severity: 'medium',
    autoRetryable: true
  }
}

export function ErrorDisplay({
  error,
  title,
  showDetails = false,
  showRetryButton = true,
  onRetry,
  onDismiss,
  className = '',
  variant = 'inline',
  size = 'md'
}: ErrorDisplayProps) {
  if (!error) return null

  // Extract error information
  const getErrorInfo = () => {
    if (error instanceof AuthError) {
      const friendlyMessage = USER_FRIENDLY_MESSAGES[error.code]
      const iconConfig = ERROR_ICONS[error.category]
      
      return {
        title: title || friendlyMessage?.title || 'Erro',
        message: friendlyMessage?.message || error.userMessage || 'Ocorreu um erro inesperado',
        actions: friendlyMessage?.actions || [],
        severity: friendlyMessage?.severity || 'medium',
        autoRetryable: friendlyMessage?.autoRetryable || false,
        icon: iconConfig?.icon || AlertCircle,
        iconColor: iconConfig?.color || 'text-red-600',
        bgColor: iconConfig?.bgColor || 'bg-red-50',
        category: error.category,
        code: error.code,
        recoverable: error.recoverable,
        retryable: error.retryable,
        debugInfo: error.debugInfo
      }
    }

    // Handle regular Error objects
    if (error instanceof Error) {
      return {
        title: title || 'Erro',
        message: 'Ocorreu um erro inesperado. Tente novamente.',
        actions: ['Tente novamente', 'Recarregue a página se necessário'],
        severity: 'medium' as const,
        autoRetryable: true,
        icon: AlertCircle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        category: AuthErrorCategory.UNKNOWN,
        code: AuthErrorCode.UNKNOWN_ERROR,
        recoverable: true,
        retryable: true,
        debugInfo: { originalError: error.message, stack: error.stack }
      }
    }

    // Handle string errors
    return {
      title: title || 'Erro',
      message: typeof error === 'string' ? error : 'Ocorreu um erro inesperado',
      actions: ['Tente novamente'],
      severity: 'medium' as const,
      autoRetryable: true,
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      category: AuthErrorCategory.UNKNOWN,
      code: AuthErrorCode.UNKNOWN_ERROR,
      recoverable: true,
      retryable: true,
      debugInfo: { originalError: String(error) }
    }
  }

  const errorInfo = getErrorInfo()
  const Icon = errorInfo.icon

  // Determine sizes
  const sizes = {
    sm: {
      container: 'p-3',
      icon: 'w-4 h-4',
      title: 'text-sm font-medium',
      message: 'text-xs',
      button: 'px-2 py-1 text-xs'
    },
    md: {
      container: 'p-4',
      icon: 'w-5 h-5',
      title: 'text-base font-medium',
      message: 'text-sm',
      button: 'px-3 py-1.5 text-sm'
    },
    lg: {
      container: 'p-6',
      icon: 'w-6 h-6',
      title: 'text-lg font-medium',
      message: 'text-base',
      button: 'px-4 py-2 text-base'
    }
  }

  const currentSize = sizes[size]

  // Determine variant styles
  const variantStyles = {
    inline: 'border rounded-lg',
    modal: 'rounded-lg shadow-lg',
    toast: 'rounded-lg shadow-md'
  }

  const shouldShowRetry = showRetryButton && onRetry && errorInfo.retryable

  return (
    <div className={`${variantStyles[variant]} ${errorInfo.bgColor} border-l-4 border-l-current ${currentSize.container} ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${errorInfo.iconColor}`}>
          <Icon className={currentSize.icon} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`${currentSize.title} ${errorInfo.iconColor}`}>
            {errorInfo.title}
          </h3>

          {/* Message */}
          <p className={`mt-1 ${currentSize.message} text-gray-700`}>
            {errorInfo.message}
          </p>

          {/* Actions */}
          {errorInfo.actions.length > 0 && (
            <div className="mt-2">
              <p className={`${currentSize.message} text-gray-600 font-medium mb-1`}>
                Como resolver:
              </p>
              <ul className={`${currentSize.message} text-gray-600 list-disc list-inside space-y-0.5`}>
                {errorInfo.actions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Debug info (only in development) */}
          {showDetails && errorInfo.debugInfo && process.env.NODE_ENV === 'development' && (
            <details className="mt-3">
              <summary className={`${currentSize.message} text-gray-500 cursor-pointer hover:text-gray-700`}>
                Detalhes técnicos
              </summary>
              <div className={`mt-2 ${currentSize.message} text-gray-500 font-mono bg-gray-100 p-2 rounded overflow-auto`}>
                <pre>{JSON.stringify(errorInfo.debugInfo, null, 2)}</pre>
              </div>
            </details>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {shouldShowRetry && (
              <button
                onClick={onRetry}
                className={`${currentSize.button} bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center gap-1`}
              >
                <RefreshCw className="w-3 h-3" />
                Tentar novamente
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`${currentSize.button} text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                Dispensar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorDisplay 