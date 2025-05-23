"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect, useRef } from "react"

/**
 * Tipo para os valores do formulário
 */
export type FormValues = Record<string, any>

/**
 * Tipo para os erros do formulário
 */
export type FormErrors<T extends FormValues> = Partial<Record<keyof T, string>>

/**
 * Tipo para os campos tocados do formulário
 */
export type FormTouched<T extends FormValues> = Partial<Record<keyof T, boolean>>

/**
 * Tipo para a função de validação
 */
export type FormValidator<T extends FormValues> = (values: T) => FormErrors<T>

/**
 * Tipo para a função de envio
 */
export type FormSubmitHandler<T extends FormValues> = (values: T) => void | Promise<void>

/**
 * Opções para o hook useForm
 */
export interface FormOptions<T extends FormValues> {
  /**
   * Valores iniciais do formulário
   * @example initialValues: { name: "", email: "" }
   */
  initialValues: T

  /**
   * Função chamada quando o formulário é enviado
   * @example onSubmit: (values) => saveUser(values)
   */
  onSubmit?: FormSubmitHandler<T>

  /**
   * Função para validar os valores do formulário
   * @example validate: (values) => { const errors = {}; if (!values.name) errors.name = "Nome obrigatório"; return errors; }
   */
  validate?: FormValidator<T>

  /**
   * Se verdadeiro, valida o formulário em tempo real
   * @default false
   * @example validateOnChange: true
   */
  validateOnChange?: boolean

  /**
   * Se verdadeiro, valida o formulário quando um campo perde o foco
   * @default true
   * @example validateOnBlur: false
   */
  validateOnBlur?: boolean

  /**
   * Se verdadeiro, valida o formulário quando é montado
   * @default false
   * @example validateOnMount: true
   */
  validateOnMount?: boolean

  /**
   * Se verdadeiro, redefine o formulário após o envio bem-sucedido
   * @default false
   * @example resetOnSubmit: true
   */
  resetOnSubmit?: boolean

  /**
   * Função chamada quando o formulário é redefinido
   * @example onReset: () => console.log("Formulário redefinido")
   */
  onReset?: () => void

  /**
   * Função chamada quando ocorre um erro no envio
   * @example onError: (error) => console.error("Erro no envio:", error)
   */
  onError?: (error: any) => void

  /**
   * Função chamada quando um campo é alterado
   * @example onChange: (field, value) => console.log(`Campo ${field} alterado para ${value}`)
   */
  onChange?: (field: keyof T, value: any) => void

  /**
   * Função chamada quando um campo perde o foco
   * @example onBlur: (field) => console.log(`Campo ${field} perdeu o foco`)
   */
  onBlur?: (field: keyof T) => void

  /**
   * Função chamada antes da validação
   * @example beforeValidate: (values) => ({ ...values, name: values.name.trim() })
   */
  beforeValidate?: (values: T) => T

  /**
   * Função chamada antes do envio
   * @example beforeSubmit: (values) => ({ ...values, timestamp: Date.now() })
   */
  beforeSubmit?: (values: T) => T

  /**
   * Função chamada após o envio bem-sucedido
   * @example afterSubmit: (values) => navigate("/success")
   */
  afterSubmit?: (values: T) => void

  /**
   * Tempo de debounce para validação em milissegundos
   * @default 300
   * @example debounceValidation: 500
   */
  debounceValidation?: number
}

/**
 * Tipo para o retorno do hook useForm
 */
export interface FormReturn<T extends FormValues> {
  /**
   * Valores atuais do formulário
   */
  values: T

  /**
   * Erros do formulário
   */
  errors: FormErrors<T>

  /**
   * Campos tocados do formulário
   */
  touched: FormTouched<T>

  /**
   * Se verdadeiro, o formulário está sendo enviado
   */
  isSubmitting: boolean

  /**
   * Se verdadeiro, o formulário foi enviado pelo menos uma vez
   */
  isSubmitted: boolean

  /**
   * Se verdadeiro, o formulário é válido
   */
  isValid: boolean

  /**
   * Se verdadeiro, o formulário foi modificado
   */
  isDirty: boolean

  /**
   * Função para alterar o valor de um campo
   * @param field Campo a ser alterado
   * @param value Novo valor
   */
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void

  /**
   * Função para marcar um campo como tocado
   * @param field Campo a ser marcado
   */
  handleBlur: (field: keyof T) => void

  /**
   * Função para enviar o formulário
   * @param e Evento de envio (opcional)
   */
  handleSubmit: (e?: React.FormEvent) => Promise<void>

  /**
   * Função para redefinir o formulário
   * @param newValues Novos valores (opcional)
   */
  reset: (newValues?: T) => void

  /**
   * Função para definir os valores do formulário
   * @param values Novos valores ou função para atualizar os valores
   */
  setValues: React.Dispatch<React.SetStateAction<T>>

  /**
   * Função para definir os erros do formulário
   * @param errors Novos erros ou função para atualizar os erros
   */
  setErrors: React.Dispatch<React.SetStateAction<FormErrors<T>>>

  /**
   * Função para definir os campos tocados do formulário
   * @param touched Novos campos tocados ou função para atualizar os campos tocados
   */
  setTouched: React.Dispatch<React.SetStateAction<FormTouched<T>>>

  /**
   * Função para validar o formulário
   * @returns Erros do formulário
   */
  validateForm: () => FormErrors<T>

  /**
   * Função para validar um campo específico
   * @param field Campo a ser validado
   * @returns Erro do campo ou undefined
   */
  validateField: (field: keyof T) => string | undefined

  /**
   * Função para obter as props de um campo
   * @param field Campo
   * @returns Props do campo
   */
  getFieldProps: <K extends keyof T>(
    field: K,
  ) => {
    name: string
    value: T[K]
    onChange: (e: React.ChangeEvent<any>) => void
    onBlur: () => void
    "aria-invalid": boolean
    "aria-describedby"?: string
  }
}

/**
 * Hook para gerenciar formulários com validação
 *
 * Este hook fornece uma API completa para gerenciar formulários, incluindo
 * validação, manipulação de erros, envio e redefinição.
 *
 * @param options Opções do formulário
 * @returns Objeto com valores, erros, manipuladores e estado do formulário
 *
 * @example
 * // Formulário básico
 * const form = useForm({
 *   initialValues: { name: "", email: "" },
 *   onSubmit: (values) => saveUser(values),
 *   validate: (values) => {
 *     const errors = {};
 *     if (!values.name) errors.name = "Nome obrigatório";
 *     if (!values.email) errors.email = "Email obrigatório";
 *     return errors;
 *   }
 * });
 *
 * // Uso no JSX
 * <form onSubmit={form.handleSubmit}>
 *   <input
 *     value={form.values.name}
 *     onChange={(e) => form.handleChange("name", e.target.value)}
 *     onBlur={() => form.handleBlur("name")}
 *   />
 *   {form.touched.name && form.errors.name && <div>{form.errors.name}</div>}
 *
 *   <button type="submit" disabled={form.isSubmitting}>Enviar</button>
 * </form>
 *
 * // Uso com getFieldProps
 * <input {...form.getFieldProps("name")} />
 */
export function useForm<T extends FormValues>(options: FormOptions<T>): FormReturn<T> {
  const {
    initialValues,
    onSubmit,
    validate,
    validateOnChange = false,
    validateOnBlur = true,
    validateOnMount = false,
    resetOnSubmit = false,
    onReset,
    onError,
    onChange,
    onBlur,
    beforeValidate,
    beforeSubmit,
    afterSubmit,
    debounceValidation = 300,
  } = options

  // Estado para os valores do formulário
  const [values, setValues] = useState<T>(initialValues)

  // Estado para os erros do formulário
  const [errors, setErrors] = useState<FormErrors<T>>({})

  // Estado para indicar se o formulário está sendo enviado
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para indicar se o formulário foi enviado
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Estado para os campos tocados
  const [touched, setTouched] = useState<FormTouched<T>>({})

  // Referência para os valores iniciais
  const initialValuesRef = useRef(initialValues)

  // Referência para o temporizador de debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Verificar se o formulário foi modificado
  const isDirty = useMemo(() => {
    return Object.keys(initialValuesRef.current).some(
      (key) => values[key as keyof T] !== initialValuesRef.current[key as keyof T],
    )
  }, [values])

  // Validar o formulário
  const validateForm = useCallback(() => {
    if (!validate) return {}

    // Aplicar transformações antes da validação
    const valuesToValidate = beforeValidate ? beforeValidate(values) : values

    const validationErrors = validate(valuesToValidate)
    setErrors(validationErrors)
    return validationErrors
  }, [values, validate, beforeValidate])

  // Validar um campo específico
  const validateField = useCallback(
    (field: keyof T) => {
      if (!validate) return undefined

      // Aplicar transformações antes da validação
      const valuesToValidate = beforeValidate ? beforeValidate(values) : values

      const validationErrors = validate(valuesToValidate)
      const fieldError = validationErrors[field]

      setErrors((prev) => ({
        ...prev,
        [field]: fieldError,
      }))

      return fieldError
    },
    [values, validate, beforeValidate],
  )

  // Verificar se o formulário é válido
  const isValid = useMemo(() => {
    if (!validate) return true

    // Aplicar transformações antes da validação
    const valuesToValidate = beforeValidate ? beforeValidate(values) : values

    const validationErrors = validate(valuesToValidate)
    return Object.keys(validationErrors).length === 0
  }, [values, validate, beforeValidate])

  // Validar o formulário na montagem
  useEffect(() => {
    if (validateOnMount && validate) {
      validateForm()
    }
  }, [validateOnMount, validate, validateForm])

  // Atualizar um campo específico
  const handleChange = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }))

      // Marcar o campo como tocado
      setTouched((prev) => ({ ...prev, [field]: true }))

      // Chamar o callback onChange
      if (onChange) {
        onChange(field, value)
      }

      // Validar o campo se necessário
      if (validateOnChange && validate) {
        // Cancelar o temporizador anterior
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        // Configurar um novo temporizador
        debounceTimerRef.current = setTimeout(() => {
          validateField(field)
        }, debounceValidation)
      }
    },
    [onChange, validateOnChange, validate, validateField, debounceValidation],
  )

  // Marcar um campo como tocado
  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      // Chamar o callback onBlur
      if (onBlur) {
        onBlur(field)
      }

      // Validar o campo se necessário
      if (validateOnBlur && validate) {
        validateField(field)
      }
    },
    [onBlur, validateOnBlur, validate, validateField],
  )

  // Manipulador de envio do formulário
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      // Marcar o formulário como enviado
      setIsSubmitted(true)

      // Marcar todos os campos como tocados
      const allTouched = Object.keys(values).reduce(
        (acc, key) => {
          acc[key as keyof T] = true
          return acc
        },
        {} as Record<keyof T, boolean>,
      )

      setTouched(allTouched)

      // Validar o formulário
      const validationErrors = validateForm()

      // Se houver erros, não enviar
      if (Object.keys(validationErrors).length > 0) {
        return
      }

      // Enviar o formulário
      if (onSubmit) {
        setIsSubmitting(true)

        try {
          // Aplicar transformações antes do envio
          const valuesToSubmit = beforeSubmit ? beforeSubmit(values) : values

          await onSubmit(valuesToSubmit)

          // Chamar o callback afterSubmit
          if (afterSubmit) {
            afterSubmit(valuesToSubmit)
          }

          // Redefinir o formulário se necessário
          if (resetOnSubmit) {
            reset()
          }
        } catch (error) {
          // Chamar o callback onError
          if (onError) {
            onError(error)
          } else {
            console.error("Erro ao enviar o formulário:", error)
          }
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [values, validateForm, onSubmit, beforeSubmit, afterSubmit, resetOnSubmit, onError],
  )

  // Redefinir o formulário
  const reset = useCallback(
    (newValues = initialValuesRef.current) => {
      setValues(newValues)
      setErrors({})
      setTouched({})
      setIsSubmitting(false)
      setIsSubmitted(false)

      // Chamar o callback onReset
      if (onReset) {
        onReset()
      }
    },
    [onReset],
  )

  // Obter as props de um campo
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => {
      return {
        name: String(field),
        value: values[field],
        onChange: (e: React.ChangeEvent<any>) => {
          const target = e.target
          const value = target.type === "checkbox" ? target.checked : target.value
          handleChange(field, value)
        },
        onBlur: () => handleBlur(field),
        "aria-invalid": !!errors[field],
        "aria-describedby": errors[field] ? `${String(field)}-error` : undefined,
      }
    },
    [values, errors, handleChange, handleBlur],
  )

  // Limpar o temporizador de debounce ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
    setTouched,
    validateForm,
    validateField,
    getFieldProps,
  }
}
