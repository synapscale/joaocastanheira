"""
Base Executor para execução de nós de workflows
Criado por José - um desenvolvedor Full Stack
Classe abstrata base para todos os executores específicos
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
import asyncio
import json
import traceback
from enum import Enum

from synapse.models.workflow_execution import NodeExecution
from synapse.models.node import Node


logger = logging.getLogger(__name__)


class ExecutorType(str, Enum):
    """Tipos de executores disponíveis"""

    LLM = "llm"
    HTTP = "http"
    TRANSFORM = "transform"
    CONDITIONAL = "conditional"
    LOOP = "loop"
    DELAY = "delay"
    WEBHOOK = "webhook"
    DATABASE = "database"
    FILE = "file"
    EMAIL = "email"


class ExecutionContext:
    """
    Contexto compartilhado durante a execução de um workflow
    Contém dados, variáveis e estado da execução
    """

    def __init__(
        self,
        execution_id: str,
        workflow_id: int,
        user_id: int,
        variables: dict[str, Any] = None,
        input_data: dict[str, Any] = None,
        context_data: dict[str, Any] = None,
    ):
        self.execution_id = execution_id
        self.workflow_id = workflow_id
        self.user_id = user_id
        self.variables = variables or {}
        self.input_data = input_data or {}
        self.context_data = context_data or {}
        self.node_outputs: dict[str, Any] = {}
        self.execution_start_time = datetime.utcnow()
        self.current_node_id: str | None = None
        self.error_count = 0
        self.warning_count = 0
        self.debug_info: list[dict[str, Any]] = []

    def set_node_output(self, node_id: str, output: Any):
        """Define o output de um nó"""
        self.node_outputs[node_id] = output

    def get_node_output(self, node_id: str) -> Any:
        """Obtém o output de um nó"""
        return self.node_outputs.get(node_id)

    def get_variable(self, name: str, default: Any = None) -> Any:
        """Obtém uma variável do contexto"""
        return self.variables.get(name, default)

    def set_variable(self, name: str, value: Any):
        """Define uma variável no contexto"""
        self.variables[name] = value

    def add_debug_info(self, info: dict[str, Any]):
        """Adiciona informação de debug"""
        info["timestamp"] = datetime.utcnow().isoformat()
        info["node_id"] = self.current_node_id
        self.debug_info.append(info)

    def to_dict(self) -> dict[str, Any]:
        """Converte o contexto para dicionário"""
        return {
            "execution_id": self.execution_id,
            "workflow_id": self.workflow_id,
            "user_id": self.user_id,
            "variables": self.variables,
            "input_data": self.input_data,
            "context_data": self.context_data,
            "node_outputs": self.node_outputs,
            "execution_start_time": self.execution_start_time.isoformat(),
            "current_node_id": self.current_node_id,
            "error_count": self.error_count,
            "warning_count": self.warning_count,
            "debug_info": self.debug_info,
        }


class BaseExecutor(ABC):
    """
    Classe base abstrata para todos os executores de nós
    Define a interface comum e funcionalidades básicas
    """

    def __init__(self, executor_type: ExecutorType):
        self.executor_type = executor_type
        self.logger = logging.getLogger(f"executor.{executor_type.value}")

    @abstractmethod
    async def execute(
        self,
        node: Node,
        context: ExecutionContext,
        node_execution: NodeExecution,
    ) -> dict[str, Any]:
        """
        Executa um nó específico

        Args:
            node: Nó a ser executado
            context: Contexto da execução
            node_execution: Registro de execução do nó

        Returns:
            Dict com o resultado da execução
        """

    @abstractmethod
    def validate_config(self, config: dict[str, Any]) -> dict[str, Any]:
        """
        Valida a configuração do nó

        Args:
            config: Configuração do nó

        Returns:
            Dict com resultado da validação: {"is_valid": bool, "errors": List[str]}
        """

    def get_supported_node_types(self) -> list[str]:
        """
        Retorna os tipos de nós suportados por este executor
        """
        return [self.executor_type.value]

    async def pre_execute(
        self,
        node: Node,
        context: ExecutionContext,
        node_execution: NodeExecution,
    ):
        """
        Hook executado antes da execução do nó
        Pode ser sobrescrito por executores específicos
        """
        context.current_node_id = node.node_id
        context.add_debug_info(
            {
                "event": "pre_execute",
                "node_type": node.node_type,
                "node_id": node.node_id,
                "executor_type": self.executor_type.value,
            }
        )

        self.logger.info(f"Iniciando execução do nó {node.node_id} ({node.node_type})")

    async def post_execute(
        self,
        node: Node,
        context: ExecutionContext,
        node_execution: NodeExecution,
        result: dict[str, Any],
    ):
        """
        Hook executado após a execução do nó
        Pode ser sobrescrito por executores específicos
        """
        # Armazena o output do nó no contexto
        if "output" in result:
            context.set_node_output(node.node_id, result["output"])

        context.add_debug_info(
            {
                "event": "post_execute",
                "node_type": node.node_type,
                "node_id": node.node_id,
                "executor_type": self.executor_type.value,
                "success": result.get("success", False),
                "execution_time_ms": result.get("execution_time_ms", 0),
            }
        )

        self.logger.info(
            f"Execução do nó {node.node_id} concluída. "
            f"Sucesso: {result.get('success', False)}, "
            f"Tempo: {result.get('execution_time_ms', 0)}ms",
        )

    async def handle_error(
        self,
        node: Node,
        context: ExecutionContext,
        node_execution: NodeExecution,
        error: Exception,
    ) -> dict[str, Any]:
        """
        Trata erros durante a execução
        """
        error_message = str(error)
        error_traceback = traceback.format_exc()

        context.error_count += 1
        context.add_debug_info(
            {
                "event": "error",
                "node_type": node.node_type,
                "node_id": node.node_id,
                "executor_type": self.executor_type.value,
                "error_message": error_message,
                "error_type": type(error).__name__,
            }
        )

        self.logger.error(
            f"Erro na execução do nó {node.node_id}: {error_message}\n{error_traceback}",
        )

        return {
            "success": False,
            "error": error_message,
            "error_type": type(error).__name__,
            "error_traceback": error_traceback,
            "execution_time_ms": 0,
            "output": None,
        }

    def resolve_template_variables(
        self,
        template: str,
        context: ExecutionContext,
        additional_vars: dict[str, Any] = None,
    ) -> str:
        """
        Resolve variáveis em templates usando sintaxe {{variable}}
        """
        if not template or not isinstance(template, str):
            return template

        # Combina todas as variáveis disponíveis
        all_vars = {
            **context.variables,
            **context.input_data,
            **context.context_data,
            **context.node_outputs,
            **(additional_vars or {}),
        }

        # Adiciona variáveis especiais
        all_vars.update(
            {
                "execution_id": context.execution_id,
                "workflow_id": context.workflow_id,
                "user_id": context.user_id,
                "current_timestamp": datetime.utcnow().isoformat(),
                "current_node_id": context.current_node_id,
            }
        )

        # Resolve as variáveis
        result = template
        for key, value in all_vars.items():
            placeholder = f"{{{{{key}}}}}"
            if placeholder in result:
                # Converte valor para string se necessário
                str_value = (
                    json.dumps(value) if isinstance(value, (dict, list)) else str(value)
                )
                result = result.replace(placeholder, str_value)

        return result

    def extract_inputs_from_connections(
        self,
        node: Node,
        context: ExecutionContext,
    ) -> dict[str, Any]:
        """
        Extrai inputs de nós conectados baseado nas conexões
        """
        inputs = {}

        # Se o nó tem configuração de inputs
        if hasattr(node, "config") and node.config:
            config = (
                node.config
                if isinstance(node.config, dict)
                else json.loads(node.config)
            )

            # Processa inputs definidos
            if "inputs" in config:
                for input_name, input_config in config["inputs"].items():
                    if isinstance(input_config, dict) and "source_node" in input_config:
                        source_node_id = input_config["source_node"]
                        source_output_key = input_config.get("source_output", "output")

                        # Obtém output do nó fonte
                        source_output = context.get_node_output(source_node_id)
                        if source_output is not None:
                            if (
                                isinstance(source_output, dict)
                                and source_output_key in source_output
                            ):
                                inputs[input_name] = source_output[source_output_key]
                            else:
                                inputs[input_name] = source_output

        return inputs

    async def execute_with_retry(
        self,
        node: Node,
        context: ExecutionContext,
        node_execution: NodeExecution,
        max_retries: int = 3,
        retry_delay: float = 1.0,
    ) -> dict[str, Any]:
        """
        Executa o nó com retry automático em caso de falha
        """
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                if attempt > 0:
                    self.logger.info(
                        f"Tentativa {attempt + 1}/{max_retries + 1} para nó {node.node_id}"
                    )
                    await asyncio.sleep(retry_delay * attempt)  # Backoff exponencial

                # Executa o nó
                start_time = datetime.utcnow()
                result = await self.execute(node, context, node_execution)
                end_time = datetime.utcnow()

                # Adiciona tempo de execução
                execution_time_ms = int((end_time - start_time).total_seconds() * 1000)
                result["execution_time_ms"] = execution_time_ms
                result["attempt"] = attempt + 1

                # Se sucesso, retorna
                if result.get("success", False):
                    return result

                # Se falha mas não é erro de exceção, não tenta novamente
                if "error" not in result:
                    return result

                last_error = Exception(result.get("error", "Execução falhou"))

            except Exception as e:
                last_error = e
                if attempt == max_retries:
                    break

                self.logger.warning(
                    f"Erro na tentativa {attempt + 1} para nó {node.node_id}: {str(e)}"
                )

        # Se chegou aqui, todas as tentativas falharam
        return await self.handle_error(node, context, node_execution, last_error)


class ExecutorRegistry:
    """
    Registry para gerenciar todos os executores disponíveis
    """

    def __init__(self):
        self._executors: dict[str, BaseExecutor] = {}

    def register(self, executor: BaseExecutor):
        """Registra um executor"""
        for node_type in executor.get_supported_node_types():
            self._executors[node_type] = executor

    def get_executor(self, node_type: str) -> BaseExecutor | None:
        """Obtém um executor para um tipo de nó"""
        return self._executors.get(node_type)

    def get_all_executors(self) -> dict[str, BaseExecutor]:
        """Retorna todos os executores registrados"""
        return self._executors.copy()

    def get_supported_node_types(self) -> list[str]:
        """Retorna todos os tipos de nós suportados"""
        return list(self._executors.keys())


# Registry global de executores
executor_registry = ExecutorRegistry()
