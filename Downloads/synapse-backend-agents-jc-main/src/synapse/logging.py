"""Configuração de logging para o backend SynapScale.

Este módulo configura o sistema de logging centralizado, garantindo
formato consistente e níveis apropriados para diferentes ambientes.
"""

import json
import logging
import sys
from datetime import datetime
from typing import Any, Dict, Optional

from synapse.core.config import settings


class JSONFormatter(logging.Formatter):
    """Formatador de logs em formato JSON estruturado."""

    def format(self, record: logging.LogRecord) -> str:
        """Formata o registro de log como JSON.

        Args:
            record: Registro de log a ser formatado

        Returns:
            String JSON formatada
        """
        log_data: dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Adicionar exceção se existir
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Adicionar dados extras
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id

        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id

        # Adicionar outros atributos extras
        for key, value in record.__dict__.items():
            if key not in {
                "args",
                "asctime",
                "created",
                "exc_info",
                "exc_text",
                "filename",
                "funcName",
                "id",
                "levelname",
                "levelno",
                "lineno",
                "module",
                "msecs",
                "message",
                "msg",
                "name",
                "pathname",
                "process",
                "processName",
                "relativeCreated",
                "stack_info",
                "thread",
                "threadName",
                "request_id",
                "user_id",
            }:
                log_data[key] = value

        return json.dumps(log_data)


def setup_logging() -> None:
    """Configura o sistema de logging.

    Esta função configura handlers, formatadores e níveis de log
    apropriados para o ambiente atual.
    """
    # Configurar nível de log baseado no ambiente
    log_level = getattr(logging, settings.LOG_LEVEL)

    # Configurar logger raiz
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remover handlers existentes
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Criar handler para stdout
    console_handler = logging.StreamHandler(sys.stdout)

    # Definir formatador baseado no ambiente
    if settings.ENVIRONMENT == "production":
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(name)s - %(message)s",
        )

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Configurar loggers específicos
    for logger_name, logger_level in [
        ("uvicorn", log_level),
        ("uvicorn.access", log_level),
        ("sqlalchemy.engine", logging.WARNING),
        ("alembic", logging.INFO),
    ]:
        logger = logging.getLogger(logger_name)
        logger.setLevel(logger_level)

    # Log inicial
    logging.info(
        f"Logging configurado: nível={settings.LOG_LEVEL}, "
        f"ambiente={settings.ENVIRONMENT}",
    )


def get_logger(name: str) -> logging.Logger:
    """Obtém um logger configurado para o módulo especificado.

    Args:
        name: Nome do módulo ou componente

    Returns:
        Logger configurado
    """
    return logging.getLogger(name)


class RequestContextFilter(logging.Filter):
    """Filtro para adicionar contexto de requisição aos logs."""

    def __init__(self, request_id: str | None = None, user_id: str | None = None):
        """Inicializa o filtro com IDs de requisição e usuário.

        Args:
            request_id: ID único da requisição (opcional)
            user_id: ID do usuário (opcional)
        """
        super().__init__()
        self.request_id = request_id
        self.user_id = user_id

    def filter(self, record: logging.LogRecord) -> bool:
        """Adiciona contexto ao registro de log.

        Args:
            record: Registro de log

        Returns:
            True para permitir o registro
        """
        if self.request_id:
            record.request_id = self.request_id

        if self.user_id:
            record.user_id = self.user_id

        return True
