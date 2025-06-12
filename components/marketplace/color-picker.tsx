"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  hasError?: boolean
  errorMessage?: string
}

/**
 * Array de cores predefinidas para seleção rápida.
 */
const presetColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
]

/**
 * Componente para seleção de cores com opções predefinidas e entrada personalizada.
 */
export function ColorPicker({ color, onChange, hasError, errorMessage }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const handleColorSelect = useCallback(
    (selectedColor: string) => {
      onChange(selectedColor)
      setOpen(false)
    },
    [onChange],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  // Memoize o conteúdo do popover para evitar re-renderizações desnecessárias
  const popoverContent = useMemo(() => {
    return (
      <PopoverContent className="w-64 p-3">
        <div className="flex flex-wrap gap-1 mb-2">
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              className={cn(
                "h-6 w-6 rounded-md flex items-center justify-center transition-all",
                color === presetColor && "ring-2 ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: presetColor }}
              onClick={() => handleColorSelect(presetColor)}
              aria-label={`Selecionar cor ${presetColor}`}
            >
              {color === presetColor && <Check className="h-4 w-4 text-white" aria-hidden="true" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md" style={{ backgroundColor: color }} aria-hidden="true" />
          <Input
            value={color}
            onChange={handleInputChange}
            className="flex-1"
            placeholder="#000000"
            aria-label="Código hexadecimal da cor"
          />
        </div>
      </PopoverContent>
    )
  }, [color, handleColorSelect, handleInputChange])

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-between", hasError && "border-red-500 focus-visible:ring-red-500")}
            onClick={handleToggle}
            aria-expanded={open}
            aria-haspopup="true"
          >
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
              <span>{color}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        {popoverContent}
      </Popover>
      {hasError && errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
    </div>
  )
}
