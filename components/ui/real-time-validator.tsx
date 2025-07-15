'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ValidationRule {
  test: (value: string) => boolean
  message: string
  type: 'error' | 'warning' | 'info'
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  info: string[]
}

export interface RealTimeValidatorProps {
  value: string
  rules: ValidationRule[]
  showValidation?: boolean
  debounceMs?: number
  className?: string
  children?: React.ReactNode
}

// Regras de validação pré-definidas
export const emailRules: ValidationRule[] = [
  {
    test: (value: string) => value.length > 0,
    message: 'Email é obrigatório',
    type: 'error'
  },
  {
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Formato de email inválido',
    type: 'error'
  },
  {
    test: (value: string) => value.length >= 5,
    message: 'Email deve ter pelo menos 5 caracteres',
    type: 'warning'
  },
  {
    test: (value: string) => !value.includes(' '),
    message: 'Email não pode conter espaços',
    type: 'error'
  }
]

export const passwordRules: ValidationRule[] = [
  {
    test: (value: string) => value.length > 0,
    message: 'Senha é obrigatória',
    type: 'error'
  },
  {
    test: (value: string) => value.length >= 8,
    message: 'Senha deve ter pelo menos 8 caracteres',
    type: 'error'
  },
  {
    test: (value: string) => /[A-Z]/.test(value),
    message: 'Deve conter pelo menos uma letra maiúscula',
    type: 'warning'
  },
  {
    test: (value: string) => /[a-z]/.test(value),
    message: 'Deve conter pelo menos uma letra minúscula',
    type: 'warning'
  },
  {
    test: (value: string) => /[0-9]/.test(value),
    message: 'Deve conter pelo menos um número',
    type: 'warning'
  },
  {
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
    message: 'Deve conter pelo menos um caractere especial',
    type: 'info'
  }
]

export const RealTimeValidator: React.FC<RealTimeValidatorProps> = ({
  value,
  rules,
  showValidation = false,
  debounceMs = 300,
  className,
  children
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    info: []
  })
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (!showValidation) return

    const timer = setTimeout(() => {
      setIsValidating(true)
      
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        info: []
      }

      rules.forEach(rule => {
        const isRulePassing = rule.test(value)
        
        if (!isRulePassing) {
          result.isValid = false
          
          switch (rule.type) {
            case 'error':
              result.errors.push(rule.message)
              break
            case 'warning':
              result.warnings.push(rule.message)
              break
            case 'info':
              result.info.push(rule.message)
              break
          }
        }
      })

      setValidation(result)
      setIsValidating(false)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [value, rules, showValidation, debounceMs])

  if (!showValidation) {
    return <>{children}</>
  }

  return (
    <div className={cn('space-y-2', className)}>
      {children}
      
      {/* Indicador de validação */}
      {showValidation && (
        <div className="space-y-2">
          {/* Status geral */}
          <div className="flex items-center gap-2">
            {isValidating ? (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                Validando...
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm">
                {validation.isValid ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Válido</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">Inválido</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mensagens de erro */}
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                  <X className="w-3 h-3" />
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Mensagens de aviso */}
          {validation.warnings.length > 0 && (
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-yellow-600">
                  <AlertCircle className="w-3 h-3" />
                  {warning}
                </div>
              ))}
            </div>
          )}

          {/* Mensagens informativas */}
          {validation.info.length > 0 && (
            <div className="space-y-1">
              {validation.info.map((info, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                  <AlertCircle className="w-3 h-3" />
                  {info}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente de input com validação integrada
export interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  rules: ValidationRule[]
  showValidation?: boolean
  debounceMs?: number
  errorClassName?: string
  successClassName?: string
  warningClassName?: string
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  rules,
  showValidation = false,
  debounceMs = 300,
  errorClassName = 'border-red-500 focus:border-red-500 focus:ring-red-500',
  successClassName = 'border-green-500 focus:border-green-500 focus:ring-green-500',
  warningClassName = 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500',
  className,
  value = '',
  onChange,
  ...props
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    info: []
  })
  const [showPassword, setShowPassword] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)

  useEffect(() => {
    if (!showValidation) return

    const timer = setTimeout(() => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        info: []
      }

      rules.forEach(rule => {
        const isRulePassing = rule.test(value as string)
        
        if (!isRulePassing) {
          result.isValid = false
          
          switch (rule.type) {
            case 'error':
              result.errors.push(rule.message)
              break
            case 'warning':
              result.warnings.push(rule.message)
              break
            case 'info':
              result.info.push(rule.message)
              break
          }
        }
      })

      setValidation(result)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [value, rules, showValidation, debounceMs])

  const getInputClassName = () => {
    if (!showValidation || !hasFocus) return className

    if (validation.errors.length > 0) {
      return cn(className, errorClassName)
    }
    if (validation.warnings.length > 0) {
      return cn(className, warningClassName)
    }
    if (validation.isValid && (value as string).length > 0) {
      return cn(className, successClassName)
    }
    
    return className
  }

  const isPassword = props.type === 'password'
  const inputType = isPassword && showPassword ? 'text' : props.type

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          {...props}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          className={getInputClassName()}
        />
        
        {/* Indicador de validação no campo */}
        {showValidation && hasFocus && (value as string).length > 0 && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            
            {validation.isValid ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Mensagens de validação */}
      {showValidation && hasFocus && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600">
              <X className="w-3 h-3" />
              {error}
            </div>
          ))}
          
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-yellow-600">
              <AlertCircle className="w-3 h-3" />
              {warning}
            </div>
          ))}
          
          {validation.info.map((info, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
              <AlertCircle className="w-3 h-3" />
              {info}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook para usar validação em tempo real
export const useRealTimeValidation = (value: string, rules: ValidationRule[], debounceMs: number = 300) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    info: []
  })
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    setIsValidating(true)
    
    const timer = setTimeout(() => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        info: []
      }

      rules.forEach(rule => {
        const isRulePassing = rule.test(value)
        
        if (!isRulePassing) {
          result.isValid = false
          
          switch (rule.type) {
            case 'error':
              result.errors.push(rule.message)
              break
            case 'warning':
              result.warnings.push(rule.message)
              break
            case 'info':
              result.info.push(rule.message)
              break
          }
        }
      })

      setValidation(result)
      setIsValidating(false)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [value, rules, debounceMs])

  return { validation, isValidating }
} 