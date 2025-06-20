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
import { WorkspaceProvider } from '@/context/workspace-context';
import { AppProvider } from '@/context/app-context';
import { DevBanner } from '@/components/ui/dev-banner';
import { VariableAutoSync } from '@/components/variables/auto-sync';
import { ThemeProvider } from 'next-themes';
import { Sidebar } from '@/components/sidebar';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css';
import { UserVariableProvider } from '@/context/user-variable-context';
import { NodeTemplateProvider } from '@/context/node-template-context';
import { MarketplaceProvider } from '@/context/marketplace-context';
import { PlanProvider } from '@/context/plan-context';
import { PostSignupOnboarding, usePostSignupOnboarding } from '@/components/onboarding/post-signup-onboarding';
import { Toaster } from '@/components/ui/toaster';

// Componente interno para layout com onboarding
function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { shouldShow, hideOnboarding } = usePostSignupOnboarding()

  return (
    <>
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

      {/* Onboarding pós-signup */}
      <PostSignupOnboarding
        isOpen={shouldShow}
        onComplete={hideOnboarding}
      />
      
      {/* Toast notifications */}
      <Toaster />
    </>
  )
}

// Componente interno que usa o contexto de autenticação
function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const pathname = usePathname();
  
  // Rotas de autenticação que não devem mostrar a sidebar
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = pathname ? authRoutes.some(route => pathname.startsWith(route)) : false;
  
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
      </body>
    </html>
  );
}
