"use client"

import { NodeCreatorProvider } from '@/contexts/node-creator/node-creator-context';
import { SharedNodesProvider } from '@/contexts/node-creator/shared-nodes-context';
import { WorkflowProvider } from '@/context/workflow-context';
import { TemplateProvider } from '@/context/template-context';
import { NodeDefinitionProvider } from '@/context/node-definition-context';
import { CustomCategoryProvider } from '@/context/custom-category-context';
import { VariableProvider } from '@/context/variable-context';
import { CodeTemplateProvider } from '@/context/code-template-context';
import { SidebarProvider } from '@/context/sidebar-context';
import { ThemeProvider } from 'next-themes';
import { Sidebar } from '@/components/sidebar';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground" suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <SidebarProvider>
            <VariableProvider>
              <CodeTemplateProvider>
                <NodeCreatorProvider>
                  <SharedNodesProvider>
                    <WorkflowProvider>
                      <TemplateProvider>
                        <NodeDefinitionProvider>
                          <CustomCategoryProvider>
                            {/* Layout flexbox horizontal */}
                            <div className="flex h-screen overflow-hidden">
                              {/* Sidebar */}
                              <Sidebar />
                              
                              {/* Conteúdo principal */}
                              <main className="flex-1 overflow-auto">
                                {children}
                              </main>
                            </div>
                          </CustomCategoryProvider>
                        </NodeDefinitionProvider>
                      </TemplateProvider>
                    </WorkflowProvider>
                  </SharedNodesProvider>
                </NodeCreatorProvider>
              </CodeTemplateProvider>
            </VariableProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}