"use client"

import { useState, useEffect, useCallback } from "react"

interface ValidationError {
  line: number
  column: number
  message: string
}

interface UseCodeValidatorReturn {
  isValid: boolean
  errors: ValidationError[]
  validateCode: () => boolean
}

/**
 * Hook para validar código
 */
export function useCodeValidator(code: string, language?: string): UseCodeValidatorReturn {
  const [isValid, setIsValid] = useState(true)
  const [errors, setErrors] = useState<ValidationError[]>([])

  /**
   * Valida código JSON
   */
  const validateJson = useCallback((json: string): ValidationError[] => {
    try {
      JSON.parse(json)
      return []
    } catch (e) {
      if (e instanceof Error) {
        // Tentar extrair informações de linha e coluna da mensagem de erro
        const match = e.message.match(/at position (\d+)/)
        const position = match ? Number.parseInt(match[1], 10) : 0

        // Calcular linha e coluna aproximadas
        let line = 1
        let column = 0
        for (let i = 0; i < position && i < json.length; i++) {
          if (json[i] === "\n") {
            line++
            column = 0
          } else {
            column++
          }
        }

        return [
          {
            line,
            column,
            message: e.message,
          },
        ]
      }
      return [
        {
          line: 0,
          column: 0,
          message: "Invalid JSON",
        },
      ]
    }
  }, [])

  /**
   * Valida código JavaScript
   */
  const validateJavaScript = useCallback((js: string): ValidationError[] => {
    try {
      // Verificação básica de sintaxe
      // Em um cenário real, você usaria uma biblioteca como eslint
      new Function(js)
      return []
    } catch (e) {
      if (e instanceof Error) {
        // Tentar extrair informações de linha e coluna da mensagem de erro
        const lineMatch = e.message.match(/line (\d+)/)
        const line = lineMatch ? Number.parseInt(lineMatch[1], 10) : 0

        return [
          {
            line,
            column: 0,
            message: e.message,
          },
        ]
      }
      return [
        {
          line: 0,
          column: 0,
          message: "Invalid JavaScript",
        },
      ]
    }
  }, [])

  /**
   * Valida código com base no tipo
   */
  const validateCode = useCallback((): boolean => {
    let newErrors: ValidationError[] = []

    switch (language?.toLowerCase()) {
      case "json":
        newErrors = validateJson(code)
        break
      case "javascript":
      case "js":
        newErrors = validateJavaScript(code)
        break
      case "typescript":
      case "ts":
        // Simplificado - em um cenário real, você usaria o TypeScript Compiler API
        newErrors = validateJavaScript(code)
        break
      default:
        // Sem validação para outros tipos
        break
    }

    setErrors(newErrors)
    setIsValid(newErrors.length === 0)
    return newErrors.length === 0
  }, [code, language, validateJson, validateJavaScript])

  // Validar o código quando ele mudar
  useEffect(() => {
    validateCode()
  }, [code, language, validateCode])

  return {
    isValid,
    errors,
    validateCode,
  }
}
