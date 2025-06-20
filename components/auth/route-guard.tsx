'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RouteGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Componente de proteção de rotas
 * Redireciona automaticamente para login quando usuário não está autenticado
 * Evita mostrar mensagens "Acesso Negado" desnecessárias
 */
export function RouteGuard({ 
  children, 
  fallback, 
  redirectTo = '/login' 
}: RouteGuardProps) {
  const { isAuthenticated, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Só redirecionar após inicialização completa
    if (isInitialized && !isAuthenticated) {
      console.log('🔐 RouteGuard: Usuario não autenticado, redirecionando para', redirectTo)
      router.push(redirectTo)
    }
  }, [isInitialized, isAuthenticated, router, redirectTo])

  // Loading enquanto inicializa
  if (!isInitialized) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Loading enquanto redireciona
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // Usuário autenticado, mostrar conteúdo
  return <>{children}</>
} 