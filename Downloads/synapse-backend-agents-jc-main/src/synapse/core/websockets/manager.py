"""
Sistema WebSocket completo para comunicação em tempo real
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from synapse.core.config import settings
from synapse.core.auth.jwt import jwt_manager
from synapse.core.llm import unified_service
from synapse.database import get_db
from synapse.models.agent import Agent
from synapse.models.conversation import Conversation
from synapse.models.message import Message
from synapse.models.user import User
from synapse.models.workflow import Workflow
from synapse.models.workflow_execution import ExecutionStatus, WorkflowExecution
from synapse.models.workspace import WorkspaceMember

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Gerenciador de conexões WebSocket"""

    def __init__(self):
        # Dicionário de conexões ativas: user_id -> lista de websockets
        self.active_connections: dict[str, list[WebSocket]] = {}
        # Dicionário de metadados de conexão
        self.connection_metadata: dict[WebSocket, dict[str, Any]] = {}
        # Conexões associadas a workspaces
        self.workspace_connections: dict[str, list[WebSocket]] = {}
        # Lock para operações thread-safe
        self._lock = asyncio.Lock()

    async def connect(
        self,
        websocket: WebSocket,
        user_id: str,
        metadata: dict[str, Any] = None,
    ):
        """Conecta um novo WebSocket"""
        await websocket.accept()

        async with self._lock:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = []

            # Verificar limite de conexões por usuário
            if (
                len(self.active_connections[user_id])
                >= settings.WS_MAX_CONNECTIONS_PER_USER
            ):
                await websocket.close(code=1008, reason="Limite de conexões excedido")
                return False

            self.active_connections[user_id].append(websocket)
            self.connection_metadata[websocket] = {
                "user_id": user_id,
                "connected_at": datetime.now(timezone.utc),
                "last_heartbeat": datetime.now(timezone.utc),
                **(metadata or {}),
            }

        logger.info(f"WebSocket conectado para usuário {user_id}")

        # Enviar mensagem de boas-vindas
        await self.send_personal_message(
            {
                "type": "connection_established",
                "message": "Conectado com sucesso",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            websocket,
        )

        return True

    async def disconnect(self, websocket: WebSocket):
        """Desconecta um WebSocket"""
        async with self._lock:
            metadata = self.connection_metadata.get(websocket)
            if metadata:
                user_id = metadata["user_id"]

                # Remover da lista de conexões do usuário
                if user_id in self.active_connections:
                    if websocket in self.active_connections[user_id]:
                        self.active_connections[user_id].remove(websocket)

                    # Remover usuário se não há mais conexões
                    if not self.active_connections[user_id]:
                        del self.active_connections[user_id]

                # Remover metadados
                del self.connection_metadata[websocket]

                logger.info(f"WebSocket desconectado para usuário {user_id}")

    async def send_personal_message(
        self,
        message: dict[str, Any],
        websocket: WebSocket,
    ):
        """Envia mensagem para um WebSocket específico"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem WebSocket: {str(e)}")
            await self.disconnect(websocket)

    async def send_to_user(self, message: dict[str, Any], user_id: str):
        """Envia mensagem para todas as conexões de um usuário"""
        if user_id in self.active_connections:
            disconnected_sockets = []

            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(
                        f"Erro ao enviar mensagem para usuário {user_id}: {str(e)}",
                    )
                    disconnected_sockets.append(websocket)

            # Remover conexões com erro
            for websocket in disconnected_sockets:
                await self.disconnect(websocket)

    async def broadcast(
        self,
        message: dict[str, Any],
        exclude_user: str | None = None,
    ):
        """Envia mensagem para todos os usuários conectados"""
        for user_id in list(self.active_connections.keys()):
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_to_user(message, user_id)

    async def send_to_workspace(self, message: dict[str, Any], workspace_id: str):
        """Envia mensagem para todos os usuários de um workspace"""
        connections = self.workspace_connections.get(workspace_id, [])
        disconnected = []
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                disconnected.append(ws)

        for ws in disconnected:
            await self.disconnect(ws)
            if ws in connections:
                connections.remove(ws)

    def get_user_connections(self, user_id: str) -> list[WebSocket]:
        """Retorna lista de conexões de um usuário"""
        return self.active_connections.get(user_id, [])

    def is_user_online(self, user_id: str) -> bool:
        """Verifica se um usuário está online"""
        return (
            user_id in self.active_connections
            and len(self.active_connections[user_id]) > 0
        )

    def get_online_users(self) -> list[str]:
        """Retorna lista de usuários online"""
        return list(self.active_connections.keys())

    def get_connection_count(self) -> int:
        """Retorna número total de conexões ativas"""
        return sum(len(connections) for connections in self.active_connections.values())

    async def heartbeat_check(self):
        """Verifica conexões inativas e remove"""
        current_time = datetime.now(timezone.utc)
        timeout_seconds = settings.WS_HEARTBEAT_INTERVAL * 2

        disconnected_sockets = []

        for websocket, metadata in self.connection_metadata.items():
            last_heartbeat = metadata.get("last_heartbeat")
            if last_heartbeat:
                time_diff = (current_time - last_heartbeat).total_seconds()
                if time_diff > timeout_seconds:
                    disconnected_sockets.append(websocket)

        for websocket in disconnected_sockets:
            await self.disconnect(websocket)

    async def update_heartbeat(self, websocket: WebSocket):
        """Atualiza timestamp do último heartbeat"""
        if websocket in self.connection_metadata:
            self.connection_metadata[websocket]["last_heartbeat"] = datetime.now(
                timezone.utc,
            )


# Instância global do gerenciador
manager = ConnectionManager()


class WebSocketHandler:
    """Manipulador de mensagens WebSocket"""

    def __init__(self, websocket: WebSocket, user: User, db: Session):
        self.websocket = websocket
        self.user = user
        self.db = db

    async def handle_message(self, data: dict[str, Any]):
        """Processa mensagem recebida"""
        message_type = data.get("type")

        handlers = {
            "heartbeat": self._handle_heartbeat,
            "chat_message": self._handle_chat_message,
            "typing_start": self._handle_typing_start,
            "typing_stop": self._handle_typing_stop,
            "workflow_execute": self._handle_workflow_execute,
            "agent_message": self._handle_agent_message,
            "join_workspace": self._handle_join_workspace,
            "leave_workspace": self._handle_leave_workspace,
        }

        handler = handlers.get(message_type)
        if handler:
            try:
                await handler(data)
            except Exception as e:
                logger.error(f"Erro ao processar mensagem {message_type}: {str(e)}")
                await self._send_error(f"Erro ao processar mensagem: {str(e)}")
        else:
            await self._send_error(f"Tipo de mensagem não suportado: {message_type}")

    async def _handle_heartbeat(self, data: dict[str, Any]):
        """Processa heartbeat"""
        await manager.update_heartbeat(self.websocket)
        await manager.send_personal_message(
            {
                "type": "heartbeat_ack",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            self.websocket,
        )

    async def _handle_chat_message(self, data: dict[str, Any]):
        """Processa mensagem de chat"""
        conversation_id = data.get("conversation_id")
        content = data.get("content")

        if not conversation_id or not content:
            await self._send_error("conversation_id e content são obrigatórios")
            return

        # Buscar conversa
        conversation = (
            self.db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == self.user.id,
            )
            .first()
        )

        if not conversation:
            await self._send_error("Conversa não encontrada")
            return

        # Criar mensagem do usuário
        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content=content,
            attachments=data.get("attachments", []),
        )
        self.db.add(user_message)
        self.db.commit()
        self.db.refresh(user_message)

        # Enviar confirmação
        await manager.send_personal_message(
            {"type": "message_sent", "message": user_message.to_dict()},
            self.websocket,
        )

        # Processar com agente, se configurado
        if conversation.agent_id:
            agent = (
                self.db.query(Agent).filter(Agent.id == conversation.agent_id).first()
            )
            if agent and agent.is_available():
                past_messages = (
                    self.db.query(Message)
                    .filter(Message.conversation_id == conversation.id)
                    .order_by(Message.created_at.asc())
                    .all()
                )

                chat_history = [
                    {"role": msg.role, "content": msg.content} for msg in past_messages
                ]
                chat_history.append({"role": "user", "content": content})

                llm_cfg = agent.get_llm_config()

                try:
                    llm_response = await unified_service.chat_completion(
                        chat_history,
                        provider=llm_cfg["provider"],
                        model=llm_cfg["model"],
                        temperature=llm_cfg["temperature"],
                        max_tokens=llm_cfg["max_tokens"],
                    )

                    agent_message = Message(
                        conversation_id=conversation.id,
                        role="assistant",
                        content=llm_response.content,
                        model_used=llm_cfg["model"],
                        model_provider=llm_cfg["provider"],
                        tokens_used=llm_response.usage.get("tokens", 0),
                        processing_time_ms=0,
                    )
                    self.db.add(agent_message)

                    # Atualizar contadores somente se a resposta for criada
                    conversation.message_count += 2
                    conversation.total_tokens_used += agent_message.tokens_used
                    conversation.last_message_at = func.now()

                    self.db.commit()
                    self.db.refresh(agent_message)

                    await manager.send_personal_message(
                        {"type": "agent_message", "message": agent_message.to_dict()},
                        self.websocket,
                    )
                except Exception as e:
                    logger.error(f"Erro ao gerar resposta do agente: {str(e)}")
                    conversation.message_count += 1
                    conversation.last_message_at = func.now()
                    await self._send_error("Erro ao processar mensagem com agente")
                    self.db.commit()
            else:
                conversation.message_count += 1
                conversation.last_message_at = func.now()
                self.db.commit()
        else:
            conversation.message_count += 1
            conversation.last_message_at = func.now()
            self.db.commit()

    async def _handle_typing_start(self, data: dict[str, Any]):
        """Processa início de digitação"""
        conversation_id = data.get("conversation_id")

        # Notificar outros participantes da conversa
        await manager.send_to_user(
            {
                "type": "user_typing",
                "user_id": str(self.user.id),
                "conversation_id": conversation_id,
                "typing": True,
            },
            str(self.user.id),
        )

    async def _handle_typing_stop(self, data: dict[str, Any]):
        """Processa fim de digitação"""
        conversation_id = data.get("conversation_id")

        # Notificar outros participantes da conversa
        await manager.send_to_user(
            {
                "type": "user_typing",
                "user_id": str(self.user.id),
                "conversation_id": conversation_id,
                "typing": False,
            },
            str(self.user.id),
        )

    async def _handle_workflow_execute(self, data: dict[str, Any]):
        """Processa execução de workflow"""
        workflow_id = data.get("workflow_id")

        if not workflow_id:
            await self._send_error("workflow_id é obrigatório")
            return
        workflow = self.db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            await self._send_error("Workflow não encontrado")
            return

        execution = WorkflowExecution(
            workflow_id=workflow.id,
            user_id=self.user.id,
            status=ExecutionStatus.PENDING,
            total_nodes=workflow.get_node_count(),
        )
        self.db.add(execution)
        workflow.increment_executions()
        self.db.commit()
        self.db.refresh(execution)

        await manager.send_personal_message(
            {
                "type": "workflow_execution_started",
                "workflow_id": workflow_id,
                "execution_id": execution.execution_id,
            },
            self.websocket,
        )

    async def _handle_agent_message(self, data: dict[str, Any]):
        """Processa mensagem para agente"""
        agent_id = data.get("agent_id")
        message = data.get("message")

        if not agent_id or not message:
            await self._send_error("agent_id e message são obrigatórios")
            return

        agent = self.db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            await self._send_error("Agente não encontrado")
            return

        llm_cfg = agent.get_llm_config()
        response = await unified_service.chat_completion(
            [{"role": "user", "content": message}],
            provider=llm_cfg["provider"],
            model=llm_cfg["model"],
            temperature=llm_cfg["temperature"],
            max_tokens=llm_cfg["max_tokens"],
        )

        await manager.send_personal_message(
            {
                "type": "agent_response",
                "agent_id": agent_id,
                "message": response.content,
            },
            self.websocket,
        )

    async def _handle_join_workspace(self, data: dict[str, Any]):
        """Processa entrada em workspace"""
        workspace_id = data.get("workspace_id")

        if not workspace_id:
            await self._send_error("workspace_id é obrigatório")
            return
        member = (
            self.db.query(WorkspaceMember)
            .filter(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == self.user.id,
                WorkspaceMember.status == "active",
            )
            .first()
        )

        if not member:
            await self._send_error("Acesso negado ao workspace")
            return

        manager.workspace_connections.setdefault(str(workspace_id), []).append(
            self.websocket,
        )
        meta = manager.connection_metadata.get(self.websocket)
        if meta is not None:
            workspaces = meta.setdefault("workspaces", set())
            workspaces.add(str(workspace_id))

        await manager.send_personal_message(
            {"type": "workspace_joined", "workspace_id": workspace_id},
            self.websocket,
        )

    async def _handle_leave_workspace(self, data: dict[str, Any]):
        """Processa saída de workspace"""
        workspace_id = data.get("workspace_id")
        if workspace_id:
            connections = manager.workspace_connections.get(str(workspace_id), [])
            if self.websocket in connections:
                connections.remove(self.websocket)
                if not connections:
                    del manager.workspace_connections[str(workspace_id)]

            meta = manager.connection_metadata.get(self.websocket)
            if meta and "workspaces" in meta:
                meta["workspaces"].discard(str(workspace_id))

        await manager.send_personal_message(
            {"type": "workspace_left", "workspace_id": workspace_id},
            self.websocket,
        )

    async def _send_error(self, message: str):
        """Envia mensagem de erro"""
        await manager.send_personal_message(
            {
                "type": "error",
                "message": message,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            self.websocket,
        )


async def get_current_user_ws(
    websocket: WebSocket,
    token: str,
    db: Session = Depends(get_db),
) -> User:
    """Autentica usuário via WebSocket"""
    try:
        payload = jwt_manager.verify_token(token)
        email = payload.get("sub")

        if not email:
            await websocket.close(code=1008, reason="Token inválido")
            return None

        user = db.query(User).filter(User.email == email).first()
        if not user or not user.is_active:
            await websocket.close(code=1008, reason="Usuário não encontrado ou inativo")
            return None

        return user
    except Exception:
        await websocket.close(code=1008, reason="Erro de autenticação")
        return None


async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    db: Session = Depends(get_db),
):
    """Endpoint principal do WebSocket"""
    user = await get_current_user_ws(websocket, token, db)
    if not user:
        return

    # Conectar usuário
    connected = await manager.connect(
        websocket,
        str(user.id),
        {"user_email": user.email, "user_name": user.full_name},
    )

    if not connected:
        return

    handler = WebSocketHandler(websocket, user, db)

    try:
        while True:
            # Receber mensagem
            data = await websocket.receive_text()

            try:
                message_data = json.loads(data)
                await handler.handle_message(message_data)
            except json.JSONDecodeError:
                await handler._send_error("Formato de mensagem inválido")
            except Exception as e:
                logger.error(f"Erro ao processar mensagem WebSocket: {str(e)}")
                await handler._send_error("Erro interno do servidor")

    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Erro na conexão WebSocket: {str(e)}")
        await manager.disconnect(websocket)


# Task para verificação periódica de heartbeat
async def heartbeat_task():
    """Task para verificar conexões inativas"""
    while True:
        try:
            await manager.heartbeat_check()
            await asyncio.sleep(settings.WS_HEARTBEAT_INTERVAL)
        except Exception as e:
            logger.error(f"Erro na verificação de heartbeat: {str(e)}")
            await asyncio.sleep(settings.WS_HEARTBEAT_INTERVAL)


# Funções utilitárias para envio de notificações
async def notify_user(user_id: str, notification_type: str, data: dict[str, Any]):
    """Envia notificação para um usuário específico"""
    message = {
        "type": "notification",
        "notification_type": notification_type,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await manager.send_to_user(message, user_id)


async def notify_workflow_completion(
    user_id: str,
    workflow_name: str,
    execution_id: str,
):
    """Notifica conclusão de workflow"""
    await notify_user(
        user_id,
        "workflow_completed",
        {"workflow_name": workflow_name, "execution_id": execution_id},
    )


async def notify_agent_message(user_id: str, agent_name: str, message: str):
    """Notifica nova mensagem de agente"""
    await notify_user(
        user_id,
        "agent_message",
        {"agent_name": agent_name, "message": message},
    )


async def notify_system_maintenance(message: str):
    """Notifica manutenção do sistema para todos os usuários"""
    await manager.broadcast(
        {
            "type": "system_notification",
            "notification_type": "maintenance",
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )
