"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConsoleOutputProps {
  logs: string[]
  onClear: () => void
  maxHeight?: string
}

/**
 * ConsoleOutput component.
 *
 * Displays console output logs with syntax highlighting.
 */
export function ConsoleOutput({ logs, onClear, maxHeight = "200px" }: ConsoleOutputProps) {
  if (logs.length === 0) {
    return (
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted px-3 py-1.5 text-xs font-medium flex items-center justify-between">
          <span className="text-muted-foreground">Console Output</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onClear} disabled>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <div className="p-3 text-sm text-muted-foreground">No console output yet.</div>
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted px-3 py-1.5 text-xs font-medium flex items-center justify-between">
        <span className="text-muted-foreground">Console Output</span>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onClear}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div className="bg-black text-white p-3 font-mono text-sm overflow-auto" style={{ maxHeight: maxHeight }}>
        {logs.map((log, index) => {
          // Determine if it's an error message
          const isError = log.toLowerCase().includes("error") || log.toLowerCase().includes("exception")

          // Determine if it's a warning message
          const isWarning = log.toLowerCase().includes("warning") || log.toLowerCase().includes("warn")

          // Determine if it's an info message
          const isInfo = log.toLowerCase().includes("info")

          // Apply appropriate styling based on message type
          const className = cn(
            "whitespace-pre-wrap mb-1 last:mb-0",
            isError && "text-red-400",
            isWarning && "text-yellow-400",
            isInfo && "text-blue-400",
          )

          return (
            <div key={index} className={className}>
              {log}
            </div>
          )
        })}
      </div>
    </div>
  )
}
