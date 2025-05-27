import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/context/sidebar-context"
import { NodeDefinitionProvider } from "@/context/node-definition-context"
import { WorkflowProvider } from "@/context/workflow-context"
import { VariableProvider } from "@/context/variable-context"
import { NodeTemplateProvider } from "@/context/node-template-context"
import { CodeTemplateProvider } from "@/context/code-template-context"
import { ThemeProvider } from "@/components/theme-provider"
import { CustomCategoryProvider } from "@/context/custom-category-context"
import { TemplateProvider } from "@/context/template-context"
import { MarketplaceProvider } from "@/context/marketplace-context"
import { Toaster } from "@/components/ui/toaster"
import { ClientLayout } from "@/components/client-layout"

// Carrega a fonte Inter com o subconjunto latino
const inter = Inter({ subsets: ["latin"] })

// Define metadados para SEO e abas do navegador
export const metadata: Metadata = {
  title: "Workflow Canvas",
  description: "Construtor visual de workflows para automação estilo n8n",
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  generator: 'v0.dev'
}

/**
 * Componente de Layout Raiz
 *
 * @param props - Propriedades do componente
 * @param props.children - Conteúdo da página a ser renderizado
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Provedores de contexto - a ordem importa para dependências entre contextos */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SidebarProvider>
            <NodeDefinitionProvider>
              <WorkflowProvider>
                <VariableProvider>
                  <NodeTemplateProvider>
                    <CodeTemplateProvider>
                      <CustomCategoryProvider>
                        <TemplateProvider>
                          <MarketplaceProvider>
                            <ClientLayout>
                              {children}
                            </ClientLayout>
                            <Toaster />
                          </MarketplaceProvider>
                        </TemplateProvider>
                      </CustomCategoryProvider>
                    </CodeTemplateProvider>
                  </NodeTemplateProvider>
                </VariableProvider>
              </WorkflowProvider>
            </NodeDefinitionProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
