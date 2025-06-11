"""
HTTP Executor para execução de nós de requisições HTTP/API
Criado por José - um desenvolvedor Full Stack
Executor especializado para integração com APIs externas
"""

import asyncio
import json
import time
from typing import Dict, Any, List, Optional
from datetime import datetime
import aiohttp
import base64
import hashlib

from synapse.core.executors.base import BaseExecutor, ExecutorType, ExecutionContext
from synapse.models.workflow_execution import NodeExecution
from synapse.models.node import Node


class HTTPMethod:
    """Métodos HTTP suportados"""

    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"


class AuthType:
    """Tipos de autenticação suportados"""

    NONE = "none"
    BASIC = "basic"
    BEARER = "bearer"
    API_KEY = "api_key"
    OAUTH2 = "oauth2"
    CUSTOM = "custom"


class HTTPExecutor(BaseExecutor):
    """
    Executor especializado para nós de requisições HTTP/API
    Suporta todos os métodos HTTP e tipos de autenticação
    """

    def __init__(self):
        super().__init__(ExecutorType.HTTP)
        self.cache: dict[str, dict[str, Any]] = {}
        self.session_pool: dict[str, aiohttp.ClientSession] = {}

    async def execute(
        self,
        node: Node,
        context: ExecutionContext,
        node_execution: NodeExecution,
    ) -> dict[str, Any]:
        """
        Executa um nó HTTP
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

            # Verifica se pode usar cache
            cache_key = None
            if config.get("use_cache", False):
                cache_key = self._generate_cache_key(config, context, inputs)
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    self.logger.info(
                        f"Usando resultado em cache para nó {node.node_id}"
                    )
                    return cached_result

            # Prepara a requisição
            request_data = await self._prepare_request(config, context, inputs)

            # Executa a requisição HTTP
            result = await self._execute_http_request(request_data, config)

            # Processa a resposta
            result = await self._process_response(result, config, context)

            # Armazena em cache se necessário
            if (
                config.get("use_cache", False)
                and result.get("success", False)
                and cache_key
            ):
                self._store_in_cache(cache_key, result, config.get("cache_ttl", 300))

            await self.post_execute(node, context, node_execution, result)
            return result

        except Exception as e:
            return await self.handle_error(node, context, node_execution, e)

    def validate_config(self, config: dict[str, Any]) -> dict[str, Any]:
        """
        Valida a configuração do nó HTTP
        """
        errors = []

        # Validações obrigatórias
        if not config.get("url"):
            errors.append("URL é obrigatória")

        if config.get("method") not in [
            HTTPMethod.GET,
            HTTPMethod.POST,
            HTTPMethod.PUT,
            HTTPMethod.PATCH,
            HTTPMethod.DELETE,
            HTTPMethod.HEAD,
            HTTPMethod.OPTIONS,
        ]:
            errors.append(f"Método HTTP inválido: {config.get('method')}")

        # Validações específicas por método
        method = config.get("method", HTTPMethod.GET)
        if method in [HTTPMethod.POST, HTTPMethod.PUT, HTTPMethod.PATCH]:
            if not config.get("body") and not config.get("dynamic_body"):
                self.logger.warning(f"Método {method} sem body definido")

        # Validações de autenticação
        auth_type = config.get("auth_type", AuthType.NONE)
        if auth_type == AuthType.BASIC:
            if not config.get("username") and not config.get("use_user_variable"):
                errors.append("Username é obrigatório para autenticação Basic")
            if not config.get("password") and not config.get("use_user_variable"):
                errors.append("Password é obrigatório para autenticação Basic")

        elif auth_type == AuthType.BEARER:
            if not config.get("token") and not config.get("use_user_variable"):
                errors.append("Token é obrigatório para autenticação Bearer")

        elif auth_type == AuthType.API_KEY:
            if not config.get("api_key") and not config.get("use_user_variable"):
                errors.append("API Key é obrigatória para autenticação API Key")
            if not config.get("api_key_name"):
                errors.append("Nome da API Key é obrigatório")

        # Validações de timeout
        timeout = config.get("timeout", 30)
        if timeout < 1 or timeout > 300:
            errors.append("Timeout deve estar entre 1 e 300 segundos")

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
        }

    def get_supported_node_types(self) -> list[str]:
        """
        Tipos de nós suportados pelo HTTP executor
        """
        return ["http", "api", "rest", "webhook", "request"]

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

    async def _prepare_request(
        self,
        config: dict[str, Any],
        context: ExecutionContext,
        inputs: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Prepara os dados da requisição HTTP
        """
        # URL base
        url = self.resolve_template_variables(config["url"], context, inputs)

        # Método HTTP
        method = config.get("method", HTTPMethod.GET)

        # Headers
        headers = {}
        if config.get("headers"):
            for key, value in config["headers"].items():
                headers[key] = self.resolve_template_variables(value, context, inputs)

        # Query params
        params = {}
        if config.get("params"):
            for key, value in config["params"].items():
                params[key] = self.resolve_template_variables(value, context, inputs)

        # Body
        body = None
        if method in [HTTPMethod.POST, HTTPMethod.PUT, HTTPMethod.PATCH]:
            if config.get("dynamic_body"):
                # Body dinâmico baseado em inputs ou variáveis
                body_template = config["dynamic_body"]
                body_str = self.resolve_template_variables(
                    body_template, context, inputs
                )
                try:
                    body = json.loads(body_str)
                except json.JSONDecodeError:
                    body = body_str
            elif config.get("body"):
                # Body estático da configuração
                body = config["body"]

                # Se for string, tenta converter para JSON
                if isinstance(body, str):
                    try:
                        body = json.loads(body)
                    except json.JSONDecodeError:
                        pass

        # Autenticação
        auth_type = config.get("auth_type", AuthType.NONE)
        if auth_type != AuthType.NONE:
            await self._add_authentication(headers, config, context)

        return {
            "url": url,
            "method": method,
            "headers": headers,
            "params": params,
            "body": body,
            "timeout": config.get("timeout", 30),
        }

    async def _add_authentication(
        self,
        headers: dict[str, str],
        config: dict[str, Any],
        context: ExecutionContext,
    ):
        """
        Adiciona autenticação aos headers
        """
        auth_type = config.get("auth_type", AuthType.NONE)

        if auth_type == AuthType.BASIC:
            # Autenticação Basic
            username = config.get("username")
            password = config.get("password")

            # Se usar variáveis do usuário
            if config.get("use_user_variable", False):
                username = username or context.get_variable(
                    config.get("username_variable", "http_username")
                )
                password = password or context.get_variable(
                    config.get("password_variable", "http_password")
                )

            if username and password:
                auth_str = f"{username}:{password}"
                auth_bytes = auth_str.encode("utf-8")
                auth_b64 = base64.b64encode(auth_bytes).decode("utf-8")
                headers["Authorization"] = f"Basic {auth_b64}"

        elif auth_type == AuthType.BEARER:
            # Autenticação Bearer
            token = config.get("token")

            # Se usar variáveis do usuário
            if config.get("use_user_variable", False):
                token = token or context.get_variable(
                    config.get("token_variable", "http_token")
                )

            if token:
                headers["Authorization"] = f"Bearer {token}"

        elif auth_type == AuthType.API_KEY:
            # Autenticação API Key
            api_key = config.get("api_key")
            api_key_name = config.get("api_key_name", "x-api-key")
            api_key_location = config.get("api_key_location", "header")

            # Se usar variáveis do usuário
            if config.get("use_user_variable", False):
                api_key = api_key or context.get_variable(
                    config.get("api_key_variable", "http_api_key")
                )

            if api_key:
                if api_key_location == "header":
                    headers[api_key_name] = api_key
                # Outros locais seriam tratados na URL ou params

    async def _execute_http_request(
        self,
        request_data: dict[str, Any],
        config: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Executa a requisição HTTP
        """
        url = request_data["url"]
        method = request_data["method"]
        headers = request_data["headers"]
        params = request_data["params"]
        body = request_data["body"]
        timeout = request_data["timeout"]

        start_time = time.time()

        try:
            # Obtém ou cria uma sessão
            session = await self._get_session()

            # Prepara o timeout
            timeout_obj = aiohttp.ClientTimeout(total=timeout)

            # Executa a requisição
            async with session.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                json=body if isinstance(body, (dict, list)) else None,
                data=body if isinstance(body, str) else None,
                timeout=timeout_obj,
                allow_redirects=config.get("follow_redirects", True),
            ) as response:
                # Lê o corpo da resposta
                try:
                    response_body = await response.json()
                    content_type = "application/json"
                except:
                    response_body = await response.text()
                    content_type = response.headers.get("Content-Type", "text/plain")

                # Extrai headers da resposta
                response_headers = dict(response.headers)

                execution_time = time.time() - start_time

                return {
                    "success": 200 <= response.status < 300,
                    "output": {
                        "status": response.status,
                        "body": response_body,
                        "headers": response_headers,
                        "content_type": content_type,
                        "url": str(response.url),
                    },
                    "execution_time_ms": int(execution_time * 1000),
                    "metadata": {
                        "method": method,
                        "url": url,
                        "status": response.status,
                        "content_type": content_type,
                        "request_headers": headers,
                        "response_headers": response_headers,
                    },
                }

        except TimeoutError:
            execution_time = time.time() - start_time
            return {
                "success": False,
                "error": f"Timeout após {timeout} segundos",
                "execution_time_ms": int(execution_time * 1000),
                "metadata": {
                    "method": method,
                    "url": url,
                    "error_type": "timeout",
                },
            }

        except aiohttp.ClientError as e:
            execution_time = time.time() - start_time
            return {
                "success": False,
                "error": f"Erro de conexão: {str(e)}",
                "execution_time_ms": int(execution_time * 1000),
                "metadata": {
                    "method": method,
                    "url": url,
                    "error_type": "connection_error",
                },
            }

    async def _process_response(
        self,
        result: dict[str, Any],
        config: dict[str, Any],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        """
        Processa a resposta HTTP
        """
        # Se a requisição falhou, retorna o erro
        if not result.get("success", False):
            return result

        output = result["output"]

        # Transformações na resposta
        if config.get("response_path") and isinstance(output["body"], dict):
            # Extrai um caminho específico da resposta
            path = config["response_path"]
            try:
                parts = path.split(".")
                value = output["body"]
                for part in parts:
                    if part.isdigit() and isinstance(value, list):
                        value = value[int(part)]
                    elif isinstance(value, dict):
                        value = value.get(part)
                    else:
                        value = None
                        break

                # Atualiza o body com o valor extraído
                output["extracted_value"] = value

            except Exception as e:
                self.logger.warning(f"Erro ao extrair caminho {path}: {str(e)}")

        # Validações da resposta
        if config.get("validate_status"):
            expected_status = config["validate_status"]
            if output["status"] != expected_status:
                return {
                    "success": False,
                    "error": f"Status esperado {expected_status}, recebido {output['status']}",
                    "output": output,
                    "execution_time_ms": result["execution_time_ms"],
                }

        return result

    async def _get_session(self) -> aiohttp.ClientSession:
        """
        Obtém ou cria uma sessão HTTP
        """
        # Usa uma sessão por thread para evitar problemas
        thread_id = asyncio.current_task().get_name()

        if thread_id not in self.session_pool:
            self.session_pool[thread_id] = aiohttp.ClientSession()

        return self.session_pool[thread_id]

    def _generate_cache_key(
        self,
        config: dict[str, Any],
        context: ExecutionContext,
        inputs: dict[str, Any],
    ) -> str:
        """
        Gera uma chave de cache para a requisição
        """
        # Componentes para a chave de cache
        key_components = [
            config.get("url", ""),
            config.get("method", HTTPMethod.GET),
            json.dumps(config.get("params", {})),
            json.dumps(config.get("headers", {})),
            json.dumps(config.get("body", {})),
            json.dumps(inputs),
        ]

        # Gera um hash da chave
        key_str = "|".join(key_components)
        return hashlib.md5(key_str.encode("utf-8")).hexdigest()

    def _get_from_cache(self, cache_key: str) -> dict[str, Any] | None:
        """
        Obtém um resultado do cache
        """
        if cache_key not in self.cache:
            return None

        cache_entry = self.cache[cache_key]

        # Verifica se o cache expirou
        if cache_entry["expires_at"] < datetime.utcnow().timestamp():
            del self.cache[cache_key]
            return None

        return cache_entry["result"]

    def _store_in_cache(
        self,
        cache_key: str,
        result: dict[str, Any],
        ttl: int,
    ):
        """
        Armazena um resultado no cache
        """
        expires_at = datetime.utcnow().timestamp() + ttl

        self.cache[cache_key] = {
            "result": result,
            "expires_at": expires_at,
            "created_at": datetime.utcnow().timestamp(),
        }

        # Limpa o cache se estiver muito grande (mais de 1000 entradas)
        if len(self.cache) > 1000:
            # Remove as entradas mais antigas
            sorted_keys = sorted(
                self.cache.keys(),
                key=lambda k: self.cache[k]["created_at"],
            )

            # Remove 20% das entradas mais antigas
            for key in sorted_keys[:200]:
                del self.cache[key]

    async def close(self):
        """
        Fecha todas as sessões HTTP
        """
        for session in self.session_pool.values():
            await session.close()

        self.session_pool.clear()
