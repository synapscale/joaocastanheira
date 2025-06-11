"use client"

import { useRef, useMemo } from "react"
import { PanelHeader } from "./panel-header"
import { DataViewer } from "./data-viewer"
import { Button } from "@/components/ui/button"
import { Database, Play, CheckCircle, XCircle, FileText } from "lucide-react"

interface InputPanelProps {
  inputData: any
  mockDataValue: string
  showMockData: boolean
  setShowMockData: (show: boolean) => void
  setMockDataValue: (value: string) => void
  handleExecutePrevious: () => void
  handleSetMockData: () => void
  validateJson: (json: string) => boolean
  formatJson: (json: string) => string
  copyToClipboard: (text: string, message?: string) => void
  fontSize: number
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

/**
 * InputPanel component.
 *
 * A panel for displaying and managing input data.
 */
export function InputPanel({
  inputData,
  mockDataValue,
  showMockData,
  setShowMockData,
  setMockDataValue,
  handleExecutePrevious,
  handleSetMockData,
  validateJson,
  formatJson,
  copyToClipboard,
  fontSize,
  isCollapsed = false,
  onToggleCollapse,
}: InputPanelProps) {
  const mockDataRef = useRef<HTMLTextAreaElement>(null)

  // Memoize the DataViewer to prevent unnecessary re-renders
  const memoizedDataViewer = useMemo(() => {
    if (!inputData) return null
    return <DataViewer data={inputData} onCopy={(text) => copyToClipboard(text)} />
  }, [inputData, copyToClipboard])

  // Memoize the validation result
  const isValidJson = useMemo(() => validateJson(mockDataValue), [mockDataValue, validateJson])

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#F0F4F9]">
      <PanelHeader title="INPUT" />

      {!isCollapsed && (
        <div className="flex-1 overflow-auto p-4 min-w-0">
          {showMockData ? (
            <div className="space-y-4">
              {/* Mock data editor */}
              <div className="relative">
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setMockDataValue(formatJson(mockDataValue))}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Format
                  </Button>
                </div>
                <div className="border rounded-md overflow-hidden bg-white">
                  <div className="bg-muted px-3 py-1.5 text-xs font-medium">
                    <span className="text-muted-foreground">Mock Data (JSON)</span>
                  </div>
                  <textarea
                    ref={mockDataRef}
                    value={mockDataValue}
                    onChange={(e) => setMockDataValue(e.target.value)}
                    className="w-full p-3 font-mono focus:outline-none resize-none"
                    style={{
                      minHeight: "200px",
                      fontSize: `${fontSize}px`,
                    }}
                    spellCheck="false"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  {isValidJson ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Valid JSON
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      Invalid JSON
                    </span>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMockData(false)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSetMockData} className="flex-1 sm:flex-none">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {inputData ? (
                memoizedDataViewer
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <Database className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-sm font-medium mb-1.5">No input data yet</h3>
                  <p className="text-xs text-muted-foreground mb-3 max-w-full px-1">
                    Execute previous nodes or set mock data.
                  </p>

                  {/* Buttons optimized for very narrow panels */}
                  <div className="flex flex-col w-full gap-1.5 px-1">
                    <Button
                      variant="outline"
                      onClick={handleExecutePrevious}
                      className="w-full text-xs h-8 px-2 min-w-0"
                      size="sm"
                    >
                      <Play className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Execute Previous</span>
                    </Button>
                    <Button onClick={() => setShowMockData(true)} className="w-full text-xs h-8 px-2 min-w-0" size="sm">
                      <Database className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Set Mock Data</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
