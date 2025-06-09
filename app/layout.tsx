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
import { AuthProvider, useAuth } from '@/context/auth-context';
import { VariableAutoSync } from '@/components/variables/auto-sync';
import { ThemeProvider } from 'next-themes';
import { Sidebar } from '@/components/sidebar';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css';

// Componente interno que usa o contexto de autenticação
function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const pathname = usePathname();
  
  // Rotas de autenticação que não devem mostrar a sidebar
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Mostrar loading enquanto inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Se não está autenticado ou está em rota de auth, mostrar layout simples
  if (!isAuthenticated || isAuthRoute) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
    );
  }
  
  // Se está autenticado, mostrar layout completo com sidebar
  return (
    <SidebarProvider>
      <VariableProvider>
        <CodeTemplateProvider>
          <NodeCreatorProvider>
            <SharedNodesProvider>
              <WorkflowProvider>
                <TemplateProvider>
                  <NodeDefinitionProvider>
                    <CustomCategoryProvider>
                      {/* Sincronização automática de variáveis */}
                      <VariableAutoSync />
                      
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
  );
}

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
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}