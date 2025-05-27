"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ActionButton } from "@/components/ui/base/action-button"
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo,
  Undo2,
  Redo,
  Redo2,
  Download,
  Save,
  Play,
  Focus,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

// Importação condicional do contexto do canvas
let useCanvas: any = () => null
try {
  useCanvas = require("@/contexts/canvas-context").useCanvas
} catch (error) {
  console.warn("Canvas context not available, using props only")
}

/**
 * Configuração de botão da toolbar - estrutura unificada
 */
export interface ToolbarButtonConfig {
  id: string
  icon: ReactNode
  label?: string
  tooltip: string
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  visible?: boolean
  isLoading?: boolean
}

/**
 * Grupo de botões da toolbar - organização lógica
 */
export interface ToolbarButtonGroup {
  id: string
  title?: string
  buttons: ToolbarButtonConfig[]
  visible?: boolean
}

/**
 * Tipos para configuração visual da toolbar
 */
export type ToolbarPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
export type ToolbarOrientation = "horizontal" | "vertical"
export type ToolbarVariant = "minimal" | "compact" | "standard" | "expanded" | "floating" | "integrated"

/**
 * Props do componente principal - interface completa
 */
export interface UnifiedCanvasToolbarProps {
  // Configuração visual
  variant?: ToolbarVariant
  position?: ToolbarPosition
  orientation?: ToolbarOrientation
  className?: string
  collapsible?: boolean
  initialCollapsed?: boolean
  showLabels?: boolean
  showTooltips?: boolean
  showShortcuts?: boolean

  // Estado do canvas
  viewport?: { x: number; y: number; zoom: number }
  canUndo?: boolean
  canRedo?: boolean
  gridEnabled?: boolean
  snapToGrid?: boolean
  nodeCount?: number
  connectionCount?: number
  hasSelection?: boolean
  selectedNodes?: string[]
  selectedConnections?: string[]
  theme?: "light" | "dark" | "system"

  // Grupos de botões personalizados
  buttonGroups?: ToolbarButtonGroup[]

  // Callbacks organizados por categoria
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
  onResetView?: () => void
  onCenterView?: () => void
  onFitToScreen?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSave?: () => void
  onExecute?: () => void
  onShare?: () => void
  onExport?: () => void
  onImport?: () => void
  onClear?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onToggleGrid?: (enabled: boolean) => void
  onToggleSnapToGrid?: (enabled: boolean) => void
  onToggleTheme?: () => void
  onToggleSidebar?: () => void
  sidebarOpen?: boolean

  // Configurações de grid
  gridSize?: number
  setGridSize?: (size: number) => void

  // Identificadores para testes
  testId?: string
}

/**
 * UnifiedCanvasToolbar - Componente unificado para toolbar do canvas
 *
 * Otimizado com componentes base reutilizáveis mantendo aparência visual idêntica.
 * Reduz duplicação de código e melhora manutenibilidade.
 */
export function UnifiedCanvasToolbar({
  // Configuração visual com valores padrão
  variant = "standard",
  position = "top",
  orientation = "horizontal",
  className,
  collapsible = false,
  initialCollapsed = false,
  showLabels = false,
  showTooltips = true,
  showShortcuts = true,

  // Estado do canvas - usa valores do contexto se não fornecidos
  viewport: propViewport,
  canUndo: propCanUndo,
  canRedo: propCanRedo,
  gridEnabled: propGridEnabled,
  snapToGrid: propSnapToGrid,
  nodeCount: propNodeCount,
  connectionCount: propConnectionCount,
  hasSelection: propHasSelection,
  selectedNodes: propSelectedNodes,
  selectedConnections: propSelectedConnections,
  theme: propTheme,

  // Grupos de botões personalizados
  buttonGroups: customButtonGroups,

  // Callbacks
  onZoomIn: propOnZoomIn,
  onZoomOut: propOnZoomOut,
  onZoomReset: propOnZoomReset,
  onResetView: propOnResetView,
  onCenterView: propOnCenterView,
  onFitToScreen: propOnFitToScreen,
  onUndo: propOnUndo,
  onRedo: propOnRedo,
  onSave: propOnSave,
  onExecute: propOnExecute,
  onShare: propOnShare,
  onExport: propOnExport,
  onImport: propOnImport,
  onClear: propOnClear,
  onDuplicate: propOnDuplicate,
  onDelete: propOnDelete,
  onToggleGrid: propOnToggleGrid,
  onToggleSnapToGrid: propOnToggleSnapToGrid,
  onToggleTheme: propOnToggleTheme,
  onToggleSidebar: propOnToggleSidebar,
  sidebarOpen = true,

  // Configurações de grid
  gridSize: propGridSize,
  setGridSize: propSetGridSize,

  // Identificadores para testes
  testId = "canvas-toolbar",
}: UnifiedCanvasToolbarProps) {
  // Estado local
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)
  const [showHelp, setShowHelp] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Tentar obter o contexto do canvas
  const canvasContext = typeof useCanvas === "function" ? useCanvas() : null

  // Mesclar props com valores do contexto
  const viewport = propViewport || canvasContext?.viewport || { x: 0, y: 0, zoom: 1 }
  const canUndo = propCanUndo ?? canvasContext?.canUndo ?? false
  const canRedo = propCanRedo ?? canvasContext?.canRedo ?? false
  const gridEnabled = propGridEnabled ?? canvasContext?.gridEnabled ?? false
  const snapToGrid = propSnapToGrid ?? canvasContext?.snapToGrid ?? false
  const nodeCount = propNodeCount ?? canvasContext?.nodeCount ?? 0
  const connectionCount = propConnectionCount ?? canvasContext?.connectionCount ?? 0
  const selectedNodes = propSelectedNodes ?? canvasContext?.selectedNodes ?? []
  const selectedConnections = propSelectedConnections ?? canvasContext?.selectedConnections ?? []
  const hasSelection = propHasSelection ?? (selectedNodes?.length > 0 || selectedConnections?.length > 0) ?? false
  const theme = propTheme ?? canvasContext?.theme ?? "light"
  const gridSize = propGridSize ?? canvasContext?.gridSize ?? 20

  // Responsividade
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Handlers organizados por categoria
  const historyHandlers = {
    handleUndo: useCallback(() => {
      if (propOnUndo) {
        propOnUndo()
      } else if (canvasContext?.undo) {
        canvasContext.undo()
      }
    }, [propOnUndo, canvasContext]),

    handleRedo: useCallback(() => {
      if (propOnRedo) {
        propOnRedo()
      } else if (canvasContext?.redo) {
        canvasContext.redo()
      }
    }, [propOnRedo, canvasContext]),
  }

  const zoomHandlers = {
    handleZoomIn: useCallback(() => {
      if (propOnZoomIn) {
        propOnZoomIn()
      } else if (canvasContext?.setViewport) {
        canvasContext.setViewport({ zoom: Math.min(3, viewport.zoom * 1.2) })
      }
    }, [propOnZoomIn, canvasContext, viewport.zoom]),

    handleZoomOut: useCallback(() => {
      if (propOnZoomOut) {
        propOnZoomOut()
      } else if (canvasContext?.setViewport) {
        canvasContext.setViewport({ zoom: Math.max(0.1, viewport.zoom / 1.2) })
      }
    }, [propOnZoomOut, canvasContext, viewport.zoom]),

    handleZoomReset: useCallback(() => {
      if (propOnZoomReset) {
        propOnZoomReset()
      } else if (canvasContext?.setViewport) {
        canvasContext.setViewport({ zoom: 0.8 })
      }
    }, [propOnZoomReset, canvasContext]),
  }

  const viewHandlers = {
    handleResetView: useCallback(() => {
      if (propOnResetView) {
        propOnResetView()
      } else if (canvasContext?.resetViewport) {
        canvasContext.resetViewport()
      }
    }, [propOnResetView, canvasContext]),

    handleCenterView: useCallback(() => {
      if (propOnCenterView) {
        propOnCenterView()
      } else if (canvasContext?.centerView) {
        canvasContext.centerView()
      }
    }, [propOnCenterView, canvasContext]),

    handleFitToScreen: useCallback(() => {
      if (propOnFitToScreen) {
        propOnFitToScreen()
      } else if (canvasContext?.fitToScreen) {
        canvasContext.fitToScreen()
      }
    }, [propOnFitToScreen, canvasContext]),
  }

  const fileHandlers = {
    handleSave: useCallback(() => {
      if (propOnSave) {
        propOnSave()
      }
      toast({
        title: "Canvas salvo",
        description: "Suas alterações foram salvas com sucesso.",
        duration: 2000,
      })
    }, [propOnSave]),

    handleExecute: useCallback(() => {
      if (propOnExecute) {
        propOnExecute()
      }
      toast({
        title: "Executando fluxo",
        description: `Executando fluxo com ${nodeCount} nodes e ${connectionCount} conexões.`,
        duration: 2000,
      })
    }, [propOnExecute, nodeCount, connectionCount]),

    handleExport: useCallback(() => {
      setIsExporting(true)
      try {
        if (propOnExport) {
          propOnExport()
          return
        }

        if (canvasContext?.exportCanvas) {
          const data = canvasContext.exportCanvas()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)

          const a = document.createElement("a")
          a.href = url
          a.download = `canvas-export-${new Date().toISOString().slice(0, 10)}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          toast({
            title: "Canvas exportado",
            description: "O arquivo foi baixado com sucesso.",
            duration: 2000,
          })
        }
      } catch (error) {
        console.error("Error exporting canvas:", error)
        toast({
          title: "Erro na exportação",
          description: "Não foi possível exportar o canvas.",
          variant: "destructive",
        })
      } finally {
        setIsExporting(false)
      }
    }, [propOnExport, canvasContext]),
  }

  // Definir grupos de botões padrão usando ActionButton
  const defaultButtonGroups = useMemo((): ToolbarButtonGroup[] => {
    const historyGroup: ToolbarButtonGroup = {
      id: "history",
      title: "Histórico",
      buttons: [
        {
          id: "undo",
          icon: variant === "standard" ? Undo2 : Undo,
          tooltip: "Desfazer",
          shortcut: "Ctrl+Z",
          onClick: historyHandlers.handleUndo,
          disabled: !canUndo,
          visible: true,
        },
        {
          id: "redo",
          icon: variant === "standard" ? Redo2 : Redo,
          tooltip: "Refazer",
          shortcut: "Ctrl+Y",
          onClick: historyHandlers.handleRedo,
          disabled: !canRedo,
          visible: true,
        },
      ],
      visible: true,
    }

    const zoomGroup: ToolbarButtonGroup = {
      id: "zoom",
      title: "Zoom",
      buttons: [
        {
          id: "zoom-out",
          icon: ZoomOut,
          tooltip: "Diminuir Zoom",
          shortcut: "-",
          onClick: zoomHandlers.handleZoomOut,
          visible: true,
        },
        {
          id: "zoom-level",
          icon: <span className="text-xs font-medium">{Math.round(viewport.zoom * 100)}%</span>,
          tooltip: "Resetar Zoom",
          shortcut: "0",
          onClick: zoomHandlers.handleZoomReset,
          variant: "ghost" as const,
          className: "px-2 min-w-[3rem]",
          visible: true,
        },
        {
          id: "zoom-in",
          icon: ZoomIn,
          tooltip: "Aumentar Zoom",
          shortcut: "+",
          onClick: zoomHandlers.handleZoomIn,
          visible: true,
        },
        {
          id: "fit-screen",
          icon: variant === "standard" ? Focus : Maximize,
          tooltip: hasSelection ? "Zoom na Seleção" : "Ajustar à Tela",
          shortcut: "Ctrl+F",
          onClick: viewHandlers.handleFitToScreen,
          visible: variant !== "minimal",
        },
      ],
      visible: true,
    }

    const fileGroup: ToolbarButtonGroup = {
      id: "file",
      title: "Arquivo",
      buttons: [
        {
          id: "save",
          icon: Save,
          label: showLabels ? "Salvar" : undefined,
          tooltip: "Salvar",
          shortcut: "Ctrl+S",
          onClick: fileHandlers.handleSave,
          visible: variant !== "minimal",
        },
        {
          id: "execute",
          icon: Play,
          label: showLabels ? "Executar" : undefined,
          tooltip: "Executar Fluxo",
          onClick: fileHandlers.handleExecute,
          visible: variant === "integrated" || variant === "expanded",
        },
        {
          id: "export",
          icon: Download,
          tooltip: "Exportar Canvas",
          onClick: fileHandlers.handleExport,
          isLoading: isExporting,
          visible: true,
        },
      ],
      visible: true,
    }

    // Determinar quais grupos mostrar com base na variante
    let groups: ToolbarButtonGroup[] = []

    switch (variant) {
      case "minimal":
        groups = [historyGroup, zoomGroup, fileGroup]
        break
      case "compact":
        groups = [historyGroup, zoomGroup, fileGroup]
        break
      case "standard":
      case "expanded":
      case "floating":
      case "integrated":
      default:
        groups = [historyGroup, zoomGroup, fileGroup]
    }

    return groups.filter((group) => group.visible)
  }, [variant, viewport.zoom, canUndo, canRedo, hasSelection, isExporting, showLabels])

  // Usar grupos personalizados ou padrão
  const finalButtonGroups = customButtonGroups || defaultButtonGroups

  // Classes de posição e orientação
  const positionClasses = useMemo(() => {
    const positions = {
      top: "absolute top-4 left-1/2 -translate-x-1/2",
      bottom: "absolute bottom-4 left-1/2 -translate-x-1/2",
      left: "absolute left-4 top-1/2 -translate-y-1/2",
      right: "absolute right-4 top-1/2 -translate-y-1/2",
      "top-left": "absolute top-4 left-4",
      "top-right": "absolute top-4 right-4 z-50",
      "bottom-left": "absolute bottom-4 left-4",
      "bottom-right": "absolute bottom-4 right-4",
      center: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    }
    return positions[position] || positions.top
  }, [position])

  const orientationClasses = useMemo(() => {
    return orientation === "vertical" ? "flex-col items-center" : "flex-row items-center"
  }, [orientation])

  const variantClasses = useMemo(() => {
    const variants = {
      minimal: "p-1 gap-1",
      compact: "p-1 gap-1",
      standard: "p-2 gap-2",
      expanded: "p-2 gap-2",
      floating: "p-2 gap-2 shadow-lg",
      integrated: "p-2 gap-2 border-b border-border w-full relative",
    }
    return variants[variant] || variants.standard
  }, [variant])

  // Renderizar toolbar colapsada para mobile
  if ((isCollapsed && collapsible) || (isMobile && variant !== "minimal")) {
    return (
      <TooltipProvider>
        <div
          className={cn(
            "fixed top-4 right-4 z-50",
            "flex flex-col gap-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-slate-200 dark:border-slate-700 canvas-ui-element",
            className,
          )}
          data-testid={testId}
        >
          <ActionButton
            variant="ghost"
            size="icon"
            icon={ChevronDown}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          />

          <Separator className="my-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <ActionButton
                variant="ghost"
                size="icon"
                icon={Undo2}
                onClick={historyHandlers.handleUndo}
                disabled={!canUndo}
                className="h-8 w-8"
              />
            </TooltipTrigger>
            <TooltipContent>Desfazer (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <ActionButton
                variant="ghost"
                size="icon"
                icon={ZoomIn}
                onClick={zoomHandlers.handleZoomIn}
                className="h-8 w-8"
              />
            </TooltipTrigger>
            <TooltipContent>Aumentar Zoom (+)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <ActionButton
                variant="ghost"
                size="icon"
                icon={ZoomOut}
                onClick={zoomHandlers.handleZoomOut}
                className="h-8 w-8"
              />
            </TooltipTrigger>
            <TooltipContent>Diminuir Zoom (-)</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

  // Renderizar toolbar completa
  return (
    <TooltipProvider>
      <div
        className={cn(
          positionClasses,
          "flex",
          orientationClasses,
          variantClasses,
          "bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg",
          "border border-slate-200 dark:border-slate-700",
          "canvas-ui-element max-w-sm",
          variant === "integrated" ? "top-0 left-0 transform-none w-full rounded-none max-w-none" : "",
          className,
        )}
        data-testid={testId}
      >
        {finalButtonGroups.map((group, groupIndex) => (
          <div key={group.id} className="flex items-center gap-1">
            {/* Botões do grupo usando ActionButton */}
            {group.buttons
              .filter((button) => button.visible !== false)
              .map((button) => (
                <Tooltip key={button.id} delayDuration={showTooltips ? 300 : 9999999}>
                  <TooltipTrigger asChild>
                    <ActionButton
                      variant={button.variant || "ghost"}
                      size="icon"
                      icon={button.icon}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      isLoading={button.isLoading}
                      className={cn("h-8 w-8", button.className)}
                      data-testid={`${testId}-${button.id}`}
                    >
                      {button.label}
                    </ActionButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col">
                      <span>{button.tooltip}</span>
                      {showShortcuts && button.shortcut && (
                        <span className="text-xs text-muted-foreground mt-0.5">{button.shortcut}</span>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}

            {/* Separador entre grupos */}
            {groupIndex < finalButtonGroups.length - 1 && (
              <Separator
                orientation={orientation === "vertical" ? "horizontal" : "vertical"}
                className={orientation === "vertical" ? "w-full h-px my-1" : "h-6"}
              />
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
