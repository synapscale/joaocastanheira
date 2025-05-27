"use client"
import { cn } from "@/lib/utils"

/**
 * Props para LoadingSkeleton
 */
interface LoadingSkeletonProps {
  /** Largura do skeleton */
  width?: string | number
  /** Altura do skeleton */
  height?: string | number
  /** Formato do skeleton */
  variant?: "rectangular" | "circular" | "text"
  /** Classe CSS adicional */
  className?: string
  /** Número de linhas (para variant text) */
  lines?: number
  /** Animação do skeleton */
  animation?: "pulse" | "wave" | "none"
}

/**
 * LoadingSkeleton - Componente base para skeletons de carregamento
 *
 * Unifica padrões de loading skeletons mantendo aparência visual idêntica.
 */
export function LoadingSkeleton({
  width,
  height,
  variant = "rectangular",
  className,
  lines = 1,
  animation = "pulse",
}: LoadingSkeletonProps) {
  const baseClasses = cn("bg-muted", {
    "animate-pulse": animation === "pulse",
    "animate-bounce": animation === "wave",
  })

  const getVariantClasses = () => {
    switch (variant) {
      case "circular":
        return "rounded-full"
      case "text":
        return "rounded h-4"
      case "rectangular":
      default:
        return "rounded"
    }
  }

  const getStyle = () => ({
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  })

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className={cn(baseClasses, getVariantClasses())} style={getStyle()} />
        ))}
      </div>
    )
  }

  return <div className={cn(baseClasses, getVariantClasses(), className)} style={getStyle()} />
}

/**
 * Skeletons pré-configurados para casos comuns
 */
export const SkeletonPresets = {
  Avatar: () => <LoadingSkeleton variant="circular" width={40} height={40} />,
  Button: () => <LoadingSkeleton width={80} height={36} />,
  Card: () => (
    <div className="space-y-3">
      <LoadingSkeleton height={140} />
      <LoadingSkeleton variant="text" lines={2} />
      <LoadingSkeleton width="60%" height={20} />
    </div>
  ),
  Text: () => <LoadingSkeleton variant="text" />,
  Title: () => <LoadingSkeleton width="40%" height={24} />,
}
