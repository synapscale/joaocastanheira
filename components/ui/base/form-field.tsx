"use client"

import type React from "react"
import { forwardRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/**
 * Props base para campos de formulário
 */
interface BaseFormFieldProps {
  /** Label do campo */
  label?: string
  /** Texto de ajuda */
  helpText?: string
  /** Mensagem de erro */
  error?: string
  /** Se o campo é obrigatório */
  required?: boolean
  /** Classe CSS adicional para o container */
  containerClassName?: string
  /** Classe CSS adicional para o label */
  labelClassName?: string
}

/**
 * Props para FormField com Input
 */
interface InputFormFieldProps extends BaseFormFieldProps, React.ComponentProps<typeof Input> {
  type?: "input"
}

/**
 * Props para FormField com Textarea
 */
interface TextareaFormFieldProps extends BaseFormFieldProps, React.ComponentProps<typeof Textarea> {
  type: "textarea"
}

type FormFieldProps = InputFormFieldProps | TextareaFormFieldProps

/**
 * FormField - Componente base para campos de formulário
 *
 * Unifica padrões de campos com label, erro e ajuda.
 * Mantém aparência visual idêntica aos campos existentes.
 */
export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  (
    {
      label,
      helpText,
      error,
      required = false,
      containerClassName,
      labelClassName,
      className,
      type = "input",
      ...props
    },
    ref,
  ) => {
    const fieldId = props.id || `field-${Math.random().toString(36).substr(2, 9)}`

    const renderField = () => {
      const commonProps = {
        id: fieldId,
        className: cn(error && "border-red-500 focus:border-red-500", className),
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined,
        ...props,
      }

      if (type === "textarea") {
        return <Textarea ref={ref as React.Ref<HTMLTextAreaElement>} {...commonProps} />
      }

      return <Input ref={ref as React.Ref<HTMLInputElement>} {...commonProps} />
    }

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={fieldId} className={cn(labelClassName)}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {renderField()}

        {helpText && !error && (
          <p id={`${fieldId}-help`} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}

        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

FormField.displayName = "FormField"
