"use client"

/**
 * TAG INPUT - COMPONENTE APRIMORADO
 *
 * Componente altamente parametrizável para entrada e gerenciamento de tags.
 * Suporta validação, auto-complete, temas customizados e acessibilidade completa.
 */

import type React from "react"
import { useState, useRef, useCallback, useMemo, useEffect, type KeyboardEvent, type FocusEvent } from "react"
import { X, Plus, Tag, AlertCircle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type {
  BaseComponentProps,
  InteractiveComponentProps,
  AccessibilityProps,
  ValidationProps,
  ComponentSize,
  ComponentVariant,
  ThemeableProps,
  AnimationProps,
  ResponsiveProps,
  DensityProps,
} from "@/types/component-base"

// ===== TIPOS E INTERFACES =====

/**
 * Configuração de tag individual
 */
export interface TagConfig {
  /** Valor da tag */
  value: string
  /** Label de exibição (se diferente do valor) */
  label?: string
  /** Se a tag está desabilitada */
  disabled?: boolean
  /** Cor customizada da tag */
  color?: string
  /** Ícone da tag */
  icon?: React.ReactNode
  /** Metadados adicionais */
  metadata?: Record<string, any>
}

/**
 * Configuração de validação avançada
 */
export interface TagValidationConfig {
  /** Tamanho mínimo da tag */
  minLength?: number
  /** Tamanho máximo da tag */
  maxLength?: number
  /** Padrão regex para validação */
  pattern?: RegExp
  /** Lista de tags proibidas */
  blacklist?: string[]
  /** Lista de tags permitidas (whitelist) */
  whitelist?: string[]
  /** Se deve normalizar tags (trim, lowercase) */
  normalize?: boolean
  /** Função de validação customizada */
  customValidator?: (tag: string, existingTags: string[]) => boolean | string
}

/**
 * Configuração de auto-complete
 */
export interface AutoCompleteConfig {
  /** Se auto-complete está habilitado */
  enabled: boolean
  /** Lista de sugestões */
  suggestions: string[] | TagConfig[]
  /** Número máximo de sugestões exibidas */
  maxSuggestions?: number
  /** Se deve filtrar sugestões baseado no input */
  filterSuggestions?: boolean
  /** Função de filtro customizada */
  customFilter?: (suggestion: string | TagConfig, input: string) => boolean
  /** Se deve destacar texto correspondente */
  highlightMatch?: boolean
  /** Delay para busca (debounce) */
  searchDelay?: number
}

/**
 * Configuração visual avançada
 */
export interface TagInputVisualConfig {
  /** Estilo do container */
  containerStyle?: "default" | "bordered" | "filled" | "minimal"
  /** Layout das tags */
  tagLayout?: "inline" | "grid" | "list"
  /** Animações de entrada/saída */
  tagAnimations?: boolean
  /** Mostrar contador de tags */
  showCounter?: boolean
  /** Mostrar ícone de adicionar */
  showAddIcon?: boolean
  /** Mostrar indicador de validação */
  showValidationIcon?: boolean
  /** Posição do indicador de validação */
  validationIconPosition?: "left" | "right"
}

/**
 * Props principais do TagInput
 */
export interface TagInputProps
  extends BaseComponentProps,
    InteractiveComponentProps,
    AccessibilityProps,
    ValidationProps,
    ThemeableProps,
    AnimationProps,
    ResponsiveProps,
    DensityProps {
  // ===== PROPS OBRIGATÓRIAS =====
  /** Callback quando tags são alteradas */
  onTagsChange: (tags: string[]) => void

  // ===== CONTEÚDO =====
  /** Tags iniciais */
  initialTags?: string[] | TagConfig[]
  /** Placeholder do input */
  placeholder?: string
  /** Label do componente */
  label?: string
  /** Texto de ajuda */
  helpText?: string
  /** Mensagem quando não há tags */
  emptyMessage?: string

  // ===== COMPORTAMENTAIS =====
  /** Tamanho do componente */
  size?: ComponentSize
  /** Variante visual */
  variant?: ComponentVariant
  /** Número máximo de tags */
  maxTags?: number
  /** Se permite tags duplicadas */
  allowDuplicates?: boolean
  /** Delimitadores para criação de tags */
  delimiters?: string[]
  /** Se deve criar tag ao perder foco */
  createOnBlur?: boolean
  /** Se deve criar tag ao colar texto */
  createOnPaste?: boolean
  /** Configuração de validação */
  validation?: TagValidationConfig
  /** Configuração de auto-complete */
  autoComplete?: AutoCompleteConfig
  /** Configuração visual */
  visual?: TagInputVisualConfig

  // ===== EVENTOS =====
  /** Callback quando tag é adicionada */
  onTagAdd?: (tag: string, index: number) => void
  /** Callback quando tag é removida */
  onTagRemove?: (tag: string, index: number) => void
  /** Callback quando ocorre erro de validação */
  onValidationError?: (error: string, tag: string) => void
  /** Callback quando input ganha foco */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  /** Callback quando input perde foco */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  /** Callback quando input muda */
  onInputChange?: (value: string) => void
  /** Callback quando sugestão é selecionada */
  onSuggestionSelect?: (suggestion: string | TagConfig) => void

  // ===== CUSTOMIZAÇÃO AVANÇADA =====
  /** Função para renderizar tag customizada */
  renderTag?: (tag: string, index: number, onRemove: () => void) => React.ReactNode
  /** Função para renderizar sugestão customizada */
  renderSuggestion?: (suggestion: string | TagConfig, isHighlighted: boolean) => React.ReactNode
  /** Função para renderizar contador customizado */
  renderCounter?: (current: number, max: number) => React.ReactNode
  /** Função para renderizar ícone de validação */
  renderValidationIcon?: (isValid: boolean, error?: string) => React.ReactNode
}

// ===== CONFIGURAÇÕES PADRÃO =====

const DEFAULT_VALIDATION: TagValidationConfig = {
  minLength: 1,
  maxLength: 50,
  normalize: true,
  blacklist: [],
  whitelist: undefined,
}

const DEFAULT_VISUAL: TagInputVisualConfig = {
  containerStyle: "default",
  tagLayout: "inline",
  tagAnimations: true,
  showCounter: false,
  showAddIcon: true,
  showValidationIcon: true,
  validationIconPosition: "right",
}

const DEFAULT_AUTOCOMPLETE: AutoCompleteConfig = {
  enabled: false,
  suggestions: [],
  maxSuggestions: 5,
  filterSuggestions: true,
  highlightMatch: true,
  searchDelay: 300,
}

// ===== ESTILOS CONFIGURÁVEIS =====

const sizeStyles = {
  xs: {
    container: "min-h-7 text-xs",
    input: "text-xs",
    tag: "text-xs px-2 py-0.5",
    icon: "h-3 w-3",
  },
  sm: {
    container: "min-h-8 text-sm",
    input: "text-sm",
    tag: "text-xs px-2 py-1",
    icon: "h-3 w-3",
  },
  md: {
    container: "min-h-10 text-sm",
    input: "text-sm",
    tag: "text-sm px-3 py-1",
    icon: "h-4 w-4",
  },
  lg: {
    container: "min-h-12 text-base",
    input: "text-base",
    tag: "text-sm px-4 py-1.5",
    icon: "h-4 w-4",
  },
  xl: {
    container: "min-h-14 text-lg",
    input: "text-lg",
    tag: "text-base px-5 py-2",
    icon: "h-5 w-5",
  },
}

const densityStyles = {
  compact: "gap-1 p-1",
  comfortable: "gap-2 p-2",
  spacious: "gap-3 p-3",
}

const containerStyles = {
  default: "border border-input bg-background",
  bordered: "border-2 border-input bg-background",
  filled: "border-0 bg-muted",
  minimal: "border-0 bg-transparent",
}

// ===== COMPONENTE PRINCIPAL =====

/**
 * TagInput - Componente aprimorado para entrada de tags
 *
 * @example
 * // Uso básico
 * <TagInput
 *   onTagsChange={setTags}
 *   placeholder="Adicionar tags..."
 * />
 *
 * @example
 * // Com validação e auto-complete
 * <TagInput
 *   onTagsChange={setTags}
 *   maxTags={10}
 *   validation={{
 *     minLength: 3,
 *     pattern: /^[a-zA-Z0-9-]+$/,
 *     customValidator: (tag) => !tag.includes('spam')
 *   }}
 *   autoComplete={{
 *     enabled: true,
 *     suggestions: ['react', 'typescript', 'javascript'],
 *     maxSuggestions: 5
 *   }}
 *   visual={{
 *     showCounter: true,
 *     tagAnimations: true
 *   }}
 * />
 *
 * @example
 * // Customizado com renderização própria
 * <TagInput
 *   onTagsChange={setTags}
 *   renderTag={(tag, index, onRemove) => (
 *     <CustomTag key={index} value={tag} onRemove={onRemove} />
 *   )}
 *   renderCounter={(current, max) => (
 *     <span className="text-xs">{current}/{max} tags</span>
 *   )}
 * />
 */
export function TagInput({
  // Obrigatórias
  onTagsChange,

  // Conteúdo
  initialTags = [],
  placeholder = "Adicionar tag...",
  label,
  helpText,
  emptyMessage,

  // Comportamentais
  size = "md",
  variant = "default",
  maxTags = Number.POSITIVE_INFINITY,
  allowDuplicates = false,
  delimiters = [",", "Enter"],
  createOnBlur = true,
  createOnPaste = true,
  validation = DEFAULT_VALIDATION,
  autoComplete = DEFAULT_AUTOCOMPLETE,
  visual = DEFAULT_VISUAL,
  disabled = false,
  isLoading = false,
  required = false,
  error,

  // Eventos
  onTagAdd,
  onTagRemove,
  onValidationError,
  onFocus,
  onBlur,
  onInputChange,
  onSuggestionSelect,

  // Customização
  renderTag,
  renderSuggestion,
  renderCounter,
  renderValidationIcon,

  // Acessibilidade
  ariaLabel,
  ariaDescription,

  // Base
  className,
  id,
  testId,
  density = "comfortable",
  animated = true,
  colorVariant = "default",

  ...props
}: TagInputProps) {
  // ===== ESTADO LOCAL =====
  const [tags, setTags] = useState<string[]>(() => {
    if (Array.isArray(initialTags)) {
      return initialTags.map((tag) => (typeof tag === "string" ? tag : tag.value))
    }
    return []
  })

  const [inputValue, setInputValue] = useState("")
  const [validationError, setValidationError] = useState<string | null>(error || null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ===== CONFIGURAÇÕES MESCLADAS =====
  const mergedValidation = useMemo(() => ({ ...DEFAULT_VALIDATION, ...validation }), [validation])
  const mergedVisual = useMemo(() => ({ ...DEFAULT_VISUAL, ...visual }), [visual])
  const mergedAutoComplete = useMemo(() => ({ ...DEFAULT_AUTOCOMPLETE, ...autoComplete }), [autoComplete])

  // ===== ESTILOS COMPUTADOS =====
  const currentSizeStyles = sizeStyles[size]
  const currentDensityStyles = densityStyles[density]
  const currentContainerStyles = containerStyles[mergedVisual.containerStyle || "default"]

  // ===== VALIDAÇÃO DE TAG =====
  const validateTag = useCallback(
    (tag: string): { isValid: boolean; error?: string } => {
      const normalizedTag = mergedValidation.normalize ? tag.trim().toLowerCase() : tag

      // Verificar tamanho mínimo
      if (mergedValidation.minLength && normalizedTag.length < mergedValidation.minLength) {
        return {
          isValid: false,
          error: `Tag deve ter pelo menos ${mergedValidation.minLength} caracteres`,
        }
      }

      // Verificar tamanho máximo
      if (mergedValidation.maxLength && normalizedTag.length > mergedValidation.maxLength) {
        return {
          isValid: false,
          error: `Tag deve ter no máximo ${mergedValidation.maxLength} caracteres`,
        }
      }

      // Verificar padrão regex
      if (mergedValidation.pattern && !mergedValidation.pattern.test(normalizedTag)) {
        return {
          isValid: false,
          error: "Tag contém caracteres inválidos",
        }
      }

      // Verificar blacklist
      if (mergedValidation.blacklist?.includes(normalizedTag)) {
        return {
          isValid: false,
          error: "Esta tag não é permitida",
        }
      }

      // Verificar whitelist
      if (mergedValidation.whitelist && !mergedValidation.whitelist.includes(normalizedTag)) {
        return {
          isValid: false,
          error: "Tag não está na lista de permitidas",
        }
      }

      // Verificar duplicatas
      if (!allowDuplicates && tags.includes(normalizedTag)) {
        return {
          isValid: false,
          error: "Esta tag já foi adicionada",
        }
      }

      // Verificar limite máximo
      if (tags.length >= maxTags) {
        return {
          isValid: false,
          error: `Número máximo de ${maxTags} tags atingido`,
        }
      }

      // Validação customizada
      if (mergedValidation.customValidator) {
        const customResult = mergedValidation.customValidator(normalizedTag, tags)
        if (typeof customResult === "string") {
          return { isValid: false, error: customResult }
        }
        if (!customResult) {
          return { isValid: false, error: "Tag inválida" }
        }
      }

      return { isValid: true }
    },
    [tags, mergedValidation, allowDuplicates, maxTags],
  )

  // ===== GERENCIAMENTO DE TAGS =====
  const addTag = useCallback(
    (tagValue: string) => {
      if (!tagValue.trim()) return

      const validation = validateTag(tagValue)
      if (!validation.isValid) {
        setValidationError(validation.error || "Tag inválida")
        onValidationError?.(validation.error || "Tag inválida", tagValue)
        return
      }

      const normalizedTag = mergedValidation.normalize ? tagValue.trim().toLowerCase() : tagValue.trim()
      const newTags = [...tags, normalizedTag]

      setTags(newTags)
      setInputValue("")
      setValidationError(null)
      setShowSuggestions(false)

      onTagsChange(newTags)
      onTagAdd?.(normalizedTag, newTags.length - 1)
    },
    [tags, validateTag, mergedValidation.normalize, onTagsChange, onTagAdd, onValidationError],
  )

  const removeTag = useCallback(
    (index: number) => {
      if (disabled) return

      const removedTag = tags[index]
      const newTags = tags.filter((_, i) => i !== index)

      setTags(newTags)
      onTagsChange(newTags)
      onTagRemove?.(removedTag, index)
    },
    [tags, disabled, onTagsChange, onTagRemove],
  )

  // ===== SUGESTÕES FILTRADAS =====
  const filteredSuggestions = useMemo(() => {
    if (!mergedAutoComplete.enabled || !inputValue.trim()) return []

    const suggestions = mergedAutoComplete.suggestions
    const maxSuggestions = mergedAutoComplete.maxSuggestions || 5

    if (!mergedAutoComplete.filterSuggestions) {
      return suggestions.slice(0, maxSuggestions)
    }

    const filtered = suggestions.filter((suggestion) => {
      const suggestionValue = typeof suggestion === "string" ? suggestion : suggestion.value
      const isAlreadyAdded = tags.includes(suggestionValue)

      if (isAlreadyAdded && !allowDuplicates) return false

      if (mergedAutoComplete.customFilter) {
        return mergedAutoComplete.customFilter(suggestion, inputValue)
      }

      return suggestionValue.toLowerCase().includes(inputValue.toLowerCase())
    })

    return filtered.slice(0, maxSuggestions)
  }, [mergedAutoComplete, inputValue, tags, allowDuplicates])

  // ===== HANDLERS DE EVENTOS =====
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      setValidationError(null)
      setHighlightedSuggestion(-1)

      if (mergedAutoComplete.enabled && value.trim()) {
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }

      onInputChange?.(value)
    },
    [mergedAutoComplete.enabled, onInputChange],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      // Navegação nas sugestões
      if (showSuggestions && filteredSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setHighlightedSuggestion((prev) => (prev + 1) % filteredSuggestions.length)
          return
        }
        if (e.key === "ArrowUp") {
          e.preventDefault()
          setHighlightedSuggestion((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length)
          return
        }
        if (e.key === "Tab" && highlightedSuggestion >= 0) {
          e.preventDefault()
          const suggestion = filteredSuggestions[highlightedSuggestion]
          const suggestionValue = typeof suggestion === "string" ? suggestion : suggestion.value
          addTag(suggestionValue)
          onSuggestionSelect?.(suggestion)
          return
        }
      }

      // Criar tag com delimitadores
      if (delimiters.includes(e.key)) {
        e.preventDefault()
        if (highlightedSuggestion >= 0 && filteredSuggestions.length > 0) {
          const suggestion = filteredSuggestions[highlightedSuggestion]
          const suggestionValue = typeof suggestion === "string" ? suggestion : suggestion.value
          addTag(suggestionValue)
          onSuggestionSelect?.(suggestion)
        } else {
          addTag(inputValue)
        }
        return
      }

      // Remover última tag com Backspace
      if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        removeTag(tags.length - 1)
        return
      }

      // Fechar sugestões com Escape
      if (e.key === "Escape") {
        setShowSuggestions(false)
        setHighlightedSuggestion(-1)
        return
      }
    },
    [
      disabled,
      showSuggestions,
      filteredSuggestions,
      highlightedSuggestion,
      delimiters,
      inputValue,
      tags,
      addTag,
      removeTag,
      onSuggestionSelect,
    ],
  )

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (mergedAutoComplete.enabled && inputValue.trim()) {
        setShowSuggestions(true)
      }
      onFocus?.(e)
    },
    [mergedAutoComplete.enabled, inputValue, onFocus],
  )

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)

      // Delay para permitir clique em sugestões
      setTimeout(() => {
        setShowSuggestions(false)
        setHighlightedSuggestion(-1)

        if (createOnBlur && inputValue.trim()) {
          addTag(inputValue)
        }
      }, 150)

      onBlur?.(e)
    },
    [createOnBlur, inputValue, addTag, onBlur],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!createOnPaste) return

      e.preventDefault()
      const pastedText = e.clipboardData.getData("text")
      const newTags = pastedText
        .split(/[,;\n\t]/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      newTags.forEach((tag) => addTag(tag))
    },
    [createOnPaste, addTag],
  )

  // ===== RENDERIZAÇÃO DE ELEMENTOS =====
  const renderTagElement = useCallback(
    (tag: string, index: number) => {
      if (renderTag) {
        return renderTag(tag, index, () => removeTag(index))
      }

      return (
        <Badge
          key={`${tag}-${index}`}
          variant={variant as any}
          className={cn(
            "flex items-center gap-1 transition-all",
            currentSizeStyles.tag,
            animated && "animate-in fade-in-0 slide-in-from-left-1",
            colorVariant !== "default" && `bg-${colorVariant}-100 text-${colorVariant}-800`,
          )}
        >
          <Tag className={currentSizeStyles.icon} />
          <span className="truncate">{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
              aria-label={`Remover tag ${tag}`}
            >
              <X className={currentSizeStyles.icon} />
            </button>
          )}
        </Badge>
      )
    },
    [renderTag, removeTag, variant, currentSizeStyles, animated, colorVariant, disabled],
  )

  const renderSuggestionElement = useCallback(
    (suggestion: string | (typeof mergedAutoComplete.suggestions)[0], index: number) => {
      const suggestionValue = typeof suggestion === "string" ? suggestion : (suggestion as TagConfig).value
      const isHighlighted = index === highlightedSuggestion

      if (renderSuggestion) {
        return renderSuggestion(suggestion, isHighlighted)
      }

      return (
        <button
          key={suggestionValue}
          type="button"
          className={cn(
            "w-full text-left px-3 py-2 text-sm transition-colors",
            isHighlighted ? "bg-accent text-accent-foreground" : "hover:bg-muted",
          )}
          onClick={() => {
            addTag(suggestionValue)
            onSuggestionSelect?.(suggestion)
          }}
          onMouseEnter={() => setHighlightedSuggestion(index)}
        >
          {mergedAutoComplete.highlightMatch ? (
            <span
              dangerouslySetInnerHTML={{
                __html: suggestionValue.replace(
                  new RegExp(`(${inputValue})`, "gi"),
                  "<mark class='bg-yellow-200 dark:bg-yellow-800'>$1</mark>",
                ),
              }}
            />
          ) : (
            suggestionValue
          )}
        </button>
      )
    },
    [
      highlightedSuggestion,
      renderSuggestion,
      addTag,
      onSuggestionSelect,
      mergedAutoComplete.highlightMatch,
      inputValue,
    ],
  )

  const renderValidationIconElement = useCallback(() => {
    if (!mergedVisual.showValidationIcon) return null

    if (renderValidationIcon) {
      return renderValidationIcon(!validationError, validationError || undefined)
    }

    if (validationError) {
      return <AlertCircle className={cn(currentSizeStyles.icon, "text-destructive")} />
    }

    if (tags.length > 0) {
      return <CheckCircle className={cn(currentSizeStyles.icon, "text-success")} />
    }

    return null
  }, [mergedVisual.showValidationIcon, renderValidationIcon, validationError, tags.length, currentSizeStyles])

  const renderCounterElement = useCallback(() => {
    if (!mergedVisual.showCounter) return null

    if (renderCounter) {
      return renderCounter(tags.length, maxTags)
    }

    return (
      <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
        <span>
          {tags.length} {tags.length === 1 ? "tag" : "tags"}
        </span>
        {maxTags !== Number.POSITIVE_INFINITY && (
          <span>
            {tags.length}/{maxTags}
          </span>
        )}
      </div>
    )
  }, [mergedVisual.showCounter, renderCounter, tags.length, maxTags])

  // ===== EFEITOS =====
  useEffect(() => {
    setValidationError(error || null)
  }, [error])

  // ===== RENDERIZAÇÃO PRINCIPAL =====
  return (
    <div className={cn("w-full space-y-2", className)} data-testid={testId} {...props}>
      {/* Label */}
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Container principal */}
      <div className="relative">
        <div
          ref={containerRef}
          className={cn(
            "flex flex-wrap rounded-md transition-all",
            currentSizeStyles.container,
            currentDensityStyles,
            currentContainerStyles,
            isFocused && "ring-2 ring-ring ring-offset-2",
            validationError && "border-destructive",
            disabled && "opacity-60 cursor-not-allowed",
          )}
          aria-label={ariaLabel}
          aria-describedby={ariaDescription}
        >
          {/* Tags existentes */}
          {tags.map((tag, index) => renderTagElement(tag, index))}

          {/* Input para novas tags */}
          {tags.length < maxTags && (
            <div className="flex-1 min-w-[120px] relative">
              <Input
                ref={inputRef}
                id={id}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onPaste={handlePaste}
                placeholder={tags.length === 0 ? placeholder : ""}
                disabled={disabled || isLoading}
                className={cn(
                  "border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0",
                  currentSizeStyles.input,
                )}
                aria-label={`Adicionar nova tag. ${tags.length} de ${maxTags === Number.POSITIVE_INFINITY ? "∞" : maxTags} tags adicionadas`}
              />

              {/* Sugestões de auto-complete */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => renderSuggestionElement(suggestion, index))}
                </div>
              )}
            </div>
          )}

          {/* Botão adicionar */}
          {mergedVisual.showAddIcon && inputValue === "" && !disabled && tags.length < maxTags && (
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className={cn(
                "flex items-center text-muted-foreground hover:text-foreground transition-colors",
                currentSizeStyles.input,
              )}
            >
              <Plus className={currentSizeStyles.icon} />
              <span className="ml-1">Adicionar</span>
            </button>
          )}

          {/* Ícone de validação */}
          {mergedVisual.validationIconPosition === "right" && (
            <div className="flex items-center ml-2">{renderValidationIconElement()}</div>
          )}
        </div>

        {/* Ícone de validação à esquerda */}
        {mergedVisual.validationIconPosition === "left" && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">{renderValidationIconElement()}</div>
        )}
      </div>

      {/* Contador */}
      {renderCounterElement()}

      {/* Texto de ajuda */}
      {helpText && !validationError && <p className="text-sm text-muted-foreground">{helpText}</p>}

      {/* Mensagem de erro */}
      {validationError && (
        <p className="text-destructive text-sm" role="alert">
          {validationError}
        </p>
      )}

      {/* Mensagem quando vazio */}
      {tags.length === 0 && emptyMessage && !isFocused && (
        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
      )}
    </div>
  )
}

// ===== EXPORTS =====
export type { TagConfig, TagValidationConfig, AutoCompleteConfig, TagInputVisualConfig }
