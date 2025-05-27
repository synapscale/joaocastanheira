import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NodeFooterProps {
  nodeId: string
  isConnected?: boolean
}

/**
 * Footer component for canvas nodes
 */
export function NodeFooter({ nodeId, isConnected = true }: NodeFooterProps) {
  return (
    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} shadow-sm`}></div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {isConnected ? "Conectado" : "Desconectado"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">#{nodeId.slice(-6)}</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
