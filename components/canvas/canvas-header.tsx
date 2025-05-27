"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeSelector } from "@/components/canvas/theme-selector"
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  Share2,
  Settings,
  Grid3X3,
  Maximize,
  Search,
  Plus,
  Save,
  Menu,
} from "lucide-react"
import { useCanvas } from "@/contexts/canvas-context"

export function CanvasHeader() {
  const { viewport, zoomIn, zoomOut, resetViewport } = useCanvas()

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 z-50 shadow-sm">
      {/* Left section - Title and project controls */}
      <div className="flex items-center gap-3 mr-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
            <Grid3X3 className="h-3.5 w-3.5 text-white" />
          </div>
          <h1 className="font-semibold text-base text-slate-900 dark:text-slate-100">Canvas Editor</h1>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Salvar
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Menu className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Center section - Canvas controls */}
      <div className="flex-1 flex items-center justify-center gap-6">
        {/* History controls */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled>
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled>
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-r-none" onClick={() => zoomOut?.()}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <div className="px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border-x border-slate-200 dark:border-slate-600 min-w-[3rem] text-center">
            {Math.round(viewport.zoom * 100)}%
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-l-none" onClick={() => zoomIn?.()}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* View controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Resetar visualização"
            onClick={() => resetViewport?.()}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Ajustar à tela">
            <Maximize className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Buscar">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Right section - Actions and settings */}
      <div className="flex items-center gap-3">
        {/* Canvas stats - Moved to right */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          <Badge variant="outline" className="h-5 px-2 text-xs font-medium">
            Nodes: 0
          </Badge>
          <Badge variant="outline" className="h-5 px-2 text-xs font-medium">
            Pos: 0,0
          </Badge>
        </div>

        <Separator orientation="vertical" className="h-6 hidden md:block" />

        {/* File operations */}
        <div className="hidden lg:flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Upload className="h-3.5 w-3.5 mr-1" />
            Importar
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />
            Exportar
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Share2 className="h-3.5 w-3.5 mr-1" />
            Compartilhar
          </Button>
        </div>

        {/* Quick add - Moved to right */}
        <Button variant="outline" size="sm" className="h-7 px-3 hidden md:flex">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Adicionar
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Theme and settings */}
        <ThemeSelector />
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  )
}
