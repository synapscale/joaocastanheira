"""
LLM Executor para execução de nós de Large Language Models
Criado por José - um desenvolvedor Full Stack
Executor especializado para integração com modelos de linguagem
"""

import json
import time
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import aiohttp
import openai
from openai import AsyncOpenAI

from synapse.core.executors.base import BaseExecutor, ExecutorType, ExecutionContext
from synapse.models.workflow_execution import NodeExecution
from synapse.models.node import Node


class LLMProvider:
    """Provedores de LLM suportados"""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    AZURE_OPENAI = "azure_openai"
    HUGGINGFACE = "huggingface"
    LOCAL = "local"


class LLMExecutor(BaseExecutor):
    """
    Executor especializado para nós de Large Language Models
    Suporta múltiplos provedores e funcionalidades avançadas
    """

    def __init__(self):
        super().__init__(ExecutorType.LLM)
        self.openai_client = None
        self.rate_limits: dict[str, dict[str, Any]] = {}
        self.token_usage: dict[str, dict[str, int]] = {}

    async def execute(
        self,
        node: Node,
        context: ExecutionContext,
        node_execution: NodeExecution,
    ) -> dict[str, Any]:
        """
        Executa um nó LLM
        """
        try:
            await self.pre_execute(node, context, node_execution)

            # Parse da configuração do nó
            config = self._parse_node_config(node)

            # Valida configuração
            validation = self.validate_config(config)
            if not validation["is_valid"]:
                return {
                    "success": False,
                    "error": f"Configuração inválida: {', '.join(validation['errors'])}",
                    "output": None,
                }

            # Extrai inputs de nós conectados
            inputs = self.extract_inputs_from_connections(node, context)

            # Prepara o prompt
            prompt = await self._prepare_prompt(config, context, inputs)

            # Executa a chamada LLM
            result = await self._execute_llm_call(config, prompt, context)

            await self.post_execute(node, context, node_execution, result)
            return result

        except Exception as e:
            return await self.handle_error(node, context, node_execution, e)

    def validate_config(self, config: dict[str, Any]) -> dict[str, Any]:
        """
        Valida a configuração do nó LLM
        """
        errors = []

        # Validações obrigatórias
        if not config.get("provider"):
            errors.append("Provider é obrigatório")

        if not config.get("model"):
            errors.append("Model é obrigatório")

        if not config.get("prompt") and not config.get("messages"):
            errors.append("Prompt ou messages são obrigatórios")

        # Validações específicas por provider
        provider = config.get("provider")
        if provider == LLMProvider.OPENAI:
            if not config.get("api_key") and not config.get("use_user_api_key"):
                errors.append("API key é obrigatória para OpenAI")

        elif provider == LLMProvider.ANTHROPIC:
            if not config.get("api_key") and not config.get("use_user_api_key"):
                errors.append("API key é obrigatória para Anthropic")

        # Validações de parâmetros
        max_tokens = config.get("max_tokens", 0)
        if max_tokens and (max_tokens < 1 or max_tokens > 100000):
            errors.append("max_tokens deve estar entre 1 e 100000")

        temperature = config.get("temperature", 0.7)
        if temperature < 0 or temperature > 2:
            errors.append("temperature deve estar entre 0 e 2")

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
        }

    def get_supported_node_types(self) -> list[str]:
        """
        Tipos de nós suportados pelo LLM executor
        """
        return ["llm", "openai", "gpt", "claude", "chat", "completion"]

    def _parse_node_config(self, node: Node) -> dict[str, Any]:
        """
        Parse da configuração do nó
        """
        if isinstance(node.config, dict):
            return node.config
        elif isinstance(node.config, str):
            try:
                return json.loads(node.config)
            except json.JSONDecodeError:
                return {}
        else:
            return {}

    async def _prepare_prompt(
        self,
        config: dict[str, Any],
        context: ExecutionContext,
        inputs: dict[str, Any],
    ) -> str | list[dict[str, Any]]:
        """
        Prepara o prompt resolvendo variáveis e templates
        """
        # Se tem messages (formato chat)
        if "messages" in config:
            messages = []
            for message in config["messages"]:
                resolved_message = {
                    "role": message.get("role", "user"),
                    "content": self.resolve_template_variables(
                        message.get("content", ""),
                        context,
                        inputs,
                    ),
                }
                messages.append(resolved_message)
            return messages

        # Se tem prompt simples
        elif "prompt" in config:
            return self.resolve_template_variables(
                config["prompt"],
                context,
                inputs,
            )

        else:
            raise ValueError("Nem prompt nem messages foram fornecidos")

    async def _execute_llm_call(
        self,
        config: dict[str, Any],
        prompt: str | list[dict[str, Any]],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        """
        Executa a chamada para o LLM
        """
        provider = config["provider"]

        if provider == LLMProvider.OPENAI:
            return await self._execute_openai(config, prompt, context)
        elif provider == LLMProvider.ANTHROPIC:
            return await self._execute_anthropic(config, prompt, context)
        elif provider == LLMProvider.LOCAL:
            return await self._execute_local(config, prompt, context)
        else:
            raise ValueError(f"Provider {provider} não suportado")

    async def _execute_openai(
        self,
        config: dict[str, Any],
        prompt: str | list[dict[str, Any]],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        """
        Executa chamada para OpenAI
        """
        # Obtém API key
        api_key = self._get_api_key(config, context, "openai_api_key")
        if not api_key:
            raise ValueError("API key da OpenAI não encontrada")

        # Inicializa cliente se necessário
        if not self.openai_client or self.openai_client.api_key != api_key:
            self.openai_client = AsyncOpenAI(api_key=api_key)

        # Prepara parâmetros
        params = {
            "model": config["model"],
            "max_tokens": config.get("max_tokens", 1000),
            "temperature": config.get("temperature", 0.7),
            "top_p": config.get("top_p", 1.0),
            "frequency_penalty": config.get("frequency_penalty", 0.0),
            "presence_penalty": config.get("presence_penalty", 0.0),
            "stream": config.get("stream", False),
        }

        # Adiciona stop sequences se fornecidas
        if config.get("stop"):
            params["stop"] = config["stop"]

        start_time = time.time()

        try:
            # Determina se é chat ou completion
            if isinstance(prompt, list):
                # Chat completion
                params["messages"] = prompt
                response = await self.openai_client.chat.completions.create(**params)

                # Extrai resposta
                content = response.choices[0].message.content
                finish_reason = response.choices[0].finish_reason

                # Contabiliza tokens
                token_usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                }

            else:
                # Text completion (modelos mais antigos)
                params["prompt"] = prompt
                response = await self.openai_client.completions.create(**params)

                content = response.choices[0].text
                finish_reason = response.choices[0].finish_reason

                token_usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                }

            execution_time = time.time() - start_time

            # Atualiza estatísticas de uso
            self._update_token_usage(context.user_id, config["model"], token_usage)

            # Calcula custo estimado
            estimated_cost = self._calculate_cost(config["model"], token_usage)

            return {
                "success": True,
                "output": {
                    "content": content,
                    "finish_reason": finish_reason,
                    "token_usage": token_usage,
                    "estimated_cost": estimated_cost,
                    "model": config["model"],
                    "provider": LLMProvider.OPENAI,
                },
                "execution_time_ms": int(execution_time * 1000),
                "metadata": {
                    "model": config["model"],
                    "provider": LLMProvider.OPENAI,
                    "token_usage": token_usage,
                    "estimated_cost": estimated_cost,
                },
            }

        except openai.RateLimitError as e:
            # Trata rate limit
            await self._handle_rate_limit(context.user_id, config["model"])
            raise Exception(f"Rate limit atingido: {str(e)}")

        except openai.APIError as e:
            raise Exception(f"Erro da API OpenAI: {str(e)}")

    async def _execute_anthropic(
        self,
        config: dict[str, Any],
        prompt: str | list[dict[str, Any]],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        """
        Executa chamada para Anthropic Claude
        """
        # Obtém API key
        api_key = self._get_api_key(config, context, "anthropic_api_key")
        if not api_key:
            raise ValueError("API key da Anthropic não encontrada")

        # Prepara headers
        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
        }

        # Prepara payload
        payload = {
            "model": config["model"],
            "max_tokens": config.get("max_tokens", 1000),
            "temperature": config.get("temperature", 0.7),
        }

        # Converte prompt para formato Anthropic
        if isinstance(prompt, list):
            # Converte mensagens do formato OpenAI para Anthropic
            anthropic_messages = []
            system_message = ""

            for msg in prompt:
                if msg["role"] == "system":
                    system_message = msg["content"]
                else:
                    anthropic_messages.append(
                        {
                            "role": msg["role"],
                            "content": msg["content"],
                        }
                    )

            payload["messages"] = anthropic_messages
            if system_message:
                payload["system"] = system_message
        else:
            # Prompt simples
            payload["messages"] = [{"role": "user", "content": prompt}]

        start_time = time.time()

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=headers,
                    json=payload,
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(
                            f"Erro Anthropic {response.status}: {error_text}"
                        )

                    result = await response.json()

            execution_time = time.time() - start_time

            # Extrai resposta
            content = result["content"][0]["text"]

            # Token usage (Anthropic retorna de forma diferente)
            token_usage = {
                "prompt_tokens": result["usage"]["input_tokens"],
                "completion_tokens": result["usage"]["output_tokens"],
                "total_tokens": result["usage"]["input_tokens"]
                + result["usage"]["output_tokens"],
            }

            # Atualiza estatísticas
            self._update_token_usage(context.user_id, config["model"], token_usage)

            # Calcula custo
            estimated_cost = self._calculate_cost(config["model"], token_usage)

            return {
                "success": True,
                "output": {
                    "content": content,
                    "finish_reason": result.get("stop_reason", "stop"),
                    "token_usage": token_usage,
                    "estimated_cost": estimated_cost,
                    "model": config["model"],
                    "provider": LLMProvider.ANTHROPIC,
                },
                "execution_time_ms": int(execution_time * 1000),
                "metadata": {
                    "model": config["model"],
                    "provider": LLMProvider.ANTHROPIC,
                    "token_usage": token_usage,
                    "estimated_cost": estimated_cost,
                },
            }

        except aiohttp.ClientError as e:
            raise Exception(f"Erro de conexão com Anthropic: {str(e)}")

    async def _execute_local(
        self,
        config: dict[str, Any],
        prompt: str | list[dict[str, Any]],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        """
        Executa chamada para modelo local (Ollama, etc.)
        """
        base_url = config.get("base_url", "http://localhost:11434")
        model = config["model"]

        # Prepara payload para Ollama
        payload = {
            "model": model,
            "stream": False,
            "options": {
                "temperature": config.get("temperature", 0.7),
                "top_p": config.get("top_p", 1.0),
                "num_predict": config.get("max_tokens", 1000),
            },
        }

        # Converte prompt
        if isinstance(prompt, list):
            # Formato chat
            payload["messages"] = prompt
            endpoint = f"{base_url}/api/chat"
        else:
            # Prompt simples
            payload["prompt"] = prompt
            endpoint = f"{base_url}/api/generate"

        start_time = time.time()

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(endpoint, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(
                            f"Erro modelo local {response.status}: {error_text}"
                        )

                    result = await response.json()

            execution_time = time.time() - start_time

            # Extrai resposta baseado no endpoint
            if "messages" in payload:
                content = result["message"]["content"]
            else:
                content = result["response"]

            return {
                "success": True,
                "output": {
                    "content": content,
                    "finish_reason": "stop",
                    "model": model,
                    "provider": LLMProvider.LOCAL,
                },
                "execution_time_ms": int(execution_time * 1000),
                "metadata": {
                    "model": model,
                    "provider": LLMProvider.LOCAL,
                    "base_url": base_url,
                },
            }

        except aiohttp.ClientError as e:
            raise Exception(f"Erro de conexão com modelo local: {str(e)}")

    def _get_api_key(
        self,
        config: dict[str, Any],
        context: ExecutionContext,
        variable_name: str,
    ) -> str | None:
        """
        Obtém API key da configuração ou variáveis do usuário
        """
        # Primeiro tenta da configuração
        if config.get("api_key"):
            return config["api_key"]

        # Depois tenta das variáveis do usuário
        if config.get("use_user_api_key", True):
            return context.get_variable(variable_name)

        return None

    def _update_token_usage(
        self,
        user_id: int,
        model: str,
        token_usage: dict[str, int],
    ):
        """
        Atualiza estatísticas de uso de tokens
        """
        if user_id not in self.token_usage:
            self.token_usage[user_id] = {}

        if model not in self.token_usage[user_id]:
            self.token_usage[user_id][model] = {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "requests": 0,
            }

        stats = self.token_usage[user_id][model]
        stats["prompt_tokens"] += token_usage.get("prompt_tokens", 0)
        stats["completion_tokens"] += token_usage.get("completion_tokens", 0)
        stats["total_tokens"] += token_usage.get("total_tokens", 0)
        stats["requests"] += 1

    def _calculate_cost(
        self,
        model: str,
        token_usage: dict[str, int],
    ) -> float:
        """
        Calcula custo estimado baseado no modelo e uso de tokens
        """
        # Tabela de preços (valores aproximados em USD por 1K tokens)
        pricing = {
            # OpenAI
            "gpt-4": {"prompt": 0.03, "completion": 0.06},
            "gpt-4-turbo": {"prompt": 0.01, "completion": 0.03},
            "gpt-3.5-turbo": {"prompt": 0.001, "completion": 0.002},
            "gpt-3.5-turbo-16k": {"prompt": 0.003, "completion": 0.004},
            # Anthropic
            "claude-3-opus": {"prompt": 0.015, "completion": 0.075},
            "claude-3-sonnet": {"prompt": 0.003, "completion": 0.015},
            "claude-3-haiku": {"prompt": 0.00025, "completion": 0.00125},
            # Default para modelos não listados
            "default": {"prompt": 0.001, "completion": 0.002},
        }

        model_pricing = pricing.get(model, pricing["default"])

        prompt_cost = (token_usage.get("prompt_tokens", 0) / 1000) * model_pricing[
            "prompt"
        ]
        completion_cost = (
            token_usage.get("completion_tokens", 0) / 1000
        ) * model_pricing["completion"]

        return round(prompt_cost + completion_cost, 6)

    async def _handle_rate_limit(self, user_id: int, model: str):
        """
        Trata rate limits
        """
        if user_id not in self.rate_limits:
            self.rate_limits[user_id] = {}

        self.rate_limits[user_id][model] = {
            "last_rate_limit": datetime.utcnow(),
            "count": self.rate_limits[user_id].get(model, {}).get("count", 0) + 1,
        }

        # Log do rate limit
        self.logger.warning(f"Rate limit para usuário {user_id} no modelo {model}")

    def get_token_usage_stats(self, user_id: int) -> dict[str, Any]:
        """
        Retorna estatísticas de uso de tokens para um usuário
        """
        return self.token_usage.get(user_id, {})
