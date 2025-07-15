# Instruções do Projeto Synapscale

## Contexto do Projeto
Este é um projeto **frontend** React/Next.js para a plataforma Synapscale - uma ferramenta de automação visual com drag & drop para criação de workflows de IA.

## ⚠️ REGRAS CRÍTICAS

### Arquitetura Frontend-Only
- **NUNCA criar endpoints** (app/api/**, pages/api/**)
- **Frontend apenas consome APIs** do backend remoto
- Usar `ApiService` para todas as chamadas de API
- O backend roda em servidor separado

### Stack Tecnológica
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Estado**: Context API + hooks customizados
- **API**: Fetch via ApiService
- **Testes**: Jest + Testing Library

## Estrutura do Projeto

```
├── app/                    # App Router (Next.js 14)
├── components/            # Componentes React
├── lib/                   # Utilitários e serviços
│   ├── api/              # Serviços de API
│   └── services/         # Lógica de negócio
├── hooks/                # Hooks customizados
├── context/              # Providers de contexto
├── types/                # Definições TypeScript
└── .codex/               # Configurações Codex CLI
```

## Padrões de Desenvolvimento

### Componentes
- Usar `shadcn/ui` como base
- Props tipadas com TypeScript
- Export default para componentes
- Documentação inline quando necessário

### API Calls
```typescript
// ✅ CORRETO
import { ApiService } from '@/lib/api/service'
const data = await ApiService.get('/endpoint')

// ❌ ERRADO - Não criar endpoints
// app/api/route.ts
```

### Estado Global
- Context API para estado compartilhado
- Hooks customizados para lógica complexa
- Evitar prop drilling

### Estilização
- TailwindCSS para styling
- Classes utilitárias primeiro
- Componentes shadcn/ui como base
- Tema dark/light suportado

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm test

# Linting
npm run lint

# Codex CLI - Perfis
codex -p development    # Modo desenvolvimento
codex -p production     # Modo produção  
codex -p quick         # Modo rápido
```

## Contexto de Negócio

A Synapscale é uma plataforma que permite:
- Criação visual de workflows (drag & drop)
- Integração com múltiplos LLMs
- Automação de processos com IA
- Gerenciamento de templates e variáveis
- Sistema de marketplace para workflows

## Foco nas Tarefas

Ao ajudar com este projeto:
1. **Manter arquitetura frontend-only**
2. **Usar padrões estabelecidos**
3. **Seguir tipagem TypeScript**
4. **Preservar funcionalidades existentes**
5. **Testar mudanças importantes**

## Arquivos Importantes

- `lib/api/service.ts` - Serviço principal de API
- `context/` - Gerenciamento de estado
- `components/ui/` - Componentes base
- `app/layout.tsx` - Layout principal
- `.env` - Variáveis de ambiente (API keys) 