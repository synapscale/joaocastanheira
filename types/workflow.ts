/**
 * Definições de tipos principais para o editor de fluxo de trabalho.
 */

/**
 * Tipo de posição representando coordenadas x e y
 */
export interface Position {
  x: number
  y: number
}

/**
 * Tipo de ponto de conexão para entradas/saídas de nós
 */
export interface ConnectionPoint {
  nodeId: string
  portId: string
  type: "input" | "output"
  position?: Position
}

/**
 * Opções de estilo de nó
 */
export interface NodeStyle {
  color?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  shadow?: boolean
  opacity?: number
}

/**
 * Opções de estilo de conexão
 */
export interface ConnectionStyle {
  color?: string
  width?: number
  dashed?: boolean
  animated?: boolean
  opacity?: number
}

/**
 * Tipos de conexão suportados
 */
export type ConnectionType = "bezier" | "straight" | "step"

/**
 * Tipo de nó representando um nó de fluxo de trabalho
 */
export interface Node {
  id: string
  type: string
  name: string
  description?: string
  position: Position
  width?: number
  height?: number
  inputs: string[]
  outputs: string[]
  data?: Record<string, any>
  style?: NodeStyle
  locked?: boolean
  disabled?: boolean
  groupId?: string
  zIndex?: number
  hidden?: boolean
}

/**
 * Tipo de conexão representando uma conexão entre nós
 */
export interface Connection {
  id: string
  from: string
  to: string
  type: ConnectionType
  label?: string
  fromPort?: string
  toPort?: string
  style?: ConnectionStyle
  data?: Record<string, any>
  disabled?: boolean
}

/**
 * Informações de menu de contexto para nós
 */
export interface ContextMenuInfo {
  nodeIds: string[]
  position: Position
}

/**
 * Informações de menu de contexto para conexões
 */
export interface ConnectionContextMenuInfo {
  connectionId: string
  position: Position
}

/**
 * Informações de menu de contexto para canvas
 */
export interface CanvasContextMenuInfo {
  position: Position
  canvasPosition: Position
}

/**
 * Informações de caixa de seleção
 */
export interface SelectionBox {
  start: Position
  end: Position
}

/**
 * Status de execução de fluxo de trabalho
 */
export type ExecutionStatus = "idle" | "running" | "success" | "error" | "warning"

/**
 * Item de histórico de execução de fluxo de trabalho
 */
export interface ExecutionHistoryItem {
  id: string
  time: Date
  status: ExecutionStatus
  duration: string
  input?: any
  output?: any
  error?: string
  warning?: string
}

/**
 * Tipo de fluxo de trabalho representando o fluxo de trabalho inteiro
 */
export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: Node[]
  connections: Connection[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  version: number
  tags?: string[]
}

/**
 * Categoria de nó para o painel de nós
 */
export interface NodeCategory {
  id: string
  name: string
  nodes: {
    id: string
    name: string
    description: string
    icon: string
  }[]
}

/**
 * Props para o componente de painel de nós
 */
export interface NodePanelProps {
  onClose: () => void
  position?: Position | null
  onAddNode?: (type: string, data: any) => void
}

/**
 * Template de nó para criar novos nós
 */
export interface NodeTemplate {
  id: string
  name: string
  type: string
  category: string
  description: string
  inputs: string[]
  outputs: string[]
  icon?: string
}

/**
 * Tipos de nó suportados
 */
export type NodeType = "trigger" | "ai" | "integration" | "action" | "filter" | "code" | "edit" | "wait"

/**
 * Estado de transformação do canvas
 */
export interface CanvasTransform {
  x: number
  y: number
  zoom: number
  animated?: boolean
}

/**
 * Estado de arrasto de conexão
 */
export interface ConnectionDragState {
  sourceNodeId: string
  startX: number
  startY: number
  endX: number
  endY: number
  isValidTarget: boolean
  targetNodeId?: string
}

/**
 * Estado de arrasto de porta
 */
export interface PortConnectionDragState extends ConnectionDragState {
  sourcePortId: string
  sourcePortType: "input" | "output"
}

/**
 * Estado de edição de rótulo de conexão
 */
export interface LabelEditorState {
  connectionId: string
  position: Position
}

/**
 * Utility to map API Workflow (from apiService) to UI Workflow type (for components)
 */
export function mapApiWorkflowToUiWorkflow(apiWorkflow: import("@/lib/api/service").Workflow): Workflow {
  return {
    id: apiWorkflow.id,
    name: apiWorkflow.name,
    description: apiWorkflow.description,
    nodes: [], // Not present in API response
    connections: [], // Not present in API response
    createdAt: apiWorkflow.created_at ? new Date(apiWorkflow.created_at) : new Date(),
    updatedAt: apiWorkflow.updated_at ? new Date(apiWorkflow.updated_at) : new Date(),
    isActive: apiWorkflow.status === "active",
    version: parseInt(apiWorkflow.version) || 1,
    tags: apiWorkflow.tags,
  };
}
