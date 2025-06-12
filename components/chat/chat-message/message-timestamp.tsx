import { cn } from "@/lib/utils"
import { formatTimestamp } from "./utils"

interface MessageTimestampProps {
  timestamp: number
  className?: string
  isMobile?: boolean
}

export function MessageTimestamp({ timestamp, className, isMobile = false }: MessageTimestampProps) {
  return (
    <div
      className={cn("text-xs text-gray-400", isMobile ? "mt-1 md:hidden" : "hidden md:inline-block ml-2", className)}
    >
      {formatTimestamp(timestamp)}
    </div>
  )
}

// Adicionar export default para compatibilidade com importações existentes
export default MessageTimestamp
