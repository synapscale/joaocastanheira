'use client'

import Link from 'next/link'
import BrandLogo from '../../components/ui/brand-logo'
import React, { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Simulação de envio (substitua pela integração real)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* HERO */}
      <section className="h-[40vh] min-h-[280px] bg-brand" aria-hidden="true" />

      {/* CARD CONTAINER */}
      <main className="flex-1 flex items-start justify-center -mt-20 px-4 pb-20">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-brand/40 via-brand-light/10 to-transparent p-[2px] rounded-3xl shadow-xl">
            <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-lg border border-white/40 dark:border-neutral-700/60 rounded-[calc(1.5rem-2px)] p-10">
              <div className="text-center mb-6 flex flex-col items-center">
                <BrandLogo variant="icon" size={48} className="mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Esqueci minha senha
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Informe seu e-mail para receber instruções de recuperação.
                </p>
              </div>
              {submitted ? (
                <div className="text-center space-y-4">
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Se o e-mail informado existir, você receberá as instruções em instantes.
                  </p>
                  <Link href="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
                    Voltar para o login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <svg className="w-5 h-5 absolute left-3 top-5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v.01L12 13 2 4.01V4z" />
                      <path d="M22 6.5l-10 7-10-7V20a2 2 0 002 2h16a2 2 0 002-2V6.5z" />
                    </svg>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="peer w-full pt-6 pb-2 pl-10 pr-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-transparent border-gray-300"
                      placeholder="Email"
                      disabled={loading}
                      autoComplete="email"
                      required
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-10 top-2 text-xs text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand"
                    >
                      Email
                    </label>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar instruções'
                    )}
                  </button>
                  <div className="mt-4 text-center">
                    <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                      Voltar para o login
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
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