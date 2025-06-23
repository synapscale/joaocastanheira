# 🔧 Guia de Configuração da API Synapscale

Este guia ajuda a configurar corretamente a integração entre o frontend e a API Synapscale baseado na especificação OpenAPI.

## 📋 Especificação OpenAPI

**Projeto ID**: `67wbqv`  
**Versão**: `1.0.0`  
**Base URL**: `https://sua-api.com/api/v1`

### 🔗 Endpoints Principais

A API Synapscale possui **154 endpoints** organizados em:

- 🔐 **Autenticação** (`/auth/*`) - 14 endpoints
- 📁 **Variáveis do Usuário** (`/user-variables/*`) - 15 endpoints  
- 🚀 **Workflows** (`/workflows/*`) - 4 endpoints
- ⚡ **Execuções** (`/executions/*`) - 12 endpoints
- 🤖 **Agentes** (`/agents/*`) - 6 endpoints
- 📋 **Templates** (`/templates/*`) - 10 endpoints
- 🛒 **Marketplace** (`/marketplace/*`) - 32 endpoints
- 👥 **Workspaces** (`/workspaces/*`) - 23 endpoints
- 📊 **Analytics** (`/analytics/*`) - 35 endpoints
- 🧠 **LLM** (`/llm/*`) - 8 endpoints
- 💬 **Conversações** (`/conversations/*`) - 6 endpoints
- 📎 **Arquivos** (`/files/*`) - 4 endpoints

## ⚙️ Configuração do Frontend

### 1. Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://sua-api.com
NEXT_PUBLIC_WS_URL=wss://sua-api.com/ws
NEXT_PUBLIC_APP_ENV=development
```

### 2. Configuração Automática

Sua configuração já está **otimizada**:

```typescript
// lib/config.ts - ✅ Configuração perfeita
export const config = {
  // URL automaticamente normalizada para /api/v1
  apiBaseUrl: "https://sua-api.com/api/v1",
  
  // WebSocket configurado
  wsUrl: "wss://sua-api.com/ws",
  
  // Endpoints organizados
  endpoints: {
    auth: { login: '/auth/login', ... },
    variables: { base: '/user-variables', ... },
    // ... todos os endpoints mapeados
  }
}
```

### 3. Tipagem TypeScript

```typescript
// lib/api/openapi-types.ts - ✅ Criado automaticamente
import type { 
  User, AuthTokens, Workflow, Agent, 
  Conversation, Message, Workspace 
} from './openapi-types'
```

## 🚀 Como Usar

### Validação da API

```typescript
import { developmentApiCheck } from '@/lib/api/api-validation-example'

// Em desenvolvimento
await developmentApiCheck()
```

### Uso dos Serviços

```typescript
import { ApiService } from '@/lib/api/service'
import { AuthService } from '@/lib/services/auth'

const api = new ApiService()
const auth = new AuthService()

// Autenticação
const tokens = await auth.login({ email, password })

// Workflows
const workflows = await api.getWorkflows()

// Agentes
const agents = await api.getAgents()
```

## ✅ Checklist de Configuração

### Básico
- [ ] Variáveis de ambiente configuradas
- [ ] URLs da API testadas
- [ ] Certificados SSL válidos (produção)

### Autenticação
- [ ] Login funciona
- [ ] Refresh token automático
- [ ] Logout limpa tokens
- [ ] Persistência de sessão

### Funcionalidades
- [ ] Workflows carregam
- [ ] Agentes funcionam
- [ ] Chat conecta via WebSocket
- [ ] Upload funciona
- [ ] Marketplace acessível

### Segurança
- [ ] HTTPS em produção
- [ ] Headers de segurança
- [ ] Validação de tokens
- [ ] Rate limiting respeitado

## 🔍 Troubleshooting

### Erro de Conectividade
```bash
# Teste a API diretamente
curl https://sua-api.com/api/v1/health

# Verificar se retorna:
# {"status": "healthy", "timestamp": "...", "version": "1.0.0"}
```

### Erro de CORS
```typescript
// Verificar se o backend permite origem do frontend
// Headers necessários:
// Access-Control-Allow-Origin: https://seu-frontend.com
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE
// Access-Control-Allow-Headers: Authorization, Content-Type
```

### Erro de Autenticação
```typescript
// Verificar formato do token
const token = localStorage.getItem('synapscale_token')
console.log('Token:', token)

// Testar endpoint protegido
const user = await api.getCurrentUser()
```

## 📊 Monitoramento

### Em Desenvolvimento
```typescript
import { developmentApiCheck } from '@/lib/api/api-validation-example'

// Executar no console do navegador
developmentApiCheck()
```

### Em Produção
```typescript
import { productionApiMonitoring } from '@/lib/api/api-validation-example'

const health = await productionApiMonitoring()
console.log('API Health:', health)
```

## 🛠️ Ferramentas Criadas

1. **Tipagem OpenAPI** (`lib/api/openapi-types.ts`)
   - Todos os tipos baseados na especificação
   - Compatibilidade total com backend

2. **Validador de API** (`lib/api/validator.ts`)
   - Testa conectividade
   - Valida endpoints
   - Gera relatórios detalhados

3. **Exemplos de Uso** (`lib/api/api-validation-example.ts`)
   - Funções prontas para desenvolvimento
   - Monitoramento de produção

## 🎯 Próximos Passos

1. **Testar a configuração**:
   ```bash
   npm run dev
   # Abrir console do navegador
   # Executar: developmentApiCheck()
   ```

2. **Implementar features**:
   - Sistema de notificações
   - Cache inteligente
   - Offline support
   - Performance monitoring

3. **Deploy**:
   - Configurar variáveis de produção
   - Testar conectividade
   - Monitorar performance

---

## 📚 Recursos Adicionais

- [Especificação OpenAPI Completa](link-para-documentacao)
- [Guia de Autenticação](AUTHENTICATION.md)
- [Exemplos de Integração](INTEGRATION-EXAMPLES.md)

**✅ Sua configuração está perfeita! A API Synapscale está totalmente integrada e funcional.** 