# Sistema de Chat - Documentação Completa

## Visão Geral

O sistema de chat é uma implementação completa de interface conversacional com LLMs (Large Language Models) que integra múltiplos provedores de IA (OpenAI, Anthropic, Google) com uma interface moderna e responsiva.

## Arquitetura do Sistema

### Componentes Principais

```
Sistema de Chat
├── Frontend (React/Next.js)
│   ├── ChatInterface (components/chat/chat-interface.tsx)
│   ├── ChatInput (components/chat/chat-input.tsx)
│   ├── MessagesArea (components/chat/messages-area.tsx)
│   └── Componentes de Suporte
├── Hooks de Estado
│   ├── useConversations (hooks/use-conversations.ts)
│   └── useChat (context/chat-context.tsx)
├── Serviços
│   ├── ChatService (lib/services/chat.ts)
│   ├── AI Utils (lib/ai-utils.ts)
│   └── API Service (lib/api/service.ts)
└── Backend APIs
    ├── /api/v1/conversations/
    ├── /api/v1/llm/chat
    └── /api/chat/ (fallback)
```

## Fluxo de Funcionamento

### 1. Inicialização
- Sistema carrega conversas existentes via API
- Configura contextos de chat e conversas
- Inicializa estado local com localStorage como backup

### 2. Envio de Mensagem
```
Usuário digita → ChatInput → useConversations.sendMessage() → ChatService → API → Resposta
```

### 3. Processamento
- Mensagem aparece imediatamente na interface
- Chamada para LLM via API
- Resposta processada e exibida
- Estado sincronizado com backend

## Estrutura de Arquivos

```
components/chat/
├── chat-interface.tsx          # Interface principal
├── chat-input.tsx             # Campo de entrada
├── messages-area.tsx          # Área de mensagens
├── chat-header.tsx            # Cabeçalho do chat
├── chat-processing-status.tsx # Status de processamento
├── typing-indicator.tsx       # Indicador de digitação
└── chat-message/
    ├── index.tsx              # Componente de mensagem
    ├── assistant-message.tsx  # Mensagem do assistente
    ├── user-message.tsx       # Mensagem do usuário
    └── message-actions.tsx    # Ações da mensagem

hooks/
├── use-conversations.ts       # Hook principal de conversas
└── use-chat.ts               # Hook de chat básico

lib/
├── services/
│   └── chat.ts               # Serviço de chat
├── ai-utils.ts               # Utilitários de IA
├── utils/
│   ├── model-mapper.ts       # Mapeamento de modelos
│   └── json-utils.ts         # Utilitários JSON
└── api/
    └── service.ts            # Serviço de API

context/
├── chat-context.tsx          # Contexto de chat
└── app-context.tsx           # Contexto da aplicação
```

## Recursos Principais

### ✅ Funcionalidades Implementadas
- **Chat em tempo real** com múltiplos provedores de LLM
- **Histórico de conversas** persistente
- **Mensagens imediatas** (aparecem antes da resposta da IA)
- **Indicadores visuais** (digitação, processamento, erro)
- **Suporte a anexos** (preparado para imagens/arquivos)
- **Sincronização offline/online** com localStorage
- **Gerenciamento de contexto** de conversas
- **Mapeamento automático de modelos** (chatgpt-4o → gpt-4o)
- **Sistema de fallback** robusto
- **Tratamento de erros** completo

### 🔧 Configurações
- Múltiplos provedores de LLM
- Configuração de modelos por conversa
- Personalização de personalidade do assistente
- Configuração de ferramentas disponíveis
- Gestão de chaves de API

## Links para Documentação Detalhada

- [Configuração e Setup](./setup.md)
- [Arquitetura Técnica](./architecture.md)
- [APIs e Endpoints](./api-endpoints.md)
- [Componentes Frontend](./frontend-components.md)
- [Hooks e Estado](./hooks-state.md)
- [Serviços Backend](./backend-services.md)
- [Tratamento de Erros](./error-handling.md)
- [Guia de Troubleshooting](./troubleshooting.md)

## Status do Projeto

**Última atualização:** Janeiro 2025  
**Status:** ✅ Funcional e Estável  
**Versão:** 1.0.0  

### Problemas Resolvidos
- ✅ Erro de modelo `chatgpt-4o` → `gpt-4o`
- ✅ Duplicação de mensagens
- ✅ Mensagens não aparecendo imediatamente
- ✅ Indicador de digitação no lado errado
- ✅ Perda de contexto de conversas
- ✅ Sincronização offline/online
- ✅ Criação automática de conversas
- ✅ Salvamento de mensagens do assistente 