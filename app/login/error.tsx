"use client"

import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log error to service, if needed
    // console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erro ao carregar login</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Ocorreu um erro inesperado ao tentar exibir a página de login.</p>
        <pre className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded p-2 mb-4 overflow-x-auto">{error.message}</pre>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-md font-medium shadow hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
} 