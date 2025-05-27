"use client"

/**
 * CONFIRMATION DIALOG - COMPONENTE APRIMORADO
 *
 * Diálogo de confirmação altamente configurável para ações críticas.
 * Suporta diferentes tipos visuais, confirmação dupla, validação customizada e acessibilidade completa.
 */

import { useEffect, useState, useCallback, useMemo } from "react"
import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Info, CheckCircle, XCircle, HelpCircle, Shield, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  BaseComponentProps,
  InteractiveComponentProps,
  AccessibilityProps,
  ComponentSize,
  ThemeableProps,
  AnimationProps,
} from "@/types/component-base"

// ===== TIPOS E INTERFACES =====

/**
 * Tipos de confirmação disponíveis
 */
export type ConfirmationType =
  | "default"
  | "destructive"
  | "warning"
  | "info"
  | "success"
  | "question"
  | "security"
  | "critical"

/**
 * Severidade da ação
 */
export type ActionSeverity = "low" | "medium" | "high" | "critical"

/**
 * Item afetado pela ação
 */
export interface AffectedItem {
  /** ID único do item */
  id: string
  /** Nome de exibição */
  name: string
  /** Tipo do item */
  type?: string
  /** Ícone do item */
  icon?: React.ReactNode
  /** Se o item está protegido */
  protected?: boolean
  /** Metadados adicionais */
  metadata?: Record<string, any>
}

/**
 * Detalhes da ação a ser executada
 */
export interface ActionDetails {
  /** Tipo da ação */
  type: string
  /** Alvo da ação */
  target: string
  /** Descrição da ação */
  description?: string
  /** Consequências da ação */
  consequences?: string[]
  /** Se a ação é reversível */
  reversible?: boolean
  /** Tempo estimado para execução */
  estimatedTime?: number
  /** Nível de risco */
  riskLevel?: ActionSeverity
  /** Permissões necessárias */
  requiredPermissions?: string[]
}

/**
 * Configuração de confirmação dupla
 */
export interface DoubleConfirmationConfig {
  /** Tipo de confirmação dupla */
  type: "text" | "checkbox" | "password" | "custom"
  /** Texto que deve ser digitado */
  confirmationText?: string
  /** Label do checkbox */
  checkboxLabel?: string
  /** Se é case sensitive */
  caseSensitive?: boolean
  /** Se deve remover espaços */
  trimWhitespace?: boolean
  /** Validador customizado */
  customValidator?: (input: string) => boolean | string
  /** Placeholder para input */
  placeholder?: string
  /** Texto de ajuda */
  helpText?: string
}

/**
 * Configuração de timeout
 */
export interface TimeoutConfig {
  /** Duração em segundos */
  duration: number
  /** Se deve mostrar contador */
  showCounter?: boolean
  /** Ação ao expirar */
  onExpire?: "cancel" | "confirm" | "custom"
  /** Callback customizado para expiração */
  onExpireCallback?: () => void
  /** Se deve pausar no hover */
  pauseOnHover?: boolean
}

/**
 * Configuração visual avançada
 */
export interface ConfirmationVisualConfig {
  /** Layout do diálogo */
  layout?: "default" | "compact" | "detailed" | "minimal"
  /** Posição do ícone */
  iconPosition?: "top" | "left" | "right" | "none"
  /** Estilo dos botões */
  buttonStyle?: "default" | "filled" | "outlined" | "minimal"
  /** Se deve mostrar backdrop blur */
  backdropBlur?: boolean
  /** Animação de entrada */
  enterAnimation?: "fade" | "scale" | "slide" | "none"
  /** Cor de destaque */
  accentColor?: string
}

/**
 * Props principais do ConfirmationDialog
 */
export interface ConfirmationDialogProps
  extends BaseComponentProps,
    InteractiveComponentProps,
    AccessibilityProps,
    ThemeableProps,
    AnimationProps {
  // ===== PROPS OBRIGATÓRIAS =====
  /** Se o diálogo está aberto */
  open: boolean
  /** Callback para mudança de estado */
  onOpenChange: (open: boolean) => void
  /** Título do diálogo */
  title: string
  /** Descrição da ação */
  description: string
  /** Callback de confirmação */
  onConfirm: () => void | Promise<void>

  // ===== CONTEÚDO =====
  /** Texto do botão de confirmação */
  confirmLabel?: string
  /** Texto do botão de cancelamento */
  cancelLabel?: string
  /** Conteúdo adicional */
  children?: React.ReactNode
  /** Texto de aviso adicional */
  warningText?: string
  /** Mensagem de sucesso após confirmação */
  successMessage?: string
  /** Itens afetados pela ação */
  affectedItems?: AffectedItem[]
  /** Detalhes da ação */
  actionDetails?: ActionDetails

  // ===== COMPORTAMENTAIS =====
  /** Tipo de confirmação */
  type?: ConfirmationType
  /** Tamanho do diálogo */
  size?: ComponentSize
  /** Se está processando */
  isConfirming?: boolean
  /** Configuração de confirmação dupla */
  doubleConfirmation?: DoubleConfirmationConfig
  /** Configuração de timeout */
  timeout?: TimeoutConfig
  /** Se fecha ao clicar fora */
  closeOnOutsideClick?: boolean
  /** Se fecha com Escape */
  closeOnEscape?: boolean
  /** Configuração visual */
  visual?: ConfirmationVisualConfig

  // ===== EVENTOS =====
  /** Callback de cancelamento */
  onCancel?: () => void
  /** Callback de fechamento */
  onClose?: () => void
  /** Callback de timeout */
  onTimeout?: () => void
  /** Callback de validação de confirmação dupla */
  onDoubleConfirmationChange?: (isValid: boolean) => void
  /** Callback antes da confirmação */
  onBeforeConfirm?: () => boolean | Promise<boolean>
  /** Callback após confirmação */
  onAfterConfirm?: (success: boolean) => void

  // ===== CUSTOMIZAÇÃO AVANÇADA =====
  /** Renderização customizada do conteúdo */
  renderContent?: (props: ConfirmationDialogProps) => React.ReactNode
  /** Renderização customizada dos botões */
  renderActions?: (props: ConfirmationDialogProps) => React.ReactNode
  /** Renderização customizada do ícone */
  renderIcon?: (type: ConfirmationType) => React.ReactNode
  /** Renderização customizada dos itens afetados */
  renderAffectedItems?: (items: AffectedItem[]) => React.ReactNode
}

// ===== CONFIGURAÇÕES PADRÃO =====

const DEFAULT_VISUAL: ConfirmationVisualConfig = {
  layout: "default",
  iconPosition: "left",
  buttonStyle: "default",
  backdropBlur: true,
  enterAnimation: "scale",
}

const DEFAULT_DOUBLE_CONFIRMATION: DoubleConfirmationConfig = {
  type: "text",
  confirmationText: "CONFIRMAR",
  caseSensitive: false,
  trimWhitespace: true,
}

// ===== CONFIGURAÇÕES DE TIPO =====

const typeConfigurations = {
  default: {
    icon: Info,
    iconColor: "text-blue-500",
    confirmVariant: "default" as const,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  destructive: {
    icon: XCircle,
    iconColor: "text-red-500",
    confirmVariant: "destructive" as const,
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    confirmVariant: "default" as const,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    confirmVariant: "default" as const,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-500",
    confirmVariant: "default" as const,
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  question: {
    icon: HelpCircle,
    iconColor: "text-purple-500",
    confirmVariant: "default" as const,
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  security: {
    icon: Shield,
    iconColor: "text-orange-500",
    confirmVariant: "destructive" as const,
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  critical: {
    icon: AlertTriangle,
    iconColor: "text-red-600",
    confirmVariant: "destructive" as const,
    bgColor: "bg-red-100 dark:bg-red-950/30",
    borderColor: "border-red-300 dark:border-red-700",
  },
}

const sizeConfigurations = {
  xs: "sm:max-w-xs",
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
}

// ===== COMPONENTE PRINCIPAL =====

/**
 * ConfirmationDialog - Diálogo de confirmação aprimorado
 *
 * @example
 * // Confirmação básica
 * <ConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   title="Confirmar exclusão"
 *   description="Esta ação não pode ser desfeita."
 *   onConfirm={handleDelete}
 * />
 *
 * @example
 * // Confirmação destrutiva com itens afetados
 * <ConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   title="Excluir múltiplos itens"
 *   description="Os seguintes itens serão excluídos permanentemente."
 *   type="destructive"
 *   affectedItems={selectedItems}
 *   doubleConfirmation={{
 *     type: "text",
 *     confirmationText: "EXCLUIR TUDO",
 *     helpText: "Digite o texto acima para confirmar"
 *   }}
 *   onConfirm={handleBulkDelete}
 * />
 *
 * @example
 * // Confirmação com timeout e detalhes da ação
 * <ConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   title="Sessão expirando"
 *   description="Sua sessão expirará em breve."
 *   type="warning"
 *   timeout={{
 *     duration: 30,
 *     showCounter: true,
 *     onExpire: "cancel"
 *   }}
 *   actionDetails={{
 *     type: "session-extend",
 *     target: "user-session",
 *     reversible: true,
 *     estimatedTime: 1
 *   }}
 *   onConfirm={extendSession}
 * />
 */
export function ConfirmationDialog({
  // Obrigatórias
  open,
  onOpenChange,
  title,
  description,
  onConfirm,

  // Conteúdo
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  children,
  warningText,
  successMessage,
  affectedItems,
  actionDetails,

  // Comportamentais
  type = "default",
  size = "md",
  isConfirming = false,
  doubleConfirmation,
  timeout,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  visual = DEFAULT_VISUAL,
  disabled = false,

  // Eventos
  onCancel,
  onClose,
  onTimeout,
  onDoubleConfirmationChange,
  onBeforeConfirm,
  onAfterConfirm,

  // Customização
  renderContent,
  renderActions,
  renderIcon,
  renderAffectedItems,

  // Acessibilidade
  ariaLabel,
  ariaDescription,

  // Base
  className,
  id,
  testId,
  animated = true,

  ...props
}: ConfirmationDialogProps) {
  // ===== ESTADO LOCAL =====
  const [doubleConfirmationInput, setDoubleConfirmationInput] = useState("")
  const [doubleConfirmationChecked, setDoubleConfirmationChecked] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | undefined>(timeout?.duration)
  const [isDoubleConfirmationValid, setIsDoubleConfirmationValid] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // ===== CONFIGURAÇÕES MESCLADAS =====
  const mergedVisual = useMemo(() => ({ ...DEFAULT_VISUAL, ...visual }), [visual])
  const mergedDoubleConfirmation = useMemo(
    () => (doubleConfirmation ? { ...DEFAULT_DOUBLE_CONFIRMATION, ...doubleConfirmation } : null),
    [doubleConfirmation],
  )

  const currentTypeConfig = typeConfigurations[type]
  const currentSizeConfig = sizeConfigurations[size]

  // ===== VALIDAÇÃO DE CONFIRMAÇÃO DUPLA =====
  const validateDoubleConfirmation = useCallback(() => {
    if (!mergedDoubleConfirmation) {
      setIsDoubleConfirmationValid(true)
      return true
    }

    switch (mergedDoubleConfirmation.type) {
      case "text": {
        let input = doubleConfirmationInput
        let target = mergedDoubleConfirmation.confirmationText || "CONFIRMAR"

        if (mergedDoubleConfirmation.trimWhitespace) {
          input = input.trim()
          target = target.trim()
        }

        if (!mergedDoubleConfirmation.caseSensitive) {
          input = input.toLowerCase()
          target = target.toLowerCase()
        }

        const isValid = mergedDoubleConfirmation.customValidator
          ? mergedDoubleConfirmation.customValidator(doubleConfirmationInput) === true
          : input === target

        setIsDoubleConfirmationValid(isValid)
        return isValid
      }

      case "checkbox": {
        setIsDoubleConfirmationValid(doubleConfirmationChecked)
        return doubleConfirmationChecked
      }

      case "password": {
        // Implementar validação de senha se necessário
        const isValid = doubleConfirmationInput.length > 0
        setIsDoubleConfirmationValid(isValid)
        return isValid
      }

      case "custom": {
        if (mergedDoubleConfirmation.customValidator) {
          const result = mergedDoubleConfirmation.customValidator(doubleConfirmationInput)
          const isValid = result === true
          setIsDoubleConfirmationValid(isValid)
          return isValid
        }
        return true
      }

      default:
        return true
    }
  }, [mergedDoubleConfirmation, doubleConfirmationInput, doubleConfirmationChecked])

  // ===== TIMER DE TIMEOUT =====
  useEffect(() => {
    if (!timeout || !open || timeLeft === undefined) return

    if (timeLeft <= 0) {
      if (timeout.onExpire === "cancel") {
        handleCancel()
      } else if (timeout.onExpire === "confirm") {
        handleConfirm()
      } else if (timeout.onExpire === "custom" && timeout.onExpireCallback) {
        timeout.onExpireCallback()
      }
      onTimeout?.()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => (prev !== undefined ? prev - 1 : undefined))
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeout, open, timeLeft, onTimeout])

  // ===== RESET DE ESTADO =====
  useEffect(() => {
    if (open) {
      setTimeLeft(timeout?.duration)
      setDoubleConfirmationInput("")
      setDoubleConfirmationChecked(false)
      setIsDoubleConfirmationValid(!mergedDoubleConfirmation)
      setIsProcessing(false)
      setShowSuccess(false)
    }
  }, [open, timeout?.duration, mergedDoubleConfirmation])

  // ===== VALIDAÇÃO EM TEMPO REAL =====
  useEffect(() => {
    const isValid = validateDoubleConfirmation()
    onDoubleConfirmationChange?.(isValid)
  }, [validateDoubleConfirmation, onDoubleConfirmationChange])

  // ===== HANDLERS =====
  const handleCancel = useCallback(() => {
    onOpenChange(false)
    onCancel?.()
    onClose?.()
  }, [onOpenChange, onCancel, onClose])

  const handleConfirm = useCallback(async () => {
    if (disabled || isProcessing || (mergedDoubleConfirmation && !isDoubleConfirmationValid)) {
      return
    }

    try {
      setIsProcessing(true)

      // Executar callback antes da confirmação
      if (onBeforeConfirm) {
        const shouldProceed = await onBeforeConfirm()
        if (!shouldProceed) {
          setIsProcessing(false)
          return
        }
      }

      // Executar confirmação
      await onConfirm()

      // Mostrar sucesso se configurado
      if (successMessage) {
        setShowSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          onAfterConfirm?.(true)
        }, 1500)
      } else {
        onOpenChange(false)
        onAfterConfirm?.(true)
      }
    } catch (error) {
      console.error("Error during confirmation:", error)
      onAfterConfirm?.(false)
    } finally {
      setIsProcessing(false)
    }
  }, [
    disabled,
    isProcessing,
    mergedDoubleConfirmation,
    isDoubleConfirmationValid,
    onBeforeConfirm,
    onConfirm,
    successMessage,
    onOpenChange,
    onAfterConfirm,
  ])

  // ===== RENDERIZAÇÃO DE ELEMENTOS =====
  const renderIconElement = useCallback(() => {
    if (mergedVisual.iconPosition === "none") return null

    if (renderIcon) {
      return renderIcon(type)
    }

    const IconComponent = currentTypeConfig.icon
    return (
      <div className={cn("flex-shrink-0", currentTypeConfig.bgColor, "p-3 rounded-full")}>
        <IconComponent className={cn("h-6 w-6", currentTypeConfig.iconColor)} />
      </div>
    )
  }, [mergedVisual.iconPosition, renderIcon, type, currentTypeConfig])

  const renderAffectedItemsElement = useCallback(() => {
    if (!affectedItems || affectedItems.length === 0) return null

    if (renderAffectedItems) {
      return renderAffectedItems(affectedItems)
    }

    return (
      <div className="mt-4">
        <p className="text-sm font-medium mb-3">
          {affectedItems.length} {affectedItems.length === 1 ? "item será afetado" : "itens serão afetados"}:
        </p>
        <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/50 space-y-1">
          {affectedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-background">
              <div className="flex items-center gap-2 min-w-0">
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="text-sm truncate">{item.name}</span>
                {item.protected && <Shield className="h-3 w-3 text-orange-500 flex-shrink-0" />}
              </div>
              {item.type && (
                <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                  {item.type}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }, [affectedItems, renderAffectedItems])

  const renderActionDetailsElement = useCallback(() => {
    if (!actionDetails) return null

    return (
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Ação:</span> {actionDetails.type}
          </div>
          <div>
            <span className="font-medium">Alvo:</span> {actionDetails.target}
          </div>
          {actionDetails.estimatedTime && (
            <div>
              <span className="font-medium">Tempo estimado:</span> {actionDetails.estimatedTime}s
            </div>
          )}
          {actionDetails.riskLevel && (
            <div>
              <span className="font-medium">Nível de risco:</span>
              <Badge variant={actionDetails.riskLevel === "critical" ? "destructive" : "secondary"} className="ml-1">
                {actionDetails.riskLevel}
              </Badge>
            </div>
          )}
        </div>

        {actionDetails.consequences && actionDetails.consequences.length > 0 && (
          <div>
            <span className="font-medium text-sm">Consequências:</span>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-muted-foreground">
              {actionDetails.consequences.map((consequence, index) => (
                <li key={index}>{consequence}</li>
              ))}
            </ul>
          </div>
        )}

        {actionDetails.reversible !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Reversível:</span>
            <Badge variant={actionDetails.reversible ? "default" : "destructive"}>
              {actionDetails.reversible ? "Sim" : "Não"}
            </Badge>
          </div>
        )}
      </div>
    )
  }, [actionDetails])

  const renderDoubleConfirmationElement = useCallback(() => {
    if (!mergedDoubleConfirmation) return null

    switch (mergedDoubleConfirmation.type) {
      case "text":
        return (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">
              Digite "{mergedDoubleConfirmation.confirmationText}" para confirmar:
            </label>
            <Input
              type="text"
              value={doubleConfirmationInput}
              onChange={(e) => setDoubleConfirmationInput(e.target.value)}
              placeholder={mergedDoubleConfirmation.placeholder || mergedDoubleConfirmation.confirmationText}
              disabled={isProcessing}
              className={cn(
                isDoubleConfirmationValid && doubleConfirmationInput
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-input",
              )}
            />
            {mergedDoubleConfirmation.helpText && (
              <p className="text-xs text-muted-foreground">{mergedDoubleConfirmation.helpText}</p>
            )}
          </div>
        )

      case "checkbox":
        return (
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="double-confirmation-checkbox"
                checked={doubleConfirmationChecked}
                onCheckedChange={setDoubleConfirmationChecked}
                disabled={isProcessing}
              />
              <label htmlFor="double-confirmation-checkbox" className="text-sm">
                {mergedDoubleConfirmation.checkboxLabel || "Confirmo que entendo as consequências desta ação"}
              </label>
            </div>
            {mergedDoubleConfirmation.helpText && (
              <p className="text-xs text-muted-foreground">{mergedDoubleConfirmation.helpText}</p>
            )}
          </div>
        )

      case "password":
        return (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Digite sua senha para confirmar:</label>
            <Input
              type="password"
              value={doubleConfirmationInput}
              onChange={(e) => setDoubleConfirmationInput(e.target.value)}
              placeholder="Senha"
              disabled={isProcessing}
            />
            {mergedDoubleConfirmation.helpText && (
              <p className="text-xs text-muted-foreground">{mergedDoubleConfirmation.helpText}</p>
            )}
          </div>
        )

      case "custom":
        return (
          <div className="mt-4 space-y-2">
            <Input
              type="text"
              value={doubleConfirmationInput}
              onChange={(e) => setDoubleConfirmationInput(e.target.value)}
              placeholder={mergedDoubleConfirmation.placeholder}
              disabled={isProcessing}
            />
            {mergedDoubleConfirmation.helpText && (
              <p className="text-xs text-muted-foreground">{mergedDoubleConfirmation.helpText}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }, [
    mergedDoubleConfirmation,
    doubleConfirmationInput,
    doubleConfirmationChecked,
    isProcessing,
    isDoubleConfirmationValid,
  ])

  const renderTimeoutElement = useCallback(() => {
    if (!timeout || !timeout.showCounter || timeLeft === undefined) return null

    const progress = ((timeout.duration - timeLeft) / timeout.duration) * 100

    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Tempo restante:</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeLeft}s
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    )
  }, [timeout, timeLeft])

  // ===== RENDERIZAÇÃO PRINCIPAL =====
  if (renderContent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange} modal={closeOnOutsideClick}>
        <DialogContent
          className={cn(currentSizeConfig, className)}
          data-testid={testId}
          onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
        >
          {renderContent({
            open,
            onOpenChange,
            title,
            description,
            onConfirm,
            confirmLabel,
            cancelLabel,
            children,
            warningText,
            successMessage,
            affectedItems,
            actionDetails,
            type,
            size,
            isConfirming: isProcessing,
            doubleConfirmation: mergedDoubleConfirmation,
            timeout,
            closeOnOutsideClick,
            closeOnEscape,
            visual: mergedVisual,
            disabled,
            onCancel,
            onClose,
            onTimeout,
            onDoubleConfirmationChange,
            onBeforeConfirm,
            onAfterConfirm,
            renderContent,
            renderActions,
            renderIcon,
            renderAffectedItems,
            ariaLabel,
            ariaDescription,
            className,
            id,
            testId,
            animated,
          })}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={closeOnOutsideClick}>
      <DialogContent
        className={cn(
          currentSizeConfig,
          mergedVisual.backdropBlur && "backdrop-blur-sm",
          animated && "animate-in fade-in-0 zoom-in-95",
          className,
        )}
        data-testid={testId}
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription}
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
      >
        {showSuccess ? (
          // Tela de sucesso
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <DialogTitle className="text-lg font-semibold mb-2">Sucesso!</DialogTitle>
            <DialogDescription>{successMessage}</DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div
                className={cn(
                  "flex gap-4",
                  mergedVisual.iconPosition === "top" && "flex-col items-center text-center",
                  mergedVisual.iconPosition === "right" && "flex-row-reverse",
                )}
              >
                {/* Ícone */}
                {mergedVisual.iconPosition !== "none" && renderIconElement()}

                <div className="flex-1 min-w-0">
                  <DialogTitle className="flex items-center gap-2">
                    {title}
                    {timeout?.showCounter && timeLeft !== undefined && timeLeft > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeLeft}s
                      </Badge>
                    )}
                  </DialogTitle>

                  <DialogDescription className="mt-2">{description}</DialogDescription>

                  {/* Texto de aviso */}
                  {warningText && (
                    <div
                      className={cn(
                        "mt-3 p-3 rounded-md border-l-4",
                        currentTypeConfig.bgColor,
                        currentTypeConfig.borderColor,
                      )}
                    >
                      <p className="text-sm font-medium">{warningText}</p>
                    </div>
                  )}

                  {/* Detalhes da ação */}
                  {renderActionDetailsElement()}

                  {/* Itens afetados */}
                  {renderAffectedItemsElement()}

                  {/* Timeout */}
                  {renderTimeoutElement()}

                  {/* Confirmação dupla */}
                  {renderDoubleConfirmationElement()}

                  {/* Conteúdo adicional */}
                  {children && <div className="mt-4">{children}</div>}
                </div>
              </div>
            </DialogHeader>

            <DialogFooter className="mt-6">
              {renderActions ? (
                renderActions({
                  open,
                  onOpenChange,
                  title,
                  description,
                  onConfirm,
                  confirmLabel,
                  cancelLabel,
                  children,
                  warningText,
                  successMessage,
                  affectedItems,
                  actionDetails,
                  type,
                  size,
                  isConfirming: isProcessing,
                  doubleConfirmation: mergedDoubleConfirmation,
                  timeout,
                  closeOnOutsideClick,
                  closeOnEscape,
                  visual: mergedVisual,
                  disabled,
                  onCancel,
                  onClose,
                  onTimeout,
                  onDoubleConfirmationChange,
                  onBeforeConfirm,
                  onAfterConfirm,
                  renderContent,
                  renderActions,
                  renderIcon,
                  renderAffectedItems,
                  ariaLabel,
                  ariaDescription,
                  className,
                  id,
                  testId,
                  animated,
                })
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
                    {cancelLabel}
                  </Button>
                  <Button
                    variant={currentTypeConfig.confirmVariant}
                    onClick={handleConfirm}
                    disabled={disabled || isProcessing || (mergedDoubleConfirmation && !isDoubleConfirmationValid)}
                    className={cn(
                      type === "destructive" && "bg-red-600 hover:bg-red-700",
                      type === "critical" && "bg-red-700 hover:bg-red-800",
                    )}
                  >
                    {isProcessing ? "Processando..." : confirmLabel}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ===== EXPORTS =====
export type {
  ConfirmationType,
  ActionSeverity,
  AffectedItem,
  ActionDetails,
  DoubleConfirmationConfig,
  TimeoutConfig,
  ConfirmationVisualConfig,
}
