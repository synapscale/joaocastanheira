# Guia Rápido da API SynapScale

Este guia fornece instruções rápidas para utilizar a API SynapScale, com foco nos endpoints mais comuns e seus parâmetros.

## Autenticação

Todas as requisições devem incluir um token JWT no cabeçalho de autorização:

```
Authorization: Bearer seu_token_jwt
```

## Endpoints Principais

### 1. Gerar Texto com LLM

**Endpoint:** `POST /api/v1/llm/generate`

**Descrição:** Gera texto a partir de um prompt usando o provedor de LLM escolhido.

**Corpo da Requisição:**
```json
{
  "prompt": "Explique o conceito de machine learning em termos simples.",
  "provider": "openai",
  "model": "gpt-4o",
  "max_tokens": 500,
  "temperature": 0.7,
  "top_p": 0.95,
  "top_k": 40,
  "use_cache": true
}
```

**Parâmetros:**
- `prompt` (string, obrigatório): Texto de entrada para o modelo
- `provider` (string, opcional): Provedor LLM a ser usado (padrão: "openai")
- `model` (string, opcional): Modelo específico do provedor
- `max_tokens` (integer, opcional): Limite de tokens na resposta (padrão: 1000)
- `temperature` (float, opcional): Controle de aleatoriedade (0.0-1.0, padrão: 0.7)
- `top_p` (float, opcional): Amostragem nucleus (0.0-1.0, padrão: 0.95)
- `top_k` (integer, opcional): Amostragem top-k (padrão: 40)
- `use_cache` (boolean, opcional): Usar cache para respostas (padrão: true)

### 2. Contar Tokens

**Endpoint:** `POST /api/v1/llm/count-tokens`

**Descrição:** Conta o número de tokens em um texto para um determinado modelo.

**Corpo da Requisição:**
```json
{
  "text": "Este é um exemplo de texto para contar tokens.",
  "provider": "openai",
  "model": "gpt-4o"
}
```

**Parâmetros:**
- `text` (string, obrigatório): Texto para contar tokens
- `provider` (string, opcional): Provedor LLM (padrão: "openai")
- `model` (string, opcional): Modelo específico do provedor

### 3. Listar Modelos

**Endpoint:** `GET /api/v1/llm/models`

**Descrição:** Lista todos os modelos disponíveis em todos os provedores.

**Parâmetros de Query:**
- Nenhum

### 4. Listar Provedores

**Endpoint:** `GET /api/v1/llm/providers`

**Descrição:** Lista todos os provedores de LLM disponíveis.

**Parâmetros de Query:**
- Nenhum

### 5. Gerar Texto com Provedor Específico

**Endpoint:** `POST /api/v1/llm/{provider}/generate`

**Descrição:** Gera texto usando um provedor específico.

**Parâmetros de Path:**
- `provider` (string, obrigatório): Nome do provedor (openai, claude, gemini, llama, grok, deepseek, tess)

**Corpo da Requisição:**
```json
{
  "prompt": "Explique o conceito de machine learning em termos simples.",
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 1000,
  "temperature": 0.7
}
```

### 6. Upload de Arquivo

**Endpoint:** `POST /api/v1/upload`

**Descrição:** Faz upload de um arquivo para o servidor.

**Corpo da Requisição:**
- Form data com campo `file` contendo o arquivo a ser enviado
- Form data com campo `category` (opcional) contendo a categoria do arquivo (padrão: "general")

## Provedores Suportados

| Provedor | Modelos Disponíveis | Capacidades |
| --- | --- | --- |
| OpenAI | GPT-4o, GPT-4-turbo, GPT-3.5-turbo | Text, Vision, Function Calling |
| Claude | Claude 3 Opus, Sonnet, Haiku | Text, Vision, Reasoning |
| Gemini | Gemini 1.5 Pro, Flash | Text, Vision, Code |
| Llama | Llama 3 70B, 8B, Llama 2 70B | Text Generation |
| Grok | Grok-1 | Text, Function Calling |
| DeepSeek | DeepSeek Chat, Coder | Text, Code Generation |
| Tess | Múltiplos via orquestração | Text, Reasoning |

## Exemplos de Uso

### Exemplo com OpenAI

```python
import requests

url = "https://api.synapscale.com/api/v1/llm/generate"
headers = {"Authorization": "Bearer seu_token_jwt"}
data = {
  "prompt": "Explique o conceito de machine learning em termos simples.",
  "provider": "openai",
  "model": "gpt-4o",
  "max_tokens": 500,
  "temperature": 0.7
}

response = requests.post(url, json=data, headers=headers)
print(response.json()["text"])
```

### Exemplo com Claude

```python
import requests

url = "https://api.synapscale.com/api/v1/llm/claude/generate"
headers = {"Authorization": "Bearer seu_token_jwt"}
data = {
  "prompt": "Explique o conceito de machine learning em termos simples.",
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 1000,
  "temperature": 0.7
}

response = requests.post(url, json=data, headers=headers)
print(response.json()["text"])
```

## Códigos de Status

- **200**: Sucesso
- **400**: Erro de validação ou parâmetros inválidos
- **401**: Não autorizado (token inválido ou expirado)
- **404**: Recurso não encontrado
- **422**: Erro de validação de entidade
- **500**: Erro interno do servidor

## Notas Adicionais

- Para modelos que suportam visão (como GPT-4o e Claude 3), você pode incluir URLs de imagens no prompt.
- O parâmetro `use_cache` permite economizar tokens reutilizando respostas para prompts idênticos.
- Para obter o melhor desempenho, ajuste os parâmetros `temperature`, `top_p` e `top_k` conforme necessário.
