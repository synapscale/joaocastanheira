"use client"

import type React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StatusType } from "@/types/component-types"

/**
 * Configuração para cada tipo de status
 * @internal
 */
const STATUS_CONFIG: Record<
  StatusType,
  {
    variant: BadgeProps["variant"]
    icon: React.ElementType
    defaultLabel: string
    className?: string
    animationClass?: string
  }
> = {
  success: {
    variant: "success",
    icon: CheckCircle,
    defaultLabel: "Sucesso",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  },
  pending: {
    variant: "outline",
    icon: Clock,
    defaultLabel: "Pendente",
    className: "border-yellow-300 text-yellow-800 dark:border-yellow-600 dark:text-yellow-100",
    animationClass: "animate-pulse",
  },
  loading: {
    variant: "outline",
    icon: Loader2,
    defaultLabel: "Carregando",
    className: "border-blue-300 text-blue-800 dark:border-blue-600 dark:text-blue-100",
    animationClass: "animate-spin",
  },
  error: {
    variant: "destructive",
    icon: XCircle,
    defaultLabel: "Erro",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  },
  warning: {
    variant: "outline",
    icon: AlertTriangle,
    defaultLabel: "Aviso",
    className: "border-orange-300 text-orange-800 dark:border-orange-600 dark:text-orange-100",
  },
  info: {
    variant: "outline",
    icon: Info,
    defaultLabel: "Informação",
    className: "border-blue-300 text-blue-800 dark:border-blue-600 dark:text-blue-100",
  },
  draft: {
    variant: "secondary",
    icon: Clock,
    defaultLabel: "Rascunho",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  },
  published: {
    variant: "success",
    icon: CheckCircle,
    defaultLabel: "Publicado",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  },
  rejected: {
    variant: "destructive",
    icon: XCircle,
    defaultLabel: "Rejeitado",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  },
  failed: {
    variant: "destructive",
    icon: XCircle,
    defaultLabel: "Falha",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  },
}

/**
 * Props para o componente StatusBadge
 */
export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  // ===== PROPS OBRIGATÓRIAS =====
  /**
   * Tipo de status a ser exibido
   * @required
   */
  status: StatusType

  // ===== CONTEÚDO =====
  /**
   * Rótulo personalizado a ser exibido. Se não for fornecido, o rótulo padrão para o status será usado.
   * @example "Processado com sucesso"
   */
  label?: string

  /**
   * Texto para o atributo title do badge (tooltip nativo do navegador)
   */
  title?: string

  /**
   * Texto adicional exibido após o label principal
   */
  subtitle?: string

  // ===== VISUAIS =====
  /**
   * Se verdadeiro, exibe o ícone correspondente ao status
   * @default true
   */
  showIcon?: boolean

  /**
   * Tamanho do ícone em pixels
   * @default 14
   */
  iconSize?: number

  /**
   * Posição do ícone em relação ao texto
   * @default "left"
   */
  iconPosition?: "left" | "right"

  /**
   * Espaçamento entre o ícone e o texto em pixels
   * @default 4
   */
  iconGap?: number

  /**
   * Componente de ícone personalizado para substituir o ícone padrão
   * @example <CustomIcon />
   */
  customIcon?: React.ReactNode

  /**
   * Tamanho do badge
   * @default "default"
   */
  size?: "sm" | "default" | "lg"

  /**
   * Variante visual do badge
   * @default "auto" - usa a variante padrão do status
   */
  variant?: "auto" | BadgeProps["variant"]

  /**
   * Esquema de cores personalizado
   * @default "auto" - usa as cores padrão do status
   */
  colorScheme?: "auto" | "monochrome" | "vibrant" | "subtle"

  /**
   * Formato do badge
   * @default "rounded"
   */
  shape?: "rounded" | "pill" | "square"

  // ===== COMPORTAMENTAIS =====
  /**
   * Se verdadeiro, o badge terá uma animação de pulso
   * @default false
   */
  pulse?: boolean

  /**
   * Se verdadeiro, o badge terá um estilo de cursor pointer
   * @default false
   */
  clickable?: boolean

  /**
   * Se verdadeiro, o badge será desabilitado
   * @default false
   */
  disabled?: boolean

  /**
   * Se verdadeiro, o badge será destacado visualmente
   * @default false
   */
  highlighted?: boolean

  // ===== EVENTOS =====
  /**
   * Função chamada quando o badge é clicado
   */
  onClick?: React.MouseEventHandler<HTMLDivElement>

  /**
   * Função chamada quando o mouse entra no badge
   */
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>

  /**
   * Função chamada quando o mouse sai do badge
   */
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>

  // ===== ACESSIBILIDADE =====
  /**
   * ID para testes automatizados
   */
  testId?: string

  /**
   * Label para leitores de tela
   */
  ariaLabel?: string

  /**
   * Role ARIA personalizada
   * @default "status"
   */
  role?: string

  /**
   * Se verdadeiro, anuncia mudanças para leitores de tela
   * @default true
   */
  ariaLive?: boolean

  // ===== AVANÇADO =====
  /**
   * Função para renderização customizada do conteúdo
   * @param config - Configuração do status
   * @param props - Props do componente
   * @returns Elemento React customizado
   */
  renderContent?: (config: (typeof STATUS_CONFIG)[StatusType], props: StatusBadgeProps) => React.ReactNode

  /**
   * Configurações de animação personalizadas
   */
  animation?: {
    enabled: boolean
    type?: "pulse" | "bounce" | "spin" | "fade"
    duration?: number
    delay?: number
  }
}

/**
 * Componente StatusBadge
 *
 * Exibe um badge com um status visual, incluindo ícone e texto.
 * Altamente configurável para diferentes contextos e necessidades visuais.
 *
 * @example
 * // Badge de sucesso básico
 * <StatusBadge status="success" />
 *
 * @example
 * // Badge de erro com texto personalizado
 * <StatusBadge
 *   status="error"
 *   label="Falha no processamento"
 *   subtitle="Tente novamente"
 *   size="lg"
 * />
 *
 * @example
 * // Badge de pendente sem ícone
 * <StatusBadge
 *   status="pending"
 *   showIcon={false}
 *   colorScheme="subtle"
 * />
 *
 * @example
 * // Badge clicável com ícone à direita
 * <StatusBadge
 *   status="info"
 *   iconPosition="right"
 *   clickable
 *   onClick={() => alert('Clicado!')}
 *   pulse
 * />
 *
 * @example
 * // Badge com animação personalizada
 * <StatusBadge
 *   status="loading"
 *   animation={{
 *     enabled: true,
 *     type: "spin",
 *     duration: 1000
 *   }}
 * />
 */
export function StatusBadge({
  // Obrigatórias
  status,

  // Conteúdo
  label,
  title,
  subtitle,

  // Visuais
  showIcon = true,
  iconSize = 14,
  iconPosition = "left",
  iconGap = 4,
  customIcon,
  size = "default",
  variant = "auto",
  colorScheme = "auto",
  shape = "rounded",

  // Comportamentais
  pulse = false,
  clickable = false,
  disabled = false,
  highlighted = false,

  // Eventos
  onClick,
  onMouseEnter,
  onMouseLeave,

  // Acessibilidade
  testId,
  ariaLabel,
  role = "status",
  ariaLive = true,

  // Avançado
  renderContent,
  animation,

  className,
  ...props
}: StatusBadgeProps) {
  // Obter a configuração para o status especificado
  const config = STATUS_CONFIG[status]

  if (!config) {
    console.warn(`StatusBadge: Status "${status}" não reconhecido. Usando "info" como fallback.`)
    return <StatusBadge status="info" label={label} {...props} />
  }

  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      text: "text-xs",
      padding: "px-2 py-0.5",
      icon: "w-3 h-3",
      gap: "gap-1",
    },
    default: {
      text: "text-xs",
      padding: "px-2.5 py-0.5",
      icon: "w-3.5 h-3.5",
      gap: "gap-1.5",
    },
    lg: {
      text: "text-sm",
      padding: "px-3 py-1",
      icon: "w-4 h-4",
      gap: "gap-2",
    },
  }

  // Configurações de esquema de cores
  const getColorScheme = () => {
    if (colorScheme === "auto") return config.className

    const schemes = {
      monochrome: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
      vibrant: config.className?.replace(/100|900/g, "200").replace(/800/g, "900"),
      subtle: config.className?.replace(/100|800/g, "50").replace(/900/g, "950"),
    }

    return schemes[colorScheme] || config.className
  }

  // Configurações de formato
  const shapeConfig = {
    rounded: "rounded-md",
    pill: "rounded-full",
    square: "rounded-none",
  }

  const currentSizeConfig = sizeConfig[size]
  const currentColorScheme = getColorScheme()
  const currentShape = shapeConfig[shape]

  // Determinar o ícone a ser exibido
  const IconComponent = config.icon
  const iconElement =
    customIcon ||
    (showIcon && (
      <IconComponent
        className={cn(currentSizeConfig.icon, config.animationClass, animation?.enabled && `animate-${animation.type}`)}
        style={{
          animationDuration: animation?.duration ? `${animation.duration}ms` : undefined,
          animationDelay: animation?.delay ? `${animation.delay}ms` : undefined,
        }}
      />
    ))

  // Construir o conteúdo do badge
  const content = renderContent ? (
    renderContent(config, {
      status,
      label,
      title,
      subtitle,
      showIcon,
      iconSize,
      iconPosition,
      iconGap,
      customIcon,
      size,
      variant,
      colorScheme,
      shape,
      pulse,
      clickable,
      disabled,
      highlighted,
      onClick,
      onMouseEnter,
      onMouseLeave,
      testId,
      ariaLabel,
      role,
      ariaLive,
      renderContent,
      animation,
      className,
      ...props,
    })
  ) : (
    <div className={cn("flex items-center", currentSizeConfig.gap)}>
      {showIcon && iconPosition === "left" && iconElement}
      <div className="flex flex-col">
        <span className="font-medium">{label || config.defaultLabel}</span>
        {subtitle && <span className="text-xs opacity-75">{subtitle}</span>}
      </div>
      {showIcon && iconPosition === "right" && iconElement}
    </div>
  )

  return (
    <Badge
      variant={variant === "auto" ? config.variant : variant}
      className={cn(
        "inline-flex items-center",
        currentSizeConfig.text,
        currentSizeConfig.padding,
        currentColorScheme,
        currentShape,
        pulse && "animate-pulse",
        clickable && "cursor-pointer hover:opacity-80 transition-opacity",
        disabled && "opacity-50 cursor-not-allowed",
        highlighted && "ring-2 ring-offset-2 ring-current",
        className,
      )}
      onClick={clickable && !disabled ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={title}
      data-testid={testId}
      data-status={status}
      aria-label={ariaLabel || `Status: ${label || config.defaultLabel}`}
      role={role}
      aria-live={ariaLive ? "polite" : undefined}
      {...props}
    >
      {content}
    </Badge>
  )
}
