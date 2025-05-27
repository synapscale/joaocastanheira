import { useCanvas } from "@/contexts/canvas-context"
import { cn } from "@/lib/utils"

export function MiniCanvas() {
  const { nodes = [], viewport, setViewport } = useCanvas()

  // Se não houver nodes, não renderiza o mini-canvas
  if (nodes.length === 0) {
    return null
  }

  // Calcula os limites do canvas
  const bounds = nodes.reduce(
    (acc, node) => {
      return {
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, node.position.x + 200), // Assume largura do node
        maxY: Math.max(acc.maxY, node.position.y + 100), // Assume altura do node
      }
    },
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  )

  // Adiciona margem
  const margin = 100
  bounds.minX -= margin
  bounds.minY -= margin
  bounds.maxX += margin
  bounds.maxY += margin

  // Calcula dimensões
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY

  // Calcula escala para o mini-canvas
  const miniWidth = 150
  const miniHeight = 100
  const scaleX = miniWidth / width
  const scaleY = miniHeight / height
  const scale = Math.min(scaleX, scaleY)

  // Calcula a viewport visível
  const viewportWidth = window.innerWidth / viewport.zoom
  const viewportHeight = window.innerHeight / viewport.zoom
  const viewportLeft = -viewport.x / viewport.zoom
  const viewportTop = -viewport.y / viewport.zoom

  // Calcula a posição da viewport no mini-canvas
  const viewportMiniLeft = (viewportLeft - bounds.minX) * scale
  const viewportMiniTop = (viewportTop - bounds.minY) * scale
  const viewportMiniWidth = viewportWidth * scale
  const viewportMiniHeight = viewportHeight * scale

  return (
    <div className="w-[150px] h-[100px] bg-white dark:bg-slate-800 rounded-md shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="relative w-full h-full">
        {/* Nodes no mini-canvas */}
        {nodes.map((node) => {
          const nodeX = (node.position.x - bounds.minX) * scale
          const nodeY = (node.position.y - bounds.minY) * scale
          const nodeWidth = 10 // Tamanho fixo para representação
          const nodeHeight = 6

          return (
            <div
              key={node.id}
              className="absolute bg-blue-500 rounded-sm"
              style={{
                left: `${nodeX}px`,
                top: `${nodeY}px`,
                width: `${nodeWidth}px`,
                height: `${nodeHeight}px`,
              }}
            />
          )
        })}

        {/* Viewport visível */}
        <div
          className={cn("absolute border-2 border-blue-600 bg-blue-500/20", "cursor-move")}
          style={{
            left: `${viewportMiniLeft}px`,
            top: `${viewportMiniTop}px`,
            width: `${viewportMiniWidth}px`,
            height: `${viewportMiniHeight}px`,
          }}
        />
      </div>
    </div>
  )
}
