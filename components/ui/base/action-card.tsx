"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Props para ActionCard
 */
interface ActionCardProps extends React.ComponentProps<typeof Card> {
  /** Título do card */
  title?: string
  /** Descrição do card */
  description?: string
  /** Ações do header (botões, menus, etc.) */
  headerActions?: React.ReactNode
  /** Conteúdo principal do card */
  children?: React.ReactNode
  /** Classe CSS adicional para o header */
  headerClassName?: string
  /** Classe CSS adicional para o content */
  contentClassName?: string
  /** Se deve mostrar o header */
  showHeader?: boolean
}

/**
 * ActionCard - Componente base para cards com header e ações
 *
 * Unifica padrões de cards com título, descrição e ações.
 * Mantém aparência visual idêntica aos cards existentes.
 */
export function ActionCard({
  title,
  description,
  headerActions,
  children,
  headerClassName,
  contentClassName,
  showHeader = true,
  className,
  ...props
}: ActionCardProps) {
  return (
    <Card className={cn(className)} {...props}>
      {showHeader && (title || description || headerActions) && (
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", headerClassName)}>
          <div className="space-y-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
        </CardHeader>
      )}

      {children && <CardContent className={cn(contentClassName)}>{children}</CardContent>}
    </Card>
  )
}
