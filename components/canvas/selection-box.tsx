"use client"

import { useMemo } from "react"

interface SelectionBoxProps {
  start: { x: number; y: number }
  end: { x: number; y: number }
}

export function SelectionBox({ start, end }: SelectionBoxProps) {
  const style = useMemo(() => {
    const left = Math.min(start.x, end.x)
    const top = Math.min(start.y, end.y)
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)

    return {
      left,
      top,
      width,
      height,
    }
  }, [start, end])

  return <div className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-10" style={style} />
}
