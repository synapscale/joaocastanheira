# 🚀 SynapScale Frontend

*Plataforma de Automação com IA - Interface do Usuário*

## 📋 Sobre o Projeto

O SynapScale Frontend é uma aplicação moderna construída com Next.js 15 e React 19, oferecendo uma interface intuitiva para automação de workflows com inteligência artificial.

## ✨ Funcionalidades

### 🎨 **Interface Moderna**
- Design responsivo com Tailwind CSS
- Componentes Radix UI
- Animações Framer Motion
- Tema escuro/claro

### 🔧 **Funcionalidades Principais**
- **Editor de Workflow** - Criação visual de automações
- **Marketplace** - Templates e componentes
- **Agentes de IA** - Configuração de assistentes
- **Chat Interativo** - Comunicação em tempo real
- **Variáveis do Usuário** - Gerenciamento de dados
- **Documentação** - Guias e tutoriais

### 🔐 **Autenticação**
- Sistema completo de login/registro
- JWT tokens
- Proteção de rotas
- Gerenciamento de sessão

## 🛠️ Tecnologias

- **Framework**: Next.js 15.3.2
- **React**: 19.0.0
- **TypeScript**: 5.7.2
- **Estilização**: Tailwind CSS 3.4.1
- **Componentes**: Radix UI
- **Animações**: Framer Motion 11.15.0
- **Formulários**: React Hook Form + Zod
- **Estado**: Context API + Hooks
- **HTTP**: Axios
- **WebSocket**: Socket.io Client

## 🚀 Quick Start

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Backend SynapScale rodando

### **Instalação**

```bash
# 1. Clonar/extrair o projeto
cd synapscale-frontend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local

# 4. Editar .env.local com suas configurações
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_WS_URL=ws://localhost:8000

# 5. Executar em desenvolvimento
npm run dev

# 6. Acessar
# http://localhost:3000
```

### **Build para Produção**

```bash
# Build
npm run build

# Executar produção
npm start

# Ou com PM2
pm2 start ecosystem.config.js
```

## 📁 Estrutura do Projeto

```
├── app/                    # App Router (Next.js 15)
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas protegidas
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base
│   ├── auth/             # Componentes de autenticação
│   ├── dashboard/        # Componentes do dashboard
│   └── common/           # Componentes comuns
├── context/              # Contextos React
├── hooks/                # Hooks customizados
├── lib/                  # Utilitários e configurações
│   ├── api.ts           # Cliente HTTP
│   ├── config.ts        # Configurações
│   └── utils.ts         # Funções utilitárias
├── public/               # Arquivos estáticos
├── types/                # Definições TypeScript
└── middleware.ts         # Middleware de autenticação
```

## 🔧 Configuração

### **Variáveis de Ambiente**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

### **Configuração da API**

O frontend se comunica com o backend através de:
- **REST API**: Operações CRUD
- **WebSocket**: Tempo real (chat, notificações)
- **Autenticação**: JWT tokens

## 🎨 Componentes Principais

### **Layout e Navegação**
- `Sidebar` - Navegação lateral
- `Header` - Cabeçalho com usuário
- `Layout` - Layout responsivo

### **Autenticação**
- `LoginForm` - Formulário de login
- `RegisterForm` - Formulário de registro
- `AuthProvider` - Contexto de autenticação

### **Dashboard**
- `WorkflowEditor` - Editor visual
- `MarketplaceGrid` - Grid de templates
- `ChatInterface` - Interface de chat
- `UserVariables` - Gerenciamento de variáveis

## 🔐 Autenticação e Segurança

### **Fluxo de Autenticação**
1. Login/Registro via API
2. Recebimento de JWT token
3. Armazenamento seguro
4. Middleware de proteção
5. Refresh automático

### **Proteção de Rotas**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Verificação de autenticação
  // Redirecionamento automático
}
```

## 🌐 Deploy

### **Vercel (Recomendado)**
```bash
# Deploy automático
vercel

# Ou configurar no dashboard
# https://vercel.com
```

### **Docker**
```bash
# Build da imagem
docker build -t synapscale-frontend .

# Executar container
docker run -p 3000:3000 synapscale-frontend
```

### **Servidor Manual**
```bash
# Build
npm run build

# Executar
npm start

# Com PM2
pm2 start npm --name "synapscale-frontend" -- start
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e
```

## 📈 Performance

### **Otimizações Implementadas**
- **Code Splitting** automático
- **Image Optimization** do Next.js
- **Bundle Analysis** com @next/bundle-analyzer
- **Lazy Loading** de componentes
- **Memoização** de componentes pesados

### **Métricas**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🔄 Integração com Backend

### **Endpoints Principais**
- `POST /api/v1/auth/register` - Registro
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/workflows` - Listar workflows
- `POST /api/v1/workflows` - Criar workflow
- `WebSocket /ws` - Tempo real

### **Estrutura de Dados**
```typescript
interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  created_at: string
}

interface Workflow {
  id: string
  name: string
  description: string
  nodes: Node[]
  connections: Connection[]
}
```

## 🐛 Troubleshooting

### **Problemas Comuns**

**1. Erro de CORS**
```bash
# Verificar configuração do backend
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

**2. Variáveis de ambiente não carregam**
```bash
# Verificar arquivo .env.local
# Reiniciar servidor de desenvolvimento
```

**3. Build falha**
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Suporte

- **Documentação**: [docs.synapscale.com](https://docs.synapscale.com)
- **Issues**: GitHub Issues
- **Email**: suporte@synapscale.com

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**SynapScale Frontend v1.0.0** - Construído com ❤️ pela equipe SynapScale

