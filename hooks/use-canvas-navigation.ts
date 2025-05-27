"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { useCanvas } from "@/contexts/canvas-context"

interface NavigationState {
  isPanning: boolean
  isSpacePanning: boolean
  panStart: { x: number; y: number }
  momentum: { x: number; y: number }
  lastPanTime: number
  lastPanPosition: { x: number; y: number }
}

export function useCanvasNavigation(canvasRef: React.RefObject<HTMLDivElement>) {
  const { viewport, setViewport } = useCanvas()
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)
  const momentumTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isZooming, setIsZooming] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(80) // Percentual inicial de zoom (80%)
  const [showNavigationHint, setShowNavigationHint] = useState(false)

  // Navigation state
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isPanning: false,
    isSpacePanning: false,
    panStart: { x: 0, y: 0 },
    momentum: { x: 0, y: 0 },
    lastPanTime: 0,
    lastPanPosition: { x: 0, y: 0 },
  })

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }

      return {
        x: (screenX - rect.left - viewport.x) / viewport.zoom,
        y: (screenY - rect.top - viewport.y) / viewport.zoom,
      }
    },
    [viewport, canvasRef],
  )

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback(
    (worldX: number, worldY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }

      return {
        x: worldX * viewport.zoom + viewport.x + rect.left,
        y: worldY * viewport.zoom + viewport.y + rect.top,
      }
    },
    [viewport, canvasRef],
  )

  // Enhanced smooth zoom with animation
  const smoothZoom = useCallback(
    (deltaY: number, mouseX: number, mouseY: number, isRelative = false) => {
      setIsZooming(true)

      // Calculate target zoom with easing - zoom mais suave
      const zoomFactor = deltaY > 0 ? 0.95 : 1.05 // Fator de zoom mais suave
      const targetZoom = Math.max(0.1, Math.min(3, viewport.zoom * zoomFactor))

      // Animation duration in ms - mais rápido
      const duration = 100 // Duração mais curta para resposta mais rápida
      const startTime = performance.now()
      const startZoom = viewport.zoom

      // Calculate world position of mouse for consistent zooming
      const mouseWorldX = (mouseX - viewport.x) / viewport.zoom
      const mouseWorldY = (mouseY - viewport.y) / viewport.zoom

      // Animation function
      const animateZoom = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease out cubic: progress = 1 - (1 - progress)^3
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        // Interpolate between start and target zoom
        const newZoom = startZoom + (targetZoom - startZoom) * easedProgress

        // Update zoom level for UI
        setZoomLevel(Math.round(newZoom * 100))

        if (isRelative) {
          // Adjust position to keep mouse point fixed during zoom
          const newX = mouseX - mouseWorldX * newZoom
          const newY = mouseY - mouseWorldY * newZoom

          setViewport({ x: newX, y: newY, zoom: newZoom })
        } else {
          setViewport({ zoom: newZoom })
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateZoom)
        } else {
          setIsZooming(false)
        }
      }

      // Start animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(animateZoom)
    },
    [viewport, setViewport],
  )

  // Enhanced smooth pan with inertia
  const smoothPan = useCallback(
    (deltaX: number, deltaY: number, calculateMomentum = false) => {
      // Apply immediate pan
      setViewport((prev) => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }))

      // Calculate momentum for inertia effect
      if (calculateMomentum) {
        const now = performance.now()
        const timeDelta = now - navigationState.lastPanTime

        if (timeDelta > 0 && timeDelta < 100) {
          // Calculate momentum based on speed of movement
          const speedX = (deltaX / timeDelta) * 15
          const speedY = (deltaY / timeDelta) * 15

          // Limit maximum momentum
          const maxSpeed = 30
          const limitedSpeedX = Math.max(-maxSpeed, Math.min(maxSpeed, speedX))
          const limitedSpeedY = Math.max(-maxSpeed, Math.min(maxSpeed, speedY))

          setNavigationState((prev) => ({
            ...prev,
            momentum: { x: limitedSpeedX, y: limitedSpeedY },
            lastPanTime: now,
            lastPanPosition: { x: prev.lastPanPosition.x + deltaX, y: prev.lastPanPosition.y + deltaY },
          }))
        } else {
          setNavigationState((prev) => ({
            ...prev,
            lastPanTime: now,
            lastPanPosition: { x: prev.lastPanPosition.x + deltaX, y: prev.lastPanPosition.y + deltaY },
          }))
        }
      }
    },
    [setViewport, navigationState.lastPanTime, navigationState.lastPanPosition],
  )

  // Apply momentum after panning with improved physics
  const applyMomentum = useCallback(() => {
    if (momentumTimeoutRef.current) {
      clearTimeout(momentumTimeoutRef.current)
    }

    if (Math.abs(navigationState.momentum.x) < 0.5 && Math.abs(navigationState.momentum.y) < 0.5) {
      return
    }

    let currentMomentum = { ...navigationState.momentum }
    let lastTimestamp = performance.now()

    const applyFrame = (timestamp: number) => {
      // Calculate delta time for frame-rate independent physics
      const deltaTime = timestamp - lastTimestamp
      lastTimestamp = timestamp

      // Apply momentum with delta time scaling
      const scaleFactor = deltaTime / 16.67 // Normalize to 60fps

      setViewport((prev) => ({
        ...prev,
        x: prev.x + currentMomentum.x * scaleFactor,
        y: prev.y + currentMomentum.y * scaleFactor,
      }))

      // Apply friction based on delta time
      const frictionFactor = Math.pow(0.95, scaleFactor)
      currentMomentum = {
        x: currentMomentum.x * frictionFactor,
        y: currentMomentum.y * frictionFactor,
      }

      // Stop when momentum is very small
      if (Math.abs(currentMomentum.x) < 0.5 && Math.abs(currentMomentum.y) < 0.5) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        return
      }

      animationFrameRef.current = requestAnimationFrame(applyFrame)
    }

    animationFrameRef.current = requestAnimationFrame(applyFrame)

    // Safety timeout to ensure we don't run forever
    momentumTimeoutRef.current = setTimeout(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }, 1000)
  }, [navigationState.momentum, setViewport])

  // Enhanced zoom to specific area with animation
  const zoomToArea = useCallback(
    (area: { x: number; y: number; width: number; height: number }) => {
      const container = canvasRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      const padding = 50
      const areaWithPadding = {
        x: area.x - padding,
        y: area.y - padding,
        width: area.width + padding * 2,
        height: area.height + padding * 2,
      }

      const zoomX = containerWidth / areaWithPadding.width
      const zoomY = containerHeight / areaWithPadding.height
      const targetZoom = Math.min(zoomX, zoomY, 2) // Limit zoom to 2x

      const centerX = areaWithPadding.x + areaWithPadding.width / 2
      const centerY = areaWithPadding.y + areaWithPadding.height / 2

      const targetX = containerWidth / 2 - centerX * targetZoom
      const targetY = containerHeight / 2 - centerY * targetZoom

      // Animate the transition
      const duration = 300
      const startTime = performance.now()
      const startX = viewport.x
      const startY = viewport.y
      const startZoom = viewport.zoom

      const animateZoomToArea = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease out cubic
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        const newZoom = startZoom + (targetZoom - startZoom) * easedProgress
        const newX = startX + (targetX - startX) * easedProgress
        const newY = startY + (targetY - startY) * easedProgress

        setViewport({ x: newX, y: newY, zoom: newZoom })
        setZoomLevel(Math.round(newZoom * 100))

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateZoomToArea)
        }
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(animateZoomToArea)
    },
    [canvasRef, viewport, setViewport],
  )

  // Enhanced pan to specific point with animation
  const panToPoint = useCallback(
    (worldX: number, worldY: number) => {
      const container = canvasRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      const targetX = containerWidth / 2 - worldX * viewport.zoom
      const targetY = containerHeight / 2 - worldY * viewport.zoom

      // Animate the transition
      const duration = 300
      const startTime = performance.now()
      const startX = viewport.x
      const startY = viewport.y

      const animatePan = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease out cubic
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        const newX = startX + (targetX - startX) * easedProgress
        const newY = startY + (targetY - startY) * easedProgress

        setViewport((prev) => ({ ...prev, x: newX, y: newY }))

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animatePan)
        }
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(animatePan)
    },
    [canvasRef, viewport.zoom, setViewport],
  )

  // Show navigation hint when user first interacts with canvas
  useEffect(() => {
    const hasSeenHint = localStorage.getItem("canvas-navigation-hint-seen")
    if (!hasSeenHint) {
      const timer = setTimeout(() => {
        setShowNavigationHint(true)
        setTimeout(() => {
          setShowNavigationHint(false)
          localStorage.setItem("canvas-navigation-hint-seen", "true")
        }, 5000)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  // Keyboard event handlers with improved shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space for panning
      if (e.code === "Space" && !e.repeat) {
        setIsSpacePressed(true)
        document.body.style.cursor = navigationState.isPanning ? "grabbing" : "grab"
      }

      // Prevent browser shortcuts when using canvas shortcuts
      if ((e.ctrlKey || e.metaKey) && ["z", "y", "a", "d", "s", "0", "=", "-"].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }

      // Additional shortcuts
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+0: Reset zoom
        if (e.key === "0") {
          setViewport({ zoom: 0.8 }) // Zoom padrão de 80%
          setZoomLevel(80)
        }
        // Ctrl++: Zoom in
        else if (e.key === "=" || e.key === "+") {
          const center = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          }
          smoothZoom(-1, center.x, center.y, true)
        }
        // Ctrl+-: Zoom out
        else if (e.key === "-" || e.key === "_") {
          const center = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          }
          smoothZoom(1, center.x, center.y, true)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false)
        if (!navigationState.isPanning) {
          document.body.style.cursor = ""
        }
      }
    }

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("mousemove", handleMouseMove)
      document.body.style.cursor = ""

      // Clean up any animations
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (momentumTimeoutRef.current) {
        clearTimeout(momentumTimeoutRef.current)
      }
    }
  }, [navigationState.isPanning, viewport, setViewport, smoothZoom])

  return {
    navigationState,
    setNavigationState,
    viewport,
    setViewport,
    isSpacePressed,
    mousePosition,
    screenToWorld,
    worldToScreen,
    smoothZoom,
    smoothPan,
    applyMomentum,
    zoomToArea,
    panToPoint,
    isZooming,
    zoomLevel,
    showNavigationHint,
  }
}
