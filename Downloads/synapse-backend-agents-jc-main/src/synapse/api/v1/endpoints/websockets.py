"""
Endpoints WebSocket para monitoramento de execuções em tempo real
Criado por José - um desenvolvedor Full Stack
API WebSocket completa para comunicação real-time

Este módulo implementa endpoints WebSocket para monitoramento
em tempo real de execuções, notificações e comunicação bidireccional.
"""

import asyncio
import json
import logging
from typing import Optional, Dict, Any, Union

from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session

from synapse.database import get_db
from synapse.api.deps import get_current_user
from synapse.models.user import User
from synapse.models.workflow_execution import WorkflowExecution
from synapse.core.websockets.execution_manager import execution_websocket_manager
from synapse.core.auth.jwt import jwt_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])


async def authenticate_websocket(
    websocket: WebSocket,
    token: str,
    db: Session,
) -> Optional[User]:
    """
    Autentica um WebSocket usando JWT token.
    
    Verifica a validade do token JWT e retorna o usuário
    associado se autenticação bem-sucedida.
    
    Args:
        websocket: Conexão WebSocket
        token: Token JWT para autenticação
        db: Sessão do banco de dados
        
    Returns:
        Optional[User]: Usuário autenticado ou None
        
    Raises:
        Não levanta exceções, retorna None em caso de erro
    """
    try:
        logger.info(f"Tentativa de autenticação WebSocket com token: {token[:20]}...")
        
        # Verifica e decodifica o token JWT
        payload = jwt_manager.verify_token(token)
        user_id = payload.get("sub")

        if not user_id:
            logger.warning("Token JWT sem user_id válido")
            return None

        # Busca o usuário no banco
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"Usuário {user_id} não encontrado no banco")
            return None
            
        if not user.is_active:
            logger.warning(f"Usuário {user_id} está inativo")
            return None

        logger.info(f"Usuário {user_id} autenticado com sucesso via WebSocket")
        return user

    except Exception as e:
        logger.warning(f"Erro na autenticação WebSocket: {str(e)}")
        return None


async def check_execution_access(
    user: User,
    execution_id: str,
    db: Session,
) -> bool:
    """
    Verifica se o usuário tem acesso à execução específica.
    
    Valida se o usuário é proprietário da execução ou admin.
    
    Args:
        user: Usuário a verificar
        execution_id: ID da execução
        db: Sessão do banco de dados
        
    Returns:
        bool: True se tem acesso, False caso contrário
    """
    try:
        logger.info(f"Verificando acesso do usuário {user.id} à execução {execution_id}")
        
        execution = (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.id == execution_id)
            .first()
        )

        if not execution:
            logger.warning(f"Execução {execution_id} não encontrada")
            return False

        # Verifica se é o dono da execução ou admin
        has_access = execution.user_id == user.id or user.is_admin
        
        if has_access:
            logger.info(f"Acesso autorizado para usuário {user.id} à execução {execution_id}")
        else:
            logger.warning(f"Acesso negado para usuário {user.id} à execução {execution_id}")
            
        return has_access

    except Exception as e:
        logger.error(f"Erro ao verificar acesso à execução {execution_id}: {str(e)}")
        return False


@router.websocket("/execution/{execution_id}")
async def websocket_execution_monitor(
    websocket: WebSocket,
    execution_id: str,
    token: str = Query(..., description="JWT token para autenticação"),
    db: Session = Depends(get_db),
) -> None:
    """
    WebSocket para monitorar uma execução específica em tempo real.
    
    Permite acompanhar logs, status e eventos de uma execução
    de workflow específica com atualizações em tempo real.
    
    ## Função
    Estabelece uma conexão WebSocket autenticada para monitoramento
    de uma execução específica, enviando atualizações em tempo real.
    
    ## Quando Usar
    - Para monitorar o progresso de uma execução em tempo real
    - Para receber logs e eventos de uma execução específica
    - Para implementar interfaces de monitoramento dinâmicas
    
    Args:
        websocket: Conexão WebSocket
        execution_id: ID da execução a monitorar
        token: Token JWT para autenticação
        db: Sessão do banco de dados
        
    WebSocket Messages:
        - Enviados: status updates, logs, errors, completion events
        - Recebidos: heartbeat, control commands
    """
    user = None

    try:
        logger.info(f"Nova conexão WebSocket para execução {execution_id}")
        
        # Autentica o usuário
        user = await authenticate_websocket(websocket, token, db)
        if not user:
            logger.warning(f"Falha na autenticação WebSocket para execução {execution_id}")
            await websocket.close(code=4001, reason="Token inválido")
            return

        # Verifica acesso à execução
        if not await check_execution_access(user, execution_id, db):
            logger.warning(f"Acesso negado à execução {execution_id} para usuário {user.id}")
            await websocket.close(code=4003, reason="Acesso negado à execução")
            return

        # Conecta ao sistema de monitoramento
        success = await execution_websocket_manager.connect_to_execution(
            websocket=websocket,
            execution_id=execution_id,
            user_id=user.id,
            metadata={
                "user_email": user.email,
                "connection_type": "execution_monitor",
                "execution_id": execution_id,
                "connected_at": str(asyncio.get_event_loop().time()),
            },
        )

        if not success:
            logger.error(f"Falha ao conectar WebSocket à execução {execution_id}")
            await websocket.close(code=1011, reason="Erro ao conectar")
            return

        logger.info(f"WebSocket conectado com sucesso - execução {execution_id}, usuário {user.id}")

        # Enviar estado inicial
        await _send_initial_execution_state(websocket, execution_id, db)

        # Loop de escuta para mensagens do cliente
        try:
            while True:
                # Recebe mensagens do cliente (heartbeat, comandos, etc.)
                message = await websocket.receive_text()
                
                logger.debug(f"Mensagem recebida do cliente - execução {execution_id}: {message[:100]}")

                # Processa mensagem se necessário
                await _process_client_message(
                    websocket, message, execution_id, user, db
                )

        except WebSocketDisconnect:
            logger.info(f"WebSocket desconectado normalmente - execução {execution_id}, usuário {user.id}")

    except Exception as e:
        logger.error(f"Erro crítico no WebSocket de execução {execution_id}: {str(e)}")
        try:
            await websocket.close(code=1011, reason="Erro interno")
        except:
            pass

    finally:
        # Desconecta do sistema
        if user:
            await execution_websocket_manager.disconnect(websocket)
            logger.info(f"WebSocket cleanup concluído - execução {execution_id}, usuário {user.id}")


@router.websocket("/global")
async def websocket_global_monitor(
    websocket: WebSocket,
    token: str = Query(..., description="JWT token para autenticação"),
    db: Session = Depends(get_db),
) -> None:
    """
    WebSocket para monitoramento global do sistema (admin only).
    
    Permite acompanhar todas as execuções do sistema em tempo real,
    disponível apenas para administradores.
    
    ## Função
    Estabelece uma conexão WebSocket autenticada para monitoramento
    global do sistema, incluindo todas as execuções ativas.
    
    ## Quando Usar
    - Para monitoramento administrativo do sistema
    - Para dashboards de administração em tempo real
    - Para alertas e notificações globais
    
    Args:
        websocket: Conexão WebSocket
        token: Token JWT para autenticação (admin required)
        db: Sessão do banco de dados
        
    WebSocket Messages:
        - Enviados: system stats, all execution updates, alerts
        - Recebidos: admin commands, filters, heartbeat
    """
    user = None

    try:
        logger.info("Nova conexão WebSocket para monitoramento global")
        
        # Autentica o usuário
        user = await authenticate_websocket(websocket, token, db)
        if not user:
            logger.warning("Falha na autenticação WebSocket para monitoramento global")
            await websocket.close(code=4001, reason="Token inválido")
            return

        # Verifica se é admin
        if not user.is_admin:
            logger.warning(f"Tentativa de acesso não-admin ao monitoramento global - usuário {user.id}")
            await websocket.close(code=4003, reason="Acesso negado - apenas admins")
            return

        # Conecta ao sistema de monitoramento global
        success = await execution_websocket_manager.connect_global(
            websocket=websocket,
            user_id=user.id,
            metadata={
                "user_email": user.email,
                "connection_type": "global_monitor",
                "is_admin": True,
                "connected_at": str(asyncio.get_event_loop().time()),
            },
        )

        if not success:
            logger.error("Falha ao conectar WebSocket global")
            await websocket.close(code=1011, reason="Erro ao conectar")
            return

        logger.info(f"WebSocket global conectado com sucesso - admin {user.id}")

        # Enviar estado inicial do sistema
        await _send_initial_global_state(websocket, db)

        # Loop de escuta para mensagens do cliente
        try:
            while True:
                message = await websocket.receive_text()
                
                logger.debug(f"Mensagem admin recebida: {message[:100]}")

                # Processa comandos de admin
                await _process_admin_message(websocket, message, user, db)

        except WebSocketDisconnect:
            logger.info(f"WebSocket global desconectado normalmente - admin {user.id}")

    except Exception as e:
        logger.error(f"Erro crítico no WebSocket global: {str(e)}")
        try:
            await websocket.close(code=1011, reason="Erro interno")
        except:
            pass

    finally:
        # Desconecta do sistema
        if user:
            await execution_websocket_manager.disconnect(websocket)
            logger.info(f"WebSocket global cleanup concluído - admin {user.id}")


@router.websocket("/user")
async def websocket_user_monitor(
    websocket: WebSocket,
    token: str = Query(..., description="JWT token para autenticação"),
    db: Session = Depends(get_db),
) -> None:
    """
    WebSocket para monitoramento das execuções do usuário.
    
    Permite acompanhar todas as execuções do usuário autenticado
    em tempo real.
    
    ## Função
    Estabelece uma conexão WebSocket autenticada para monitoramento
    de todas as execuções do usuário logado.
    
    ## Quando Usar
    - Para dashboards pessoais de usuário
    - Para notificações de execuções próprias
    - Para interfaces de usuário dinâmicas
    
    Args:
        websocket: Conexão WebSocket
        token: Token JWT para autenticação
        db: Sessão do banco de dados
        
    WebSocket Messages:
        - Enviados: user execution updates, notifications
        - Recebidos: preferences, heartbeat
    """
    user = None

    try:
        logger.info("Nova conexão WebSocket para monitoramento de usuário")
        
        # Autentica o usuário
        user = await authenticate_websocket(websocket, token, db)
        if not user:
            logger.warning("Falha na autenticação WebSocket para monitoramento de usuário")
            await websocket.close(code=4001, reason="Token inválido")
            return

        # Conecta ao sistema de monitoramento do usuário
        success = await execution_websocket_manager.connect_user(
            websocket=websocket,
            user_id=user.id,
            metadata={
                "user_email": user.email,
                "connection_type": "user_monitor",
                "connected_at": str(asyncio.get_event_loop().time()),
            },
        )

        if not success:
            logger.error(f"Falha ao conectar WebSocket do usuário {user.id}")
            await websocket.close(code=1011, reason="Erro ao conectar")
            return

        logger.info(f"WebSocket de usuário conectado com sucesso - usuário {user.id}")

        # Enviar estado inicial das execuções do usuário
        await _send_initial_user_state(websocket, user.id, db)

        # Loop de escuta para mensagens do cliente
        try:
            while True:
                message = await websocket.receive_text()
                
                logger.debug(f"Mensagem de usuário recebida: {message[:100]}")

                # Processa comandos do usuário
                await _process_user_message(websocket, message, user, db)

        except WebSocketDisconnect:
            logger.info(f"WebSocket de usuário desconectado normalmente - usuário {user.id}")

    except Exception as e:
        logger.error(f"Erro crítico no WebSocket de usuário: {str(e)}")
        try:
            await websocket.close(code=1011, reason="Erro interno")
        except:
            pass

    finally:
        # Desconecta do sistema
        if user:
            await execution_websocket_manager.disconnect(websocket)
            logger.info(f"WebSocket de usuário cleanup concluído - usuário {user.id}")


async def _send_initial_execution_state(
    websocket: WebSocket,
    execution_id: str,
    db: Session,
) -> None:
    """Envia estado inicial da execução para o cliente"""
    try:
        execution = db.query(WorkflowExecution).filter(
            WorkflowExecution.id == execution_id
        ).first()
        
        if execution:
            initial_state = {
                "type": "initial_state",
                "execution_id": execution_id,
                "status": execution.status,
                "created_at": execution.created_at.isoformat() if execution.created_at else None,
                "updated_at": execution.updated_at.isoformat() if execution.updated_at else None,
            }
            await websocket.send_text(json.dumps(initial_state))
            logger.debug(f"Estado inicial enviado para execução {execution_id}")
    except Exception as e:
        logger.error(f"Erro ao enviar estado inicial da execução {execution_id}: {str(e)}")


async def _send_initial_global_state(websocket: WebSocket, db: Session) -> None:
    """Envia estado inicial global para admin"""
    try:
        # Estatísticas globais do sistema
        total_executions = db.query(WorkflowExecution).count()
        active_executions = db.query(WorkflowExecution).filter(
            WorkflowExecution.status.in_(["running", "pending"])
        ).count()
        
        initial_state = {
            "type": "initial_global_state",
            "total_executions": total_executions,
            "active_executions": active_executions,
            "timestamp": str(asyncio.get_event_loop().time()),
        }
        await websocket.send_text(json.dumps(initial_state))
        logger.debug("Estado inicial global enviado")
    except Exception as e:
        logger.error(f"Erro ao enviar estado inicial global: {str(e)}")


async def _send_initial_user_state(
    websocket: WebSocket,
    user_id: str,
    db: Session,
) -> None:
    """Envia estado inicial das execuções do usuário"""
    try:
        user_executions = db.query(WorkflowExecution).filter(
            WorkflowExecution.user_id == user_id
        ).order_by(WorkflowExecution.created_at.desc()).limit(10).all()
        
        executions_data = []
        for execution in user_executions:
            executions_data.append({
                "id": execution.id,
                "status": execution.status,
                "created_at": execution.created_at.isoformat() if execution.created_at else None,
            })
        
        initial_state = {
            "type": "initial_user_state",
            "executions": executions_data,
            "timestamp": str(asyncio.get_event_loop().time()),
        }
        await websocket.send_text(json.dumps(initial_state))
        logger.debug(f"Estado inicial do usuário {user_id} enviado")
    except Exception as e:
        logger.error(f"Erro ao enviar estado inicial do usuário {user_id}: {str(e)}")


async def _process_client_message(
    websocket: WebSocket,
    message: str,
    execution_id: str,
    user: User,
    db: Session,
) -> None:
    """
    Processa mensagens do cliente para monitoramento de execução.
    
    Args:
        websocket: Conexão WebSocket
        message: Mensagem recebida do cliente
        execution_id: ID da execução sendo monitorada
        user: Usuário autenticado
        db: Sessão do banco de dados
    """
    try:
        data = json.loads(message)
        message_type = data.get("type")
        
        if message_type == "heartbeat":
            # Responder ao heartbeat
            await websocket.send_text(json.dumps({"type": "heartbeat_ack"}))
            
        elif message_type == "request_status":
            # Enviar status atual da execução
            execution = db.query(WorkflowExecution).filter(
                WorkflowExecution.id == execution_id
            ).first()
            
            if execution:
                status_response = {
                    "type": "status_update",
                    "execution_id": execution_id,
                    "status": execution.status,
                    "timestamp": str(asyncio.get_event_loop().time()),
                }
                await websocket.send_text(json.dumps(status_response))
        
        else:
            logger.warning(f"Tipo de mensagem não reconhecido: {message_type}")
            
    except json.JSONDecodeError:
        logger.warning(f"Mensagem JSON inválida recebida: {message}")
    except Exception as e:
        logger.error(f"Erro ao processar mensagem do cliente: {str(e)}")


async def _process_admin_message(
    websocket: WebSocket,
    message: str,
    user: User,
    db: Session,
) -> None:
    """
    Processa mensagens de administrador para monitoramento global.
    
    Args:
        websocket: Conexão WebSocket
        message: Mensagem recebida do admin
        user: Usuário administrador
        db: Sessão do banco de dados
    """
    try:
        data = json.loads(message)
        message_type = data.get("type")
        
        if message_type == "heartbeat":
            await websocket.send_text(json.dumps({"type": "heartbeat_ack"}))
            
        elif message_type == "request_stats":
            # Enviar estatísticas do sistema
            stats = await _get_system_stats(db)
            stats_response = {
                "type": "system_stats",
                "data": stats,
                "timestamp": str(asyncio.get_event_loop().time()),
            }
            await websocket.send_text(json.dumps(stats_response))
            
        else:
            logger.warning(f"Tipo de mensagem admin não reconhecido: {message_type}")
            
    except json.JSONDecodeError:
        logger.warning(f"Mensagem JSON inválida recebida do admin: {message}")
    except Exception as e:
        logger.error(f"Erro ao processar mensagem do admin: {str(e)}")


async def _process_user_message(
    websocket: WebSocket,
    message: str,
    user: User,
    db: Session,
) -> None:
    """
    Processa mensagens do usuário para monitoramento pessoal.
    
    Args:
        websocket: Conexão WebSocket
        message: Mensagem recebida do usuário
        user: Usuário autenticado
        db: Sessão do banco de dados
    """
    try:
        data = json.loads(message)
        message_type = data.get("type")
        
        if message_type == "heartbeat":
            await websocket.send_text(json.dumps({"type": "heartbeat_ack"}))
            
        elif message_type == "request_executions":
            # Enviar execuções do usuário
            executions = await _get_user_executions(user.id, db)
            executions_response = {
                "type": "user_executions",
                "data": executions,
                "timestamp": str(asyncio.get_event_loop().time()),
            }
            await websocket.send_text(json.dumps(executions_response))
            
        else:
            logger.warning(f"Tipo de mensagem de usuário não reconhecido: {message_type}")
            
    except json.JSONDecodeError:
        logger.warning(f"Mensagem JSON inválida recebida do usuário: {message}")
    except Exception as e:
        logger.error(f"Erro ao processar mensagem do usuário: {str(e)}")


async def _get_system_stats(db: Session) -> Dict[str, Any]:
    """Obtém estatísticas do sistema para admins"""
    try:
        total_executions = db.query(WorkflowExecution).count()
        active_executions = db.query(WorkflowExecution).filter(
            WorkflowExecution.status.in_(["running", "pending"])
        ).count()
        
        return {
            "total_executions": total_executions,
            "active_executions": active_executions,
            "completed_executions": total_executions - active_executions,
        }
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do sistema: {str(e)}")
        return {}


async def _get_user_executions(user_id: str, db: Session) -> Dict[str, Any]:
    """Obtém execuções do usuário"""
    try:
        executions = db.query(WorkflowExecution).filter(
            WorkflowExecution.user_id == user_id
        ).order_by(WorkflowExecution.created_at.desc()).limit(20).all()
        
        executions_data = []
        for execution in executions:
            executions_data.append({
                "id": execution.id,
                "status": execution.status,
                "created_at": execution.created_at.isoformat() if execution.created_at else None,
                "updated_at": execution.updated_at.isoformat() if execution.updated_at else None,
            })
        
        return {"executions": executions_data}
    except Exception as e:
        logger.error(f"Erro ao obter execuções do usuário {user_id}: {str(e)}")
        return {"executions": []}


@router.get("/stats/global", summary="Estatísticas globais WebSocket", tags=["WebSocket", "Statistics"])
async def get_websocket_global_stats(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Obtém estatísticas globais das conexões WebSocket.
    
    Retorna informações sobre todas as conexões WebSocket
    ativas no sistema. Disponível apenas para admins.
    
    Args:
        current_user: Usuário autenticado (admin required)
        
    Returns:
        Dict[str, Any]: Estatísticas das conexões WebSocket
        
    Raises:
        HTTPException: 403 se não for admin
        HTTPException: 500 se erro interno do servidor
    """
    try:
        if not current_user.is_admin:
            logger.warning(f"Acesso negado às estatísticas globais WebSocket - usuário {current_user.id} não é admin")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado - apenas administradores"
            )

        logger.info(f"Solicitação de estatísticas globais WebSocket por admin {current_user.id}")
        
        stats = await execution_websocket_manager.get_global_stats()
        
        logger.info(f"Estatísticas globais WebSocket obtidas para admin {current_user.id}")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas globais WebSocket: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/stats/execution/{execution_id}", summary="Estatísticas WebSocket de execução", tags=["WebSocket", "Statistics"])
async def get_websocket_execution_stats(
    execution_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Obtém estatísticas das conexões WebSocket de uma execução específica.
    
    Retorna informações sobre conexões WebSocket ativas
    para uma execução específica.
    
    Args:
        execution_id: ID da execução
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        Dict[str, Any]: Estatísticas das conexões da execução
        
    Raises:
        HTTPException: 404 se execução não encontrada
        HTTPException: 403 se não tiver acesso
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Solicitação de estatísticas WebSocket da execução {execution_id} por usuário {current_user.id}")
        
        # Verifica acesso à execução
        if not await check_execution_access(current_user, execution_id, db):
            logger.warning(f"Acesso negado às estatísticas da execução {execution_id} para usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado à execução"
            )
        
        stats = await execution_websocket_manager.get_execution_stats(execution_id)
        
        logger.info(f"Estatísticas WebSocket da execução {execution_id} obtidas para usuário {current_user.id}")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas WebSocket da execução {execution_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
