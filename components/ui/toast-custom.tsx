"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
}

const variantStyles = {
  default: {
    container: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    icon: null,
    iconColor: "",
  },
  success: {
    container: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    icon: CheckCircle,
    iconColor: "text-green-600 dark:text-green-400",
  },
  error: {
    container: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    icon: AlertCircle,
    iconColor: "text-red-600 dark:text-red-400",
  },
  warning: {
    container: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  info: {
    container: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    icon: Info,
    iconColor: "text-blue-600 dark:text-blue-400",
  },
}

export function ToastCustom({ id, title, description, variant = "default", duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)
  const [isExiting, setIsExiting] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const style = variantStyles[variant]
  const IconComponent = style.icon

  React.useEffect(() => {
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose()
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        style.container,
        isExiting ? "opacity-0 scale-95 translate-x-full" : "opacity-100 scale-100 translate-x-0",
      )}
    >
      {/* Icon */}
      {IconComponent && (
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className={cn("h-5 w-5", style.iconColor)} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{title}</div>}
        {description && <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</div>}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
      </button>
    </div>
  )
}

// Toast container
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">{children}</div>
}
