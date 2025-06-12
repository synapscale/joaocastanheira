import type { Node, Connection, Position, ConnectionType } from "@/types/workflow"

/**
 * Calcula o caminho para uma conexão entre dois nós.
 *
 * @param fromNode Nó de origem
 * @param toNode Nó de destino
 * @param type Tipo de conexão (bezier, straight, step)
 * @returns Objeto contendo o caminho SVG e as coordenadas dos pontos
 */
export function calculateConnectionPath(
  fromNode: Node,
  toNode: Node,
  type: ConnectionType = "bezier",
): {
  path: string
  fromX: number
  fromY: number
  toX: number
  toY: number
} {
  // Obter a posição de saída do nó de origem
  const startPos = getNodeOutputPosition(fromNode)

  // Obter a posição de entrada do nó de destino
  const endPos = getNodeInputPosition(toNode)

  // Calcular o caminho com base no tipo de conexão
  let path: string

  if (type === "straight") {
    path = `M ${startPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`
  } else if (type === "step") {
    const midX = (startPos.x + endPos.x) / 2
    path = `M ${startPos.x} ${startPos.y} L ${midX} ${startPos.y} L ${midX} ${endPos.y} L ${endPos.x} ${endPos.y}`
  } else {
    // Default para bezier
    path = calculateBezierPath(startPos.x, startPos.y, endPos.x, endPos.y)
  }

  return {
    path,
    fromX: startPos.x,
    fromY: startPos.y,
    toX: endPos.x,
    toY: endPos.y,
  }
}

/**
 * Calcula uma curva bezier entre dois pontos.
 * Ajusta os pontos de controle com base na distância horizontal.
 *
 * @param startX Coordenada X do ponto inicial
 * @param startY Coordenada Y do ponto inicial
 * @param endX Coordenada X do ponto final
 * @param endY Coordenada Y do ponto final
 * @returns String de caminho SVG para a curva bezier
 */
export function calculateBezierPath(startX: number, startY: number, endX: number, endY: number): string {
  // Calcular a distância entre os pontos
  const dx = Math.abs(endX - startX)
  const dy = Math.abs(endY - startY)
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Ajustar os pontos de controle com base na distância
  // Para distâncias curtas, usar um valor mínimo de 50px
  // Para distâncias longas, usar uma proporção da distância
  const controlPointOffset = Math.min(Math.max(distance * 0.25, 50), 200)

  // Calcular pontos de controle
  const controlPoint1X = startX + controlPointOffset
  const controlPoint1Y = startY
  const controlPoint2X = endX - controlPointOffset
  const controlPoint2Y = endY

  // Retornar a string de caminho SVG
  return `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`
}

/**
 * Obtém a posição da porta de saída de um nó.
 *
 * @param node O nó para obter a posição de saída
 * @returns Posição da porta de saída
 */
export function getNodeOutputPosition(node: Node): Position {
  const width = node.width || 70
  const height = node.height || 70

  return {
    x: node.position.x + width,
    y: node.position.y + height / 2,
  }
}

/**
 * Obtém a posição da porta de entrada de um nó.
 *
 * @param node O nó para obter a posição de entrada
 * @returns Posição da porta de entrada
 */
export function getNodeInputPosition(node: Node): Position {
  const height = node.height || 70

  return {
    x: node.position.x,
    y: node.position.y + height / 2,
  }
}

/**
 * Verifica se um ponto está dentro de um nó.
 *
 * @param point O ponto a verificar
 * @param node O nó para verificar
 * @param margin Margem adicional ao redor do nó (opcional)
 * @returns Verdadeiro se o ponto estiver dentro do nó
 */
export function isPointInNode(point: Position, node: Node, margin = 0): boolean {
  const width = node.width || 70
  const height = node.height || 70

  const nodeLeft = node.position.x - margin
  const nodeRight = node.position.x + width + margin
  const nodeTop = node.position.y - margin
  const nodeBottom = node.position.y + height + margin

  return point.x >= nodeLeft && point.x <= nodeRight && point.y >= nodeTop && point.y <= nodeBottom
}

/**
 * Encontra um nó em um ponto específico.
 *
 * @param point O ponto a verificar
 * @param nodes Array de nós para pesquisar
 * @param excludeNodeId ID do nó a excluir da pesquisa (opcional)
 * @param margin Margem adicional ao redor dos nós (opcional)
 * @returns O nó encontrado ou null
 */
export function findNodeAtPoint(point: Position, nodes: Node[], excludeNodeId?: string, margin = 0): Node | null {
  if (!Array.isArray(nodes) || nodes.length === 0) return null

  // Percorre os nós em ordem inversa para priorizar os nós no topo (maior z-index)
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    if (excludeNodeId && node.id === excludeNodeId) continue
    if (isPointInNode(point, node, margin)) {
      return node
    }
  }

  return null
}

/**
 * Verifica se um nó tem conexões de saída.
 *
 * @param nodeId O ID do nó a verificar
 * @param connections Array de conexões para pesquisar
 * @returns Verdadeiro se o nó tiver conexões de saída
 */
export function hasOutputConnections(nodeId: string, connections: Connection[]): boolean {
  if (!connections || !Array.isArray(connections)) return false
  return connections.some((connection) => connection.from === nodeId)
}

/**
 * Encontra o ponto médio de um caminho SVG.
 *
 * @param path Elemento de caminho SVG
 * @returns Posição do ponto médio
 */
export function findConnectionMidpoint(path: SVGPathElement): Position {
  try {
    const pathLength = path.getTotalLength()
    const point = path.getPointAtLength(pathLength / 2)
    return { x: point.x, y: point.y }
  } catch (error) {
    console.error("Erro ao encontrar o ponto médio da conexão:", error)
    return { x: 0, y: 0 }
  }
}

/**
 * Verifica se uma conexão criaria um ciclo no fluxo de trabalho.
 * Usa um algoritmo de busca em profundidade (DFS) para detectar ciclos.
 *
 * @param connections Array de conexões existentes
 * @param sourceNodeId ID do nó de origem
 * @param targetNodeId ID do nó de destino
 * @returns Verdadeiro se a conexão criar um ciclo
 */
export function wouldCreateCycle(
  connections: Array<{ from: string; to: string }>,
  sourceNodeId: string,
  targetNodeId: string,
): boolean {
  // Se conectar a si mesmo, é um ciclo
  if (sourceNodeId === targetNodeId) return true

  // Criar uma representação de grafo
  const graph: Record<string, string[]> = {}

  // Inicializar grafo
  connections.forEach((conn) => {
    if (!graph[conn.from]) graph[conn.from] = []
    graph[conn.from].push(conn.to)
  })

  // Adicionar a conexão potencial
  if (!graph[sourceNodeId]) graph[sourceNodeId] = []
  graph[sourceNodeId].push(targetNodeId)

  // Verificar ciclos usando DFS
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycle(nodeId: string): boolean {
    // Marcar o nó atual como visitado e adicionar à pilha de recursão
    visited.add(nodeId)
    recursionStack.add(nodeId)

    // Visitar todos os nós adjacentes
    const adjacentNodes = graph[nodeId] || []
    for (const adjacentNode of adjacentNodes) {
      // Se não visitado, verificar se leva a um ciclo
      if (!visited.has(adjacentNode)) {
        if (hasCycle(adjacentNode)) return true
      }
      // Se o nó adjacente estiver na pilha de recursão, há um ciclo
      else if (recursionStack.has(adjacentNode)) {
        return true
      }
    }

    // Remover da pilha de recursão
    recursionStack.delete(nodeId)
    return false
  }

  // Verificar ciclos começando de qualquer nó não visitado
  for (const nodeId of Object.keys(graph)) {
    if (!visited.has(nodeId)) {
      if (hasCycle(nodeId)) return true
    }
  }

  return false
}

/**
 * Calcula a distância entre dois pontos.
 *
 * @param point1 Primeiro ponto
 * @param point2 Segundo ponto
 * @returns Distância euclidiana entre os pontos
 */
export function calculateDistance(point1: Position, point2: Position): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Obtém todas as conexões para um nó.
 *
 * @param nodeId ID do nó para obter conexões
 * @param connections Array de conexões para pesquisar
 * @param direction Direção das conexões (entrada, saída ou ambas)
 * @returns Array de conexões para o nó
 */
export function getNodeConnections(
  nodeId: string,
  connections: Connection[],
  direction: "incoming" | "outgoing" | "both" = "both",
): Connection[] {
  if (!connections || !Array.isArray(connections)) return []

  if (direction === "incoming") {
    return connections.filter((connection) => connection.to === nodeId)
  } else if (direction === "outgoing") {
    return connections.filter((connection) => connection.from === nodeId)
  } else {
    return connections.filter((connection) => connection.from === nodeId || connection.to === nodeId)
  }
}
