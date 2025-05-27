import { Badge } from "@/components/ui/badge"
import { NodePort } from "@/components/canvas/refined-node-port"
import type { NodePort as NodePortType } from "@/types/canvas-types"

interface NodePortSectionProps {
  title: string
  ports: NodePortType[]
  nodeId: string
  onStartConnection?: (nodeId: string, portId: string) => void
  onEndConnection?: (nodeId: string, portId: string) => void
}

export function NodePortSection({ title, ports, nodeId, onStartConnection, onEndConnection }: NodePortSectionProps) {
  if (ports.length === 0) return null

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h4>
        <Badge variant="outline" className="text-xs">
          {ports.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {ports.map((port) => (
          <NodePort
            key={port.id}
            nodeId={nodeId}
            port={port}
            onStartConnection={onStartConnection}
            onEndConnection={onEndConnection}
          />
        ))}
      </div>
    </div>
  )
}
