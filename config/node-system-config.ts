/**
 * CONFIGURAÇÃO CENTRALIZADA DO SISTEMA DE NODES
 *
 * Fonte única da verdade para todas as configurações de skills, categorias e transformações
 * Aplicando princípios AI-friendly para máxima legibilidade e manutenibilidade
 */

/**
 * Tipos de dados suportados pelo sistema
 * Baseado nos tipos comuns do n8n e sistemas similares
 */
export type DataType =
  | "string" // Texto simples
  | "number" // Números (int/float)
  | "boolean" // Verdadeiro/falso
  | "array" // Lista de valores
  | "object" // Objeto JSON
  | "date" // Data/hora
  | "buffer" // Dados binários
  | "any" // Qualquer tipo
  | "json" // JSON estruturado
  | "xml" // XML estruturado
  | "csv" // Dados CSV
  | "html" // HTML markup
  | "binary" // Arquivo binário

/**
 * Linguagens de implementação suportadas
 */
export type ImplementationLanguage = "javascript" | "typescript" | "python"

/**
 * Definição de categoria de skill
 * Organiza skills por funcionalidade principal
 */
export interface SkillCategory {
  /** Nome legível da categoria */
  name: string
  /** Descrição da funcionalidade */
  description: string
  /** Cor para identificação visual */
  color: string
  /** Ícone representativo */
  icon: string
}

/**
 * Template de skill pré-definida
 * Baseado nas skills mais comuns do n8n
 */
export interface SkillTemplate {
  /** Identificador único */
  id: string
  /** Nome da skill */
  name: string
  /** Descrição funcional */
  description: string
  /** Categoria principal */
  category: string
  /** Inputs esperados */
  inputs: string[]
  /** Outputs gerados */
  outputs: string[]
  /** Código de implementação */
  code: string
  /** Exemplos de uso */
  examples?: string[]
}

/**
 * CATEGORIAS DE SKILLS
 * Organizadas por funcionalidade principal, seguindo padrões do n8n
 */
export const SKILL_CATEGORIES: Record<string, SkillCategory> = {
  "data-input": {
    name: "Entrada de Dados",
    description: "Skills para capturar e receber dados de fontes externas",
    color: "#10B981", // Verde
    icon: "download",
  },
  "data-transformation": {
    name: "Transformação",
    description: "Skills para processar, filtrar e transformar dados",
    color: "#3B82F6", // Azul
    icon: "refresh-cw",
  },
  "data-output": {
    name: "Saída de Dados",
    description: "Skills para enviar e armazenar dados em destinos",
    color: "#8B5CF6", // Roxo
    icon: "upload",
  },
  "control-flow": {
    name: "Controle de Fluxo",
    description: "Skills para lógica condicional e controle de execução",
    color: "#F59E0B", // Amarelo
    icon: "git-branch",
  },
  ai: {
    name: "Inteligência Artificial",
    description: "Skills para processamento com IA e machine learning",
    color: "#EF4444", // Vermelho
    icon: "brain",
  },
  utility: {
    name: "Utilitários",
    description: "Skills auxiliares e ferramentas gerais",
    color: "#6B7280", // Cinza
    icon: "tool",
  },
} as const

/**
 * SKILLS PRÉ-DEFINIDAS
 * Templates baseados nas skills mais utilizadas do n8n
 * Organizadas por categoria para facilitar descoberta
 */
export const CORE_SKILLS: Record<string, SkillTemplate> = {
  // === ENTRADA DE DADOS ===
  "http-request": {
    id: "http-request",
    name: "HTTP Request",
    description: "Realiza requisições HTTP para APIs e serviços web",
    category: "data-input",
    inputs: ["url", "method", "headers", "body"],
    outputs: ["response", "statusCode", "headers"],
    code: `
// HTTP Request Skill
const { url, method = 'GET', headers = {}, body } = inputs;

try {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: method !== 'GET' ? JSON.stringify(body) : undefined
  });

  const data = await response.json();

  return {
    response: data,
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries())
  };
} catch (error) {
  throw new Error(\`HTTP Request failed: \${error.message}\`);
}
    `.trim(),
  },

  "webhook-listener": {
    id: "webhook-listener",
    name: "Webhook Listener",
    description: "Recebe dados via webhook HTTP",
    category: "data-input",
    inputs: ["endpoint", "method", "authentication"],
    outputs: ["payload", "headers", "query"],
    code: `
// Webhook Listener Skill
const { endpoint, method = 'POST', authentication } = inputs;

// Simular recebimento de webhook
const webhookData = {
  payload: inputs.payload || {},
  headers: inputs.headers || {},
  query: inputs.query || {},
  timestamp: new Date().toISOString()
};

return {
  payload: webhookData.payload,
  headers: webhookData.headers,
  query: webhookData.query
};
    `.trim(),
  },

  // === TRANSFORMAÇÃO DE DADOS ===
  "data-mapper": {
    id: "data-mapper",
    name: "Data Mapper",
    description: "Mapeia e transforma estruturas de dados",
    category: "data-transformation",
    inputs: ["data", "mapping", "options"],
    outputs: ["mappedData", "unmappedFields"],
    code: `
// Data Mapper Skill
const { data, mapping, options = {} } = inputs;

if (!data || !mapping) {
  throw new Error('Data and mapping are required');
}

const mappedData = {};
const unmappedFields = [];

// Aplicar mapeamento
Object.entries(mapping).forEach(([targetField, sourceField]) => {
  if (data.hasOwnProperty(sourceField)) {
    mappedData[targetField] = data[sourceField];
  } else {
    unmappedFields.push(sourceField);
  }
});

// Aplicar transformações opcionais
if (options.lowercase) {
  Object.keys(mappedData).forEach(key => {
    if (typeof mappedData[key] === 'string') {
      mappedData[key] = mappedData[key].toLowerCase();
    }
  });
}

return {
  mappedData,
  unmappedFields
};
    `.trim(),
  },

  "json-filter": {
    id: "json-filter",
    name: "JSON Filter",
    description: "Filtra dados JSON baseado em critérios",
    category: "data-transformation",
    inputs: ["data", "filters", "operator"],
    outputs: ["filteredData", "excludedData"],
    code: `
// JSON Filter Skill
const { data, filters, operator = 'AND' } = inputs;

if (!Array.isArray(data)) {
  throw new Error('Data must be an array');
}

const filteredData = data.filter(item => {
  const results = filters.map(filter => {
    const { field, condition, value } = filter;
    const itemValue = item[field];

    switch (condition) {
      case 'equals': return itemValue === value;
      case 'contains': return String(itemValue).includes(value);
      case 'greater': return Number(itemValue) > Number(value);
      case 'less': return Number(itemValue) < Number(value);
      default: return false;
    }
  });

  return operator === 'AND' ? 
    results.every(r => r) : 
    results.some(r => r);
});

const excludedData = data.filter(item => !filteredData.includes(item));

return {
  filteredData,
  excludedData
};
    `.trim(),
  },

  // === CONTROLE DE FLUXO ===
  "conditional-logic": {
    id: "conditional-logic",
    name: "Conditional Logic",
    description: "Executa lógica condicional baseada em critérios",
    category: "control-flow",
    inputs: ["condition", "trueValue", "falseValue"],
    outputs: ["result", "conditionMet"],
    code: `
// Conditional Logic Skill
const { condition, trueValue, falseValue } = inputs;

let conditionMet = false;

// Avaliar condição
if (typeof condition === 'boolean') {
  conditionMet = condition;
} else if (typeof condition === 'string') {
  // Avaliar expressão simples
  conditionMet = condition.toLowerCase() === 'true';
} else if (typeof condition === 'object' && condition !== null) {
  // Avaliar objeto de condição
  const { field, operator, value } = condition;
  const fieldValue = inputs[field];
  
  switch (operator) {
    case '===': conditionMet = fieldValue === value; break;
    case '>': conditionMet = Number(fieldValue) > Number(value); break;
    case '<': conditionMet = Number(fieldValue) < Number(value); break;
    case 'includes': conditionMet = String(fieldValue).includes(value); break;
    default: conditionMet = false;
  }
}

const result = conditionMet ? trueValue : falseValue;

return {
  result,
  conditionMet
};
    `.trim(),
  },

  // === INTELIGÊNCIA ARTIFICIAL ===
  "text-analyzer": {
    id: "text-analyzer",
    name: "Text Analyzer",
    description: "Analisa texto usando IA para extrair insights",
    category: "ai",
    inputs: ["text", "analysisType", "options"],
    outputs: ["analysis", "confidence", "metadata"],
    code: `
// Text Analyzer Skill
const { text, analysisType = 'sentiment', options = {} } = inputs;

if (!text || typeof text !== 'string') {
  throw new Error('Valid text input is required');
}

let analysis = {};
let confidence = 0;

switch (analysisType) {
  case 'sentiment':
    // Análise de sentimento simples
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing'];
    
    const words = text.toLowerCase().split(/\\s+/);
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;
    
    if (positiveCount > negativeCount) {
      analysis = { sentiment: 'positive', score: 0.7 };
      confidence = 0.8;
    } else if (negativeCount > positiveCount) {
      analysis = { sentiment: 'negative', score: -0.7 };
      confidence = 0.8;
    } else {
      analysis = { sentiment: 'neutral', score: 0 };
      confidence = 0.6;
    }
    break;

  case 'keywords':
    // Extração de palavras-chave simples
    const keywords = text
      .toLowerCase()
      .split(/\\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
    
    analysis = { keywords };
    confidence = 0.7;
    break;

  default:
    throw new Error(\`Analysis type '\${analysisType}' not supported\`);
}

return {
  analysis,
  confidence,
  metadata: {
    textLength: text.length,
    wordCount: text.split(/\\s+/).length,
    analysisType
  }
};
    `.trim(),
  },

  // === SAÍDA DE DADOS ===
  "email-sender": {
    id: "email-sender",
    name: "Email Sender",
    description: "Envia emails via SMTP ou serviços de email",
    category: "data-output",
    inputs: ["to", "subject", "body", "attachments"],
    outputs: ["messageId", "status", "timestamp"],
    code: `
// Email Sender Skill
const { to, subject, body, attachments = [] } = inputs;

// Validações
if (!to || !subject || !body) {
  throw new Error('To, subject, and body are required');
}

// Simular envio de email
const messageId = \`msg_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
const timestamp = new Date().toISOString();

// Aqui seria implementada a lógica real de envio
console.log(\`Sending email to: \${to}\`);
console.log(\`Subject: \${subject}\`);
console.log(\`Body length: \${body.length} characters\`);

if (attachments.length > 0) {
  console.log(\`Attachments: \${attachments.length} files\`);
}

return {
  messageId,
  status: 'sent',
  timestamp
};
    `.trim(),
  },
} as const

/**
 * CONFIGURAÇÕES DE TRANSFORMAÇÃO
 * Define como converter entre formatos internos e externos
 */
export const TRANSFORMATION_CONFIG = {
  /** Formato padrão para export */
  defaultExportFormat: "n8n-compatible",

  /** Mapeamentos de tipos */
  typeMapping: {
    internal: {
      string: "string",
      number: "number",
      boolean: "boolean",
      array: "array",
      object: "object",
    },
    n8n: {
      string: "string",
      number: "number",
      boolean: "boolean",
      array: "collection",
      object: "object",
    },
  },

  /** Configurações de validação */
  validation: {
    enableTypeChecking: true,
    enableRuntimeValidation: true,
    strictMode: false,
  },
} as const

/**
 * CONFIGURAÇÕES DE INTEGRAÇÃO
 * Define como o sistema se integra com canvas externos e formatos
 */
export const INTEGRATION_CONFIG = {
  /** Formato padrão para export */
  EXPORT_FORMAT: "canvas-node-v1",

  /** Configurações de execução */
  EXECUTION: {
    DEFAULT_TIMEOUT: 30000,
    DEFAULT_RETRIES: 3,
    SANDBOX_MODE: true,
  },

  /** Configurações de validação */
  VALIDATION: {
    STRICT_TYPES: true,
    REQUIRE_DESCRIPTIONS: true,
    MIN_NAME_LENGTH: 3,
  },
} as const

/**
 * Utilitário para obter configuração de categoria
 */
export function getSkillCategory(categoryId: string): SkillCategory | undefined {
  return SKILL_CATEGORIES[categoryId]
}

/**
 * Utilitário para obter template de skill
 */
export function getSkillTemplate(templateId: string): SkillTemplate | undefined {
  return CORE_SKILLS[templateId]
}

/**
 * Utilitário para listar skills por categoria
 */
export function getSkillsByCategory(categoryId: string): SkillTemplate[] {
  return Object.values(CORE_SKILLS).filter((skill) => skill.category === categoryId)
}

/**
 * Utilitário para validar tipo de dados
 */
export function isValidDataType(type: string): type is DataType {
  const validTypes: DataType[] = [
    "string",
    "number",
    "boolean",
    "array",
    "object",
    "date",
    "buffer",
    "any",
    "json",
    "xml",
    "csv",
    "html",
    "binary",
  ]
  return validTypes.includes(type as DataType)
}
