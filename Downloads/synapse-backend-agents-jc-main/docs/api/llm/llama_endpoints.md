# Documentação da API LLaMA (Meta)

Esta documentação descreve os endpoints disponíveis para interação com a API do LLaMA (Meta) através do SynapScale Backend.

## Endpoints Disponíveis

### Gerar Texto

**Endpoint:** `POST /api/v1/llm/generate`  
**Endpoint específico:** `POST /api/v1/llm/llama/generate`

Gera texto a partir de um prompt usando o modelo LLaMA da Meta.

#### Parâmetros de Requisição

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| prompt | string | Sim | Texto de entrada para o modelo |
| model | string | Não | Modelo específico a ser usado (padrão: "llama-3-70b-instruct") |
| max_tokens | integer | Não | Número máximo de tokens a gerar (padrão: 1000) |
| temperature | float | Não | Temperatura para amostragem (0.0-1.0) (padrão: 0.7) |
| top_p | float | Não | Valor de top-p para amostragem nucleus (padrão: 0.95) |
| top_k | integer | Não | Valor de top-k para amostragem (padrão: 40) |
| use_cache | boolean | Não | Se deve usar o cache (padrão: true) |

#### Exemplo de Requisição

```json
{
  "prompt": "Explique o conceito de aprendizado de máquina em termos simples.",
  "model": "llama-3-70b-instruct",
  "max_tokens": 500,
  "temperature": 0.7,
  "top_p": 0.95,
  "top_k": 40,
  "use_cache": true
}
```

#### Exemplo de Resposta

```json
{
  "text": "O aprendizado de máquina é como ensinar computadores a aprender com exemplos, em vez de programá-los com regras específicas. Imagine que você está ensinando uma criança a identificar frutas: você não explica todas as características detalhadas de cada fruta, mas mostra várias maçãs, bananas e laranjas, e a criança aprende a reconhecê-las.\n\nDa mesma forma, no aprendizado de máquina:\n\n1. Alimentamos o computador com muitos exemplos (dados)\n2. O computador identifica padrões nesses exemplos\n3. Com base nesses padrões, ele pode fazer previsões ou tomar decisões sobre novos dados\n\nPor exemplo, se quisermos criar um sistema que identifique emails de spam, em vez de escrever regras como \"se o email contém a palavra 'grátis', é spam\", mostramos ao computador milhares de exemplos de emails marcados como spam ou não-spam. O computador aprende os padrões e pode então classificar novos emails.\n\nO aprendizado de máquina é usado em muitas aplicações do dia a dia, como recomendações da Netflix, filtros de fotos, reconhecimento facial, assistentes virtuais e carros autônomos.",
  "model": "llama-3-70b-instruct",
  "provider": "llama",
  "tokens_used": 243,
  "cached": false,
  "processing_time": 3.12
}
```

### Contar Tokens

**Endpoint:** `POST /api/v1/llm/count-tokens`  
**Endpoint específico:** `POST /api/v1/llm/llama/count-tokens`

Conta o número de tokens em um texto usando o modelo LLaMA da Meta.

#### Parâmetros de Requisição

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| text | string | Sim | Texto para contar tokens |
| model | string | Não | Modelo específico a ser usado (padrão: "llama-3-70b-instruct") |

#### Exemplo de Requisição

```json
{
  "text": "Explique o conceito de aprendizado de máquina em termos simples.",
  "model": "llama-3-70b-instruct"
}
```

#### Exemplo de Resposta

```json
{
  "token_count": 13,
  "model": "llama-3-70b-instruct",
  "provider": "llama"
}
```

### Listar Modelos

**Endpoint:** `GET /api/v1/llm/models`  
**Endpoint específico:** `GET /api/v1/llm/llama/models`

Lista os modelos disponíveis para o provedor LLaMA.

#### Parâmetros de Requisição

Nenhum parâmetro específico é necessário.

#### Exemplo de Resposta

```json
{
  "models": [
    {
      "id": "llama-3-70b-instruct",
      "name": "Llama 3 70B Instruct",
      "provider": "Meta",
      "context_window": 128000,
      "capabilities": ["text-generation"]
    },
    {
      "id": "llama-3-8b-instruct",
      "name": "Llama 3 8B Instruct",
      "provider": "Meta",
      "context_window": 128000,
      "capabilities": ["text-generation"]
    },
    {
      "id": "llama-2-70b-chat",
      "name": "Llama 2 70B Chat",
      "provider": "Meta",
      "context_window": 4096,
      "capabilities": ["text-generation"]
    }
  ],
  "provider": "llama"
}
```

## Modelos Disponíveis

O SynapScale suporta os seguintes modelos da Meta:

| Modelo | Descrição | Contexto Máximo | Capacidades |
|--------|-----------|-----------------|-------------|
| llama-3-70b-instruct | Modelo mais avançado da Meta, otimizado para instruções | 128.000 tokens | Geração de texto |
| llama-3-8b-instruct | Versão mais leve do Llama 3, bom equilíbrio entre desempenho e eficiência | 128.000 tokens | Geração de texto |
| llama-2-70b-chat | Modelo da geração anterior, otimizado para conversas | 4.096 tokens | Geração de texto |

## Configuração

Para utilizar a API do LLaMA (Meta), você precisa configurar as seguintes variáveis de ambiente:

```
LLAMA_API_KEY=sua_chave_api_llama_aqui
LLAMA_API_BASE_URL=https://llama.developer.meta.com/api/v1
```

Você pode definir o provedor padrão para LLaMA alterando a seguinte configuração:

```
LLM_DEFAULT_PROVIDER=llama
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

url = "http://localhost:8000/api/v1/llm/llama/generate"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer seu_token_aqui"
}
payload = {
    "prompt": "Explique o conceito de aprendizado de máquina em termos simples.",
    "model": "llama-3-70b-instruct",
    "max_tokens": 500
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
result = response.json()
print(result["text"])
```

### Exemplo em cURL

```bash
curl -X POST "http://localhost:8000/api/v1/llm/llama/generate" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer seu_token_aqui" \
     -d '{
           "prompt": "Explique o conceito de aprendizado de máquina em termos simples.",
           "model": "llama-3-70b-instruct",
           "max_tokens": 500
         }'
```
