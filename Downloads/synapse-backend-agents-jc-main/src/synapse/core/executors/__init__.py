"""
Módulo de Executores de Nós
Criado por José - um desenvolvedor Full Stack
Sistema completo de executores especializados para diferentes tipos de nós
"""

from .base import (
    BaseExecutor,
    ExecutorType,
    ExecutionContext,
    ExecutorRegistry,
    executor_registry,
)
from .llm_executor import LLMExecutor, LLMProvider
from .http_executor import HTTPExecutor, HTTPMethod, AuthType
from .transform_executor import TransformExecutor, TransformType, DataType


# Inicializa e registra todos os executores
def initialize_executors():
    """
    Inicializa e registra todos os executores disponíveis
    """
    # Registra executores principais
    executor_registry.register(LLMExecutor())
    executor_registry.register(HTTPExecutor())
    executor_registry.register(TransformExecutor())

    return executor_registry


# Auto-inicialização
initialize_executors()

__all__ = [
    # Classes base
    "BaseExecutor",
    "ExecutorType",
    "ExecutionContext",
    "ExecutorRegistry",
    "executor_registry",
    # Executores específicos
    "LLMExecutor",
    "LLMProvider",
    "HTTPExecutor",
    "HTTPMethod",
    "AuthType",
    "TransformExecutor",
    "TransformType",
    "DataType",
    # Funções
    "initialize_executors",
]
