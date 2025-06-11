/**
 * Tipos de dados de parâmetros suportados por nós
 */
export type ParameterDataType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "date"
  | "json"
  | "code"
  | "expression"
  | "credential"
  | "options"

/**
 * Regras de validação de parâmetros
 */
export interface ParameterValidation {
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  options?: Array<{
    name: string
    value: string | number | boolean
    description?: string
  }>
  custom?: string // Função de validação personalizada como string
}

/**
 * Definição de parâmetro de nó
 */
export interface NodeParameter {
  id: string
  name: string
  key: string
  type: "string" | "number" | "boolean" | "select" | "multiSelect" | "json" | "code" | "color" | "date" | "dateTime"
  description: string
  default?: any
  placeholder?: string
  required: boolean
  options?: { label: string; value: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    customValidation?: string // Código JavaScript como string
  }
  displayOptions?: {
    show?: {
      parameter?: string
      value?: any
    }
  }
}

/**
 * Definição de porta de entrada de nó
 */
export interface NodeInput {
  id: string
  name: string
  description?: string
  required?: boolean
  schema?: {
    type: string
    properties?: Record<string, any>
    required?: string[]
  }
}

/**
 * Definição de porta de saída de nó
 */
export interface NodeOutput {
  id: string
  name: string
  description?: string
  schema?: {
    type: string
    properties?: Record<string, any>
  }
}

/**
 * Modo de operação do nó
 */
export type NodeOperationMode = "singleItem" | "allItems" | "batch"

/**
 * Comportamento de execução do nó
 */
export interface NodeExecution {
  mode: NodeOperationMode
  timeout?: number
  retry?: {
    enabled: boolean
    count: number
    interval: number
  }
  continueOnFail?: boolean
  throttle?: {
    enabled: boolean
    rate: number
    interval: "second" | "minute" | "hour"
  }
}

/**
 * Categoria de nó
 */
export type NodeCategory = "triggers" | "operations" | "flow" | "transformations" | "ai" | "integrations" | "custom"

/**
 * Definição completa de nó
 */
export interface NodeDefinition {
  id: string
  name: string
  type: string
  category: string
  description: string
  version: string
  author?: string
  icon?: string
  color?: string
  deprecated?: boolean
  tags?: string[]
  inputs: NodePort[]
  outputs: NodePort[]
  parameters: NodeParameter[]
  templates?: NodeTemplate[]
  codeTemplate?: string
  documentation?: string
  createdAt: Date
  updatedAt: Date
  executionSettings?: {
    timeout?: number
    retryOnFail?: boolean
    maxRetries?: number
    retryDelay?: number
    throttle?: {
      rate: number
      timeframe: number // em milissegundos
    }
  }
}

/**
 * Template de nó para criar novos nós
 */
export interface NodeTemplate {
  id: string
  name: string
  description: string
  code: string
  inputs?: Record<string, any>
  outputs?: Record<string, any>
}

/**
 * Instância de nó com valores reais
 */
export interface NodeInstance {
  definitionId: string
  id: string
  name: string
  position: { x: number; y: number }
  parameterValues: Record<string, any>
  notes?: string
  disabled?: boolean
}

export interface NodePort {
  id: string
  name: string
  description?: string
  schema?: any // Esquema JSON para os dados
  required?: boolean
  multiple?: boolean // Pode conectar a múltiplos nós
}
