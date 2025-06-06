/**
 * Utility functions for working with variables in code
 */

import type { Variable } from "@/types/variable"

/**
 * Replaces variable references in code with their actual values
 * @param code The code containing variable references
 * @param variables The variables to use for replacement
 * @param resolveVariableValue Function to resolve variable values
 * @returns The code with variable references replaced
 */
export function replaceVariablesInCode(
  code: string,
  variables: Variable[],
  resolveVariableValue: (variableId: string, path?: string) => any,
): string {
  // Replace $variables.key with actual values
  const variablePattern = /\$variables\.([a-zA-Z0-9_]+)(\.[a-zA-Z0-9_]+)?/g

  return code.replace(variablePattern, (match, key, path) => {
    const variable = variables.find((v) => v.key === key)
    if (!variable) return match

    const pathString = path ? path.substring(1) : undefined
    const value = resolveVariableValue(variable.id, pathString)

    // Format the value based on its type
    if (typeof value === "string") {
      return `"${value}"`
    } else if (typeof value === "object") {
      try {
        return JSON.stringify(value)
      } catch (e) {
        return String(value)
      }
    } else {
      return String(value)
    }
  })
}

/**
 * Extracts variable references from code
 * @param code The code to extract variable references from
 * @returns An array of variable keys referenced in the code
 */
export function extractVariableReferences(code: string): string[] {
  const variablePattern = /\$variables\.([a-zA-Z0-9_]+)(\.[a-zA-Z0-9_]+)?/g
  const matches = code.matchAll(variablePattern)
  const variableKeys = new Set<string>()

  for (const match of matches) {
    if (match[1]) {
      variableKeys.add(match[1])
    }
  }

  return Array.from(variableKeys)
}

/**
 * Tracks variable usage in code
 * @param code The code to analyze
 * @param nodeId The ID of the node using the variables
 * @param variables The available variables
 * @param trackVariableUsage Function to track variable usage
 */
export function trackVariablesInCode(
  code: string,
  nodeId: string,
  variables: Variable[],
  trackVariableUsage: (usage: { nodeId: string; parameterKey: string; variableId: string }) => void,
): void {
  const variableKeys = extractVariableReferences(code)

  variableKeys.forEach((key) => {
    const variable = variables.find((v) => v.key === key)
    if (variable) {
      trackVariableUsage({
        nodeId,
        parameterKey: "code",
        variableId: variable.id,
      })
    }
  })
}

/**
 * Validates variable references in code
 * @param code The code to validate
 * @param variables The available variables
 * @returns An object with validation results
 */
export function validateVariableReferences(
  code: string,
  variables: Variable[],
): { isValid: boolean; unknownVariables: string[] } {
  const variableKeys = extractVariableReferences(code)
  const unknownVariables: string[] = []

  variableKeys.forEach((key) => {
    const variable = variables.find((v) => v.key === key)
    if (!variable) {
      unknownVariables.push(key)
    }
  })

  return {
    isValid: unknownVariables.length === 0,
    unknownVariables,
  }
}
