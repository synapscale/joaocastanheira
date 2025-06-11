"""
Schemas para os endpoints de LLM.

Este módulo define os modelos Pydantic para requisições e respostas
relacionadas aos endpoints de LLM.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class ProviderEnum(str, Enum):
    """Enum para provedores de LLM disponíveis."""

    openai = "openai"
    claude = "claude"
    gemini = "gemini"
    llama = "llama"
    grok = "grok"
    deepseek = "deepseek"
    tess = "tess"


class ModelEnum(str, Enum):
    """Enum para modelos de LLM disponíveis."""

    # OpenAI
    gpt_4o = "gpt-4o"
    gpt_4_turbo = "gpt-4-turbo"
    gpt_35_turbo = "gpt-3.5-turbo"

    # Claude
    claude_3_opus = "claude-3-opus-20240229"
    claude_3_sonnet = "claude-3-sonnet-20240229"
    claude_3_haiku = "claude-3-haiku-20240307"

    # Gemini
    gemini_pro = "gemini-1.5-pro"
    gemini_flash = "gemini-1.5-flash"

    # Llama
    llama_3_70b = "llama-3-70b"
    llama_3_8b = "llama-3-8b"
    llama_2_70b = "llama-2-70b"

    # Grok
    grok_1 = "grok-1"

    # DeepSeek
    deepseek_chat = "deepseek-chat"
    deepseek_coder = "deepseek-coder"


class GenerateTextRequest(BaseModel):
    """Modelo para requisição de geração de texto."""

    prompt: str = Field(
        ...,
        description="Texto de entrada para o modelo",
        example="Explique o conceito de machine learning em termos simples.",
    )
    provider: ProviderEnum | None = Field(
        None,
        description="Provedor de LLM a ser usado",
        example="claude",
    )
    model: ModelEnum | None = Field(
        None,
        description="Modelo específico a ser usado",
        example="claude-3-sonnet-20240229",
    )
    max_tokens: int | None = Field(
        1000,
        description="Número máximo de tokens a gerar (limite varia por modelo)",
        example=500,
        ge=1,
        le=100000,
    )
    temperature: float | None = Field(
        0.7,
        description="Temperatura para amostragem (0.0=determinístico, 1.0=muito aleatório)",
        example=0.7,
        ge=0.0,
        le=1.0,
    )
    top_p: float | None = Field(
        0.95,
        description="Valor de top-p para amostragem nucleus (0.0-1.0)",
        example=0.95,
        ge=0.0,
        le=1.0,
    )
    top_k: int | None = Field(
        40,
        description="Valor de top-k para amostragem (limita tokens considerados)",
        example=40,
        ge=1,
    )
    use_cache: bool | None = Field(
        True,
        description="Se deve usar o cache para respostas (se disponível)",
        example=True,
    )

    class Config:
        schema_extra = {
            "example": {
                "prompt": "Explique o conceito de machine learning em termos simples.",
                "provider": "claude",
                "model": "claude-3-sonnet-20240229",
                "max_tokens": 500,
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "use_cache": True,
            },
        }


class CountTokensRequest(BaseModel):
    """Modelo para requisição de contagem de tokens."""

    text: str = Field(
        ...,
        description="Texto para contar tokens",
        example="Este é um exemplo de texto para contar tokens.",
    )
    provider: ProviderEnum | None = Field(
        None,
        description="Provedor de LLM a ser usado para contagem",
        example="openai",
    )
    model: ModelEnum | None = Field(
        None,
        description="Modelo específico a ser usado para contagem",
        example="gpt-4o",
    )

    class Config:
        schema_extra = {
            "example": {
                "text": "Este é um exemplo de texto para contar tokens.",
                "provider": "openai",
                "model": "gpt-4o",
            },
        }


class HarassmentBlockLevel(str, Enum):
    """Níveis de bloqueio para conteúdo de assédio."""

    block_none = "block_none"
    block_low = "block_low"
    block_medium = "block_medium"
    block_high = "block_high"
    block_all = "block_all"


class HateBlockLevel(str, Enum):
    """Níveis de bloqueio para conteúdo de ódio."""

    block_none = "block_none"
    block_only_high = "block_only_high"
    block_medium_and_high = "block_medium_and_high"
    block_all = "block_all"


class SafetySettings(BaseModel):
    """Configurações de segurança para modelos Gemini."""

    harassment: HarassmentBlockLevel | None = Field(
        HarassmentBlockLevel.block_medium,
        description="Nível de bloqueio para conteúdo de assédio",
        example="block_none",
    )
    hate: HateBlockLevel | None = Field(
        HateBlockLevel.block_only_high,
        description="Nível de bloqueio para conteúdo de ódio",
        example="block_only_high",
    )


class ProviderSpecificParams(BaseModel):
    """Parâmetros específicos para cada provedor de LLM."""

    # OpenAI
    presence_penalty: float | None = Field(
        None,
        description="[OpenAI] Penalidade de presença (-2.0 a 2.0)",
        example=0.0,
        ge=-2.0,
        le=2.0,
    )
    frequency_penalty: float | None = Field(
        None,
        description="[OpenAI] Penalidade de frequência (-2.0 a 2.0)",
        example=0.0,
        ge=-2.0,
        le=2.0,
    )

    # Claude
    system_prompt: str | None = Field(
        None,
        description="[Claude] Prompt de sistema para definir comportamento",
        example="Você é um assistente especialista em explicar conceitos técnicos de forma simples.",
    )

    # Gemini
    safety_settings: SafetySettings | None = Field(
        None,
        description="[Gemini] Configurações de segurança",
        example={
            "harassment": "block_none",
            "hate": "block_only_high",
        },
    )

    # Llama
    repeat_penalty: float | None = Field(
        None,
        description="[Llama] Penalidade de repetição (1.0-2.0)",
        example=1.1,
        ge=1.0,
        le=2.0,
    )

    # Grok
    stop_sequences: list[str] | None = Field(
        None,
        description="[Grok] Sequências para parar a geração",
        example=["###", "Fim"],
    )

    # DeepSeek
    seed: int | None = Field(
        None,
        description="[DeepSeek] Seed para geração determinística",
        example=42,
    )

    class Config:
        schema_extra = {
            "example": {
                "presence_penalty": 0.0,
                "frequency_penalty": 0.0,
                "system_prompt": "Você é um assistente especialista em explicar conceitos técnicos de forma simples.",
            },
        }


class GenerateTextWithProviderRequest(BaseModel):
    """Modelo para requisição de geração de texto com parâmetros específicos do provedor."""

    prompt: str = Field(
        ...,
        description="Texto de entrada para o modelo",
        example="Explique o conceito de machine learning em termos simples.",
    )
    model: ModelEnum | None = Field(
        None,
        description="Modelo específico a ser usado",
        example="claude-3-sonnet-20240229",
    )
    max_tokens: int | None = Field(
        1000,
        description="Número máximo de tokens a gerar (limite varia por modelo)",
        example=500,
        ge=1,
        le=100000,
    )
    temperature: float | None = Field(
        0.7,
        description="Temperatura para amostragem (0.0=determinístico, 1.0=muito aleatório)",
        example=0.7,
        ge=0.0,
        le=1.0,
    )
    presence_penalty: float | None = Field(
        None,
        description="[OpenAI] Penalidade de presença (-2.0 a 2.0)",
        example=0.0,
        ge=-2.0,
        le=2.0,
    )
    frequency_penalty: float | None = Field(
        None,
        description="[OpenAI] Penalidade de frequência (-2.0 a 2.0)",
        example=0.0,
        ge=-2.0,
        le=2.0,
    )
    top_p: float | None = Field(
        0.95,
        description="Valor de top-p para amostragem nucleus (0.0-1.0)",
        example=0.95,
        ge=0.0,
        le=1.0,
    )
    top_k: int | None = Field(
        40,
        description="Valor de top-k para amostragem (limita tokens considerados)",
        example=40,
        ge=1,
    )
    system_prompt: str | None = Field(
        None,
        description="[Claude] Prompt de sistema para definir comportamento",
        example="Você é um assistente especialista em explicar conceitos técnicos de forma simples.",
    )
    repeat_penalty: float | None = Field(
        None,
        description="[Llama] Penalidade de repetição (1.0-2.0)",
        example=1.1,
        ge=1.0,
        le=2.0,
    )
    stop_sequences: list[str] | None = Field(
        None,
        description="[Grok] Sequências para parar a geração",
        example=["###", "Fim"],
    )
    seed: int | None = Field(
        None,
        description="[DeepSeek] Seed para geração determinística",
        example=42,
    )

    class Config:
        schema_extra = {
            "example": {
                "prompt": "Explique o conceito de machine learning em termos simples.",
                "model": "claude-3-sonnet-20240229",
                "max_tokens": 500,
                "temperature": 0.7,
                "system_prompt": "Você é um assistente especialista em explicar conceitos técnicos de forma simples.",
                "top_p": 0.95,
                "top_k": 40,
            },
        }


class ModelCapability(str, Enum):
    """Capacidades dos modelos de LLM."""

    text = "text"
    vision = "vision"
    reasoning = "reasoning"
    code = "code"
    function_calling = "function_calling"


class ModelStatus(str, Enum):
    """Status de disponibilidade dos modelos."""

    available = "available"
    limited = "limited"
    unavailable = "unavailable"
    deprecated = "deprecated"


class ProviderStatus(str, Enum):
    """Status operacional dos provedores."""

    operational = "operational"
    degraded = "degraded"
    maintenance = "maintenance"
    outage = "outage"


class ModelInfo(BaseModel):
    """Informações sobre um modelo de LLM."""

    id: str = Field(..., description="Identificador único do modelo")
    name: str = Field(..., description="Nome do modelo")
    provider: str = Field(..., description="Provedor do modelo")
    capabilities: list[ModelCapability] = Field(
        ..., description="Capacidades do modelo (text, vision, etc.)"
    )
    context_window: int = Field(
        ..., description="Tamanho da janela de contexto em tokens"
    )
    pricing: dict[str, float] | None = Field(
        None, description="Informações de preço (por 1K tokens)"
    )
    status: ModelStatus = Field(..., description="Status de disponibilidade do modelo")

    class Config:
        schema_extra = {
            "example": {
                "id": "claude-3-sonnet-20240229",
                "name": "Claude 3 Sonnet",
                "provider": "claude",
                "capabilities": ["text", "vision", "reasoning"],
                "context_window": 200000,
                "pricing": {
                    "input": 0.008,
                    "output": 0.024,
                },
                "status": "available",
            },
        }


class ProviderInfo(BaseModel):
    """Informações sobre um provedor de LLM."""

    id: str = Field(..., description="Identificador único do provedor")
    name: str = Field(..., description="Nome do provedor")
    description: str = Field(..., description="Descrição do provedor")
    models_count: int = Field(..., description="Número de modelos disponíveis")
    status: ProviderStatus = Field(..., description="Status operacional do provedor")
    documentation_url: str | None = Field(
        None, description="URL da documentação oficial"
    )

    class Config:
        schema_extra = {
            "example": {
                "id": "claude",
                "name": "Claude (Anthropic)",
                "description": "Modelos de linguagem da Anthropic, focados em segurança e alinhamento",
                "models_count": 3,
                "status": "operational",
                "documentation_url": "https://docs.anthropic.com/claude/reference/getting-started-with-the-api",
            },
        }


class ListModelsResponse(BaseModel):
    """Resposta para listagem de modelos."""

    models: dict[str, list[ModelInfo]] = Field(
        ..., description="Modelos agrupados por provedor"
    )
    count: int = Field(..., description="Número total de modelos")

    class Config:
        schema_extra = {
            "example": {
                "models": {
                    "claude": [
                        {
                            "id": "claude-3-opus-20240229",
                            "name": "Claude 3 Opus",
                            "provider": "claude",
                            "capabilities": ["text", "vision", "reasoning"],
                            "context_window": 200000,
                            "pricing": {
                                "input": 0.015,
                                "output": 0.075,
                            },
                            "status": "available",
                        },
                        {
                            "id": "claude-3-sonnet-20240229",
                            "name": "Claude 3 Sonnet",
                            "provider": "claude",
                            "capabilities": ["text", "vision", "reasoning"],
                            "context_window": 200000,
                            "pricing": {
                                "input": 0.008,
                                "output": 0.024,
                            },
                            "status": "available",
                        },
                    ],
                    "openai": [
                        {
                            "id": "gpt-4o",
                            "name": "GPT-4o",
                            "provider": "openai",
                            "capabilities": ["text", "vision", "function_calling"],
                            "context_window": 128000,
                            "pricing": {
                                "input": 0.005,
                                "output": 0.015,
                            },
                            "status": "available",
                        },
                    ],
                },
                "count": 3,
            },
        }


class ListProvidersResponse(BaseModel):
    """Resposta para listagem de provedores."""

    providers: list[ProviderInfo] = Field(
        ..., description="Lista de provedores disponíveis"
    )
    count: int = Field(..., description="Número total de provedores")

    class Config:
        schema_extra = {
            "example": {
                "providers": [
                    {
                        "id": "claude",
                        "name": "Claude (Anthropic)",
                        "description": "Modelos de linguagem da Anthropic, focados em segurança e alinhamento",
                        "models_count": 3,
                        "status": "operational",
                        "documentation_url": "https://docs.anthropic.com/claude/reference/getting-started-with-the-api",
                    },
                    {
                        "id": "openai",
                        "name": "OpenAI",
                        "description": "Modelos de linguagem da OpenAI, incluindo GPT-4 e GPT-3.5",
                        "models_count": 5,
                        "status": "operational",
                        "documentation_url": "https://platform.openai.com/docs/api-reference",
                    },
                ],
                "count": 2,
            },
        }


class FinishReason(str, Enum):
    """Razões de término da geração de texto."""

    stop = "stop"
    length = "length"
    content_filter = "content_filter"
    error = "error"


class GenerateTextResponse(BaseModel):
    """Resposta para geração de texto."""

    text: str = Field(..., description="Texto gerado pelo modelo")
    provider: str = Field(..., description="Provedor utilizado")
    model: str = Field(..., description="Modelo utilizado")
    usage: dict[str, int] = Field(..., description="Estatísticas de uso de tokens")
    finish_reason: FinishReason = Field(..., description="Razão de término da geração")

    class Config:
        schema_extra = {
            "example": {
                "text": "Machine learning é uma forma de inteligência artificial que permite aos computadores aprender com dados e melhorar com a experiência, sem serem explicitamente programados para cada tarefa. Em termos simples, em vez de dar instruções detalhadas ao computador sobre como resolver um problema, você fornece exemplos do problema e da solução, e o computador aprende os padrões para resolver problemas semelhantes no futuro.\n\nPense nisso como ensinar uma criança: em vez de explicar todas as regras gramaticais, você mostra exemplos de frases corretas, e ela aprende os padrões com o tempo. Da mesma forma, algoritmos de machine learning identificam padrões em dados e usam esses padrões para fazer previsões ou tomar decisões sobre novos dados.",
                "provider": "claude",
                "model": "claude-3-sonnet-20240229",
                "usage": {
                    "prompt_tokens": 12,
                    "completion_tokens": 128,
                    "total_tokens": 140,
                },
                "finish_reason": "stop",
            },
        }


class CountTokensResponse(BaseModel):
    """Resposta para contagem de tokens."""

    token_count: int = Field(..., description="Número total de tokens no texto")
    provider: str = Field(..., description="Provedor utilizado para contagem")
    model: str | None = Field(
        None, description="Modelo utilizado para contagem (se especificado)"
    )

    class Config:
        schema_extra = {
            "example": {
                "token_count": 9,
                "provider": "openai",
                "model": "gpt-4o",
            },
        }
