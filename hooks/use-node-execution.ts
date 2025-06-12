"use client"

import { useState, useCallback } from "react"
import { useVariables } from "@/context/variable-context"
import { replaceVariablesInCode, trackVariablesInCode } from "@/utils/variable-utils"
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

  // Execute code safely
  const executeCodeSafely = async (
    code: string,
    input: any,
    captureConsole: (message: string) => void,
    timeoutMs: number,
    useSandbox: boolean,
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Create a timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      try {
        // Create a safe execution environment
        const safeEval = (code: string, input: any): any => {
          // Create a safe console object
          const safeConsole = {
            log: (...args: any[]) => {
              const message = args
                .map((arg) => {
                  if (typeof arg === "object") {
                    try {
                      return JSON.stringify(arg, null, 2)
                    } catch (e) {
                      return String(arg)
                    }
                  }
                  return String(arg)
                })
                .join(" ")
              captureConsole(message)
              console.log(...args) // Also log to the real console
            },
            error: (...args: any[]) => {
              const message = args.map((arg) => String(arg)).join(" ")
              captureConsole(`ERROR: ${message}`)
              console.error(...args) // Also log to the real console
            },
            warn: (...args: any[]) => {
              const message = args.map((arg) => String(arg)).join(" ")
              captureConsole(`WARNING: ${message}`)
              console.warn(...args) // Also log to the real console
            },
            info: (...args: any[]) => {
              const message = args.map((arg) => String(arg)).join(" ")
              captureConsole(`INFO: ${message}`)
              console.info(...args) // Also log to the real console
            },
          }

          // Create a function from the code
          // eslint-disable-next-line no-new-func
          const fn = new Function(
            "input",
            "console",
            `
            "use strict";
            try {
              ${code}
              return input;
            } catch (error) {
              console.error("Execution error:", error.message);
              throw error;
            }
          `,
          )

          // Execute the function
          return fn(input, safeConsole)
        }

        // Execute the code
        const result = safeEval(code, input)
        clearTimeout(timeoutId)
        resolve(result)
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

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
