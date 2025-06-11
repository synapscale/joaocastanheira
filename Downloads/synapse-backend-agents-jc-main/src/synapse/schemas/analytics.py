"""
Schemas Pydantic para Analytics
Criado por José - um desenvolvedor Full Stack
Validação e serialização para analytics e insights
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================


class EventType(str, Enum):
    PAGE_VIEW = "page_view"
    CLICK = "click"
    FORM_SUBMIT = "form_submit"
    WORKFLOW_CREATE = "workflow_create"
    WORKFLOW_EXECUTE = "workflow_execute"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    FEATURE_USE = "feature_use"
    ERROR = "error"
    CUSTOM = "custom"


class MetricType(str, Enum):
    USER_BEHAVIOR = "user_behavior"
    SYSTEM_PERFORMANCE = "system_performance"
    BUSINESS = "business"


class InsightType(str, Enum):
    USAGE_PATTERNS = "usage_patterns"
    ENGAGEMENT = "engagement"
    PERFORMANCE = "performance"
    CONVERSION = "conversion"
    RETENTION = "retention"
    FEATURE_ADOPTION = "feature_adoption"


class ReportType(str, Enum):
    DASHBOARD = "dashboard"
    EXPORT = "export"
    SCHEDULED = "scheduled"
    CUSTOM_QUERY = "custom_query"


class ReportFormat(str, Enum):
    JSON = "json"
    CSV = "csv"
    PDF = "pdf"
    EXCEL = "excel"


# ==================== EVENT SCHEMAS ====================


class EventBase(BaseModel):
    session_id: str | None = Field(None, max_length=100)
    event_type: EventType
    event_name: str = Field(..., min_length=1, max_length=100)
    event_category: str | None = Field(None, max_length=50)
    event_action: str | None = Field(None, max_length=50)
    event_label: str | None = Field(None, max_length=100)
    event_value: float | None = None
    properties: dict[str, Any] | None = Field(default_factory=dict)
    page_url: str | None = Field(None, max_length=500)
    page_title: str | None = Field(None, max_length=200)
    referrer: str | None = Field(None, max_length=500)
    user_agent: str | None = Field(None, max_length=500)
    ip_address: str | None = Field(None, max_length=45)
    country: str | None = Field(None, max_length=2)
    city: str | None = Field(None, max_length=100)
    device_type: str | None = Field(None, max_length=20)
    browser: str | None = Field(None, max_length=50)
    os: str | None = Field(None, max_length=50)
    screen_resolution: str | None = Field(None, max_length=20)
    duration_ms: int | None = Field(None, ge=0)

    @validator("properties")
    def validate_properties(cls, v):
        if v and len(str(v)) > 10000:  # Limite de tamanho para JSON
            raise ValueError("Properties muito grandes")
        return v


class EventCreate(EventBase):
    pass


class EventResponse(EventBase):
    id: int
    user_id: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== METRIC SCHEMAS ====================


class MetricBase(BaseModel):
    metric_name: str = Field(..., min_length=1, max_length=100)
    metric_value: float
    metric_unit: str | None = Field(None, max_length=20)
    dimensions: dict[str, Any] | None = Field(default_factory=dict)


class MetricCreate(MetricBase):
    metric_type: MetricType
    context: dict[str, Any] | None = Field(default_factory=dict)


class UserBehaviorMetricResponse(MetricBase):
    id: int
    user_id: int | None = None
    context: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class SystemPerformanceMetricResponse(MetricBase):
    id: int
    component: str | None = None
    server_id: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class BusinessMetricResponse(MetricBase):
    id: int
    category: str | None = None
    subcategory: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== QUERY SCHEMAS ====================


class AnalyticsQuery(BaseModel):
    start_date: datetime | None = None
    end_date: datetime | None = None
    user_id: int | None = None
    event_type: EventType | None = None
    event_category: str | None = None
    event_name: str | None = None
    metric_name: str | None = None
    group_by: list[str] | None = Field(default_factory=list)
    aggregation: str | None = Field("count", pattern="^(count|sum|avg|min|max)$")
    order_by: str | None = None
    order_direction: str | None = Field("desc", pattern="^(asc|desc)$")
    limit: int = Field(100, ge=1, le=10000)
    offset: int = Field(0, ge=0)

    @validator("group_by")
    def validate_group_by(cls, v):
        if v and len(v) > 5:
            raise ValueError("Máximo de 5 campos para agrupamento")
        return v


class QueryResponse(BaseModel):
    data: list[dict[str, Any]]
    total: int
    aggregations: dict[str, Any] | None = None
    execution_time_ms: int
    query_hash: str


# ==================== DASHBOARD SCHEMAS ====================


class WidgetConfig(BaseModel):
    id: str = Field(..., min_length=1, max_length=50)
    type: str = Field(
        ...,
        pattern="^(metric_chart|event_timeline|user_funnel|kpi_card|heatmap|table)$",
    )
    title: str = Field(..., min_length=1, max_length=100)
    config: dict[str, Any]
    position: dict[str, int] = Field(..., description="x, y, width, height")


class DashboardLayout(BaseModel):
    columns: int = Field(12, ge=1, le=24)
    row_height: int = Field(100, ge=50, le=500)
    margin: list[int] = Field([10, 10], min_items=2, max_items=2)


class DashboardBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    layout: DashboardLayout
    widgets: list[WidgetConfig] = Field(..., min_items=1, max_items=50)
    filters: dict[str, Any] | None = Field(default_factory=dict)
    refresh_interval: int = Field(300, ge=30, le=3600)  # segundos
    is_public: bool = False
    tags: list[str] | None = Field(default_factory=list)

    @validator("widgets")
    def validate_widgets(cls, v):
        widget_ids = [w.id for w in v]
        if len(widget_ids) != len(set(widget_ids)):
            raise ValueError("IDs de widgets devem ser únicos")
        return v


class DashboardCreate(DashboardBase):
    pass


class DashboardUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    layout: DashboardLayout | None = None
    widgets: list[WidgetConfig] | None = None
    filters: dict[str, Any] | None = None
    refresh_interval: int | None = Field(None, ge=30, le=3600)
    is_public: bool | None = None
    tags: list[str] | None = None


class DashboardResponse(DashboardBase):
    id: int
    user_id: int
    user_name: str
    view_count: int = 0
    last_viewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardData(BaseModel):
    dashboard: DashboardResponse
    data: dict[str, Any]
    last_updated: datetime


# ==================== REPORT SCHEMAS ====================


class QueryConfig(BaseModel):
    type: str = Field(..., pattern="^(events|metrics|custom_sql)$")
    filters: dict[str, Any] = Field(default_factory=dict)
    aggregations: list[dict[str, Any]] | None = None
    group_by: list[str] | None = None
    order_by: list[dict[str, str]] | None = None
    limit: int | None = Field(None, ge=1, le=100000)


class VisualizationConfig(BaseModel):
    chart_type: str = Field(..., pattern="^(line|bar|pie|table|scatter|heatmap)$")
    x_axis: str | None = None
    y_axis: str | None = None
    color_by: str | None = None
    size_by: str | None = None
    options: dict[str, Any] | None = Field(default_factory=dict)


class ScheduleConfig(BaseModel):
    frequency: str = Field(..., pattern="^(daily|weekly|monthly|quarterly)$")
    time: str = Field(..., pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    timezone: str = Field("UTC", max_length=50)
    day_of_week: int | None = Field(None, ge=0, le=6)  # 0=Sunday
    day_of_month: int | None = Field(None, ge=1, le=31)


class ReportBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    report_type: ReportType
    query_config: QueryConfig
    visualization_config: VisualizationConfig | None = None
    schedule_config: ScheduleConfig | None = None
    recipients: list[str] | None = Field(default_factory=list)
    is_scheduled: bool = False
    format: ReportFormat = ReportFormat.JSON

    @validator("recipients")
    def validate_recipients(cls, v):
        if v:
            for email in v:
                if "@" not in email:
                    raise ValueError(f"Email inválido: {email}")
        return v


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    query_config: QueryConfig | None = None
    visualization_config: VisualizationConfig | None = None
    schedule_config: ScheduleConfig | None = None
    recipients: list[str] | None = None
    is_scheduled: bool | None = None
    format: ReportFormat | None = None


class ReportResponse(ReportBase):
    id: int
    user_id: int
    user_name: str
    execution_count: int = 0
    last_executed_at: datetime | None = None
    next_execution_at: datetime | None = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReportExecutionResponse(BaseModel):
    id: int
    report_id: int
    user_id: int
    execution_id: str
    status: str = Field(..., pattern="^(running|completed|failed|cancelled)$")
    result_data: dict[str, Any] | None = None
    error_message: str | None = None
    row_count: int | None = None
    file_url: str | None = None
    started_at: datetime
    completed_at: datetime | None = None

    class Config:
        from_attributes = True


# ==================== INSIGHT SCHEMAS ====================


class InsightRequest(BaseModel):
    primary_type: InsightType
    insight_types: list[InsightType] = Field(..., min_items=1, max_items=10)
    date_range: dict[str, str] = Field(
        ..., description="start and end dates in ISO format"
    )
    filters: dict[str, Any] | None = Field(default_factory=dict)
    include_recommendations: bool = True
    confidence_threshold: float = Field(0.5, ge=0.0, le=1.0)

    @validator("date_range")
    def validate_date_range(cls, v):
        if "start" not in v or "end" not in v:
            raise ValueError("Date range deve conter start e end")
        try:
            start = datetime.fromisoformat(v["start"])
            end = datetime.fromisoformat(v["end"])
            if start >= end:
                raise ValueError("Data de início deve ser anterior à data de fim")
        except ValueError as e:
            raise ValueError(f"Formato de data inválido: {e}")
        return v


class InsightResponse(BaseModel):
    id: int
    user_id: int
    insight_type: InsightType
    title: str
    summary: str
    insights: list[dict[str, Any]]
    recommendations: list[dict[str, Any]]
    metrics: dict[str, Any]
    confidence_score: float
    data_points: int
    date_range_start: datetime
    date_range_end: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== SYSTEM INSIGHTS ====================


class SystemInsights(BaseModel):
    period: dict[str, datetime]
    user_metrics: dict[str, Any]
    performance_metrics: dict[str, Any]
    business_metrics: dict[str, Any]
    trends: list[dict[str, Any]]
    anomalies: list[dict[str, Any]]
    generated_at: datetime


# ==================== FUNNEL SCHEMAS ====================


class FunnelStep(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    event_name: str = Field(..., min_length=1, max_length=100)
    filters: dict[str, Any] | None = Field(default_factory=dict)


class FunnelAnalysis(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    steps: list[FunnelStep] = Field(..., min_items=2, max_items=10)
    time_window_hours: int = Field(24, ge=1, le=8760)  # máximo 1 ano
    date_range: dict[str, str]


class FunnelResult(BaseModel):
    funnel_data: list[dict[str, Any]]
    total_users: int
    conversion_rate: float
    time_range: str
    generated_at: datetime


# ==================== COHORT SCHEMAS ====================


class CohortAnalysis(BaseModel):
    cohort_type: str = Field(
        ..., pattern="^(registration|first_purchase|first_workflow)$"
    )
    period_type: str = Field(..., pattern="^(day|week|month)$")
    periods: int = Field(12, ge=1, le=52)
    date_range: dict[str, str]


class CohortResult(BaseModel):
    cohort_data: list[list[float | None]]
    cohort_labels: list[str]
    period_labels: list[str]
    total_cohorts: int
    generated_at: datetime


# ==================== A/B TEST SCHEMAS ====================


class ABTestConfig(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    variants: list[dict[str, Any]] = Field(..., min_items=2, max_items=10)
    success_metric: str = Field(..., min_length=1, max_length=100)
    traffic_allocation: dict[str, float]
    start_date: datetime
    end_date: datetime
    minimum_sample_size: int = Field(100, ge=10)


class ABTestResult(BaseModel):
    test_id: int
    variant_results: dict[str, dict[str, Any]]
    statistical_significance: bool
    confidence_level: float
    winner: str | None = None
    recommendation: str
    generated_at: datetime


# ==================== EXPORT SCHEMAS ====================


class ExportRequest(BaseModel):
    data_type: str = Field(..., pattern="^(events|metrics|users|workflows)$")
    format: ReportFormat = ReportFormat.CSV
    filters: dict[str, Any] | None = Field(default_factory=dict)
    date_range: dict[str, str] | None = None
    columns: list[str] | None = None
    limit: int | None = Field(None, ge=1, le=1000000)


class ExportResponse(BaseModel):
    export_id: str
    status: str = Field(..., pattern="^(processing|completed|failed)$")
    file_url: str | None = None
    file_size_bytes: int | None = None
    row_count: int | None = None
    error_message: str | None = None
    created_at: datetime
    completed_at: datetime | None = None


# ==================== REAL-TIME SCHEMAS ====================


class RealTimeMetric(BaseModel):
    metric_name: str
    current_value: float
    previous_value: float | None = None
    change_percent: float | None = None
    trend: str = Field(..., pattern="^(up|down|stable)$")
    timestamp: datetime


class RealTimeStats(BaseModel):
    active_users: int
    events_per_minute: float
    error_rate: float
    response_time_ms: float
    system_load: float
    timestamp: datetime


# ==================== ALERT SCHEMAS ====================


class AlertRule(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    metric_name: str = Field(..., min_length=1, max_length=100)
    condition: str = Field(..., pattern="^(greater_than|less_than|equals|not_equals)$")
    threshold: float
    time_window_minutes: int = Field(5, ge=1, le=1440)
    notification_channels: list[str] = Field(..., min_items=1)
    is_active: bool = True


class AlertResponse(BaseModel):
    id: int
    rule: AlertRule
    triggered_at: datetime
    resolved_at: datetime | None = None
    current_value: float
    message: str
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")

    class Config:
        from_attributes = True
