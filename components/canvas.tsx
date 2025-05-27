"use client"

// Simplificar o componente Canvas para evitar conflitos
import { useRef, useState } from "react"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"

export function Canvas() {
  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2))
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5))
  const resetZoom = () => setZoom(1)

  return (
    <div className="relative h-full overflow-hidden bg-gray-50">
      <div
        ref={canvasRef}
        className="h-full w-full overflow-auto"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <div className="relative w-[2000px] h-[1500px]">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium mb-2">Canvas Component</h2>
            <p>This is a simplified canvas component.</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 flex bg-white rounded-md shadow-md">
        <button onClick={zoomIn} className="p-2 hover:bg-gray-100 text-gray-600" title="Zoom In">
          <ZoomIn size={18} />
        </button>
        <button onClick={zoomOut} className="p-2 hover:bg-gray-100 text-gray-600" title="Zoom Out">
          <ZoomOut size={18} />
        </button>
        <button onClick={resetZoom} className="p-2 hover:bg-gray-100 text-gray-600" title="Reset View">
          <Maximize size={18} />
        </button>
      </div>
    </div>
  )
}
