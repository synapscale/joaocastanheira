import type * as React from "react"
import { cn } from "@/lib/utils"

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Layout({ children, className, ...props }: LayoutProps) {
  return (
    <div className={cn("flex h-screen w-full overflow-hidden", className)} {...props}>
      {children}
    </div>
  )
}

interface LayoutSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  position?: "left" | "right"
  collapsed?: boolean
}

export function LayoutSidebar({
  children,
  className,
  position = "left",
  collapsed = false,
  ...props
}: LayoutSidebarProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 h-full overflow-hidden",
        position === "left" ? "border-r" : "border-l",
        collapsed ? "w-0" : "",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface LayoutHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function LayoutHeader({ children, className, ...props }: LayoutHeaderProps) {
  return (
    <header className={cn("border-b h-16 flex items-center px-4", className)} {...props}>
      {children}
    </header>
  )
}

interface LayoutContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function LayoutContent({ children, className, ...props }: LayoutContentProps) {
  return (
    <main className={cn("flex-1 h-full overflow-auto", className)} {...props}>
      {children}
    </main>
  )
}
