"use client"

import { useState, useCallback } from "react"
import { useVariables } from "@/context/variable-context"
import { replaceVariablesInCode, trackVariablesInCode } from "@/utils/variable-utils"
import { executeCodeSafely } from "@/services/node-execution-service"
import type { Node } from "@/types/workflow"

interface UseNodeExecutionProps {
  node: Node
  timeout?: number
  useSandbox?: boolean
}

export function useNodeExecution({ node, timeout = 5000, useSandbox = true }: UseNodeExecutionProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "error" | "warning">("idle")
  const [inputData, setInputData] = useState<any>(null)
  const [outputData, setOutputData] = useState<any>(null)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const { variables, resolveVariableValue, trackVariableUsage } = useVariables()

  // Execute the node
  const executeNode = useCallback(
    async (code: string, input: any = null) => {
      setIsExecuting(true)
      setExecutionStatus("running")
      setConsoleOutput([])

      try {
        // Set input data
        setInputData(input)

        // Track variable usage in code
        trackVariablesInCode(code, node.id, variables, trackVariableUsage)

        // Replace variable references with their values
        const processedCode = replaceVariablesInCode(code, variables, resolveVariableValue)

        // Create a function to capture console.log output
        const logs: string[] = []
        const captureConsole = (message: string) => {
          logs.push(message)
          setConsoleOutput((prev) => [...prev, message])
        }

        // Execute the code in a controlled environment
        const result = await executeCodeSafely(processedCode, input, captureConsole, timeout, useSandbox)

        // Set output data
        setOutputData(result)
        setExecutionStatus("success")

        return result
      } catch (error) {
        console.error("Error executing node:", error)
        setExecutionStatus("error")
        setConsoleOutput((prev) => [...prev, `Error: ${(error as Error).message}`])
        return null
      } finally {
        setIsExecuting(false)
      }
    },
    [node.id, timeout, useSandbox, variables, resolveVariableValue, trackVariableUsage],
  )


  // Set mock input data
  const setMockInput = useCallback((data: any) => {
    setInputData(data)
  }, [])

  // Clear execution data
  const clearExecution = useCallback(() => {
    setExecutionStatus("idle")
    setInputData(null)
    setOutputData(null)
    setConsoleOutput([])
  }, [])

  return {
    isExecuting,
    executionStatus,
    inputData,
    outputData,
    consoleOutput,
    executeNode,
    setMockInput,
    clearExecution,
    setConsoleOutput,
  }
}
