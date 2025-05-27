# Documentação do Contexto de Canvas

## Visão Geral

O contexto de canvas (`CanvasContext`) gerencia o estado e as operações relacionadas ao canvas interativo onde os nós são posicionados e conectados. Ele fornece funcionalidades para adicionar, mover, atualizar e remover nós, bem como gerenciar conexões entre eles.

## Estrutura de Dados

### CanvasNode

Representa um nó no canvas:

\`\`\`typescript
type CanvasNode = {
  id: string;                // ID único do nó
  type: string;              // Tipo do nó (categoria)
  position: { x: number; y: number }; // Posição no canvas
  data: Node;                // Dados do nó (nome, descrição, etc.)
  ports?: {                  // Portas do nó
    inputs: Array<{ id: string; connections: string[] }>;
    outputs: Array<{ id: string; connections: string[] }>;
  }
}
\`\`\`

### Connection

Representa uma conexão entre portas de nós:

\`\`\`typescript
type Connection = {
  id: string;                // ID único da conexão
  sourceNodeId: string;      // ID do nó de origem
  sourcePortId: string;      // ID da porta de origem
  targetNodeId: string;      // ID do nó de destino
  targetPortId: string;      // ID da porta de destino
  selected?: boolean;        // Indica se a conexão está selecionada
}
\`\`\`

### HistoryAction

Representa uma ação no histórico para desfazer/refazer:

\`\`\`typescript
interface HistoryAction {
  type: ActionType;          // Tipo da ação (ADD_NODE, REMOVE_NODE, etc.)
  payload: any;              // Dados da ação
  undo: () => void;          // Função para desfazer a ação
  redo: () => void;          // Função para refazer a ação
}
\`\`\`

## Funcionalidades Principais

### Gerenciamento de Nós

- **addCanvasNode**: Adiciona um novo nó ao canvas
- **updateCanvasNode**: Atualiza os dados de um nó existente
- **removeCanvasNode**: Remove um nó do canvas
- **moveCanvasNode**: Move um nó para uma nova posição

### Gerenciamento de Conexões

- **addConnection**: Cria uma conexão entre duas portas
- **removeConnection**: Remove uma conexão existente
- **getNodeConnections**: Obtém todas as conexões de um nó

### Seleção

- **selectedNode**: ID do nó selecionado atualmente
- **setSelectedNode**: Define o nó selecionado
- **selectedConnection**: ID da conexão selecionada atualmente
- **setSelectedConnection**: Define a conexão selecionada

### Histórico (Desfazer/Refazer)

- **undo**: Desfaz a última ação
- **redo**: Refaz a última ação desfeita
- **canUndo**: Indica se há ações para desfazer
- **canRedo**: Indica se há ações para refazer

### Informações de Nós

- **getNodeType**: Obtém a definição de tipo de um nó

## Uso do Contexto

### Provedor de Canvas

O `CanvasProvider` deve envolver os componentes que precisam acessar o canvas:

\`\`\`tsx
import { CanvasProvider } from "@/contexts/canvas-context";

function CanvasApp() {
  return (
    <CanvasProvider>
      <YourCanvasComponent />
    </CanvasProvider>
  );
}
\`\`\`

### Consumindo o Contexto

Use o hook `useCanvas` para acessar o estado e as funções do canvas:

\`\`\`tsx
import { useCanvas } from "@/contexts/canvas-context";

function YourCanvasComponent() {
  const { 
    canvasNodes, 
    connections, 
    addCanvasNode, 
    removeCanvasNode,
    selectedNode,
    setSelectedNode,
    undo,
    redo,
    canUndo,
    canRedo
  } = useCanvas();
  
  // Exemplo: Adicionar um novo nó
  const handleAddNode = (node, position) => {
    addCanvasNode(node, position);
  };
  
  // Exemplo: Selecionar um nó
  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId);
  };
  
  return (
    <div>
      {/* Controles de desfazer/refazer */}
      <button onClick={undo} disabled={!canUndo}>Desfazer</button>
      <button onClick={redo} disabled={!canRedo}>Refazer</button>
      
      {/* Renderização dos nós */}
      {canvasNodes.map((node) => (
        <CanvasNode 
          key={node.id} 
          node={node} 
          isSelected={selectedNode === node.id}
          onClick={() => handleNodeClick(node.id)}
        />
      ))}
      
      {/* Renderização das conexões */}
      {connections.map((connection) => (
        <ConnectionLine key={connection.id} connection={connection} />
      ))}
    </div>
  );
}
\`\`\`

## Persistência

O estado do canvas (nós e conexões) é persistido no `localStorage` com as chaves `"canvas-nodes"` e `"canvas-connections"`, permitindo que o trabalho do usuário seja mantido entre sessões.

## Atalhos de Teclado

O contexto de canvas implementa os seguintes atalhos de teclado:

- **Ctrl+Z**: Desfaz a última ação
- **Ctrl+Y** ou **Ctrl+Shift+Z**: Refaz a última ação desfeita
- **Delete** ou **Backspace**: Remove o nó ou conexão selecionada

## Fluxo de Trabalho Típico

1. **Adicionar Nós**: Arrastar nós da barra lateral para o canvas
2. **Posicionar Nós**: Arrastar nós para posições desejadas
3. **Conectar Nós**: Conectar portas de saída a portas de entrada
4. **Configurar Nós**: Selecionar nós para editar suas propriedades
5. **Executar Fluxo**: (Implementação específica da aplicação)

## Extensão

Para adicionar novos tipos de ações ao histórico:

1. Adicione o novo tipo à enum `ActionType`
2. Implemente a lógica de ação, incluindo funções `undo` e `redo`
3. Use `addToHistory` para registrar a nova ação

Exemplo:

\`\`\`typescript
// Adicionar à enum ActionType
type ActionType = "ADD_NODE" | "REMOVE_NODE" | "MOVE_NODE" | "UPDATE_NODE" | "ADD_CONNECTION" | "REMOVE_CONNECTION" | "NEW_ACTION";

// Implementar a nova ação
const handleNewAction = (data) => {
  // Executar a ação
  // ...
  
  // Adicionar ao histórico
  addToHistory({
    type: "NEW_ACTION",
    payload: { data },
    undo: () => {
      // Lógica para desfazer
    },
    redo: () => {
      // Lógica para refazer (geralmente a mesma da ação original)
    }
  });
};
\`\`\`

## Considerações de Desempenho

Para canvas com muitos nós e conexões, considere:

1. Implementar renderização virtualizada para mostrar apenas nós visíveis
2. Limitar o tamanho do histórico para evitar consumo excessivo de memória
3. Otimizar a frequência de salvamento no localStorage
4. Usar `React.memo` para componentes de nó e conexão para evitar renderizações desnecessárias
\`\`\`

## 8. Criando um arquivo de documentação para o hook useNodes
