"""
Middleware de Rate Limiting para APIs
"""

import functools
from collections.abc import Callable


def rate_limit(max_requests: int = 100, window_seconds: int = 60):
    """
    Decorator básico para rate limiting.
    Por enquanto apenas um placeholder que não faz nada.

    Args:
        max_requests: Número máximo de requisições por janela
        window_seconds: Tamanho da janela em segundos
    """

    def decorator(func: Callable) -> Callable:

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)

        return wrapper

    return decorator
