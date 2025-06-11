# Documentação da API Tess AI

## Visão Geral

A API Tess AI é uma interface para acesso a múltiplos modelos de linguagem através de agentes especializados. Ela permite a geração de texto, consulta de modelos disponíveis e gerenciamento de agentes de IA.

## Endpoints

### Geração de Texto

**Endpoint:** `/api/v1/llm/generate`

**Método:** POST

**Descrição:** Gera texto a partir de um prompt usando a Tess AI.

**Autenticação:** Bearer Token

**Parâmetros de Entrada:**
- `prompt` (string, obrigatório): Texto de entrada para o modelo
- `model` (string, opcional): Modelo específico a ser usado
- `max_tokens` (integer, opcional): Número máximo de tokens a gerar (padrão: 1000)
- `temperature` (float, opcional): Temperatura para amostragem (0.0-1.0, padrão: 0.7)
- `language` (string, opcional): Idioma da resposta (padrão: "Portuguese (Brazil)")
- `provider` (string, opcional): Provedor LLM a ser usado (padrão: configuração do sistema)

**Exemplo de Requisição:**
```json
{
  "prompt": "Explique de forma simples o que é inteligência artificial.",
  "model": "gpt-4o",
  "max_tokens": 500,
  "temperature": 0.7,
  "provider": "tess"
}
```

**Exemplo de Resposta:**
```json
{
  "content": "Inteligência Artificial (IA) é como ensinar computadores a pensar e aprender de forma parecida com os humanos. Imagine que você está ensinando um computador a reconhecer gatos em fotos - você mostra milhares de fotos de gatos, e o computador aprende aos poucos quais características formam um gato (orelhas pontudas, bigodes, etc.). Depois desse 'treinamento', o computador consegue identificar gatos em fotos que nunca viu antes.\n\nExistem diferentes tipos de IA:\n\n1. IA Estreita: Programada para fazer uma tarefa específica muito bem, como reconhecer rostos ou jogar xadrez.\n\n2. IA Geral: Seria capaz de aprender qualquer tarefa intelectual que um humano pode fazer (ainda estamos longe disso).\n\nAs IAs modernas usam principalmente 'aprendizado de máquina', onde os sistemas melhoram automaticamente com a experiência, e 'aprendizado profundo', que usa redes neurais artificiais inspiradas no cérebro humano para processar dados em camadas cada vez mais complexas.\n\nNo dia a dia, você já usa IA quando pede recomendações na Netflix, usa assistentes como Siri ou Alexa, ou quando seu email filtra spam automaticamente.",
  "model": "gpt-4o",
  "provider": "tess",
  "processing_time": 2.34
}
```

### Listagem de Modelos

**Endpoint:** `/api/v1/llm/models`

**Método:** GET

**Descrição:** Lista todos os modelos disponíveis na Tess AI.

**Autenticação:** Bearer Token

**Parâmetros de Consulta:**
- `provider` (string, opcional): Filtrar por provedor específico

**Exemplo de Resposta:**
```json
{
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "provider": "OpenAI",
      "context_window": 8000,
      "capabilities": ["text-generation", "reasoning"]
    },
    {
      "id": "claude-3-opus",
      "name": "Claude 3 Opus",
      "provider": "Anthropic",
      "context_window": 100000,
      "capabilities": ["text-generation", "reasoning"]
    },
    {
      "id": "gemini-1.5-pro",
      "name": "Gemini 1.5 Pro",
      "provider": "Google",
      "context_window": 32000,
      "capabilities": ["text-generation", "reasoning"]
    }
  ],
  "total": 3
}
```

### Listagem de Agentes

**Endpoint:** `/api/v1/llm/tess/agents`

**Método:** GET

**Descrição:** Lista todos os agentes disponíveis na Tess AI.

**Autenticação:** Bearer Token

**Parâmetros de Consulta:**
- `type` (string, opcional): Filtrar por tipo de agente (ex: "chat", "text")
- `page` (integer, opcional): Página de resultados (padrão: 1)
- `per_page` (integer, opcional): Itens por página (padrão: 15)

**Exemplo de Resposta:**
```json
{
  "agents": [
    {
      "id": 123,
      "title": "Assistente de Chat Avançado",
      "type": "chat",
      "description": "Assistente de chat com suporte a múltiplos modelos"
    },
    {
      "id": 456,
      "title": "Gerador de Texto",
      "type": "text",
      "description": "Gerador de texto para diversos fins"
    }
  ],
  "total": 2,
  "page": 1,
  "per_page": 15
}
```

### Detalhes do Agente

**Endpoint:** `/api/v1/llm/tess/agents/{agent_id}`

**Método:** GET

**Descrição:** Obtém detalhes de um agente específico.

**Autenticação:** Bearer Token

**Parâmetros de Caminho:**
- `agent_id` (integer, obrigatório): ID do agente

**Exemplo de Resposta:**
```json
{
  "id": 123,
  "title": "Assistente de Chat Avançado",
  "type": "chat",
  "description": "Assistente de chat com suporte a múltiplos modelos",
  "questions": [
    {
      "name": "prompt",
      "type": "textarea",
      "required": true,
      "label": "Pergunta"
    },
    {
      "name": "model",
      "type": "select",
      "required": false,
      "label": "Modelo",
      "options": [
        {"label": "GPT-4o", "value": "gpt-4o"},
        {"label": "Claude 3 Opus", "value": "claude-3-opus"}
      ]
    }
  ]
}
```

## Integração com o SynapScale

A API Tess AI está integrada ao SynapScale como um provedor adicional de LLM, permitindo acesso a múltiplos modelos de linguagem através de uma interface unificada. Para usar a Tess AI, configure a variável `TESS_API_KEY` no arquivo `.env` e defina `LLM_DEFAULT_PROVIDER=tess` se desejar usá-la como provedor padrão.

## Configuração

Para configurar a API Tess AI, adicione as seguintes variáveis ao seu arquivo `.env`:

```
TESS_API_KEY=sua_chave_api_tess_aqui
TESS_API_BASE_URL=https://tess.pareto.io/api
```

## Exemplos de Uso

### Python

```python
import requests
import json

# Configuração
api_url = "http://localhost:8000/api/v1"
headers = {
    "Authorization": "Bearer seu_token_aqui",
    "Content-Type": "application/json"
}

# Exemplo de geração de texto
def generate_text():
    endpoint = f"{api_url}/llm/generate"
    payload = {
        "prompt": "Explique de forma simples o que é inteligência artificial.",
        "provider": "tess",
        "model": "gpt-4o",
        "max_tokens": 500
    }
    
    response = requests.post(endpoint, headers=headers, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Resposta: {result['content']}")
    else:
        print(f"Erro: {response.status_code} - {response.text}")

# Exemplo de listagem de modelos
def list_models():
    endpoint = f"{api_url}/llm/models?provider=tess"
    
    response = requests.get(endpoint, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Modelos disponíveis: {json.dumps(result, indent=2)}")
    else:
        print(f"Erro: {response.status_code} - {response.text}")

# Executa os exemplos
generate_text()
list_models()
```

## Tratamento de Erros

A API retorna os seguintes códigos de erro:

- `400 Bad Request`: Parâmetros inválidos ou ausentes
- `401 Unauthorized`: Autenticação inválida ou ausente
- `403 Forbidden`: Acesso negado
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Limitações

- A contagem de tokens é aproximada e pode variar entre modelos
- Alguns modelos podem não estar disponíveis em todos os agentes
- O tempo de resposta pode variar dependendo do modelo e da complexidade da solicitação
