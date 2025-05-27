"use client"

import type React from "react"

import { useState, useRef, type KeyboardEvent, type FocusEvent } from "react"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

/**
 * Interface que define as propriedades do componente TagInput
 * @interface TagInputProps
 */
export interface TagInputProps {
  // ===== PROPS OBRIGATÓRIAS =====
  /**
   * Função chamada quando a lista de tags é alterada
   * @param tags - Lista atualizada de tags
   * @required
   */
  onTagsChange: (tags: string[]) => void

  // ===== CONTEÚDO =====
  /**
   * Lista inicial de tags a serem exibidas
   * @default []
   */
  initialTags?: string[]

  /**
   * Placeholder exibido quando o input está vazio
   * @default "Adicionar tag..."
   */
  placeholder?: string

  /**
   * Mensagem de erro exibida quando uma tag é inválida
   */
  errorMessage?: string

  // ===== COMPORTAMENTAIS =====
  /**
   * Número máximo de tags permitidas
   * @default Infinity
   */
  maxTags?: number

  /**
   * Tamanho máximo de caracteres para cada tag
   * @default 50
   */
  maxTagLength?: number

  /**
   * Determina se o componente está desabilitado
   * @default false
   */
  disabled?: boolean

  /**
   * Determina se as tags duplicadas são permitidas
   * @default false
   */
  allowDuplicates?: boolean

  /**
   * Determina se as tags devem ser convertidas para minúsculas
   * @default true
   */
  lowercase?: boolean

  /**
   * Caracteres que, quando digitados, criam uma nova tag
   * @default [',', 'Enter']
   */
  delimiters?: string[]

  /**
   * Função de validação personalizada para novas tags
   * @param tag - Tag a ser validada
   * @returns true se a tag for válida, false caso contrário
   * @default () => true
   */
  validateTag?: (tag: string) => boolean

  // ===== EVENTOS =====
  /**
   * Função chamada quando uma tag é adicionada
   * @param tag - Tag adicionada
   */
  onTagAdd?: (tag: string) => void

  /**
   * Função chamada quando uma tag é removida
   * @param tag - Tag removida
   * @param index - Índice da tag removida
   */
  onTagRemove?: (tag: string, index: number) => void

  /**
   * Função chamada quando ocorre um erro de validação
   * @param error - Mensagem de erro
   * @param tag - Tag que causou o erro
   */
  onValidationError?: (error: string, tag: string) => void

  /**
   * Função chamada quando o input ganha foco
   */
  onFocus?: () => void

  /**
   * Função chamada quando o input perde foco
   */
  onBlur?: () => void

  // ===== VISUAIS =====
  /**
   * Classe CSS adicional para o container principal
   */
  className?: string

  /**
   * Variante visual das tags
   * @default "secondary"
   */
  tagVariant?: "default" | "secondary" | "destructive" | "outline"

  /**
   * Tamanho do componente
   * @default "default"
   */
  size?: "sm" | "default" | "lg"

  /**
   * Tema de cores para as tags
   * @default "default"
   */
  colorScheme?: "default" | "primary" | "success" | "warning" | "danger"

  /**
   * Determina se deve mostrar contador de tags
   * @default false
   */
  showCounter?: boolean

  /**
   * Determina se deve mostrar ícone de adicionar quando vazio
   * @default true
   */
  showAddIcon?: boolean

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
   * Função para renderização customizada de tags
   * @param tag - Tag a ser renderizada
   * @param index - Índice da tag
   * @param onRemove - Função para remover a tag
   * @returns Elemento React customizado
   */
  renderTag?: (tag: string, index: number, onRemove: () => void) => React.ReactNode

  /**
   * Configurações de auto-complete
   */
  autoComplete?: {
    enabled: boolean
    suggestions: string[]
    maxSuggestions?: number
  }
}

/**
 * Componente TagInput - Permite a entrada e gerenciamento de múltiplas tags
 *
 * @example
 * // Uso básico
 * <TagInput
 *   initialTags={['react', 'typescript']}
 *   onTagsChange={(tags) => console.log(tags)}
 * />
 *
 * @example
 * // Com validação personalizada
 * <TagInput
 *   onTagsChange={handleTagsChange}
 *   validateTag={(tag) => tag.length >= 3}
 *   errorMessage="Tags devem ter pelo menos 3 caracteres"
 *   maxTags={10}
 *   size="lg"
 *   colorScheme="primary"
 * />
 *
 * @example
 * // Com auto-complete
 * <TagInput
 *   onTagsChange={handleTagsChange}
 *   autoComplete={{
 *     enabled: true,
 *     suggestions: ['javascript', 'typescript', 'react', 'vue'],
 *     maxSuggestions: 5
 *   }}
 *   showCounter
 * />
 */
export function TagInput({
  // Obrigatórias
  onTagsChange,

  // Conteúdo
  initialTags = [],
  placeholder = "Adicionar tag...",
  errorMessage,

  // Comportamentais
  maxTags = Number.POSITIVE_INFINITY,
  maxTagLength = 50,
  disabled = false,
  allowDuplicates = false,
  lowercase = true,
  delimiters = [",", "Enter"],
  validateTag = () => true,

  // Eventos
  onTagAdd,
  onTagRemove,
  onValidationError,
  onFocus,
  onBlur,

  // Visuais
  className = "",
  tagVariant = "secondary",
  size = "default",
  colorScheme = "default",
  showCounter = false,
  showAddIcon = true,

  // Acessibilidade
  id,
  ariaLabel,
  ariaDescription,
  testId,

  // Avançado
  renderTag,
  autoComplete,
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      container: "min-h-8",
      input: "text-sm",
      tag: "text-xs px-2 py-0.5",
      addButton: "text-xs",
    },
    default: {
      container: "min-h-10",
      input: "text-sm",
      tag: "text-xs px-3 py-1",
      addButton: "text-sm",
    },
    lg: {
      container: "min-h-12",
      input: "text-base",
      tag: "text-sm px-4 py-1.5",
      addButton: "text-base",
    },
  }

  // Configurações de cores
  const colorConfig = {
    default: "bg-background text-foreground",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300",
    danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
  }

  const currentSizeConfig = sizeConfig[size]
  const currentColorConfig = colorConfig[colorScheme]

  // Filtrar sugestões
  const filteredSuggestions = autoComplete?.enabled
    ? autoComplete.suggestions
        .filter(
          (suggestion) => suggestion.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(suggestion),
        )
        .slice(0, autoComplete.maxSuggestions || 5)
    : []

  /**
   * Adiciona uma nova tag à lista se for válida
   * @param tag - Tag a ser adicionada
   */
  const addTag = (tag: string): void => {
    // Normaliza a tag conforme configuração
    const normalizedTag = lowercase ? tag.trim().toLowerCase() : tag.trim()

    // Verifica se a tag está vazia
    if (normalizedTag === "") return

    // Verifica se atingiu o número máximo de tags
    if (tags.length >= maxTags) {
      const errorMsg = `Número máximo de ${maxTags} tags atingido`
      setError(errorMsg)
      onValidationError?.(errorMsg, normalizedTag)
      return
    }

    // Verifica o tamanho máximo da tag
    if (normalizedTag.length > maxTagLength) {
      const errorMsg = `Tags devem ter no máximo ${maxTagLength} caracteres`
      setError(errorMsg)
      onValidationError?.(errorMsg, normalizedTag)
      return
    }

    // Verifica se a tag já existe (se duplicatas não forem permitidas)
    if (!allowDuplicates && tags.includes(normalizedTag)) {
      const errorMsg = "Esta tag já foi adicionada"
      setError(errorMsg)
      onValidationError?.(errorMsg, normalizedTag)
      return
    }

    // Aplica validação personalizada
    if (!validateTag(normalizedTag)) {
      const errorMsg = errorMessage || "Tag inválida"
      setError(errorMsg)
      onValidationError?.(errorMsg, normalizedTag)
      return
    }

    // Adiciona a tag e limpa o input
    const updatedTags = [...tags, normalizedTag]
    setTags(updatedTags)
    setInputValue("")
    setError(null)
    setShowSuggestions(false)
    onTagsChange(updatedTags)
    onTagAdd?.(normalizedTag)
  }

  /**
   * Remove uma tag da lista pelo índice
   * @param index - Índice da tag a ser removida
   */
  const removeTag = (index: number): void => {
    if (disabled) return

    const removedTag = tags[index]
    const updatedTags = tags.filter((_, i) => i !== index)
    setTags(updatedTags)
    onTagsChange(updatedTags)
    onTagRemove?.(removedTag, index)
  }

  /**
   * Manipula o evento de tecla pressionada no input
   * @param e - Evento de teclado
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    // Se estiver desabilitado, não faz nada
    if (disabled) return

    // Verifica se a tecla pressionada é um delimitador
    if (delimiters.includes(e.key)) {
      e.preventDefault()
      addTag(inputValue)
    }

    // Remove a última tag se pressionar Backspace com o input vazio
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1)
    }

    // Navegação nas sugestões
    if (autoComplete?.enabled && showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        // Implementar navegação por teclado nas sugestões
      }
    }
  }

  /**
   * Manipula o evento de perda de foco do input
   * @param e - Evento de foco
   */
  const handleBlur = (e: FocusEvent<HTMLInputElement>): void => {
    // Adiciona a tag atual quando o input perde o foco
    if (inputValue.trim() !== "") {
      addTag(inputValue)
    }
    setShowSuggestions(false)
    onBlur?.()
  }

  /**
   * Manipula mudanças no input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setError(null)

    if (autoComplete?.enabled) {
      setShowSuggestions(e.target.value.length > 0)
    }
  }

  /**
   * Renderiza uma tag
   */
  const renderTagElement = (tag: string, index: number) => {
    if (renderTag) {
      return renderTag(tag, index, () => removeTag(index))
    }

    return (
      <Badge
        key={`${tag}-${index}`}
        variant={tagVariant}
        className={`flex items-center gap-1 ${currentSizeConfig.tag} ${currentColorConfig}`}
      >
        {tag}
        {!disabled && (
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
            aria-label={`Remover tag ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </Badge>
    )
  }

  return (
    <div className={`w-full ${className}`} data-testid={testId}>
      <div
        className={`flex flex-wrap gap-2 p-2 border rounded-md bg-background ${currentSizeConfig.container} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription}
      >
        {/* Renderiza as tags existentes */}
        {tags.map((tag, index) => renderTagElement(tag, index))}

        {/* Input para adicionar novas tags */}
        {tags.length < maxTags && (
          <div className="flex-1 min-w-[120px] relative">
            <Input
              ref={inputRef}
              id={id}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={() => {
                onFocus?.()
                if (autoComplete?.enabled && inputValue.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={`border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 ${currentSizeConfig.input}`}
              aria-label={`Adicionar nova tag. ${tags.length} de ${maxTags === Number.POSITIVE_INFINITY ? "∞" : maxTags} tags adicionadas`}
            />

            {/* Sugestões de auto-complete */}
            {autoComplete?.enabled && showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                    onClick={() => {
                      addTag(suggestion)
                      inputRef.current?.focus()
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botão para adicionar tag quando o input está vazio */}
        {showAddIcon && inputValue === "" && !disabled && tags.length < maxTags && (
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className={`flex items-center text-muted-foreground hover:text-foreground transition-colors ${currentSizeConfig.addButton}`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </button>
        )}
      </div>

      {/* Contador de tags */}
      {showCounter && (
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
      )}

      {/* Mensagem de erro */}
      {error && (
        <p className="text-destructive text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
