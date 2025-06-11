# Documentação da API OpenAI (ChatGPT)

Esta documentação descreve os endpoints disponíveis para interação com a API do OpenAI (ChatGPT) através do SynapScale Backend.

## Endpoints Disponíveis

### Gerar Texto

**Endpoint:** `POST /api/v1/llm/generate`  
**Endpoint específico:** `POST /api/v1/llm/openai/generate`

Gera texto a partir de um prompt usando o modelo ChatGPT da OpenAI.

#### Parâmetros de Requisição

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| prompt | string | Sim | Texto de entrada para o modelo |
| model | string | Não | Modelo específico a ser usado (padrão: "gpt-4") |
| max_tokens | integer | Não | Número máximo de tokens a gerar (padrão: 1000) |
| temperature | float | Não | Temperatura para amostragem (0.0-1.0) (padrão: 0.7) |
| top_p | float | Não | Valor de top-p para amostragem nucleus (padrão: 0.95) |
| use_cache | boolean | Não | Se deve usar o cache (padrão: true) |

#### Exemplo de Requisição

```json
{
  "prompt": "Explique o conceito de inteligência artificial em termos simples.",
  "model": "gpt-4",
  "max_tokens": 500,
  "temperature": 0.7,
  "top_p": 0.95,
  "use_cache": true
}
```

#### Exemplo de Resposta

```json
{
  "text": "A inteligência artificial (IA) é como ensinar computadores a pensar e aprender de maneira semelhante aos humanos. Imagine que você está ensinando um cachorro a pegar uma bola - você mostra o que quer que ele faça, recompensa quando ele acerta, e com o tempo, ele aprende. Com a IA, fazemos algo parecido com computadores.\n\nEm termos simples, a IA permite que máquinas:\n\n1. Aprendam com exemplos e experiências\n2. Reconheçam padrões em dados\n3. Tomem decisões baseadas nessas informações\n4. Melhorem com o tempo\n\nExistem diferentes tipos de IA, desde sistemas simples que seguem regras específicas até sistemas complexos que podem aprender sozinhos e se adaptar a novas situações. Alguns exemplos do dia a dia incluem assistentes virtuais como Siri e Alexa, recomendações da Netflix, filtros de spam no email, e carros autônomos.\n\nA IA não é realmente \"inteligente\" como os humanos - ela não tem consciência ou emoções. É mais como uma ferramenta muito sofisticada que pode processar enormes quantidades de informação e encontrar padrões que os humanos talvez não conseguiriam ver.",
  "model": "gpt-4",
  "provider": "openai",
  "tokens_used": 257,
  "cached": false,
  "processing_time": 2.34
}
```

### Contar Tokens

**Endpoint:** `POST /api/v1/llm/count-tokens`  
**Endpoint específico:** `POST /api/v1/llm/openai/count-tokens`

Conta o número de tokens em um texto usando o modelo ChatGPT da OpenAI.

#### Parâmetros de Requisição

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| text | string | Sim | Texto para contar tokens |
| model | string | Não | Modelo específico a ser usado (padrão: "gpt-4") |

#### Exemplo de Requisição

```json
{
  "text": "Explique o conceito de inteligência artificial em termos simples.",
  "model": "gpt-4"
}
```

#### Exemplo de Resposta

```json
{
  "token_count": 12,
  "model": "gpt-4",
  "provider": "openai"
}
```

### Listar Modelos

**Endpoint:** `GET /api/v1/llm/models`  
**Endpoint específico:** `GET /api/v1/llm/openai/models`

Lista os modelos disponíveis para o provedor OpenAI.

#### Parâmetros de Requisição

Nenhum parâmetro específico é necessário.

#### Exemplo de Resposta

```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "OpenAI",
      "context_window": 8192,
      "capabilities": ["text-generation"]
    },
    {
      "id": "gpt-4-turbo",
      "name": "GPT-4 Turbo",
      "provider": "OpenAI",
      "context_window": 128000,
      "capabilities": ["text-generation"]
    },
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "provider": "OpenAI",
      "context_window": 16385,
      "capabilities": ["text-generation"]
    }
  ],
  "provider": "openai"
}
```

## Modelos Disponíveis

O SynapScale suporta os seguintes modelos da OpenAI:

| Modelo | Descrição | Contexto Máximo | Capacidades |
|--------|-----------|-----------------|-------------|
| gpt-4 | Modelo mais avançado da OpenAI, com melhor raciocínio | 8.192 tokens | Geração de texto |
| gpt-4-turbo | Versão otimizada do GPT-4 com janela de contexto maior | 128.000 tokens | Geração de texto |
| gpt-3.5-turbo | Modelo balanceado entre custo e desempenho | 16.385 tokens | Geração de texto |

## Configuração

Para utilizar a API do OpenAI (ChatGPT), você precisa configurar a seguinte variável de ambiente:

```
OPENAI_API_KEY=sua_chave_api_openai_aqui
```

Você pode definir o provedor padrão para OpenAI alterando a seguinte configuração:

```
LLM_DEFAULT_PROVIDER=openai
```

## Tratamento de Erros

| Código HTTP | Descrição |
|-------------|-----------|
| 400 | Requisição inválida (parâmetros incorretos) |
| 401 | Não autorizado (chave de API inválida) |
| 404 | Modelo não encontrado |
| 429 | Muitas requisições (rate limit excedido) |
| 500 | Erro interno do servidor |

## Exemplos de Uso

### Exemplo em Python

```python
import requests
import json

url = "http://localhost:8000/api/v1/llm/openai/generate"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer seu_token_aqui"
}
payload = {
    "prompt": "Explique o conceito de inteligência artificial em termos simples.",
    "model": "gpt-4",
    "max_tokens": 500
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
result = response.json()
print(result["text"])
```

### Exemplo em cURL

```bash
curl -X POST "http://localhost:8000/api/v1/llm/openai/generate" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer seu_token_aqui" \
     -d '{
           "prompt": "Explique o conceito de inteligência artificial em termos simples.",
           "model": "gpt-4",
           "max_tokens": 500
         }'
```
