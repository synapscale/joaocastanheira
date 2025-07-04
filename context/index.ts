/**
 * Exporta todos os contextos da aplicação para facilitar importações.
 */

// Contextos de gerenciamento de nós e templates
export * from "./node-definition-context"
export * from "./node-template-context"
export * from "./workflow-context"

// Contextos de criação de nós (movidos de contexts/node-creator)
export * from "./node-creator"

// Contextos de gerenciamento de variáveis e código
export { useVariables, VariableProvider } from './variable-context'
export * from "./code-template-context"

// Contextos de UI e navegação
export * from "./sidebar-context"

// Contextos de categorias personalizadas
export * from "./custom-category-context"
