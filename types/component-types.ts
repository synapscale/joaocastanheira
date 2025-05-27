import type React from "react"

/**
 * Common size variants used across UI components
 */
export type Size = "xs" | "sm" | "md" | "lg" | "xl"

/**
 * Common appearance variants used across UI components
 */
export type Variant = "default" | "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive"

/**
 * Alignment options for content positioning
 */
export type Alignment = "left" | "center" | "right"

/**
 * Position options for element placement
 */
export type Position = "top" | "right" | "bottom" | "left"

/**
 * Status types for indicating component states
 */
export type StatusType =
  | "success"
  | "pending"
  | "error"
  | "warning"
  | "info"
  | "draft"
  | "published"
  | "rejected"
  | "failed"

/**
 * Base interface for all components with common properties
 */
export interface BaseComponentProps {
  /** Additional CSS classes to apply */
  className?: string
  /** Test identifier for automated testing */
  testId?: string
  /** Unique identifier for the component */
  id?: string
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** Whether to hide from screen readers */
  ariaHidden?: boolean
}

/**
 * Interface for components that can be disabled
 */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean
  /** Reason for disabled state (shown in tooltip) */
  disabledReason?: string
}

/**
 * Interface for components with loading states
 */
export interface LoadingProps {
  /** Whether the component is in loading state */
  isLoading?: boolean
  /** Text to display during loading */
  loadingText?: string
  /** Whether to show loading indicator */
  showLoadingIndicator?: boolean
}

/**
 * Interface for focusable components
 */
export interface FocusableProps {
  /** Whether to auto-focus when mounted */
  autoFocus?: boolean
  /** Tab index for keyboard navigation */
  tabIndex?: number
  /** Focus event handler */
  onFocus?: React.FocusEventHandler
  /** Blur event handler */
  onBlur?: React.FocusEventHandler
}

/**
 * Interface for clickable components
 */
export interface ClickableProps extends DisableableProps {
  /** Click event handler */
  onClick?: React.MouseEventHandler
  /** Double-click event handler */
  onDoubleClick?: React.MouseEventHandler
  /** Context menu event handler */
  onContextMenu?: React.MouseEventHandler
  /** Whether to show pointer cursor on hover */
  showCursor?: boolean
}

/**
 * Interface for draggable components
 */
export interface DraggableProps extends DisableableProps {
  /** Whether the component can be dragged */
  isDraggable?: boolean
  /** Data to transfer during drag operations */
  dragData?: any | (() => any)
  /** Drag start event handler */
  onDragStart?: React.DragEventHandler
  /** Drag end event handler */
  onDragEnd?: React.DragEventHandler
  /** CSS class applied during dragging */
  dragClassName?: string
  /** Custom drag image */
  dragImage?: HTMLElement | ((event: React.DragEvent) => HTMLElement)
}

/**
 * Interface for components that can receive drops
 */
export interface DroppableProps extends DisableableProps {
  /** Whether the component can receive drops */
  isDroppable?: boolean
  /** Accepted data types for drops */
  acceptTypes?: string[]
  /** Drag enter event handler */
  onDragEnter?: React.DragEventHandler
  /** Drag leave event handler */
  onDragLeave?: React.DragEventHandler
  /** Drag over event handler */
  onDragOver?: React.DragEventHandler
  /** Drop event handler */
  onDrop?: React.DragEventHandler
  /** CSS class applied when drag is over */
  dropOverClassName?: string
}

/**
 * Interface for selectable components
 */
export interface SelectableProps extends DisableableProps {
  /** Whether the component is selected */
  isSelected?: boolean
  /** Selection change handler */
  onSelectionChange?: (isSelected: boolean) => void
  /** CSS class applied when selected */
  selectedClassName?: string
}

/**
 * Interface for expandable components
 */
export interface ExpandableProps {
  /** Whether the component is expanded */
  isExpanded?: boolean
  /** Expansion change handler */
  onExpandedChange?: (isExpanded: boolean) => void
  /** Whether to animate expansion/collapse */
  animate?: boolean
  /** Animation duration in milliseconds */
  animationDuration?: number
}

/**
 * Interface for components with tooltips
 */
export interface TooltipProps {
  /** Tooltip content */
  tooltip?: React.ReactNode
  /** Delay before showing tooltip */
  tooltipDelay?: number
  /** Tooltip position relative to component */
  tooltipPosition?: Position
  /** Whether tooltip is disabled */
  tooltipDisabled?: boolean
}

/**
 * Interface for components with validation states
 */
export interface ValidationProps {
  /** Whether component has error state */
  hasError?: boolean
  /** Error message to display */
  errorMessage?: string
  /** Whether component has warning state */
  hasWarning?: boolean
  /** Warning message to display */
  warningMessage?: string
  /** Whether component has success state */
  hasSuccess?: boolean
  /** Success message to display */
  successMessage?: string
  /** Validation function */
  validate?: (value: any) => string | null
}

/**
 * Interface for themeable components
 */
export interface ThemeableProps {
  /** Visual variant of the component */
  variant?: string
  /** Size variant of the component */
  size?: Size
  /** Color scheme of the component */
  colorScheme?: string
  /** Whether to use system color scheme */
  useSystemColorScheme?: boolean
}

/**
 * Interface for components with animations
 */
export interface AnimatableProps {
  /** Whether component should animate */
  animate?: boolean
  /** Type of animation to apply */
  animationType?: "fade" | "slide" | "scale" | "custom"
  /** Animation duration in milliseconds */
  animationDuration?: number
  /** Animation delay in milliseconds */
  animationDelay?: number
  /** Animation easing function */
  animationEasing?: string
}

/**
 * Interface for components that support references
 */
export interface RefProps<T> {
  /**
   * Referência para o elemento DOM subjacente
   */
  ref?: React.Ref<T>
}

/**
 * Interface para componentes que podem ter um estado de hover
 */
export interface HoverableProps {
  /**
   * Função chamada quando o mouse entra no componente
   */
  onMouseEnter?: React.MouseEventHandler

  /**
   * Função chamada quando o mouse sai do componente
   */
  onMouseLeave?: React.MouseEventHandler
}

/**
 * Interface para componentes que podem ter um estado de teclado
 */
export interface KeyboardProps {
  /**
   * Função chamada quando uma tecla é pressionada enquanto o componente está focado
   */
  onKeyDown?: React.KeyboardEventHandler

  /**
   * Função chamada quando uma tecla é solta enquanto o componente está focado
   */
  onKeyUp?: React.KeyboardEventHandler

  /**
   * Função chamada quando uma tecla é pressionada e solta enquanto o componente está focado
   */
  onKeyPress?: React.KeyboardEventHandler
}

/**
 * Interface para componentes que podem ter um estado controlado
 */
export interface ControlledProps<T> {
  /**
   * Valor atual do componente
   */
  value?: T

  /**
   * Valor padrão do componente (usado para componentes não controlados)
   */
  defaultValue?: T

  /**
   * Função chamada quando o valor muda
   * @param value - O novo valor
   */
  onChange?: (value: T) => void
}

/**
 * Interface para componentes que podem ter um estado de seleção
 */
export interface SelectableProps {
  /**
   * Se verdadeiro, o componente está selecionado
   */
  selected?: boolean

  /**
   * Função chamada quando o estado de seleção muda
   * @param selected - O novo estado de seleção
   */
  onSelectedChange?: (selected: boolean) => void
}

/**
 * Interface para componentes que podem ter um estado de expansão
 */
export interface ExpandableProps {
  /**
   * Se verdadeiro, o componente está expandido
   */
  expanded?: boolean

  /**
   * Função chamada quando o estado de expansão muda
   * @param expanded - O novo estado de expansão
   */
  onExpandedChange?: (expanded: boolean) => void
}

/**
 * Interface para componentes que podem ter um estado de validação
 */
export interface ValidationProps {
  /**
   * Se verdadeiro, o componente está em estado de erro
   */
  error?: boolean

  /**
   * Mensagem de erro a ser exibida
   */
  errorMessage?: string

  /**
   * Se verdadeiro, o componente está em estado de sucesso
   */
  success?: boolean

  /**
   * Mensagem de sucesso a ser exibida
   */
  successMessage?: string

  /**
   * Se verdadeiro, o componente está em estado de aviso
   */
  warning?: boolean

  /**
   * Mensagem de aviso a ser exibida
   */
  warningMessage?: string
}

/**
 * Interface para componentes que podem ter um estado de tema
 */
export interface ThemeableProps {
  /**
   * Tema a ser aplicado ao componente
   */
  theme?: "light" | "dark" | "system"

  /**
   * Variante de cor a ser aplicada ao componente
   */
  colorVariant?: string
}

/**
 * Interface para componentes que podem ter um estado de responsividade
 */
export interface ResponsiveProps {
  /**
   * Se verdadeiro, o componente será ocultado em dispositivos móveis
   */
  hideOnMobile?: boolean

  /**
   * Se verdadeiro, o componente será ocultado em tablets
   */
  hideOnTablet?: boolean

  /**
   * Se verdadeiro, o componente será ocultado em desktops
   */
  hideOnDesktop?: boolean
}

/**
 * Interface para componentes que podem ter um estado de teste
 */
export interface TestableProps {
  /**
   * ID de teste para uso em testes automatizados
   */
  testId?: string
}

/**
 * Interface para componentes que podem ter um estado de tooltip
 */
export interface TooltipProps {
  /**
   * Texto do tooltip
   */
  tooltip?: string

  /**
   * Posição do tooltip
   */
  tooltipPosition?: Position

  /**
   * Atraso antes de mostrar o tooltip em milissegundos
   */
  tooltipDelay?: number
}

/**
 * Interface para componentes que podem ter um estado de ícone
 */
export interface IconProps {
  /**
   * Ícone a ser exibido
   */
  icon?: React.ReactNode

  /**
   * Posição do ícone
   */
  iconPosition?: "left" | "right"
}

/**
 * Interface para componentes que podem ter um estado de badge
 */
export interface BadgeProps {
  /**
   * Conteúdo do badge
   */
  badge?: React.ReactNode

  /**
   * Posição do badge
   */
  badgePosition?: Position
}

/**
 * Interface para componentes que podem ter um estado de rótulo
 */
export interface LabelProps {
  /**
   * Rótulo a ser exibido
   */
  label?: React.ReactNode

  /**
   * Posição do rótulo
   */
  labelPosition?: "top" | "right" | "bottom" | "left"
}

/**
 * Interface para componentes que podem ter um estado de descrição
 */
export interface DescriptionProps {
  /**
   * Descrição a ser exibida
   */
  description?: React.ReactNode
}

/**
 * Interface para componentes que podem ter um estado de placeholder
 */
export interface PlaceholderProps {
  /**
   * Placeholder a ser exibido
   */
  placeholder?: string
}

/**
 * Interface para componentes que podem ter um estado de requerido
 */
export interface RequiredProps {
  /**
   * Se verdadeiro, o componente é requerido
   */
  required?: boolean
}

/**
 * Interface para componentes que podem ter um estado de leitura
 */
export interface ReadOnlyProps {
  /**
   * Se verdadeiro, o componente está em modo somente leitura
   */
  readOnly?: boolean
}

/**
 * Interface para componentes que podem ter um estado de largura máxima
 */
export interface MaxWidthProps {
  /**
   * Largura máxima do componente
   */
  maxWidth?: string | number
}

/**
 * Interface para componentes que podem ter um estado de altura máxima
 */
export interface MaxHeightProps {
  /**
   * Altura máxima do componente
   */
  maxHeight?: string | number
}

/**
 * Interface para componentes que podem ter um estado de largura mínima
 */
export interface MinWidthProps {
  /**
   * Largura mínima do componente
   */
  minWidth?: string | number
}

/**
 * Interface para componentes que podem ter um estado de altura mínima
 */
export interface MinHeightProps {
  /**
   * Altura mínima do componente
   */
  minHeight?: string | number
}

/**
 * Interface para componentes que podem ter um estado de largura
 */
export interface WidthProps {
  /**
   * Largura do componente
   */
  width?: string | number
}

/**
 * Interface para componentes que podem ter um estado de altura
 */
export interface HeightProps {
  /**
   * Altura do componente
   */
  height?: string | number
}

/**
 * Interface para componentes que podem ter um estado de padding
 */
export interface PaddingProps {
  /**
   * Padding do componente
   */
  padding?: string | number

  /**
   * Padding horizontal do componente
   */
  paddingX?: string | number

  /**
   * Padding vertical do componente
   */
  paddingY?: string | number

  /**
   * Padding superior do componente
   */
  paddingTop?: string | number

  /**
   * Padding direito do componente
   */
  paddingRight?: string | number

  /**
   * Padding inferior do componente
   */
  paddingBottom?: string | number

  /**
   * Padding esquerdo do componente
   */
  paddingLeft?: string | number
}

/**
 * Interface para componentes que podem ter um estado de margem
 */
export interface MarginProps {
  /**
   * Margem do componente
   */
  margin?: string | number

  /**
   * Margem horizontal do componente
   */
  marginX?: string | number

  /**
   * Margem vertical do componente
   */
  marginY?: string | number

  /**
   * Margem superior do componente
   */
  marginTop?: string | number

  /**
   * Margem direita do componente
   */
  marginRight?: string | number

  /**
   * Margem inferior do componente
   */
  marginBottom?: string | number

  /**
   * Margem esquerda do componente
   */
  marginLeft?: string | number
}

/**
 * Interface para componentes que podem ter um estado de borda
 */
export interface BorderProps {
  /**
   * Se verdadeiro, o componente terá uma borda
   */
  bordered?: boolean

  /**
   * Cor da borda
   */
  borderColor?: string

  /**
   * Largura da borda
   */
  borderWidth?: string | number

  /**
   * Estilo da borda
   */
  borderStyle?: "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "inset" | "outset"

  /**
   * Raio da borda
   */
  borderRadius?: string | number
}

/**
 * Interface para componentes que podem ter um estado de sombra
 */
export interface ShadowProps {
  /**
   * Se verdadeiro, o componente terá uma sombra
   */
  shadowed?: boolean

  /**
   * Tamanho da sombra
   */
  shadowSize?: "sm" | "md" | "lg" | "xl"
}

/**
 * Interface para componentes que podem ter um estado de cor de fundo
 */
export interface BackgroundProps {
  /**
   * Cor de fundo do componente
   */
  backgroundColor?: string

  /**
   * Se verdadeiro, o componente terá um fundo transparente
   */
  transparent?: boolean
}

/**
 * Interface para componentes que podem ter um estado de cor de texto
 */
export interface TextColorProps {
  /**
   * Cor do texto do componente
   */
  textColor?: string
}

/**
 * Interface para componentes que podem ter um estado de alinhamento de texto
 */
export interface TextAlignProps {
  /**
   * Alinhamento do texto do componente
   */
  textAlign?: Alignment
}

/**
 * Interface para componentes que podem ter um estado de peso de fonte
 */
export interface FontWeightProps {
  /**
   * Peso da fonte do componente
   */
  fontWeight?: "normal" | "bold" | "light" | "medium" | "semibold" | "extrabold"
}

/**
 * Interface para componentes que podem ter um estado de tamanho de fonte
 */
export interface FontSizeProps {
  /**
   * Tamanho da fonte do componente
   */
  fontSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
}

/**
 * Interface para componentes que podem ter um estado de estilo de fonte
 */
export interface FontStyleProps {
  /**
   * Estilo da fonte do componente
   */
  fontStyle?: "normal" | "italic" | "oblique"
}

/**
 * Interface para componentes que podem ter um estado de decoração de texto
 */
export interface TextDecorationProps {
  /**
   * Decoração do texto do componente
   */
  textDecoration?: "none" | "underline" | "line-through" | "overline"
}

/**
 * Interface para componentes que podem ter um estado de transformação de texto
 */
export interface TextTransformProps {
  /**
   * Transformação do texto do componente
   */
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
}

/**
 * Interface para componentes que podem ter um estado de espaçamento de letras
 */
export interface LetterSpacingProps {
  /**
   * Espaçamento de letras do componente
   */
  letterSpacing?: "tighter" | "tight" | "normal" | "wide" | "wider" | "widest"
}

/**
 * Interface para componentes que podem ter um estado de altura de linha
 */
export interface LineHeightProps {
  /**
   * Altura de linha do componente
   */
  lineHeight?: "none" | "tight" | "snug" | "normal" | "relaxed" | "loose"
}

/**
 * Interface para componentes que podem ter um estado de truncamento de texto
 */
export interface TextTruncateProps {
  /**
   * Se verdadeiro, o texto será truncado com reticências
   */
  truncate?: boolean

  /**
   * Número de linhas após o qual o texto será truncado
   */
  lineClamp?: number
}

/**
 * Interface para componentes que podem ter um estado de quebra de palavra
 */
export interface WordBreakProps {
  /**
   * Comportamento de quebra de palavra do componente
   */
  wordBreak?: "normal" | "break-all" | "keep-all" | "break-word"
}

/**
 * Interface para componentes que podem ter um estado de quebra de linha
 */
export interface WhiteSpaceProps {
  /**
   * Comportamento de espaço em branco do componente
   */
  whiteSpace?: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap"
}

/**
 * Interface para componentes que podem ter um estado de overflow
 */
export interface OverflowProps {
  /**
   * Comportamento de overflow do componente
   */
  overflow?: "visible" | "hidden" | "scroll" | "auto"

  /**
   * Comportamento de overflow horizontal do componente
   */
  overflowX?: "visible" | "hidden" | "scroll" | "auto"

  /**
   * Comportamento de overflow vertical do componente
   */
  overflowY?: "visible" | "hidden" | "scroll" | "auto"
}

/**
 * Interface para componentes que podem ter um estado de posição
 */
export interface PositionProps {
  /**
   * Posição do componente
   */
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky"

  /**
   * Posição superior do componente
   */
  top?: string | number

  /**
   * Posição direita do componente
   */
  right?: string | number

  /**
   * Posição inferior do componente
   */
  bottom?: string | number

  /**
   * Posição esquerda do componente
   */
  left?: string | number

  /**
   * Índice z do componente
   */
  zIndex?: number
}

/**
 * Interface para componentes que podem ter um estado de display
 */
export interface DisplayProps {
  /**
   * Propriedade display do componente
   */
  display?: "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid" | "inline-grid" | "none"
}

/**
 * Interface para componentes que podem ter um estado de visibilidade
 */
export interface VisibilityProps {
  /**
   * Propriedade visibility do componente
   */
  visibility?: "visible" | "hidden" | "collapse"
}

/**
 * Interface para componentes que podem ter um estado de opacidade
 */
export interface OpacityProps {
  /**
   * Opacidade do componente
   */
  opacity?: number
}

/**
 * Interface para componentes que podem ter um estado de cursor
 */
export interface CursorProps {
  /**
   * Cursor do componente
   */
  cursor?: "auto" | "default" | "pointer" | "wait" | "text" | "move" | "not-allowed" | "help" | "grab" | "grabbing"
}

/**
 * Interface para componentes que podem ter um estado de pointer-events
 */
export interface PointerEventsProps {
  /**
   * Propriedade pointer-events do componente
   */
  pointerEvents?: "auto" | "none"
}

/**
 * Interface para componentes que podem ter um estado de user-select
 */
export interface UserSelectProps {
  /**
   * Propriedade user-select do componente
   */
  userSelect?: "auto" | "none" | "text" | "all"
}

/**
 * Interface para componentes que podem ter um estado de resize
 */
export interface ResizeProps {
  /**
   * Propriedade resize do componente
   */
  resize?: "none" | "both" | "horizontal" | "vertical"
}

/**
 * Interface para componentes que podem ter um estado de outline
 */
export interface OutlineProps {
  /**
   * Propriedade outline do componente
   */
  outline?: "none" | "auto"
}

/**
 * Interface para componentes que podem ter um estado de appearance
 */
export interface AppearanceProps {
  /**
   * Propriedade appearance do componente
   */
  appearance?: "none" | "auto"
}

/**
 * Interface para componentes que podem ter um estado de box-sizing
 */
export interface BoxSizingProps {
  /**
   * Propriedade box-sizing do componente
   */
  boxSizing?: "content-box" | "border-box"
}

/**
 * Interface para componentes que podem ter um estado de transform
 */
export interface TransformProps {
  /**
   * Propriedade transform do componente
   */
  transform?: string
}

/**
 * Interface para componentes que podem ter um estado de transition
 */
export interface TransitionProps {
  /**
   * Propriedade transition do componente
   */
  transition?: string
}

/**
 * Interface para componentes que podem ter um estado de animation
 */
export interface AnimationProps {
  /**
   * Propriedade animation do componente
   */
  animation?: string
}

/**
 * Interface para componentes que podem ter um estado de filter
 */
export interface FilterProps {
  /**
   * Propriedade filter do componente
   */
  filter?: string
}

/**
 * Interface para componentes que podem ter um estado de backdrop-filter
 */
export interface BackdropFilterProps {
  /**
   * Propriedade backdrop-filter do componente
   */
  backdropFilter?: string
}

/**
 * Interface para componentes que podem ter um estado de mix-blend-mode
 */
export interface MixBlendModeProps {
  /**
   * Propriedade mix-blend-mode do componente
   */
  mixBlendMode?: string
}

/**
 * Interface para componentes que podem ter um estado de isolation
 */
export interface IsolationProps {
  /**
   * Propriedade isolation do componente
   */
  isolation?: "auto" | "isolate"
}

/**
 * Interface para componentes que podem ter um estado de object-fit
 */
export interface ObjectFitProps {
  /**
   * Propriedade object-fit do componente
   */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
}

/**
 * Interface para componentes que podem ter um estado de object-position
 */
export interface ObjectPositionProps {
  /**
   * Propriedade object-position do componente
   */
  objectPosition?: string
}

/**
 * Interface para componentes que podem ter um estado de aspect-ratio
 */
export interface AspectRatioProps {
  /**
   * Propriedade aspect-ratio do componente
   */
  aspectRatio?: string
}

/**
 * Interface para componentes que podem ter um estado de flex
 */
export interface FlexProps {
  /**
   * Propriedade flex do componente
   */
  flex?: string

  /**
   * Propriedade flex-direction do componente
   */
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse"

  /**
   * Propriedade flex-wrap do componente
   */
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"

  /**
   * Propriedade flex-grow do componente
   */
  flexGrow?: number

  /**
   * Propriedade flex-shrink do componente
   */
  flexShrink?: number

  /**
   * Propriedade flex-basis do componente
   */
  flexBasis?: string

  /**
   * Propriedade justify-content do componente
   */
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly"

  /**
   * Propriedade align-items do componente
   */
  alignItems?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch"

  /**
   * Propriedade align-content do componente
   */
  alignContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "stretch"

  /**
   * Propriedade align-self do componente
   */
  alignSelf?: "auto" | "flex-start" | "flex-end" | "center" | "baseline" | "stretch"

  /**
   * Propriedade order do componente
   */
  order?: number
}

/**
 * Interface para componentes que podem ter um estado de grid
 */
export interface GridProps {
  /**
   * Propriedade grid-template-columns do componente
   */
  gridTemplateColumns?: string

  /**
   * Propriedade grid-template-rows do componente
   */
  gridTemplateRows?: string

  /**
   * Propriedade grid-template-areas do componente
   */
  gridTemplateAreas?: string

  /**
   * Propriedade grid-column-gap do componente
   */
  gridColumnGap?: string | number

  /**
   * Propriedade grid-row-gap do componente
   */
  gridRowGap?: string | number

  /**
   * Propriedade grid-gap do componente
   */
  gridGap?: string | number

  /**
   * Propriedade grid-auto-columns do componente
   */
  gridAutoColumns?: string

  /**
   * Propriedade grid-auto-rows do componente
   */
  gridAutoRows?: string

  /**
   * Propriedade grid-auto-flow do componente
   */
  gridAutoFlow?: "row" | "column" | "row dense" | "column dense"

  /**
   * Propriedade grid-column do componente
   */
  gridColumn?: string

  /**
   * Propriedade grid-row do componente
   */
  gridRow?: string

  /**
   * Propriedade grid-area do componente
   */
  gridArea?: string
}

/**
 * Interface para componentes que podem ter um estado de gap
 */
export interface GapProps {
  /**
   * Propriedade gap do componente
   */
  gap?: string | number

  /**
   * Propriedade column-gap do componente
   */
  columnGap?: string | number

  /**
   * Propriedade row-gap do componente
   */
  rowGap?: string | number
}

/**
 * Interface para componentes que podem ter um estado de list
 */
export interface ListProps {
  /**
   * Propriedade list-style-type do componente
   */
  listStyleType?: string

  /**
   * Propriedade list-style-position do componente
   */
  listStylePosition?: "inside" | "outside"

  /**
   * Propriedade list-style-image do componente
   */
  listStyleImage?: string
}

/**
 * Interface para componentes que podem ter um estado de table
 */
export interface TableProps {
  /**
   * Propriedade border-collapse do componente
   */
  borderCollapse?: "collapse" | "separate"

  /**
   * Propriedade border-spacing do componente
   */
  borderSpacing?: string

  /**
   * Propriedade table-layout do componente
   */
  tableLayout?: "auto" | "fixed"

  /**
   * Propriedade caption-side do componente
   */
  captionSide?: "top" | "bottom"

  /**
   * Propriedade empty-cells do componente
   */
  emptyCells?: "show" | "hide"
}

/**
 * Interface para componentes que podem ter um estado de column
 */
export interface ColumnProps {
  /**
   * Propriedade column-count do componente
   */
  columnCount?: number

  /**
   * Propriedade column-gap do componente
   */
  columnGap?: string | number

  /**
   * Propriedade column-rule do componente
   */
  columnRule?: string

  /**
   * Propriedade column-width do componente
   */
  columnWidth?: string | number
}

/**
 * Interface para componentes que podem ter um estado de break
 */
export interface BreakProps {
  /**
   * Propriedade break-before do componente
   */
  breakBefore?: "auto" | "avoid" | "always" | "all" | "avoid-page" | "page" | "left" | "right" | "recto" | "verso"

  /**
   * Propriedade break-after do componente
   */
  breakAfter?: "auto" | "avoid" | "always" | "all" | "avoid-page" | "page" | "left" | "right" | "recto" | "verso"

  /**
   * Propriedade break-inside do componente
   */
  breakInside?: "auto" | "avoid" | "avoid-page" | "avoid-column" | "avoid-region"
}

/**
 * Interface para componentes que podem ter um estado de page
 */
export interface PageProps {
  /**
   * Propriedade page-break-before do componente
   */
  pageBreakBefore?: "auto" | "always" | "avoid" | "left" | "right"

  /**
   * Propriedade page-break-after do componente
   */
  pageBreakAfter?: "auto" | "always" | "avoid" | "left" | "right"

  /**
   * Propriedade page-break-inside do componente
   */
  pageBreakInside?: "auto" | "avoid"
}

/**
 * Interface para componentes que podem ter um estado de orphans
 */
export interface OrphansProps {
  /**
   * Propriedade orphans do componente
   */
  orphans?: number
}

/**
 * Interface para componentes que podem ter um estado de widows
 */
export interface WidowsProps {
  /**
   * Propriedade widows do componente
   */
  widows?: number
}

/**
 * Interface para componentes que podem ter um estado de quotes
 */
export interface QuotesProps {
  /**
   * Propriedade quotes do componente
   */
  quotes?: string
}

/**
 * Interface para componentes que podem ter um estado de counter
 */
export interface CounterProps {
  /**
   * Propriedade counter-reset do componente
   */
  counterReset?: string

  /**
   * Propriedade counter-increment do componente
   */
  counterIncrement?: string
}

/**
 * Interface para componentes que podem ter um estado de content
 */
export interface ContentProps {
  /**
   * Propriedade content do componente
   */
  content?: string
}

/**
 * Interface para componentes que podem ter um estado de will-change
 */
export interface WillChangeProps {
  /**
   * Propriedade will-change do componente
   */
  willChange?: string
}

/**
 * Interface para componentes que podem ter um estado de scroll
 */
export interface ScrollProps {
  /**
   * Propriedade scroll-behavior do componente
   */
  scrollBehavior?: "auto" | "smooth"

  /**
   * Propriedade scroll-snap-type do componente
   */
  scrollSnapType?: string

  /**
   * Propriedade scroll-snap-align do componente
   */
  scrollSnapAlign?: "none" | "start" | "end" | "center"

  /**
   * Propriedade scroll-snap-stop do componente
   */
  scrollSnapStop?: "normal" | "always"

  /**
   * Propriedade scroll-margin do componente
   */
  scrollMargin?: string

  /**
   * Propriedade scroll-padding do componente
   */
  scrollPadding?: string
}

/**
 * Interface para componentes que podem ter um estado de touch
 */
export interface TouchProps {
  /**
   * Propriedade touch-action do componente
   */
  touchAction?: string
}

/**
 * Interface para componentes que podem ter um estado de contain
 */
export interface ContainProps {
  /**
   * Propriedade contain do componente
   */
  contain?: string
}

/**
 * Interface para componentes que podem ter um estado de container
 */
export interface ContainerProps {
  /**
   * Propriedade container-type do componente
   */
  containerType?: "normal" | "size" | "inline-size"

  /**
   * Propriedade container-name do componente
   */
  containerName?: string
}

/**
 * Interface para componentes que podem ter um estado de hyphens
 */
export interface HyphensProps {
  /**
   * Propriedade hyphens do componente
   */
  hyphens?: "none" | "manual" | "auto"
}

/**
 * Interface para componentes que podem ter um estado de writing-mode
 */
export interface WritingModeProps {
  /**
   * Propriedade writing-mode do componente
   */
  writingMode?: "horizontal-tb" | "vertical-rl" | "vertical-lr"
}

/**
 * Interface para componentes que podem ter um estado de text-orientation
 */
export interface TextOrientationProps {
  /**
   * Propriedade text-orientation do componente
   */
  textOrientation?: "mixed" | "upright" | "sideways"
}

/**
 * Interface para componentes que podem ter um estado de direction
 */
export interface DirectionProps {
  /**
   * Propriedade direction do componente
   */
  direction?: "ltr" | "rtl"
}

/**
 * Interface para componentes que podem ter um estado de unicode-bidi
 */
export interface UnicodeBidiProps {
  /**
   * Propriedade unicode-bidi do componente
   */
  unicodeBidi?: "normal" | "embed" | "isolate" | "bidi-override" | "isolate-override" | "plaintext"
}

/**
 * Interface para componentes que podem ter um estado de text-combine-upright
 */
export interface TextCombineUprightProps {
  /**
   * Propriedade text-combine-upright do componente
   */
  textCombineUpright?: "none" | "all" | "digits"
}

/**
 * Interface para componentes que podem ter um estado de text-indent
 */
export interface TextIndentProps {
  /**
   * Propriedade text-indent do componente
   */
  textIndent?: string
}

/**
 * Interface para componentes que podem ter um estado de text-justify
 */
export interface TextJustifyProps {
  /**
   * Propriedade text-justify do componente
   */
  textJustify?: "auto" | "inter-character" | "inter-word" | "none"
}

/**
 * Interface para componentes que podem ter um estado de text-overflow
 */
export interface TextOverflowProps {
  /**
   * Propriedade text-overflow do componente
   */
  textOverflow?: "clip" | "ellipsis"
}

/**
 * Interface para componentes que podem ter um estado de text-shadow
 */
export interface TextShadowProps {
  /**
   * Propriedade text-shadow do componente
   */
  textShadow?: string
}

/**
 * Interface para componentes que podem ter um estado de text-size-adjust
 */
export interface TextSizeAdjustProps {
  /**
   * Propriedade text-size-adjust do componente
   */
  textSizeAdjust?: "none" | "auto" | string
}

/**
 * Interface para componentes que podem ter um estado de text-underline-position
 */
export interface TextUnderlinePositionProps {
  /**
   * Propriedade text-underline-position do componente
   */
  textUnderlinePosition?: "auto" | "under" | "left" | "right"
}

/**
 * Interface para componentes que podem ter um estado de text-rendering
 */
export interface TextRenderingProps {
  /**
   * Propriedade text-rendering do componente
   */
  textRendering?: "auto" | "optimizeSpeed" | "optimizeLegibility" | "geometricPrecision"
}

/**
 * Interface para componentes que podem ter um estado de font-feature-settings
 */
export interface FontFeatureSettingsProps {
  /**
   * Propriedade font-feature-settings do componente
   */
  fontFeatureSettings?: string
}

/**
 * Interface para componentes que podem ter um estado de font-variant
 */
export interface FontVariantProps {
  /**
   * Propriedade font-variant do componente
   */
  fontVariant?: string
}

/**
 * Interface para componentes que podem ter um estado de font-variant-caps
 */
export interface FontVariantCapsProps {
  /**
   * Propriedade font-variant-caps do componente
   */
  fontVariantCaps?:
    | "normal"
    | "small-caps"
    | "all-small-caps"
    | "petite-caps"
    | "all-petite-caps"
    | "unicase"
    | "titling-caps"
}

/**
 * Interface para componentes que podem ter um estado de font-variant-numeric
 */
export interface FontVariantNumericProps {
  /**
   * Propriedade font-variant-numeric do componente
   */
  fontVariantNumeric?: string
}

/**
 * Interface para componentes que podem ter um estado de font-variant-ligatures
 */
export interface FontVariantLigaturesProps {
  /**
   * Propriedade font-variant-ligatures do componente
   */
  fontVariantLigatures?: string
}

/**
 * Interface para componentes que podem ter um estado de font-variant-east-asian
 */
export interface FontVariantEastAsianProps {
  /**
   * Propriedade font-variant-east-asian do componente
   */
  fontVariantEastAsian?: string
}

/**
 * Interface para componentes que podem ter um estado de font-variant-alternates
 */
export interface FontVariantAlternatesProps {
  /**
   * Propriedade font-variant-alternates do componente
   */
  fontVariantAlternates?: string
}

/**
 * Interface para componentes que podem ter um estado de font-variant-position
 */
export interface FontVariantPositionProps {
  /**
   * Propriedade font-variant-position do componente
   */
  fontVariantPosition?: "normal" | "sub" | "super"
}

/**
 * Interface para componentes que podem ter um estado de font-size-adjust
 */
export interface FontSizeAdjustProps {
  /**
   * Propriedade font-size-adjust do componente
   */
  fontSizeAdjust?: string
}

/**
 * Interface para componentes que podem ter um estado de font-stretch
 */
export interface FontStretchProps {
  /**
   * Propriedade font-stretch do componente
   */
  fontStretch?: string
}

/**
 * Interface para componentes que podem ter um estado de font-synthesis
 */
export interface FontSynthesisProps {
  /**
   * Propriedade font-synthesis do componente
   */
  fontSynthesis?: string
}

/**
 * Interface para componentes que podem ter um estado de font-kerning
 */
export interface FontKerningProps {
  /**
   * Propriedade font-kerning do componente
   */
  fontKerning?: "auto" | "normal" | "none"
}

/**
 * Interface para componentes que podem ter um estado de font-language-override
 */
export interface FontLanguageOverrideProps {
  /**
   * Propriedade font-language-override do componente
   */
  fontLanguageOverride?: string
}

/**
 * Interface para componentes que podem ter um estado de font-optical-sizing
 */
export interface FontOpticalSizingProps {
  /**
   * Propriedade font-optical-sizing do componente
   */
  fontOpticalSizing?: "auto" | "none"
}

/**
 * Interface para componentes que podem ter um estado de font-variation-settings
 */
export interface FontVariationSettingsProps {
  /**
   * Propriedade font-variation-settings do componente
   */
  fontVariationSettings?: string
}

/**
 * Interface para componentes que podem ter um estado de font-palette
 */
export interface FontPaletteProps {
  /**
   * Propriedade font-palette do componente
   */
  fontPalette?: string
}

/**
 * Interface para componentes que podem ter um estado de font-family
 */
export interface FontFamilyProps {
  /**
   * Propriedade font-family do componente
   */
  fontFamily?: string
}

/**
 * Interface para componentes que podem ter um estado de font
 */
export interface FontProps {
  /**
   * Propriedade font do componente
   */
  font?: string
}

/**
 * Interface para componentes que podem ter um estado de color-scheme
 */
export interface ColorSchemeProps {
  /**
   * Propriedade color-scheme do componente
   */
  colorScheme?: "normal" | "light" | "dark" | "light dark" | "dark light"
}

/**
 * Interface para componentes que podem ter um estado de forced-color-adjust
 */
export interface ForcedColorAdjustProps {
  /**
   * Propriedade forced-color-adjust do componente
   */
  forcedColorAdjust?: "auto" | "none"
}

/**
 * Interface para componentes que podem ter um estado de color-adjust
 */
export interface ColorAdjustProps {
  /**
   * Propriedade color-adjust do componente
   */
  colorAdjust?: "economy" | "exact"
}

/**
 * Interface para componentes que podem ter um estado de print-color-adjust
 */
export interface PrintColorAdjustProps {
  /**
   * Propriedade print-color-adjust do componente
   */
  printColorAdjust?: "economy" | "exact"
}

/**
 * Interface para componentes que podem ter um estado de accent-color
 */
export interface AccentColorProps {
  /**
   * Propriedade accent-color do componente
   */
  accentColor?: string
}

/**
 * Interface para componentes que podem ter um estado de caret-color
 */
export interface CaretColorProps {
  /**
   * Propriedade caret-color do componente
   */
  caretColor?: string
}

/**
 * Interface para componentes que podem ter um estado de scrollbar-color
 */
export interface ScrollbarColorProps {
  /**
   * Propriedade scrollbar-color do componente
   */
  scrollbarColor?: string
}

/**
 * Interface para componentes que podem ter um estado de scrollbar-width
 */
export interface ScrollbarWidthProps {
  /**
   * Propriedade scrollbar-width do componente
   */
  scrollbarWidth?: "auto" | "thin" | "none"
}

/**
 * Interface for components that can have an ime-mode
 */
export interface ImeModeProps {
  /**
   * Propriedade ime-mode do componente
   */
  imeMode?: "auto" | "normal" | "active" | "inactive" | "disabled"
}

/**
 * Interface for components that can have a ruby-align
 */
export interface RubyAlignProps {
  /**
   * Propriedade ruby-align do componente
   */
  rubyAlign?: "start" | "center" | "space-between" | "space-around"
}

/**
 * Interface for components that can have a ruby-position
 */
export interface RubyPositionProps {
  /**
   * Propriedade ruby-position do componente
   */
  rubyPosition?: "over" | "under"
}

/**
 * Interface for components that can have an image-rendering
 */
export interface ImageRenderingProps {
  /**
   * Propriedade image-rendering do componente
   */
  imageRendering?: "auto" | "crisp-edges" | "pixelated"
}

/**
 * Interface for components that can have an image-orientation
 */
export interface ImageOrientationProps {
  /**
   * Propriedade image-orientation do componente
   */
  imageOrientation?: "from-image" | "none" | string
}

/**
 * Interface for components that can have an image-resolution
 */
export interface ImageResolutionProps {
  /**
   * Propriedade image-resolution do componente
   */
  imageResolution?: string
}

/**
 * Interface for components that can have a mask
 */
export interface MaskProps {
  /**
   * Propriedade mask do componente
   */
  mask?: string
}

/**
 * Interface for components that can have a mask-image
 */
export interface MaskImageProps {
  /**
   * Propriedade mask-image do componente
   */
  maskImage?: string
}

/**
 * Interface for components that can have a mask-size
 */
export interface MaskSizeProps {
  /**
   * Propriedade mask-size do componente
   */
  maskSize?: string
}

/**
 * Interface for components that can have a mask-position
 */
export interface MaskPositionProps {
  /**
   * Propriedade mask-position do componente
   */
  maskPosition?: string
}

/**
 * Interface for components that can have a mask-repeat
 */
export interface MaskRepeatProps {
  /**
   * Propriedade mask-repeat do componente
   */
  maskRepeat?: string
}

/**
 * Interface for components that can have a mask-origin
 */
export interface MaskOriginProps {
  /**
   * Propriedade mask-origin do componente
   */
  maskOrigin?: string
}

/**
 * Interface for components that can have a mask-clip
 */
export interface MaskClipProps {
  /**
   * Propriedade mask-clip do componente
   */
  maskClip?: string
}

/**
 * Interface for components that can have a mask-composite
 */
export interface MaskCompositeProps {
  /**
   * Propriedade mask-composite do componente
   */
  maskComposite?: string
}

/**
 * Interface for components that can have a mask-mode
 */
export interface MaskModeProps {
  /**
   * Propriedade mask-mode do componente
   */
  maskMode?: string
}

/**
 * Interface for components that can have a mask-border
 */
export interface MaskBorderProps {
  /**
   * Propriedade mask-border do componente
   */
  maskBorder?: string
}

/**
 * Interface for components that can have a clip-path
 */
export interface ClipPathProps {
  /**
   * Propriedade clip-path do componente
   */
  clipPath?: string
}

/**
 * Interface for components that can have a clip-rule
 */
export interface ClipRuleProps {
  /**
   * Propriedade clip-rule do componente
   */
  clipRule?: "nonzero" | "evenodd"
}

/**
 * Interface for components that can have a shape-image-threshold
 */
export interface ShapeImageThresholdProps {
  /**
   * Propriedade shape-image-threshold do componente
   */
  shapeImageThreshold?: number
}

/**
 * Interface for components that can have a shape-margin
 */
export interface ShapeMarginProps {
  /**
   * Propriedade shape-margin do componente
   */
  shapeMargin?: string
}

/**
 * Interface for components that can have a shape-outside
 */
export interface ShapeOutsideProps {
  /**
   * Propriedade shape-outside do componente
   */
  shapeOutside?: string
}

/**
 * Interface for components that can have a shape-rendering
 */
export interface ShapeRenderingProps {
  /**
   * Propriedade shape-rendering do componente
   */
  shapeRendering?: "auto" | "optimizeSpeed" | "crispEdges" | "geometricPrecision"
}

/**
 * Interface for components that can have a color-interpolation
 */
export interface ColorInterpolationProps {
  /**
   * Propriedade color-interpolation do componente
   */
  colorInterpolation?: "auto" | "sRGB" | "linearRGB"
}

/**
 * Interface for components that can have a color-interpolation-filters
 */
export interface ColorInterpolationFiltersProps {
  /**
   * Propriedade color-interpolation-filters do componente
   */
  colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB"
}

/**
 * Interface for components that can have a color-profile
 */
export interface ColorProfileProps {
  /**
   * Propriedade color-profile do componente
   */
  colorProfile?: string
}

/**
 * Interface for components that can have a color-rendering
 */
export interface ColorRenderingProps {
  /**
   * Propriedade color-rendering do componente
   */
  colorRendering?: "auto" | "optimizeSpeed" | "optimizeQuality"
}

/**
 * Interface for components that can have a fill
 */
export interface FillProps {
  /**
   * Propriedade fill do componente
   */
  fill?: string
}

/**
 * Interface for components that can have a fill-opacity
 */
export interface FillOpacityProps {
  /**
   * Propriedade fill-opacity do componente
   */
  fillOpacity?: number
}

/**
 * Interface for components that can have a fill-rule
 */
export interface FillRuleProps {
  /**
   * Propriedade fill-rule do componente
   */
  fillRule?: "nonzero" | "evenodd"
}

/**
 * Interface for components that can have a stroke
 */
export interface StrokeProps {
  /**
   * Propriedade stroke do componente
   */
  stroke?: string
}

/**
 * Interface for components that can have a stroke-dasharray
 */
export interface StrokeDasharrayProps {
  /**
   * Propriedade stroke-dasharray do componente
   */
  strokeDasharray?: string
}

/**
 * Interface for components that can have a stroke-dashoffset
 */
export interface StrokeDashoffsetProps {
  /**
   * Propriedade stroke-dashoffset do componente
   */
  strokeDashoffset?: string
}

/**
 * Interface for components that can have a stroke-linecap
 */
export interface StrokeLinecapProps {
  /**
   * Propriedade stroke-linecap do componente
   */
  strokeLinecap?: "butt" | "round" | "square"
}

/**
 * Interface for components that can have a stroke-linejoin
 */
export interface StrokeLinejoinProps {
  /**
   * Propriedade stroke-linejoin do componente
   */
  strokeLinejoin?: "miter" | "round" | "bevel"
}

/**
 * Interface for components that can have a stroke-miterlimit
 */
export interface StrokeMiterlimitProps {
  /**
   * Propriedade stroke-miterlimit do componente
   */
  strokeMiterlimit?: number
}

/**
 * Interface for components that can have a stroke-opacity
 */
export interface StrokeOpacityProps {
  /**
   * Propriedade stroke-opacity do componente
   */
  strokeOpacity?: number
}

/**
 * Interface for components that can have a stroke-width
 */
export interface StrokeWidthProps {
  /**
   * Propriedade stroke-width do componente
   */
  strokeWidth?: string
}

/**
 * Interface for components that can have a vector-effect
 */
export interface VectorEffectProps {
  /**
   * Propriedade vector-effect do componente
   */
  vectorEffect?: "none" | "non-scaling-stroke" | "non-scaling-size" | "non-rotation" | "fixed-position"
}

/**
 * Interface for components that can have a paint-order
 */
export interface PaintOrderProps {
  /**
   * Propriedade paint-order do componente
   */
  paintOrder?: string
}

/**
 * Interface for components that can have a marker
 */
export interface MarkerProps {
  /**
   * Propriedade marker do componente
   */
  marker?: string
}

/**
 * Interface for components that can have a marker-start
 */
export interface MarkerStartProps {
  /**
   * Propriedade marker-start do componente
   */
  markerStart?: string
}

/**
 * Interface for components that can have a marker-mid
 */
export interface MarkerMidProps {
  /**
   * Propriedade marker-mid do componente
   */
  markerMid?: string
}

/**
 * Interface for components that can have a marker-end
 */
export interface MarkerEndProps {
  /**
   * Propriedade marker-end do componente
   */
  markerEnd?: string
}

/**
 * Interface for components that can have a lighting-color
 */
export interface LightingColorProps {
  /**
   * Propriedade lighting-color do componente
   */
  lightingColor?: string
}

/**
 * Interface for components that can have a flood-color
 */
export interface FloodColorProps {
  /**
   * Propriedade flood-color do componente
   */
  floodColor?: string
}

/**
 * Interface for components that can have a flood-opacity
 */
export interface FloodOpacityProps {
  /**
   * Propriedade flood-opacity do componente
   */
  floodOpacity?: number
}

/**
 * Interface for components that can have a stop-color
 */
export interface StopColorProps {
  /**
   * Propriedade stop-color do componente
   */
  stopColor?: string
}

/**
 * Interface for components that can have a stop-opacity
 */
export interface StopOpacityProps {
  /**
   * Propriedade stop-opacity do componente
   */
  stopOpacity?: number
}

/**
 * Interface for components that can have a dominant-baseline
 */
export interface DominantBaselineProps {
  /**
   * Propriedade dominant-baseline do componente
   */
  dominantBaseline?: string
}

/**
 * Interface for components that can have an alignment-baseline
 */
export interface AlignmentBaselineProps {
  /**
   * Propriedade alignment-baseline do componente
   */
  alignmentBaseline?: string
}

/**
 * Interface for components that can have a baseline-shift
 */
export interface BaselineShiftProps {
  /**
   * Propriedade baseline-shift do componente
   */
  baselineShift?: string
}

/**
 * Interface for components that can have a text-anchor
 */
export interface TextAnchorProps {
  /**
   * Propriedade text-anchor do componente
   */
  textAnchor?: "start" | "middle" | "end"
}

/**
 * Interface for components that can have a writing-mode
 */
export interface WritingModeProps {
  /**
   * Propriedade writing-mode do componente
   */
  writingMode?: "horizontal-tb" | "vertical-rl" | "vertical-lr"
}

/**
 * Interface for components that can have a glyph-orientation-horizontal
 */
export interface GlyphOrientationHorizontalProps {
  /**
   * Propriedade glyph-orientation-horizontal do componente
   */
  glyphOrientationHorizontal?: string
}

/**
 * Interface for components that can have a glyph-orientation-vertical
 */
export interface GlyphOrientationVerticalProps {
  /**
   * Propriedade glyph-orientation-vertical do componente
   */
  glyphOrientationVertical?: string
}

/**
 * Interface for components that can have a kerning
 */
export interface KerningProps {
  /**
   * Propriedade kerning do componente
   */
  kerning?: "auto" | string
}

/**
 * Interface for components that can have a font-variant-position
 */
export interface FontVariantPositionProps {
  /**
   * Propriedade font-variant-position do componente
   */
  fontVariantPosition?: "normal" | "sub" | "super"
}

/**
 * Interface for components that can have a font-variant-caps
 */
export interface FontVariantCapsProps {
  /**
   * Propriedade font-variant-caps do componente
   */
  fontVariantCaps?:
    | "normal"
    | "small-caps"
    | "all-small-caps"
    | "petite-caps"
    | "all-petite-caps"
    | "unicase"
    | "titling-caps"
}

/**
 * Interface for components that can have a font-variant-numeric
 */
export interface FontVariantNumericProps {
  /**
   * Propriedade font-variant-numeric do componente
   */
  fontVariantNumeric?: string
}

/**
 * Interface for components that can have a font-variant-alternates
 */
export interface FontVariantAlternatesProps {
  /**
   * Propriedade font-variant-alternates do componente
   */
  fontVariantAlternates?: string
}

/**
 * Interface for components that can have a font-variant-ligatures
 */
export interface FontVariantLigaturesProps {
  /**
   * Propriedade font-variant-ligatures do componente
   */
  fontVariantLigatures?: string
}

/**
 * Interface for components that can have a font-variant-east-asian
 */
export interface FontVariantEastAsianProps {
  /**
   * Propriedade font-variant-east-asian  do componente
   */
  fontVariantEastAsian?: string
}

/**
 * Interface for components that can have a font-feature-settings
 */
export interface FontFeatureSettingsProps {
  /**
   * Propriedade font-feature-settings do componente
   */
  fontFeatureSettings?: string
}

/**
 * Interface for components that can have a font-variation-settings
 */
export interface FontVariationSettingsProps {
  /**
   * Propriedade font-variation-settings do componente
   */
  fontVariationSettings?: string
}

/**
 * Interface for components that can have a font-palette
 */
export interface FontPaletteProps {
  /**
   * Propriedade font-palette do componente
   */
  fontPalette?: string
}

/**
 * Interface for components that can have a font-synthesis
 */
export interface FontSynthesisProps {
  /**
   * Propriedade font-synthesis do componente
   */
  fontSynthesis?: string
}

/**
 * Interface for components that can have a font-synthesis-weight
 */
export interface FontSynthesisWeightProps {
  /**
   * Propriedade font-synthesis-weight do componente
   */
  fontSynthesisWeight?: "auto" | "none"
}

/**
 * Interface for components that can have a font-synthesis-style
 */
export interface FontSynthesisStyleProps {
  /**
   * Propriedade font-synthesis-style do componente
   */
  fontSynthesisStyle?: "auto" | "none"
}

/**
 * Interface for components that can have a font-synthesis-small-caps
 */
export interface FontSynthesisSmallCapsProps {
  /**
   * Propriedade font-synthesis-small-caps do componente
   */
  fontSynthesisSmallCaps?: "auto" | "none"
}

/**
 * Interface for components that can have a font-optical-sizing
 */
export interface FontOpticalSizingProps {
  /**
   * Propriedade font-optical-sizing do componente
   */
  fontOpticalSizing?: "auto" | "none"
}

/**
 * Interface for components that can have a font-kerning
 */
export interface FontKerningProps {
  /**
   * Propriedade font-kerning do componente
   */
  fontKerning?: "auto" | "normal" | "none"
}

/**
 * Interface for components that can have a font-language-override
 */
export interface FontLanguageOverrideProps {
  /**
   * Propriedade font-language-override do componente
   */
  fontLanguageOverride?: string
}

/**
 * Interface for components that can have a font-size-adjust
 */
export interface FontSizeAdjustProps {
  /**
   * Propriedade font-size-adjust do componente
   */
  fontSizeAdjust?: string
}

/**
 * Interface for components that can have a font-stretch
 */
export interface FontStretchProps {
  /**
   * Propriedade font-stretch do componente
   */
  fontStretch?: string
}

/**
 * Interface for components that can have a font-family
 */
export interface FontFamilyProps {
  /**
   * Propriedade font-family do componente
   */
  fontFamily?: string
}

/**
 * Interface for components that can have a font
 */
export interface FontProps {
  /**
   * Propriedade font do componente
   */
  font?: string
}

/**
 * Interface for components that can have a color-scheme
 */
export interface ColorSchemeProps {
  /**
   * Propriedade color-scheme do componente
   */
  colorScheme?: "normal" | "light" | "dark" | "light dark" | "dark light"
}

/**
 * Interface for components that can have a forced-color-adjust
 */
export interface ForcedColorAdjustProps {
  /**
   * Propriedade forced-color-adjust do componente
   */
  forcedColorAdjust?: "auto" | "none"
}

/**
 * Interface for components that can have a color-adjust
 */
export interface ColorAdjustProps {
  /**
   * Propriedade color-adjust do componente
   */
  colorAdjust?: "economy" | "exact"
}

/**
 * Interface for components that can have a print-color-adjust
 */
export interface PrintColorAdjustProps {
  /**
   * Propriedade print-color-adjust do componente
   */
  printColorAdjust?: "economy" | "exact"
}

/**
 * Interface for components that can have an accent-color
 */
export interface AccentColorProps {
  /**
   * Propriedade accent-color do componente
   */
  accentColor?: string
}

/**
 * Interface for components that can have a caret-color
 */
export interface CaretColorProps {
  /**
   * Propriedade caret-color do componente
   */
  caretColor?: string
}

/**
 * Interface for components that can have a scrollbar-color
 */
export interface ScrollbarColorProps {
  /**
   * Propriedade scrollbar-color do componente
   */
  scrollbarColor?: string
}

/**
 * Interface for components that can have a scrollbar-width
 */
export interface ScrollbarWidthProps {
  /**
   * Propriedade scrollbar-width do componente
   */
  scrollbarWidth?: "auto" | "thin" | "none"
}
