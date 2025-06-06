"use client"

/**
 * AuthGuard - Proteção de Rotas
 * Implementado por José - O melhor Full Stack do mundo
 * Gerencia acesso a rotas protegidas com UX otimizada
 */

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { LoginPage } from '@/components/auth/login-page'

// Rotas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/privacy',
  '/terms',
  '/',
]

// Rotas que são redirecionadas para dashboard se autenticado
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const pathname = usePathname()

  // Verificar se a rota é pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })

  // Verificar se é uma rota de autenticação
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Carregando SynapScale
            </h2>
            <p className="text-sm text-muted-foreground">
              Verificando autenticação...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Se usuário autenticado tentando acessar rotas de auth, redirecionar para dashboard
  if (isAuthenticated && isAuthRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Redirecionando...
            </h2>
            <p className="text-sm text-muted-foreground">
              Você já está logado. Redirecionando para o dashboard.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Se rota pública, mostrar conteúdo
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Se não autenticado e rota protegida, mostrar login
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Se autenticado e rota protegida, mostrar conteúdo
  return <>{children}</>
}

export default AuthGuard

