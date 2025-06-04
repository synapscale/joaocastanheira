/**
 * Página de login
 * Interface de autenticação para usuários
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '../../components/auth/login-form'

export const metadata: Metadata = {
  title: 'Login | SynapScale',
  description: 'Faça login na sua conta SynapScale para acessar seus workflows e automações.',
  robots: 'noindex, nofollow',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          SynapScale
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Plataforma de Automação com IA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 SynapScale. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}

