import React from 'react';
import Link from 'next/link';

export default function NodeCreatorIndexPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Canvas de Criação de Nodes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <Link href="/workflows">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Gerenciar Workflows</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Acesse a área de Workflows para criar, editar e gerenciar seus workflows.
              Os Canvas de edição estão disponíveis ao criar ou editar um workflow específico.
            </p>
          </div>
        </Link>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold mb-2">Sobre a Integração</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Esta demonstração mostra a integração entre o Canvas de Criação de Nodes e o Canvas de Workflow principal.
          Os Canvas são acessíveis apenas através do fluxo de Workflows.
        </p>
        
        <h3 className="text-md font-medium mb-2">Como utilizar:</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Acesse a área de <strong>Workflows</strong> para visualizar todos os seus workflows</li>
          <li>Clique em <strong>Criar Workflow</strong> para iniciar um novo workflow</li>
          <li>Para editar um workflow existente, selecione a opção <strong>Editar no Canvas</strong> no menu de ações</li>
          <li>Dentro do Canvas, você poderá criar e conectar nodes para construir seu workflow</li>
        </ol>
      </div>
    </div>
  );
}
