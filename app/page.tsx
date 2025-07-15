"use client"

import Link from 'next/link';

export default function Home() {
  return (
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
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-3">Funcionalidades:</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>Criação de Workflows:</strong> Interface visual para criar workflows complexos</li>
                <li>• <strong>Canvas Integrados:</strong> Seamless integration entre diferentes tipos de canvas</li>
                <li>• <strong>Nodes Personalizados:</strong> Crie e reutilize components customizados</li>
                <li>• <strong>Armazenamento Persistente:</strong> Todos os dados são salvos automaticamente</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Projeto SynapScale • Canvas Integration Demo</p>
          </div>
        </div>
      </main>
  );
}
