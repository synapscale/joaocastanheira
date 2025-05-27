"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { nanoid } from "nanoid"
import type { Variable, VariableScope, VariableUsage } from "@/types/variable"

interface VariableContextType {
  // State
  variables: Variable[]
  variableUsage: VariableUsage[]

  // CRUD operations
  addVariable: (variable: Omit<Variable, "id" | "createdAt" | "updatedAt">) => Variable
  updateVariable: (id: string, updates: Partial<Omit<Variable, "id" | "createdAt" | "updatedAt">>) => void
  deleteVariable: (id: string) => void

  // Variable operations
  getVariableById: (id: string) => Variable | undefined
  getVariableByKey: (key: string, scope?: VariableScope) => Variable | undefined
  getVariablesByScope: (scope: VariableScope) => Variable[]

  // Variable usage
  trackVariableUsage: (usage: Omit<VariableUsage, "id">) => void
  removeVariableUsage: (nodeId: string, parameterKey: string) => void
  getNodeVariableUsage: (nodeId: string) => VariableUsage[]
  getVariableUsage: (variableId: string) => VariableUsage[]

  // Variable evaluation
  evaluateExpression: (expression: string, nodeId?: string) => any
  resolveVariableValue: (variableId: string, path?: string) => any
}

const VariableContext = createContext<VariableContextType | undefined>(undefined)

// Sample system variables
const systemVariables: Variable[] = [
  {
    id: "sys-timestamp",
    name: "Timestamp",
    key: "timestamp",
    type: "expression",
    value: "() => Date.now()",
    scope: "global",
    description: "Current timestamp in milliseconds",
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystem: true,
  },
  {
    id: "sys-date",
    name: "Current Date",
    key: "currentDate",
    type: "expression",
    value: "() => new Date().toISOString()",
    scope: "global",
    description: "Current date in ISO format",
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystem: true,
  },
  {
    id: "sys-workflow-id",
    name: "Workflow ID",
    key: "workflowId",
    type: "string",
    value: "current-workflow-id",
    scope: "workflow",
    description: "ID of the current workflow",
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystem: true,
  },
  {
    id: "sys-workflow-name",
    name: "Workflow Name",
    key: "workflowName",
    type: "string",
    value: "Current Workflow",
    scope: "workflow",
    description: "Name of the current workflow",
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystem: true,
  },
]

export function VariableProvider({ children }: { children: React.ReactNode }) {
  const [variables, setVariables] = useState<Variable[]>(systemVariables)
  const [variableUsage, setVariableUsage] = useState<VariableUsage[]>([])

  // Load variables from localStorage on mount
  useEffect(() => {
    try {
      const storedVariables = localStorage.getItem("workflow-variables")
      if (storedVariables) {
        const parsedVariables = JSON.parse(storedVariables)
        // Merge with system variables, avoiding duplicates
        const mergedVariables = [
          ...systemVariables,
          ...parsedVariables.filter((v: Variable) => !systemVariables.some((sv) => sv.id === v.id)),
        ]
        setVariables(mergedVariables)
      }

      const storedUsage = localStorage.getItem("workflow-variable-usage")
      if (storedUsage) {
        setVariableUsage(JSON.parse(storedUsage))
      }
    } catch (error) {
      console.error("Failed to load variables from localStorage:", error)
    }
  }, [])

  // Save variables to localStorage when they change
  useEffect(() => {
    try {
      // Only save non-system variables
      const variablesToSave = variables.filter((v) => !v.isSystem)
      localStorage.setItem("workflow-variables", JSON.stringify(variablesToSave))
      localStorage.setItem("workflow-variable-usage", JSON.stringify(variableUsage))
    } catch (error) {
      console.error("Failed to save variables to localStorage:", error)
    }
  }, [variables, variableUsage])

  // CRUD operations
  const addVariable = useCallback((variable: Omit<Variable, "id" | "createdAt" | "updatedAt">) => {
    const newVariable: Variable = {
      ...variable,
      id: `var-${nanoid(6)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setVariables((prev) => [...prev, newVariable])
    return newVariable
  }, [])

  const updateVariable = useCallback(
    (id: string, updates: Partial<Omit<Variable, "id" | "createdAt" | "updatedAt">>) => {
      setVariables((prev) =>
        prev.map((variable) =>
          variable.id === id
            ? {
                ...variable,
                ...updates,
                updatedAt: new Date(),
              }
            : variable,
        ),
      )
    },
    [],
  )

  const deleteVariable = useCallback((id: string) => {
    // Don't allow deleting system variables
    setVariables((prev) => prev.filter((variable) => variable.id !== id || variable.isSystem))

    // Remove any usage of this variable
    setVariableUsage((prev) => prev.filter((usage) => usage.variableId !== id))
  }, [])

  // Variable operations
  const getVariableById = useCallback(
    (id: string) => {
      return variables.find((variable) => variable.id === id)
    },
    [variables],
  )

  const getVariableByKey = useCallback(
    (key: string, scope?: VariableScope) => {
      return variables.find((variable) => variable.key === key && (scope ? variable.scope === scope : true))
    },
    [variables],
  )

  const getVariablesByScope = useCallback(
    (scope: VariableScope) => {
      return variables.filter((variable) => variable.scope === scope)
    },
    [variables],
  )

  // Variable usage tracking
  const trackVariableUsage = useCallback((usage: Omit<VariableUsage, "id">) => {
    setVariableUsage((prev) => {
      // Remove any existing usage for this node parameter
      const filtered = prev.filter((u) => !(u.nodeId === usage.nodeId && u.parameterKey === usage.parameterKey))

      // Add the new usage
      return [...filtered, usage as VariableUsage]
    })
  }, [])

  const removeVariableUsage = useCallback((nodeId: string, parameterKey: string) => {
    setVariableUsage((prev) =>
      prev.filter((usage) => !(usage.nodeId === nodeId && usage.parameterKey === parameterKey)),
    )
  }, [])

  const getNodeVariableUsage = useCallback(
    (nodeId: string) => {
      return variableUsage.filter((usage) => usage.nodeId === nodeId)
    },
    [variableUsage],
  )

  const getVariableUsage = useCallback(
    (variableId: string) => {
      return variableUsage.filter((usage) => usage.variableId === variableId)
    },
    [variableUsage],
  )

  // Variable evaluation
  const resolveVariableValue = useCallback(
    (variableId: string, path?: string) => {
      const variable = getVariableById(variableId)
      if (!variable) return undefined

      let value = variable.value

      // Handle expression type variables
      if (variable.type === "expression" && typeof value === "string" && value.startsWith("() =>")) {
        try {
          // Extract the function body and evaluate it
          const functionBody = value.substring(5).trim()
          // eslint-disable-next-line no-new-func
          const evalFunction = new Function(`return ${functionBody}`)
          value = evalFunction()()
        } catch (error) {
          console.error(`Error evaluating expression for variable ${variable.name}:`, error)
          return undefined
        }
      }

      // Handle path for accessing nested properties
      if (path && (variable.type === "json" || variable.type === "array")) {
        try {
          // Parse the path and access the nested property
          const pathParts = path.split(".")
          let result = value

          for (const part of pathParts) {
            if (result === null || result === undefined) break
            result = result[part]
          }

          return result
        } catch (error) {
          console.error(`Error accessing path ${path} for variable ${variable.name}:`, error)
          return undefined
        }
      }

      return value
    },
    [getVariableById],
  )

  const evaluateExpression = useCallback(
    (expression: string, nodeId?: string) => {
      // Simple variable interpolation with {{variables.name}} syntax
      const variablePattern = /\{\{variables\.([a-zA-Z0-9_.]+)\}\}/g

      // Replace all variable references with their values
      return expression.replace(variablePattern, (match, variablePath) => {
        const [variableKey, ...pathParts] = variablePath.split(".")
        const path = pathParts.length > 0 ? pathParts.join(".") : undefined

        // Find the variable by key
        const variable = variables.find((v) => v.key === variableKey)
        if (!variable) return match // Keep the original reference if variable not found

        // Track usage if nodeId is provided
        if (nodeId) {
          trackVariableUsage({
            nodeId,
            parameterKey: "expression",
            variableId: variable.id,
          })
        }

        // Resolve the variable value
        const value = resolveVariableValue(variable.id, path)

        // Convert the value to string for interpolation
        return value !== undefined && value !== null ? String(value) : match
      })
    },
    [variables, trackVariableUsage, resolveVariableValue],
  )

  const value = {
    variables,
    variableUsage,
    addVariable,
    updateVariable,
    deleteVariable,
    getVariableById,
    getVariableByKey,
    getVariablesByScope,
    trackVariableUsage,
    removeVariableUsage,
    getNodeVariableUsage,
    getVariableUsage,
    evaluateExpression,
    resolveVariableValue,
  }

  return <VariableContext.Provider value={value}>{children}</VariableContext.Provider>
}

export function useVariables() {
  const context = useContext(VariableContext)
  if (context === undefined) {
    throw new Error("useVariables must be used within a VariableProvider")
  }
  return context
}
