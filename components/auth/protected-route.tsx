/**
 * Componente de rota protegida
 * Protege componentes que requerem autenticação
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  requiredRole?: 'user' | 'premium' | 'admin'
  requireEmailVerification?: boolean
}

/**
 * Componente de loading
 */
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
      </div>
    </div>
  )
}

/**
 * Componente de acesso negado
 */
function AccessDenied({ message, actionText, actionHref }: { 
  message: string
  actionText?: string
  actionHref?: string 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Acesso Negado
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        {actionText && actionHref && (
          <a
            href={actionHref}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {actionText}
          </a>
        )}
      </div>
    </div>
  )
}

/**
 * Componente principal de rota protegida
 */
export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login',
  requiredRole,
  requireEmailVerification = false,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isInitialized) {
      setIsChecking(false)
    }
  }, [isInitialized])

  // Ainda carregando
  if (isLoading || isChecking) {
    return fallback || <LoadingSpinner />
  }

  // Não autenticado
  if (!isAuthenticated || !user) {
    const currentPath = window.location.pathname
    const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
    router.push(loginUrl)
    return fallback || <LoadingSpinner />
  }

  // Verificar se email é obrigatório
  if (requireEmailVerification && !user.isEmailVerified) {
    return (
      <AccessDenied
        message="Você precisa verificar seu email para acessar esta página."
        actionText="Verificar Email"
        actionHref="/verify-email"
      />
    )
  }

  // Verificar role se especificado
  if (requiredRole) {
    const roleHierarchy = { user: 1, premium: 2, admin: 3 }
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    if (userLevel < requiredLevel) {
      return (
        <AccessDenied
          message={`Você precisa de permissões de ${requiredRole} para acessar esta página.`}
          actionText="Fazer Upgrade"
          actionHref="/upgrade"
        />
      )
    }
  }

  // Usuário autorizado
  return <>{children}</>
}

/**
 * HOC para proteger páginas
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Hook para verificar se usuário pode acessar uma funcionalidade
 */
export function useCanAccess(requiredRole?: string, requireEmailVerification = false) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return false
  }

  if (requireEmailVerification && !user.isEmailVerified) {
    return false
  }

  if (requiredRole) {
    const roleHierarchy = { user: 1, premium: 2, admin: 3 }
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  }

  return true
}

/**
 * Componente para mostrar conteúdo baseado em permissões
 */
export function ConditionalRender({
  children,
  fallback,
  requiredRole,
  requireEmailVerification = false,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredRole?: string
  requireEmailVerification?: boolean
}) {
  const canAccess = useCanAccess(requiredRole, requireEmailVerification)

  if (canAccess) {
    return <>{children}</>
  }

  return <>{fallback || null}</>
}

export default ProtectedRoute

