"use client"

import { NodeCreatorProvider } from '@/context/node-creator/node-creator-context';
import { SharedNodesProvider } from '@/context/node-creator/shared-nodes-context';
import { WorkflowProvider } from '@/context/workflow-context';
import { TemplateProvider } from '@/context/template-context';
import { NodeDefinitionProvider } from '@/context/node-definition-context';
import { CustomCategoryProvider } from '@/context/custom-category-context';
import { VariableProvider } from '@/context/variable-context';
import { CodeTemplateProvider } from '@/context/code-template-context';
import { SidebarProvider } from '@/context/sidebar-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { WorkspaceProvider } from '@/context/workspace-context';
import { AppProvider } from '@/context/app-context';
import { DevBanner } from '@/components/ui/dev-banner';
import { VariableAutoSync } from '@/components/variables/auto-sync';
import { ThemeProvider } from 'next-themes';
import { ClientLayout } from '@/components/client-layout';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css';
import { UserVariableProvider } from '@/context/user-variable-context';
import { NodeTemplateProvider } from '@/context/node-template-context';
import { MarketplaceProvider } from '@/context/marketplace-context';
import { PlanProvider } from '@/context/plan-context';
// import { PostSignupOnboarding, usePostSignupOnboarding } from '@/components/onboarding/post-signup-onboarding';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
// import LoadingSpinner from '@/components/loading-spinner';

// Componente interno para layout com onboarding
function AppLayoutContent({ children }: { children: React.ReactNode }) {
  // const { shouldShow, hideOnboarding } = usePostSignupOnboarding()

  return (
    <>
      {/* Sincronização automática de variáveis - TEMPORARIAMENTE DESABILITADO PARA TESTE */}
      {/* <VariableAutoSync /> */}
      
      {/* Layout com sidebar integrada */}
      <ClientLayout>
        {children}
      </ClientLayout>

      {/* Onboarding pós-signup - DESABILITADO TEMPORARIAMENTE */}
      {/* <PostSignupOnboarding
        isOpen={shouldShow}
        onComplete={hideOnboarding}
      /> */}
      
      {/* Toast notifications */}
      <Toaster />
    </>
  )
}

// Componente interno que usa o contexto de autenticação
function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Rotas de autenticação que não devem mostrar a sidebar
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = pathname ? authRoutes.some(route => pathname.startsWith(route)) : false;
  
  // ❌ REMOVIDO: Verificação de autenticação daqui - deixar para middleware e ProtectedRoute
  // Apenas verificar se é rota de auth para decidir layout
  if (isAuthRoute) {
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
        <UserVariableProvider>
          <CodeTemplateProvider>
            <NodeCreatorProvider>
              <SharedNodesProvider>
                <WorkflowProvider>
                  <TemplateProvider>
                    <NodeDefinitionProvider>
                      <NodeTemplateProvider>
                        <MarketplaceProvider>
                          <CustomCategoryProvider>
                            <AppLayoutContent>{children}</AppLayoutContent>
                          </CustomCategoryProvider>
                        </MarketplaceProvider>
                      </NodeTemplateProvider>
                    </NodeDefinitionProvider>
                  </TemplateProvider>
                </WorkflowProvider>
              </SharedNodesProvider>
            </NodeCreatorProvider>
          </CodeTemplateProvider>
        </UserVariableProvider>
      </VariableProvider>
    </SidebarProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // INTERCEPTOR GLOBAL PARA CAPTURAR TODOS OS REQUESTS - HABILITADO PARA DEBUG
  if (typeof window !== 'undefined' && !window.FETCH_INTERCEPTED) {
    window.FETCH_INTERCEPTED = true
    const originalFetch = window.fetch
    
    window.fetch = function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url
      const method = args[1]?.method || 'GET'
      
      // Log TODOS os requests com stack trace
      console.log('🌐 ALL FETCH INTERCEPTED:', {
        url,
        method,
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack?.split('\n').slice(1, 5).join('\n')
      })
      
      return originalFetch.apply(this, args)
    }
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground" suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <WorkspaceProvider>
              <PlanProvider>
                <AppProvider>
                  <DevBanner />
                  <AppLayout>
                    {children}
                  </AppLayout>
                </AppProvider>
              </PlanProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
