"use client"

import type React from "react"

import { DragHandleDots2Icon } from "@radix-ui/react-icons"
import * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "@/lib/utils"
import { useCallback, useRef, useEffect, memo } from "react"

// Memoizar o componente ResizablePanelGroup para evitar re-renderizações desnecessárias
const ResizablePanelGroup = memo(
  ({
    className,
    direction = "horizontal",
    onLayout,
    ...props
  }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup> & {
    onLayout?: (sizes: number[]) => void
  }) => {
    // Ref para debouncing
    const debounceRef = useRef<number | null>(null)
    const previousSizesRef = useRef<string | null>(null)

    // Create a memoized handler to prevent render-phase updates
    const handleLayout = useCallback(
      (sizes: number[]) => {
        if (!onLayout) return

        // Validar os tamanhos
        if (!Array.isArray(sizes) || sizes.length === 0) {
          console.error("ResizablePanelGroup: formato inválido de tamanhos")
          return
        }

        // Verificar se os tamanhos realmente mudaram
        const sizesString = JSON.stringify(sizes)
        if (previousSizesRef.current === sizesString) return
        previousSizesRef.current = sizesString

        // Cancel any pending animation frame
        if (debounceRef.current) {
          cancelAnimationFrame(debounceRef.current)
        }

        // Use requestAnimationFrame for better performance
        debounceRef.current = requestAnimationFrame(() => {
          onLayout(sizes)
          debounceRef.current = null
        })
      },
      [onLayout],
    )

    // Clean up animation frame on unmount
    useEffect(() => {
      return () => {
        if (debounceRef.current) {
          cancelAnimationFrame(debounceRef.current)
        }
      }
    }, [])

    return (
      <ResizablePrimitive.PanelGroup
        className={cn("flex h-full w-full data-[direction=vertical]:flex-col", className)}
        direction={direction}
        onLayout={handleLayout} // Use the memoized handler
        {...props}
      />
    )
  },
)

// Adicionar displayName para depuração
ResizablePanelGroup.displayName = "ResizablePanelGroup"

// Memoizar o componente ResizablePanel para evitar re-renderizações desnecessárias
const ResizablePanel = memo(ResizablePrimitive.Panel)
ResizablePanel.displayName = "ResizablePanel"

// Memoizar o componente ResizableHandle para evitar re-renderizações desnecessárias
const ResizableHandle = memo(
  ({
    withHandle,
    className,
    ...props
  }: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
    withHandle?: boolean
  }) => (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:-translate-y-1/2 data-[direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]]:h-px [&[data-panel-group-direction=vertical]]:w-full [&[data-panel-group-direction=vertical]]:after:h-1 [&[data-panel-group-direction=vertical]]:after:w-full [&[data-panel-group-direction=vertical]]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]]:after:translate-x-0 [&:hover]:bg-accent/50 [&:hover]:after:bg-accent/50",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <DragHandleDots2Icon className="h-2.5 w-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  ),
)

ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
