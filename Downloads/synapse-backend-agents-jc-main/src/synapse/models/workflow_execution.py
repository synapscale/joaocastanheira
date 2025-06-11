"""
Modelo WorkflowExecution para engine de execução de workflows
Criado por José - um desenvolvedor Full Stack
Sistema completo de execução em tempo real
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    JSON,
    Enum as SQLEnum,
    text,
    UUID
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.dialects.postgresql import JSONB

from synapse.database import Base


class ExecutionStatus(str, Enum):
    """Status de execução do workflow"""

    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


class NodeExecutionStatus(str, Enum):
    """Status de execução de um nó específico"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    RETRY = "retry"


class WorkflowExecution(Base):
    """
    Modelo para execução de workflows
    Gerencia o estado e progresso de execução de workflows
    """

    __tablename__ = "workflow_executions"

    # Campos principais
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(
        String(36), unique=True, index=True, default=lambda: str(uuid.uuid4())
    )

    # Relacionamentos
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)

    # Status e controle
    status = Column(String(20), nullable=False, server_default=text("'pending'"))
    priority = Column(Integer, default=5, index=True)  # 1-10, maior = mais prioritário

    # Dados de execução
    input_data = Column(JSONB)
    output_data = Column(JSONB)
    context_data = Column(JSON, nullable=True)  # Contexto de execução
    variables = Column(JSON, nullable=True)  # Variáveis do usuário

    # Progresso
    total_nodes = Column(Integer, default=0)
    completed_nodes = Column(Integer, default=0)
    failed_nodes = Column(Integer, default=0)
    progress_percentage = Column(Integer, default=0)

    # Controle de tempo
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True))
    timeout_at = Column(DateTime(timezone=True), nullable=True)
    estimated_duration = Column(Integer, nullable=True)  # Em segundos
    actual_duration = Column(Integer, nullable=True)  # Em segundos

    # Logs e debugging
    execution_log = Column(Text, nullable=True)
    error_message = Column(Text)
    error_details = Column(JSON, nullable=True)
    debug_info = Column(JSON, nullable=True)

    # Configurações
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    auto_retry = Column(Boolean, default=True)
    notify_on_completion = Column(Boolean, default=True)
    notify_on_failure = Column(Boolean, default=True)

    # Metadados
    tags = Column(JSON, nullable=True)  # Tags para organização
    meta_data = Column(JSON, nullable=True)  # Metadados adicionais

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relacionamentos
    workflow = relationship("Workflow", back_populates="executions")
    user = relationship("User", back_populates="workflow_executions")
    node_executions = relationship(
        "NodeExecution",
        back_populates="workflow_execution",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<WorkflowExecution(id={self.id}, execution_id='{self.execution_id}', status='{self.status}')>"

    @property
    def is_running(self) -> bool:
        """Verifica se a execução está em andamento"""
        return self.status in [ExecutionStatus.PENDING, ExecutionStatus.RUNNING]

    @property
    def is_completed(self) -> bool:
        """Verifica se a execução foi concluída"""
        return self.status in [
            ExecutionStatus.COMPLETED,
            ExecutionStatus.FAILED,
            ExecutionStatus.CANCELLED,
            ExecutionStatus.TIMEOUT,
        ]

    @property
    def duration_seconds(self) -> int | None:
        """Calcula a duração da execução em segundos"""
        if self.started_at and self.completed_at:
            return int((self.completed_at - self.started_at).total_seconds())
        elif self.started_at:
            return int((datetime.utcnow() - self.started_at).total_seconds())
        return None

    def update_progress(self):
        """Atualiza o progresso baseado nos nós executados"""
        if self.total_nodes > 0:
            self.progress_percentage = int(
                (self.completed_nodes / self.total_nodes) * 100
            )
        else:
            self.progress_percentage = 0


class NodeExecution(Base):
    """
    Modelo para execução de nós individuais
    Rastreia o estado de cada nó durante a execução
    """

    __tablename__ = "node_executions"

    # Campos principais
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(String(36), index=True, default=lambda: str(uuid.uuid4()))

    # Relacionamentos
    workflow_execution_id = Column(
        Integer, ForeignKey("workflow_executions.id"), nullable=False, index=True
    )
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False, index=True)

    # Identificação do nó
    node_key = Column(
        String(255), nullable=False, index=True
    )  # Chave única do nó no workflow
    node_type = Column(String(100), nullable=False, index=True)
    node_name = Column(String(255), nullable=True)

    # Status e controle
    status = Column(
        SQLEnum(NodeExecutionStatus), default=NodeExecutionStatus.PENDING, index=True
    )
    execution_order = Column(Integer, nullable=False, index=True)

    # Dados de execução
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    config_data = Column(JSON, nullable=True)

    # Controle de tempo
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    timeout_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)  # Duração em milissegundos

    # Logs e debugging
    execution_log = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, nullable=True)
    debug_info = Column(JSON, nullable=True)

    # Retry e recovery
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    retry_delay = Column(Integer, default=1000)  # Em milissegundos

    # Dependências
    dependencies = Column(
        JSON, nullable=True
    )  # IDs dos nós que devem ser executados antes
    dependents = Column(JSON, nullable=True)  # IDs dos nós que dependem deste

    # Metadados
    meta_data = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relacionamentos
    workflow_execution = relationship(
        "WorkflowExecution", back_populates="node_executions"
    )
    node = relationship("Node")

    def __repr__(self):
        return f"<NodeExecution(id={self.id}, node_key='{self.node_key}', status='{self.status}')>"

    @property
    def is_ready_to_execute(self) -> bool:
        """Verifica se o nó está pronto para execução"""
        return self.status == NodeExecutionStatus.PENDING

    @property
    def is_completed(self) -> bool:
        """Verifica se a execução do nó foi concluída"""
        return self.status in [
            NodeExecutionStatus.COMPLETED,
            NodeExecutionStatus.FAILED,
            NodeExecutionStatus.SKIPPED,
        ]

    @property
    def duration_seconds(self) -> float | None:
        """Calcula a duração da execução em segundos"""
        if self.duration_ms:
            return self.duration_ms / 1000.0
        elif self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None


class ExecutionQueue(Base):
    """
    Modelo para fila de execução de workflows
    Gerencia a ordem e prioridade de execução
    """

    __tablename__ = "execution_queue"

    # Campos principais
    id = Column(Integer, primary_key=True, index=True)
    queue_id = Column(
        String(36), unique=True, index=True, default=lambda: str(uuid.uuid4())
    )

    # Relacionamentos
    workflow_execution_id = Column(
        Integer, ForeignKey("workflow_executions.id"), nullable=False, index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)

    # Controle da fila
    priority = Column(Integer, default=5, index=True)  # 1-10, maior = mais prioritário
    scheduled_at = Column(
        DateTime(timezone=True), nullable=True, index=True
    )  # Agendamento
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Status
    status = Column(
        String(50), default="queued", index=True
    )  # queued, processing, completed, failed
    worker_id = Column(
        String(100), nullable=True, index=True
    )  # ID do worker processando

    # Configurações
    max_execution_time = Column(Integer, default=3600)  # Timeout em segundos
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)

    # Metadados
    meta_data = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relacionamentos
    workflow_execution = relationship("WorkflowExecution")
    user = relationship("User")

    def __repr__(self):
        return f"<ExecutionQueue(id={self.id}, status='{self.status}', priority={self.priority})>"


class ExecutionMetrics(Base):
    """
    Modelo para métricas de execução
    Armazena estatísticas e métricas de performance
    """

    __tablename__ = "execution_metrics"

    # Campos principais
    id = Column(Integer, primary_key=True, index=True)

    # Relacionamentos
    workflow_execution_id = Column(
        Integer, ForeignKey("workflow_executions.id"), nullable=False, index=True
    )
    node_execution_id = Column(
        Integer, ForeignKey("node_executions.id"), nullable=True, index=True
    )

    # Tipo de métrica
    metric_type = Column(
        String(100), nullable=False, index=True
    )  # execution_time, memory_usage, api_calls, etc.
    metric_name = Column(String(255), nullable=False, index=True)

    # Valores
    value_numeric = Column(Integer, nullable=True)
    value_float = Column(String(50), nullable=True)  # Para valores decimais
    value_text = Column(Text, nullable=True)
    value_json = Column(JSON, nullable=True)

    # Contexto
    context = Column(String(255), nullable=True, index=True)  # node, workflow, system
    tags = Column(JSON, nullable=True)

    # Timestamps
    measured_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    workflow_execution = relationship("WorkflowExecution")
    node_execution = relationship("NodeExecution")

    def __repr__(self):
        return f"<ExecutionMetrics(id={self.id}, metric_type='{self.metric_type}', metric_name='{self.metric_name}')>"
