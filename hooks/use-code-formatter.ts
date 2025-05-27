"use client"

import { useCallback } from "react"

interface UseCodeFormatterOptions {
  defaultIndent?: string
}

/**
 * Hook para formatar código
 */
export function useCodeFormatter({ defaultIndent = "  " }: UseCodeFormatterOptions = {}) {
  /**
   * Formata código JSON
   */
  const formatJson = useCallback((json: string): string => {
    try {
      const parsed = JSON.parse(json)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return json
    }
  }, [])

  /**
   * Formata código JavaScript
   */
  const formatJavaScript = useCallback(
    (code: string): string => {
      try {
        // Implementação básica de formatação
        // Em um cenário real, você usaria uma biblioteca como prettier
        const lines = code.split("\n")
        let indentLevel = 0
        const formattedLines = lines.map((line) => {
          const trimmedLine = line.trim()

          // Ajustar nível de indentação com base em chaves
          if (trimmedLine.endsWith("}") || trimmedLine.endsWith("};")) {
            indentLevel = Math.max(0, indentLevel - 1)
          }

          const indent = defaultIndent.repeat(indentLevel)
          const formattedLine = indent + trimmedLine

          if (trimmedLine.endsWith("{")) {
            indentLevel += 1
          }

          return formattedLine
        })

        return formattedLines.join("\n")
      } catch (e) {
        return code
      }
    },
    [defaultIndent],
  )

  /**
   * Formata código com base no tipo
   */
  const formatCode = useCallback(
    (code: string, language?: string): string => {
      switch (language?.toLowerCase()) {
        case "json":
          return formatJson(code)
        case "javascript":
        case "js":
          return formatJavaScript(code)
        case "typescript":
        case "ts":
          return formatJavaScript(code)
        default:
          return code
      }
    },
    [formatJson, formatJavaScript],
  )

  return {
    formatCode,
    formatJson,
    formatJavaScript,
  }
}
