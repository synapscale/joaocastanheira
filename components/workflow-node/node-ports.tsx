"use client"

import type React from "react"

import type { Node } from "@/types/workflow"
import { NodePort } from "./node-port"

interface NodePortsProps {
  node: Node
  nodeHeight: number
  onPortDragStart: (e: React.MouseEvent) => void
}

export function NodePorts({ node, nodeHeight, onPortDragStart }: NodePortsProps) {
  return (
    <>
      {/* Portas de entrada - design retangular */}
      {node.inputs && node.inputs.length > 0 && (
        <div className="input-ports">
          {node.inputs.map((input: string, index: number) => (
            <NodePort
              key={`input-${input}`}
              portId={input}
              portType="input"
              nodeId={node.id}
              position={{
                top: `${nodeHeight * 0.5 + (index - (node.inputs.length - 1) / 2) * 20}px`,
                left: "-4px",
              }}
              onMouseDown={onPortDragStart}
            />
          ))}
        </div>
      )}

      {/* Portas de saída - design semi-círculo (mais delicado) */}
      {node.outputs && node.outputs.length > 0 && (
        <div className="output-ports">
          {node.outputs.map((output: string, index: number) => (
            <NodePort
              key={`output-${output}`}
              portId={output}
              portType="output"
              nodeId={node.id}
              position={{
                top: `${nodeHeight * 0.5 + (index - (node.outputs.length - 1) / 2) * 20}px`,
                right: "-4px",
              }}
              onMouseDown={onPortDragStart}
            />
          ))}
        </div>
      )}
    </>
  )
}
