import type { Node } from "@/hooks/use-nodes"

export type NodeCategory =
  | "ai"
  | "app-action"
  | "data-transformation"
  | "flow"
  | "core"
  | "human"
  | "trigger"
  | "data-input"
  | "data-output"
  | "ui-element"
  | "input"
  | "processing"
  | "output"

export interface NodePort {
  id: string
  type: "input" | "output"
  name: string
  dataType: string
  description?: string
  required?: boolean
  multiple?: boolean
}

export interface NodeTypeDefinition {
  id: string
  name: string
  category: NodeCategory
  description: string
  icon: string
  color: string
  inputs: NodePort[]
  outputs: NodePort[]
  properties: Record<string, any>
  defaultConfig?: Record<string, any>
}

/**
 * Definições de tipos de nodes
 */
export const NODE_TYPES: Record<string, NodeTypeDefinition> = {
  // Nodes de entrada de dados
  "file-input": {
    id: "file-input",
    name: "Entrada de Arquivo",
    category: "data-input",
    description: "Importa dados de arquivos locais ou na nuvem",
    icon: "FileUp",
    color: "blue",
    inputs: [],
    outputs: [
      {
        id: "data",
        type: "output",
        name: "Dados",
        dataType: "any",
        description: "Dados extraídos do arquivo",
      },
    ],
    properties: {
      fileTypes: ["csv", "json", "xlsx", "txt"],
      hasHeader: true,
      delimiter: ",",
      encoding: "utf-8",
    },
  },
  "api-connector": {
    id: "api-connector",
    name: "Conector de API",
    category: "data-input",
    description: "Conecta-se a APIs externas para buscar dados",
    icon: "Globe",
    color: "indigo",
    inputs: [],
    outputs: [
      {
        id: "response",
        type: "output",
        name: "Resposta",
        dataType: "object",
        description: "Resposta da API",
      },
    ],
    properties: {
      method: "GET",
      url: "",
      headers: {},
      queryParams: {},
      body: "",
      authentication: {
        type: "None",
        credentials: {},
      },
    },
  },

  // Nodes de transformação de dados
  filter: {
    id: "filter",
    name: "Filtro",
    category: "data-transformation",
    description: "Filtra dados com base em condições",
    icon: "Filter",
    color: "green",
    inputs: [
      {
        id: "data",
        type: "input",
        name: "Dados",
        dataType: "array",
        description: "Dados a serem filtrados",
        required: true,
      },
    ],
    outputs: [
      {
        id: "filtered",
        type: "output",
        name: "Filtrados",
        dataType: "array",
        description: "Dados filtrados",
      },
    ],
    properties: {
      conditions: [],
      operator: "AND",
    },
  },
  map: {
    id: "map",
    name: "Mapeamento",
    category: "data-transformation",
    description: "Transforma a estrutura dos dados",
    icon: "Map",
    color: "emerald",
    inputs: [
      {
        id: "data",
        type: "input",
        name: "Dados",
        dataType: "array",
        description: "Dados a serem mapeados",
        required: true,
      },
    ],
    outputs: [
      {
        id: "mapped",
        type: "output",
        name: "Mapeados",
        dataType: "array",
        description: "Dados mapeados",
      },
    ],
    properties: {
      mappings: [],
      preserveUnmapped: false,
    },
  },
  code: {
    id: "code",
    name: "Código",
    category: "data-transformation",
    description: "Executa código personalizado",
    icon: "Code",
    color: "purple",
    inputs: [
      {
        id: "data",
        type: "input",
        name: "Dados",
        dataType: "any",
        description: "Dados de entrada",
        required: true,
      },
    ],
    outputs: [
      {
        id: "result",
        type: "output",
        name: "Resultado",
        dataType: "any",
        description: "Resultado da execução",
      },
    ],
    properties: {
      language: "javascript",
      code: "// Escreva seu código aqui\nreturn data;",
      timeout: 5000,
    },
  },

  // Nodes de fluxo de controle
  conditional: {
    id: "conditional",
    name: "Condicional",
    category: "flow",
    description: "Ramifica o fluxo com base em condições",
    icon: "GitBranch",
    color: "yellow",
    inputs: [
      {
        id: "data",
        type: "input",
        name: "Dados",
        dataType: "any",
        description: "Dados para avaliação",
        required: true,
      },
    ],
    outputs: [
      {
        id: "true",
        type: "output",
        name: "Verdadeiro",
        dataType: "any",
        description: "Saída se a condição for verdadeira",
      },
      {
        id: "false",
        type: "output",
        name: "Falso",
        dataType: "any",
        description: "Saída se a condição for falsa",
      },
    ],
    properties: {
      condition: "",
      defaultPath: "true",
    },
  },
  loop: {
    id: "loop",
    name: "Loop",
    category: "flow",
    description: "Itera sobre uma coleção de dados",
    icon: "Repeat",
    color: "amber",
    inputs: [
      {
        id: "collection",
        type: "input",
        name: "Coleção",
        dataType: "array",
        description: "Coleção para iteração",
        required: true,
      },
    ],
    outputs: [
      {
        id: "iteration",
        type: "output",
        name: "Iteração",
        dataType: "any",
        description: "Saída para cada iteração",
      },
      {
        id: "completed",
        type: "output",
        name: "Concluído",
        dataType: "array",
        description: "Saída após todas as iterações",
      },
    ],
    properties: {
      iterationVariable: "item",
      indexVariable: "index",
      parallel: false,
    },
  },

  // Nodes de saída de dados
  visualization: {
    id: "visualization",
    name: "Visualização",
    category: "data-output",
    description: "Exibe dados em formatos visuais",
    icon: "BarChart",
    color: "red",
    inputs: [
      {
        id: "data",
        type: "input",
        name: "Dados",
        dataType: "any",
        description: "Dados para visualização",
        required: true,
      },
    ],
    outputs: [],
    properties: {
      chartType: "bar",
      title: "",
      xAxis: "",
      yAxis: "",
      colors: ["#4f46e5", "#10b981", "#ef4444", "#f59e0b", "#6366f1"],
    },
  },
  "database-write": {
    id: "database-write",
    name: "Escrita em Banco de Dados",
    category: "data-output",
    description: "Escreve dados em bancos de dados",
    icon: "Database",
    color: "rose",
    inputs: [
      {
        id: "data",
        type: "input",
        name: "Dados",
        dataType: "any",
        description: "Dados para escrita",
        required: true,
      },
    ],
    outputs: [
      {
        id: "result",
        type: "output",
        name: "Resultado",
        dataType: "object",
        description: "Resultado da operação",
      },
    ],
    properties: {
      connectionType: "MySQL",
      operation: "insert",
      table: "",
      fieldMappings: {},
    },
  },

  // Nodes de elementos de UI
  form: {
    id: "form",
    name: "Formulário",
    category: "ui-element",
    description: "Cria formulários interativos",
    icon: "FormInput",
    color: "pink",
    inputs: [],
    outputs: [
      {
        id: "submission",
        type: "output",
        name: "Submissão",
        dataType: "object",
        description: "Dados submetidos pelo formulário",
      },
    ],
    properties: {
      fields: [],
      submitButtonLabel: "Enviar",
      layout: "vertical",
    },
  },
  chart: {
    id: "chart",
    name: "Gráfico",
    category: "ui-element",
    description: "Cria visualizações de dados interativas",
    icon: "PieChart",
    color: "fuchsia",
    inputs: [
      {
        id: "data",
        type: "input",
        name: "Dados",
        dataType: "array",
        description: "Dados para o gráfico",
        required: true,
      },
    ],
    outputs: [],
    properties: {
      chartType: "bar",
      title: "",
      xField: "",
      yField: "",
      colorField: "",
    },
  },

  // Nodes de IA
  "text-generation": {
    id: "text-generation",
    name: "Geração de Texto",
    category: "ai",
    description: "Gera texto usando modelos de IA",
    icon: "Bot",
    color: "violet",
    inputs: [
      {
        id: "prompt",
        type: "input",
        name: "Prompt",
        dataType: "string",
        description: "Prompt para geração",
        required: true,
      },
    ],
    outputs: [
      {
        id: "text",
        type: "output",
        name: "Texto",
        dataType: "string",
        description: "Texto gerado",
      },
    ],
    properties: {
      model: "gpt-4",
      maxTokens: 1000,
      temperature: 0.7,
    },
  },
  "image-generation": {
    id: "image-generation",
    name: "Geração de Imagem",
    category: "ai",
    description: "Gera imagens usando modelos de IA",
    icon: "Image",
    color: "purple",
    inputs: [
      {
        id: "prompt",
        type: "input",
        name: "Prompt",
        dataType: "string",
        description: "Descrição da imagem",
        required: true,
      },
    ],
    outputs: [
      {
        id: "image",
        type: "output",
        name: "Imagem",
        dataType: "string",
        description: "URL da imagem gerada",
      },
    ],
    properties: {
      model: "dall-e-3",
      size: "1024x1024",
      quality: "standard",
    },
  },
}

// Agrupar tipos de nodes por categoria
export const NODE_CATEGORIES: Record<string, { name: string; icon: string }> = {
  "data-input": {
    id: "data-input",
    name: "Entrada de Dados",
    description: "Nodes para importar dados de várias fontes",
    icon: "FileUp",
  },
  "data-transformation": {
    id: "data-transformation",
    name: "Transformação de Dados",
    description: "Manipular, filtrar ou converter dados",
    icon: "FileText",
  },
  flow: {
    id: "flow",
    name: "Fluxo de Controle",
    description: "Ramificar, mesclar ou iterar o fluxo",
    icon: "GitBranch",
  },
  "data-output": {
    id: "data-output",
    name: "Saída de Dados",
    description: "Exportar ou visualizar dados",
    icon: "FileDown",
  },
  "ui-element": {
    id: "ui-element",
    name: "Elementos de UI",
    description: "Componentes de interface do usuário",
    icon: "Layout",
  },
  ai: {
    id: "ai",
    name: "Inteligência Artificial",
    description: "Integração com serviços de IA",
    icon: "Bot",
  },
  "app-action": {
    id: "app-action",
    name: "Ação em Aplicativo",
    description: "Interagir com aplicativos externos",
    icon: "Globe",
  },
  core: {
    id: "core",
    name: "Core",
    description: "Funcionalidades básicas do sistema",
    icon: "Code",
  },
  human: {
    id: "human",
    name: "Interação Humana",
    description: "Interação com usuários humanos",
    icon: "Users",
  },
  trigger: {
    id: "trigger",
    name: "Gatilhos",
    description: "Iniciar fluxos de trabalho",
    icon: "Zap",
  },
  input: {
    name: "Entrada",
    icon: "FileInput",
  },
  processing: {
    name: "Processamento",
    icon: "Cpu",
  },
  output: {
    name: "Saída",
    icon: "FileOutput",
  },
  data: {
    name: "Dados",
    icon: "Database",
  },
  integration: {
    name: "Integração",
    icon: "Link",
  },
  utility: {
    name: "Utilitários",
    icon: "Tool",
  },
}

// Nodes pré-definidos por categoria
const PREDEFINED_NODES: Record<string, Node[]> = {
  input: [
    {
      id: "text-input",
      name: "Entrada de Texto",
      description: "Permite a entrada de texto pelo usuário",
      category: "input",
    },
    {
      id: "file-input",
      name: "Entrada de Arquivo",
      description: "Permite o upload de arquivos",
      category: "input",
    },
  ],
  processing: [
    {
      id: "text-processor",
      name: "Processador de Texto",
      description: "Processa e transforma texto",
      category: "processing",
    },
    {
      id: "data-transformer",
      name: "Transformador de Dados",
      description: "Transforma dados de um formato para outro",
      category: "processing",
    },
  ],
  output: [
    {
      id: "text-output",
      name: "Saída de Texto",
      description: "Exibe texto como resultado",
      category: "output",
    },
    {
      id: "file-output",
      name: "Saída de Arquivo",
      description: "Gera um arquivo como resultado",
      category: "output",
    },
  ],
  ai: [
    {
      id: "text-generation",
      name: "Geração de Texto",
      description: "Gera texto usando IA",
      category: "ai",
    },
    {
      id: "image-generation",
      name: "Geração de Imagem",
      description: "Gera imagens usando IA",
      category: "ai",
    },
  ],
  data: [
    {
      id: "data-filter",
      name: "Filtro de Dados",
      description: "Filtra dados com base em critérios",
      category: "data",
    },
    {
      id: "data-aggregator",
      name: "Agregador de Dados",
      description: "Agrega dados de múltiplas fontes",
      category: "data",
    },
  ],
  integration: [
    {
      id: "api-request",
      name: "Requisição API",
      description: "Faz requisições para APIs externas",
      category: "integration",
    },
    {
      id: "webhook",
      name: "Webhook",
      description: "Recebe dados via webhook",
      category: "integration",
    },
  ],
  utility: [
    {
      id: "delay",
      name: "Atraso",
      description: "Adiciona um atraso na execução",
      category: "utility",
    },
    {
      id: "conditional",
      name: "Condicional",
      description: "Executa lógica condicional",
      category: "utility",
    },
  ],
}

// Função para obter nodes por categoria
export function getNodesByCategory(category: string): Node[] {
  return PREDEFINED_NODES[category] || []
}

// Função para obter um node por ID
export function getNodeById(id: string): Node | undefined {
  for (const category in PREDEFINED_NODES) {
    const node = PREDEFINED_NODES[category].find((node) => node.id === id)
    if (node) return node
  }
  return undefined
}

// Função para obter todos os nodes
export function getAllNodes(): Node[] {
  return Object.values(PREDEFINED_NODES).flat()
}
