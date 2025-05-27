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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Link href="/node-creator" className="block">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 h-full hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-medium mb-2 text-blue-700 dark:text-blue-300">Canvas de Criação de Nodes</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Crie e configure nodes personalizados com uma interface visual intuitiva.
                    Defina entradas, saídas e propriedades para seus nodes.
                  </p>
                </div>
              </Link>
              
              <Link href="/canvas" className="block">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800 h-full hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-medium mb-2 text-green-700 dark:text-green-300">Canvas de Workflow</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Utilize os nodes personalizados no canvas de workflow principal.
                    Veja a sincronização em tempo real entre os dois canvases.
                  </p>
                </div>
              </Link>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-medium mb-2 text-yellow-700 dark:text-yellow-300">Como testar a integração:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Acesse o <strong>Canvas de Criação</strong> e crie um node de teste</li>
                <li>Publique o node criado usando o botão "Publicar Último Node"</li>
                <li>Acesse o <strong>Canvas de Workflow</strong> para ver o node publicado disponível</li>
                <li>O validador de integração mostrará informações sobre os nodes sincronizados</li>
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
