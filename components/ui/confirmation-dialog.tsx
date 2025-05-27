"use client"

import { useEffect } from "react"

import { useState } from "react"

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
import { AlertTriangle, Info, CheckCircle, XCircle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BaseComponentProps } from "@/types/component-interfaces"

/**
 * Tipos de confirmação disponíveis
 */
export type ConfirmationType = "default" | "destructive" | "warning" | "info" | "success" | "question"

/**
 * Props para o componente ConfirmationDialog
 */
export interface ConfirmationDialogProps extends BaseComponentProps {
  // ===== PROPS OBRIGATÓRIAS =====
  /**
   * Se o diálogo está aberto
   * @required
   */
  open: boolean

  /**
   * Função chamada quando o estado de abertura muda
   * @required
   */
  onOpenChange: (open: boolean) => void

  /**
   * Título do diálogo
   * @required
   */
  title: string

  /**
   * Descrição/mensagem do diálogo
   * @required
   */
  description: string

  /**
   * Função chamada quando o usuário confirma
   * @required
   */
  onConfirm: () => void

  // ===== CONTEÚDO =====
  /**
   * Texto do botão de confirmação
   * @default "Confirmar"
   */
  confirmLabel?: string

  /**
   * Texto do botão de cancelamento
   * @default "Cancelar"
   */
  cancelLabel?: string

  /**
   * Conteúdo adicional a ser exibido no corpo do diálogo
   */
  children?: React.ReactNode

  /**
   * Lista de itens que serão afetados pela ação
   */
  affectedItems?: Array<{
    id: string
    name: string
    type?: string
    metadata?: Record<string, any>
  }>

  /**
   * Texto de aviso adicional
   */
  warningText?: string

  /**
   * Informações adicionais sobre a ação
   */
  actionDetails?: {
    type: string
    target: string
    consequences?: string[]
    reversible?: boolean
  }

  // ===== COMPORTAMENTAIS =====
  /**
   * Tipo de confirmação que determina o estilo visual
   * @default "default"
   */
  type?: ConfirmationType

  /**
   * Se verdadeiro, o diálogo está processando a confirmação
   * @default false
   */
  isConfirming?: boolean

  /**
   * Se verdadeiro, desabilita o botão de confirmação
   * @default false
   */
  disabled?: boolean

  /**
   * Se verdadeiro, requer confirmação dupla (digitação ou checkbox)
   * @default false
   */
  requireDoubleConfirmation?: boolean

  /**
   * Texto que deve ser digitado para confirmar (quando requireDoubleConfirmation é true)
   */
  confirmationText?: string

  /**
   * Se verdadeiro, fecha o diálogo ao clicar fora
   * @default true
   */
  closeOnOutsideClick?: boolean

  /**
   * Se verdadeiro, fecha o diálogo ao pressionar Escape
   * @default true
   */
  closeOnEscape?: boolean

  /**
   * Tempo limite em segundos para auto-cancelamento
   */
  autoCloseTimeout?: number

  // ===== VISUAIS =====
  /**
   * Tamanho do diálogo
   * @default "default"
   */
  size?: "sm" | "default" | "lg" | "xl"

  /**
   * Se verdadeiro, mostra ícone baseado no tipo
   * @default true
   */
  showIcon?: boolean

  /**
   * Ícone personalizado para substituir o padrão
   */
  customIcon?: React.ReactNode

  /**
   * Se verdadeiro, mostra contador de itens afetados
   * @default true
   */
  showAffectedCount?: boolean

  /**
   * Se verdadeiro, destaca o botão de confirmação
   * @default true
   */
  highlightConfirmButton?: boolean

  // ===== EVENTOS =====
  /**
   * Função chamada quando o usuário cancela
   */
  onCancel?: () => void

  /**
   * Função chamada quando o diálogo é fechado por qualquer motivo
   */
  onClose?: () => void

  /**
   * Função chamada quando o timeout é atingido
   */
  onTimeout?: () => void

  /**
   * Função chamada quando a confirmação dupla é validada
   */
  onDoubleConfirmationChange?: (isValid: boolean) => void

  // ===== ACESSIBILIDADE =====
  /**
   * ID único para o diálogo
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
   * Função para renderização customizada do conteúdo
   */
  renderContent?: (props: ConfirmationDialogProps) => React.ReactNode

  /**
   * Função para renderização customizada dos botões de ação
   */
  renderActions?: (props: ConfirmationDialogProps) => React.ReactNode

  /**
   * Configurações de validação para confirmação dupla
   */
  validation?: {
    caseSensitive?: boolean
    trimWhitespace?: boolean
    customValidator?: (input: string) => boolean
  }
}

/**
 * Componente ConfirmationDialog
 *
 * Diálogo de confirmação altamente configurável para ações críticas.
 * Suporta diferentes tipos visuais, confirmação dupla e validação customizada.
 *
 * @example
 * // Confirmação básica
 * <ConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   title="Confirmar exclusão"
 *   description="Tem certeza que deseja excluir este item?"
 *   onConfirm={handleDelete}
 * />
 *
 * @example
 * // Confirmação destrutiva com itens afetados
 * <ConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   title="Excluir múltiplos itens"
 *   description="Esta ação não pode ser desfeita."
 *   type="destructive"
 *   affectedItems={selectedItems}
 *   requireDoubleConfirmation
 *   confirmationText="EXCLUIR"
 *   onConfirm={handleBulkDelete}
 * />
 *
 * @example
 * // Confirmação com timeout
 * <ConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   title="Sessão expirando"
 *   description="Sua sessão expirará em breve. Deseja continuar?"
 *   type="warning"
 *   autoCloseTimeout={30}
 *   onConfirm={extendSession}
 *   onTimeout={handleTimeout}
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
  affectedItems,
  warningText,
  actionDetails,

  // Comportamentais
  type = "default",
  isConfirming = false,
  disabled = false,
  requireDoubleConfirmation = false,
  confirmationText = "CONFIRMAR",
  closeOnOutsideClick = true,
  closeOnEscape = true,
  autoCloseTimeout,

  // Visuais
  size = "default",
  showIcon = true,
  customIcon,
  showAffectedCount = true,
  highlightConfirmButton = true,

  // Eventos
  onCancel,
  onClose,
  onTimeout,
  onDoubleConfirmationChange,

  // Acessibilidade
  id,
  ariaLabel,
  ariaDescription,
  testId,

  // Avançado
  renderContent,
  renderActions,
  validation,

  className,
}: ConfirmationDialogProps) {
  const [doubleConfirmationInput, setDoubleConfirmationInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(autoCloseTimeout)
  const [isDoubleConfirmationValid, setIsDoubleConfirmationValid] = useState(false)

  // Configurações de tipo
  const typeConfig = {
    default: {
      icon: Info,
      iconColor: "text-blue-500",
      confirmVariant: "default" as const,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    destructive: {
      icon: XCircle,
      iconColor: "text-red-500",
      confirmVariant: "destructive" as const,
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      confirmVariant: "default" as const,
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-500",
      confirmVariant: "default" as const,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      confirmVariant: "default" as const,
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    question: {
      icon: HelpCircle,
      iconColor: "text-purple-500",
      confirmVariant: "default" as const,
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  }

  // Configurações de tamanho
  const sizeConfig = {
    sm: "sm:max-w-sm",
    default: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
  }

  const currentTypeConfig = typeConfig[type]
  const currentSizeConfig = sizeConfig[size]
  const IconComponent = currentTypeConfig.icon

  // Timer para auto-close
  useEffect(() => {
    if (autoCloseTimeout && open && timeLeft !== undefined) {
      if (timeLeft <= 0) {
        onTimeout?.()
        onOpenChange(false)
        return
      }

      const timer = setTimeout(() => {
        setTimeLeft((prev) => (prev !== undefined ? prev - 1 : undefined))
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [autoCloseTimeout, open, timeLeft, onTimeout, onOpenChange])

  // Reset timer quando o diálogo abre
  useEffect(() => {
    if (open) {
      setTimeLeft(autoCloseTimeout)
      setDoubleConfirmationInput("")
      setIsDoubleConfirmationValid(false)
    }
  }, [open, autoCloseTimeout])

  // Validação da confirmação dupla
  useEffect(() => {
    if (!requireDoubleConfirmation) {
      setIsDoubleConfirmationValid(true)
      return
    }

    let input = doubleConfirmationInput
    let target = confirmationText

    if (validation?.trimWhitespace !== false) {
      input = input.trim()
      target = target.trim()
    }

    if (!validation?.caseSensitive) {
      input = input.toLowerCase()
      target = target.toLowerCase()
    }

    const isValid = validation?.customValidator ? validation.customValidator(doubleConfirmationInput) : input === target

    setIsDoubleConfirmationValid(isValid)
    onDoubleConfirmationChange?.(isValid)
  }, [doubleConfirmationInput, confirmationText, requireDoubleConfirmation, validation, onDoubleConfirmationChange])

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false)
    onCancel?.()
    onClose?.()
  }

  // Handle confirm
  const handleConfirm = () => {
    if (disabled || isConfirming || (requireDoubleConfirmation && !isDoubleConfirmationValid)) {
      return
    }
    onConfirm()
  }

  // Renderizar conteúdo customizado
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
            affectedItems,
            warningText,
            actionDetails,
            type,
            isConfirming,
            disabled,
            requireDoubleConfirmation,
            confirmationText,
            closeOnOutsideClick,
            closeOnEscape,
            autoCloseTimeout,
            size,
            showIcon,
            customIcon,
            showAffectedCount,
            highlightConfirmButton,
            onCancel,
            onClose,
            onTimeout,
            onDoubleConfirmationChange,
            id,
            ariaLabel,
            ariaDescription,
            testId,
            renderContent,
            renderActions,
            validation,
            className,
          })}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={closeOnOutsideClick}>
      <DialogContent
        className={cn(currentSizeConfig, className)}
        data-testid={testId}
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription}
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            {/* Ícone */}
            {showIcon && (
              <div className={cn("flex-shrink-0 mt-1", currentTypeConfig.bgColor, "p-2 rounded-full")}>
                {customIcon || <IconComponent className={cn("h-5 w-5", currentTypeConfig.iconColor)} />}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <DialogTitle className="text-left">
                {title}
                {autoCloseTimeout && timeLeft !== undefined && timeLeft > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {timeLeft}s
                  </Badge>
                )}
              </DialogTitle>

              <DialogDescription className="text-left mt-2">{description}</DialogDescription>

              {/* Texto de aviso */}
              {warningText && (
                <div
                  className={cn(
                    "mt-3 p-3 rounded-md border-l-4",
                    type === "destructive" &&
                      "bg-red-50 border-red-400 text-red-700 dark:bg-red-950/20 dark:text-red-300",
                    type === "warning" &&
                      "bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-300",
                    type !== "destructive" &&
                      type !== "warning" &&
                      "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300",
                  )}
                >
                  <p className="text-sm font-medium">{warningText}</p>
                </div>
              )}

              {/* Detalhes da ação */}
              {actionDetails && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Ação:</span> {actionDetails.type}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Alvo:</span> {actionDetails.target}
                  </div>
                  {actionDetails.consequences && actionDetails.consequences.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Consequências:</span>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {actionDetails.consequences.map((consequence, index) => (
                          <li key={index} className="text-muted-foreground">
                            {consequence}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {actionDetails.reversible !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium">Reversível:</span>{" "}
                      <Badge variant={actionDetails.reversible ? "success" : "destructive"}>
                        {actionDetails.reversible ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Itens afetados */}
              {affectedItems && affectedItems.length > 0 && (
                <div className="mt-3">
                  {showAffectedCount && (
                    <p className="text-sm font-medium mb-2">
                      {affectedItems.length} {affectedItems.length === 1 ? "item será afetado" : "itens serão afetados"}
                      :
                    </p>
                  )}
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/50">
                    {affectedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1">
                        <span className="text-sm truncate">{item.name}</span>
                        {item.type && (
                          <Badge variant="outline" className="text-xs ml-2">
                            {item.type}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmação dupla */}
              {requireDoubleConfirmation && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">Digite "{confirmationText}" para confirmar:</label>
                  <input
                    type="text"
                    value={doubleConfirmationInput}
                    onChange={(e) => setDoubleConfirmationInput(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-md text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      isDoubleConfirmationValid && doubleConfirmationInput
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-input",
                    )}
                    placeholder={confirmationText}
                    disabled={isConfirming}
                  />
                </div>
              )}

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
              affectedItems,
              warningText,
              actionDetails,
              type,
              isConfirming,
              disabled,
              requireDoubleConfirmation,
              confirmationText,
              closeOnOutsideClick,
              closeOnEscape,
              autoCloseTimeout,
              size,
              showIcon,
              customIcon,
              showAffectedCount,
              highlightConfirmButton,
              onCancel,
              onClose,
              onTimeout,
              onDoubleConfirmationChange,
              id,
              ariaLabel,
              ariaDescription,
              testId,
              renderContent,
              renderActions,
              validation,
              className,
            })
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isConfirming}>
                {cancelLabel}
              </Button>
              <Button
                variant={highlightConfirmButton ? currentTypeConfig.confirmVariant : "outline"}
                onClick={handleConfirm}
                disabled={disabled || isConfirming || (requireDoubleConfirmation && !isDoubleConfirmationValid)}
                className={cn(
                  highlightConfirmButton && type === "destructive" && "bg-red-600 hover:bg-red-700",
                  highlightConfirmButton && type === "warning" && "bg-yellow-600 hover:bg-yellow-700",
                )}
              >
                {isConfirming ? "Processando..." : confirmLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
