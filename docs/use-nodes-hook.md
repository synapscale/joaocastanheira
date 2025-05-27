# Documentação do Hook useNodes

## Visão Geral

O hook `useNodes` é um store global baseado em Zustand que gerencia a coleção de nós disponíveis na aplicação. Ele fornece funcionalidades para adicionar, atualizar e excluir nós, além de persistir os dados entre sessões.

## Estrutura de Dados

### Node

Representa um nó na aplicação:

\`\`\`typescript
export interface Node {
  id: string;                // ID único do nó
  name: string;              // Nome do nó
  description: string;       // Descrição do nó
  category: NodeCategory;    // Categoria do nó
  config?: string;           // Configuração adicional (opcional)
  createdAt: string | Date;  // Data de criação
  updatedAt: string | Date;  // Data de última atualização
}
\`\`\`

### NodeCategory

Enum que define as categorias possíveis para os nós:

\`\`\`typescript
export type NodeCategory = 
  | "ai"                   // Nós relacionados a IA
  | "app-action"           // Ações de aplicativo
  | "data-transformation"  // Transformação de dados
  | "flow"                 // Controle de fluxo
  | "core"                 // Funcionalidades básicas
  | "human"                // Interação humana
  | "trigger";             // Gatilhos de eventos
\`\`\`

### NodeState

Interface que define o estado e as ações do store:

\`\`\`typescript
interface NodeState {
  nodes: Node[];                                                                  // Lista de nós
  addNode: (node: Omit<Node, "id" | "createdAt" | "updatedAt">) => void;          // Adiciona um nó
  updateNode: (id: string, node: Partial<Omit<Node, "id" | "createdAt" | "updatedAt">>) => void; // Atualiza um nó
  deleteNode: (id: string) => void;                                               // Exclui um nó
}
\`\`\`

## Funcionalidades Principais

### Gerenciamento de Nós

- **addNode**: Adiciona um novo nó à coleção
- **updateNode**: Atualiza os dados de um nó existente
- **deleteNode**: Remove um nó da coleção

## Uso do Hook

\`\`\`tsx
import { useNodes } from "@/hooks/use-nodes";

function YourComponent() {
  const { nodes, addNode, updateNode, deleteNode } = useNodes();
  
  // Exemplo: Adicionar um novo nó
  const handleCreateNode = () => {
    addNode({
      name: "Novo Nó",
      description: "Descrição do novo nó",
      category: "data-transformation",
    });
  };
  
  // Exemplo: Atualizar um nó existente
  const handleUpdateNode = (id) => {
    updateNode(id, {
      name: "Nome Atualizado",
      description: "Descrição atualizada",
    });
  };
  
  // Exemplo: Excluir um nó
  const handleDeleteNode = (id) => {
    deleteNode(id);
  };
  
  return (
    <div>
      <h2>Gerenciador de Nós</h2>
      
      <button onClick={handleCreateNode}>Criar Novo Nó</button>
      
      <ul>
        {nodes.map((node) => (
          <li key={node.id}>
            <h3>{node.name}</h3>
            <p>{node.description}</p>
            <p>Categoria: {node.category}</p>
            <button onClick={() => handleUpdateNode(node.id)}>Editar</button>
            <button onClick={() => handleDeleteNode(node.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## Persistência

O hook `useNodes` utiliza o middleware `persist` do Zustand para persistir os dados no `localStorage` com a chave `"nodes-storage"`. Isso permite que os nós criados pelo usuário sejam mantidos entre sessões.

\`\`\`typescript
export const useNodes = create<NodeState>()(
  persist(
    (set) => ({
      // Implementação do store...
    }),
    {
      name: "nodes-storage",
      // Converter Date para string ao serializar e vice-versa ao deserializar
      serialize: (state) => JSON.stringify(state),
      deserialize: (str) => {
        const state = JSON.parse(str);
        return state;
      },
    },
  ),
);
\`\`\`

## Fluxo de Trabalho Típico

1. **Criar Nós**: Usar `addNode` para adicionar novos nós à biblioteca
2. **Editar Nós**: Usar `updateNode` para modificar nós existentes
3. **Excluir Nós**: Usar `deleteNode` para remover nós não mais necessários
4. **Usar Nós no Canvas**: Arrastar nós da biblioteca para o canvas

## Exemplo Completo

\`\`\`tsx
import { useNodes } from "@/hooks/use-nodes";
import { useState } from "react";

function NodeManager() {
  const { nodes, addNode, updateNode, deleteNode } = useNodes();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "data-transformation" as NodeCategory,
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    addNode(formData);
    setFormData({
      name: "",
      description: "",
      category: "data-transformation" as NodeCategory,
    });
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gerenciador de Nós</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
        <div className="mb-4">
          <label className="block mb-1">Nome:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Descrição:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Categoria:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="data-transformation">Transformação de Dados</option>
            <option value="ai">IA</option>
            <option value="flow">Fluxo</option>
            <option value="app-action">Ação de App</option>
            <option value="core">Core</option>
            <option value="human">Humano</option>
            <option value="trigger">Gatilho</option>
          </select>
        </div>
        
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Adicionar Nó
        </button>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <div key={node.id} className="border rounded p-4">
            <h3 className="font-bold">{node.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{node.description}</p>
            <p className="text-xs bg-gray-100 inline-block px-2 py-1 rounded mb-4">
              {node.category}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  const newName = prompt("Novo nome:", node.name);
                  const newDesc = prompt("Nova descrição:", node.description);
                  if (newName && newDesc) {
                    updateNode(node.id, { name: newName, description: newDesc });
                  }
                }}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => deleteNode(node.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

## Considerações de Desempenho

Para aplicações com muitos nós, considere:

1. Implementar paginação ou virtualização para renderizar apenas os nós visíveis
2. Usar `React.memo` para componentes que renderizam nós individuais
3. Implementar filtragem e busca eficientes para grandes coleções de nós

## Extensão

Para adicionar novas funcionalidades ao hook:

1. Atualize a interface `NodeState` com as novas funções
2. Implemente as funções no store
3. Atualize a serialização/deserialização se necessário

Exemplo de adição de uma função de duplicação:

\`\`\`typescript
interface NodeState {
  // Funções existentes...
  duplicateNode: (id: string) => void; // Nova função
}

export const useNodes = create<NodeState>()(
  persist(
    (set, get) => ({
      // Implementações existentes...
      
      // Nova função
      duplicateNode: (id: string) => {
        const node = get().nodes.find((n) => n.id === id);
        if (node) {
          const { id: _, createdAt: __, updatedAt: ___, ...nodeData } = node;
          get().addNode(nodeData);
        }
      },
    }),
    {
      // Configuração de persistência...
    },
  ),
);
