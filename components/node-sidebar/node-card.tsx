"use client"

import type React from "react"
import { forwardRef, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { GripVertical, Star, Download, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  BaseComponentProps,
  AccessibilityProps,
  InteractionProps,
  VisualProps,
} from "@/types/component-interfaces"

/**
 * Estrutura de porta de um node
 */
export interface NodePort {
  /** ID único da porta */
  id: string
  /** Nome da porta */
  name: string
  /** Tipo de dados da porta */
  type: string
  /** Se a porta é opcional */
  optional?: boolean
  /** Descrição da porta */
  description?: string
  /** Se a porta está conectada */
  connected?: boolean
}

/**
 * Estrutura de um node
 */
export interface NodeData {
  /** ID único do node */
  id: string
  /** Nome do node */
  name: string
  /** Descrição do node */
  description: string
  /** Categoria do node */
  category: string
  /** Portas de entrada */
  inputs?: NodePort[]
  /** Portas de saída */
  outputs?: NodePort[]
  /** Tags do node */
  tags?: string[]
  /** Versão do node */
  version?: string
  /** Autor do node */
  author?: string
  /** Rating do node */
  rating?: number
  /** Número de downloads */
  downloads?: number
  /** Se o node é favorito */
  isFavorite?: boolean
  /** Se o node é premium */
  isPremium?: boolean
  /** Ícone personalizado */
  icon?: React.ReactNode
  /** Metadados adicionais */
  metadata?: Record<string, any>
}

/**
 * Props do componente NodeCard
 */
export interface NodeCardProps extends BaseComponentProps, AccessibilityProps, InteractionProps, VisualProps {
  // ===== PROPS OBRIGATÓRIAS =====
  /** Dados do node a ser exibido */
  node: NodeData

  // ===== CONTEÚDO =====
  /** Categoria para determinar estilo visual */
  category?: string
  /** Título personalizado (sobrescreve node.name) */
  title?: string
  /** Descrição personalizada (sobrescreve node.description) */
  description?: string
  /** Conteúdo adicional no footer */
  footerContent?: React.ReactNode
  /** Conteúdo adicional no header */
  headerContent?: React.ReactNode

  // ===== COMPORTAMENTAIS =====
  /** Se o card é arrastável */
  draggable?: boolean
  /** Se deve mostrar informações de portas */
  showPorts?: boolean
  /** Se deve mostrar tags */
  showTags?: boolean
  /** Se deve mostrar rating */
  showRating?: boolean
  /** Se deve mostrar downloads */
  showDownloads?: boolean
  /** Se deve mostrar autor */
  showAuthor?: boolean
  /** Se deve mostrar versão */
  showVersion?: boolean
  /** Se deve mostrar ícone de favorito */
  showFavorite?: boolean
  /** Se deve mostrar badge premium */
  showPremium?: boolean
  /** Se deve mostrar handle de drag */
  showDragHandle?: boolean
  /** Se deve mostrar tooltip com descrição completa */
  showTooltip?: boolean
  /** Número máximo de tags visíveis */
  maxVisibleTags?: number
  /** Modo de exibição do card */
  displayMode?: "compact" | "standard" | "detailed"

  // ===== VISUAIS =====
  /** Layout do card */
  layout?: "horizontal" | "vertical"
  /** Densidade do conteúdo */
  density?: "comfortable" | "compact" | "spacious"
  /** Se deve mostrar borda colorida baseada na categoria */
  showCategoryBorder?: boolean
  /** Se deve mostrar background colorido baseado na categoria */
  showCategoryBackground?: boolean
  /** Estilo da borda */
  borderStyle?: "none" | "subtle" | "prominent"
  /** Intensidade da sombra */
  shadowIntensity?: "none" | "subtle" | "medium" | "strong"

  // ===== EVENTOS =====
  /** Callback quando o drag inicia */
  onDragStart?: (event: React.DragEvent, node: NodeData) => void
  /** Callback quando o drag termina */
  onDragEnd?: (event: React.DragEvent, node: NodeData) => void
  /** Callback quando o node é selecionado */
  onSelect?: (node: NodeData) => void
  /** Callback quando o favorito é alterado */
  onFavoriteChange?: (node: NodeData, isFavorite: boolean) => void
  /** Callback quando uma tag é clicada */
  onTagClick?: (tag: string, node: NodeData) => void
  /** Callback para ação secundária (ex: visualizar detalhes) */
  onSecondaryAction?: (node: NodeData) => void

  // ===== CUSTOMIZAÇÃO =====
  /** Função para renderização customizada do conteúdo */
  renderContent?: (node: NodeData) => React.ReactNode
  /** Função para renderização customizada do header */
  renderHeader?: (node: NodeData) => React.ReactNode
  /** Função para renderização customizada do footer */
  renderFooter?: (node: NodeData) => React.ReactNode
  /** Mapeamento customizado de cores por categoria */
  categoryColorMap?: Record<string, string>
}

/**
 * Mapeamento padrão de cores por categoria
 */
const DEFAULT_CATEGORY_COLORS = {
  "data-input": "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20",
  "data-transformation": "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20",
  "data-output": "border-l-green-500 bg-green-50 dark:bg-green-900/20",
  ai: "border-l-rose-500 bg-rose-50 dark:bg-rose-900/20",
  api: "border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/20",
  logic: "border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
  default: "border-l-slate-500 bg-slate-50 dark:bg-slate-700/20",
} as const

/**
 * Configurações de densidade
 */
const DENSITY_CONFIG = {
  comfortable: { padding: "p-4", gap: "gap-3", text: "text-sm" },
  compact: { padding: "p-3", gap: "gap-2", text: "text-sm" },
  spacious: { padding: "p-5", gap: "gap-4", text: "text-base" },
} as const

/**
 * Configurações de tamanho
 */
const SIZE_CONFIG = {
  xs: { height: "min-h-16", text: "text-xs" },
  sm: { height: "min-h-20", text: "text-sm" },
  md: { height: "min-h-24", text: "text-sm" },
  lg: { height: "min-h-28", text: "text-base" },
  xl: { height: "min-h-32", text: "text-lg" },
} as const

/**
 * NodeCard - Componente para exibir informações de um node
 *
 * Componente altamente parametrizável para exibir nodes com suporte a:
 * - Drag and drop
 * - Múltiplos layouts e densidades
 * - Informações detalhadas (portas, tags, rating, etc.)
 * - Customização visual por categoria
 * - Acessibilidade completa
 * - Renderização customizada
 *
 * @example
 * // Uso básico
 * <NodeCard
 *   node={nodeData}
 *   category="ai"
 *   draggable
 *   onDragStart={handleDragStart}
 * />
 *
 * @example
 * // Card detalhado
 * <NodeCard
 *   node={nodeData}
 *   displayMode="detailed"
 *   showPorts
 *   showTags
 *   showRating
 *   showAuthor
 *   density="spacious"
 *   onSelect={handleSelect}
 *   onFavoriteChange={handleFavoriteChange}
 * />
 *
 * @example
 * // Card compacto
 * <NodeCard
 *   node={nodeData}
 *   displayMode="compact"
 *   density="compact"
 *   size="sm"
 *   layout="horizontal"
 *   maxVisibleTags={2}
 * />
 */
export const NodeCard = forwardRef<HTMLDivElement, NodeCardProps>(
  (
    {
      // Obrigatórias
      node,

      // Conteúdo
      category = node.category,
      title,
      description,
      footerContent,
      headerContent,

      // Comportamentais
      draggable = false,
      showPorts = true,
      showTags = true,
      showRating = false,
      showDownloads = false,
      showAuthor = false,
      showVersion = false,
      showFavorite = false,
      showPremium = false,
      showDragHandle = true,
      showTooltip = true,
      maxVisibleTags = 3,
      displayMode = "standard",
      disabled = false,
      isLoading = false,
      isSelected = false,
      isActive = false,

      // Visuais
      layout = "vertical",
      density = "compact",
      size = "md",
      variant = "default",
      showCategoryBorder = true,
      showCategoryBackground = true,
      borderStyle = "subtle",
      shadowIntensity = "subtle",
      fullWidth = false,

      // Eventos
      onClick,
      onDragStart,
      onDragEnd,
      onSelect,
      onFavoriteChange,
      onTagClick,
      onSecondaryAction,
      onKeyDown,
      onFocus,
      onBlur,

      // Acessibilidade
      ariaLabel,
      ariaDescription,
      role = "article",
      tabIndex = 0,

      // Customização
      renderContent,
      renderHeader,
      renderFooter,
      categoryColorMap = DEFAULT_CATEGORY_COLORS,

      // Base
      className,
      id,
      testId,
    },
    ref,
  ) => {
    // Configurações baseadas nas props
    const densityConfig = DENSITY_CONFIG[density]
    const sizeConfig = SIZE_CONFIG[size]

    // Determina o estilo da categoria
    const categoryStyle = useMemo(() => {
      const categoryKey = category?.toLowerCase() || "default"
      return categoryColorMap[categoryKey] || categoryColorMap.default || DEFAULT_CATEGORY_COLORS.default
    }, [category, categoryColorMap])

    // Classes do container principal
    const containerClasses = useMemo(() => {
      return cn(
        // Base
        "rounded-md border transition-all duration-200",
        "bg-white dark:bg-slate-800",
        "border-slate-200 dark:border-slate-700",

        // Tamanho
        sizeConfig.height,
        fullWidth && "w-full",

        // Densidade
        densityConfig.padding,

        // Categoria
        showCategoryBorder && "border-l-4",
        showCategoryBackground && categoryStyle,

        // Borda
        borderStyle === "prominent" && "border-2",
        borderStyle === "none" && "border-0",

        // Sombra
        shadowIntensity === "subtle" && "shadow-sm",
        shadowIntensity === "medium" && "shadow-md",
        shadowIntensity === "strong" && "shadow-lg",

        // Estados
        !disabled && "hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isActive && "bg-accent",
        disabled && "opacity-60 cursor-not-allowed",
        isLoading && "animate-pulse",

        // Interação
        !disabled && (onClick || onSelect) && "cursor-pointer",
        draggable && !disabled && "cursor-grab active:cursor-grabbing",

        className,
      )
    }, [
      sizeConfig,
      fullWidth,
      densityConfig,
      showCategoryBorder,
      showCategoryBackground,
      categoryStyle,
      borderStyle,
      shadowIntensity,
      disabled,
      isSelected,
      isActive,
      isLoading,
      onClick,
      onSelect,
      draggable,
      className,
    ])

    // Handle drag start
    const handleDragStart = (event: React.DragEvent) => {
      if (disabled || !draggable) return

      // Set drag data
      const dragData = {
        type: "node",
        node: node,
        category: category,
      }
      event.dataTransfer.setData("application/json", JSON.stringify(dragData))
      event.dataTransfer.effectAllowed = "copy"

      onDragStart?.(event, node)
    }

    // Handle drag end
    const handleDragEnd = (event: React.DragEvent) => {
      onDragEnd?.(event, node)
    }

    // Handle click
    const handleClick = (event: React.MouseEvent) => {
      if (disabled || isLoading) return

      onClick?.(event)
      onSelect?.(node)
    }

    // Handle keyboard
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled || isLoading) return

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onSelect?.(node)
      }

      onKeyDown?.(event)
    }

    // Render tags
    const renderTags = () => {
      if (!showTags || !node.tags?.length) return null

      const visibleTags = node.tags.slice(0, maxVisibleTags)
      const remainingCount = node.tags.length - maxVisibleTags

      return (
        <div className="flex flex-wrap gap-1 mt-2">
          {visibleTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs cursor-pointer hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation()
                onTagClick?.(tag, node)
              }}
            >
              {tag}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" className="text-xs">
              +{remainingCount}
            </Badge>
          )}
        </div>
      )
    }

    // Render ports info
    const renderPortsInfo = () => {
      if (!showPorts) return null

      return (
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{node.inputs?.length || 0} entradas</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{node.outputs?.length || 0} saídas</span>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>
      )
    }

    // Render metadata
    const renderMetadata = () => {
      const items = []

      if (showRating && node.rating) {
        items.push(
          <div key="rating" className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>{node.rating.toFixed(1)}</span>
          </div>,
        )
      }

      if (showDownloads && node.downloads) {
        items.push(
          <div key="downloads" className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{node.downloads}</span>
          </div>,
        )
      }

      if (showAuthor && node.author) {
        items.push(
          <span key="author" className="truncate">
            {node.author}
          </span>,
        )
      }

      if (showVersion && node.version) {
        items.push(
          <Badge key="version" variant="outline" className="text-xs">
            v{node.version}
          </Badge>,
        )
      }

      if (items.length === 0) return null

      return <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">{items}</div>
    }

    // Render header
    const renderHeaderContent = () => {
      if (renderHeader) {
        return renderHeader(node)
      }

      return (
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {node.icon && <span className="flex-shrink-0">{node.icon}</span>}
              <h3 className={cn("font-medium text-slate-900 dark:text-slate-100 truncate", sizeConfig.text)}>
                {title || node.name}
              </h3>
              {showPremium && node.isPremium && (
                <Badge variant="secondary" className="text-xs">
                  Premium
                </Badge>
              )}
            </div>

            {(description || node.description) && displayMode !== "compact" && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {description || node.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 ml-2">
            {showFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFavoriteChange?.(node, !node.isFavorite)
                }}
                className="p-1 rounded hover:bg-accent"
                aria-label={node.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Star
                  className={cn("h-3 w-3", node.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground")}
                />
              </button>
            )}

            {onSecondaryAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSecondaryAction(node)
                }}
                className="p-1 rounded hover:bg-accent"
                aria-label="Ver detalhes"
              >
                <Eye className="h-3 w-3 text-muted-foreground" />
              </button>
            )}

            {showDragHandle && draggable && (
              <div className="text-muted-foreground cursor-grab">
                <GripVertical className="h-4 w-4" />
              </div>
            )}
          </div>

          {headerContent}
        </div>
      )
    }

    // Render footer
    const renderFooterContent = () => {
      if (renderFooter) {
        return renderFooter(node)
      }

      return (
        <>
          {renderTags()}
          {renderPortsInfo()}
          {renderMetadata()}
          {footerContent}
        </>
      )
    }

    // Render main content
    const renderMainContent = () => {
      if (renderContent) {
        return renderContent(node)
      }

      return (
        <div className={cn("flex flex-col", densityConfig.gap)}>
          {renderHeaderContent()}
          {displayMode === "detailed" && renderFooterContent()}
          {displayMode === "standard" && renderPortsInfo()}
        </div>
      )
    }

    const cardContent = (
      <div
        ref={ref}
        id={id}
        className={containerClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        draggable={draggable && !disabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        role={role}
        tabIndex={disabled ? -1 : tabIndex}
        aria-label={ariaLabel || `Node: ${node.name}`}
        aria-description={ariaDescription || node.description}
        aria-selected={isSelected}
        aria-disabled={disabled}
        data-testid={testId}
      >
        {renderMainContent()}
      </div>
    )

    // Wrap with tooltip if enabled
    if (showTooltip && node.description && !disabled) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium">{node.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{node.description}</p>
                {node.category && (
                  <Badge variant="outline" className="mt-2">
                    {node.category}
                  </Badge>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return cardContent
  },
)

NodeCard.displayName = "NodeCard"
