/**
 * Componente de formulário de login
 * Interface para autenticação de usuários
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLogin } from '../../hooks/useAuth'
import type { LoginData } from '../../lib/types/auth'
import BrandLogo from '../ui/brand-logo'

interface LoginFormProps {
  redirectTo?: string
  onSuccess?: () => void
  className?: string
}

export function LoginForm({ redirectTo = '/', onSuccess, className = '' }: LoginFormProps) {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useLogin()
  
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  // Validação do formulário
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manipular mudanças nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Limpar erro do campo quando usuário começar a digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }

    // Limpar erro geral
    if (error) {
      clearError()
    }
  }

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await login(formData)
      
      // Sucesso
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(redirectTo)
      }
    } catch (err) {
      // Erro já é tratado pelo hook useLogin
      console.error('Erro no login:', err)
    }
  }

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-brand/40 via-brand-light/10 to-transparent p-[2px] rounded-3xl shadow-xl">
          <div
            className={`bg-white/70 dark:bg-neutral-800/70 backdrop-blur-lg border border-white/40 dark:border-neutral-700/60 rounded-[calc(1.5rem-2px)] p-10 ${error ? 'animate-shake' : ''}`}
          >
            <div className="text-center mb-6 flex flex-col items-center">
              <BrandLogo variant="icon" size={48} className="mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Entrar na sua conta
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Bem-vindo de volta! Faça login para continuar.
              </p>
            </div>

            {/* Login social */}
            <div className="space-y-3 mb-6">
              {/* Google */}
              <button
                type="button"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-900 rounded-md py-2.5 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              >
                {/* Ícone Google */}
                <svg className="h-5 w-5" viewBox="0 0 488 512" fill="currentColor" aria-hidden="true">
                  <path d="M488 261.8c0-17.8-1.5-35-4.3-51.8H249v98h134.5c-5.8 32-23 59.1-49 77.1l-.4 2.8 71.3 55.5 4.9.5c45.1-41.6 71.7-103 71.7-181.1z" fill="#4285F4"/>
                  <path d="M249 492c66.1 0 121.6-21.9 162.1-59.6l-77.3-60c-21.4 14.6-48.9 23.4-84.8 23.4-64.9 0-120-43.8-139.7-102.9l-2.9.2-75.6 58.6-1 2.8C52.8 424.3 144.1 492 249 492z" fill="#34A853"/>
                  <path d="M109.3 296.9c-4.8-14.6-7.5-30.2-7.5-46.9s2.7-32.3 7.5-46.9l-1-3-76.8-59.5-2.5 1.2C13.3 177.7 0 212.3 0 250s13.3 72.3 36.5 101.3l73.8-54.4z" fill="#FBBC05"/>
                  <path d="M249 97.9c36.3 0 64.3 15.7 79.1 29l58-56.4C356.5 29.8 315.1 12 249 12 144.1 12 52.8 79.7 36.5 148.7l73.8 54.4C129 141.7 184.1 97.9 249 97.9z" fill="#EA4335"/>
                </svg>
                Entrar com Google
              </button>

              {/* GitHub */}
              <button
                type="button"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md py-2.5 px-4 text-sm font-medium transition-colors shadow-sm"
              >
                {/* Ícone GitHub */}
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 0C5.371 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.111.793-.261.793-.577 0-.285-.011-1.042-.016-2.047-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.087-.745.083-.729.083-.729 1.205.085 1.838 1.236 1.838 1.236 1.07 1.834 2.809 1.304 3.495.997.109-.775.418-1.304.762-1.604-2.665-.305-5.466-1.335-5.466-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.522.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.019.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.654.242 2.873.119 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.623-5.479 5.921.431.371.814 1.103.814 2.222 0 1.604-.015 2.898-.015 3.291 0 .319.192.694.801.576C20.565 21.795 24 17.299 24 12c0-6.627-5.373-12-12-12z" clipRule="evenodd" />
                </svg>
                Entrar com GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6" aria-hidden="true">
              <span className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
              <span className="mx-3 text-xs uppercase text-gray-500 dark:text-gray-400 select-none">ou</span>
              <span className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Email */}
              <div className="relative">
                {/* ícone */}
                <svg className="w-5 h-5 absolute left-3 top-5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v.01L12 13 2 4.01V4z" />
                  <path d="M22 6.5l-10 7-10-7V20a2 2 0 002 2h16a2 2 0 002-2V6.5z" />
                </svg>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`peer w-full pt-6 pb-2 pl-10 pr-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-transparent ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Email"
                  disabled={isLoading}
                  autoComplete="email"
                />
                <label
                  htmlFor="email"
                  className="absolute left-10 top-2 text-xs text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand"
                >
                  Email
                </label>
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="relative">
                {/* ícone */}
                <svg className="w-5 h-5 absolute left-3 top-5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2a10 10 0 00-9.33 6.25 1 1 0 000 .5A10.05 10.05 0 0012 22a10.05 10.05 0 009.33-13.25 1 1 0 000-.5A10.05 10.05 0 0012 2zm0 15a5 5 0 110-10 5 5 0 010 10z" clipRule="evenodd" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`peer w-full pt-6 pb-2 pl-10 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-transparent ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Senha"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <label
                  htmlFor="password"
                  className="absolute left-10 top-2 text-xs text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand"
                >
                  Senha
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>

              {/* Lembrar-me e Esqueci a senha */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Lembrar-me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Esqueci a senha
                </Link>
              </div>

              {/* Erro geral */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error.message}</p>
                </div>
              )}

              {/* Botão de submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Link para registro */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não tem uma conta?{' '}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm

