"use client"

export const dynamic = 'force-dynamic'

/**
 * Página de login
 * Interface de autenticação para usuários
 */

import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Suspense } from 'react'
import LoginForm from '@/components/auth/login-form'
import { AuthProvider } from '@/context/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/toaster'
import ProtectedRoute from '@/components/auth/protected-route'


interface LoginPageProps {
  searchParams?: {
    redirectTo?: string
    error?: string
  }
}

export default function LoginPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/chat';

  // ❌ REMOVIDO: useEffect que estava causando loops de redirecionamento
  // O middleware já cuida disso quando usuário autenticado tenta acessar /login

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* HERO */}
      <section className="h-[40vh] min-h-[280px] bg-brand" aria-hidden="true" />

      {/* CARD CONTAINER */}
      <main className="flex-1 flex items-start justify-center -mt-20 px-4 pb-20">
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4" />
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            }
          >
            <LoginForm redirectTo={redirectTo} />
          </Suspense>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 SynapScale. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

