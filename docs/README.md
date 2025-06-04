# 📚 Documentação Completa - Integração Frontend/Backend

## 🎯 Visão Geral

Este projeto representa a integração completa entre o frontend Next.js e o backend FastAPI, criando uma plataforma robusta de automação com chat inteligente, gerenciamento de variáveis e workflows avançados.

## 🏗️ Arquitetura do Sistema

### Frontend (Next.js 14)
- **Framework:** Next.js 14 com App Router
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS
- **Estado Global:** Context API + useReducer
- **Autenticação:** JWT com refresh automático
- **Comunicação:** REST APIs + WebSockets

### Backend (FastAPI)
- **Framework:** FastAPI
- **Linguagem:** Python 3.11+
- **Banco de Dados:** PostgreSQL com Prisma ORM
- **Autenticação:** JWT Bearer tokens
- **WebSockets:** Para chat em tempo real
- **APIs:** RESTful com documentação automática

## 🚀 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- **Login/Logout** com JWT
- **Registro** de novos usuários
- **Refresh automático** de tokens
- **Proteção de rotas** com middleware
- **Persistência** de sessão

### 🔧 Sistema de Variáveis
- **CRUD completo** de variáveis do usuário
- **Sincronização automática** com backend
- **Modo offline** com fallback para localStorage
- **Variáveis secretas** com ocultação visual
- **Categorização** e filtros avançados
- **Importação/exportação** de arquivos .env

### 💬 Sistema de Chat
- **Chat em tempo real** via WebSockets
- **Múltiplas sessões** de conversa
- **Histórico persistente** de mensagens
- **Reconexão automática** em caso de desconexão
- **Indicadores de digitação** e status de conexão
- **Modo offline** com sincronização posterior

### 🧪 Sistema de Testes
- **Testes de integração** completos
- **Mocks** avançados para backend
- **Helpers** para cenários de teste
- **Cobertura** de todos os fluxos críticos

### 📊 Monitoramento de Performance
- **Métricas em tempo real** de performance
- **Alertas automáticos** para gargalos
- **Relatórios detalhados** de otimização
- **Monitoramento** de APIs, render e memória

## 📁 Estrutura de Arquivos

```
joaocastanheira-main/
├── app/                          # Páginas e rotas (App Router)
│   ├── api/                      # API routes do Next.js
│   ├── chat/                     # Página de chat
│   ├── login/                    # Página de login
│   ├── register/                 # Página de registro
│   ├── user-variables/           # Página de variáveis
│   └── layout.tsx                # Layout principal
├── components/                   # Componentes React
│   ├── auth/                     # Componentes de autenticação
│   ├── chat/                     # Componentes de chat
│   ├── ui/                       # Componentes de UI
│   └── variables/                # Componentes de variáveis
├── context/                      # Contextos React
│   ├── auth-context.tsx          # Contexto de autenticação
│   ├── chat-context.tsx          # Contexto de chat
│   └── variable-context.tsx      # Contexto de variáveis
├── hooks/                        # Hooks personalizados
│   ├── useAuth.ts                # Hook de autenticação
│   ├── useChat.ts                # Hook de chat
│   └── useVariables.ts           # Hook de variáveis
├── lib/                          # Bibliotecas e utilitários
│   ├── api.ts                    # Serviço de API centralizado
│   ├── config.ts                 # Configurações
│   ├── performance/              # Sistema de performance
│   ├── services/                 # Serviços especializados
│   ├── types/                    # Tipos TypeScript
│   └── utils/                    # Utilitários
├── tests/                        # Testes
│   ├── integration/              # Testes de integração
│   ├── unit/                     # Testes unitários
│   └── utils/                    # Utilitários de teste
└── docs/                         # Documentação
```

## ⚙️ Configuração e Setup

### Pré-requisitos
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Git

### 1. Setup do Frontend

```bash
# Clonar repositório
git clone https://github.com/synapscale/joaocastanheira.git
cd joaocastanheira

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local com suas configurações
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME="SynapScale Platform"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Executar em desenvolvimento
npm run dev
```

### 2. Setup do Backend

```bash
# Clonar repositório
git clone https://github.com/synapscale/synapse-backend-agents-jc.git
cd synapse-backend-agents-jc

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
# Editar .env com configurações do PostgreSQL

# Executar migrações
python -m alembic upgrade head

# Executar servidor
python -m uvicorn src.synapse.main:app --reload
```

### 3. Verificação da Integração

```bash
# Frontend rodando em: http://localhost:3000
# Backend rodando em: http://localhost:8000
# Documentação da API: http://localhost:8000/docs

# Testar conectividade
curl http://localhost:8000/health
```

## 🔧 APIs e Endpoints

### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de usuário
- `POST /auth/refresh` - Refresh do token
- `POST /auth/logout` - Logout do usuário

### Variáveis do Usuário
- `GET /user-variables` - Listar variáveis
- `POST /user-variables` - Criar variável
- `PUT /user-variables/{id}` - Atualizar variável
- `DELETE /user-variables/{id}` - Deletar variável
- `POST /user-variables/bulk` - Operações em lote

### Chat
- `GET /chat/sessions` - Listar sessões
- `POST /chat/sessions` - Criar sessão
- `DELETE /chat/sessions/{id}` - Deletar sessão
- `WS /chat/ws` - WebSocket para chat em tempo real

### Sistema
- `GET /health` - Status do sistema
- `GET /metrics` - Métricas de performance

## 🧪 Executando Testes

### Testes do Frontend

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Cobertura de testes
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

### Testes do Backend

```bash
# Testes unitários
python -m pytest tests/unit/

# Testes de integração
python -m pytest tests/integration/

# Cobertura de testes
python -m pytest --cov=src tests/
```

## 📊 Monitoramento e Performance

### Métricas Coletadas
- **API Response Time:** Tempo de resposta das APIs
- **Render Time:** Tempo de renderização dos componentes
- **Memory Usage:** Uso de memória JavaScript
- **Network Performance:** Performance da rede
- **User Interactions:** Tempo de resposta a interações

### Alertas Configurados
- **API > 1s:** Warning
- **API > 3s:** Critical
- **Render > 100ms:** Warning
- **Render > 300ms:** Critical
- **Memory > 50MB:** Warning
- **Memory > 80MB:** Critical

### Usando o Monitor

```typescript
import { performanceMonitor, usePerformanceMonitor } from '@/lib/performance/monitor'

// Em um componente
const { report, recordMetric } = usePerformanceMonitor()

// Medir operação específica
await measurePerformance(
  () => apiCall(),
  'custom-api-call',
  'api'
)
```

## 🔒 Segurança

### Autenticação
- **JWT Tokens** com expiração configurável
- **Refresh Tokens** para renovação automática
- **Headers de segurança** implementados
- **CORS** configurado adequadamente

### Proteção de Dados
- **Variáveis secretas** nunca expostas no frontend
- **Sanitização** de inputs do usuário
- **Validação** rigorosa de dados
- **HTTPS** obrigatório em produção

### Boas Práticas
- **Rate limiting** nas APIs
- **Validação** de tokens em todas as rotas protegidas
- **Logs** de segurança para auditoria
- **Criptografia** de dados sensíveis

## 🚀 Deploy em Produção

### Frontend (Vercel/Netlify)

```bash
# Build de produção
npm run build

# Configurar variáveis de ambiente
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NEXT_PUBLIC_WS_URL=wss://api.seudominio.com

# Deploy
npm run deploy
```

### Backend (Docker/Cloud)

```bash
# Build da imagem Docker
docker build -t synapse-backend .

# Executar container
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  synapse-backend
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solução:** Verificar configuração CORS no backend

#### 2. WebSocket não conecta
```
WebSocket connection failed
```
**Solução:** Verificar se o backend está rodando e se a URL do WebSocket está correta

#### 3. Token expirado
```
401 Unauthorized - Token expired
```
**Solução:** O sistema deve fazer refresh automático. Verificar implementação do refresh token

#### 4. Variáveis não sincronizam
```
Variables not syncing with backend
```
**Solução:** Verificar conectividade e logs do console para erros de API

### Logs e Debug

```bash
# Frontend - Console do browser
# Verificar Network tab para requisições
# Verificar Console tab para erros JavaScript

# Backend - Logs do servidor
tail -f logs/app.log

# Banco de dados - Logs do PostgreSQL
tail -f /var/log/postgresql/postgresql.log
```

## 📈 Roadmap Futuro

### Próximas Funcionalidades
- [ ] **Workflows visuais** com drag-and-drop
- [ ] **Marketplace** de templates
- [ ] **Integrações** com APIs externas
- [ ] **Notificações** push em tempo real
- [ ] **Dashboard** de analytics
- [ ] **Colaboração** em tempo real
- [ ] **Mobile app** React Native

### Melhorias Técnicas
- [ ] **Micro-frontends** para escalabilidade
- [ ] **GraphQL** para queries otimizadas
- [ ] **Redis** para cache distribuído
- [ ] **Kubernetes** para orquestração
- [ ] **CI/CD** automatizado
- [ ] **Monitoring** avançado com Prometheus
- [ ] **Logs** centralizados com ELK Stack

## 🤝 Contribuindo

### Processo de Desenvolvimento
1. **Fork** do repositório
2. **Criar branch** para feature (`git checkout -b feature/nova-funcionalidade`)
3. **Implementar** mudanças com testes
4. **Commit** com mensagens descritivas
5. **Push** para o branch (`git push origin feature/nova-funcionalidade`)
6. **Criar Pull Request** com descrição detalhada

### Padrões de Código
- **TypeScript** obrigatório no frontend
- **ESLint + Prettier** para formatação
- **Conventional Commits** para mensagens
- **Testes** obrigatórios para novas funcionalidades
- **Documentação** atualizada para mudanças

## 📞 Suporte

### Contatos
- **Email:** suporte@synapscale.com
- **Discord:** [SynapScale Community](https://discord.gg/synapscale)
- **GitHub Issues:** Para bugs e feature requests

### Documentação Adicional
- **API Docs:** http://localhost:8000/docs
- **Storybook:** http://localhost:6006 (em desenvolvimento)
- **Wiki:** https://github.com/synapscale/docs/wiki

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **Equipe SynapScale** pelo desenvolvimento
- **Comunidade Open Source** pelas bibliotecas utilizadas
- **Beta Testers** pelo feedback valioso

---

**Versão:** 1.0.0  
**Última Atualização:** 04/06/2025  
**Autor:** Equipe SynapScale

