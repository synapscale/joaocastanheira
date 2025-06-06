/**
 * Types of variables supported in the system
 */
export type VariableType = "string" | "number" | "boolean" | "json" | "secret" | "array" | "date" | "expression"

/**
 * Scope of the variable
 */
export type VariableScope = "global" | "workflow" | "node"

/**
 * Interface for variable definition
 */
export interface Variable {
  id: string
  name: string
  key: string
  type: VariableType
  value: any
  scope: VariableScope
  description?: string
  createdAt: Date
  updatedAt: Date
  isSystem?: boolean
  tags?: string[]
  encrypted?: boolean
}

/**
 * Interface for variable reference
 */
export interface VariableReference {
  variableId: string
  path?: string // For accessing nested properties in objects
}

/**
 * Interface for variable usage in a node
 */
export interface VariableUsage {
  nodeId: string
  parameterKey: string
  variableId: string
}

/**
 * Interface for variable expression
 * Used for interpolating variables in strings
 * Example: "Hello {{variables.user.name}}"
 */
export interface VariableExpression {
  raw: string // The raw expression with placeholders
  variables: VariableReference[] // References to variables used in the expression
}
