"""
Sistema WebSocket avançado para monitoramento de execuções em tempo real
Criado por José - um desenvolvedor Full Stack
Sistema completo de comunicação real-time para workflows
"""

import asyncio
import json
import logging
import time
from typing import Dict, List, Any, Set
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, asdict
from fastapi import WebSocket
import uuid

logger = logging.getLogger(__name__)


class EventType(str, Enum):
    """Tipos de eventos WebSocket"""

    # Eventos de execução
    EXECUTION_STARTED = "execution_started"
    EXECUTION_PROGRESS = "execution_progress"
    EXECUTION_COMPLETED = "execution_completed"
    EXECUTION_FAILED = "execution_failed"
    EXECUTION_CANCELLED = "execution_cancelled"

    # Eventos de nós
    NODE_STARTED = "node_started"
    NODE_PROGRESS = "node_progress"
    NODE_COMPLETED = "node_completed"
    NODE_FAILED = "node_failed"
    NODE_SKIPPED = "node_skipped"

    # Eventos de sistema
    LOG_MESSAGE = "log_message"
    PERFORMANCE_UPDATE = "performance_update"
    RESOURCE_USAGE = "resource_usage"
    ERROR_OCCURRED = "error_occurred"
    WARNING_OCCURRED = "warning_occurred"

    # Eventos de controle
    HEARTBEAT = "heartbeat"
    CONNECTION_STATUS = "connection_status"
    SUBSCRIPTION_CONFIRMED = "subscription_confirmed"
    SUBSCRIPTION_FAILED = "subscription_failed"


class LogLevel(str, Enum):
    """Níveis de log"""

    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class WebSocketEvent:
    """Estrutura de evento WebSocket"""

    event_type: EventType
    data: dict[str, Any]
    timestamp: str = None
    event_id: str = None
    execution_id: str = None
    node_id: str = None
    user_id: int = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat()
        if self.event_id is None:
            self.event_id = str(uuid.uuid4())

    def to_dict(self) -> dict[str, Any]:
        """Converte para dicionário"""
        return asdict(self)

    def to_json(self) -> str:
        """Converte para JSON"""
        return json.dumps(self.to_dict())


class ExecutionRoom:
    """Sala de execução para agrupar conexões por execução"""

    def __init__(self, execution_id: str):
        self.execution_id = execution_id
        self.connections: set[WebSocket] = set()
        self.created_at = datetime.utcnow()
        self.last_activity = datetime.utcnow()
        self.event_history: list[WebSocketEvent] = []
        self.max_history = 100  # Máximo de eventos no histórico

    def add_connection(self, websocket: WebSocket):
        """Adiciona uma conexão à sala"""
        self.connections.add(websocket)
        self.last_activity = datetime.utcnow()

    def remove_connection(self, websocket: WebSocket):
        """Remove uma conexão da sala"""
        self.connections.discard(websocket)
        self.last_activity = datetime.utcnow()

    def add_event(self, event: WebSocketEvent):
        """Adiciona evento ao histórico"""
        self.event_history.append(event)

        # Limita o histórico
        if len(self.event_history) > self.max_history:
            self.event_history = self.event_history[-self.max_history :]

        self.last_activity = datetime.utcnow()

    def get_connection_count(self) -> int:
        """Retorna número de conexões ativas"""
        return len(self.connections)

    def is_empty(self) -> bool:
        """Verifica se a sala está vazia"""
        return len(self.connections) == 0


class ExecutionConnectionManager:
    """
    Gerenciador WebSocket especializado para monitoramento de execuções
    """

    def __init__(self):
        self.rooms: dict[str, ExecutionRoom] = {}  # execution_id -> ExecutionRoom
        self.user_connections: dict[int, set[WebSocket]] = (
            {}
        )  # user_id -> Set[WebSocket]
        self.connection_metadata: dict[WebSocket, dict[str, Any]] = {}
        self.global_connections: set[WebSocket] = set()  # Conexões globais (admin)
        self._lock = asyncio.Lock()
        self.heartbeat_interval = 30  # segundos
        self.cleanup_interval = 300  # 5 minutos
        self.is_running = False
        self.background_tasks: list[asyncio.Task] = []

    async def start(self):
        """Inicia o gerenciador WebSocket"""
        if self.is_running:
            return

        self.is_running = True

        # Inicia tarefas de background
        self.background_tasks.append(
            asyncio.create_task(self._heartbeat_task()),
        )
        self.background_tasks.append(
            asyncio.create_task(self._cleanup_task()),
        )

        logger.info("🚀 ExecutionConnectionManager iniciado")

    async def stop(self):
        """Para o gerenciador WebSocket"""
        self.is_running = False

        # Cancela tarefas de background
        for task in self.background_tasks:
            task.cancel()

        # Aguarda finalização das tarefas
        await asyncio.gather(*self.background_tasks, return_exceptions=True)
        self.background_tasks.clear()

        # Fecha todas as conexões
        await self._close_all_connections()

        logger.info("🛑 ExecutionConnectionManager parado")

    async def connect_to_execution(
        self,
        websocket: WebSocket,
        execution_id: str,
        user_id: int,
        metadata: dict[str, Any] = None,
    ) -> bool:
        """
        Conecta um WebSocket para monitorar uma execução específica
        """
        try:
            await websocket.accept()

            async with self._lock:
                # Cria ou obtém a sala da execução
                if execution_id not in self.rooms:
                    self.rooms[execution_id] = ExecutionRoom(execution_id)

                room = self.rooms[execution_id]

                # Adiciona à sala
                room.add_connection(websocket)

                # Registra conexão do usuário
                if user_id not in self.user_connections:
                    self.user_connections[user_id] = set()
                self.user_connections[user_id].add(websocket)

                # Armazena metadados
                self.connection_metadata[websocket] = {
                    "user_id": user_id,
                    "execution_id": execution_id,
                    "connected_at": datetime.utcnow(),
                    "last_heartbeat": datetime.utcnow(),
                    "metadata": metadata or {},
                }

            # Envia confirmação de conexão
            await self._send_to_websocket(
                websocket,
                WebSocketEvent(
                    event_type=EventType.SUBSCRIPTION_CONFIRMED,
                    data={
                        "execution_id": execution_id,
                        "room_connections": room.get_connection_count(),
                        "history_events": len(room.event_history),
                    },
                    execution_id=execution_id,
                    user_id=user_id,
                ),
            )

            # Envia histórico de eventos se existir
            if room.event_history:
                for event in room.event_history[-10:]:  # Últimos 10 eventos
                    await self._send_to_websocket(websocket, event)

            logger.info(
                f"WebSocket conectado para execução {execution_id} (usuário {user_id})"
            )
            return True

        except Exception as e:
            logger.error(f"Erro ao conectar WebSocket: {str(e)}")
            try:
                await websocket.close(code=1011, reason="Erro interno")
            except:
                pass
            return False

    async def connect_global(
        self,
        websocket: WebSocket,
        user_id: int,
        metadata: dict[str, Any] = None,
    ) -> bool:
        """
        Conecta um WebSocket para monitoramento global (admin)
        """
        try:
            await websocket.accept()

            async with self._lock:
                # Adiciona às conexões globais
                self.global_connections.add(websocket)

                # Registra conexão do usuário
                if user_id not in self.user_connections:
                    self.user_connections[user_id] = set()
                self.user_connections[user_id].add(websocket)

                # Armazena metadados
                self.connection_metadata[websocket] = {
                    "user_id": user_id,
                    "execution_id": None,
                    "connected_at": datetime.utcnow(),
                    "last_heartbeat": datetime.utcnow(),
                    "is_global": True,
                    "metadata": metadata or {},
                }

            # Envia confirmação
            await self._send_to_websocket(
                websocket,
                WebSocketEvent(
                    event_type=EventType.SUBSCRIPTION_CONFIRMED,
                    data={
                        "type": "global",
                        "active_executions": len(self.rooms),
                        "total_connections": sum(
                            len(conns) for conns in self.user_connections.values()
                        ),
                    },
                    user_id=user_id,
                ),
            )

            logger.info(f"WebSocket global conectado (usuário {user_id})")
            return True

        except Exception as e:
            logger.error(f"Erro ao conectar WebSocket global: {str(e)}")
            try:
                await websocket.close(code=1011, reason="Erro interno")
            except:
                pass
            return False

    async def disconnect(self, websocket: WebSocket):
        """
        Desconecta um WebSocket
        """
        async with self._lock:
            metadata = self.connection_metadata.get(websocket)
            if not metadata:
                return

            user_id = metadata["user_id"]
            execution_id = metadata.get("execution_id")
            is_global = metadata.get("is_global", False)

            # Remove das conexões do usuário
            if user_id in self.user_connections:
                self.user_connections[user_id].discard(websocket)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]

            # Remove da sala de execução
            if execution_id and execution_id in self.rooms:
                room = self.rooms[execution_id]
                room.remove_connection(websocket)

                # Remove sala se vazia e antiga
                if room.is_empty() and self._is_room_old(room):
                    del self.rooms[execution_id]

            # Remove das conexões globais
            if is_global:
                self.global_connections.discard(websocket)

            # Remove metadados
            del self.connection_metadata[websocket]

            logger.info(
                f"WebSocket desconectado (usuário {user_id}, execução {execution_id})"
            )

    async def broadcast_execution_event(
        self,
        execution_id: str,
        event: WebSocketEvent,
    ):
        """
        Envia evento para todos os WebSockets monitorando uma execução
        """
        async with self._lock:
            room = self.rooms.get(execution_id)
            if not room:
                return

            # Adiciona evento ao histórico
            room.add_event(event)

            # Envia para todas as conexões da sala
            disconnected = []
            for websocket in room.connections.copy():
                try:
                    await self._send_to_websocket(websocket, event)
                except:
                    disconnected.append(websocket)

            # Remove conexões desconectadas
            for websocket in disconnected:
                room.remove_connection(websocket)
                await self._cleanup_connection(websocket)

        # Envia também para conexões globais
        await self._broadcast_to_global(event)

    async def broadcast_to_user(
        self,
        user_id: int,
        event: WebSocketEvent,
    ):
        """
        Envia evento para todas as conexões de um usuário
        """
        async with self._lock:
            user_connections = self.user_connections.get(user_id, set())

            disconnected = []
            for websocket in user_connections.copy():
                try:
                    await self._send_to_websocket(websocket, event)
                except:
                    disconnected.append(websocket)

            # Remove conexões desconectadas
            for websocket in disconnected:
                await self._cleanup_connection(websocket)

    async def broadcast_global(self, event: WebSocketEvent):
        """
        Envia evento para todas as conexões globais
        """
        await self._broadcast_to_global(event)

    async def send_execution_started(
        self,
        execution_id: str,
        user_id: int,
        workflow_id: int,
        data: dict[str, Any] = None,
    ):
        """
        Envia evento de início de execução
        """
        event = WebSocketEvent(
            event_type=EventType.EXECUTION_STARTED,
            data={
                "workflow_id": workflow_id,
                "started_at": datetime.utcnow().isoformat(),
                **(data or {}),
            },
            execution_id=execution_id,
            user_id=user_id,
        )

        await self.broadcast_execution_event(execution_id, event)

    async def send_execution_progress(
        self,
        execution_id: str,
        user_id: int,
        progress: float,
        current_node: str = None,
        data: dict[str, Any] = None,
    ):
        """
        Envia evento de progresso de execução
        """
        event = WebSocketEvent(
            event_type=EventType.EXECUTION_PROGRESS,
            data={
                "progress": progress,
                "current_node": current_node,
                **(data or {}),
            },
            execution_id=execution_id,
            user_id=user_id,
        )

        await self.broadcast_execution_event(execution_id, event)

    async def send_execution_completed(
        self,
        execution_id: str,
        user_id: int,
        result: dict[str, Any] = None,
        data: dict[str, Any] = None,
    ):
        """
        Envia evento de conclusão de execução
        """
        event = WebSocketEvent(
            event_type=EventType.EXECUTION_COMPLETED,
            data={
                "completed_at": datetime.utcnow().isoformat(),
                "result": result,
                **(data or {}),
            },
            execution_id=execution_id,
            user_id=user_id,
        )

        await self.broadcast_execution_event(execution_id, event)

    async def send_execution_failed(
        self,
        execution_id: str,
        user_id: int,
        error: str,
        data: dict[str, Any] = None,
    ):
        """
        Envia evento de falha de execução
        """
        event = WebSocketEvent(
            event_type=EventType.EXECUTION_FAILED,
            data={
                "failed_at": datetime.utcnow().isoformat(),
                "error": error,
                **(data or {}),
            },
            execution_id=execution_id,
            user_id=user_id,
        )

        await self.broadcast_execution_event(execution_id, event)

    async def send_node_started(
        self,
        execution_id: str,
        node_id: str,
        user_id: int,
        node_type: str = None,
        data: dict[str, Any] = None,
    ):
        """
        Envia evento de início de nó
        """
        event = WebSocketEvent(
            event_type=EventType.NODE_STARTED,
            data={
                "node_type": node_type,
                "started_at": datetime.utcnow().isoformat(),
                **(data or {}),
            },
            execution_id=execution_id,
            node_id=node_id,
            user_id=user_id,
        )

        await self.broadcast_execution_event(execution_id, event)

    async def send_node_completed(
        self,
        execution_id: str,
        node_id: str,
        user_id: int,
        result: dict[str, Any] = None,
        execution_time_ms: int = None,
        data: dict[str, Any] = None,
    ):
        """
        Envia evento de conclusão de nó
        """
        event = WebSocketEvent(
            event_type=EventType.NODE_COMPLETED,
            data={
                "completed_at": datetime.utcnow().isoformat(),
                "result": result,
                "execution_time_ms": execution_time_ms,
                **(data or {}),
            },
            execution_id=execution_id,
            node_id=node_id,
            user_id=user_id,
        )

        await self.broadcast_execution_event(execution_id, event)

    async def send_node_failed(
        self,
        execution_id: str,
        node_id: str,
        user_id: int,
        error: str,
        data: dict[str, Any] = None,
    ):
        """
        Envia evento de falha de nó
        """
        event = WebSocketEvent(
            event_type=EventType.NODE_FAILED,
            data={
                "failed_at": datetime.utcnow().isoformat(),
                "error": error,
                **(data or {}),
            },
            execution_id=execution_id,
            node_id=node_id,
            user_id=user_id,
        )

        await self.broadcast_execution_event(execution_id, event)

    async def send_log_message(
        self,
        execution_id: str,
        user_id: int,
        level: LogLevel,
        message: str,
        node_id: str = None,
        data: dict[str, Any] = None,
    ):
        """
        Envia mensagem de log
        """
        event = WebSocketEvent(
            event_type=EventType.LOG_MESSAGE,
            data={
                "level": level.value,
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
                **(data or {}),
            },
            execution_id=execution_id,
            node_id=node_id,
            user_id=user_id,
        )

        await self.broadcast_execution_event(execution_id, event)

    async def send_performance_update(
        self,
        execution_id: str,
        user_id: int,
        metrics: dict[str, Any],
        data: dict[str, Any] = None,
    ):
        """
        Envia atualização de performance
        """
        event = WebSocketEvent(
            event_type=EventType.PERFORMANCE_UPDATE,
            data={
                "metrics": metrics,
                "timestamp": datetime.utcnow().isoformat(),
                **(data or {}),
            },
            execution_id=execution_id,
            user_id=user_id,
        )

        await self.broadcast_execution_event(execution_id, event)

    async def get_execution_stats(self, execution_id: str) -> dict[str, Any]:
        """
        Retorna estatísticas de uma execução
        """
        async with self._lock:
            room = self.rooms.get(execution_id)
            if not room:
                return {}

            return {
                "execution_id": execution_id,
                "active_connections": room.get_connection_count(),
                "created_at": room.created_at.isoformat(),
                "last_activity": room.last_activity.isoformat(),
                "event_count": len(room.event_history),
            }

    async def get_global_stats(self) -> dict[str, Any]:
        """
        Retorna estatísticas globais
        """
        async with self._lock:
            return {
                "active_executions": len(self.rooms),
                "total_connections": sum(
                    len(conns) for conns in self.user_connections.values()
                ),
                "global_connections": len(self.global_connections),
                "active_users": len(self.user_connections),
            }

    async def _send_to_websocket(self, websocket: WebSocket, event: WebSocketEvent):
        """
        Envia evento para um WebSocket específico
        """
        try:
            await websocket.send_text(event.to_json())
        except Exception as e:
            logger.warning(f"Erro ao enviar para WebSocket: {str(e)}")
            raise

    async def _broadcast_to_global(self, event: WebSocketEvent):
        """
        Envia evento para todas as conexões globais
        """
        async with self._lock:
            disconnected = []
            for websocket in self.global_connections.copy():
                try:
                    await self._send_to_websocket(websocket, event)
                except:
                    disconnected.append(websocket)

            # Remove conexões desconectadas
            for websocket in disconnected:
                await self._cleanup_connection(websocket)

    async def _cleanup_connection(self, websocket: WebSocket):
        """
        Limpa uma conexão desconectada
        """
        try:
            await self.disconnect(websocket)
        except:
            pass

    async def _heartbeat_task(self):
        """
        Tarefa de heartbeat para manter conexões vivas
        """
        while self.is_running:
            try:
                await asyncio.sleep(self.heartbeat_interval)

                heartbeat_event = WebSocketEvent(
                    event_type=EventType.HEARTBEAT,
                    data={
                        "timestamp": datetime.utcnow().isoformat(),
                        "server_time": time.time(),
                    },
                )

                # Envia heartbeat para todas as conexões
                async with self._lock:
                    all_connections = set()
                    for connections in self.user_connections.values():
                        all_connections.update(connections)

                    disconnected = []
                    for websocket in all_connections:
                        try:
                            await self._send_to_websocket(websocket, heartbeat_event)

                            # Atualiza último heartbeat
                            if websocket in self.connection_metadata:
                                self.connection_metadata[websocket][
                                    "last_heartbeat"
                                ] = datetime.utcnow()
                        except:
                            disconnected.append(websocket)

                    # Remove conexões desconectadas
                    for websocket in disconnected:
                        await self._cleanup_connection(websocket)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Erro na tarefa de heartbeat: {str(e)}")

    async def _cleanup_task(self):
        """
        Tarefa de limpeza para remover salas antigas
        """
        while self.is_running:
            try:
                await asyncio.sleep(self.cleanup_interval)

                async with self._lock:
                    # Remove salas vazias e antigas
                    rooms_to_remove = []
                    for execution_id, room in self.rooms.items():
                        if room.is_empty() and self._is_room_old(room):
                            rooms_to_remove.append(execution_id)

                    for execution_id in rooms_to_remove:
                        del self.rooms[execution_id]
                        logger.info(
                            f"Sala de execução {execution_id} removida (inativa)"
                        )

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Erro na tarefa de limpeza: {str(e)}")

    def _is_room_old(self, room: ExecutionRoom) -> bool:
        """
        Verifica se uma sala é antiga (mais de 1 hora sem atividade)
        """
        return (datetime.utcnow() - room.last_activity).total_seconds() > 3600

    async def _close_all_connections(self):
        """
        Fecha todas as conexões WebSocket
        """
        async with self._lock:
            all_connections = set()
            for connections in self.user_connections.values():
                all_connections.update(connections)
            all_connections.update(self.global_connections)

            for websocket in all_connections:
                try:
                    await websocket.close(code=1001, reason="Servidor desligando")
                except:
                    pass

            # Limpa todos os dados
            self.rooms.clear()
            self.user_connections.clear()
            self.connection_metadata.clear()
            self.global_connections.clear()


# Instância global do gerenciador
execution_websocket_manager = ExecutionConnectionManager()
