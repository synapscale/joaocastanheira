# Guia de Integração de LLMs

## Visão Geral

Este guia explica como integrar e configurar múltiplos provedores de Modelos de Linguagem de Grande Escala (LLMs) no SynapScale. A arquitetura multi-LLM permite usar diferentes provedores como Claude, Gemini, Grok e DeepSeek através de uma interface unificada.

## Configuração do Ambiente

### Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```
# Chaves de API para LLMs
CLAUDE_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key
GROK_API_KEY=your_grok_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Configurações de LLM
LLM_DEFAULT_PROVIDER=claude  # Provedor padrão
LLM_ENABLE_CACHE=true        # Ativar cache de respostas
LLM_CACHE_TTL=3600           # Tempo de vida do cache em segundos
```

### Instalação de Dependências

Instale as bibliotecas necessárias para os provedores que deseja utilizar:

```bash
# Para Claude (Anthropic)
pip install anthropic

# Para Gemini (Google)
pip install google-generativeai

# Para Grok (xAI)
pip install xai

# Para DeepSeek
pip install deepseek-ai
```

## Uso Básico

### Geração de Texto

```python
from synapse.core.llm import unified_service

# Usando o provedor padrão
response = await unified_service.generate_text(
    prompt="Explique o conceito de machine learning em termos simples.",
    max_tokens=500
)

# Usando um provedor específico
response = await unified_service.generate_text(
    prompt="Explique o conceito de machine learning em termos simples.",
    provider="gemini",
    max_tokens=500,
    temperature=0.7
)

print(response["text"])
```

### Contagem de Tokens

```python
from synapse.core.llm import unified_service

token_count = await unified_service.count_tokens(
    text="Este é um exemplo de texto para contar tokens.",
    provider="claude"
)

print(f"Número de tokens: {token_count['token_count']}")
```

### Listagem de Modelos

```python
from synapse.core.llm import unified_service

# Listar todos os modelos de todos os provedores
models = await unified_service.list_models()

# Listar modelos de um provedor específico
claude_models = await unified_service.list_models(provider="claude")

for model in claude_models["providers"]["claude"]["models"]:
    print(f"Modelo: {model['name']}, Contexto: {model['context_window']} tokens")
```

## Adicionando um Novo Provedor

Para adicionar suporte a um novo provedor de LLM:

1. Crie uma nova classe que herda de `BaseLLMConnector` em `src/synapse/core/llm/`
2. Implemente todos os métodos abstratos
3. Adicione o novo provedor à fábrica de conectores em `factory.py`
4. Atualize a configuração para incluir a nova chave de API

Exemplo:

```python
from synapse.core.llm.base import BaseLLMConnector

class NewProviderConnector(BaseLLMConnector):
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.client = new_provider_sdk.Client(api_key=api_key)
        
    # Implementar todos os métodos abstratos...
```

## Processamento de Imagens

Alguns provedores suportam processamento multimodal (texto + imagens):

```python
from synapse.core.llm import unified_service
import base64

# Carregar a imagem
with open("imagem.jpg", "rb") as f:
    image_data = f.read()

# Gerar texto com base na imagem
response = await unified_service.generate_text(
    prompt="Descreva o que você vê nesta imagem.",
    provider="gemini",
    image=image_data
)

print(response["text"])
```

## Tratamento de Erros

```python
from synapse.core.llm import unified_service

try:
    response = await unified_service.generate_text(
        prompt="Explique o conceito de machine learning.",
        provider="claude"
    )
    print(response["text"])
except Exception as e:
    print(f"Erro ao gerar texto: {str(e)}")
    # Tentar com outro provedor
    try:
        response = await unified_service.generate_text(
            prompt="Explique o conceito de machine learning.",
            provider="gemini"
        )
        print(response["text"])
    except Exception as fallback_error:
        print(f"Erro no fallback: {str(fallback_error)}")
```

## Melhores Práticas

1. **Use o Cache**: Ative o cache para consultas repetidas para economizar custos e melhorar o desempenho.
2. **Defina Limites de Tokens**: Sempre especifique `max_tokens` para evitar respostas excessivamente longas.
3. **Tratamento de Erros**: Implemente tratamento de erros robusto, incluindo fallbacks para outros provedores.
4. **Monitoramento**: Monitore o uso de tokens e custos associados às chamadas de API.
5. **Segurança**: Nunca exponha chaves de API no código ou em repositórios públicos.
