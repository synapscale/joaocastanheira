import { Badge } from "@/components/ui/badge"

/**
 * Props for the NodeStatusBadge component
 */
interface NodeStatusBadgeProps {
  /** The status to display (success, error, warning) */
  status: string
  /** Optional status message to display */
  statusMessage?: string
}

/**
 * NodeStatusBadge component.
 *
 * Displays the current status of a node with an appropriate badge and message.
 */
export function NodeStatusBadge({ status, statusMessage }: NodeStatusBadgeProps) {
  // Determine the badge variant based on status
  const getBadgeVariant = () => {
    switch (status) {
      case "error":
        return "destructive"
      case "warning":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="mt-2 flex items-center">
      <Badge variant={getBadgeVariant()} className="text-[10px] h-4 px-1">
        {status}
      </Badge>

      {statusMessage && <span className="ml-1.5 text-[10px] text-muted-foreground truncate">{statusMessage}</span>}
    </div>
  )
}
