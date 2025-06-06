/**
 * Design System - Atomic Design
 * 
 * Este arquivo implementa a estrutura de Atomic Design para o projeto,
 * organizando componentes em átomos, moléculas, organismos, templates e páginas.
 */

/**
 * Estrutura de diretórios do Atomic Design:
 * 
 * /components
 *   /atoms        - Componentes básicos e indivisíveis (botões, inputs, ícones)
 *   /molecules    - Grupos de átomos funcionando juntos (formulários, cards simples)
 *   /organisms    - Grupos complexos de moléculas (headers, sidebars, chat messages)
 *   /templates    - Layouts que organizam organismos (layouts de página)
 *   /pages        - Implementações específicas de templates com dados reais
 */

// Exporta a estrutura para uso em toda a aplicação
export const ATOMIC_DESIGN_STRUCTURE = {
  atoms: [
    "button",
    "input",
    "checkbox",
    "radio",
    "select",
    "toggle",
    "slider",
    "avatar",
    "badge",
    "icon",
    "tooltip",
    "label",
    "text",
    "heading",
    "spinner",
    "progress",
    "divider",
  ],
  molecules: [
    "form-field",
    "search-input",
    "dropdown",
    "menu-item",
    "tabs",
    "accordion-item",
    "card",
    "alert",
    "toast",
    "popover",
    "dialog-header",
    "dialog-footer",
    "pagination",
    "breadcrumb",
    "tag-input",
    "color-picker",
  ],
  organisms: [
    "navbar",
    "sidebar",
    "footer",
    "chat-message",
    "chat-input-area",
    "message-list",
    "model-selector-panel",
    "tool-selector-panel",
    "canvas-toolbar",
    "node-editor",
    "settings-panel",
    "file-explorer",
    "user-profile",
    "notification-center",
  ],
  templates: [
    "auth-layout",
    "dashboard-layout",
    "chat-layout",
    "canvas-layout",
    "settings-layout",
    "documentation-layout",
    "split-view-layout",
  ],
  pages: [
    "login-page",
    "register-page",
    "dashboard-page",
    "chat-page",
    "canvas-page",
    "settings-page",
    "documentation-page",
    "profile-page",
    "not-found-page",
  ],
};

/**
 * Guia de implementação do Atomic Design
 * 
 * 1. Átomos:
 *    - Devem ser os menores componentes possíveis
 *    - Não devem depender de outros componentes
 *    - Devem ser altamente reutilizáveis
 *    - Exemplos: Button, Input, Icon
 * 
 * 2. Moléculas:
 *    - Combinam átomos para criar componentes com funcionalidade específica
 *    - Devem ter uma única responsabilidade
 *    - Exemplos: FormField (Label + Input), SearchInput (Input + Button)
 * 
 * 3. Organismos:
 *    - Combinam moléculas e átomos para criar seções complexas da interface
 *    - Podem conter lógica de negócio mais complexa
 *    - Exemplos: Header, Sidebar, ChatMessage
 * 
 * 4. Templates:
 *    - Definem a estrutura de uma página
 *    - Organizam organismos em um layout coerente
 *    - Não contêm dados específicos, apenas placeholders
 *    - Exemplos: DashboardLayout, ChatLayout
 * 
 * 5. Páginas:
 *    - Instâncias específicas de templates com dados reais
 *    - Conectam-se a APIs e gerenciam estado
 *    - Exemplos: ChatPage, CanvasPage
 */

/**
 * Benefícios do Atomic Design:
 * 
 * 1. Consistência: Componentes reutilizáveis garantem uma interface consistente
 * 2. Eficiência: Facilita o desenvolvimento paralelo e a manutenção
 * 3. Escalabilidade: Estrutura clara para adicionar novos componentes
 * 4. Documentação: Facilita a compreensão da arquitetura do frontend
 * 5. Testabilidade: Componentes isolados são mais fáceis de testar
 */

/**
 * Implementação prática:
 * 
 * 1. Criar diretórios para cada nível (atoms, molecules, etc.)
 * 2. Mover componentes existentes para os diretórios apropriados
 * 3. Refatorar componentes para seguir os princípios do Atomic Design
 * 4. Documentar cada componente com JSDoc
 * 5. Criar índices para exportação organizada
 */

// Exemplo de implementação de um átomo
export const ButtonExample = `
/**
 * Button Atom
 * 
 * Componente básico de botão com variantes, tamanhos e estados.
 */
export function Button({
  variant = "default",
  size = "default",
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        props.className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
`;

// Exemplo de implementação de uma molécula
export const FormFieldExample = `
/**
 * FormField Molecule
 * 
 * Combina Label e Input atoms para criar um campo de formulário.
 */
export function FormField({
  label,
  name,
  error,
  children,
  ...props
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
`;

// Exemplo de implementação de um organismo
export const HeaderExample = `
/**
 * Header Organism
 * 
 * Combina Logo, Navigation e UserMenu para criar um cabeçalho completo.
 */
export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <Navigation />
        <UserMenu />
      </div>
    </header>
  );
}
`;

// Exemplo de implementação de um template
export const DashboardLayoutExample = `
/**
 * DashboardLayout Template
 * 
 * Define a estrutura básica para páginas de dashboard.
 */
export function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="container py-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
`;

// Exemplo de implementação de uma página
export const ChatPageExample = `
/**
 * ChatPage Page
 * 
 * Implementação específica do template ChatLayout com dados reais.
 */
export default function ChatPage() {
  const { messages, sendMessage } = useChat();
  
  return (
    <ChatLayout>
      <MessageList messages={messages} />
      <ChatInputArea onSendMessage={sendMessage} />
    </ChatLayout>
  );
}
`;
