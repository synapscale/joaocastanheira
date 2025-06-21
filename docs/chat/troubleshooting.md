# Troubleshooting - Sistema de Chat

## Problemas Comuns e Soluções

### 1. Erro de Modelo `chatgpt-4o` não Encontrado

#### Sintoma
```
Error: Model 'chatgpt-4o' not found
HTTP 404: Model not found
```

#### Causa
O modelo `chatgpt-4o` não existe na API do OpenAI. O nome correto é `gpt-4o`.

#### Solução
✅ **Já Resolvido**: O sistema agora usa o **Model Mapper** que converte automaticamente:
- `chatgpt-4o` → `gpt-4o`
- `chatgpt-4o-mini` → `gpt-4o-mini`

```typescript
// lib/utils/model-mapper.ts
export function mapToApiModelName(frontendModelName: string): string {
  const mappings = {
    'chatgpt-4o': 'gpt-4o',
    'chatgpt-4o-mini': 'gpt-4o-mini',
    // ... outros mapeamentos
  }
  return mappings[frontendModelName] || frontendModelName
}
```

#### Verificação
```bash
# Verificar se o mapeamento está funcionando
console.log(mapToApiModelName('chatgpt-4o')) // Deve retornar 'gpt-4o'
```

### 2. Duplicação de Mensagens

#### Sintoma
- Mensagem do usuário aparece duas vezes
- Múltiplas respostas do assistente
- Interface confusa com mensagens repetidas

#### Causa
Hook `sendMessage` e componente `ChatInterface` adicionando mensagens simultaneamente.

#### Solução
✅ **Já Resolvido**: Sistema agora usa **mensagem temporária** que é substituída:

```typescript
// hooks/use-conversations.ts
const sendMessage = async (content: string) => {
  // 1. Criar mensagem temporária
  const userMessage = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role: 'user',
    content: content,
    timestamp: Date.now(),
    status: 'sending'
  }
  
  // 2. Adicionar imediatamente à interface
  setMessages(prev => [...prev, userMessage])
  
  // 3. Enviar para API
  const result = await chatService.sendChatMessage(...)
  
  // 4. Substituir mensagem temporária
  setMessages(prev => {
    const withoutTemp = prev.filter(msg => msg.id !== userMessage.id)
    return [...withoutTemp, updatedUserMessage, assistantMessage]
  })
}
```

### 3. Mensagens não Aparecem Imediatamente

#### Sintoma
- Usuário envia mensagem mas ela só aparece quando o LLM responde
- Interface parece "travada" durante processamento

#### Causa
Mensagem do usuário só era adicionada após resposta completa da API.

#### Solução
✅ **Já Resolvido**: **Mensagem imediata** com status de progresso:

```typescript
// Fluxo atual:
// 1. Usuário digita → Mensagem aparece imediatamente (status: 'sending')
// 2. Indicador de digitação do LLM aparece
// 3. Resposta chega → Status atualizado para 'sent'
```

### 4. Indicador de Digitação no Lado Errado

#### Sintoma
- Indicador de "digitando..." aparece do lado direito (lado do usuário)
- Deveria aparecer do lado esquerdo (lado do assistente)

#### Solução
✅ **Já Resolvido**: Componente `TypingIndicator` corrigido:

```typescript
// components/chat/typing-indicator.tsx
const TypingIndicator = () => {
  return (
    <div className="flex justify-start"> {/* Lado esquerdo */}
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg max-w-fit">
        <AssistantAvatar size="xs" />
        <div className="flex gap-1">
          {/* 3 pontos animados */}
        </div>
      </div>
    </div>
  )
}
```

### 5. Perda de Contexto de Conversas

#### Sintoma
- Mensagens desaparecem após recarregar página
- Conversas não persistem
- Histórico perdido

#### Solução
✅ **Já Resolvido**: **Sistema híbrido** offline/online:

```typescript
// hooks/use-conversations.ts
const setCurrentConversation = async (id: string) => {
  // 1. Carregar mensagens da API
  let apiMessages = await chatService.getMessages(id)
  
  // 2. Carregar mensagens offline
  const offlineMessages = loadOfflineMessages(id)
  
  // 3. Combinar e remover duplicatas
  const allMessages = [...apiMessages, ...offlineMessages]
  const uniqueMessages = removeDuplicates(allMessages)
  
  // 4. Ordenar por timestamp
  uniqueMessages.sort((a, b) => a.timestamp - b.timestamp)
  
  setMessages(uniqueMessages)
}
```

### 6. Criação Automática de Conversas

#### Sintoma
- Nova conversa criada a cada carregamento da página
- Muitas conversas vazias na lista

#### Solução
✅ **Já Resolvido**: Conversas só criadas quando **usuário envia mensagem**:

```typescript
// hooks/use-conversations.ts
const sendMessage = async (content: string) => {
  let activeConversationId = currentConversationId
  
  // Só criar conversa se não houver uma ativa E usuário está enviando mensagem
  if (!activeConversationId) {
    const conversationTitle = content.length > 50 
      ? content.substring(0, 50) + '...' 
      : content
      
    const newConversation = await createConversation({
      title: conversationTitle,
      // ... configurações
    })
    
    activeConversationId = newConversation.id
  }
  
  // ... continuar com envio
}
```

### 7. Erro "Could not get assistant response"

#### Sintoma
```
Error: Could not get assistant response
```

#### Causa
Lógica falha tentando buscar resposta do assistente após 2 segundos.

#### Solução
✅ **Já Resolvido**: Uso direto do endpoint `/llm/chat`:

```typescript
// lib/services/chat.ts
async processWithLLM(params) {
  // Chamada direta que retorna resposta completa
  const response = await this.apiService.post('/llm/chat', {
    message: params.message,
    model: params.model,
    provider: params.provider,
    // ... outros parâmetros
  })
  
  return response.data // Resposta completa do LLM
}
```

### 8. HTTP 404 - Endpoint não Encontrado

#### Sintoma
```
GET /chat 404
POST /api/v1/llm/chat 404
```

#### Causa
URLs duplicadas ou endpoints não implementados no backend.

#### Solução
✅ **Já Resolvido**: URLs corrigidas e sistema de fallback:

```typescript
// lib/api/service.ts
private buildURL(endpoint: string): string {
  // Remove barra inicial se existir (já está no baseURL)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${this.baseURL}/${cleanEndpoint}`
}

// Sistema de fallback
try {
  return await this.apiService.post('/llm/chat', data)
} catch (error) {
  // Fallback para endpoint simples
  return await this.apiService.post('/chat', data)
}
```

### 9. HTTP 422 - Parâmetros Inválidos

#### Sintoma
```
HTTP 422: Unprocessable Entity
Invalid parameters for /llm/chat
```

#### Causa
Parâmetros incorretos enviados para API (ex: `conversation_id` não aceito).

#### Solução
✅ **Já Resolvido**: Parâmetros corretos e model mapping:

```typescript
// lib/services/chat.ts
async processWithLLM(params) {
  const response = await this.apiService.post('/llm/chat', {
    message: params.message,
    model: mapToApiModelName(params.model), // Mapeamento correto
    provider: params.provider,
    temperature: 0.7,
    max_tokens: 4000,
    context: params.context || [],
    system_prompt: params.systemPrompt || 'Você é um assistente útil.',
    tools: []
    // Removido: conversation_id (não aceito pela API)
  })
  
  return response.data
}
```

### 10. Mensagens do Assistente não Salvam

#### Sintoma
- Resposta do LLM aparece na interface
- Após recarregar página, só mensagens do usuário permanecem
- Histórico incompleto

#### Solução
✅ **Já Resolvido**: **Sistema híbrido** com localStorage:

```typescript
// lib/services/chat.ts
async saveAssistantMessage(params) {
  // Como API não tem endpoint direto para assistente,
  // usar localStorage como fallback
  const assistantMessage = {
    id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    conversation_id: params.conversationId,
    role: 'assistant',
    content: params.content,
    created_at: new Date().toISOString(),
    model_used: params.model,
    model_provider: params.provider,
    tokens_used: params.tokens_used,
    processing_time_ms: params.processing_time_ms
  }
  
  // Salvar no localStorage
  const key = `chat-messages-${params.conversationId}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.push(assistantMessage)
  localStorage.setItem(key, JSON.stringify(existing))
  
  return assistantMessage
}
```

## Problemas de Performance

### 1. Interface Lenta com Muitas Mensagens

#### Sintoma
- Scroll travado
- Delay ao digitar
- Interface não responsiva

#### Solução
**Virtualização de lista** para muitas mensagens:

```typescript
// components/chat/virtualized-messages.tsx
import { FixedSizeList as List } from 'react-window'

const VirtualizedMessagesList = ({ messages }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ChatMessage message={messages[index]} />
    </div>
  )
  
  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={100}
      itemData={messages}
    >
      {Row}
    </List>
  )
}
```

### 2. Re-renders Excessivos

#### Sintoma
- Componentes renderizando constantemente
- Performance degradada

#### Solução
**Memoização** de componentes:

```typescript
// Memoizar mensagens
const MemoizedChatMessage = memo(ChatMessage, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.content === nextProps.message.content
  )
})

// Memoizar callbacks
const handleSendMessage = useCallback(async (message: string) => {
  await conversationsHook.sendMessage(message)
}, [conversationsHook.sendMessage])
```

## Problemas de Conectividade

### 1. Modo Offline

#### Sintoma
- Sem conexão com internet
- API indisponível
- Usuário quer continuar usando

#### Solução
**Sistema de fallback offline**:

```typescript
// lib/services/fallback-system.ts
const executeWithFallback = async (
  primaryFunction,
  fallbackFunctions = [],
  offlineFallback
) => {
  try {
    return await primaryFunction()
  } catch (error) {
    // Tentar fallbacks
    for (const fallback of fallbackFunctions) {
      try {
        return await fallback()
      } catch (fallbackError) {
        continue
      }
    }
    
    // Último recurso: modo offline
    if (offlineFallback) {
      return offlineFallback()
    }
    
    throw error
  }
}
```

### 2. Timeout de Requisições

#### Sintoma
- Requisições muito lentas
- Timeout errors
- Interface travada

#### Solução
**Timeout configurável** e retry:

```typescript
// lib/api/service.ts
class APIService {
  private timeout = 30000 // 30 segundos
  
  async post(endpoint: string, data: any) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(data),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return await this.handleResponse(response)
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }
}
```

## Problemas de Configuração

### 1. API Keys Inválidas

#### Sintoma
```
Error: Invalid API key
HTTP 401: Unauthorized
```

#### Solução
**Validação de chaves** e fallback:

```typescript
// lib/utils/api-key-validator.ts
export function validateApiKey(provider: string, apiKey: string): boolean {
  const patterns = {
    openai: /^sk-[a-zA-Z0-9]{48}$/,
    anthropic: /^sk-ant-[a-zA-Z0-9-]{95}$/,
    google: /^[a-zA-Z0-9-_]{39}$/
  }
  
  return patterns[provider]?.test(apiKey) || false
}

// Sistema de fallback para chaves
const getApiKey = (provider: string) => {
  // 1. Tentar chave do usuário
  const userKey = getUserApiKey(provider)
  if (userKey && validateApiKey(provider, userKey)) {
    return userKey
  }
  
  // 2. Fallback para chave do sistema
  const systemKey = getSystemApiKey(provider)
  if (systemKey && validateApiKey(provider, systemKey)) {
    return systemKey
  }
  
  throw new Error(`No valid API key for ${provider}`)
}
```

### 2. URLs de API Incorretas

#### Sintoma
```
Error: fetch failed
TypeError: Failed to fetch
```

#### Solução
**Validação de configuração**:

```typescript
// lib/config.ts
export function validateConfig() {
  const errors = []
  const warnings = []
  
  // Verificar URL base
  if (!config.apiBaseUrl) {
    errors.push('API_BASE_URL não configurada')
  }
  
  try {
    new URL(config.apiBaseUrl)
  } catch {
    errors.push('API_BASE_URL inválida')
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

// Usar na inicialização
useEffect(() => {
  const validation = validateConfig()
  if (!validation.isValid) {
    console.error('Configuração inválida:', validation.errors)
  }
}, [])
```

## Scripts de Diagnóstico

### Script de Verificação Completa

```bash
#!/bin/bash
# scripts/diagnose.sh

echo "🔍 Diagnóstico do Sistema de Chat"
echo "================================"

# 1. Verificar configuração
echo "📋 Verificando configuração..."
if [ -f .env.local ]; then
  echo "✅ .env.local encontrado"
else
  echo "❌ .env.local não encontrado"
fi

# 2. Testar conexão com API
echo "🌐 Testando conexão com API..."
curl -s -o /dev/null -w "%{http_code}" $NEXT_PUBLIC_API_BASE_URL/conversations/ || echo "❌ API inacessível"

# 3. Verificar dependências
echo "📦 Verificando dependências..."
npm list --depth=0 | grep -E "(react|next|typescript)" || echo "❌ Dependências em falta"

# 4. Verificar tipos
echo "🔧 Verificando tipos TypeScript..."
npx tsc --noEmit || echo "❌ Erros de tipo encontrados"

# 5. Testar build
echo "🏗️ Testando build..."
npm run build || echo "❌ Erro no build"

echo "✅ Diagnóstico concluído"
```

### Script de Teste de API

```javascript
// scripts/test-api.js
const config = require('../lib/config').default

async function testAPI() {
  console.log('🧪 Testando endpoints da API...')
  
  const baseURL = config.apiBaseUrl
  
  // Testar endpoints
  const endpoints = [
    { method: 'GET', path: '/conversations/' },
    { method: 'POST', path: '/llm/chat' },
    { method: 'POST', path: '/chat' }
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.method === 'POST' ? JSON.stringify({ test: true }) : undefined
      })
      
      console.log(`${endpoint.method} ${endpoint.path}: ${response.status}`)
    } catch (error) {
      console.log(`${endpoint.method} ${endpoint.path}: ❌ ${error.message}`)
    }
  }
}

testAPI()
```

## Monitoramento e Logs

### Sistema de Logs

```typescript
// lib/utils/logger.ts
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private level: LogLevel = LogLevel.INFO
  
  debug(message: string, data?: any) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`🐛 [DEBUG] ${message}`, data)
    }
  }
  
  info(message: string, data?: any) {
    if (this.level <= LogLevel.INFO) {
      console.info(`ℹ️ [INFO] ${message}`, data)
    }
  }
  
  warn(message: string, data?: any) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`⚠️ [WARN] ${message}`, data)
    }
  }
  
  error(message: string, error?: any) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`❌ [ERROR] ${message}`, error)
    }
  }
}

export const logger = new Logger()
```

### Health Check

```typescript
// lib/utils/health-check.ts
export async function performHealthCheck() {
  const results = {
    api: false,
    localStorage: false,
    models: false,
    timestamp: new Date().toISOString()
  }
  
  // Testar API
  try {
    const response = await fetch(`${config.apiBaseUrl}/conversations/`)
    results.api = response.ok
  } catch {
    results.api = false
  }
  
  // Testar localStorage
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    results.localStorage = true
  } catch {
    results.localStorage = false
  }
  
  // Testar mapeamento de modelos
  try {
    const mapped = mapToApiModelName('chatgpt-4o')
    results.models = mapped === 'gpt-4o'
  } catch {
    results.models = false
  }
  
  return results
}
``` 