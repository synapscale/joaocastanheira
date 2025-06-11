"""
Serviço de Execução de Workflows
Criado por José - um desenvolvedor Full Stack
Engine completa de execução em tempo real com todas as funcionalidades
"""

import asyncio
import json
import logging
import re
import time
import traceback
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union, Tuple
import threading

from sqlalchemy import asc, desc, func, or_, text
from sqlalchemy.orm import Session

from synapse.models.workflow_execution import (
    WorkflowExecution,
    NodeExecution,
    ExecutionQueue,
    ExecutionMetrics,
    ExecutionStatus,
    NodeExecutionStatus,
)
from synapse.models.workflow import Workflow
from synapse.models.node import Node
from synapse.schemas.workflow_execution import (
    ExecutionCreate,
    ExecutionResponse,
    NodeExecutionResponse,
    ExecutionStats,
    ExecutionFilter,
)
from synapse.database import get_db
from synapse.core.websockets.manager import ConnectionManager
from synapse.services.variable_service import VariableService
from synapse.exceptions import DatabaseError


# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ExecutionEngine:
    """
    Engine principal de execução de workflows
    Gerencia todo o ciclo de vida de execução
    """

    def __init__(self, websocket_manager: ConnectionManager | None = None):
        self.websocket_manager = websocket_manager
        self.variable_service = VariableService()
        
        # Disable ThreadPoolExecutor for development to avoid multiprocessing issues
        # TODO: Re-enable with proper configuration for production
        # try:
        #     if multiprocessing.current_process().name == 'MainProcess':
        #         multiprocessing.set_start_method('spawn', force=True)
        # except RuntimeError:
        #     # Method already set, continue
        #     pass
        #     
        # self.executor = ThreadPoolExecutor(max_workers=5)  # Reduced workers for stability
        self.executor = None  # Disabled for development
        self.running_executions: dict[str, asyncio.Task] = {}
        self.execution_lock = threading.Lock()
        self.is_running = False
        self.queue_processor_task = None

    async def start(self) -> None:
        """Inicia a engine de execução"""
        if self.is_running:
            return

        self.is_running = True
        self.queue_processor_task = asyncio.create_task(
            self._process_queue(),
        )  # type: ignore
        logger.info("🚀 Engine de Execução iniciada com sucesso!")

    async def stop(self) -> None:
        """Para a engine de execução"""
        self.is_running = False

        # Cancela o processador de fila
        if self.queue_processor_task:
            self.queue_processor_task.cancel()

        # Cancela execuções em andamento
        for execution_id, task in self.running_executions.items():
            task.cancel()
            logger.info("Cancelando execução %s", execution_id)

        # Aguarda finalização
        await asyncio.gather(
            *self.running_executions.values(),
            return_exceptions=True,
        )
        self.running_executions.clear()

        logger.info("🛑 Engine de Execução parada com sucesso!")

    async def create_execution(
        self,
        db: Session,
        execution_data: ExecutionCreate,
        user_id: int,
    ) -> ExecutionResponse:
        """
        Cria uma nova execução de workflow
        """
        try:
            # Valida o workflow
            workflow = (
                db.query(Workflow)
                .filter(Workflow.id == execution_data.workflow_id)
                .first()
            )
            if not workflow:
                raise ValueError(
                    f"Workflow {execution_data.workflow_id} não encontrado",
                )

            # Valida permissões do usuário
            if workflow.user_id != user_id:
                raise ValueError(
                    "Usuário não tem permissão para executar este workflow",
                )
            # Carrega variáveis do usuário se necessário
            user_variables = {}
            if execution_data.variables is None:
                user_variables = self.variable_service.get_user_env_dict(
                    db,
                    user_id,
                )
            else:
                user_variables = execution_data.variables

            # Valida o workflow antes da execução
            validation = await self._validate_workflow(
                db,
                workflow,
                user_variables,
            )
            if not validation["is_valid"]:
                raise ValueError(
                    f"Workflow inválido: {', '.join(validation['errors'])}",
                )

            # Cria a execução
            execution = WorkflowExecution(
                execution_id=str(uuid.uuid4()),
                workflow_id=execution_data.workflow_id,
                user_id=user_id,
                status=ExecutionStatus.PENDING,
                input_data=execution_data.input_data,
                context_data=execution_data.context_data,
                variables=user_variables,
                priority=execution_data.priority,
                total_nodes=validation["total_nodes"],
                timeout_at=(
                    datetime.utcnow()
                    + timedelta(seconds=execution_data.timeout_seconds)
                    if execution_data.timeout_seconds
                    else None
                ),
                estimated_duration=validation.get(
                    "estimated_duration_seconds",
                ),
                max_retries=execution_data.max_retries,
                auto_retry=execution_data.auto_retry,
                notify_on_completion=execution_data.notify_on_completion,
                notify_on_failure=execution_data.notify_on_failure,
                tags=execution_data.tags,
                metadata=execution_data.metadata,
            )

            db.add(execution)
            db.commit()
            db.refresh(execution)

            # Cria execuções de nós
            await self._create_node_executions(db, execution, workflow)

            # Adiciona à fila de execução
            await self._add_to_queue(db, execution)

            # Notifica via WebSocket
            if self.websocket_manager:
                await self.websocket_manager.send_to_user(
                    {
                        "type": "execution_created",
                        "execution_id": execution.execution_id,
                        "workflow_id": execution.workflow_id,
                        "status": execution.status.value,
                    },
                    str(user_id),
                )

            logger.info(
                "✅ Execução %s criada com sucesso",
                execution.execution_id,
            )
            return ExecutionResponse.from_orm(execution)

        except (ValueError, DatabaseError) as e:
            logger.error("❌ Erro ao criar execução: %s", str(e))
            db.rollback()
            raise
        except Exception as e:
            logger.error("❌ Erro inesperado ao criar execução: %s", str(e))
            db.rollback()
            raise DatabaseError(
                f"Erro interno ao criar execução: {str(e)}",
            ) from e

    async def start_execution(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> bool:
        """
        Inicia uma execução específica
        """
        try:
            execution = (
                db.query(WorkflowExecution)
                .filter(
                    WorkflowExecution.execution_id == execution_id,
                    WorkflowExecution.user_id == user_id,
                )
                .first()
            )

            if not execution:
                raise ValueError(f"Execução {execution_id} não encontrada")

            if execution.status != ExecutionStatus.PENDING:
                raise ValueError(f"Execução {execution_id} não está pendente")

            # Inicia a execução
            task = asyncio.create_task(self._execute_workflow(db, execution))

            with self.execution_lock:
                self.running_executions[execution_id] = task

            logger.info("🚀 Execução %s iniciada", execution_id)
            return True

        except (ValueError, DatabaseError) as e:
            logger.error(
                "❌ Erro ao iniciar execução %s: %s",
                execution_id,
                str(e),
            )
            return False
        except Exception as e:
            logger.error(
                "❌ Erro inesperado ao iniciar execução %s: %s",
                execution_id,
                str(e),
            )
            return False

    async def cancel_execution(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
        reason: str | None = None,
    ) -> bool:
        """
        Cancela uma execução
        """
        try:
            execution = (
                db.query(WorkflowExecution)
                .filter(
                    WorkflowExecution.execution_id == execution_id,
                    WorkflowExecution.user_id == user_id,
                )
                .first()
            )

            if not execution:
                raise ValueError(f"Execução {execution_id} não encontrada")

            # Cancela a task se estiver rodando
            with self.execution_lock:
                if execution_id in self.running_executions:
                    self.running_executions[execution_id].cancel()
                    del self.running_executions[execution_id]

            # Atualiza status no banco
            execution.status = ExecutionStatus.CANCELLED  # type: ignore
            execution.completed_at = datetime.utcnow()  # type: ignore
            execution.error_message = (  # type: ignore
                reason or "Execução cancelada pelo usuário"
            )

            # Cancela nós em execução
            db.query(NodeExecution).filter(
                NodeExecution.workflow_execution_id == execution.id,
                NodeExecution.status.in_(
                    [NodeExecutionStatus.PENDING, NodeExecutionStatus.RUNNING],
                ),
            ).update(
                {
                    "status": NodeExecutionStatus.SKIPPED,
                    "completed_at": datetime.utcnow(),
                    "error_message": "Cancelado junto com o workflow",
                },
            )

            db.commit()

            # Notifica via WebSocket
            if self.websocket_manager:
                await self.websocket_manager.send_to_user(
                    {
                        "type": "execution_cancelled",
                        "execution_id": execution_id,
                        "reason": reason,
                    },
                    str(user_id),
                )

            logger.info("🛑 Execução %s cancelada", execution_id)
            return True

        except (ValueError, DatabaseError) as e:
            logger.error(
                "❌ Erro ao cancelar execução %s: %s",
                execution_id,
                str(e),
            )
            return False
        except Exception as e:
            logger.error(
                "❌ Erro inesperado ao cancelar execução %s: %s",
                execution_id,
                str(e),
            )
            return False

    async def retry_execution(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> bool:
        """
        Reinicia uma execução que falhou
        """
        try:
            execution = (
                db.query(WorkflowExecution)
                .filter(
                    WorkflowExecution.execution_id == execution_id,
                    WorkflowExecution.user_id == user_id,
                )
                .first()
            )

            if not execution:
                raise ValueError(f"Execução {execution_id} não encontrada")

            if execution.status not in [
                ExecutionStatus.FAILED,
                ExecutionStatus.CANCELLED,
                ExecutionStatus.TIMEOUT,
            ]:
                raise ValueError(
                    f"Execução {execution_id} não pode ser reiniciada",
                )

            if execution.retry_count >= execution.max_retries:
                raise ValueError(
                    "Execução %s excedeu o número máximo de "
                    "tentativas" % execution_id,
                )

            # Reset da execução
            execution.status = ExecutionStatus.PENDING  # type: ignore
            execution.retry_count += 1  # type: ignore
            execution.started_at = None  # type: ignore
            execution.completed_at = None  # type: ignore
            execution.error_message = None  # type: ignore
            execution.error_details = None  # type: ignore
            execution.completed_nodes = 0  # type: ignore
            execution.failed_nodes = 0  # type: ignore
            execution.progress_percentage = 0  # type: ignore

            # Reset dos nós
            db.query(NodeExecution).filter(
                NodeExecution.workflow_execution_id == execution.id,
            ).update(
                {
                    "status": NodeExecutionStatus.PENDING,
                    "started_at": None,
                    "completed_at": None,
                    "error_message": None,
                    "error_details": None,
                    "output_data": None,
                    "retry_count": 0,
                },
            )

            db.commit()

            # Adiciona novamente à fila
            await self._add_to_queue(db, execution)

            logger.info(
                "🔄 Execução %s reiniciada (tentativa %s)",
                execution_id,
                execution.retry_count,
            )
            return True

        except (ValueError, DatabaseError) as e:
            logger.error(
                "❌ Erro ao reiniciar execução %s: %s",
                execution_id,
                str(e),
            )
            return False
        except Exception as e:
            logger.error(
                "❌ Erro inesperado ao reiniciar execução %s: %s",
                execution_id,
                str(e),
            )
            return False

    async def get_execution_status(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> ExecutionResponse | None:
        """
        Obtém o status atual de uma execução
        """
        execution = (
            db.query(WorkflowExecution)
            .filter(
                WorkflowExecution.execution_id == execution_id,
                WorkflowExecution.user_id == user_id,
            )
            .first()
        )

        if not execution:
            return None

        return ExecutionResponse.from_orm(execution)

    async def get_node_executions(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> list[NodeExecutionResponse]:
        """
        Obtém as execuções de nós de um workflow
        """
        execution = (
            db.query(WorkflowExecution)
            .filter(
                WorkflowExecution.execution_id == execution_id,
                WorkflowExecution.user_id == user_id,
            )
            .first()
        )

        if not execution:
            return []

        node_executions = (
            db.query(NodeExecution)
            .filter(NodeExecution.workflow_execution_id == execution.id)
            .order_by(NodeExecution.execution_order)
            .all()
        )

        return [NodeExecutionResponse.from_orm(ne) for ne in node_executions]

    async def get_execution_logs(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> dict[str, Any]:
        """
        Obtém os logs detalhados de uma execução
        """
        execution = (
            db.query(WorkflowExecution)
            .filter(
                WorkflowExecution.execution_id == execution_id,
                WorkflowExecution.user_id == user_id,
            )
            .first()
        )

        if not execution:
            return {}

        node_executions = (
            db.query(NodeExecution)
            .filter(NodeExecution.workflow_execution_id == execution.id)
            .order_by(NodeExecution.execution_order)
            .all()
        )

        return {
            "execution": {
                "id": execution.execution_id,
                "status": execution.status.value,
                "log": execution.execution_log,
                "error": execution.error_message,
                "debug": execution.debug_info,
            },
            "nodes": [
                {
                    "key": ne.node_key,
                    "status": ne.status.value,
                    "log": ne.execution_log,
                    "error": ne.error_message,
                    "debug": ne.debug_info,
                    "duration_ms": ne.duration_ms,
                }
                for ne in node_executions
            ],
        }

    async def get_execution_metrics(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> list[dict[str, Any]]:
        """
        Obtém métricas de uma execução
        """
        execution = (
            db.query(WorkflowExecution)
            .filter(
                WorkflowExecution.execution_id == execution_id,
                WorkflowExecution.user_id == user_id,
            )
            .first()
        )

        if not execution:
            return []

        metrics = (
            db.query(ExecutionMetrics)
            .filter(ExecutionMetrics.workflow_execution_id == execution.id)
            .all()
        )

        return [
            {
                "type": m.metric_type,
                "name": m.metric_name,
                "value": m.value_numeric
                or m.value_float
                or m.value_text
                or m.value_json,
                "context": m.context,
                "measured_at": m.measured_at,
            }
            for m in metrics
        ]

    async def _process_queue(self) -> None:
        """
        Processador principal da fila de execução
        """
        while self.is_running:
            try:
                # Usa o generator get_db corretamente
                db_gen = get_db()
                db = next(db_gen)

                execution_id = None
                user_id = None

                try:
                    # Busca próxima execução na fila
                    queue_item = (
                        db.query(ExecutionQueue)
                        .filter(
                            ExecutionQueue.status == "queued",
                            or_(
                                ExecutionQueue.scheduled_at.is_(None),
                                ExecutionQueue.scheduled_at <= datetime.utcnow(),
                            ),
                        )
                        .order_by(
                            desc(ExecutionQueue.priority),
                            asc(ExecutionQueue.created_at),
                        )
                        .first()
                    )

                    if queue_item:
                        # Marca como processando
                        queue_item.status = "processing"
                        queue_item.started_at = datetime.utcnow()
                        queue_item.worker_id = f"worker-{uuid.uuid4().hex[:8]}"
                        db.commit()

                        # Pega dados da execução antes de fechar a sessão
                        execution_id = queue_item.workflow_execution.execution_id
                        user_id = queue_item.workflow_execution.user_id

                finally:
                    # Garante que a sessão seja fechada
                    try:
                        next(db_gen, None)  # Finaliza o generator
                    except StopIteration:
                        pass

                # Se encontrou uma execução para processar,
                # inicia com nova sessão
                if execution_id is not None and user_id is not None:
                    # Usa nova sessão para a execução
                    db_gen_exec = get_db()
                    db_exec = next(db_gen_exec)
                    try:
                        await self.start_execution(
                            db_exec,
                            execution_id,
                            user_id,
                        )
                    finally:
                        try:
                            next(db_gen_exec, None)
                        except StopIteration:
                            pass

                await asyncio.sleep(1)  # Verifica a fila a cada segundo

            except (asyncio.CancelledError, DatabaseError) as e:
                logger.error("❌ Erro no processador de fila: %s", str(e))
                await asyncio.sleep(5)  # Espera mais tempo em caso de erro
            except Exception as e:
                logger.error(
                    "❌ Erro inesperado no processador de fila: %s",
                    str(e),
                )
                await asyncio.sleep(5)  # Espera mais tempo em caso de erro

    async def _execute_workflow(
        self,
        db: Session,
        execution: WorkflowExecution,
    ) -> None:
        """
        Executa um workflow completo
        """
        try:
            # Atualiza status para executando
            execution.status = ExecutionStatus.RUNNING  # type: ignore
            execution.started_at = datetime.utcnow()  # type: ignore
            db.commit()

            # Notifica início
            if self.websocket_manager:
                await self.websocket_manager.send_to_user(
                    {
                        "type": "execution_started",
                        "execution_id": execution.execution_id,
                        "started_at": execution.started_at.isoformat(),
                    },
                    str(execution.user_id),  # type: ignore
                )

            # Carrega nós para execução
            node_executions = (
                db.query(NodeExecution)
                .filter(NodeExecution.workflow_execution_id == execution.id)
                .order_by(NodeExecution.execution_order)
                .all()
            )

            # Executa nós em ordem
            for node_execution in node_executions:
                if execution.status == ExecutionStatus.CANCELLED:
                    break

                # Verifica timeout
                if execution.timeout_at and datetime.utcnow() > execution.timeout_at:
                    execution.status = ExecutionStatus.TIMEOUT  # type: ignore
                    execution.error_message = (  # type: ignore
                        "Execução excedeu o tempo limite"
                    )
                    break

                # Executa o nó
                success = await self._execute_node(
                    db,
                    execution,
                    node_execution,
                )

                if success:
                    execution.completed_nodes += 1  # type: ignore
                else:
                    execution.failed_nodes += 1  # type: ignore

                    # Se falhou e não deve continuar, para a execução
                    if not node_execution.node.continue_on_error:
                        execution.status = ExecutionStatus.FAILED  # type: ignore
                        execution.error_message = (  # type: ignore
                            "Nó %s falhou e interrompeu a execução"
                            % node_execution.node_key
                        )
                        break

                # Atualiza progresso
                execution.update_progress()
                db.commit()

                # Notifica progresso
                if self.websocket_manager:
                    await self.websocket_manager.send_to_user(
                        {
                            "type": "execution_progress",
                            "execution_id": execution.execution_id,
                            "progress": execution.progress_percentage,
                            "completed_nodes": execution.completed_nodes,
                            "total_nodes": execution.total_nodes,
                        },
                        str(execution.user_id),  # type: ignore
                    )

            # Finaliza execução
            if execution.status == ExecutionStatus.RUNNING:
                execution.status = ExecutionStatus.COMPLETED  # type: ignore

            execution.completed_at = datetime.utcnow()  # type: ignore
            execution.actual_duration = (  # type: ignore
                execution.duration_seconds  # type: ignore
            )
            db.commit()

            # Remove da lista de execuções ativas
            with self.execution_lock:
                if str(execution.execution_id) in self.running_executions:
                    del self.running_executions[str(execution.execution_id)]

            # Notifica conclusão
            if self.websocket_manager:
                await self.websocket_manager.send_to_user(
                    {
                        "type": "execution_completed",
                        "execution_id": execution.execution_id,
                        "status": execution.status.value,
                        "completed_at": execution.completed_at.isoformat(),
                        "duration_seconds": execution.actual_duration,
                    },
                    str(execution.user_id),  # type: ignore
                )

            logger.info(
                "✅ Execução %s finalizada com status %s",
                execution.execution_id,
                execution.status.value,
            )

        except (TimeoutError, DatabaseError) as e:
            logger.error(
                "❌ Erro na execução %s: %s",
                execution.execution_id,
                str(e),
            )

            # Marca como falha
            execution.status = ExecutionStatus.FAILED  # type: ignore
            execution.completed_at = datetime.utcnow()  # type: ignore
            execution.error_message = str(e)  # type: ignore
            execution.error_details = {  # type: ignore
                "traceback": traceback.format_exc(),
            }
            db.commit()

            # Remove da lista de execuções ativas
            with self.execution_lock:
                if str(execution.execution_id) in self.running_executions:
                    del self.running_executions[str(execution.execution_id)]

    async def _execute_node(
        self,
        db: Session,
        execution: WorkflowExecution,
        node_execution: NodeExecution,
    ) -> bool:
        """
        Executa um nó específico
        """
        try:
            # Atualiza status para executando
            node_execution.status = NodeExecutionStatus.RUNNING  # type: ignore
            node_execution.started_at = datetime.utcnow()  # type: ignore
            db.commit()

            start_time = time.time()

            # Simula execução do nó (aqui você implementaria a lógica real)
            # Por enquanto, vamos simular diferentes tipos de nós
            await self._simulate_node_execution(node_execution)

            # Calcula duração
            duration_ms = int((time.time() - start_time) * 1000)

            # Marca como concluído
            node_execution.status = (  # type: ignore
                NodeExecutionStatus.COMPLETED  # type: ignore
            )
            node_execution.completed_at = datetime.utcnow()  # type: ignore
            node_execution.duration_ms = duration_ms  # type: ignore
            node_execution.output_data = {  # type: ignore
                "result": "success",
                "processed_at": datetime.utcnow().isoformat(),
            }

            db.commit()

            # Registra métrica
            await self._record_metric(
                db,
                int(execution.id),  # type: ignore
                int(node_execution.id),  # type: ignore
                "execution_time",
                "node_duration_ms",
                duration_ms,
            )

            return True

        except (TimeoutError, ValueError) as e:
            logger.error(
                "❌ Erro na execução do nó %s: %s",
                node_execution.node_key,
                str(e),
            )
            return False
        except Exception as e:
            logger.error(
                "❌ Erro inesperado na execução do nó %s: %s",
                node_execution.node_key,
                str(e),
            )

            # Marca como falha
            node_execution.status = NodeExecutionStatus.FAILED  # type: ignore
            node_execution.completed_at = datetime.utcnow()  # type: ignore
            node_execution.error_message = str(e)  # type: ignore
            node_execution.error_details = {  # type: ignore
                "traceback": traceback.format_exc(),
            }

            db.commit()
            return False

    async def _simulate_node_execution(
        self,
        node_execution: NodeExecution,
    ) -> None:
        """
        Simula execução de diferentes tipos de nós
        """
        node_type = node_execution.node_type.lower()

        if node_type == "api_call":
            # Simula chamada de API
            await asyncio.sleep(0.5)
        elif node_type == "data_processing":
            # Simula processamento de dados
            await asyncio.sleep(1.0)
        elif node_type == "ai_model":
            # Simula execução de modelo de IA
            await asyncio.sleep(2.0)
        elif node_type == "webhook":
            # Simula webhook
            await asyncio.sleep(0.3)
        else:
            # Execução padrão
            await asyncio.sleep(0.5)

    async def _validate_workflow(
        self,
        db: Session,
        workflow: Workflow,
        variables: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Valida um workflow antes da execução
        """
        errors = []
        warnings: list[str] = []

        # Carrega nós do workflow
        nodes = db.query(Node).filter(Node.workflow_id == workflow.id).all()

        if not nodes:
            errors.append("Workflow não possui nós")

        # Valida variáveis necessárias
        required_vars = []
        for node in nodes:
            if node.config and isinstance(node.config, dict):
                # Extrai variáveis do config (formato ${VAR_NAME})
                config_str = json.dumps(node.config)
                vars_in_config = re.findall(r"\$\{([^}]+)\}", config_str)
                required_vars.extend(vars_in_config)

        # Remove duplicatas
        required_vars = list(set(required_vars))

        # Verifica se todas as variáveis necessárias estão disponíveis
        missing_vars = [var for var in required_vars if var not in variables]
        if missing_vars:
            errors.append(
                "Variáveis necessárias não encontradas: %s" % ", ".join(missing_vars),
            )

        # Estima duração (baseado no tipo e quantidade de nós)
        estimated_duration = len(nodes) * 2  # 2 segundos por nó em média

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "total_nodes": len(nodes),
            "estimated_duration_seconds": estimated_duration,
            "required_variables": required_vars,
        }

    async def _create_node_executions(
        self,
        db: Session,
        execution: WorkflowExecution,
        workflow: Workflow,
    ) -> None:
        """
        Cria execuções para todos os nós do workflow
        """
        nodes = (
            db.query(Node)
            .filter(Node.workflow_id == workflow.id)
            .order_by(Node.position)
            .all()
        )

        for i, node in enumerate(nodes):
            node_execution = NodeExecution(
                execution_id=str(uuid.uuid4()),
                workflow_execution_id=execution.id,
                node_id=node.id,
                node_key=node.key or f"node_{i}",
                node_type=node.type,
                node_name=node.name,
                execution_order=i,
                config_data=node.config,
                max_retries=3,
                retry_delay_ms=1000,
            )
            db.add(node_execution)

        db.commit()

    async def _add_to_queue(
        self,
        db: Session,
        execution: WorkflowExecution,
    ) -> None:
        """
        Adiciona execução à fila
        """
        queue_item = ExecutionQueue(
            queue_id=str(uuid.uuid4()),
            workflow_execution_id=execution.id,
            user_id=execution.user_id,
            priority=execution.priority,
            max_execution_time=3600,  # 1 hora por padrão
            max_retries=execution.max_retries,
        )
        db.add(queue_item)
        db.commit()

    async def _record_metric(
        self,
        db: Session,
        workflow_execution_id: int,
        node_execution_id: int | None,
        metric_type: str,
        metric_name: str,
        value: int | float | str | dict[str, Any],
    ) -> None:
        """
        Registra uma métrica de execução
        """
        metric = ExecutionMetrics(
            workflow_execution_id=workflow_execution_id,
            node_execution_id=node_execution_id,
            metric_type=metric_type,
            metric_name=metric_name,
        )

        if isinstance(value, int):
            metric.value_numeric = value  # type: ignore
        elif isinstance(value, float):
            metric.value_float = str(value)  # type: ignore
        elif isinstance(value, str):
            metric.value_text = value  # type: ignore
        else:
            metric.value_json = value  # type: ignore

        db.add(metric)
        db.commit()


class ExecutionService:
    """
    Serviço principal para gerenciamento de execuções
    Interface de alto nível para a ExecutionEngine
    """

    def __init__(self, websocket_manager: ConnectionManager | None = None):
        self.engine = ExecutionEngine(websocket_manager)

    async def initialize(self) -> None:
        """Inicializa o serviço de execução"""
        await self.engine.start()

    async def shutdown(self) -> None:
        """Finaliza o serviço de execução"""
        await self.engine.stop()

    async def start_engine(self) -> None:
        """Inicia a engine de execução"""
        await self.engine.start()

    async def stop_engine(self) -> None:
        """Para a engine de execução"""
        await self.engine.stop()

    async def get_engine_status(self) -> Dict[str, Any]:
        """Obtém o status da engine de execução"""
        return {
            "is_running": self.engine.is_running,
            "running_executions": len(self.engine.running_executions),
            "has_queue_processor": self.engine.queue_processor_task is not None and not self.engine.queue_processor_task.done()
        }

    async def create_and_start_execution(
        self,
        db: Session,
        execution_data: ExecutionCreate,
        user_id: int,
        start_immediately: bool = True,
    ) -> ExecutionResponse:
        """
        Cria e opcionalmente inicia uma execução
        """
        execution = await self.engine.create_execution(
            db,
            execution_data,
            user_id,
        )

        if start_immediately:
            await self.engine.start_execution(
                db,
                execution.execution_id,
                user_id,
            )

        return execution

    async def get_user_executions(
        self,
        db: Session,
        user_id: int,
        filters: ExecutionFilter | None = None,
    ) -> list[ExecutionResponse]:
        """
        Obtém execuções de um usuário com filtros
        """
        query = db.query(WorkflowExecution).filter(
            WorkflowExecution.user_id == user_id,
        )

        if filters:
            if filters.status:
                query = query.filter(
                    WorkflowExecution.status.in_(filters.status),
                )
            if filters.workflow_ids:
                query = query.filter(
                    WorkflowExecution.workflow_id.in_(filters.workflow_ids),
                )
            if filters.created_after:
                query = query.filter(
                    WorkflowExecution.created_at >= filters.created_after,
                )
            if filters.created_before:
                query = query.filter(
                    WorkflowExecution.created_at <= filters.created_before,
                )
            if filters.tags:
                # Filtro por tags (JSON contains)
                for tag in filters.tags:
                    query = query.filter(
                        WorkflowExecution.tags.contains([tag]),
                    )

            # Ordenação
            if filters.order_by == "created_at":
                order_col = WorkflowExecution.created_at
            elif filters.order_by == "updated_at":
                order_col = WorkflowExecution.updated_at
            elif filters.order_by == "started_at":
                order_col = WorkflowExecution.started_at
            elif filters.order_by == "completed_at":
                order_col = WorkflowExecution.completed_at
            elif filters.order_by == "priority":
                order_col = WorkflowExecution.priority  # type: ignore
            else:
                order_col = WorkflowExecution.created_at

            if filters.order_direction == "desc":
                query = query.order_by(desc(order_col))
            else:
                query = query.order_by(asc(order_col))

            # Paginação
            query = query.offset(filters.offset).limit(filters.limit)
        else:
            query = query.order_by(desc(WorkflowExecution.created_at)).limit(
                50,
            )

        executions = query.all()
        return [ExecutionResponse.from_orm(e) for e in executions]

    async def get_execution_statistics(
        self,
        db: Session,
        user_id: int,
    ) -> ExecutionStats:
        """
        Obtém estatísticas de execução de um usuário
        """
        # Contadores básicos
        total = (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.user_id == user_id)
            .count()
        )
        running = (
            db.query(WorkflowExecution)
            .filter(
                WorkflowExecution.user_id == user_id,
                WorkflowExecution.status.in_(
                    [ExecutionStatus.PENDING, ExecutionStatus.RUNNING],
                ),
            )
            .count()
        )
        completed = (
            db.query(WorkflowExecution)
            .filter(
                WorkflowExecution.user_id == user_id,
                WorkflowExecution.status == ExecutionStatus.COMPLETED,
            )
            .count()
        )
        failed = (
            db.query(WorkflowExecution)
            .filter(
                WorkflowExecution.user_id == user_id,
                WorkflowExecution.status == ExecutionStatus.FAILED,
            )
            .count()
        )
        cancelled = (
            db.query(WorkflowExecution)
            .filter(
                WorkflowExecution.user_id == user_id,
                WorkflowExecution.status == ExecutionStatus.CANCELLED,
            )
            .count()
        )

        # Taxa de sucesso
        success_rate = (completed / total * 100) if total > 0 else 0

        # Duração média
        avg_duration = (
            db.query(func.avg(WorkflowExecution.actual_duration))
            .filter(
                WorkflowExecution.user_id == user_id,
                WorkflowExecution.actual_duration.isnot(None),
            )
            .scalar()
            or 0
        )

        # Total de nós executados
        total_nodes = (
            db.query(func.sum(WorkflowExecution.completed_nodes))
            .filter(WorkflowExecution.user_id == user_id)
            .scalar()
            or 0
        )

        # Média de nós por execução
        avg_nodes = (total_nodes / total) if total > 0 else 0

        # Workflows mais usados - implementação simplificada
        most_used: list[tuple[int, int]] = []
        try:
            most_used = db.execute(
                text(
                    """
                        SELECT workflow_id, COUNT(*) as count
                        FROM workflow_executions
                        WHERE user_id = :user_id
                        GROUP BY workflow_id
                        ORDER BY count DESC
                        LIMIT 5
                    """
                ),
                {"user_id": user_id},
            ).fetchall()
        except (DatabaseError, TypeError):
            # Em caso de erro, retorna lista vazia
            most_used = []

        return ExecutionStats(
            total_executions=total,
            running_executions=running,
            completed_executions=completed,
            failed_executions=failed,
            cancelled_executions=cancelled,
            average_duration_seconds=(float(avg_duration) if avg_duration else None),
            success_rate_percentage=success_rate,
            total_nodes_executed=total_nodes,
            average_nodes_per_execution=avg_nodes,
            most_used_workflows=[
                {"workflow_id": w[0], "count": w[1]} for w in most_used
            ],
            execution_trends={},  # Implementar trends se necessário
        )

    # Métodos de conveniência que delegam para a engine
    async def cancel_execution(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
        reason: str | None = None,
    ) -> bool:
        return await self.engine.cancel_execution(
            db,
            execution_id,
            user_id,
            reason,
        )

    async def retry_execution(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> bool:
        return await self.engine.retry_execution(db, execution_id, user_id)

    async def get_execution_status(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> ExecutionResponse | None:
        return await self.engine.get_execution_status(
            db,
            execution_id,
            user_id,
        )

    async def get_node_executions(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> list[NodeExecutionResponse]:
        return await self.engine.get_node_executions(db, execution_id, user_id)

    async def get_execution_logs(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> dict[str, Any]:
        return await self.engine.get_execution_logs(db, execution_id, user_id)

    async def get_execution_metrics(
        self,
        db: Session,
        execution_id: str,
        user_id: int,
    ) -> list[dict[str, Any]]:
        return await self.engine.get_execution_metrics(
            db,
            execution_id,
            user_id,
        )
