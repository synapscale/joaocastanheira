import Link from 'next/link';
import { NodeCreationProviders } from '@/contexts/node-creator';

export default function Home() {
  return (
    <NodeCreationProviders>
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8">SynapScale - Integração de Canvas</h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Bem-vindo à Demonstração de Integração</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Esta demonstração mostra a integração entre o Canvas de Criação de Nodes e o Canvas de Workflow principal do projeto SynapScale.
              Você pode criar nodes personalizados no Canvas de Criação e utilizá-los no Canvas de Workflow.
            </p>
            
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Link href="/workflows" className="block">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800 h-full hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-medium mb-2 text-green-700 dark:text-green-300">Gerenciar Workflows</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Acesse a área de Workflows para criar, editar e gerenciar seus workflows.
                    Os Canvas de edição estão disponíveis ao criar ou editar um workflow específico.
                  </p>
                </div>
              </Link>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-medium mb-2 text-yellow-700 dark:text-yellow-300">Como utilizar os Workflows:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Acesse a área de <strong>Workflows</strong> para visualizar todos os seus workflows</li>
                <li>Clique em <strong>Criar Workflow</strong> para iniciar um novo workflow</li>
                <li>Para editar um workflow existente, selecione a opção <strong>Editar no Canvas</strong> no menu de ações</li>
                <li>Dentro do Canvas, você poderá criar e conectar nodes para construir seu workflow</li>
              </ol>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-3">Persistência Local</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Os nodes criados são persistidos localmente via localStorage, garantindo que não sejam perdidos entre sessões.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-3">Sincronização Bidirecional</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Alterações em nodes são sincronizadas automaticamente entre os dois canvases, garantindo consistência.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-3">Adaptadores de Formato</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Conversão automática entre os diferentes formatos de nodes utilizados nos dois canvases.
              </p>
            </div>
          </div>
        </div>
      </main>
    </NodeCreationProviders>
  );
}
