"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BaseComponentProps } from "@/types/component-interfaces"

/**
 * Interface para sugestões de busca
 */
export interface SearchSuggestion {
  id: string
  text: string
  category?: string
  metadata?: Record<string, any>
}

/**
 * Interface para filtros ativos
 */
export interface SearchFilter {
  id: string
  label: string
  value: any
  removable?: boolean
}

/**
 * Props para o componente SearchBar
 */
export interface SearchBarProps extends BaseComponentProps {
  // ===== PROPS OBRIGATÓRIAS =====
  /**
   * Valor atual da busca
   * @required
   */
  value: string

  /**
   * Função chamada quando o valor da busca muda
   * @required
   */
  onChange: (value: string) => void

  // ===== CONTEÚDO =====
  /**
   * Placeholder exibido quando o input está vazio
   * @default "Buscar..."
   */
  placeholder?: string

  /**
   * Texto do botão de busca
   * @default "Buscar"
   */
  searchButtonText?: string

  /**
   * Texto exibido quando não há resultados
   * @default "Nenhum resultado encontrado"
   */
  noResultsText?: string

  /**
   * Texto exibido quando há muitos resultados
   * @default "Muitos resultados. Refine sua busca."
   */
  tooManyResultsText?: string

  // ===== COMPORTAMENTAIS =====
  /**
   * Tempo de debounce em milissegundos
   * @default 300
   */
  debounceMs?: number

  /**
   * Se verdadeiro, mostra o botão de limpar
   * @default true
   */
  showClearButton?: boolean

  /**
   * Se verdadeiro, o input recebe foco automaticamente
   * @default false
   */
  autoFocus?: boolean

  /**
   * Se verdadeiro, a busca é executada automaticamente ao digitar
   * @default true
   */
  autoSearch?: boolean

  /**
   * Se verdadeiro, permite busca por Enter
   * @default true
   */
  searchOnEnter?: boolean

  /**
   * Número mínimo de caracteres para iniciar a busca
   * @default 1
   */
  minSearchLength?: number

  /**
   * Número máximo de caracteres permitidos
   * @default 500
   */
  maxLength?: number

  /**
   * Se verdadeiro, o componente está desabilitado
   * @default false
   */
  disabled?: boolean

  /**
   * Se verdadeiro, o componente está em estado de carregamento
   * @default false
   */
  loading?: boolean

  // ===== VISUAIS =====
  /**
   * Tamanho do componente
   * @default "default"
   */
  size?: "sm" | "md" | "lg"

  /**
   * Variante visual do componente
   * @default "default"
   */
  variant?: "default" | "ghost" | "filled"

  /**
   * Se verdadeiro, mostra ícone de busca
   * @default true
   */
  showSearchIcon?: boolean

  /**
   * Posição do ícone de busca
   * @default "left"
   */
  searchIconPosition?: "left" | "right"

  /**
   * Se verdadeiro, mostra contador de caracteres
   * @default false
   */
  showCharacterCount?: boolean

  /**
   * Se verdadeiro, mostra botão de filtros
   * @default false
   */
  showFilterButton?: boolean

  /**
   * Número de filtros ativos (para badge no botão de filtros)
   */
  activeFiltersCount?: number

  // ===== EVENTOS =====
  /**
   * Função chamada quando a busca é executada
   */
  onSearch?: () => void

  /**
   * Função chamada quando o input é limpo
   */
  onClear?: () => void

  /**
   * Função chamada quando o input ganha foco
   */
  onFocus?: () => void

  /**
   * Função chamada quando o input perde foco
   */
  onBlur?: () => void

  /**
   * Função chamada quando o botão de filtros é clicado
   */
  onFilterClick?: () => void

  /**
   * Função chamada quando uma sugestão é selecionada
   */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void

  /**
   * Função chamada quando um filtro é removido
   */
  onFilterRemove?: (filter: SearchFilter) => void

  // ===== SUGESTÕES E FILTROS =====
  /**
   * Lista de sugestões para auto-complete
   */
  suggestions?: SearchSuggestion[]

  /**
   * Se verdadeiro, mostra sugestões
   * @default false
   */
  showSuggestions?: boolean

  /**
   * Número máximo de sugestões a exibir
   * @default 5
   */
  maxSuggestions?: number

  /**
   * Lista de filtros ativos
   */
  activeFilters?: SearchFilter[]

  /**
   * Se verdadeiro, mostra filtros ativos
   * @default false
   */
  showActiveFilters?: boolean

  // ===== ACESSIBILIDADE =====
  /**
   * ID único para o componente
   */
  id?: string

  /**
   * Label para leitores de tela
   */
  ariaLabel?: string

  /**
   * Descrição para leitores de tela
   */
  ariaDescription?: string

  /**
   * ID para testes automatizados
   */
  testId?: string

  // ===== AVANÇADO =====
  /**
   * Função para renderização customizada de sugestões
   */
  renderSuggestion?: (suggestion: SearchSuggestion, isHighlighted: boolean) => React.ReactNode

  /**
   * Função para renderização customizada de filtros
   */
  renderFilter?: (filter: SearchFilter) => React.ReactNode

  /**
   * Configurações de validação
   */
  validation?: {
    pattern?: RegExp
    errorMessage?: string
    showError?: boolean
  }
}

/**
 * Componente SearchBar
 *
 * Barra de busca avançada com suporte a sugestões, filtros, debounce e validação.
 * Altamente configurável para diferentes contextos de busca.
 *
 * @example
 * // Busca básica
 * <SearchBar
 *   value={searchValue}
 *   onChange={setSearchValue}
 *   placeholder="Buscar produtos..."
 * />
 *
 * @example
 * // Busca com sugestões e filtros
 * <SearchBar
 *   value={searchValue}
 *   onChange={setSearchValue}
 *   suggestions={searchSuggestions}
 *   showSuggestions
 *   activeFilters={activeFilters}
 *   showActiveFilters
 *   showFilterButton
 *   onFilterClick={openFilterModal}
 *   size="lg"
 * />
 *
 * @example
 * // Busca com validação
 * <SearchBar
 *   value={searchValue}
 *   onChange={setSearchValue}
 *   validation={{
 *     pattern: /^[a-zA-Z0-9\s]+$/,
 *     errorMessage: "Apenas letras, números e espaços são permitidos",
 *     showError: true
 *   }}
 *   minSearchLength={3}
 * />
 */
export function SearchBar({
  // Obrigatórias
  value,
  onChange,

  // Conteúdo
  placeholder = "Buscar...",
  searchButtonText = "Buscar",
  noResultsText = "Nenhum resultado encontrado",
  tooManyResultsText = "Muitos resultados. Refine sua busca.",

  // Comportamentais
  debounceMs = 300,
  showClearButton = true,
  autoFocus = false,
  autoSearch = true,
  searchOnEnter = true,
  minSearchLength = 1,
  maxLength = 500,
  disabled = false,
  loading = false,

  // Visuais
  size = "md",
  variant = "default",
  showSearchIcon = true,
  searchIconPosition = "left",
  showCharacterCount = false,
  showFilterButton = false,
  activeFiltersCount = 0,

  // Eventos
  onSearch,
  onClear,
  onFocus,
  onBlur,
  onFilterClick,
  onSuggestionSelect,
  onFilterRemove,

  // Sugestões e filtros
  suggestions = [],
  showSuggestions = false,
  maxSuggestions = 5,
  activeFilters = [],
  showActiveFilters = false,

  // Acessibilidade
  id,
  ariaLabel,
  ariaDescription,
  testId,

  // Avançado
  renderSuggestion,
  renderFilter,
  validation,

  className,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const [showSuggestionsList, setShowSuggestionsList] = useState(false)
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      input: "h-8 text-sm",
      button: "h-6 w-6",
      icon: "h-3.5 w-3.5",
      padding: "px-2",
    },
    md: {
      input: "h-10 text-sm",
      button: "h-8 w-8",
      icon: "h-4 w-4",
      padding: "px-3",
    },
    lg: {
      input: "h-12 text-base",
      button: "h-10 w-10",
      icon: "h-5 w-5",
      padding: "px-4",
    },
  }

  // Configurações de variante
  const variantConfig = {
    default: "border-input bg-background",
    ghost: "border-transparent bg-transparent",
    filled: "border-transparent bg-muted",
  }

  const currentSizeConfig = sizeConfig[size]
  const currentVariantConfig = variantConfig[variant]

  // Filtrar sugestões
  const filteredSuggestions = suggestions
    .filter((suggestion) => suggestion.text.toLowerCase().includes(localValue.toLowerCase()))
    .slice(0, maxSuggestions)

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Validação
  const validateInput = useCallback(
    (inputValue: string) => {
      if (!validation) return true

      if (validation.pattern && !validation.pattern.test(inputValue)) {
        setValidationError(validation.errorMessage || "Formato inválido")
        return false
      }

      setValidationError(null)
      return true
    },
    [validation],
  )

  // Handle input change with optional debounce
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      // Limitar comprimento
      if (newValue.length > maxLength) return

      setLocalValue(newValue)

      // Validar entrada
      validateInput(newValue)

      // Mostrar sugestões se habilitado
      if (showSuggestions && newValue.length >= minSearchLength) {
        setShowSuggestionsList(true)
        setHighlightedSuggestion(-1)
      } else {
        setShowSuggestionsList(false)
      }

      if (debounceMs && autoSearch) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
          if (newValue.length >= minSearchLength) {
            onChange(newValue)
            onSearch?.()
          }
        }, debounceMs)
      } else {
        onChange(newValue)
        if (autoSearch && newValue.length >= minSearchLength) {
          onSearch?.()
        }
      }
    },
    [maxLength, validateInput, showSuggestions, minSearchLength, debounceMs, autoSearch, onChange, onSearch],
  )

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      // Enter para buscar
      if (e.key === "Enter") {
        if (searchOnEnter) {
          e.preventDefault()
          if (highlightedSuggestion >= 0 && filteredSuggestions[highlightedSuggestion]) {
            // Selecionar sugestão destacada
            const suggestion = filteredSuggestions[highlightedSuggestion]
            setLocalValue(suggestion.text)
            onChange(suggestion.text)
            onSuggestionSelect?.(suggestion)
            setShowSuggestionsList(false)
          } else {
            // Executar busca
            onSearch?.()
          }
        }
      }

      // Navegação nas sugestões
      if (showSuggestionsList && filteredSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setHighlightedSuggestion((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0))
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setHighlightedSuggestion((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1))
        } else if (e.key === "Escape") {
          setShowSuggestionsList(false)
          setHighlightedSuggestion(-1)
        }
      }
    },
    [
      disabled,
      searchOnEnter,
      highlightedSuggestion,
      filteredSuggestions,
      showSuggestionsList,
      onChange,
      onSearch,
      onSuggestionSelect,
    ],
  )

  // Handle clear button click
  const handleClear = useCallback(() => {
    setLocalValue("")
    onChange("")
    setShowSuggestionsList(false)
    setValidationError(null)
    onClear?.()
    inputRef.current?.focus()
  }, [onChange, onClear])

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: SearchSuggestion) => {
      setLocalValue(suggestion.text)
      onChange(suggestion.text)
      onSuggestionSelect?.(suggestion)
      setShowSuggestionsList(false)
      inputRef.current?.focus()
    },
    [onChange, onSuggestionSelect],
  )

  // Handle filter remove
  const handleFilterRemove = useCallback(
    (filter: SearchFilter) => {
      onFilterRemove?.(filter)
    },
    [onFilterRemove],
  )

  // Handle focus
  const handleFocus = useCallback(() => {
    if (showSuggestions && localValue.length >= minSearchLength) {
      setShowSuggestionsList(true)
    }
    onFocus?.()
  }, [showSuggestions, localValue, minSearchLength, onFocus])

  // Handle blur
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // Delay para permitir clique em sugestões
      setTimeout(() => {
        if (!suggestionsRef.current?.contains(document.activeElement)) {
          setShowSuggestionsList(false)
          setHighlightedSuggestion(-1)
        }
      }, 150)
      onBlur?.()
    },
    [onBlur],
  )

  return (
    <div className={cn("relative w-full", className)} data-testid={testId}>
      {/* Filtros ativos */}
      {showActiveFilters && activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {activeFilters.map((filter) =>
            renderFilter ? (
              renderFilter(filter)
            ) : (
              <Badge key={filter.id} variant="secondary" className="flex items-center gap-1">
                {filter.label}
                {filter.removable !== false && (
                  <button
                    type="button"
                    onClick={() => handleFilterRemove(filter)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                    aria-label={`Remover filtro ${filter.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ),
          )}
        </div>
      )}

      {/* Container principal */}
      <div
        className={cn(
          "relative flex items-center border rounded-md transition-colors",
          currentVariantConfig,
          disabled && "opacity-50 cursor-not-allowed",
          validationError && "border-destructive",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        )}
      >
        {/* Ícone de busca à esquerda */}
        {showSearchIcon && searchIconPosition === "left" && (
          <div className={cn("flex items-center justify-center", currentSizeConfig.padding)}>
            <Search className={cn(currentSizeConfig.icon, "text-muted-foreground")} />
          </div>
        )}

        {/* Input */}
        <Input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          className={cn(
            "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
            currentSizeConfig.input,
            showSearchIcon && searchIconPosition === "left" && "pl-0",
            showSearchIcon && searchIconPosition === "right" && "pr-0",
            isFocused && "ring-2 ring-primary",
          )}
          aria-label={ariaLabel || placeholder}
          aria-describedby={ariaDescription}
          aria-invalid={!!validationError}
          aria-expanded={showSuggestionsList}
          aria-autocomplete={showSuggestions ? "list" : "none"}
          role="searchbox"
        />

        {/* Ícone de busca à direita */}
        {showSearchIcon && searchIconPosition === "right" && (
          <div className={cn("flex items-center justify-center", currentSizeConfig.padding)}>
            <Search className={cn(currentSizeConfig.icon, "text-muted-foreground")} />
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex items-center gap-1 pr-2">
          {/* Botão de filtros */}
          {showFilterButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onFilterClick}
              disabled={disabled}
              className={cn("relative", currentSizeConfig.button)}
              aria-label="Abrir filtros"
            >
              <Filter className={currentSizeConfig.icon} />
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Botão de limpar */}
          {showClearButton && localValue && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className={cn("relative", currentSizeConfig.button)}
              aria-label="Limpar busca"
            >
              <X className={currentSizeConfig.icon} />
            </Button>
          )}

          {/* Indicador de carregamento */}
          {loading && (
            <div className={cn("animate-spin", currentSizeConfig.icon)}>
              <Search className={currentSizeConfig.icon} />
            </div>
          )}
        </div>
      </div>

      {/* Contador de caracteres */}
      {showCharacterCount && (
        <div className="flex justify-end mt-1">
          <span
            className={cn(
              "text-xs text-muted-foreground",
              localValue.length > maxLength * 0.9 && "text-warning",
              localValue.length >= maxLength && "text-destructive",
            )}
          >
            {localValue.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Erro de validação */}
      {validation?.showError && validationError && (
        <p className="text-destructive text-sm mt-1" role="alert">
          {validationError}
        </p>
      )}

      {/* Lista de sugestões */}
      {showSuggestionsList && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          role="listbox"
          aria-label="Sugestões de busca"
        >
          {filteredSuggestions.map((suggestion, index) =>
            renderSuggestion ? (
              renderSuggestion(suggestion, index === highlightedSuggestion)
            ) : (
              <button
                key={suggestion.id}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm",
                  index === highlightedSuggestion && "bg-muted",
                )}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={index === highlightedSuggestion}
              >
                <div className="flex items-center justify-between">
                  <span>{suggestion.text}</span>
                  {suggestion.category && (
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                  )}
                </div>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
