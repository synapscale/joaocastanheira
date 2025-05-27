"use client"

/**
 * NODE CARD - COMPONENTE APRIMORADO
 *
 * Card de node altamente parametrizável para sidebar e marketplace.
 * Suporta drag and drop, diferentes layouts, estados visuais e acessibilidade completa.
 */

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  GripVertical,
  Play,
  Settings,
  Star,
  Download,
  Eye,
  Plus,
  Info,
  Zap,
  Database,
  Code,
  Globe,
  Brain,
  Workflow,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  BaseComponentProps,
  InteractiveComponentProps,
  AccessibilityProps,
  ComponentSize,
  ComponentVariant,
  ThemeableProps,
  DensityProps,
  AnimationProps,
} from "@/types/component-base"

// ===== TIPOS E INTERFACES =====

/**
 * Porta de entrada ou saída do node
 */
export interface NodePort {
  /** ID único da porta */
  id: string
  /** Nome de exibição */
  name: string
  /** Tipo de dados */
  type: string
  /** Se é obrigatória */
  required?: boolean
  /** Se está conectada */
  connected?: boolean
  /** Valor padrão */
  defaultValue?: any
  /** Descrição da porta */
  description?: string
}

/**
 * Estatísticas do node
 */
export interface NodeStats {
  /** Número de downloads */
  downloads?: number
  /** Avaliação (0-5) */
  rating?: number
  /** Número de avaliações */
  reviewCount?: number
  /** Última atualização */
  lastUpdated?: string
  /** Versão */
  version?: string
}

/**
 * Autor do node
 */
export interface NodeAuthor {
  /** Nome do autor */
  name: string
  /** Avatar do autor */
  avatar?: string
  /** Se é verificado */
  verified?: boolean
  /** URL do perfil */
  profileUrl?: string
}

/**
 * Dados do node
 */
export interface NodeData {
  /** ID único */
  id: string
  /** Nome de exibição */
  name: string
  /** Descrição */
  description: string
  /** Categoria */
  category: string
  /** Subcategoria */
  subcategory?: string
  /** Ícone personalizado */
  icon?: React.ReactNode
  /** Cor personalizada */
  color?: string
  /** Portas de entrada */
  inputs?: NodePort[]
  /** Portas de saída */
  outputs?: NodePort[]
  /** Tags */
  tags?: string[]
  /** Estatísticas */
  stats?: NodeStats
  /** Autor */
  author?: NodeAuthor
  /** Se é premium */
  isPremium?: boolean
  /** Se é novo */
  isNew?: boolean
  /** Se é experimental */
  isExperimental?: boolean
  /** Metadados adicionais */
  metadata?: Record<string, any>
}

/**
 * Layout do card
 */
export type NodeCardLayout = "compact" | "default" | "detailed" | "minimal" | "grid"

/**
 * Estilo visual do card
 */
export type NodeCardStyle = "default" | "bordered" | "elevated" | "flat" | "gradient"

/**
 * Configuração visual avançada
 */
export interface NodeCardVisualConfig {
  /** Layout do card */
  layout?: NodeCardLayout
  /** Estilo visual */
  style?: NodeCardStyle
  /** Se deve mostrar ícone */
  showIcon?: boolean
  /** Se deve mostrar categoria */
  showCategory?: boolean
  /** Se deve mostrar tags */
  showTags?: boolean
  /** Se deve mostrar estatísticas */
  showStats?: boolean
  /** Se deve mostrar portas */
  showPorts?: boolean
  /** Se deve mostrar autor */
  showAuthor?: boolean
  /** Se deve mostrar badges */
  showBadges?: boolean
  /** Número máximo de tags visíveis */
  maxVisibleTags?: number
  /** Posição do drag handle */
  dragHandlePosition?: "left" | "right" | "top" | "none"
}

/**
 * Props principais do NodeCard
 */
export interface NodeCardProps
  extends BaseComponentProps,
    InteractiveComponentProps,
    AccessibilityProps,
    ThemeableProps,
    DensityProps,
    AnimationProps {
  // ===== PROPS OBRIGATÓRIAS =====
  /** Dados do node */
  node: NodeData

  // ===== COMPORTAMENTAIS =====
  /** Tamanho do card */
  size?: ComponentSize
  /** Variante visual */
  variant?: ComponentVariant
  /** Se é arrastável */
  draggable?: boolean
  /** Se está selecionado */
  selected?: boolean
  /** Se está destacado */
  highlighted?: boolean
  /** Configuração visual */
  visual?: NodeCardVisualConfig

  // ===== EVENTOS =====
  /** Callback de clique */
  onClick?: (node: NodeData) => void
  /** Callback de clique duplo */
  onDoubleClick?: (node: NodeData) => void
  /** Callback de início de arraste */
  onDragStart?: (event: React.DragEvent, node: NodeData) => void
  /** Callback de fim de arraste */
  onDragEnd?: (event: React.DragEvent, node: NodeData) => void
  /** Callback de hover */
  onHover?: (node: NodeData, isHovering: boolean) => void
  /** Callback de foco */
  onFocus?: (node: NodeData) => void
  /** Callback de blur */
  onBlur?: (node: NodeData) => void

  // ===== AÇÕES =====
  /** Callback para executar node */
  onExecute?: (node: NodeData) => void
  /** Callback para configurar node */
  onConfigure?: (node: NodeData) => void
  /** Callback para ver detalhes */
  onViewDetails?: (node: NodeData) => void
  /** Callback para adicionar ao canvas */
  onAddToCanvas?: (node: NodeData) => void
  /** Callback para favoritar */
  onFavorite?: (node: NodeData) => void
  /** Callback para download */
  onDownload?: (node: NodeData) => void

  // ===== CUSTOMIZAÇÃO AVANÇADA =====
  /** Renderização customizada do ícone */
  renderIcon?: (node: NodeData) => React.ReactNode
  /** Renderização customizada do header */
  renderHeader?: (node: NodeData) => React.ReactNode
  /** Renderização customizada do conteúdo */
  renderContent?: (node: NodeData) => React.ReactNode
  /** Renderização customizada do footer */
  renderFooter?: (node: NodeData) => React.ReactNode
  /** Renderização customizada das ações */
  renderActions?: (node: NodeData) => React.ReactNode
  /** Renderização customizada das portas */
  renderPorts?: (inputs: NodePort[], outputs: NodePort[]) => React.ReactNode
}

// ===== CONFIGURAÇÕES PADRÃO =====

const DEFAULT_VISUAL: NodeCardVisualConfig = {
  layout: "default",
  style: "default",
  showIcon: true,
  showCategory: true,
  showTags: true,
  showStats: false,
  showPorts: true,
  showAuthor: false,
  showBadges: true,
  maxVisibleTags: 3,
  dragHandlePosition: "left",
}

// ===== ÍCONES POR CATEGORIA =====

const categoryIcons = {
  "data-input": Database,
  "data-transformation": Code,
  "data-output": Download,
  ai: Brain,
  api: Globe,
  logic: Workflow,
  automation: Zap,
  default: Info,
}

// ===== CORES POR CATEGORIA =====

const categoryColors = {
  "data-input": {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-l-blue-500",
    text: "text-blue-700 dark:text-blue-300",
  },
  "data-transformation": {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-l-purple-500",
    text: "text-purple-700 dark:text-purple-300",
  },
  "data-output": {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-l-green-500",
    text: "text-green-700 dark:text-green-300",
  },
  ai: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-l-rose-500",
    text: "text-rose-700 dark:text-rose-300",
  },
  api: {
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-l-cyan-500",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  logic: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-l-indigo-500",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  automation: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-l-yellow-500",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  default: {
    bg: "bg-slate-50 dark:bg-slate-700/20",
    border: "border-l-slate-500",
    text: "text-slate-700 dark:text-slate-300",
  },
}

// ===== ESTILOS CONFIGURÁVEIS =====

const sizeStyles = {
  xs: {
    container: "p-2 text-xs",
    icon: "h-4 w-4",
    title: "text-xs font-medium",
    description: "text-xs",
    badge: "text-xs px-1 py-0.5",
  },
  sm: {
    container: "p-2 text-sm",
    icon: "h-4 w-4",
    title: "text-sm font-medium",
    description: "text-xs",
    badge: "text-xs px-2 py-0.5",
  },
  md: {
    container: "p-3 text-sm",
    icon: "h-5 w-5",
    title: "text-sm font-medium",
    description: "text-xs",
    badge: "text-xs px-2 py-1",
  },
  lg: {
    container: "p-4 text-base",
    icon: "h-6 w-6",
    title: "text-base font-medium",
    description: "text-sm",
    badge: "text-sm px-3 py-1",
  },
  xl: {
    container: "p-5 text-lg",
    icon: "h-7 w-7",
    title: "text-lg font-medium",
    description: "text-base",
    badge: "text-sm px-4 py-1.5",
  },
}

const layoutStyles = {
  compact: "min-h-[60px]",
  default: "min-h-[80px]",
  detailed: "min-h-[120px]",
  minimal: "min-h-[40px]",
  grid: "aspect-square min-h-[120px]",
}

const styleVariants = {
  default: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
  bordered: "bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600",
  elevated: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md",
  flat: "bg-slate-100 dark:bg-slate-700 border-0",
  gradient:
    "bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700",
}

// ===== COMPONENTE PRINCIPAL =====

/**
 * NodeCard - Card de node aprimorado
 *
 * @example
 * // Uso básico
 * <NodeCard
 *   node={nodeData}
 *   onClick={handleNodeClick}
 *   draggable
 * />
 *
 * @example
 * // Layout detalhado com estatísticas
 * <NodeCard
 *   node={nodeData}
 *   size="lg"
 *   visual={{
 *     layout: "detailed",
 *     showStats: true,
 *     showAuthor: true,
 *     showTags: true
 *   }}
 *   onExecute={handleExecute}
 *   onConfigure={handleConfigure}
 * />
 *
 * @example
 * // Layout compacto para listas
 * <NodeCard
 *   node={nodeData}
 *   size="sm"
 *   visual={{
 *     layout: "compact",
 *     showPorts: false,
 *     dragHandlePosition: "right"
 *   }}
 *   onAddToCanvas={handleAddToCanvas}
 * />
 */
export function NodeCard({
  // Obrigatórias
  node,

  // Comportamentais
  size = "md",
  variant = "default",
  draggable = false,
  selected = false,
  highlighted = false,
  visual = DEFAULT_VISUAL,
  disabled = false,
  density = "comfortable",
  animated = true,

  // Eventos
  onClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  onHover,
  onFocus,
  onBlur,

  // Ações
  onExecute,
  onConfigure,
  onViewDetails,
  onAddToCanvas,
  onFavorite,
  onDownload,

  // Customização
  renderIcon,
  renderHeader,
  renderContent,
  renderFooter,
  renderActions,
  renderPorts,

  // Acessibilidade
  ariaLabel,

  // Base
  className,
  testId,

  ...props
}: NodeCardProps) {
  // ===== ESTADO LOCAL =====
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // ===== CONFIGURAÇÕES MESCLADAS =====
  const mergedVisual = useMemo(() => ({ ...DEFAULT_VISUAL, ...visual }), [visual])

  // ===== ESTILOS COMPUTADOS =====
  const currentSizeStyles = sizeStyles[size]
  const currentLayoutStyles = layoutStyles[mergedVisual.layout || "default"]
  const currentStyleVariant = styleVariants[mergedVisual.style || "default"]
  const categoryColor = categoryColors[node.category as keyof typeof categoryColors] || categoryColors.default

  // ===== HANDLERS =====
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      e.stopPropagation()
      onClick?.(node)
    },
    [disabled, onClick, node],
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      e.stopPropagation()
      onDoubleClick?.(node)
    },
    [disabled, onDoubleClick, node],
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!draggable || disabled) return

      setIsDragging(true)

      // Configurar dados de arraste
      const dragData = {
        type: "node",
        node: node,
        source: "sidebar",
      }

      e.dataTransfer.setData("application/json", JSON.stringify(dragData))
      e.dataTransfer.effectAllowed = "copy"

      onDragStart?.(e, node)
    },
    [draggable, disabled, node, onDragStart],
  )

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      setIsDragging(false)
      onDragEnd?.(e, node)
    },
    [onDragEnd, node],
  )

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    onHover?.(node, true)
  }, [onHover, node])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    onHover?.(node, false)
  }, [onHover, node])

  const handleFocus = useCallback(() => {
    onFocus?.(node)
  }, [onFocus, node])

  const handleBlur = useCallback(() => {
    onBlur?.(node)
  }, [onBlur, node])

  // ===== RENDERIZAÇÃO DE ELEMENTOS =====
  const renderIconElement = useCallback(() => {
    if (!mergedVisual.showIcon) return null

    if (renderIcon) {
      return renderIcon(node)
    }

    if (node.icon) {
      return <div className={currentSizeStyles.icon}>{node.icon}</div>
    }

    const IconComponent = categoryIcons[node.category as keyof typeof categoryIcons] || categoryIcons.default
    return <IconComponent className={cn(currentSizeStyles.icon, categoryColor.text)} />
  }, [mergedVisual.showIcon, renderIcon, node, currentSizeStyles, categoryColor])

  const renderBadgesElement = useCallback(() => {
    if (!mergedVisual.showBadges) return null

    const badges = []

    if (node.isPremium) {
      badges.push(
        <Badge key="premium" variant="default" className="bg-yellow-100 text-yellow-800">
          Premium
        </Badge>,
      )
    }

    if (node.isNew) {
      badges.push(
        <Badge key="new" variant="default" className="bg-green-100 text-green-800">
          Novo
        </Badge>,
      )
    }

    if (node.isExperimental) {
      badges.push(
        <Badge key="experimental" variant="outline" className="border-orange-300 text-orange-700">
          Experimental
        </Badge>,
      )
    }

    return badges.length > 0 ? <div className="flex gap-1 flex-wrap">{badges}</div> : null
  }, [mergedVisual.showBadges, node])

  const renderTagsElement = useCallback(() => {
    if (!mergedVisual.showTags || !node.tags || node.tags.length === 0) return null

    const maxTags = mergedVisual.maxVisibleTags || 3
    const visibleTags = node.tags.slice(0, maxTags)
    const remainingCount = node.tags.length - maxTags

    return (
      <div className="flex gap-1 flex-wrap">
        {visibleTags.map((tag) => (
          <Badge key={tag} variant="outline" className={currentSizeStyles.badge}>
            {tag}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className={currentSizeStyles.badge}>
            +{remainingCount}
          </Badge>
        )}
      </div>
    )
  }, [mergedVisual.showTags, mergedVisual.maxVisibleTags, node.tags, currentSizeStyles])

  const renderStatsElement = useCallback(() => {
    if (!mergedVisual.showStats || !node.stats) return null

    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {node.stats.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{node.stats.rating.toFixed(1)}</span>
            {node.stats.reviewCount && <span>({node.stats.reviewCount})</span>}
          </div>
        )}
        {node.stats.downloads && (
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{node.stats.downloads.toLocaleString()}</span>
          </div>
        )}
        {node.stats.version && (
          <Badge variant="outline" className="text-xs">
            v{node.stats.version}
          </Badge>
        )}
      </div>
    )
  }, [mergedVisual.showStats, node.stats])

  const renderPortsElement = useCallback(() => {
    if (!mergedVisual.showPorts) return null

    if (renderPorts && node.inputs && node.outputs) {
      return renderPorts(node.inputs, node.outputs)
    }

    const inputCount = node.inputs?.length || 0
    const outputCount = node.outputs?.length || 0

    if (inputCount === 0 && outputCount === 0) return null

    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>
            {inputCount} entrada{inputCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span>
            {outputCount} saída{outputCount !== 1 ? "s" : ""}
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
    )
  }, [mergedVisual.showPorts, renderPorts, node.inputs, node.outputs])

  const renderAuthorElement = useCallback(() => {
    if (!mergedVisual.showAuthor || !node.author) return null

    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {node.author.avatar && (
          <img src={node.author.avatar || "/placeholder.svg"} alt={node.author.name} className="w-4 h-4 rounded-full" />
        )}
        <span>{node.author.name}</span>
        {node.author.verified && <span className="text-blue-500">✓</span>}
      </div>
    )
  }, [mergedVisual.showAuthor, node.author])

  const renderActionsElement = useCallback(() => {
    if (renderActions) {
      return renderActions(node)
    }

    const actions = []

    if (onExecute) {
      actions.push(
        <TooltipProvider key="execute">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onExecute(node)
                }}
                className="h-6 w-6 p-0"
              >
                <Play className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Executar</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )
    }

    if (onConfigure) {
      actions.push(
        <TooltipProvider key="configure">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onConfigure(node)
                }}
                className="h-6 w-6 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configurar</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )
    }

    if (onAddToCanvas) {
      actions.push(
        <TooltipProvider key="add">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToCanvas(node)
                }}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar ao Canvas</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )
    }

    if (onViewDetails) {
      actions.push(
        <TooltipProvider key="details">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails(node)
                }}
                className="h-6 w-6 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver Detalhes</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )
    }

    return actions.length > 0 ? (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">{actions}</div>
    ) : null
  }, [renderActions, node, onExecute, onConfigure, onAddToCanvas, onViewDetails])

  const renderDragHandle = useCallback(() => {
    if (!draggable || mergedVisual.dragHandlePosition === "none") return null

    return (
      <div className="drag-handle text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4" />
      </div>
    )
  }, [draggable, mergedVisual.dragHandlePosition])

  // ===== RENDERIZAÇÃO PRINCIPAL =====
  return (
    <div
      className={cn(
        "group relative rounded-lg transition-all duration-200 cursor-pointer",
        currentLayoutStyles,
        currentStyleVariant,
        currentSizeStyles.container,
        categoryColor.bg,
        categoryColor.border,
        "border-l-4",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        highlighted && "ring-2 ring-yellow-400 ring-offset-2",
        isHovered && !isDragging && "shadow-md transform translate-x-0.5 -translate-y-0.5",
        isDragging && "opacity-50 scale-95",
        disabled && "opacity-60 cursor-not-allowed",
        draggable && !disabled && "cursor-grab active:cursor-grabbing",
        animated && "transition-all duration-200",
        className,
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      draggable={draggable && !disabled}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={ariaLabel || `Node: ${node.name}`}
      data-testid={testId}
      data-node-id={node.id}
      data-category={node.category}
      {...props}
    >
      {/* Drag handle */}
      {mergedVisual.dragHandlePosition === "left" && (
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2">{renderDragHandle()}</div>
      )}

      {mergedVisual.dragHandlePosition === "right" && (
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">{renderDragHandle()}</div>
      )}

      {mergedVisual.dragHandlePosition === "top" && (
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">{renderDragHandle()}</div>
      )}

      {/* Header customizado */}
      {renderHeader ? (
        renderHeader(node)
      ) : (
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {renderIconElement()}
            <div className="min-w-0 flex-1">
              <h3 className={cn(currentSizeStyles.title, "truncate")}>{node.name}</h3>
              {mergedVisual.showCategory && (
                <p className={cn("text-xs text-muted-foreground", categoryColor.text)}>{node.category}</p>
              )}
            </div>
          </div>
          {renderActionsElement()}
        </div>
      )}

      {/* Conteúdo customizado */}
      {renderContent ? (
        renderContent(node)
      ) : (
        <div className="space-y-2">
          {/* Descrição */}
          <p className={cn(currentSizeStyles.description, "text-muted-foreground line-clamp-2")}>{node.description}</p>

          {/* Badges */}
          {renderBadgesElement()}

          {/* Tags */}
          {renderTagsElement()}

          {/* Estatísticas */}
          {renderStatsElement()}

          {/* Autor */}
          {renderAuthorElement()}
        </div>
      )}

      {/* Footer customizado */}
      {renderFooter ? (
        renderFooter(node)
      ) : (
        <div className="mt-3 pt-2 border-t border-border/50">{renderPortsElement()}</div>
      )}
    </div>
  )
}

// ===== EXPORTS =====
export type { NodePort, NodeStats, NodeAuthor, NodeData, NodeCardLayout, NodeCardStyle, NodeCardVisualConfig }
