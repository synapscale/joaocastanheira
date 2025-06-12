import type { MarketplaceNode, NodeReview } from "@/types/marketplace"

// Função para buscar nós do marketplace
export async function fetchMarketplaceNodes(): Promise<MarketplaceNode[]> {
  // Em um app real, isso seria uma chamada de API
  // Por enquanto, vamos retornar dados mockados

  // Simular um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return [
    {
      id: "node-1",
      name: "Transformador de JSON",
      type: "json-transformer",
      category: "transformations",
      description: "Transforma dados JSON aplicando operações personalizadas como filtragem, mapeamento e redução.",
      version: "1.0.0",
      author: "João Silva",
      icon: "{}",
      color: "#10b981",
      tags: ["json", "transformação", "dados"],
      rating: 4.8,
      downloads: 12500,
      trending_score: 95,
      published_at: "2023-06-15T10:00:00Z",
      updated_at: "2023-08-20T14:30:00Z",
      inputs: [
        {
          id: "input",
          name: "Entrada JSON",
          description: "Dados JSON a serem transformados",
          required: true,
        },
      ],
      outputs: [
        {
          id: "output",
          name: "Saída JSON",
          description: "Dados JSON transformados",
        },
      ],
      parameters: [
        {
          id: "param-1",
          name: "Modo de Operação",
          key: "operationMode",
          type: "select",
          description: "Como o código deve processar os itens",
          required: true,
          options: [
            { label: "Executar uma vez para todos os itens", value: "all" },
            { label: "Executar para cada item", value: "each" },
          ],
          default: "all",
        },
        {
          id: "param-2",
          name: "Preservar Originais",
          key: "preserveOriginals",
          type: "boolean",
          description: "Manter os campos originais no resultado",
          required: false,
          default: true,
        },
      ],
      code_template: `// Este código será executado quando o nó for acionado
// $input contém os dados de entrada JSON
// Você deve retornar os dados que serão passados para o próximo nó

// Exemplo: Adicionar um campo a cada item
return $input.map(item => {
  return {
    ...item,
    transformedAt: new Date().toISOString(),
    processed: true
  };
});`,
      documentation: `# Transformador de JSON

## Descrição
Este nó permite transformar dados JSON usando código JavaScript personalizado.

## Entradas
- **Entrada JSON**: Dados JSON a serem transformados (array ou objeto)

## Parâmetros
- **Modo de Operação**: Define como o código processa os itens
  - **Executar uma vez para todos os itens**: O código recebe todo o array de entrada
  - **Executar para cada item**: O código é executado separadamente para cada item
- **Preservar Originais**: Manter os campos originais no resultado

## Saídas
- **Saída JSON**: Dados JSON transformados

## Exemplo
\`\`\`javascript
// Adicionar um campo a cada item
return $input.map(item => {
  return {
    ...item,
    transformedAt: new Date().toISOString(),
    processed: true
  };
});
\`\`\``,
    },
    {
      id: "node-2",
      name: "Conector de API REST",
      type: "rest-api",
      category: "integrations",
      description:
        "Conecta-se a APIs REST externas para buscar ou enviar dados com suporte a autenticação e manipulação de respostas.",
      version: "2.1.0",
      author: "Maria Oliveira",
      icon: "🌐",
      color: "#3b82f6",
      tags: ["api", "rest", "http", "integração"],
      rating: 4.5,
      downloads: 8700,
      trending_score: 87,
      published_at: "2023-04-10T08:15:00Z",
      updated_at: "2023-09-05T11:20:00Z",
      inputs: [
        {
          id: "input",
          name: "Parâmetros da Requisição",
          description: "Dados a serem enviados na requisição",
          required: false,
        },
      ],
      outputs: [
        {
          id: "output",
          name: "Resposta da API",
          description: "Dados retornados pela API",
        },
      ],
      parameters: [
        {
          id: "param-1",
          name: "URL da API",
          key: "apiUrl",
          type: "string",
          description: "URL completa do endpoint da API",
          required: true,
        },
        {
          id: "param-2",
          name: "Método HTTP",
          key: "method",
          type: "select",
          description: "Método HTTP a ser utilizado",
          required: true,
          options: [
            { label: "GET", value: "get" },
            { label: "POST", value: "post" },
            { label: "PUT", value: "put" },
            { label: "DELETE", value: "delete" },
            { label: "PATCH", value: "patch" },
          ],
          default: "get",
        },
        {
          id: "param-3",
          name: "Cabeçalhos",
          key: "headers",
          type: "json",
          description: "Cabeçalhos HTTP a serem enviados",
          required: false,
        },
      ],
      code_template: `// Este código será executado quando o nó for acionado
// $input contém os dados de entrada
// $params contém os parâmetros configurados

// Configurar a requisição
const url = $params.apiUrl;
const method = $params.method.toUpperCase();
const headers = $params.headers || {};

// Adicionar cabeçalhos padrão se não existirem
if (!headers['Content-Type']) {
  headers['Content-Type'] = 'application/json';
}

// Preparar o corpo da requisição para métodos que o suportam
let body = null;
if (['POST', 'PUT', 'PATCH'].includes(method) && $input) {
  body = JSON.stringify($input);
}

// Fazer a requisição
const response = await fetch(url, {
  method,
  headers,
  body
});

// Verificar se a resposta foi bem-sucedida
if (!response.ok) {
  throw new Error(\`Erro na requisição: \${response.status} \${response.statusText}\`);
}

// Retornar os dados da resposta
return await response.json();`,
    },
    {
      id: "node-3",
      name: "Gerador de Texto com IA",
      type: "ai-text-generator",
      category: "ai",
      description:
        "Gera texto usando modelos de linguagem avançados com suporte a prompts personalizados e ajuste de parâmetros.",
      version: "1.2.0",
      author: "Carlos Mendes",
      icon: "🤖",
      color: "#8b5cf6",
      tags: ["ia", "nlp", "texto", "gpt"],
      rating: 4.9,
      downloads: 15200,
      trending_score: 98,
      published_at: "2023-07-22T09:45:00Z",
      updated_at: "2023-10-12T16:30:00Z",
      inputs: [
        {
          id: "input",
          name: "Prompt",
          description: "Texto de entrada para o modelo de IA",
          required: true,
        },
      ],
      outputs: [
        {
          id: "output",
          name: "Texto Gerado",
          description: "Texto gerado pelo modelo de IA",
        },
      ],
      parameters: [
        {
          id: "param-1",
          name: "Modelo",
          key: "model",
          type: "select",
          description: "Modelo de IA a ser utilizado",
          required: true,
          options: [
            { label: "GPT-4", value: "gpt-4" },
            { label: "GPT-3.5", value: "gpt-3.5" },
            { label: "Claude", value: "claude" },
            { label: "Llama 2", value: "llama-2" },
          ],
          default: "gpt-3.5",
        },
        {
          id: "param-2",
          name: "Temperatura",
          key: "temperature",
          type: "number",
          description: "Controla a aleatoriedade do texto gerado (0-1)",
          required: false,
          default: 0.7,
        },
        {
          id: "param-3",
          name: "Comprimento Máximo",
          key: "maxLength",
          type: "number",
          description: "Número máximo de tokens a serem gerados",
          required: false,
          default: 1000,
        },
      ],
    },
    {
      id: "node-4",
      name: "Processador de Planilhas",
      type: "spreadsheet-processor",
      category: "transformations",
      description:
        "Processa dados de planilhas Excel e CSV com suporte a fórmulas, filtragem e transformações avançadas.",
      version: "1.5.0",
      author: "Ana Souza",
      icon: "📊",
      color: "#22c55e",
      tags: ["excel", "csv", "planilha", "dados"],
      rating: 4.3,
      downloads: 7800,
      trending_score: 82,
      published_at: "2023-03-05T14:20:00Z",
      updated_at: "2023-08-18T10:15:00Z",
    },
    {
      id: "node-5",
      name: "Notificador de Slack",
      type: "slack-notifier",
      category: "integrations",
      description: "Envia mensagens e notificações para canais do Slack com suporte a formatação avançada e anexos.",
      version: "1.1.0",
      author: "Pedro Alves",
      icon: "💬",
      color: "#4f46e5",
      tags: ["slack", "notificação", "mensagem", "comunicação"],
      rating: 4.6,
      downloads: 9200,
      trending_score: 88,
      published_at: "2023-05-18T11:30:00Z",
      updated_at: "2023-09-25T09:40:00Z",
    },
    {
      id: "node-6",
      name: "Filtro de Dados Avançado",
      type: "advanced-filter",
      category: "flow",
      description: "Filtra e roteia dados com base em condições complexas e expressões lógicas personalizáveis.",
      version: "2.0.0",
      author: "Luiz Costa",
      icon: "🔍",
      color: "#f59e0b",
      tags: ["filtro", "condição", "roteamento", "lógica"],
      rating: 4.7,
      downloads: 11000,
      trending_score: 91,
      published_at: "2023-02-10T16:45:00Z",
      updated_at: "2023-07-30T13:20:00Z",
    },
    {
      id: "node-7",
      name: "Conversor de Formato de Dados",
      type: "data-format-converter",
      category: "transformations",
      description: "Converte dados entre diferentes formatos como JSON, XML, CSV e YAML com mapeamento personalizado.",
      version: "1.3.0",
      author: "Fernanda Lima",
      icon: "🔄",
      color: "#ec4899",
      tags: ["conversão", "formato", "json", "xml", "csv"],
      rating: 4.4,
      downloads: 8500,
      trending_score: 85,
      published_at: "2023-04-28T10:10:00Z",
      updated_at: "2023-09-15T15:30:00Z",
    },
    {
      id: "node-8",
      name: "Gatilho de Webhook",
      type: "webhook-trigger",
      category: "triggers",
      description:
        "Inicia fluxos de trabalho quando um webhook é acionado, com suporte a validação de payload e autenticação.",
      version: "1.0.0",
      author: "Roberto Dias",
      icon: "🔗",
      color: "#0ea5e9",
      tags: ["webhook", "trigger", "http", "evento"],
      rating: 4.5,
      downloads: 10200,
      trending_score: 89,
      published_at: "2023-06-05T09:30:00Z",
      updated_at: "2023-10-02T11:45:00Z",
    },
    {
      id: "node-9",
      name: "Analisador de Sentimento",
      type: "sentiment-analyzer",
      category: "ai",
      description:
        "Analisa o sentimento de textos usando modelos de IA, classificando-os como positivos, negativos ou neutros.",
      version: "1.1.0",
      author: "Juliana Martins",
      icon: "😊",
      color: "#8b5cf6",
      tags: ["ia", "nlp", "sentimento", "análise"],
      rating: 4.2,
      downloads: 6800,
      trending_score: 80,
      published_at: "2023-07-12T13:15:00Z",
      updated_at: "2023-09-28T10:20:00Z",
    },
    {
      id: "node-10",
      name: "Executor de SQL",
      type: "sql-executor",
      category: "operations",
      description:
        "Executa consultas SQL em bancos de dados com suporte a múltiplos provedores e transformação de resultados.",
      version: "2.2.0",
      author: "Marcos Oliveira",
      icon: "📝",
      color: "#f43f5e",
      tags: ["sql", "banco de dados", "consulta", "dados"],
      rating: 4.8,
      downloads: 13500,
      trending_score: 94,
      published_at: "2023-03-20T08:45:00Z",
      updated_at: "2023-10-05T14:10:00Z",
    },
    {
      id: "node-11",
      name: "Gerador de PDF",
      type: "pdf-generator",
      category: "operations",
      description: "Cria documentos PDF a partir de templates HTML com suporte a estilos, imagens e dados dinâmicos.",
      version: "1.4.0",
      author: "Camila Santos",
      icon: "📄",
      color: "#ef4444",
      tags: ["pdf", "documento", "relatório", "template"],
      rating: 4.6,
      downloads: 9800,
      trending_score: 87,
      published_at: "2023-05-25T11:20:00Z",
      updated_at: "2023-09-10T16:45:00Z",
    },
    {
      id: "node-12",
      name: "Agendador de Tarefas",
      type: "task-scheduler",
      category: "triggers",
      description: "Agenda a execução de fluxos de trabalho com base em expressões cron ou intervalos personalizados.",
      version: "1.2.0",
      author: "Ricardo Gomes",
      icon: "⏰",
      color: "#0891b2",
      tags: ["agendamento", "cron", "tempo", "automação"],
      rating: 4.7,
      downloads: 11200,
      trending_score: 90,
      published_at: "2023-04-15T09:50:00Z",
      updated_at: "2023-08-28T13:30:00Z",
    },
  ]
}

// Função para buscar avaliações de um nó
export async function fetchNodeReviews(nodeId: string): Promise<NodeReview[]> {
  // Em um app real, isso seria uma chamada de API
  // Por enquanto, vamos retornar dados mockados

  // Simular um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 800))

  return [
    {
      id: "review-1",
      node_id: nodeId,
      user: {
        id: "user-1",
        name: "Rafael Silva",
        avatar: null,
      },
      rating: 5,
      comment:
        "Excelente nó! Muito fácil de configurar e funcionou perfeitamente no meu fluxo de trabalho. Economizou muito tempo no meu projeto.",
      created_at: "2023-09-15T14:30:00Z",
      reply: {
        user: {
          id: "author-1",
          name: "Autor do Nó",
          avatar: null,
        },
        comment: "Obrigado pelo feedback positivo! Fico feliz que tenha sido útil para o seu projeto.",
        created_at: "2023-09-16T10:15:00Z",
      },
    },
    {
      id: "review-2",
      node_id: nodeId,
      user: {
        id: "user-2",
        name: "Carla Mendes",
        avatar: null,
      },
      rating: 4,
      comment:
        "Muito bom, mas poderia ter mais opções de configuração. De qualquer forma, resolveu meu problema e a documentação é clara.",
      created_at: "2023-08-22T09:45:00Z",
    },
    {
      id: "review-3",
      node_id: nodeId,
      user: {
        id: "user-3",
        name: "Bruno Costa",
        avatar: null,
      },
      rating: 5,
      comment:
        "Simplesmente perfeito! Integrou-se perfeitamente com meus outros nós e o desempenho é excelente mesmo com grandes volumes de dados.",
      created_at: "2023-07-30T16:20:00Z",
    },
    {
      id: "review-4",
      node_id: nodeId,
      user: {
        id: "user-4",
        name: "Amanda Oliveira",
        avatar: null,
      },
      rating: 3,
      comment:
        "Funciona bem, mas tive alguns problemas com tipos de dados complexos. Precisei fazer algumas adaptações no código para funcionar corretamente.",
      created_at: "2023-06-18T11:10:00Z",
      reply: {
        user: {
          id: "author-1",
          name: "Autor do Nó",
          avatar: null,
        },
        comment:
          "Obrigado pelo feedback! Estamos trabalhando em melhorias para lidar melhor com tipos de dados complexos na próxima versão.",
        created_at: "2023-06-19T08:30:00Z",
      },
    },
  ]
}
