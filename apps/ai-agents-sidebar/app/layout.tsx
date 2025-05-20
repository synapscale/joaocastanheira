import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "../../../components/sidebar/Sidebar"
import { SidebarProvider } from "../components/ui/sidebar"
import { Toaster } from "../components/ui/toaster"
import { ThemeProvider } from "../../../packages/theme/theme-provider";

// Load Inter font with Latin subset
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// Metadata for SEO and viewport settings
export const metadata: Metadata = {
  title: "Canva E Agentes",
  description: "Plataforma para criação e gerenciamento de agentes de IA",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  authors: [{ name: "Canva E Agentes Team" }],
  keywords: ["IA", "agentes", "prompts", "canvas", "chat"],
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={`${inter.className} bg-gray-50/50 overscroll-none`}>
        <ThemeProvider>
          <SidebarProvider>
            <div className="flex h-[100dvh] overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-auto w-full" id="main-content">
                {children}
              </main>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
