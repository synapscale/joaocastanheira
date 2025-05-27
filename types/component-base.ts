/**
 * TIPOS BASE PARA COMPONENTES
 *
 * Define interfaces e tipos base para garantir consistência
 * e reutilização em todos os componentes da aplicação.
 */

import type React from "react"

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
  /** Props HTML adicionais */
  [key: string]: any
}

/**
 * Props para componentes interativos
 */
export interface InteractiveComponentProps {
  /** Se o componente está desabilitado */
  disabled?: boolean
  /** Se o componente está em estado de carregamento */
  isLoading?: boolean
  /** Callback para clique */
  onClick?: (event: React.MouseEvent) => void
  /** Callback para tecla pressionada */
  onKeyDown?: (event: React.KeyboardEvent) => void
}

/**
 * Props para acessibilidade
 */
export interface AccessibilityProps {
  /** Label para leitores de tela */
  ariaLabel?: string
  /** Descrição para leitores de tela */
  ariaDescription?: string
  /** Role ARIA */
  role?: string
  /** Se o elemento está expandido */
  ariaExpanded?: boolean
  /** Se o elemento está selecionado */
  ariaSelected?: boolean
}

/**
 * Props para validação
 */
export interface ValidationProps {
  /** Se o campo é obrigatório */
  required?: boolean
  /** Mensagem de erro */
  error?: string
  /** Se o campo é válido */
  isValid?: boolean
  /** Função de validação customizada */
  validator?: (value: any) => boolean | string
}

/**
 * Tamanhos padrão para componentes
 */
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl"

/**
 * Variantes visuais padrão
 */
export type ComponentVariant = "default" | "primary" | "secondary" | "outline" | "ghost" | "destructive"

/**
 * Estados visuais padrão
 */
export type ComponentState = "default" | "hover" | "active" | "disabled" | "loading" | "error" | "success"

/**
 * Posições padrão
 */
export type ComponentPosition = "top" | "bottom" | "left" | "right" | "center"

/**
 * Orientações padrão
 */
export type ComponentOrientation = "horizontal" | "vertical"

/**
 * Configuração de tema
 */
export interface ThemeConfig {
  /** Esquema de cores */
  colorScheme?: "light" | "dark" | "auto"
  /** Cores customizadas */
  colors?: Record<string, string>
  /** Espaçamentos customizados */
  spacing?: Record<string, string>
  /** Tipografia customizada */
  typography?: Record<string, string>
}

/**
 * Props para componentes com tema
 */
export interface ThemeableProps {
  /** Configuração de tema */
  theme?: ThemeConfig
  /** Variante de cor */
  colorVariant?: "default" | "primary" | "secondary" | "success" | "warning" | "error"
}

/**
 * Props para componentes com animação
 */
export interface AnimationProps {
  /** Se deve animar transições */
  animated?: boolean
  /** Duração da animação em ms */
  animationDuration?: number
  /** Tipo de easing */
  animationEasing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"
}

/**
 * Props para componentes responsivos
 */
export interface ResponsiveProps {
  /** Comportamento em mobile */
  mobile?: {
    hidden?: boolean
    size?: ComponentSize
    variant?: ComponentVariant
  }
  /** Comportamento em tablet */
  tablet?: {
    hidden?: boolean
    size?: ComponentSize
    variant?: ComponentVariant
  }
  /** Comportamento em desktop */
  desktop?: {
    hidden?: boolean
    size?: ComponentSize
    variant?: ComponentVariant
  }
}

/**
 * Configuração de densidade visual
 */
export type ComponentDensity = "compact" | "comfortable" | "spacious"

/**
 * Props para componentes com densidade
 */
export interface DensityProps {
  /** Densidade visual do componente */
  density?: ComponentDensity
}
