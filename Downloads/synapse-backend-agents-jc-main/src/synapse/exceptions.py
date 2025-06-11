"""Exceções personalizadas para o backend SynapScale.

Este módulo contém exceções personalizadas utilizadas em todo o sistema,
permitindo tratamento específico para diferentes tipos de erros.
"""

from fastapi import HTTPException, status


class SynapseBaseException(Exception):
    """Exceção base para todas as exceções personalizadas do SynapScale."""

    def __init__(self, message: str = "Erro interno"):
        """Inicializa a exceção com uma mensagem.

        Args:
            message: Mensagem de erro
        """
        self.message = message
        super().__init__(self.message)


class FileValidationError(SynapseBaseException):
    """Exceção lançada quando um arquivo não passa nas validações."""

    def __init__(self, message: str = "O arquivo não passou nas validações"):
        """Inicializa a exceção com uma mensagem.

        Args:
            message: Mensagem de erro
        """
        super().__init__(message)


class StorageError(SynapseBaseException):
    """Exceção lançada quando ocorre um erro no armazenamento."""

    def __init__(self, message: str = "Erro ao armazenar ou recuperar arquivo"):
        """Inicializa a exceção com uma mensagem.

        Args:
            message: Mensagem de erro
        """
        super().__init__(message)


class DatabaseError(SynapseBaseException):
    """Exceção lançada quando ocorre um erro no banco de dados."""

    def __init__(self, message: str = "Erro no banco de dados"):
        """Inicializa a exceção com uma mensagem.

        Args:
            message: Mensagem de erro
        """
        super().__init__(message)


class AuthenticationError(SynapseBaseException):
    """Exceção lançada quando ocorre um erro de autenticação."""

    def __init__(self, message: str = "Erro de autenticação"):
        """Inicializa a exceção com uma mensagem.

        Args:
            message: Mensagem de erro
        """
        super().__init__(message)


class AuthorizationError(SynapseBaseException):
    """Exceção lançada quando ocorre um erro de autorização."""

    def __init__(self, message: str = "Permissão negada"):
        """Inicializa a exceção com uma mensagem.

        Args:
            message: Mensagem de erro
        """
        super().__init__(message)


class RateLimitError(SynapseBaseException):
    """Exceção lançada quando o limite de taxa é excedido."""

    def __init__(self, message: str = "Limite de requisições excedido"):
        """Inicializa a exceção com uma mensagem.

        Args:
            message: Mensagem de erro
        """
        super().__init__(message)


class NotFoundError(SynapseBaseException):
    """Exceção lançada quando um recurso não é encontrado."""

    def __init__(self, message: str = "Recurso não encontrado"):
        """Inicializa a exceção com uma mensagem.

        Args:
            message: Mensagem de erro
        """
        super().__init__(message)


class ValidationError(SynapseBaseException):
    """Exceção lançada quando ocorre um erro de validação."""

    def __init__(self, message: str = "Erro de validação"):
        """Inicializa a exceção com uma mensagem.

        Args:
            message: Mensagem de erro
        """
        super().__init__(message)


def file_validation_exception(message: str) -> HTTPException:
    """Cria uma HTTPException para erro de validação de arquivo.

    Args:
        message: Mensagem de erro

    Returns:
        HTTPException configurada
    """
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


def storage_exception(message: str) -> HTTPException:
    """Cria uma HTTPException para erro de armazenamento.

    Args:
        message: Mensagem de erro

    Returns:
        HTTPException configurada
    """
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=message
    )


def authentication_exception(message: str) -> HTTPException:
    """Cria uma HTTPException para erro de autenticação.

    Args:
        message: Mensagem de erro

    Returns:
        HTTPException configurada
    """
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )


def authorization_exception(message: str) -> HTTPException:
    """Cria uma HTTPException para erro de autorização.

    Args:
        message: Mensagem de erro

    Returns:
        HTTPException configurada
    """
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=message)


def rate_limit_exception(message: str, reset_time: int) -> HTTPException:
    """Cria uma HTTPException para erro de limite de taxa.

    Args:
        message: Mensagem de erro
        reset_time: Tempo em segundos para reset do limite

    Returns:
        HTTPException configurada
    """
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=message,
        headers={"Retry-After": str(reset_time)},
    )


def not_found_exception(message: str) -> HTTPException:
    """Cria uma HTTPException para recurso não encontrado.

    Args:
        message: Mensagem de erro

    Returns:
        HTTPException configurada
    """
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)


def validation_exception(message: str) -> HTTPException:
    """Cria uma HTTPException para erro de validação.

    Args:
        message: Mensagem de erro

    Returns:
        HTTPException configurada
    """
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message
    )


# Aliases para compatibilidade
NotFoundException = NotFoundError
ForbiddenException = AuthorizationError
BadRequestException = ValidationError
