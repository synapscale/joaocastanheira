"use client"

import { useMemo } from "react"
import { PanelHeader } from "./panel-header"
import { EmptyState } from "./empty-state"
import { DataViewer } from "./data-viewer"
import { ConsoleOutput } from "./console-output"
import { Play, RefreshCw, XCircle, AlertTriangle } from "lucide-react"

interface OutputPanelProps {
  executionStatus: "idle" | "running" | "success" | "error" | "warning"
  outputData: any
  executionHistory: any[]
  consoleOutput: string[]
  setConsoleOutput: (logs: string[]) => void
  showConsole: boolean
  copyToClipboard: (text: string, message?: string) => void
  setShowMockData: (show: boolean) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

/**
 * OutputPanel component.
 *
 * A panel for displaying execution results and output data.
 */
export function OutputPanel({
  executionStatus,
  outputData,
  executionHistory,
  consoleOutput,
  setConsoleOutput,
  showConsole,
  copyToClipboard,
  setShowMockData,
  isCollapsed = false,
  onToggleCollapse,
}: OutputPanelProps) {
  // Memoize the DataViewer to prevent unnecessary re-renders
  const memoizedDataViewer = useMemo(() => {
    if (!outputData) return null
    return <DataViewer data={outputData} onCopy={(text) => copyToClipboard(text)} />
  }, [outputData, copyToClipboard])

  // Memoize the console output
  const memoizedConsoleOutput = useMemo(() => {
    if (!showConsole || consoleOutput.length === 0) return null
    return <ConsoleOutput logs={consoleOutput} onClear={() => setConsoleOutput([])} />
  }, [showConsole, consoleOutput, setConsoleOutput])

  // Memoize the error message
  const errorMessage = useMemo(() => {
    return executionHistory[0]?.error || "An error occurred during execution."
  }, [executionHistory])

  // Memoize the warning message
  const warningMessage = useMemo(() => {
    return executionHistory[0]?.warning || "There were warnings during execution."
  }, [executionHistory])

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#F0F4F9]">
      <PanelHeader title="OUTPUT" />

      {!isCollapsed && (
        <div className="flex-1 overflow-auto p-4 min-w-0">
          {executionStatus === "idle" && (
            <EmptyState
              icon={<Play className="h-6 w-6 text-muted-foreground" />}
              title="Execute this node to view data"
              description={
                <span>
                  or{" "}
                  <button className="text-blue-500 hover:underline" onClick={() => setShowMockData(true)}>
                    set mock data
                  </button>
                </span>
              }
            />
          )}

          {executionStatus === "running" && (
            <EmptyState
              icon={<RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />}
              title="Executing node..."
              description="Please wait while the node is being executed."
            />
          )}

          {executionStatus === "error" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Execution Failed</h4>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>

              {memoizedConsoleOutput}
            </div>
          )}

          {executionStatus === "warning" && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Execution Completed with Warnings</h4>
                  <p className="text-sm text-yellow-700">{warningMessage}</p>
                </div>
              </div>

              {memoizedDataViewer}
            </div>
          )}

          {executionStatus === "success" && outputData && memoizedDataViewer}
        </div>
      )}
    </div>
  )
}
