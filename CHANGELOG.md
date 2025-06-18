# 📋 CHANGELOG

Todas as mudanças importantes do projeto serão documentadas neste arquivo.

## [1.0.0] - 2025-06-09

### ✨ Adicionado
- Interface completa do usuário com Next.js 15
- Sistema de autenticação JWT
- Editor visual de workflows
- Marketplace de templates
- Chat interativo em tempo real
- Gerenciamento de variáveis do usuário
- Agentes de IA configuráveis
- Documentação integrada
- Tema responsivo com Tailwind CSS
- Componentes Radix UI
- Animações Framer Motion
- Middleware de proteção de rotas
- Configuração de ambiente flexível

### 🔧 Configurado
- Estrutura de projeto Next.js 15
- TypeScript para tipagem
- ESLint e Prettier
- Tailwind CSS para estilização
- Axios para requisições HTTP
- Context API para gerenciamento de estado
- React Hook Form para formulários
- Zod para validação

### 🐛 Corrigido
- Configuração de variáveis de ambiente
- Integração com backend
- Problemas de CORS
- Validação de formulários
- Navegação entre páginas

### 📚 Documentado
- README completo
- Guia de instalação
- Configuração de ambiente
- Estrutura do projeto
- Guia de deploy

## [2025-01-27] - Correção de Redirecionamento Após Login

### 🐛 Correções
- **Problema de redirecionamento após login resolvido**
  - Identificado conflito entre middleware (que verifica cookies) e AuthService (que usa localStorage)
  - AuthService agora define cookies automaticamente ao armazenar tokens
  - Middleware melhorado para verificar tanto cookies quanto headers Authorization
  - LoginForm e LoginPage agora usam `window.location.href/replace` para redirecionamento forçado
  - Adicionados logs de debug extensivos para facilitar troubleshooting futuro

- **⚡ CORREÇÃO CRÍTICA: Loop infinito de redirecionamento resolvido**
  - Removido `window.location.replace` do useEffect da página de login
  - Melhorada lógica do middleware para evitar redirecionamentos desnecessários
  - LoginForm agora usa `router.push` com delay para garantir propagação de cookies
  - Logs de debug temporários removidos para melhor performance

- **🔧 CORREÇÃO CRÍTICA: Erro "useApp must be used within an AppProvider" resolvido**
  - AppProvider adicionado corretamente ao layout principal (`app/layout.tsx`)
  - Corrigidos imports inconsistentes entre `context/app-context.tsx` e `contexts/app-context.tsx`
  - Hook `use-chat.tsx` atualizado para usar `ChatContext` ao invés de `AppContext`
  - Removidos imports duplicados e inconsistentes

- **🔧 CORREÇÃO CRÍTICA: Erro "Cannot read properties of undefined (reading 'chat')" resolvido**
  - Corrigido conflito de nomes de parâmetros no `ChatService.createSession()`
  - Parâmetro `config` renomeado para `chatConfig` para evitar sobreposição com objeto global `config`
  - Método `connectToSession()` corrigido para obter token diretamente do localStorage
  - Todas as referências a `config.endpoints.chat` agora funcionam corretamente

### 🔧 Mudanças Técnicas
- **lib/services/auth.ts**: 
  - Classe `AuthStorageImpl` agora define cookies além do localStorage
  - Método `checkAuthStatus` melhorado com logs de debug
  - Cookies são definidos com configurações apropriadas (SameSite=Lax, Secure condicional)
  - Adicionado método `getCookie` para verificação
  - Verificação automática de criação de cookies
  
- **middleware.ts**: 
  - Função `isAuthenticated` melhorada para verificar múltiplas fontes de token
  - Fallback para header Authorization quando cookie não está disponível
  - Lógica simplificada e sem redundâncias
  - Logs condicionais apenas em desenvolvimento
  - Melhor tratamento de erros na verificação de tokens
  
- **components/auth/login-form.tsx**: 
  - Redirecionamento após sucesso usa `router.push` com delay de 250ms
  - Log de confirmação do redirecionamento
  
- **app/login/page.tsx**: 
  - UseEffect usa `router.replace` normal para evitar loops
  
- **context/auth-context.tsx**: 
  - Logs de debug reduzidos para essenciais apenas

### 📋 Como Testar
1. Acesse a aplicação pela primeira vez (deve ir para `/login` sem parâmetros redirect desnecessários)
2. Faça login na aplicação
3. Verifique se é redirecionado automaticamente para `/chat`
4. Se já estiver logado e tentar acessar `/login`, deve ser redirecionado automaticamente
5. Não deve haver loops infinitos de redirecionamento
6. Console deve ter logs mínimos, sem spam (logs de debug apenas em desenvolvimento)
7. Verifique no console se cookies estão sendo criados corretamente

### ⚠️ **Possíveis Pontos de Atenção**
- Em ambiente de produção (HTTPS), cookies terão flag `Secure=true`
- Em desenvolvimento (HTTP), cookies terão flag `Secure=false`
- Delay de 250ms após login é intencional para garantir propagação de cookies
- Logs de middleware só aparecem em ambiente de desenvolvimento

