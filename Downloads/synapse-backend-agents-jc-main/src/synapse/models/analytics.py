"""
Modelos Analytics para Insights e Métricas
Criado por José - um desenvolvedor Full Stack
Sistema avançado de analytics e business intelligence
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    JSON,
    BigInteger,
    DECIMAL,
    text,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from synapse.database import Base
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid


class EventType(PyEnum):
    """Tipos de eventos para analytics"""

    PAGE_VIEW = "page_view"
    USER_ACTION = "user_action"
    WORKFLOW_EXECUTION = "workflow_execution"
    COMPONENT_USAGE = "component_usage"
    ERROR_OCCURRED = "error_occurred"
    PERFORMANCE_METRIC = "performance_metric"
    BUSINESS_EVENT = "business_event"


class MetricType(PyEnum):
    """Tipos de métricas"""

    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"
    RATE = "rate"


class AnalyticsEvent(Base):
    """
    Modelo para eventos de analytics
    Captura todos os eventos do sistema para análise
    """

    __tablename__ = "analytics_events"

    # Identificação
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(String(36), unique=True, nullable=False, index=True)  # UUID

    # Classificação do evento
    event_type = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True)
    label = Column(String(200), index=True)

    # Contexto do usuário
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="SET NULL", onupdate="CASCADE"))
    session_id = Column(String(255))
    anonymous_id = Column(String(100), index=True)  # Para usuários não logados

    # Contexto técnico
    ip_address = Column(Text)
    user_agent = Column(Text)
    referrer = Column(String(1000))
    page_url = Column(String(1000))

    # Dados do evento
    properties = Column(JSONB, server_default=text("'{}'"), nullable=False)
    value = Column(Float)  # Valor numérico (opcional)

    # Contexto da aplicação
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("workspace_projects.id"), nullable=False, index=True)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=True, index=True)

    # Geolocalização
    country = Column(String(2))  # Código ISO do país
    region = Column(String(100))
    city = Column(String(100))
    timezone = Column(String(50))

    # Dispositivo e tecnologia
    device_type = Column(String(20))  # desktop, mobile, tablet
    os = Column(String(50))
    browser = Column(String(50))
    screen_resolution = Column(String(20))

    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relacionamentos
    user = relationship("User")
    workspace = relationship("Workspace")
    workflow = relationship("Workflow")

    def __repr__(self):
        return f"<AnalyticsEvent(id={self.id}, event_type='{self.event_type}', action='{self.action}')>"


class UserBehaviorMetric(Base):
    """
    Modelo para métricas de comportamento do usuário
    Agregações e insights sobre como os usuários usam o sistema
    """

    __tablename__ = "user_behavior_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True
    )

    # Período da métrica
    date = Column(DateTime, nullable=False, index=True)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly

    # Métricas de engajamento
    session_count = Column(Integer, default=0, nullable=False)
    total_session_duration = Column(Integer, default=0, nullable=False)  # segundos
    avg_session_duration = Column(Float, default=0.0, nullable=False)
    page_views = Column(Integer, default=0, nullable=False)
    unique_pages_visited = Column(Integer, default=0, nullable=False)

    # Métricas de atividade
    workflows_created = Column(Integer, default=0, nullable=False)
    workflows_executed = Column(Integer, default=0, nullable=False)
    components_used = Column(Integer, default=0, nullable=False)
    collaborations_initiated = Column(Integer, default=0, nullable=False)

    # Métricas de valor
    marketplace_purchases = Column(Integer, default=0, nullable=False)
    revenue_generated = Column(Float, default=0.0, nullable=False)
    components_published = Column(Integer, default=0, nullable=False)

    # Métricas de qualidade
    error_count = Column(Integer, default=0, nullable=False)
    support_tickets = Column(Integer, default=0, nullable=False)
    feature_requests = Column(Integer, default=0, nullable=False)

    # Scores calculados
    engagement_score = Column(Float, default=0.0, nullable=False)  # 0-100
    satisfaction_score = Column(Float, default=0.0, nullable=False)  # 0-100
    value_score = Column(Float, default=0.0, nullable=False)  # 0-100

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relacionamentos
    user = relationship("User")

    def __repr__(self):
        return f"<UserBehaviorMetric(user_id={self.user_id}, date={self.date}, period='{self.period_type}')>"


class SystemPerformanceMetric(Base):
    """
    Modelo para métricas de performance do sistema
    """

    __tablename__ = "system_performance_metrics"

    id = Column(Integer, primary_key=True, index=True)

    # Identificação da métrica
    metric_name = Column(String(100), nullable=False, index=True)
    metric_type = Column(String(20), nullable=False)  # counter, gauge, histogram, timer

    # Contexto
    service = Column(
        String(50), nullable=False, index=True
    )  # api, frontend, executor, etc.
    environment = Column(String(20), default="production", nullable=False)

    # Valores
    value = Column(Float, nullable=False)
    unit = Column(String(20))  # ms, bytes, percent, count, etc.

    # Dimensões adicionais
    tags = Column(JSON, default=dict)  # Tags para filtragem e agrupamento

    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<SystemPerformanceMetric(metric_name='{self.metric_name}', value={self.value}, service='{self.service}')>"


class BusinessMetric(Base):
    """
    Modelo para métricas de negócio
    KPIs e métricas importantes para o negócio
    """

    __tablename__ = "business_metrics"

    id = Column(Integer, primary_key=True, index=True)

    # Período
    date = Column(DateTime, nullable=False, index=True)
    period_type = Column(
        String(20), nullable=False
    )  # daily, weekly, monthly, quarterly

    # Métricas de usuários
    total_users = Column(Integer, default=0, nullable=False)
    new_users = Column(Integer, default=0, nullable=False)
    active_users = Column(Integer, default=0, nullable=False)
    churned_users = Column(Integer, default=0, nullable=False)

    # Métricas de engajamento
    total_sessions = Column(Integer, default=0, nullable=False)
    avg_session_duration = Column(Float, default=0.0, nullable=False)
    total_page_views = Column(Integer, default=0, nullable=False)
    bounce_rate = Column(Float, default=0.0, nullable=False)

    # Métricas de produto
    workflows_created = Column(Integer, default=0, nullable=False)
    workflows_executed = Column(Integer, default=0, nullable=False)
    components_published = Column(Integer, default=0, nullable=False)
    components_downloaded = Column(Integer, default=0, nullable=False)

    # Métricas de colaboração
    workspaces_created = Column(Integer, default=0, nullable=False)
    teams_formed = Column(Integer, default=0, nullable=False)
    collaborative_sessions = Column(Integer, default=0, nullable=False)

    # Métricas financeiras
    total_revenue = Column(Float, default=0.0, nullable=False)
    recurring_revenue = Column(Float, default=0.0, nullable=False)
    marketplace_revenue = Column(Float, default=0.0, nullable=False)
    avg_revenue_per_user = Column(Float, default=0.0, nullable=False)

    # Métricas de qualidade
    error_rate = Column(Float, default=0.0, nullable=False)
    avg_response_time = Column(Float, default=0.0, nullable=False)
    uptime_percentage = Column(Float, default=100.0, nullable=False)
    customer_satisfaction = Column(Float, default=0.0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def __repr__(self):
        return f"<BusinessMetric(date={self.date}, period='{self.period_type}', total_users={self.total_users})>"


class CustomReport(Base):
    """
    Modelo para relatórios personalizados
    """

    __tablename__ = "custom_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), index=True)

    # Informações do relatório
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50), index=True)

    # Configuração
    query_config = Column(JSON, nullable=False)  # Configuração da query
    visualization_config = Column(JSON, default=dict)  # Configuração de visualização
    filters = Column(JSON, default=dict)  # Filtros aplicados

    # Agendamento
    is_scheduled = Column(Boolean, default=False, nullable=False)
    schedule_config = Column(JSON, default=dict)  # Configuração de agendamento
    last_run_at = Column(DateTime)
    next_run_at = Column(DateTime)

    # Compartilhamento
    is_public = Column(Boolean, default=False, nullable=False)
    shared_with = Column(JSON, default=list)  # Lista de user_ids

    # Cache
    cached_data = Column(JSON)
    cache_expires_at = Column(DateTime)

    # Status
    status = Column(
        String(20), default="active", nullable=False
    )  # active, archived, deleted

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relacionamentos
    user = relationship("User")
    workspace = relationship("Workspace")
    executions = relationship(
        "ReportExecution", back_populates="report", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return (
            f"<CustomReport(id={self.id}, name='{self.name}', user_id={self.user_id})>"
        )


class ReportExecution(Base):
    """
    Modelo para execuções de relatórios
    """

    __tablename__ = "report_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("custom_reports.id"), nullable=False, index=True)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), index=True
    )  # Quem executou (pode ser automático)

    # Execução
    execution_type = Column(String(20), nullable=False)  # manual, scheduled, api
    parameters = Column(JSON, default=dict)  # Parâmetros da execução

    # Resultado
    status = Column(
        String(20), default="running", nullable=False
    )  # running, completed, failed
    result_data = Column(JSON)  # Dados do resultado
    error_message = Column(Text)

    # Performance
    execution_time_ms = Column(Integer)
    rows_processed = Column(Integer)
    data_size_bytes = Column(Integer)

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)

    # Relacionamentos
    report = relationship("CustomReport", back_populates="executions")
    user = relationship("User")

    def __repr__(self):
        return f"<ReportExecution(id={self.id}, report_id={self.report_id}, status='{self.status}')>"


class UserInsight(Base):
    """
    Modelo para insights personalizados dos usuários
    IA gera insights baseados no comportamento e dados
    """

    __tablename__ = "user_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Classificação do insight
    insight_type = Column(
        String(50), nullable=False, index=True
    )  # performance, usage, recommendation, etc.
    category = Column(String(50), nullable=False, index=True)
    priority = Column(
        String(20), default="medium", nullable=False
    )  # low, medium, high, critical

    # Conteúdo
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    recommendation = Column(Text)

    # Dados de suporte
    supporting_data = Column(JSON, default=dict)
    confidence_score = Column(Float, default=0.0, nullable=False)  # 0-1

    # Ação sugerida
    suggested_action = Column(String(100))
    action_url = Column(String(500))
    action_data = Column(JSON, default=dict)

    # Interação do usuário
    is_read = Column(Boolean, default=False, nullable=False)
    is_dismissed = Column(Boolean, default=False, nullable=False)
    is_acted_upon = Column(Boolean, default=False, nullable=False)
    user_feedback = Column(String(20))  # helpful, not_helpful, irrelevant

    # Validade
    expires_at = Column(DateTime)
    is_evergreen = Column(
        Boolean, default=False, nullable=False
    )  # Insight sempre relevante

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    read_at = Column(DateTime)
    acted_at = Column(DateTime)

    # Relacionamentos
    user = relationship("User")

    def __repr__(self):
        return f"<UserInsight(id={self.id}, user_id={self.user_id}, type='{self.insight_type}')>"


class AnalyticsDashboard(Base):
    """
    Modelo para dashboards de analytics personalizados
    """

    __tablename__ = "analytics_dashboards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    color = Column(String(7), default="#3B82F6")

    # ForeignKey para o usuário dono do dashboard
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Configuração
    layout = Column(JSON, nullable=False)  # Layout dos widgets
    widgets = Column(JSON, nullable=False)  # Configuração dos widgets
    filters = Column(JSON, default=dict)  # Filtros globais

    # Configurações de atualização
    auto_refresh = Column(Boolean, default=True, nullable=False)
    refresh_interval = Column(Integer, default=300)  # segundos

    # Compartilhamento
    is_public = Column(Boolean, nullable=False, server_default=text("false"))
    shared_with = Column(JSON, default=list)

    # Status
    is_default = Column(Boolean, default=False, nullable=False)
    status = Column(String(20), default="active", nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_viewed_at = Column(DateTime)

    # Relacionamentos
    user = relationship("User", back_populates="analytics_dashboards")
    workspace = relationship("Workspace")
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True, index=True)

    def __repr__(self):
        return f"<AnalyticsDashboard(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class AnalyticsAlert(Base):
    __tablename__ = "analytics_alerts"
    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    condition = Column(JSONB, nullable=False)
    notification_config = Column(JSONB, nullable=False)
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    owner_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    last_triggered_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class AnalyticsExport(Base):
    __tablename__ = "analytics_exports"
    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String(255), nullable=False)
    export_type = Column(String(50), nullable=False)
    query = Column(JSONB, nullable=False)
    file_path = Column(String(500))
    status = Column(String(20), nullable=False, server_default=text("'pending'"))
    owner_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True))


class AnalyticsMetric(Base):
    __tablename__ = "analytics_metrics"
    id = Column(UUID(as_uuid=True), primary_key=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(DECIMAL(15,4), nullable=False)
    dimensions = Column(JSONB, server_default=text("'{}'"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AnalyticsReport(Base):
    __tablename__ = "analytics_reports"
    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    query = Column(JSONB, nullable=False)
    schedule = Column(String(50))
    owner_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
