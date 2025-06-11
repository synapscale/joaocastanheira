"""
Serviço de Analytics
Criado por José - um desenvolvedor Full Stack
Lógica de negócio para analytics e insights
"""

from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func, text
from datetime import datetime, timedelta
import json
import uuid
from collections import defaultdict

from synapse.models.analytics import (
    AnalyticsEvent,
    UserBehaviorMetric,
    SystemPerformanceMetric,
    BusinessMetric,
    CustomReport,
    ReportExecution,
    UserInsight,
    AnalyticsDashboard,
    EventType,
    MetricType,
)
from synapse.models.user import User
from synapse.models.workflow import Workflow
from synapse.models.workspace import Workspace
from synapse.schemas.analytics import (
    EventCreate,
    MetricCreate,
    ReportCreate,
    DashboardCreate,
    AnalyticsQuery,
    InsightRequest,
)


class AnalyticsService:
    """
    Serviço para gerenciar analytics e insights
    """

    def __init__(self, db: Session):
        self.db = db

    # ==================== EVENTOS ====================

    def track_event(
        self, event_data: EventCreate, user_id: Optional[int] = None
    ) -> AnalyticsEvent:
        """Registra um evento de analytics"""

        event = AnalyticsEvent(
            user_id=user_id,
            session_id=event_data.session_id,
            event_type=EventType(event_data.event_type),
            event_name=event_data.event_name,
            event_category=event_data.event_category,
            event_action=event_data.event_action,
            event_label=event_data.event_label,
            event_value=event_data.event_value,
            properties=event_data.properties or {},
            page_url=event_data.page_url,
            page_title=event_data.page_title,
            referrer=event_data.referrer,
            user_agent=event_data.user_agent,
            ip_address=event_data.ip_address,
            country=event_data.country,
            city=event_data.city,
            device_type=event_data.device_type,
            browser=event_data.browser,
            os=event_data.os,
            screen_resolution=event_data.screen_resolution,
            duration_ms=event_data.duration_ms,
        )

        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)

        # Processar métricas derivadas
        self._process_derived_metrics(event)

        return event

    def get_events(self, query: AnalyticsQuery) -> Dict[str, Any]:
        """Obtém eventos com filtros"""

        base_query = self.db.query(AnalyticsEvent)

        # Aplicar filtros
        if query.start_date:
            base_query = base_query.filter(
                AnalyticsEvent.created_at >= query.start_date
            )

        if query.end_date:
            base_query = base_query.filter(AnalyticsEvent.created_at <= query.end_date)

        if query.user_id:
            base_query = base_query.filter(AnalyticsEvent.user_id == query.user_id)

        if query.event_type:
            base_query = base_query.filter(
                AnalyticsEvent.event_type == query.event_type
            )

        if query.event_category:
            base_query = base_query.filter(
                AnalyticsEvent.event_category == query.event_category
            )

        # Ordenação
        if query.order_by:
            if query.order_direction == "desc":
                base_query = base_query.order_by(
                    desc(getattr(AnalyticsEvent, query.order_by))
                )
            else:
                base_query = base_query.order_by(
                    asc(getattr(AnalyticsEvent, query.order_by))
                )
        else:
            base_query = base_query.order_by(desc(AnalyticsEvent.created_at))

        # Paginação
        total = base_query.count()
        events = base_query.offset(query.offset).limit(query.limit).all()

        return {
            "events": events,
            "total": total,
            "page": query.offset // query.limit + 1,
            "pages": (total + query.limit - 1) // query.limit,
        }

    # ==================== MÉTRICAS ====================

    def create_metric(
        self, metric_data: MetricCreate, user_id: Optional[int] = None
    ) -> Union[UserBehaviorMetric, SystemPerformanceMetric, BusinessMetric]:
        """Cria uma métrica"""

        if metric_data.metric_type == MetricType.USER_BEHAVIOR:
            metric = UserBehaviorMetric(
                user_id=user_id,
                metric_name=metric_data.metric_name,
                metric_value=metric_data.metric_value,
                metric_unit=metric_data.metric_unit,
                dimensions=metric_data.dimensions or {},
                context=metric_data.context or {},
            )
        elif metric_data.metric_type == MetricType.SYSTEM_PERFORMANCE:
            metric = SystemPerformanceMetric(
                metric_name=metric_data.metric_name,
                metric_value=metric_data.metric_value,
                metric_unit=metric_data.metric_unit,
                component=(
                    metric_data.dimensions.get("component")
                    if metric_data.dimensions
                    else None
                ),
                server_id=(
                    metric_data.dimensions.get("server_id")
                    if metric_data.dimensions
                    else None
                ),
                dimensions=metric_data.dimensions or {},
            )
        else:  # BUSINESS
            metric = BusinessMetric(
                metric_name=metric_data.metric_name,
                metric_value=metric_data.metric_value,
                metric_unit=metric_data.metric_unit,
                category=(
                    metric_data.dimensions.get("category")
                    if metric_data.dimensions
                    else None
                ),
                subcategory=(
                    metric_data.dimensions.get("subcategory")
                    if metric_data.dimensions
                    else None
                ),
                dimensions=metric_data.dimensions or {},
            )

        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)

        return metric

    def get_metrics_summary(
        self, metric_type: MetricType, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Obtém resumo de métricas por tipo"""

        if metric_type == MetricType.USER_BEHAVIOR:
            model = UserBehaviorMetric
        elif metric_type == MetricType.SYSTEM_PERFORMANCE:
            model = SystemPerformanceMetric
        else:
            model = BusinessMetric

        # Métricas no período
        metrics = (
            self.db.query(model)
            .filter(
                and_(
                    model.created_at >= start_date,
                    model.created_at <= end_date,
                ),
            )
            .all()
        )

        # Agrupar por nome da métrica
        grouped = defaultdict(list)
        for metric in metrics:
            grouped[metric.metric_name].append(metric.metric_value)

        # Calcular estatísticas
        summary = {}
        for metric_name, values in grouped.items():
            summary[metric_name] = {
                "count": len(values),
                "sum": sum(values),
                "avg": sum(values) / len(values) if values else 0,
                "min": min(values) if values else 0,
                "max": max(values) if values else 0,
            }

        return summary

    # ==================== DASHBOARDS ====================

    def create_dashboard(
        self, dashboard_data: DashboardCreate, user_id: int
    ) -> AnalyticsDashboard:
        """Cria um dashboard personalizado"""

        dashboard = AnalyticsDashboard(
            user_id=user_id,
            name=dashboard_data.name,
            description=dashboard_data.description,
            layout=dashboard_data.layout,
            widgets=dashboard_data.widgets,
            filters=dashboard_data.filters or {},
            refresh_interval=dashboard_data.refresh_interval or 300,
            is_public=dashboard_data.is_public or False,
            tags=dashboard_data.tags or [],
        )

        self.db.add(dashboard)
        self.db.commit()
        self.db.refresh(dashboard)

        return dashboard

    def get_dashboard_data(self, dashboard_id: int, user_id: int) -> Dict[str, Any]:
        """Obtém dados do dashboard"""

        dashboard = (
            self.db.query(AnalyticsDashboard)
            .filter(
                and_(
                    AnalyticsDashboard.id == dashboard_id,
                    or_(
                        AnalyticsDashboard.user_id == user_id,
                        AnalyticsDashboard.is_public == True,
                    ),
                ),
            )
            .first()
        )

        if not dashboard:
            return {}

        # Processar widgets
        widget_data = {}
        for widget in dashboard.widgets:
            widget_id = widget.get("id")
            widget_type = widget.get("type")
            widget_config = widget.get("config", {})

            if widget_type == "metric_chart":
                widget_data[widget_id] = self._get_metric_chart_data(widget_config)
            elif widget_type == "event_timeline":
                widget_data[widget_id] = self._get_event_timeline_data(widget_config)
            elif widget_type == "user_funnel":
                widget_data[widget_id] = self._get_user_funnel_data(widget_config)
            elif widget_type == "kpi_card":
                widget_data[widget_id] = self._get_kpi_card_data(widget_config)
            elif widget_type == "heatmap":
                widget_data[widget_id] = self._get_heatmap_data(widget_config)

        return {
            "dashboard": dashboard,
            "data": widget_data,
            "last_updated": datetime.utcnow(),
        }

    # ==================== RELATÓRIOS ====================

    def create_report(self, report_data: ReportCreate, user_id: int) -> CustomReport:
        """Cria um relatório personalizado"""

        report = CustomReport(
            user_id=user_id,
            name=report_data.name,
            description=report_data.description,
            report_type=report_data.report_type,
            query_config=report_data.query_config,
            visualization_config=report_data.visualization_config or {},
            schedule_config=report_data.schedule_config or {},
            recipients=report_data.recipients or [],
            is_scheduled=report_data.is_scheduled or False,
            format=report_data.format or "json",
        )

        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)

        return report

    def execute_report(self, report_id: int, user_id: int) -> ReportExecution:
        """Executa um relatório"""

        report = (
            self.db.query(CustomReport)
            .filter(
                and_(
                    CustomReport.id == report_id,
                    CustomReport.user_id == user_id,
                ),
            )
            .first()
        )

        if not report:
            raise ValueError("Relatório não encontrado")

        execution = ReportExecution(
            report_id=report_id,
            user_id=user_id,
            execution_id=str(uuid.uuid4()),
            status="running",
        )

        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)

        try:
            # Executar query do relatório
            result_data = self._execute_report_query(report.query_config)

            execution.status = "completed"
            execution.result_data = result_data
            execution.completed_at = datetime.utcnow()
            execution.row_count = (
                len(result_data) if isinstance(result_data, list) else 1
            )

        except Exception as e:
            execution.status = "failed"
            execution.error_message = str(e)

        self.db.commit()
        self.db.refresh(execution)

        return execution

    # ==================== INSIGHTS ====================

    def generate_user_insights(
        self, user_id: int, insight_request: InsightRequest
    ) -> UserInsight:
        """Gera insights personalizados para usuário"""

        # Coletar dados do usuário
        user_data = self._collect_user_data(user_id, insight_request.date_range)

        # Gerar insights usando IA/ML
        insights = self._generate_insights_from_data(
            user_data, insight_request.insight_types
        )

        user_insight = UserInsight(
            user_id=user_id,
            insight_type=insight_request.primary_type,
            title=insights.get("title", "Insights do Usuário"),
            summary=insights.get("summary", ""),
            insights=insights.get("insights", []),
            recommendations=insights.get("recommendations", []),
            metrics=insights.get("metrics", {}),
            confidence_score=insights.get("confidence", 0.8),
            data_points=len(user_data.get("events", [])),
            date_range_start=insight_request.date_range.get("start"),
            date_range_end=insight_request.date_range.get("end"),
        )

        self.db.add(user_insight)
        self.db.commit()
        self.db.refresh(user_insight)

        return user_insight

    def get_system_insights(self, days: int = 30) -> Dict[str, Any]:
        """Obtém insights do sistema"""

        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        # Métricas de usuários
        user_metrics = self._get_user_metrics(start_date, end_date)

        # Métricas de performance
        performance_metrics = self._get_performance_metrics(start_date, end_date)

        # Métricas de negócio
        business_metrics = self._get_business_metrics(start_date, end_date)

        # Tendências
        trends = self._analyze_trends(start_date, end_date)

        # Anomalias
        anomalies = self._detect_anomalies(start_date, end_date)

        return {
            "period": {"start": start_date, "end": end_date},
            "user_metrics": user_metrics,
            "performance_metrics": performance_metrics,
            "business_metrics": business_metrics,
            "trends": trends,
            "anomalies": anomalies,
            "generated_at": datetime.utcnow(),
        }

    # ==================== MÉTODOS AUXILIARES ====================

    def _process_derived_metrics(self, event: AnalyticsEvent):
        """Processa métricas derivadas do evento"""

        # Métrica de comportamento do usuário
        if event.user_id:
            behavior_metric = UserBehaviorMetric(
                user_id=event.user_id,
                metric_name=f"{event.event_category}_{event.event_action}",
                metric_value=event.event_value or 1,
                metric_unit="count",
                dimensions={
                    "event_name": event.event_name,
                    "page_url": event.page_url,
                    "device_type": event.device_type,
                },
            )
            self.db.add(behavior_metric)

        # Métrica de performance se houver duração
        if event.duration_ms:
            performance_metric = SystemPerformanceMetric(
                metric_name="page_load_time",
                metric_value=event.duration_ms,
                metric_unit="milliseconds",
                component="frontend",
                dimensions={
                    "page_url": event.page_url,
                    "browser": event.browser,
                },
            )
            self.db.add(performance_metric)

    def _get_metric_chart_data(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Obtém dados para gráfico de métricas"""

        metric_name = config.get("metric_name")
        metric_type = config.get("metric_type", "user_behavior")
        time_range = config.get("time_range", "7d")

        # Determinar modelo
        if metric_type == "user_behavior":
            model = UserBehaviorMetric
        elif metric_type == "system_performance":
            model = SystemPerformanceMetric
        else:
            model = BusinessMetric

        # Calcular período
        end_date = datetime.utcnow()
        if time_range == "1d":
            start_date = end_date - timedelta(days=1)
        elif time_range == "7d":
            start_date = end_date - timedelta(days=7)
        elif time_range == "30d":
            start_date = end_date - timedelta(days=30)
        else:
            start_date = end_date - timedelta(days=7)

        # Query dados
        metrics = (
            self.db.query(model)
            .filter(
                and_(
                    model.metric_name == metric_name,
                    model.created_at >= start_date,
                    model.created_at <= end_date,
                ),
            )
            .order_by(model.created_at)
            .all()
        )

        # Formatar para gráfico
        data_points = []
        for metric in metrics:
            data_points.append(
                {
                    "timestamp": metric.created_at.isoformat(),
                    "value": metric.metric_value,
                }
            )

        return {
            "data_points": data_points,
            "total_points": len(data_points),
            "time_range": time_range,
        }

    def _get_event_timeline_data(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Obtém dados para timeline de eventos"""

        event_types = config.get("event_types", [])
        time_range = config.get("time_range", "24h")

        # Calcular período
        end_date = datetime.utcnow()
        if time_range == "1h":
            start_date = end_date - timedelta(hours=1)
        elif time_range == "24h":
            start_date = end_date - timedelta(hours=24)
        elif time_range == "7d":
            start_date = end_date - timedelta(days=7)
        else:
            start_date = end_date - timedelta(hours=24)

        # Query eventos
        query = self.db.query(AnalyticsEvent).filter(
            and_(
                AnalyticsEvent.created_at >= start_date,
                AnalyticsEvent.created_at <= end_date,
            ),
        )

        if event_types:
            query = query.filter(AnalyticsEvent.event_type.in_(event_types))

        events = query.order_by(AnalyticsEvent.created_at).all()

        # Formatar timeline
        timeline = []
        for event in events:
            timeline.append(
                {
                    "timestamp": event.created_at.isoformat(),
                    "event_type": event.event_type.value,
                    "event_name": event.event_name,
                    "user_id": event.user_id,
                    "properties": event.properties,
                }
            )

        return {
            "timeline": timeline,
            "total_events": len(timeline),
            "time_range": time_range,
        }

    def _get_user_funnel_data(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Obtém dados para funil de usuários"""

        funnel_steps = config.get("steps", [])
        time_range = config.get("time_range", "30d")

        # Calcular período
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30 if time_range == "30d" else 7)

        funnel_data = []

        for i, step in enumerate(funnel_steps):
            event_name = step.get("event_name")

            # Contar usuários únicos que completaram este passo
            user_count = (
                self.db.query(AnalyticsEvent.user_id)
                .filter(
                    and_(
                        AnalyticsEvent.event_name == event_name,
                        AnalyticsEvent.created_at >= start_date,
                        AnalyticsEvent.created_at <= end_date,
                        AnalyticsEvent.user_id.isnot(None),
                    ),
                )
                .distinct()
                .count()
            )

            # Calcular conversão
            conversion_rate = 0
            if i > 0 and funnel_data:
                previous_count = funnel_data[i - 1]["user_count"]
                conversion_rate = (
                    (user_count / previous_count * 100) if previous_count > 0 else 0
                )

            funnel_data.append(
                {
                    "step": step.get("name", f"Step {i+1}"),
                    "event_name": event_name,
                    "user_count": user_count,
                    "conversion_rate": round(conversion_rate, 2),
                }
            )

        return {
            "funnel_data": funnel_data,
            "time_range": time_range,
        }

    def _get_kpi_card_data(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Obtém dados para card de KPI"""

        kpi_type = config.get("kpi_type")
        time_range = config.get("time_range", "30d")

        # Calcular período
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30 if time_range == "30d" else 7)

        if kpi_type == "total_users":
            value = self.db.query(User).count()
            previous_value = (
                self.db.query(User)
                .filter(
                    User.created_at < start_date,
                )
                .count()
            )

        elif kpi_type == "active_users":
            value = (
                self.db.query(AnalyticsEvent.user_id)
                .filter(
                    and_(
                        AnalyticsEvent.created_at >= start_date,
                        AnalyticsEvent.user_id.isnot(None),
                    ),
                )
                .distinct()
                .count()
            )

            previous_start = start_date - (end_date - start_date)
            previous_value = (
                self.db.query(AnalyticsEvent.user_id)
                .filter(
                    and_(
                        AnalyticsEvent.created_at >= previous_start,
                        AnalyticsEvent.created_at < start_date,
                        AnalyticsEvent.user_id.isnot(None),
                    ),
                )
                .distinct()
                .count()
            )

        elif kpi_type == "total_workflows":
            value = self.db.query(Workflow).count()
            previous_value = (
                self.db.query(Workflow)
                .filter(
                    Workflow.created_at < start_date,
                )
                .count()
            )

        else:
            value = 0
            previous_value = 0

        # Calcular mudança percentual
        change_percent = 0
        if previous_value > 0:
            change_percent = ((value - previous_value) / previous_value) * 100

        return {
            "value": value,
            "previous_value": previous_value,
            "change_percent": round(change_percent, 2),
            "trend": (
                "up"
                if change_percent > 0
                else "down" if change_percent < 0 else "stable"
            ),
        }

    def _get_heatmap_data(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Obtém dados para heatmap"""

        # Implementação simplificada - pode ser expandida
        return {
            "data": [],
            "max_value": 0,
            "min_value": 0,
        }

    def _execute_report_query(
        self, query_config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Executa query do relatório"""

        # Implementação simplificada - pode ser expandida com query builder
        query_type = query_config.get("type", "events")

        if query_type == "events":
            events = self.db.query(AnalyticsEvent).limit(1000).all()
            return [
                {
                    "id": event.id,
                    "event_name": event.event_name,
                    "user_id": event.user_id,
                    "created_at": event.created_at.isoformat(),
                }
                for event in events
            ]

        return []

    def _collect_user_data(
        self, user_id: int, date_range: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Coleta dados do usuário para insights"""

        start_date = datetime.fromisoformat(date_range.get("start"))
        end_date = datetime.fromisoformat(date_range.get("end"))

        # Eventos do usuário
        events = (
            self.db.query(AnalyticsEvent)
            .filter(
                and_(
                    AnalyticsEvent.user_id == user_id,
                    AnalyticsEvent.created_at >= start_date,
                    AnalyticsEvent.created_at <= end_date,
                ),
            )
            .all()
        )

        # Métricas comportamentais
        behavior_metrics = (
            self.db.query(UserBehaviorMetric)
            .filter(
                and_(
                    UserBehaviorMetric.user_id == user_id,
                    UserBehaviorMetric.created_at >= start_date,
                    UserBehaviorMetric.created_at <= end_date,
                ),
            )
            .all()
        )

        return {
            "events": events,
            "behavior_metrics": behavior_metrics,
            "date_range": {"start": start_date, "end": end_date},
        }

    def _generate_insights_from_data(
        self, user_data: Dict[str, Any], insight_types: List[str]
    ) -> Dict[str, Any]:
        """Gera insights a partir dos dados do usuário"""

        events = user_data.get("events", [])

        # Análise básica
        total_events = len(events)
        unique_pages = len({event.page_url for event in events if event.page_url})

        insights = []
        recommendations = []

        if "usage_patterns" in insight_types:
            # Padrões de uso
            if total_events > 50:
                insights.append("Usuário altamente ativo com muitas interações")
                recommendations.append("Considere oferecer funcionalidades avançadas")
            elif total_events < 10:
                insights.append("Usuário com baixa atividade")
                recommendations.append("Envie tutoriais ou dicas de uso")

        if "engagement" in insight_types:
            # Engajamento
            if unique_pages > 10:
                insights.append("Usuário explora muitas funcionalidades")
                recommendations.append("Destaque funcionalidades relacionadas")

        return {
            "title": "Insights do Usuário",
            "summary": f"Análise baseada em {total_events} eventos",
            "insights": insights,
            "recommendations": recommendations,
            "metrics": {
                "total_events": total_events,
                "unique_pages": unique_pages,
            },
            "confidence": 0.8,
        }

    def _get_user_metrics(
        self, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Obtém métricas de usuários"""

        total_users = self.db.query(User).count()
        new_users = (
            self.db.query(User)
            .filter(
                and_(
                    User.created_at >= start_date,
                    User.created_at <= end_date,
                ),
            )
            .count()
        )

        active_users = (
            self.db.query(AnalyticsEvent.user_id)
            .filter(
                and_(
                    AnalyticsEvent.created_at >= start_date,
                    AnalyticsEvent.created_at <= end_date,
                    AnalyticsEvent.user_id.isnot(None),
                ),
            )
            .distinct()
            .count()
        )

        return {
            "total_users": total_users,
            "new_users": new_users,
            "active_users": active_users,
            "activation_rate": (active_users / new_users * 100) if new_users > 0 else 0,
        }

    def _get_performance_metrics(
        self, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Obtém métricas de performance"""

        avg_response_time = (
            self.db.query(func.avg(SystemPerformanceMetric.metric_value))
            .filter(
                and_(
                    SystemPerformanceMetric.metric_name == "response_time",
                    SystemPerformanceMetric.created_at >= start_date,
                    SystemPerformanceMetric.created_at <= end_date,
                ),
            )
            .scalar()
            or 0
        )

        return {
            "avg_response_time": round(float(avg_response_time), 2),
            "uptime_percentage": 99.9,  # Placeholder
        }

    def _get_business_metrics(
        self, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Obtém métricas de negócio"""

        total_workflows = (
            self.db.query(Workflow)
            .filter(
                and_(
                    Workflow.created_at >= start_date,
                    Workflow.created_at <= end_date,
                ),
            )
            .count()
        )

        return {
            "new_workflows": total_workflows,
            "revenue": 0,  # Placeholder
        }

    def _analyze_trends(
        self, start_date: datetime, end_date: datetime
    ) -> list[dict[str, Any]]:
        """Analisa tendências"""

        # Implementação simplificada
        return [
            {
                "metric": "user_growth",
                "trend": "increasing",
                "change_percent": 15.5,
            },
        ]

    def _detect_anomalies(
        self, start_date: datetime, end_date: datetime
    ) -> list[dict[str, Any]]:
        """Detecta anomalias"""

        # Implementação simplificada
        return []
