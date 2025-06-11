/**
 * Componente Loading.
 * Renderiza uma mensagem de carregamento simples.
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  )
}
