# Guia Detalhado de Parâmetros da API SynapScale

Este documento fornece informações detalhadas sobre os parâmetros de cada endpoint da API SynapScale, complementando a documentação interativa do Swagger.

## Endpoints de LLM (Modelos de Linguagem)

### POST `/api/v1/llm/generate`

**Descrição:** Gera texto a partir de um prompt usando o provedor de LLM escolhido.

**Parâmetros do Body (JSON):**

| Parâmetro | Tipo | Obrigatório | Descrição | Valor Padrão |
|-----------|------|-------------|-----------|--------------|
| prompt | string | Sim | Texto de entrada para o modelo | - |
| provider | string | Não | Provedor de LLM a ser usado (openai, claude, gemini, llama, grok, deepseek) | Configuração padrão do sistema |
| model | string | Não | Modelo específico a ser usado | Modelo padrão do provedor |
| max_tokens | integer | Não | Número máximo de tokens a gerar | 1000 |
| temperature | float | Não | Temperatura para amostragem (0.0-1.0) | 0.7 |
| top_p | float | Não | Valor de top-p para amostragem nucleus | 0.95 |
| top_k | integer | Não | Valor de top-k para amostragem | 40 |
| use_cache | boolean | Não | Se deve usar o cache (se disponível) | true |

**Exemplo de Request:**
```json
{
  "prompt": "Explique o conceito de machine learning em termos simples.",
  "provider": "claude",
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 500,
  "temperature": 0.7
}
```

### POST `/api/v1/llm/count-tokens`

**Descrição:** Conta o número de tokens em um texto usando o tokenizador do provedor especificado.

**Parâmetros do Body (JSON):**

| Parâmetro | Tipo | Obrigatório | Descrição | Valor Padrão |
|-----------|------|-------------|-----------|--------------|
| text | string | Sim | Texto para contar tokens | - |
| provider | string | Não | Provedor de LLM a ser usado | Configuração padrão do sistema |
| model | string | Não | Modelo específico a ser usado | Modelo padrão do provedor |

**Exemplo de Request:**
```json
{
  "text": "Este é um exemplo de texto para contar tokens.",
  "provider": "claude"
}
```

### GET `/api/v1/llm/models`

**Descrição:** Lista todos os modelos de LLM disponíveis na plataforma.

**Parâmetros de Query:**

| Parâmetro | Tipo | Obrigatório | Descrição | Valor Padrão |
|-----------|------|-------------|-----------|--------------|
| provider | string | Não | Filtrar por provedor específico | - |

**Exemplo de Request:**
```
GET /api/v1/llm/models?provider=openai
```

### GET `/api/v1/llm/providers`

**Descrição:** Lista todos os provedores de LLM disponíveis na plataforma.

**Parâmetros:** Nenhum parâmetro necessário.

### POST `/api/v1/llm/{provider}/generate`

**Descrição:** Gera texto usando especificamente o provedor indicado no caminho da URL.

**Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| provider | string | Sim | Nome do provedor (openai, claude, gemini, llama, grok, deepseek) |

**Parâmetros do Body (JSON):** Mesmos parâmetros do endpoint `/api/v1/llm/generate`, exceto `provider` que é definido na URL.

**Exemplo de Request:**
```
POST /api/v1/llm/claude/generate
```
```json
{
  "prompt": "Explique o conceito de machine learning em termos simples.",
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 500
}
```

### POST `/api/v1/llm/{provider}/count-tokens`

**Descrição:** Conta tokens usando especificamente o provedor indicado no caminho da URL.

**Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| provider | string | Sim | Nome do provedor |

**Parâmetros do Body (JSON):** Mesmos parâmetros do endpoint `/api/v1/llm/count-tokens`, exceto `provider` que é definido na URL.

**Exemplo de Request:**
```
POST /api/v1/llm/openai/count-tokens
```
```json
{
  "text": "Este é um exemplo de texto para contar tokens.",
  "model": "gpt-4o"
}
```

### GET `/api/v1/llm/{provider}/models`

**Descrição:** Lista os modelos disponíveis para um provedor específico.

**Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| provider | string | Sim | Nome do provedor |

**Exemplo de Request:**
```
GET /api/v1/llm/openai/models
```

## Endpoints de Arquivos

### POST `/api/v1/files/upload`

**Descrição:** Realiza o upload de um arquivo para o servidor.

**Parâmetros de Form:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| category | string | Sim | Categoria do arquivo (ex: "imagem", "documento", "audio") |
| file | file | Sim | O arquivo a ser enviado |

**Exemplo de Request:**
```
POST /api/v1/files/upload
Content-Type: multipart/form-data

form-data:
  category: documento
  file: [arquivo binário]
```

### GET `/api/v1/files/`

**Descrição:** Lista os arquivos do usuário com paginação e filtro por categoria.

**Parâmetros de Query:**

| Parâmetro | Tipo | Obrigatório | Descrição | Valor Padrão | Restrições |
|-----------|------|-------------|-----------|--------------|------------|
| page | integer | Não | Número da página para paginação | 1 | >= 1 |
| size | integer | Não | Quantidade de itens por página | 10 | >= 1, <= 100 |
| category | string | Não | Filtrar por categoria específica | - | - |

**Exemplo de Request:**
```
GET /api/v1/files/?page=2&size=20&category=imagem
```

### GET `/api/v1/files/{file_id}`

**Descrição:** Obtém informações detalhadas sobre um arquivo específico.

**Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| file_id | UUID | Sim | ID único do arquivo |

**Exemplo de Request:**
```
GET /api/v1/files/550e8400-e29b-41d4-a716-446655440000
```

### GET `/api/v1/files/{file_id}/download`

**Descrição:** Gera um link de download para um arquivo específico.

**Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| file_id | UUID | Sim | ID único do arquivo |

**Exemplo de Request:**
```
GET /api/v1/files/550e8400-e29b-41d4-a716-446655440000/download
```

### DELETE `/api/v1/files/{file_id}`

**Descrição:** Remove permanentemente um arquivo do servidor.

**Parâmetros de Path:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| file_id | UUID | Sim | ID único do arquivo |

**Exemplo de Request:**
```
DELETE /api/v1/files/550e8400-e29b-41d4-a716-446655440000
```

## Autenticação

Todos os endpoints (exceto explicitamente mencionados) requerem autenticação via Bearer Token (JWT). Inclua o token no header `Authorization` de todas as requisições:

```
Authorization: Bearer seu_token_jwt
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Requisição inválida (parâmetros incorretos) |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Recurso não encontrado |
| 422 | Erro de validação |
| 429 | Muitas requisições (rate limit) |
| 500 | Erro interno do servidor |
