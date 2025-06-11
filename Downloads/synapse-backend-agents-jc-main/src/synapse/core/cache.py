"""
Sistema de Cache Avançado para SynapScale
Implementação robusta com Redis e cache em memória
Usa configurações centralizadas do sistema
"""

import asyncio
import json
import pickle
import hashlib
from typing import Any, Optional, Dict
from datetime import datetime, timedelta
from functools import wraps
import redis.asyncio as redis
from pydantic import BaseModel
import logging

# Importar configurações centralizadas
from synapse.core.config import settings

logger = logging.getLogger(__name__)


class CacheConfig(BaseModel):
    """Configuração do sistema de cache"""

    redis_url: str
    default_ttl: int
    max_memory_cache_size: int
    enable_compression: bool
    key_prefix: str

    @classmethod
    def from_settings(cls) -> "CacheConfig":
        """Cria configuração de cache a partir das configurações centralizadas"""
        cache_config = settings.get_cache_config()
        return cls(**cache_config)


class CacheStats(BaseModel):
    """Estatísticas do cache"""

    hits: int = 0
    misses: int = 0
    sets: int = 0
    deletes: int = 0
    memory_usage: int = 0
    redis_usage: int = 0

    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return (self.hits / total * 100) if total > 0 else 0.0


class CacheManager:
    """Gerenciador de cache avançado com Redis e memória"""

    def __init__(self, config: CacheConfig | None = None):
        self.config = config or CacheConfig.from_settings()
        self.redis_client: redis.Redis | None = None
        self.memory_cache: dict[str, dict] = {}
        self.stats = CacheStats()
        self._lock = asyncio.Lock()

    async def initialize(self):
        """Inicializa conexão com Redis"""
        try:
            redis_config = settings.get_redis_config()
            self.redis_client = redis.from_url(
                redis_config["url"],
                password=redis_config["password"],
                db=redis_config["db"],
                max_connections=redis_config["max_connections"],
                socket_connect_timeout=redis_config["socket_connect_timeout"],
                encoding="utf-8",
                decode_responses=False,
            )
            await self.redis_client.ping()
            logger.info("✅ Cache Redis conectado com sucesso")
        except Exception as e:
            logger.warning(f"⚠️  Redis não disponível, usando apenas cache em memória: {e}")
            self.redis_client = None

    def _generate_key(self, key: str) -> str:
        """Gera chave com prefix"""
        return f"{self.config.key_prefix}{key}"

    def _serialize_value(self, value: Any) -> bytes:
        """Serializa valor para armazenamento"""
        if self.config.enable_compression:
            return pickle.dumps(value)
        return json.dumps(value, default=str).encode()

    def _deserialize_value(self, data: bytes) -> Any:
        """Deserializa valor do armazenamento"""
        try:
            if self.config.enable_compression:
                return pickle.loads(data)
            return json.loads(data.decode())
        except Exception as e:
            logger.error(f"Erro ao deserializar cache: {e}")
            return None

    async def get(self, key: str) -> Any | None:
        """Recupera valor do cache"""
        cache_key = self._generate_key(key)

        # Tenta cache em memória primeiro
        if cache_key in self.memory_cache:
            cache_data = self.memory_cache[cache_key]
            if cache_data["expires_at"] > datetime.now():
                self.stats.hits += 1
                return cache_data["value"]
            else:
                # Remove item expirado
                del self.memory_cache[cache_key]

        # Tenta Redis se disponível
        if self.redis_client:
            try:
                data = await self.redis_client.get(cache_key)
                if data:
                    value = self._deserialize_value(data)
                    if value is not None:
                        self.stats.hits += 1
                        # Adiciona ao cache em memória
                        await self._add_to_memory_cache(cache_key, value)
                        return value
            except Exception as e:
                logger.error(f"Erro ao acessar Redis: {e}")

        self.stats.misses += 1
        return None

    async def set(self, key: str, value: Any, ttl: int | None = None) -> bool:
        """Armazena valor no cache"""
        cache_key = self._generate_key(key)
        ttl = ttl or self.config.default_ttl
        expires_at = datetime.now() + timedelta(seconds=ttl)

        # Armazena em memória
        await self._add_to_memory_cache(cache_key, value, expires_at)

        # Armazena no Redis se disponível
        if self.redis_client:
            try:
                serialized = self._serialize_value(value)
                await self.redis_client.setex(cache_key, ttl, serialized)
            except Exception as e:
                logger.error(f"Erro ao armazenar no Redis: {e}")

        self.stats.sets += 1
        return True

    async def delete(self, key: str) -> bool:
        """Remove valor do cache"""
        cache_key = self._generate_key(key)

        # Remove da memória
        if cache_key in self.memory_cache:
            del self.memory_cache[cache_key]

        # Remove do Redis
        if self.redis_client:
            try:
                await self.redis_client.delete(cache_key)
            except Exception as e:
                logger.error(f"Erro ao deletar do Redis: {e}")

        self.stats.deletes += 1
        return True

    async def clear(self, pattern: str | None = None) -> int:
        """Limpa cache com padrão opcional"""
        count = 0

        if pattern:
            # Limpa por padrão
            pattern_key = self._generate_key(pattern)

            # Limpa memória
            keys_to_delete = [k for k in self.memory_cache.keys() if pattern in k]
            for key in keys_to_delete:
                del self.memory_cache[key]
                count += 1

            # Limpa Redis
            if self.redis_client:
                try:
                    keys = await self.redis_client.keys(f"{pattern_key}*")
                    if keys:
                        await self.redis_client.delete(*keys)
                        count += len(keys)
                except Exception as e:
                    logger.error(f"Erro ao limpar Redis: {e}")
        else:
            # Limpa tudo
            count = len(self.memory_cache)
            self.memory_cache.clear()

            if self.redis_client:
                try:
                    keys = await self.redis_client.keys(f"{self.config.key_prefix}*")
                    if keys:
                        await self.redis_client.delete(*keys)
                        count += len(keys)
                except Exception as e:
                    logger.error(f"Erro ao limpar Redis: {e}")

        return count

    async def _add_to_memory_cache(
        self, key: str, value: Any, expires_at: datetime | None = None
    ):
        """Adiciona item ao cache em memória"""
        async with self._lock:
            if len(self.memory_cache) >= self.config.max_memory_cache_size:
                await self._cleanup_memory_cache()

            if expires_at is None:
                expires_at = datetime.now() + timedelta(seconds=self.config.default_ttl)

            self.memory_cache[key] = {
                "value": value,
                "expires_at": expires_at,
                "created_at": datetime.now(),
            }

    async def _cleanup_memory_cache(self):
        """Remove itens expirados do cache em memória"""
        now = datetime.now()
        expired_keys = [
            key
            for key, data in self.memory_cache.items()
            if data["expires_at"] <= now
        ]

        for key in expired_keys:
            del self.memory_cache[key]

        # Se ainda está cheio, remove os mais antigos
        if len(self.memory_cache) >= self.config.max_memory_cache_size:
            sorted_items = sorted(
                self.memory_cache.items(),
                key=lambda x: x[1]["created_at"]
            )
            # Remove 25% dos itens mais antigos
            remove_count = max(1, len(sorted_items) // 4)
            for i in range(remove_count):
                key = sorted_items[i][0]
                del self.memory_cache[key]

    async def get_stats(self) -> CacheStats:
        """Retorna estatísticas do cache"""
        self.stats.memory_usage = len(self.memory_cache)
        
        if self.redis_client:
            try:
                info = await self.redis_client.info("memory")
                self.stats.redis_usage = info.get("used_memory", 0)
            except Exception:
                self.stats.redis_usage = 0
        
        return self.stats

    async def health_check(self) -> dict[str, Any]:
        """Verifica saúde do sistema de cache"""
        health = {
            "status": "healthy",
            "memory_cache": {
                "enabled": True,
                "items": len(self.memory_cache),
                "max_size": self.config.max_memory_cache_size,
            },
            "redis": {
                "enabled": self.redis_client is not None,
                "connected": False,
            },
            "stats": await self.get_stats(),
        }

        if self.redis_client:
            try:
                await self.redis_client.ping()
                health["redis"]["connected"] = True
            except Exception as e:
                health["redis"]["error"] = str(e)
                health["status"] = "degraded"

        return health


# ========================================
# INSTÂNCIA GLOBAL DO CACHE MANAGER
# ========================================
_cache_manager: CacheManager | None = None


async def get_cache_manager() -> CacheManager:
    """Retorna instância global do cache manager"""
    global _cache_manager
    if _cache_manager is None:
        _cache_manager = CacheManager()
        await _cache_manager.initialize()
    return _cache_manager


# ========================================
# DECORADORES DE CACHE
# ========================================
def cache_result(ttl: int | None = None, key_prefix: str = ""):
    """Decorator para cache de resultados de função"""
    cache_ttl = ttl or settings.CACHE_TTL_DEFAULT
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Gera chave única baseada na função e argumentos
            func_name = f"{func.__module__}.{func.__name__}"
            args_hash = hashlib.md5(
                str((args, sorted(kwargs.items()))).encode()
            ).hexdigest()
            cache_key = f"{key_prefix}func:{func_name}:{args_hash}"

            # Tenta buscar no cache
            cache_manager = await get_cache_manager()
            cached_result = await cache_manager.get(cache_key)
            
            if cached_result is not None:
                return cached_result

            # Executa função e armazena resultado
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, cache_ttl)
            
            return result
        return wrapper
    return decorator


def cache_model_query(model_name: str, ttl: int | None = None):
    """Decorator para cache de queries de modelo"""
    cache_ttl = ttl or settings.CACHE_TTL_STATIC_DATA
    return cache_result(cache_ttl, f"model:{model_name}:")


def cache_api_response(ttl: int | None = None):
    """Decorator para cache de respostas de API"""
    cache_ttl = ttl or settings.CACHE_TTL_API_RESPONSE
    return cache_result(cache_ttl, "api:")


def cache_user_data(ttl: int | None = None):
    """Decorator para cache de dados de usuário"""
    cache_ttl = ttl or settings.CACHE_TTL_USER_DATA
    return cache_result(cache_ttl, "user:")


# ========================================
# FUNÇÕES DE INVALIDAÇÃO DE CACHE
# ========================================
async def invalidate_user_cache(user_id: int):
    """Invalida cache específico do usuário"""
    cache_manager = await get_cache_manager()
    await cache_manager.clear(f"user:*:{user_id}:")


async def invalidate_model_cache(model_name: str):
    """Invalida cache específico do modelo"""
    cache_manager = await get_cache_manager()
    await cache_manager.clear(f"model:{model_name}:")


async def invalidate_api_cache(endpoint: str = ""):
    """Invalida cache de API"""
    cache_manager = await get_cache_manager()
    pattern = f"api:{endpoint}" if endpoint else "api:"
    await cache_manager.clear(pattern)


# ========================================
# MIDDLEWARE DE CACHE HTTP
# ========================================
class CacheMiddleware:
    """Middleware para cache de responses HTTP"""

    def __init__(self, app, cache_ttl: int | None = None):
        self.app = app
        self.cache_ttl = cache_ttl or settings.CACHE_TTL_API_RESPONSE

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Só faz cache de GET requests
        if scope["method"] != "GET":
            await self.app(scope, receive, send)
            return

        # Gera chave de cache baseada na URL e query params
        path = scope["path"]
        query_string = scope.get("query_string", b"").decode()
        cache_key = f"http:{path}:{query_string}"

        cache_manager = await get_cache_manager()
        cached_response = await cache_manager.get(cache_key)

        if cached_response:
            # Retorna resposta do cache
            response_body = cached_response["body"]
            response_headers = cached_response["headers"]
            
            async def send_cached_response():
                await send({
                    "type": "http.response.start",
                    "status": 200,
                    "headers": response_headers,
                })
                await send({
                    "type": "http.response.body",
                    "body": response_body,
                })
            
            await send_cached_response()
            return

        # Captura resposta para cache
        response_body = b""
        response_headers = []
        response_status = 200

        async def send_wrapper(message):
            nonlocal response_body, response_headers, response_status
            
            if message["type"] == "http.response.start":
                response_status = message["status"]
                response_headers = message.get("headers", [])
                
                # Adiciona header de cache
                response_headers.append((b"x-cache", b"MISS"))
                
                await send(message)
                
            elif message["type"] == "http.response.body":
                response_body += message.get("body", b"")
                
                # Se é o último chunk, armazena no cache
                if not message.get("more_body", False):
                    if response_status == 200:
                        cache_data = {
                            "body": response_body,
                            "headers": response_headers,
                        }
                        await cache_manager.set(cache_key, cache_data, self.cache_ttl)
                
                await send(message)

        await self.app(scope, receive, send_wrapper)
