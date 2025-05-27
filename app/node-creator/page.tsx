import React from 'react';
import Link from 'next/link';

export default function NodeCreatorIndexPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Canvas de Criação de Nodes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/node-creator/canvas">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Canvas de Criação</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Crie e configure nodes personalizados com interface visual intuitiva
            </p>
          </div>
        </Link>
        
        <Link href="/canvas">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Canvas de Workflow</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Utilize os nodes personalizados no canvas de workflow principal
            </p>
          </div>
        </Link>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold mb-2">Sobre a Integração</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Esta demonstração mostra a integração entre o Canvas de Criação de Nodes e o Canvas de Workflow principal.
          Você pode criar nodes personalizados no Canvas de Criação e utilizá-los no Canvas de Workflow.
        </p>
        
        <h3 className="text-md font-medium mb-2">Como testar:</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Acesse o <strong>Canvas de Criação</strong> e crie um node de teste</li>
          <li>Publique o node criado usando o botão "Publicar Último Node"</li>
          <li>Acesse o <strong>Canvas de Workflow</strong> para ver o node publicado disponível</li>
          <li>O validador de integração mostrará informações sobre os nodes sincronizados</li>
        </ol>
      </div>
    </div>
  );
}
