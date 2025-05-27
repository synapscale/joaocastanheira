import type { z } from "zod"

// Tipos de dados suportados pelo sistema
export type DataType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "date"
  | "buffer"
  | "any"
  | "null"
  | "undefined"
  | "function"
  | "custom"

// Definição de um port (entrada ou saída)
export interface SkillPort {
  id: string
  name: string
  description?: string
  dataType: DataType
  required?: boolean
  multiple?: boolean
  defaultValue?: any
  validationSchema?: z.ZodType<any>
  customTypeId?: string // Para tipos de dados personalizados
  metadata?: Record<string, any>
}

// Tipos de skills disponíveis
export type SkillType =
  | "data-transformation"
  | "data-input"
  | "data-output"
  | "control-flow"
  | "ui-interaction"
  | "integration"
  | "ai"
  | "utility"
  | "custom"

// Linguagens suportadas para implementação de skills
export type SkillLanguage = "javascript" | "typescript" | "json" | "yaml"

// Definição de uma skill
export interface Skill {
  id: string
  name: string
  description: string
  type: SkillType
  version: string
  author: string
  createdAt: string
  updatedAt: string
  inputs: SkillPort[]
  outputs: SkillPort[]
  implementation: {
    language: SkillLanguage
    code: string
    dependencies?: string[]
  }
  properties?: {
    schema: Record<string, z.ZodType<any>>
    defaultValues: Record<string, any>
    ui?: Record<string, any> // Configurações de UI para as propriedades
  }
  metadata?: {
    tags?: string[]
    category?: string
    icon?: string
    color?: string
    documentation?: string
    examples?: Array<{
      name: string
      description: string
      inputs: Record<string, any>
      outputs: Record<string, any>
      properties?: Record<string, any>
    }>
    isDeprecated?: boolean
    deprecationMessage?: string
    isExperimental?: boolean
  }
}

// Versão de uma skill
export interface SkillVersion {
  skillId: string
  version: string
  createdAt: string
  skill: Skill
}

// Referência a uma skill em um node
export interface SkillReference {
  skillId: string
  version: string
  instanceId: string // ID único para esta instância da skill no node
  properties: Record<string, any>
  position?: { x: number; y: number } // Posição dentro do node (para o editor visual)
}

// Conexão entre skills dentro de um node
export interface InternalConnection {
  id: string
  sourceSkillInstanceId: string
  sourcePortId: string
  targetSkillInstanceId: string
  targetPortId: string
}

// Definição de um node customizado baseado em skills
export interface CustomNode {
  id: string
  name: string
  description: string
  category: string
  version: string
  author: string
  createdAt: string
  updatedAt: string
  skills: SkillReference[]
  connections: InternalConnection[]
  inputs: SkillPort[] // Portas expostas externamente
  outputs: SkillPort[] // Portas expostas externamente
  inputMappings: Array<{
    nodeInputId: string
    skillInstanceId: string
    skillInputId: string
  }>
  outputMappings: Array<{
    nodeOutputId: string
    skillInstanceId: string
    skillOutputId: string
  }>
  properties?: {
    schema: Record<string, z.ZodType<any>>
    defaultValues: Record<string, any>
    ui?: Record<string, any>
  }
  metadata?: {
    tags?: string[]
    icon?: string
    color?: string
    documentation?: string
    isTemplate?: boolean
    isPublic?: boolean
  }
}

// Versão de um node customizado
export interface CustomNodeVersion {
  nodeId: string
  version: string
  createdAt: string
  node: CustomNode
}

// Tipo de dados personalizado
export interface CustomDataType {
  id: string
  name: string
  description: string
  schema: z.ZodType<any>
  version: string
  author: string
  createdAt: string
  updatedAt: string
  metadata?: {
    tags?: string[]
    category?: string
    documentation?: string
  }
}

// Resultado da execução de uma skill
export interface SkillExecutionResult {
  success: boolean
  outputs: Record<string, any>
  error?: {
    message: string
    details?: any
  }
  logs?: string[]
  executionTime?: number
  metadata?: Record<string, any>
}

// Contexto de execução para uma skill
export interface SkillExecutionContext {
  inputs: Record<string, any>
  properties: Record<string, any>
  environment: {
    nodeId: string
    workflowId: string
    executionId: string
    timestamp: number
    user?: {
      id: string
      [key: string]: any
    }
  }
  services: {
    logger: {
      log: (message: string) => void
      warn: (message: string) => void
      error: (message: string) => void
    }
    storage: {
      get: (key: string) => Promise<any>
      set: (key: string, value: any) => Promise<void>
      remove: (key: string) => Promise<void>
    }
    http: {
      get: (url: string, options?: any) => Promise<any>
      post: (url: string, data: any, options?: any) => Promise<any>
      put: (url: string, data: any, options?: any) => Promise<any>
      delete: (url: string, options?: any) => Promise<any>
    }
    [key: string]: any
  }
}
