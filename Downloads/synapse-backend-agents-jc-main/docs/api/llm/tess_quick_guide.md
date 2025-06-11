# Guia Rápido: API Tess AI

Este guia fornece instruções rápidas para integração e uso da API Tess AI no SynapScale Backend.

## Configuração Inicial

Para utilizar a API Tess AI, configure as seguintes variáveis de ambiente:

```
TESS_API_KEY=sua_chave_api_tess_aqui
TESS_API_BASE_URL=https://tess.pareto.io/api
```

Você pode definir o provedor padrão para Tess AI alterando a seguinte configuração:

```
LLM_DEFAULT_PROVIDER=tess
```

## Endpoints Principais

### Geração de Texto

**Endpoint:** `POST /api/v1/llm/generate`  
**Endpoint específico:** `POST /api/v1/llm/tess/generate`

```json
{
  "prompt": "Explique o conceito de inteligência artificial em termos simples.",
  "model": "tess-agent",
  "max_tokens": 500,
  "temperature": 0.7,
  "use_cache": true
}
```

### Contagem de Tokens

**Endpoint:** `POST /api/v1/llm/count-tokens`  
**Endpoint específico:** `POST /api/v1/llm/tess/count-tokens`

```json
{
  "text": "Explique o conceito de inteligência artificial em termos simples.",
  "model": "tess-agent"
}
```

### Listar Modelos

**Endpoint:** `GET /api/v1/llm/models`  
**Endpoint específico:** `GET /api/v1/llm/tess/models`

## Exemplos de Uso

### Python

```python
import requests
import json

url = "http://localhost:8000/api/v1/llm/tess/generate"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer seu_token_aqui"
}
payload = {
    "prompt": "Explique o conceito de inteligência artificial em termos simples.",
    "model": "tess-agent",
    "max_tokens": 500
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
result = response.json()
print(result["text"])
```

### cURL

```bash
curl -X POST "http://localhost:8000/api/v1/llm/tess/generate" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer seu_token_aqui" \
     -d '{
           "prompt": "Explique o conceito de inteligência artificial em termos simples.",
           "model": "tess-agent",
           "max_tokens": 500
         }'
```

## Tratamento de Erros

| Código HTTP | Descrição |
|-------------|-----------|
| 400 | Requisição inválida (parâmetros incorretos) |
| 401 | Não autorizado (chave de API inválida) |
| 404 | Modelo não encontrado |
| 429 | Muitas requisições (rate limit excedido) |
| 500 | Erro interno do servidor |

## Recursos Adicionais

Para documentação mais detalhada, consulte:
- [Documentação Completa da API Tess AI](/docs/api/llm/tess_endpoints.md)
- [Guia de Integração de LLMs](/docs/api/llm/integration_guide.md)
