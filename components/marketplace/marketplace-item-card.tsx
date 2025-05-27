"use client"

import type React from "react"
import { useState, useMemo, forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StarIcon, GripVertical, Download, Heart, Share, MoreHorizontal, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  BaseComponentProps,
  AccessibilityProps,
  InteractionProps,
  VisualProps,
} from "@/types/component-interfaces"

/**
 * Mapeamento de cores por categoria
 */
const CATEGORY_COLORS = {
  ai: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200",
  apis: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200",
  automacao: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200",
  dados: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200",
} as const

/**
 * Estrutura do autor
 */
export interface MarketplaceAuthor {
  /** Nome de exibição do autor */
  displayName: string
  /** Se o autor é verificado */
  isVerified?: boolean
  /** Avatar do autor */
  avatar?: string
  /** ID do autor */
  id?: string
  /** URL do perfil do autor */
  profileUrl?: string
}

/**
 * Estrutura do item do marketplace
 */
export interface MarketplaceItem {
  /** ID único do item */
  id: string
  /** Nome do item */
  name: string
  /** Descrição do item */
  description?: string
  /** Categoria do item */
  category?: string
  /** Autor do item */
  author?: MarketplaceAuthor
  /** Tags do item */
  tags?: string[]
  /** Rating do item (0-5) */
  rating?: number
  /** Número de downloads */
  downloads?: number
  /** Data de publicação */
  publishedAt?: string
  /** Data de atualização */
  updatedAt?: string
  /** Versão do item */
  version?: string
  /** Se o item é premium */
  isPremium?: boolean
  /** Se o item é favorito do usuário */
  isFavorite?: boolean
  /** Preço do item (se premium) */
  price?: number
  /** Moeda do preço */
  currency?: string
  /** Ícone personalizado */
  icon?: React.ReactNode
  /** Imagem de preview */
  previewImage?: string
  /** Metadados adicionais */
  metadata?: Record<string, any>
}

/**
 * Props do componente MarketplaceItemCard
 */
export interface MarketplaceItemCardProps
  extends BaseComponentProps,
    AccessibilityProps,
    InteractionProps,
    VisualProps {
  // ===== PROPS OBRIGATÓRIAS =====
  /** Item do marketplace a ser exibido */
  item: MarketplaceItem

  // ===== CONTEÚDO =====
  /** Título personalizado (sobrescreve item.name) */
  title?: string
  /** Descrição personalizada (sobrescreve item.description) */
  description?: string
  /** Conteúdo adicional no header */
  headerContent?: React.ReactNode
  /** Conteúdo adicional no footer */
  footerContent?: React.ReactNode
  /** Conteúdo adicional no corpo */
  bodyContent?: React.ReactNode

  // ===== COMPORTAMENTAIS =====
  /** Se o card é arrastável */
  draggable?: boolean
  /** Se deve mostrar informações do autor */
  showAuthor?: boolean
  /** Se deve mostrar rating */
  showRating?: boolean
  /** Se deve mostrar downloads */
  showDownloads?: boolean
  /** Se deve mostrar data de publicação */
  showPublishDate?: boolean
  /** Se deve mostrar data de atualização */
  showUpdateDate?: boolean
  /** Se deve mostrar versão */
  showVersion?: boolean
  /** Se deve mostrar tags */
  showTags?: boolean
  /** Se deve mostrar categoria */
  showCategory?: boolean
  /** Se deve mostrar preço */
  showPrice?: boolean
  /** Se deve mostrar botão de favorito */
  showFavoriteButton?: boolean
  /** Se deve mostrar botão de compartilhar */
  showShareButton?: boolean
  /** Se deve mostrar botão de mais opções */
  showMoreButton?: boolean
  /** Se deve mostrar handle de drag */
  showDragHandle?: boolean
  /** Se deve mostrar preview da imagem */
  showPreviewImage?: boolean
  /** Se deve mostrar tooltip com informações completas */
  showTooltip?: boolean
  /** Número máximo de tags visíveis */
  maxVisibleTags?: number
  /** Modo de exibição do card */
  displayMode?: "minimal" | "compact" | "standard" | "detailed" | "grid"

  // ===== VISUAIS =====
  /** Layout do card */
  layout?: "horizontal" | "vertical"
  /** Densidade do conteúdo */
  density?: "comfortable" | "compact" | "spacious"
  /** Se deve mostrar borda colorida baseada na categoria */
  showCategoryBorder?: boolean
  /** Se deve mostrar background colorido baseado na categoria */
  showCategoryBackground?: boolean
  /** Estilo da imagem de preview */
  imageStyle?: "square" | "rounded" | "circle"
  /** Posição da imagem */
  imagePosition?: "top" | "left" | "right"
  /** Intensidade da sombra */
  shadowIntensity?: "none" | "subtle" | "medium" | "strong"
  /** Estilo da borda */
  borderStyle?: "none" | "subtle" | "prominent"

  // ===== EVENTOS =====
  /** Callback quando o usuário quer ver detalhes */
  onViewDetails?: (item: MarketplaceItem) => void
  /** Callback quando o usuário quer importar o item */
  onImport?: (item: MarketplaceItem) => void
  /** Callback quando o usuário quer adicionar à coleção */
  onAddToCollection?: (item: MarketplaceItem) => void
  /** Callback quando o usuário quer adicionar ao canvas */
  onAddToCanvas?: (item: MarketplaceItem) => void
  /** Callback quando o drag inicia */
  onDragStart?: (event: React.DragEvent, item: MarketplaceItem) => void
  /** Callback quando o drag termina */
  onDragEnd?: (event: React.DragEvent, item: MarketplaceItem) => void
  /** Callback quando o favorito é alterado */
  onFavoriteChange?: (item: MarketplaceItem, isFavorite: boolean) => void
  /** Callback quando o compartilhar é clicado */
  onShare?: (item: MarketplaceItem) => void
  /** Callback quando uma tag é clicada */
  onTagClick?: (tag: string, item: MarketplaceItem) => void
  /** Callback quando o autor é clicado */
  onAuthorClick?: (author: MarketplaceAuthor, item: MarketplaceItem) => void
  /** Callback para mais opções */
  onMoreOptions?: (item: MarketplaceItem) => void

  // ===== CUSTOMIZAÇÃO =====
  /** Função para renderização customizada do conteúdo */
  renderContent?: (item: MarketplaceItem) => React.ReactNode
  /** Função para renderização customizada do header */
  renderHeader?: (item: MarketplaceItem) => React.ReactNode
  /** Função para renderização customizada do footer */
  renderFooter?: (item: MarketplaceItem) => React.ReactNode
  /** Função para renderização customizada das ações */
  renderActions?: (item: MarketplaceItem) => React.ReactNode
  /** Mapeamento customizado de cores por categoria */
  categoryColorMap?: Record<string, string>
  /** Formatador customizado de data */
  dateFormatter?: (date: string) => string
  /** Formatador customizado de preço */
  priceFormatter?: (price: number, currency: string) => string
}

/**
 * Configurações de densidade
 */
const DENSITY_CONFIG = {
  comfortable: { padding: "p-4", gap: "gap-3", headerPadding: "p-4 pb-2" },
  compact: { padding: "p-3", gap: "gap-2", headerPadding: "p-3 pb-1" },
  spacious: { padding: "p-6", gap: "gap-4", headerPadding: "p-6 pb-3" },
} as const

/**
 * Configurações de tamanho
 */
const SIZE_CONFIG = {
  xs: { minHeight: "min-h-24", imageSize: "h-12 w-12", textSize: "text-xs" },
  sm: { minHeight: "min-h-28", imageSize: "h-16 w-16", textSize: "text-sm" },
  md: { minHeight: "min-h-32", imageSize: "h-20 w-20", textSize: "text-sm" },
  lg: { minHeight: "min-h-36", imageSize: "h-24 w-24", textSize: "text-base" },
  xl: { minHeight: "min-h-40", imageSize: "h-28 w-28", textSize: "text-lg" },
} as const

/**
 * MarketplaceItemCard - Componente para exibir itens do marketplace
 *
 * Componente altamente parametrizável para exibir itens do marketplace com suporte a:
 * - Drag and drop para canvas
 * - Múltiplos layouts e densidades
 * - Informações detalhadas (autor, rating, downloads, etc.)
 * - Ações contextuais (favoritar, compartilhar, importar)
 * - Customização visual por categoria
 * - Acessibilidade completa
 * - Renderização customizada
 *
 * @example
 * // Uso básico
 * <MarketplaceItemCard
 *   item={marketplaceItem}
 *   draggable
 *   onAddToCanvas={handleAddToCanvas}
 * />
 *
 * @example
 * // Card detalhado
 * <MarketplaceItemCard
 *   item={marketplaceItem}
 *   displayMode="detailed"
 *   showAuthor
 *   showRating
 *   showDownloads
 *   showTags
 *   showFavoriteButton
 *   density="spacious"
 *   onViewDetails={handleViewDetails}
 *   onFavoriteChange={handleFavoriteChange}
 * />
 *
 * @example
 * // Grid layout compacto
 * <MarketplaceItemCard
 *   item={marketplaceItem}
 *   displayMode="grid"
 *   layout="vertical"
 *   density="compact"
 *   size="sm"
 *   maxVisibleTags={2}
 * />
 */
export const MarketplaceItemCard = forwardRef<HTMLDivElement, MarketplaceItemCardProps>(
  (
    {
      // Obrigatórias
      item,

      // Conteúdo
      title,
      description,
      headerContent,
      footerContent,
      bodyContent,

      // Comportamentais
      draggable = false,
      showAuthor = true,
      showRating = true,
      showDownloads = true,
      showPublishDate = false,
      showUpdateDate = false,
      showVersion = false,
      showTags = true,
      showCategory = true,
      showPrice = true,
      showFavoriteButton = false,
      showShareButton = false,
      showMoreButton = false,
      showDragHandle = true,
      showPreviewImage = false,
      showTooltip = true,
      maxVisibleTags = 3,
      displayMode = "standard",
      disabled = false,
      isLoading = false,
      isSelected = false,
      isActive = false,

      // Visuais
      layout = "horizontal",
      density = "compact",
      size = "md",
      variant = "default",
      showCategoryBorder = true,
      showCategoryBackground = false,
      imageStyle = "rounded",
      imagePosition = "left",
      shadowIntensity = "subtle",
      borderStyle = "subtle",
      fullWidth = false,

      // Eventos
      onClick,
      onViewDetails,
      onImport,
      onAddToCollection,
      onAddToCanvas,
      onDragStart,
      onDragEnd,
      onFavoriteChange,
      onShare,
      onTagClick,
      onAuthorClick,
      onMoreOptions,
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
      renderActions,
      categoryColorMap = CATEGORY_COLORS,
      dateFormatter,
      priceFormatter,

      // Base
      className,
      id,
      testId,
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false)

    // Configurações baseadas nas props
    const densityConfig = DENSITY_CONFIG[density]
    const sizeConfig = SIZE_CONFIG[size]

    // Determina o estilo da categoria
    const categoryStyle = useMemo(() => {
      const categoryKey = item.category?.toLowerCase() || "default"
      return categoryColorMap[categoryKey] || categoryColorMap.default || CATEGORY_COLORS.default
    }, [item.category, categoryColorMap])

    // Classes do container principal
    const containerClasses = useMemo(() => {
      return cn(
        // Base
        "relative transition-all duration-200",
        "bg-white dark:bg-slate-800",
        "border border-slate-200 dark:border-slate-700",
        "rounded-lg overflow-hidden",

        // Tamanho
        sizeConfig.minHeight,
        fullWidth && "w-full",

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
        !disabled && !isDragging && "hover:shadow-md hover:scale-[1.02]",
        isDragging && "opacity-70 scale-95",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isActive && "bg-accent",
        disabled && "opacity-60 cursor-not-allowed",
        isLoading && "animate-pulse",

        // Interação
        !disabled && (onClick || onViewDetails) && "cursor-pointer",
        draggable && !disabled && "cursor-grab active:cursor-grabbing",

        className,
      )
    }, [
      sizeConfig,
      fullWidth,
      showCategoryBorder,
      showCategoryBackground,
      categoryStyle,
      borderStyle,
      shadowIntensity,
      disabled,
      isDragging,
      isSelected,
      isActive,
      isLoading,
      onClick,
      onViewDetails,
      draggable,
      className,
    ])

    // Formatadores padrão
    const defaultDateFormatter = (dateString: string): string => {
      try {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date)
      } catch {
        return dateString
      }
    }

    const defaultPriceFormatter = (price: number, currency = "BRL"): string => {
      try {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: currency,
        }).format(price)
      } catch {
        return `${currency} ${price}`
      }
    }

    // Handle drag start
    const handleDragStart = (event: React.DragEvent) => {
      if (disabled || !draggable) return

      setIsDragging(true)

      // Create visual drag image
      const dragImage = document.createElement("div")
      dragImage.className =
        "bg-white dark:bg-slate-800 rounded-md shadow-lg p-2 border border-slate-200 dark:border-slate-700"
      dragImage.innerHTML = `<div class="font-medium">${item.name}</div>`
      dragImage.style.position = "absolute"
      dragImage.style.top = "-1000px"
      document.body.appendChild(dragImage)

      event.dataTransfer.setDragImage(dragImage, 0, 0)

      // Set drag data
      const dragData = {
        type: "marketplace-item",
        item: item,
      }
      event.dataTransfer.setData("application/json", JSON.stringify(dragData))
      event.dataTransfer.effectAllowed = "copy"

      // Clean up drag image
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage)
        }
      }, 0)

      onDragStart?.(event, item)
    }

    // Handle drag end
    const handleDragEnd = (event: React.DragEvent) => {
      setIsDragging(false)
      onDragEnd?.(event, item)
    }

    // Handle click
    const handleClick = (event: React.MouseEvent) => {
      if (disabled || isLoading) return

      onClick?.(event)
      onViewDetails?.(item)
    }

    // Handle keyboard
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled || isLoading) return

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onViewDetails?.(item)
      }

      onKeyDown?.(event)
    }

    // Render rating
    const renderRating = () => {
      if (!showRating || !item.rating) return null

      return (
        <div className="flex items-center gap-1 text-yellow-500">
          <StarIcon size={14} aria-hidden="true" />
          <span className="text-xs font-medium">{item.rating.toFixed(1)}</span>
        </div>
      )
    }

    // Render category and tags
    const renderCategoryAndTags = () => {
      const elements = []

      if (showCategory && item.category) {
        elements.push(
          <Badge key="category" variant="outline" className={categoryStyle}>
            {item.category}
          </Badge>,
        )
      }

      if (showTags && item.tags?.length) {
        const visibleTags = item.tags.slice(0, maxVisibleTags)
        const remainingCount = item.tags.length - maxVisibleTags

        visibleTags.forEach((tag) => {
          elements.push(
            <Badge
              key={tag}
              variant="outline"
              className="text-xs cursor-pointer hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation()
                onTagClick?.(tag, item)
              }}
            >
              {tag}
            </Badge>,
          )
        })

        if (remainingCount > 0) {
          elements.push(
            <Badge key="remaining" variant="outline" className="text-xs">
              +{remainingCount}
            </Badge>,
          )
        }
      }

      if (elements.length === 0) return null

      return <div className="flex flex-wrap gap-1 mb-2">{elements}</div>
    }

    // Render author info
    const renderAuthorInfo = () => {
      if (!showAuthor || !item.author) return null

      return (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-primary"
          onClick={(e) => {
            e.stopPropagation()
            onAuthorClick?.(item.author!, item)
          }}
        >
          <Avatar className="h-4 w-4">
            <AvatarFallback>{item.author.displayName.charAt(0)}</AvatarFallback>
            <AvatarImage
              src={item.author.avatar || `/placeholder.svg?height=32&width=32&query=${item.author.displayName}`}
              alt={`${item.author.displayName} avatar`}
            />
          </Avatar>
          <span className="truncate">{item.author.displayName}</span>
          {item.author.isVerified && (
            <span className="text-blue-500" aria-label="Verified author">
              ✓
            </span>
          )}
        </div>
      )
    }

    // Render metadata
    const renderMetadata = () => {
      const items = []

      if (showDownloads && item.downloads !== undefined) {
        items.push(
          <div key="downloads" className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{item.downloads}</span>
          </div>,
        )
      }

      if (showPublishDate && item.publishedAt) {
        const formatter = dateFormatter || defaultDateFormatter
        items.push(
          <div key="published" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatter(item.publishedAt)}</span>
          </div>,
        )
      }

      if (showVersion && item.version) {
        items.push(
          <Badge key="version" variant="outline" className="text-xs">
            v{item.version}
          </Badge>,
        )
      }

      if (showPrice && item.isPremium && item.price !== undefined) {
        const formatter = priceFormatter || defaultPriceFormatter
        items.push(
          <Badge key="price" variant="secondary" className="text-xs">
            {formatter(item.price, item.currency)}
          </Badge>,
        )
      }

      if (items.length === 0) return null

      return <div className="flex items-center gap-2 text-xs text-muted-foreground">{items}</div>
    }

    // Render actions
    const renderActionButtons = () => {
      if (renderActions) {
        return renderActions(item)
      }

      const actions = []

      if (showFavoriteButton) {
        actions.push(
          <Button
            key="favorite"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onFavoriteChange?.(item, !item.isFavorite)
            }}
            aria-label={item.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={cn("h-4 w-4", item.isFavorite ? "text-red-500 fill-current" : "text-muted-foreground")} />
          </Button>,
        )
      }

      if (showShareButton) {
        actions.push(
          <Button
            key="share"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onShare?.(item)
            }}
            aria-label="Compartilhar"
          >
            <Share className="h-4 w-4" />
          </Button>,
        )
      }

      if (showMoreButton) {
        actions.push(
          <Button
            key="more"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onMoreOptions?.(item)
            }}
            aria-label="Mais opções"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>,
        )
      }

      if (actions.length === 0) return null

      return <div className="flex items-center gap-1">{actions}</div>
    }

    // Render header
    const renderHeaderContent = () => {
      if (renderHeader) {
        return renderHeader(item)
      }

      return (
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <h3 className={cn("font-medium truncate", sizeConfig.textSize)}>{title || item.name}</h3>
              {item.isPremium && (
                <Badge variant="secondary" className="text-xs">
                  Premium
                </Badge>
              )}
            </div>

            {renderRating()}
          </div>

          <div className="flex items-center gap-1 ml-2">
            {renderActionButtons()}

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

    // Render main content
    const renderMainContent = () => {
      if (renderContent) {
        return renderContent(item)
      }

      return (
        <CardContent className={densityConfig.padding}>
          <div className={cn("flex gap-3", layout === "vertical" ? "flex-col" : "items-start")}>
            {/* Preview image */}
            {showPreviewImage && item.previewImage && (
              <div
                className={cn(
                  "flex-shrink-0",
                  imageStyle === "circle" && "rounded-full overflow-hidden",
                  imageStyle === "rounded" && "rounded-md overflow-hidden",
                  sizeConfig.imageSize,
                )}
              >
                <img
                  src={item.previewImage || "/placeholder.svg"}
                  alt={`Preview of ${item.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {renderHeaderContent()}

              {/* Description */}
              {(description || item.description) && displayMode !== "minimal" && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{description || item.description}</p>
              )}

              {/* Category and tags */}
              {displayMode !== "minimal" && renderCategoryAndTags()}

              {/* Body content */}
              {bodyContent}

              {/* Footer */}
              {displayMode === "detailed" && (
                <div className="mt-3 space-y-2">
                  {renderAuthorInfo()}
                  {renderMetadata()}
                </div>
              )}

              {displayMode === "standard" && (
                <div className="flex items-center justify-between mt-2">
                  {renderAuthorInfo()}
                  {renderMetadata()}
                </div>
              )}

              {footerContent}
            </div>
          </div>
        </CardContent>
      )
    }

    const cardContent = (
      <Card
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
        aria-label={ariaLabel || `Marketplace item: ${item.name}`}
        aria-description={ariaDescription || item.description}
        aria-selected={isSelected}
        aria-disabled={disabled}
        data-testid={testId}
      >
        {renderMainContent()}
      </Card>
    )

    // Wrap with tooltip if enabled
    if (showTooltip && item.description && !disabled) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                {item.category && (
                  <Badge variant="outline" className="mt-2">
                    {item.category}
                  </Badge>
                )}
                {item.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <StarIcon size={12} className="text-yellow-500" />
                    <span className="text-xs">{item.rating.toFixed(1)}</span>
                  </div>
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

MarketplaceItemCard.displayName = "MarketplaceItemCard"
