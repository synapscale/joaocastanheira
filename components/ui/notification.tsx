/**
 * Componente de Notificação
 * 
 * Este componente implementa um sistema de notificações para feedback ao usuário
 * sobre ações, erros e informações importantes.
 */
"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  AlertTriangle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Tipos de notificação
export type NotificationType = "success" | "error" | "info" | "warning"

// Interface para uma notificação
export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Estado global para notificações
let notificationQueue: Notification[] = []
let listeners: Array<(notifications: Notification[]) => void> = []

/**
 * Adiciona uma notificação à fila
 */
export function showNotification(notification: Omit<Notification, "id">) {
  const id = `notification-${Date.now()}`
  const newNotification: Notification = {
    id,
    duration: 5000,
    ...notification,
  }
  
  notificationQueue = [...notificationQueue, newNotification]
  listeners.forEach(listener => listener(notificationQueue))
  
  return id
}

/**
 * Remove uma notificação da fila
 */
export function hideNotification(id: string) {
  notificationQueue = notificationQueue.filter(n => n.id !== id)
  listeners.forEach(listener => listener(notificationQueue))
}

/**
 * Componente de notificação individual
 */
function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification
  onClose: () => void
}) {
  // Efeito para remover a notificação após o tempo definido
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onClose()
      }, notification.duration)
      
      return () => clearTimeout(timer)
    }
  }, [notification, onClose])
  
  // Renderiza o ícone com base no tipo
  const renderIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }
  
  // Determina a cor de fundo com base no tipo
  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
      case "error":
        return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
    }
  }
  
  return (
    <motion.div
      className={`w-full max-w-sm rounded-lg border shadow-sm ${getBgColor()}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm">{notification.message}</p>
          {notification.action && (
            <button
              className="mt-2 text-sm font-medium underline"
              onClick={notification.action.onClick}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          className="flex-shrink-0 rounded-full p-1 hover:bg-muted"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

/**
 * Componente de container de notificações
 */
export default function NotificationContainer() {
  // Estado local para notificações
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isMounted, setIsMounted] = useState(false)
  
  // Efeito para registrar o listener
  useEffect(() => {
    setIsMounted(true)
    
    const handleNotificationsChange = (newNotifications: Notification[]) => {
      setNotifications([...newNotifications])
    }
    
    listeners.push(handleNotificationsChange)
    
    return () => {
      listeners = listeners.filter(listener => listener !== handleNotificationsChange)
    }
  }, [])
  
  // Manipula o fechamento de uma notificação
  const handleClose = useCallback((id: string) => {
    hideNotification(id)
  }, [])
  
  if (!isMounted) return null
  
  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => handleClose(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
