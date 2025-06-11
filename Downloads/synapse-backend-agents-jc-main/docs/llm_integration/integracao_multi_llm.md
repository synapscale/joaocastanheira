# Documentação Detalhada de Integração com Múltiplos LLMs

## Visão Geral

Este documento fornece uma documentação completa sobre como integrar e utilizar diferentes provedores de LLM (Large Language Models) através da API do SynapScale Backend. A documentação cobre todos os provedores disponíveis, parâmetros específicos, exemplos de uso e fluxos avançados.

## Provedores Suportados

O SynapScale Backend suporta integração com os seguintes provedores de LLM:

| Provedor | Descrição | Casos de Uso Recomendados |
|----------|-----------|---------------------------|
| OpenAI | Modelos GPT da OpenAI, incluindo GPT-3.5 e GPT-4 | Geração de texto de alta qualidade, análise de sentimento, classificação, resumo |
| Anthropic | Modelos Claude da Anthropic | Tarefas que exigem raciocínio ético, explicações detalhadas, seguimento rigoroso de instruções |
| Google Gemini | Modelos Gemini do Google | Tarefas multimodais, análise de dados, geração de código |

## Modelos Disponíveis por Provedor

### OpenAI
- `gpt-4` (padrão): Modelo mais avançado, com melhor raciocínio e seguimento de instruções
- `gpt-4-turbo`: Versão otimizada do GPT-4 com melhor desempenho
- `gpt-3.5-turbo`: Modelo mais rápido e econômico, bom para tarefas simples

### Anthropic
- `claude-3-opus-20240229` (padrão): Modelo mais avançado da Anthropic
- `claude-3-sonnet-20240229`: Equilíbrio entre qualidade e velocidade
- `claude-3-haiku-20240307`: Modelo mais rápido e econômico

### Google Gemini
- `gemini-pro` (padrão): Modelo de uso geral com bom equilíbrio entre qualidade e velocidade
- `gemini-pro-vision`: Modelo com capacidades multimodais (texto e imagem)
- `gemini-ultra`: Modelo mais avançado com capacidades de raciocínio superiores

## Parâmetros Comuns

Os seguintes parâmetros são comuns a todos os provedores:

| Parâmetro | Tipo | Descrição | Valor Padrão | Intervalo Válido |
|-----------|------|-----------|--------------|------------------|
| `prompt` | string | Texto de entrada para o modelo | (obrigatório) | - |
| `provider` | string | Provedor de LLM a ser utilizado | `"openai"` | `"openai"`, `"anthropic"`, `"gemini"` |
| `model` | string | Modelo específico do provedor | (depende do provedor) | Ver lista de modelos acima |
| `temperature` | float | Controla aleatoriedade da resposta | 0.7 | 0.0 - 1.0 |
| `max_tokens` | integer | Número máximo de tokens na resposta | 1000 | 1 - 32000 (varia por modelo) |

## Parâmetros Específicos por Provedor

### OpenAI
| Parâmetro | Tipo | Descrição | Valor Padrão | Intervalo Válido |
|-----------|------|-----------|--------------|------------------|
| `top_p` | float | Controla diversidade via amostragem de núcleo | 1.0 | 0.0 - 1.0 |
| `frequency_penalty` | float | Penaliza tokens frequentes | 0.0 | -2.0 - 2.0 |
| `presence_penalty` | float | Penaliza tokens já utilizados | 0.0 | -2.0 - 2.0 |
| `stop` | array | Sequências que fazem o modelo parar | [] | - |

### Anthropic
| Parâmetro | Tipo | Descrição | Valor Padrão | Intervalo Válido |
|-----------|------|-----------|--------------|------------------|
| `top_k` | integer | Limita tokens considerados | 40 | 1 - 500 |
| `top_p` | float | Controla diversidade via amostragem de núcleo | 0.7 | 0.0 - 1.0 |
| `stop_sequences` | array | Sequências que fazem o modelo parar | [] | - |

### Google Gemini
| Parâmetro | Tipo | Descrição | Valor Padrão | Intervalo Válido |
|-----------|------|-----------|--------------|------------------|
| `top_k` | integer | Limita tokens considerados | 40 | 1 - 500 |
| `top_p` | float | Controla diversidade via amostragem de núcleo | 0.95 | 0.0 - 1.0 |
| `candidate_count` | integer | Número de respostas alternativas | 1 | 1 - 8 |

## Exemplos de Uso

### Exemplo Básico (OpenAI)

```python
import requests
import json

url = "https://api.synapscale.com/api/v1/llm/generate"
headers = {
    "Authorization": "Bearer YOUR_API_TOKEN",
    "Content-Type": "application/json"
}
payload = {
    "prompt": "Explique o conceito de inteligência artificial em termos simples.",
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 500
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
print(result["text"])
```

### Exemplo com Anthropic

```python
import requests
import json

url = "https://api.synapscale.com/api/v1/llm/generate"
headers = {
    "Authorization": "Bearer YOUR_API_TOKEN",
    "Content-Type": "application/json"
}
payload = {
    "prompt": "Explique o conceito de aprendizado de máquina para um estudante do ensino médio.",
    "provider": "anthropic",
    "model": "claude-3-opus-20240229",
    "temperature": 0.5,
    "max_tokens": 800,
    "top_p": 0.8
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
print(result["text"])
```

### Exemplo com Google Gemini

```python
import requests
import json

url = "https://api.synapscale.com/api/v1/llm/generate"
headers = {
    "Authorization": "Bearer YOUR_API_TOKEN",
    "Content-Type": "application/json"
}
payload = {
    "prompt": "Escreva um código Python para classificar uma lista de números usando o algoritmo quicksort.",
    "provider": "gemini",
    "model": "gemini-pro",
    "temperature": 0.2,
    "max_tokens": 1000,
    "top_k": 20
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
print(result["text"])
```

## Fluxos Avançados de Integração

### Sistema de Fallback entre Provedores

Para garantir alta disponibilidade, você pode implementar um sistema de fallback que tenta diferentes provedores em caso de falha:

```python
import requests
import time

def generate_with_fallback(prompt, max_retries=3):
    providers = ["openai", "anthropic", "gemini"]
    
    for provider in providers:
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    "https://api.synapscale.com/api/v1/llm/generate",
                    headers={
                        "Authorization": "Bearer YOUR_API_TOKEN",
                        "Content-Type": "application/json"
                    },
                    json={
                        "prompt": prompt,
                        "provider": provider,
                        "temperature": 0.7,
                        "max_tokens": 1000
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    return response.json()
                    
            except Exception as e:
                print(f"Erro com provedor {provider}, tentativa {attempt+1}: {str(e)}")
                time.sleep(1)
                
    raise Exception("Todos os provedores falharam após múltiplas tentativas")
```

### Seleção Dinâmica de Modelos Baseada em Complexidade

Este exemplo demonstra como selecionar automaticamente o modelo mais adequado com base na complexidade da tarefa:

```python
import requests
import re

def estimate_complexity(prompt):
    # Heurísticas simples para estimar complexidade
    complexity = 0
    
    # Comprimento do prompt
    complexity += len(prompt) / 100
    
    # Presença de termos técnicos
    technical_terms = ["algoritmo", "código", "programação", "matemática", "física", "química"]
    for term in technical_terms:
        if term.lower() in prompt.lower():
            complexity += 1
            
    # Presença de instruções de múltiplas etapas
    steps = len(re.findall(r'\d+\.\s', prompt))
    complexity += steps
    
    return complexity

def select_model_by_complexity(prompt):
    complexity = estimate_complexity(prompt)
    
    if complexity > 10:
        return "openai", "gpt-4"
    elif complexity > 5:
        return "anthropic", "claude-3-sonnet-20240229"
    else:
        return "gemini", "gemini-pro"

def generate_with_dynamic_selection(prompt):
    provider, model = select_model_by_complexity(prompt)
    
    response = requests.post(
        "https://api.synapscale.com/api/v1/llm/generate",
        headers={
            "Authorization": "Bearer YOUR_API_TOKEN",
            "Content-Type": "application/json"
        },
        json={
            "prompt": prompt,
            "provider": provider,
            "model": model,
            "temperature": 0.7,
            "max_tokens": 1000
        }
    )
    
    return response.json()
```

### Comparação e Votação entre Múltiplos Modelos

Para tarefas críticas onde a precisão é fundamental, você pode implementar um sistema de votação entre diferentes modelos:

```python
import requests
import concurrent.futures

def generate_with_voting(prompt, models=None):
    if models is None:
        models = [
            {"provider": "openai", "model": "gpt-4"},
            {"provider": "anthropic", "model": "claude-3-opus-20240229"},
            {"provider": "gemini", "model": "gemini-pro"}
        ]
    
    results = []
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_model = {
            executor.submit(
                requests.post,
                "https://api.synapscale.com/api/v1/llm/generate",
                headers={
                    "Authorization": "Bearer YOUR_API_TOKEN",
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": prompt,
                    "provider": model["provider"],
                    "model": model["model"],
                    "temperature": 0.3,  # Baixa temperatura para respostas mais determinísticas
                    "max_tokens": 1000
                }
            ): model for model in models
        }
        
        for future in concurrent.futures.as_completed(future_to_model):
            model = future_to_model[future]
            try:
                response = future.result()
                if response.status_code == 200:
                    result = response.json()
                    results.append({
                        "provider": model["provider"],
                        "model": model["model"],
                        "text": result["text"]
                    })
            except Exception as e:
                print(f"Erro com {model['provider']}/{model['model']}: {str(e)}")
    
    # Aqui você implementaria sua lógica de votação ou consenso
    # Este é um exemplo simples que retorna todos os resultados
    return results
```

## Monitoramento e Análise de Desempenho

Para monitorar o desempenho dos diferentes provedores e modelos, você pode implementar um sistema de logging e análise:

```python
import requests
import time
import json
import datetime

def log_llm_request(prompt, provider, model, response, duration):
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "prompt": prompt,
        "provider": provider,
        "model": model,
        "response_status": response.status_code,
        "duration_ms": duration * 1000,
        "tokens": response.json().get("usage", {}).get("total_tokens", 0) if response.status_code == 200 else 0
    }
    
    # Aqui você salvaria o log em um arquivo ou banco de dados
    with open("llm_performance_log.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

def generate_with_logging(prompt, provider, model):
    start_time = time.time()
    
    response = requests.post(
        "https://api.synapscale.com/api/v1/llm/generate",
        headers={
            "Authorization": "Bearer YOUR_API_TOKEN",
            "Content-Type": "application/json"
        },
        json={
            "prompt": prompt,
            "provider": provider,
            "model": model,
            "temperature": 0.7,
            "max_tokens": 1000
        }
    )
    
    duration = time.time() - start_time
    log_llm_request(prompt, provider, model, response, duration)
    
    return response.json() if response.status_code == 200 else None
```

## Considerações de Custo e Otimização

Cada provedor e modelo tem diferentes estruturas de preço. Aqui estão algumas estratégias para otimizar custos:

1. **Seleção de Modelo Baseada em Custo-Benefício**:
   - Use modelos mais simples para tarefas simples
   - Reserve modelos avançados para tarefas complexas

2. **Otimização de Prompts**:
   - Prompts mais concisos reduzem o consumo de tokens
   - Instruções claras reduzem a necessidade de múltiplas chamadas

3. **Cache Inteligente**:
   - Implemente cache para prompts frequentes
   - Use hashing para identificar prompts semanticamente similares

4. **Monitoramento de Uso**:
   - Acompanhe o consumo de tokens por modelo e caso de uso
   - Estabeleça limites de uso para evitar custos inesperados

## Obtenção de Tokens de API

Para utilizar a API do SynapScale Backend, você precisa de um token de autenticação:

1. Acesse o painel de administração do SynapScale
2. Navegue até "Configurações" > "API Tokens"
3. Clique em "Gerar Novo Token"
4. Dê um nome descritivo ao token e selecione as permissões necessárias
5. Copie o token gerado (ele será mostrado apenas uma vez)

Os tokens têm validade de 30 dias por padrão, mas isso pode ser configurado no momento da criação.

## Tratamento de Erros

A API pode retornar os seguintes códigos de erro:

| Código | Descrição | Solução |
|--------|-----------|---------|
| 400 | Requisição inválida | Verifique os parâmetros enviados |
| 401 | Não autorizado | Verifique se o token é válido e não expirou |
| 403 | Proibido | Verifique se o token tem as permissões necessárias |
| 404 | Não encontrado | Verifique o endpoint da API |
| 429 | Muitas requisições | Implemente rate limiting no cliente |
| 500 | Erro interno do servidor | Contate o suporte ou tente novamente mais tarde |
| 503 | Serviço indisponível | O provedor de LLM pode estar temporariamente indisponível |

## Conclusão

Esta documentação fornece uma visão abrangente da integração com múltiplos LLMs através da API do SynapScale Backend. Seguindo estas diretrizes e exemplos, você poderá implementar soluções robustas e flexíveis que aproveitam o melhor de cada provedor de LLM.

Para suporte adicional ou dúvidas, entre em contato com a equipe de suporte do SynapScale.
