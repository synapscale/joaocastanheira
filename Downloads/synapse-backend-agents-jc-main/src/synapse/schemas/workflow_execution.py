"""
Schemas Pydantic para WorkflowExecution
Criado por José - um desenvolvedor Full Stack
Sistema completo de execução de workflows
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator

from synapse.models.workflow_execution import ExecutionStatus, NodeExecutionStatus


# Schemas base para execução
class ExecutionBase(BaseModel):
    """Schema base para execução de workflows"""

    input_data: dict[str, Any] | None = None
    context_data: dict[str, Any] | None = None
    variables: dict[str, Any] | None = None
    priority: int = Field(default=5, ge=1, le=10)
    timeout_seconds: int | None = Field(default=3600, gt=0)
    auto_retry: bool = True
    max_retries: int = Field(default=3, ge=0, le=10)
    notify_on_completion: bool = True
    notify_on_failure: bool = True
    tags: list[str] | None = None
    metadata: dict[str, Any] | None = None


class ExecutionCreate(ExecutionBase):
    """Schema para criação de execução de workflow"""

    workflow_id: int = Field(..., gt=0)

    @validator("variables")
    def validate_variables(cls, v):
        """Valida as variáveis de entrada"""
        if v is not None:
            # Verifica se todas as chaves são strings
            for key in v.keys():
                if not isinstance(key, str):
                    raise ValueError("Todas as chaves de variáveis devem ser strings")
        return v


class ExecutionUpdate(BaseModel):
    """Schema para atualização de execução"""

    status: ExecutionStatus | None = None
    output_data: dict[str, Any] | None = None
    context_data: dict[str, Any] | None = None
    error_message: str | None = None
    error_details: dict[str, Any] | None = None
    debug_info: dict[str, Any] | None = None
    completed_nodes: int | None = Field(None, ge=0)
    failed_nodes: int | None = Field(None, ge=0)
    progress_percentage: int | None = Field(None, ge=0, le=100)
    tags: list[str] | None = None
    metadata: dict[str, Any] | None = None


class ExecutionResponse(ExecutionBase):
    """Schema de resposta para execução de workflow"""

    id: int
    execution_id: str
    workflow_id: int
    user_id: int
    status: ExecutionStatus
    output_data: dict[str, Any] | None = None
    total_nodes: int
    completed_nodes: int
    failed_nodes: int
    progress_percentage: int
    started_at: datetime | None = None
    completed_at: datetime | None = None
    timeout_at: datetime | None = None
    estimated_duration: int | None = None
    actual_duration: int | None = None
    execution_log: str | None = None
    error_message: str | None = None
    error_details: dict[str, Any] | None = None
    debug_info: dict[str, Any] | None = None
    retry_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExecutionListResponse(BaseModel):
    """Resposta paginada para execuções de workflows"""

    items: list[ExecutionResponse]
    total: int
    page: int
    size: int
    pages: int


# Schemas para execução de nós
class NodeExecutionBase(BaseModel):
    """Schema base para execução de nós"""

    node_key: str = Field(..., min_length=1, max_length=255)
    node_type: str = Field(..., min_length=1, max_length=100)
    node_name: str | None = Field(None, max_length=255)
    execution_order: int = Field(..., ge=0)
    input_data: dict[str, Any] | None = None
    config_data: dict[str, Any] | None = None
    timeout_seconds: int | None = Field(default=300, gt=0)
    max_retries: int = Field(default=3, ge=0, le=10)
    retry_delay_ms: int = Field(default=1000, ge=0)
    dependencies: list[str] | None = None
    metadata: dict[str, Any] | None = None


class NodeExecutionCreate(NodeExecutionBase):
    """Schema para criação de execução de nó"""

    workflow_execution_id: int = Field(..., gt=0)
    node_id: int = Field(..., gt=0)


class NodeExecutionUpdate(BaseModel):
    """Schema para atualização de execução de nó"""

    status: NodeExecutionStatus | None = None
    output_data: dict[str, Any] | None = None
    error_message: str | None = None
    error_details: dict[str, Any] | None = None
    debug_info: dict[str, Any] | None = None
    duration_ms: int | None = Field(None, ge=0)
    retry_count: int | None = Field(None, ge=0)
    metadata: dict[str, Any] | None = None


class NodeExecutionResponse(NodeExecutionBase):
    """Schema de resposta para execução de nó"""

    id: int
    execution_id: str
    workflow_execution_id: int
    node_id: int
    status: NodeExecutionStatus
    output_data: dict[str, Any] | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    timeout_at: datetime | None = None
    duration_ms: int | None = None
    execution_log: str | None = None
    error_message: str | None = None
    error_details: dict[str, Any] | None = None
    debug_info: dict[str, Any] | None = None
    retry_count: int
    dependents: list[str] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Schemas para fila de execução
class QueueItemCreate(BaseModel):
    """Schema para adicionar item na fila"""

    workflow_execution_id: int = Field(..., gt=0)
    priority: int = Field(default=5, ge=1, le=10)
    scheduled_at: datetime | None = None
    max_execution_time: int = Field(default=3600, gt=0)
    max_retries: int = Field(default=3, ge=0, le=10)
    metadata: dict[str, Any] | None = None


class QueueItemResponse(BaseModel):
    """Schema de resposta para item da fila"""

    id: int
    queue_id: str
    workflow_execution_id: int
    user_id: int
    priority: int
    scheduled_at: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    status: str
    worker_id: str | None = None
    max_execution_time: int
    retry_count: int
    max_retries: int
    metadata: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Schemas para métricas
class MetricCreate(BaseModel):
    """Schema para criação de métrica"""

    workflow_execution_id: int = Field(..., gt=0)
    node_execution_id: int | None = Field(None, gt=0)
    metric_type: str = Field(..., min_length=1, max_length=100)
    metric_name: str = Field(..., min_length=1, max_length=255)
    value_numeric: int | None = None
    value_float: str | None = None
    value_text: str | None = None
    value_json: dict[str, Any] | None = None
    context: str | None = Field(None, max_length=255)
    tags: dict[str, Any] | None = None


class MetricResponse(BaseModel):
    """Schema de resposta para métrica"""

    id: int
    workflow_execution_id: int
    node_execution_id: int | None = None
    metric_type: str
    metric_name: str
    value_numeric: int | None = None
    value_float: str | None = None
    value_text: str | None = None
    value_json: dict[str, Any] | None = None
    context: str | None = None
    tags: dict[str, Any] | None = None
    measured_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# Schemas para estatísticas e relatórios
class ExecutionStats(BaseModel):
    """Estatísticas de execução"""

    total_executions: int
    running_executions: int
    completed_executions: int
    failed_executions: int
    cancelled_executions: int
    average_duration_seconds: float | None = None
    success_rate_percentage: float
    total_nodes_executed: int
    average_nodes_per_execution: float | None = None
    most_used_workflows: list[dict[str, Any]]
    execution_trends: dict[str, Any]


class NodeExecutionStats(BaseModel):
    """Estatísticas de execução de nós"""

    total_node_executions: int
    completed_node_executions: int
    failed_node_executions: int
    average_duration_ms: float | None = None
    success_rate_percentage: float
    most_used_node_types: list[dict[str, Any]]
    performance_by_type: dict[str, Any]


class ExecutionSummary(BaseModel):
    """Resumo de execução"""

    execution: ExecutionResponse
    node_executions: list[NodeExecutionResponse]
    metrics: list[MetricResponse]
    stats: dict[str, Any]


# Schemas para controle de execução
class ExecutionControl(BaseModel):
    """Schema para controle de execução"""

    action: str = Field(..., pattern="^(start|pause|resume|cancel|retry)$")
    reason: str | None = Field(None, max_length=500)
    metadata: dict[str, Any] | None = None


class ExecutionBatch(BaseModel):
    """Schema para operações em lote"""

    execution_ids: list[str] = Field(..., min_items=1, max_items=100)
    action: str = Field(..., pattern="^(cancel|retry|delete)$")
    reason: str | None = Field(None, max_length=500)


# Schemas para busca e filtros
class ExecutionFilter(BaseModel):
    """Filtros para busca de execuções"""

    status: list[ExecutionStatus] | None = None
    workflow_ids: list[int] | None = None
    user_ids: list[int] | None = None
    created_after: datetime | None = None
    created_before: datetime | None = None
    completed_after: datetime | None = None
    completed_before: datetime | None = None
    tags: list[str] | None = None
    priority_min: int | None = Field(None, ge=1, le=10)
    priority_max: int | None = Field(None, ge=1, le=10)
    duration_min_seconds: int | None = Field(None, ge=0)
    duration_max_seconds: int | None = Field(None, ge=0)
    has_errors: bool | None = None
    limit: int = Field(default=50, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)
    order_by: str = Field(
        default="created_at",
        pattern="^(created_at|updated_at|started_at|completed_at|priority)$",
    )
    order_direction: str = Field(default="desc", pattern="^(asc|desc)$")


class NodeExecutionFilter(BaseModel):
    """Filtros para busca de execuções de nós"""

    status: list[NodeExecutionStatus] | None = None
    workflow_execution_ids: list[int] | None = None
    node_types: list[str] | None = None
    node_keys: list[str] | None = None
    created_after: datetime | None = None
    created_before: datetime | None = None
    duration_min_ms: int | None = Field(None, ge=0)
    duration_max_ms: int | None = Field(None, ge=0)
    has_errors: bool | None = None
    limit: int = Field(default=50, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)
    order_by: str = Field(
        default="execution_order",
        pattern="^(execution_order|created_at|started_at|completed_at|duration_ms)$",
    )
    order_direction: str = Field(default="asc", pattern="^(asc|desc)$")


# Schema para validação de workflow
class WorkflowValidation(BaseModel):
    """Resultado da validação de workflow"""

    is_valid: bool
    errors: list[str]
    warnings: list[str]
    estimated_duration_seconds: int | None = None
    total_nodes: int
    required_variables: list[str]
    optional_variables: list[str]
    dependencies: dict[str, list[str]]
