# APIs e Endpoints - Sistema de Chat

## Visão Geral dos Endpoints

O sistema de chat utiliza uma arquitetura RESTful com endpoints específicos para diferentes funcionalidades. Todos os endpoints seguem o padrão `/api/v1/` como prefixo base.

## Base URL e Configuração

```typescript
// lib/config.ts
const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  // Outros configs...
}
```

## Endpoints Principais

### 1. Conversas (`/conversations/`)

#### 1.1 Listar Conversas
```http
GET /api/v1/conversations/?page=1&page_size=50
```

**Parâmetros de Query:**
- `page` (opcional): Número da página (padrão: 1)
- `page_size` (opcional): Itens por página (padrão: 50)

**Resposta:**
```json
{
  "conversations": [
    {
      "id": "conv_123",
      "title": "Conversa sobre IA",
      "agent_id": "agent_456",
      "workspace_id": "ws_789",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:30:00Z",
      "context": {},
      "settings": {
        "model": "gpt-4o",
        "provider": "openai",
        "personality": "natural",
        "tool": "tools"
      },
      "metadata": {
        "message_count": 4,
        "total_tokens_used": 1500,
        "last_message_at": "2025-01-01T10:30:00Z"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "page_size": 50,
  "total_pages": 1
}
```

#### 1.2 Criar Conversa
```http
POST /api/v1/conversations/
```

**Body:**
```json
{
  "title": "Nova conversa",
  "agent_id": "agent_456", // opcional
  "workspace_id": "ws_789", // opcional
  "context": {}, // opcional
  "settings": {
    "model": "gpt-4o",
    "provider": "openai",
    "personality": "natural",
    "tool": "tools"
  }
}
```

**Resposta:**
```json
{
  "id": "conv_new123",
  "title": "Nova conversa",
  "agent_id": "agent_456",
  "workspace_id": "ws_789",
  "created_at": "2025-01-01T11:00:00Z",
  "updated_at": "2025-01-01T11:00:00Z",
  "context": {},
  "settings": {
    "model": "gpt-4o",
    "provider": "openai",
    "personality": "natural",
    "tool": "tools"
  },
  "metadata": {
    "message_count": 0,
    "total_tokens_used": 0,
    "last_message_at": null
  }
}
```

#### 1.3 Atualizar Título da Conversa
```http
PUT /api/v1/conversations/{conversation_id}/title
```

**Body:**
```json
{
  "title": "Novo título da conversa"
}
```

#### 1.4 Deletar Conversa
```http
DELETE /api/v1/conversations/{conversation_id}
```

### 2. Mensagens (`/conversations/{id}/messages/`)

#### 2.1 Listar Mensagens
```http
GET /api/v1/conversations/{conversation_id}/messages/?page=1&page_size=100
```

**Resposta:**
```json
{
  "messages": [
    {
      "id": "msg_123",
      "conversation_id": "conv_123",
      "role": "user",
      "content": "Olá, como você está?",
      "created_at": "2025-01-01T10:00:00Z",
      "model_used": null,
      "model_provider": null,
      "tokens_used": 0,
      "processing_time_ms": 0,
      "temperature": null,
      "max_tokens": null,
      "error_message": null,
      "rating": null,
      "feedback": null,
      "attachments": []
    },
    {
      "id": "msg_124",
      "conversation_id": "conv_123",
      "role": "assistant",
      "content": "Olá! Estou bem, obrigado por perguntar. Como posso ajudá-lo hoje?",
      "created_at": "2025-01-01T10:00:30Z",
      "model_used": "gpt-4o",
      "model_provider": "openai",
      "tokens_used": 25,
      "processing_time_ms": 1500,
      "temperature": 0.7,
      "max_tokens": 1000,
      "error_message": null,
      "rating": null,
      "feedback": null,
      "attachments": []
    }
  ],
  "total": 2,
  "page": 1,
  "page_size": 100,
  "total_pages": 1
}
```

#### 2.2 Enviar Mensagem do Usuário
```http
POST /api/v1/conversations/{conversation_id}/messages/
```

**Body:**
```json
{
  "content": "Qual é a capital do Brasil?",
  "attachments": [] // opcional
}
```

**Resposta:**
```json
{
  "id": "msg_new123",
  "conversation_id": "conv_123",
  "role": "user",
  "content": "Qual é a capital do Brasil?",
  "created_at": "2025-01-01T11:00:00Z",
  "model_used": null,
  "model_provider": null,
  "tokens_used": 0,
  "processing_time_ms": 0,
  "temperature": null,
  "max_tokens": null,
  "error_message": null,
  "rating": null,
  "feedback": null,
  "attachments": []
}
```

### 3. Chat com LLM (`/llm/chat`)

#### 3.1 Processar Chat
```http
POST /api/v1/llm/chat
```

**Body:**
```json
{
  "message": "Qual é a capital do Brasil?",
  "model": "gpt-4o",
  "provider": "openai",
  "temperature": 0.7,
  "max_tokens": 1000,
  "context": [], // mensagens anteriores
  "tools": [], // ferramentas disponíveis
  "system_prompt": "Você é um assistente útil."
}
```

**Resposta:**
```json
{
  "content": "A capital do Brasil é Brasília, localizada no Distrito Federal.",
  "model": "gpt-4o",
  "provider": "openai",
  "tokens_used": 15,
  "processing_time_ms": 1200,
  "temperature": 0.7,
  "max_tokens": 1000,
  "finish_reason": "stop"
}
```

### 4. Endpoint de Fallback (`/chat`)

#### 4.1 Chat Simples (Fallback)
```http
POST /api/chat
```

**Body:**
```json
{
  "message": "Olá!",
  "conversationId": "conv_123" // opcional
}
```

## Mapeamento de Modelos

O sistema utiliza um mapeador automático para converter nomes de modelos do frontend para nomes aceitos pela API:

```typescript
// lib/utils/model-mapper.ts
const modelMappings = {
  // OpenAI
  'chatgpt-4o': 'gpt-4o',
  'chatgpt-4o-mini': 'gpt-4o-mini',
  'chatgpt-4-turbo': 'gpt-4-turbo',
  
  // Anthropic
  'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
  'claude-3-haiku': 'claude-3-haiku-20240307',
  
  // Google
  'gemini-pro': 'gemini-1.5-pro',
  'gemini-flash': 'gemini-1.5-flash',
  
  // Outros modelos mantêm o nome original
}
```

## Autenticação e Headers

### Headers Obrigatórios
```http
Content-Type: application/json
Authorization: Bearer {token} // se autenticação necessária
X-Workspace-ID: {workspace_id} // se workspace específico
```

### Configuração de API Keys
```typescript
// O sistema verifica chaves de API na seguinte ordem:
1. Chaves do usuário (user_variables)
2. Chaves do sistema (variáveis de ambiente)
3. Fallback para chave padrão
```

## Tratamento de Erros

### Códigos de Status Comuns
- `200` - Sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `404` - Recurso não encontrado
- `422` - Dados de entrada inválidos
- `500` - Erro interno do servidor

### Formato de Erro
```json
{
  "error": {
    "code": "INVALID_MODEL",
    "message": "Modelo 'chatgpt-4o' não encontrado",
    "details": {
      "available_models": ["gpt-4o", "gpt-4o-mini"]
    }
  }
}
```

## Implementação no Frontend

### Exemplo de Uso (ChatService)
```typescript
// lib/services/chat.ts
export class ChatService {
  async sendChatMessage(params: {
    message: string;
    conversationId: string;
  }) {
    // 1. Enviar mensagem do usuário
    const userMessage = await this.addMessage(
      params.conversationId,
      params.message
    );

    // 2. Processar com LLM
    const response = await this.processWithLLM({
      message: params.message,
      model: 'gpt-4o',
      provider: 'openai'
    });

    // 3. Salvar resposta do assistente (localStorage)
    const assistantMessage = await this.saveAssistantMessage({
      conversationId: params.conversationId,
      content: response.content,
      model: response.model,
      // ... outros metadados
    });

    return {
      userMessage,
      assistantMessage
    };
  }
}
```

## Configuração de Ambiente

### Variáveis Necessárias
```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Chaves de API (opcionais - podem ser configuradas por usuário)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Configurações de Chat
CHAT_DEFAULT_MODEL=gpt-4o
CHAT_DEFAULT_PROVIDER=openai
CHAT_MAX_TOKENS=4000
CHAT_TEMPERATURE=0.7
``` 