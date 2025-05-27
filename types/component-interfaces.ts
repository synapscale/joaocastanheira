import type React from "react"
/**
 * Interfaces base para componentes parametrizáveis
 *
 * Estas interfaces garantem consistência entre todos os componentes
 * e facilitam a manutenção e extensão futura.
 */

/**
 * Props base que todos os componentes devem implementar
 */
export interface BaseComponentProps {
  /** Classe CSS adicional */
  className?: string
  /** ID único para o componente */
  id?: string
  /** ID para testes automatizados */
  testId?: string
}

/**
 * Props de acessibilidade padrão
 */
export interface AccessibilityProps {
  /** Label para leitores de tela */
  ariaLabel?: string
  /** Descrição para leitores de tela */
  ariaDescription?: string
  /** ID do elemento que descreve este componente */
  ariaDescribedBy?: string
  /** ID do elemento que rotula este componente */
  ariaLabelledBy?: string
  /** Role ARIA do componente */
  role?: string
  /** Índice de tabulação */
  tabIndex?: number
}

/**
 * Props de interação padrão
 */
export interface InteractionProps {
  /** Se o componente está desabilitado */
  disabled?: boolean
  /** Se o componente está em estado de carregamento */
  isLoading?: boolean
  /** Se o componente está selecionado */
  isSelected?: boolean
  /** Se o componente está ativo */
  isActive?: boolean
  /** Callback de clique */
  onClick?: (event: React.MouseEvent) => void
  /** Callback de tecla pressionada */
  onKeyDown?: (event: React.KeyboardEvent) => void
  /** Callback de foco */
  onFocus?: (event: React.FocusEvent) => void
  /** Callback de perda de foco */
  onBlur?: (event: React.FocusEvent) => void
}

/**
 * Props visuais padrão
 */
export interface VisualProps {
  /** Tamanho do componente */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /** Variante visual */
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "destructive"
  /** Esquema de cores */
  colorScheme?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  /** Se deve ocupar toda a largura disponível */
  fullWidth?: boolean
}

/**
 * Props de validação padrão
 */
export interface ValidationProps {
  /** Se o campo é obrigatório */
  required?: boolean
  /** Mensagem de erro */
  error?: string
  /** Se o campo é válido */
  isValid?: boolean
  /** Se o campo foi tocado pelo usuário */
  isTouched?: boolean
}
