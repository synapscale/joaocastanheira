export default function DocsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Documentação</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Bem-vindo à documentação do Agente AI Canvas. Esta página contém informações detalhadas sobre como utilizar a plataforma.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <div className="border dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Guia de Início Rápido</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aprenda os conceitos básicos para começar a usar a plataforma.
            </p>
          </div>
          <div className="border dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Tutoriais</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Passo a passo para criar seus primeiros fluxos de trabalho.
            </p>
          </div>
          <div className="border dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Referência da API</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Documentação técnica completa da API.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
