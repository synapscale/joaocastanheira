"use client"
/**
 * ComponentSelector
 *
 * A component for selecting, inspecting, and interacting with React components
 * in the application. Provides a visual interface for component discovery and
 * interaction.
 *
 * @ai-pattern component-inspector
 * Tool for inspecting and interacting with UI components
 */

import type React from "react"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  X,
  Maximize2,
  Minimize2,
  Settings,
  Info,
  Code,
  Eye,
  EyeOff,
  Layers,
  AlertTriangle,
  Crosshair,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useApp } from "@/contexts/app-context"
import { useComponentRegistryManager } from "@/hooks/use-component-registry"
import ComponentTree from "./component-tree"
import PropertyEditor from "./property-editor"
import EventInspector from "./event-inspector"
import HelpModal from "./help-modal"
import ComponentMarker from "./component-marker"
import InsertFormatSelector from "./insert-format-selector"
import ContextMenu from "./context-menu"
import DragPreview from "./drag-preview"
import { useToast } from "@/hooks/use-toast"
import type { BaseComponentProps } from "@/types/component-types"
import type { Component, ComponentEvent } from "@/types/component-selector"

/**
 * Props for the ComponentSelector component
 */
export interface ComponentSelectorProps extends BaseComponentProps {
  /**
   * Initial active tab
   * @default "tree"
   */
  initialTab?: "tree" | "properties" | "events"

  /**
   * Whether the component selector is initially expanded
   * @default false
   */
  initiallyExpanded?: boolean

  /**
   * Whether to show the help button
   * @default true
   */
  showHelpButton?: boolean

  /**
   * Whether to show the settings button
   * @default true
   */
  showSettingsButton?: boolean

  /**
   * Whether to show the code view button
   * @default true
   */
  showCodeViewButton?: boolean

  /**
   * Whether to allow component dragging
   * @default true
   */
  allowDragging?: boolean

  /**
   * Whether to allow component selection
   * @default true
   */
  allowSelection?: boolean

  /**
   * Whether to highlight components on hover
   * @default true
   */
  highlightOnHover?: boolean

  /**
   * Maximum height of the component tree
   * @default "300px"
   */
  maxTreeHeight?: string

  /**
   * Callback fired when a component is selected
   * @param component The selected component
   */
  onComponentSelect?: (component: Component) => void

  /**
   * Callback fired when a component is dragged
   * @param component The dragged component
   * @param position The drag position
   */
  onComponentDrag?: (component: Component, position: { x: number; y: number }) => void

  /**
   * Callback fired when a component event is triggered
   * @param component The component
   * @param event The event
   */
  onComponentEvent?: (component: Component, event: ComponentEvent) => void
}

/**
 * ComponentSelector component
 * @param props Component props
 * @returns ComponentSelector component
 */
export default function ComponentSelector({
  className = "",
  style,
  id,
  disabled = false,
  dataAttributes,
  initialTab = "tree",
  initiallyExpanded = false,
  showHelpButton = true,
  showSettingsButton = true,
  showCodeViewButton = true,
  allowDragging = true,
  allowSelection = true,
  highlightOnHover = true,
  maxTreeHeight = "300px",
  onComponentSelect,
  onComponentDrag,
  onComponentEvent,
}: ComponentSelectorProps) {
  // SECTION: Local state
  const [activeTab, setActiveTab] = useState<"tree" | "properties" | "events">(initialTab)
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded)
  const [showHelp, setShowHelp] = useState(false)
  const [showComponentMarkers, setShowComponentMarkers] = useState(true)
  const [insertFormat, setInsertFormat] = useState<"jsx" | "reference">("reference")
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [contextMenuComponent, setContextMenuComponent] = useState<Component | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [localHoveredComponent, setLocalHoveredComponent] = useState<Component | null>(null)

  // Estado local para o seletor de componentes caso o contexto não forneça
  const [localIsComponentSelectorActive, setLocalComponentSelectorActive] = useState(false)

  // Refs
  const selectorRef = useRef<HTMLDivElement>(null)

  // SECTION: Hooks
  const { toast } = useToast()

  // SECTION: Application context
  const {
    selectedComponent,
    setSelectedComponent,
    hoveredComponent: contextHoveredComponent,
    setHoveredComponent: contextSetHoveredComponent,
    dragState,
    setDragState,
    updateDragPosition,
    isComponentSelectorActive: contextIsComponentSelectorActive,
    setComponentSelectorActive: contextSetComponentSelectorActive,
  } = useApp()

  // Create fallback variables
  const hoveredComponent = useMemo(
    () => contextHoveredComponent || localHoveredComponent,
    [contextHoveredComponent, localHoveredComponent],
  )

  const setHoveredComponent = useCallback(
    (component: Component | null) => {
      if (typeof contextSetHoveredComponent === "function") {
        contextSetHoveredComponent(component)
      } else {
        setLocalHoveredComponent(component)
      }
    },
    [contextSetHoveredComponent],
  )

  // Fallback para isComponentSelectorActive e setComponentSelectorActive
  const isComponentSelectorActive = useMemo(
    () =>
      contextIsComponentSelectorActive !== undefined
        ? contextIsComponentSelectorActive
        : localIsComponentSelectorActive,
    [contextIsComponentSelectorActive, localIsComponentSelectorActive],
  )

  const handleToggleComponentSelector = useCallback(() => {
    if (typeof contextSetComponentSelectorActive === "function") {
      contextSetComponentSelectorActive(!isComponentSelectorActive)
    } else {
      setLocalComponentSelectorActive(!localIsComponentSelectorActive)
    }
  }, [contextSetComponentSelectorActive, isComponentSelectorActive, localIsComponentSelectorActive])

  // SECTION: Component registry - Use the manager hook instead
  const {
    components = [],
    registerComponent,
    unregisterComponent,
    refreshComponents,
  } = useComponentRegistryManager() || {}

  // SECTION: Effects

  /**
   * Initialize component selector
   * @ai-pattern component-registration
   * Self-registers the component selector in the registry
   */
  useEffect(() => {
    try {
      // Mark as initialized
      setIsInitialized(true)

      // Register the component selector itself
      if (selectorRef.current && typeof registerComponent === "function") {
        registerComponent({
          id: "component-selector",
          name: "ComponentSelector",
          path: "@/components/component-selector/component-selector",
          element: selectorRef.current,
        })
      } else if (!registerComponent) {
        console.error("registerComponent function is not available")
        setError("Component registry is not available")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error initializing component selector"
      setError(errorMessage)
      console.error("Failed to initialize component selector:", err)
    }

    return () => {
      // Unregister on unmount
      try {
        if (typeof unregisterComponent === "function") {
          unregisterComponent("component-selector")
        }
      } catch (err) {
        console.error("Error unregistering component selector:", err)
      }
    }
  }, [registerComponent, unregisterComponent])

  /**
   * Set up component detection
   * @ai-pattern component-detection
   * Detects components under the cursor for selection
   */
  useEffect(() => {
    if (!isInitialized || !allowSelection || disabled) return

    const handleComponentDetection = (event: MouseEvent) => {
      try {
        // Find component elements under the cursor
        const elements = document.elementsFromPoint(event.clientX, event.clientY)

        for (const element of elements) {
          // Skip if element is null or not an HTMLElement
          if (!element || !(element instanceof HTMLElement)) continue

          const componentName = element.getAttribute("data-component")
          const componentPath = element.getAttribute("data-component-path")
          const componentId = element.getAttribute("data-component-id")

          if (componentName && componentPath) {
            // Don't select the component selector itself
            if (componentName === "ComponentSelector") continue

            const component: Component = {
              id: componentId || `${componentPath}-${componentName}-${Math.random().toString(36).substring(2, 9)}`,
              name: componentName,
              path: componentPath,
              element: element as HTMLElement,
            }

            if (event.type === "mouseover" && typeof setHoveredComponent === "function") {
              setHoveredComponent(component)
            } else if (event.type === "click") {
              if (typeof setSelectedComponent === "function") {
                setSelectedComponent(component)
                onComponentSelect?.(component)

                // Show success toast
                toast({
                  title: "Component Selected",
                  description: `Selected ${componentName} component`,
                  variant: "default",
                })
              }

              event.preventDefault()
              event.stopPropagation()
              break
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error detecting component"
        setError(errorMessage)
        console.error("Error in component detection:", err)
      }
    }

    // Only add listeners if component selection is allowed
    document.addEventListener("mouseover", handleComponentDetection)
    document.addEventListener("click", handleComponentDetection, true)

    return () => {
      document.removeEventListener("mouseover", handleComponentDetection)
      document.removeEventListener("click", handleComponentDetection, true)
    }
  }, [isInitialized, allowSelection, disabled, setHoveredComponent, setSelectedComponent, onComponentSelect, toast])

  /**
   * Handle drag movement
   * @ai-pattern drag-tracking
   * Tracks component dragging for drag-and-drop operations
   */
  useEffect(() => {
    if (!isInitialized || !allowDragging || disabled) return

    const handleMouseMove = (e: MouseEvent) => {
      if (dragState?.isDragging && dragState.component) {
        updateDragPosition({
          x: e.clientX,
          y: e.clientY,
        })
        onComponentDrag?.(dragState.component, { x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      if (dragState?.isDragging) {
        setDragState({
          isDragging: false,
        })

        // Show toast when drag ends
        if (dragState.component) {
          toast({
            title: "Component Dragged",
            description: `Finished dragging ${dragState.component.name} component`,
            variant: "default",
          })
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isInitialized, dragState, updateDragPosition, setDragState, allowDragging, disabled, onComponentDrag, toast])

  /**
   * Handle keyboard shortcuts
   * @ai-pattern keyboard-shortcuts
   * Implements keyboard shortcuts for improved usability
   */
  useEffect(() => {
    if (!isInitialized || disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      try {
        // Escape key to cancel selection or close context menu
        if (e.key === "Escape") {
          if (contextMenuPosition) {
            setContextMenuPosition(null)
            setContextMenuComponent(null)
          } else if (hoveredComponent) {
            setHoveredComponent(null)
          } else if (selectedComponent) {
            setSelectedComponent(null)
          }
        }

        // Ctrl+Shift+C to toggle component markers
        if (e.key === "C" && e.ctrlKey && e.shiftKey) {
          e.preventDefault()
          setShowComponentMarkers((prev) => !prev)
        }

        // Ctrl+Shift+E to toggle expanded state
        if (e.key === "E" && e.ctrlKey && e.shiftKey) {
          e.preventDefault()
          setIsExpanded((prev) => !prev)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error handling keyboard shortcut"
        setError(errorMessage)
        console.error("Error handling keyboard shortcut:", err)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    isInitialized,
    disabled,
    contextMenuPosition,
    hoveredComponent,
    selectedComponent,
    setHoveredComponent,
    setSelectedComponent,
  ])

  // SECTION: Event handlers

  /**
   * Toggle component selector expansion
   */
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  /**
   * Toggle component markers visibility
   */
  const toggleComponentMarkers = useCallback(() => {
    setShowComponentMarkers((prev) => !prev)
  }, [])

  /**
   * Handle context menu for a component
   * @param e The mouse event
   * @param component The component
   */
  const handleContextMenu = useCallback((e: React.MouseEvent, component: Component) => {
    try {
      e.preventDefault()
      setContextMenuPosition({ x: e.clientX, y: e.clientY })
      setContextMenuComponent(component)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error showing context menu"
      setError(errorMessage)
      console.error("Error showing context menu:", err)
    }
  }, [])

  /**
   * Close the context menu
   */
  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null)
    setContextMenuComponent(null)
  }, [])

  /**
   * Handle component event
   * @param component The component
   * @param event The event
   */
  const handleComponentEvent = useCallback(
    (component: Component, event: ComponentEvent) => {
      try {
        onComponentEvent?.(component, event)

        // Show toast for event
        toast({
          title: "Component Event",
          description: `${event.type} event on ${component.name}`,
          variant: "default",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error handling component event"
        setError(errorMessage)
        console.error("Error handling component event:", err)
      }
    },
    [onComponentEvent, toast],
  )

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // SECTION: Render helpers

  /**
   * Get the list of components to display in the tree
   */
  const displayComponents = useMemo(() => {
    try {
      return (components || [])
        .filter((c) => c && c.name && c.name !== "ComponentSelector")
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch (err) {
      console.error("Error filtering components:", err)
      return []
    }
  }, [components])

  // Prepare data attributes
  const allDataAttributes = useMemo(
    () => ({
      "data-component": "ComponentSelector",
      "data-component-path": "@/components/component-selector/component-selector",
      "data-component-id": "component-selector",
      ...(dataAttributes || {}),
    }),
    [dataAttributes],
  )

  // Prepare component selector styles
  const selectorStyles = useMemo(
    () => ({
      ...style,
      width: isExpanded ? "24rem" : "16rem", // 96 or 64
      height: isExpanded ? "500px" : "auto",
    }),
    [style, isExpanded],
  )

  // SECTION: Render
  return (
    <>
      {/* Botão flutuante para ativar/desativar o seletor */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg bg-white dark:bg-gray-800 text-primary dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
        onClick={handleToggleComponentSelector}
        data-component-selector="true"
      >
        {isComponentSelectorActive ? <X className="h-5 w-5" /> : <Crosshair className="h-5 w-5" />}
      </Button>

      {isComponentSelectorActive && (
        <div
          ref={selectorRef}
          className={`fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 ${className}`}
          style={selectorStyles}
          id={id}
          {...allDataAttributes}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Layers className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Component Selector</h3>
            </div>
            <div className="flex items-center space-x-1">
              {showHelpButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowHelp(true)}
                  disabled={disabled}
                  aria-label="Help"
                >
                  <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              )}

              {showSettingsButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={disabled}
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              )}

              {showCodeViewButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={disabled}
                  aria-label="View Code"
                >
                  <Code className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleComponentMarkers}
                disabled={disabled}
                aria-label={showComponentMarkers ? "Hide Component Markers" : "Show Component Markers"}
              >
                {showComponentMarkers ? (
                  <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleExpanded}
                disabled={disabled}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleToggleComponentSelector}
                disabled={disabled}
                aria-label="Close"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="m-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0" onClick={clearError}>
                <X className="h-3 w-3" />
              </Button>
            </Alert>
          )}

          {/* Insert format selector */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <InsertFormatSelector value={insertFormat} onChange={setInsertFormat} disabled={disabled} />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="w-full grid grid-cols-3 p-1 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger
                value="tree"
                className="text-xs py-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                disabled={disabled}
              >
                Component Tree
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="text-xs py-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                disabled={disabled || !selectedComponent}
              >
                Properties
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="text-xs py-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                disabled={disabled || !selectedComponent}
              >
                Events
              </TabsTrigger>
            </TabsList>

            {/* Component Tree Tab */}
            <TabsContent value="tree" className="p-0 m-0">
              <ScrollArea className={`max-h-${maxTreeHeight}`}>
                <div className="p-3">
                  {displayComponents.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No components detected. Interact with the page to discover components.
                    </div>
                  ) : (
                    <ComponentTree
                      components={displayComponents}
                      selectedComponent={selectedComponent}
                      onSelect={setSelectedComponent}
                      onContextMenu={handleContextMenu}
                      allowDragging={allowDragging}
                      disabled={disabled}
                    />
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties" className="p-0 m-0">
              <ScrollArea className={`max-h-${maxTreeHeight}`}>
                <div className="p-3">
                  {selectedComponent ? (
                    <PropertyEditor
                      element={selectedComponent.element}
                      onClose={() => setActiveTab("tree")}
                      disabled={disabled}
                    />
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Select a component to view its properties.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="p-0 m-0">
              <ScrollArea className={`max-h-${maxTreeHeight}`}>
                <div className="p-3">
                  {selectedComponent ? (
                    <EventInspector
                      element={selectedComponent.element}
                      onClose={() => setActiveTab("tree")}
                      onEvent={(event) => handleComponentEvent(selectedComponent, event)}
                      disabled={disabled}
                    />
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Select a component to view its events.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Component markers */}
          {showComponentMarkers && !disabled && components && (
            <>
              {components.map((component) =>
                component && component.id ? (
                  <ComponentMarker
                    key={component.id}
                    name={component.name || "UnknownComponent"}
                    path={component.path || "unknown-path"}
                  >
                    {/* Wrap the component element if needed */}
                    <div
                      className={`
                      component-highlight
                      ${selectedComponent?.id === component.id ? "selected" : ""}
                      ${hoveredComponent?.id === component.id ? "hovered" : ""}
                      ${highlightOnHover ? "highlight-on-hover" : ""}
                    `}
                    >
                      {/* This is just a marker, no actual content needed */}
                    </div>
                  </ComponentMarker>
                ) : null,
              )}
            </>
          )}

          {/* Drag preview */}
          {dragState?.isDragging && dragState.component && (
            <DragPreview component={dragState.component} position={{ x: dragState.x || 0, y: dragState.y || 0 }} />
          )}

          {/* Context menu */}
          {contextMenuPosition && contextMenuComponent && (
            <ContextMenu
              component={contextMenuComponent}
              position={contextMenuPosition}
              onClose={closeContextMenu}
              insertFormat={insertFormat}
              disabled={disabled}
            />
          )}

          {/* Help modal */}
          {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </div>
      )}
    </>
  )
}
