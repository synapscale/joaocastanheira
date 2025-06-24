# SynapScale Frontend - Visão Geral do Projeto

## 📋 Informações Básicas

**Nome**: SynapScale Frontend (ai-agents-canvas-integrated-frontend)
**Versão**: 0.1.0
**Tipo**: Plataforma de Automação com IA - Interface do Usuário
**Framework**: Next.js 15.3.2 com React 18.3.1
**Linguagem**: TypeScript 5.x

## 🎯 Propósito

Plataforma moderna para automação de workflows com inteligência artificial, oferecendo uma interface intuitiva para criação visual de automações, marketplace de templates, agentes de IA e chat interativo.

## 🏗️ Arquitetura Principal

### Stack Tecnológico
- **Frontend**: Next.js 15.3.2 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.x
- **Estilização**: Tailwind CSS 3.4.17
- **Componentes**: Radix UI (sistema completo)
- **Animações**: Framer Motion
- **Formulários**: React Hook Form + Zod
- **Estado**: Context API + Hooks customizados
- **Testes**: Jest + Testing Library + Cypress

### Estrutura de Diretórios
```
├── app/                    # App Router (Next.js 15)
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas protegidas
│   ├── admin/             # Área administrativa
│   ├── agentes/           # Gestão de agentes IA
│   ├── analytics/         # Analytics e métricas
│   ├── api/               # API routes
│   ├── canvas/            # Editor visual de workflows
│   ├── chat/              # Interface de chat
│   ├── docs/              # Documentação
│   ├── marketplace/       # Templates e componentes
│   ├── team/              # Gestão de equipes
│   ├── workflows/         # Gestão de workflows
│   └── workspaces/        # Gestão de workspaces
├── components/            # Componentes reutilizáveis
├── context/              # Contextos React
├── hooks/                # Hooks customizados
├── lib/                  # Utilitários e configurações
├── types/                # Definições TypeScript
└── middleware.ts         # Middleware de autenticação
```

## 🔧 Funcionalidades Principais

### 1. **Editor de Workflow (Canvas)**
- Criação visual de automações
- Drag & drop de nós
- Conexões entre componentes
- Visualização em tempo real

### 2. **Sistema de Agentes IA**
- Configuração de assistentes
- Integração com múltiplos modelos
- Personalização de comportamento

### 3. **Chat Interativo**
- Comunicação em tempo real
- WebSocket integration
- Histórico de conversas

### 4. **Marketplace**
- Templates de workflows
- Componentes reutilizáveis
- Sistema de categorias

### 5. **Gestão de Equipes**
- Workspaces colaborativos
- Controle de permissões
- Gestão de membros

### 6. **Analytics**
- Métricas de uso
- Performance de workflows
- Dashboards interativos

## 🔐 Autenticação e Segurança

### Sistema de Autenticação
- JWT tokens
- Middleware de proteção de rotas
- Refresh automático
- Gestão de sessão

### Fluxo de Segurança
1. Login/Registro via API
2. Recebimento de JWT token
3. Armazenamento seguro
4. Middleware de verificação
5. Proteção automática de rotas

## 🌐 Integração com Backend

### Comunicação
- **REST API**: Operações CRUD
- **WebSocket**: Tempo real (chat, notificações)
- **Autenticação**: JWT tokens

### Endpoints Principais
- `/api/v1/auth/*` - Autenticação
- `/api/v1/workflows/*` - Workflows
- `/api/v1/agents/*` - Agentes IA
- `/ws` - WebSocket para tempo real

## 🎨 Sistema de Design

### Componentes UI
- Radix UI como base
- Tailwind CSS para estilização
- Framer Motion para animações
- Tema escuro/claro
- Design responsivo

### Padrões de Componentes
- Componentes atômicos em `/components/ui/`
- Componentes de feature em subdiretórios específicos
- Hooks customizados para lógica reutilizável
- Context API para estado global

## 🧪 Testes

### Estratégia de Testes
- **Unitários**: Jest + Testing Library
- **Integração**: Testing Library
- **E2E**: Cypress
- **Coverage**: Configurado para relatórios

### Configuração
- Jest configurado para ambiente Next.js
- Setup de testes em `jest.setup.js`
- Mocks para APIs e componentes

## 📦 Dependências Principais

### Produção
- Next.js 15.3.2
- React 18.3.1
- Radix UI (conjunto completo)
- Framer Motion
- Tailwind CSS
- React Hook Form + Zod
- Lucide React (ícones)

### Desenvolvimento
- TypeScript 5.x
- ESLint + Next.js config
- Jest + Testing Library
- Cypress
- Babel presets

## 🚀 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Executar produção
npm run lint         # Verificar código
npm run test         # Testes unitários
npm run test:watch   # Testes em watch mode
npm run test:coverage # Testes com coverage
npm run test:e2e     # Testes E2E
```

## 🔄 Fluxo de Desenvolvimento

### Ambiente de Desenvolvimento
1. `npm install` - Instalar dependências
2. Configurar `.env.local` com variáveis
3. `npm run dev` - Iniciar servidor
4. Acessar `http://localhost:3000`

### Build e Deploy
- Build otimizado com Next.js
- Deploy recomendado: Vercel
- Suporte a Docker
- PM2 para servidores manuais

## 📈 Performance

### Otimizações Implementadas
- Code Splitting automático
- Image Optimization do Next.js
- Lazy Loading de componentes
- Memoização de componentes pesados
- Bundle analysis disponível

### Métricas Alvo
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.5s

## 🔧 Configuração

### Variáveis de Ambiente
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

### Arquivos de Configuração
- `next.config.js` - Configuração Next.js
- `tailwind.config.ts` - Configuração Tailwind
- `tsconfig.json` - Configuração TypeScript
- `jest.config.js` - Configuração Jest
- `middleware.ts` - Middleware de autenticação

## 📝 Documentação

### Estrutura de Docs
- `/docs/` - Documentação técnica
- `README.md` - Guia principal
- `CONTRIBUTING.md` - Guia de contribuição
- Guias específicos para API, deploy, etc.

### Recursos Disponíveis
- Guias de configuração
- Documentação de API
- Tutoriais de desenvolvimento
- Troubleshooting

---

**Última atualização**: 24/06/2025
**Versão do documento**: 1.0.0
