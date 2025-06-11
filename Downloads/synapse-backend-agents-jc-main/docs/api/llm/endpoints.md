# Documentação da API de LLMs

## Visão Geral

A API de LLMs do SynapScale permite integrar múltiplos provedores de modelos de linguagem através de uma interface unificada. Esta abordagem oferece várias vantagens:

- **Flexibilidade**: Escolha o provedor mais adequado para cada caso de uso
- **Resiliência**: Fallback automático entre provedores em caso de falha
- **Extensibilidade**: Facilidade para adicionar novos provedores
- **Consistência**: Interface padronizada independente do provedor

## Endpoints Disponíveis

### Geração de Texto

```
POST /api/v1/llm/generate
```

Gera texto a partir de um prompt usando o provedor padrão ou especificado.

**Parâmetros do Corpo**:
- `prompt` (string, obrigatório): Texto de entrada para o modelo
- `provider` (string, opcional): Provedor de LLM a ser usado
- `model` (string, opcional): Modelo específico a ser usado
- `max_tokens` (integer, opcional): Número máximo de tokens a gerar
- `temperature` (float, opcional): Temperatura para amostragem (0.0-1.0)
- `top_p` (float, opcional): Valor de top-p para amostragem nucleus
- `top_k` (integer, opcional): Valor de top-k para amostragem
- `use_cache` (boolean, opcional): Se deve usar o cache (se disponível)

**Exemplo de Requisição**:
```json
{
  "prompt": "Explique o conceito de machine learning em termos simples.",
  "provider": "claude",
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 500,
  "temperature": 0.7
}
```

**Exemplo de Resposta**:
```json
{
  "text": "Machine learning é como ensinar um computador a aprender com exemplos, em vez de programá-lo com regras específicas...",
  "provider": "claude",
  "model": "claude-3-sonnet-20240229",
  "execution_time": 2.45,
  "cached": false
}
```

### Contagem de Tokens

```
POST /api/v1/llm/count-tokens
```

Conta o número de tokens em um texto.

**Parâmetros do Corpo**:
- `text` (string, obrigatório): Texto para contar tokens
- `provider` (string, opcional): Provedor de LLM a ser usado
- `model` (string, opcional): Modelo específico a ser usado

**Exemplo de Requisição**:
```json
{
  "text": "Este é um exemplo de texto para contar tokens.",
  "provider": "claude"
}
```

**Exemplo de Resposta**:
```json
{
  "token_count": 12,
  "provider": "claude",
  "model": "claude-3-sonnet-20240229"
}
```

### Listagem de Modelos

```
GET /api/v1/llm/models
```

Lista todos os modelos disponíveis em todos os provedores configurados.

**Parâmetros de Query**:
- `provider` (string, opcional): Filtrar por provedor específico

**Exemplo de Resposta**:
```json
{
  "providers": {
    "claude": {
      "available": true,
      "models": [
        {
          "id": "claude-3-opus-20240229",
          "name": "Claude 3 Opus",
          "context_window": 200000,
          "capabilities": ["text-generation", "image-understanding", "reasoning"]
        },
        {
          "id": "claude-3-sonnet-20240229",
          "name": "Claude 3 Sonnet",
          "context_window": 200000,
          "capabilities": ["text-generation", "image-understanding"]
        }
      ]
    },
    "gemini": {
      "available": true,
      "models": [
        {
          "id": "gemini-1.5-pro-latest",
          "name": "Gemini 1.5 Pro",
          "context_window": 1000000,
          "capabilities": ["text-generation", "image-understanding", "code-generation"]
        }
      ]
    }
  }
}
```

### Listagem de Provedores

```
GET /api/v1/llm/providers
```

Lista todos os provedores disponíveis e suas capacidades.

**Exemplo de Resposta**:
```json
{
  "providers": [
    {
      "name": "claude",
      "available": true,
      "capabilities": ["text-generation", "image-understanding"],
      "default_model": "claude-3-sonnet-20240229"
    },
    {
      "name": "gemini",
      "available": true,
      "capabilities": ["text-generation", "image-understanding", "code-generation"],
      "default_model": "gemini-1.5-pro-latest"
    }
  ],
  "default_provider": "claude"
}
```

### Endpoints Específicos de Provedores

Além dos endpoints genéricos, cada provedor tem endpoints específicos:

```
POST /api/v1/llm/{provider}/generate
POST /api/v1/llm/{provider}/count-tokens
GET /api/v1/llm/{provider}/models
```

Estes endpoints funcionam da mesma forma que os genéricos, mas garantem o uso de um provedor específico.

## Códigos de Erro

| Código | Descrição | Solução |
|--------|-----------|---------|
| 401 | Não autorizado | Verifique o token de autenticação |
| 403 | Acesso negado | Verifique as permissões do usuário |
| 404 | Recurso não encontrado | Verifique o caminho da URL |
| 422 | Erro de validação | Verifique os parâmetros da requisição |
| 500 | Erro interno do servidor | Verifique os logs do servidor |

## Limitações Conhecidas

- **Rate Limiting**: Todos os provedores impõem limites de requisições por minuto
- **Custo**: Chamadas às APIs externas geram custos baseados em tokens processados
- **Latência**: Respostas podem levar vários segundos, especialmente para prompts longos
- **Conteúdo**: Alguns provedores filtram certos tipos de conteúdo
- **Multimodalidade**: Nem todos os provedores suportam processamento de imagens
