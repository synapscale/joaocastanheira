"use client"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Página não encontrada</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">A página de login não foi encontrada ou não está disponível.</p>
        <a href="/" className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-md font-medium shadow hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand">Voltar para o início</a>
      </div>
    </div>
  )
} 