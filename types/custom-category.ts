/**
 * Representa uma categoria personalizada criada pelo usuário.
 */
export interface CustomCategory {
  /** Identificador único da categoria */
  id: string
  /** Nome da categoria */
  name: string
  /** Descrição opcional da categoria */
  description?: string
  /** Cor da categoria em formato hexadecimal */
  color: string
  /** Emoji ou ícone da categoria */
  icon?: string
  /** ID do usuário que criou a categoria */
  userId: string
  /** Data de criação no formato ISO */
  createdAt: string
  /** Data da última atualização no formato ISO */
  updatedAt: string
  /** Número de nós associados a esta categoria */
  nodeCount: number
}

/**
 * Estende a categoria personalizada incluindo os IDs dos nós associados.
 */
export interface CustomCategoryWithNodes extends CustomCategory {
  /** Array de IDs dos nós associados a esta categoria */
  nodes: string[]
}

/**
 * Dados necessários para criar uma nova categoria personalizada.
 */
export interface CreateCustomCategoryInput {
  /** Nome da categoria */
  name: string
  /** Descrição opcional da categoria */
  description?: string
  /** Cor da categoria em formato hexadecimal */
  color: string
  /** Emoji ou ícone da categoria */
  icon?: string
}

/**
 * Dados necessários para atualizar uma categoria personalizada existente.
 */
export interface UpdateCustomCategoryInput {
  /** ID da categoria a ser atualizada */
  id: string
  /** Novo nome da categoria (opcional) */
  name?: string
  /** Nova descrição da categoria (opcional) */
  description?: string
  /** Nova cor da categoria (opcional) */
  color?: string
  /** Novo ícone da categoria (opcional) */
  icon?: string
}
