"use client"

import React from 'react'
import { cn } from '@/lib/utils'

export type ErrorType = 
  | 'validation' 
  | 'authentication' 
  | 'network' 
  | 'server' 
  | 'rate-limit'
  | 'account'
  | 'general'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

interface ErrorFeedbackProps {
  type?: ErrorType
  severity?: ErrorSeverity
  title?: string
  message: string
  onDismiss?: () => void
  dismissible?: boolean
  className?: string
  showIcon?: boolean
  autoHideDelay?: number
}

// Error type configuration
const errorConfig: Record<ErrorType, {
  icon: React.ReactNode
  colorClasses: string
  defaultTitle: string
  severityOverride?: ErrorSeverity
}> = {
  validation: {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    colorClasses: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    defaultTitle: 'Dados inválidos',
    severityOverride: 'low'
  },
  authentication: {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
    colorClasses: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    defaultTitle: 'Erro de autenticação',
    severityOverride: 'medium'
  },
  network: {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.972 7.972 0 0017 12a7.972 7.972 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    colorClasses: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200',
    defaultTitle: 'Erro de conexão',
    severityOverride: 'medium'
  },
  server: {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2zm0 4.5h16l-.811 7.71a2 2 0 01-1.99 1.79H4.802a2 2 0 01-1.99-1.79L2 7.5zM10 9a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 0110 9z" clipRule="evenodd" />
      </svg>
    ),
    colorClasses: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    defaultTitle: 'Erro do servidor',
    severityOverride: 'high'
  },
  'rate-limit': {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    colorClasses: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200',
    defaultTitle: 'Muitas tentativas',
    severityOverride: 'high'
  },
  account: {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
    colorClasses: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    defaultTitle: 'Problema na conta',
    severityOverride: 'high'
  },
  general: {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
    ),
    colorClasses: 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200',
    defaultTitle: 'Erro inesperado',
    severityOverride: 'medium'
  }
}

// Severity-based additional styling
const severityClasses: Record<ErrorSeverity, string> = {
  low: 'animate-none',
  medium: 'animate-pulse',
  high: 'animate-bounce',
  critical: 'animate-bounce border-2'
}

export const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({
  type = 'general',
  severity,
  title,
  message,
  onDismiss,
  dismissible = true,
  className,
  showIcon = true,
  autoHideDelay
}) => {
  const config = errorConfig[type]
  const effectiveSeverity = severity || config.severityOverride || 'medium'
  const effectiveTitle = title || config.defaultTitle

  // Auto-hide effect
  React.useEffect(() => {
    if (autoHideDelay && onDismiss) {
      const timer = setTimeout(onDismiss, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHideDelay, onDismiss])

  return (
    <div className={cn(
      'p-4 border rounded-lg transition-all duration-300 ease-in-out',
      config.colorClasses,
      severityClasses[effectiveSeverity],
      className
    )}>
      <div className="flex items-start">
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0">
            <div className={cn(
              'transition-transform duration-200',
              effectiveSeverity === 'critical' && 'animate-pulse'
            )}>
              {config.icon}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className={cn('flex-1', showIcon && 'ml-3')}>
          <h3 className="text-sm font-medium">
            {effectiveTitle}
          </h3>
          <div className="mt-1 text-sm">
            {message}
          </div>
          
          {/* Action area for potential retry button, etc. */}
          <div className="mt-2">
            {/* Future: Add action buttons here if needed */}
          </div>
        </div>
        
        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                'inline-flex rounded-md p-1.5 transition-colors duration-200',
                'hover:bg-black/10 dark:hover:bg-white/10',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                type === 'validation' && 'focus:ring-yellow-600',
                type === 'authentication' && 'focus:ring-red-600',
                type === 'network' && 'focus:ring-orange-600',
                type === 'server' && 'focus:ring-red-600',
                type === 'rate-limit' && 'focus:ring-purple-600',
                type === 'account' && 'focus:ring-red-600',
                type === 'general' && 'focus:ring-gray-600'
              )}
              aria-label="Fechar erro"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Compact inline error component for form fields
export const InlineError: React.FC<{
  message: string
  className?: string
}> = ({ message, className }) => {
  return (
    <div className={cn('flex items-center mt-1 text-sm text-red-600 dark:text-red-400', className)}>
      <svg className="h-4 w-4 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  )
}

// Error toast notification component
export const ErrorToast: React.FC<{
  message: string
  type?: ErrorType
  onDismiss?: () => void
  duration?: number
}> = ({ message, type = 'general', onDismiss, duration = 5000 }) => {
  const config = errorConfig[type]
  
  React.useEffect(() => {
    if (onDismiss && duration > 0) {
      const timer = setTimeout(onDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [onDismiss, duration])

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 max-w-sm w-full',
      'transform transition-all duration-300 ease-in-out',
      'animate-in slide-in-from-top-2'
    )}>
      <div className={cn(
        'p-4 rounded-lg shadow-lg border backdrop-blur-sm',
        config.colorClasses,
        'bg-opacity-90 dark:bg-opacity-90'
      )}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-4 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span className="sr-only">Fechar</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorFeedback 