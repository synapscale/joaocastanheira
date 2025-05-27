import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { Toaster } from "@/components/ui/use-toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CollapsibleSidebar } from "@/components/layout/collapsible-sidebar"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Node Creator - Sistema de Criação de Nodes",
  description: "Crie, teste e publique nodes personalizados para workflows de automação",
  keywords: ["nodes", "workflow", "automação", "criação", "sistema"],
  authors: [{ name: "Node Creator Team" }],
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>
            <div className="flex h-screen w-full overflow-hidden">
              {/* Sidebar Minimizável */}
              <CollapsibleSidebar showDevelopmentTools={true} />

              {/* Main Content */}
              <main className="flex-1 min-w-0 overflow-auto bg-gradient-to-br from-background to-muted/20">
                {children}
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
