"""
Endpoints da API para Analytics
Criado por José - um desenvolvedor Full Stack
Endpoints para gerenciar analytics e insights
"""

import logging
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime

from synapse.database import get_db
from synapse.models.user import User
from synapse.services.analytics_service import AnalyticsService
from synapse.schemas.analytics import (
    EventCreate,
    EventResponse,
    AnalyticsQuery,
    QueryResponse,
    DashboardCreate,
    DashboardUpdate,
    DashboardResponse,
    DashboardData,
    ReportCreate,
    ReportUpdate,
    ReportResponse,
    ReportExecutionResponse,
    InsightRequest,
    InsightResponse,
    SystemInsights,
    FunnelAnalysis,
    FunnelResult,
    CohortAnalysis,
    CohortResult,
    ABTestConfig,
    ABTestResult,
    ExportRequest,
    ExportResponse,
    RealTimeStats,
    AlertRule,
    AlertResponse,
)
from synapse.api.deps import get_current_user, get_admin_user

logger = logging.getLogger(__name__)
router = APIRouter()

# ==================== EVENTOS ====================


@router.post("/events", response_model=EventResponse, summary="Registrar evento de analytics", tags=["Analytics"])
async def track_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EventResponse:
    """
    Registra um evento de analytics no sistema.
    
    Este endpoint permite rastrear eventos específicos do usuário para análise posterior.
    Os eventos são fundamentais para entender o comportamento dos usuários e gerar insights.
    
    Args:
        event_data: Dados do evento a ser registrado
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        EventResponse: Dados do evento registrado
        
    Raises:
        HTTPException: 400 se os dados do evento são inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Registrando evento {event_data.event_type} para usuário {current_user.id}")
        service = AnalyticsService(db)
        result = service.track_event(event_data, current_user.id)
        logger.info(f"Evento {event_data.event_type} registrado com sucesso para usuário {current_user.id}")
        return result
    except ValueError as e:
        logger.warning(f"Dados inválidos para evento {event_data.event_type}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao registrar evento {event_data.event_type} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/events/batch", summary="Registrar múltiplos eventos", tags=["Analytics"])
async def track_events_batch(
    events: List[EventCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    """
    Registra múltiplos eventos em lote para melhor performance.
    
    Este endpoint é otimizado para registrar vários eventos simultaneamente,
    reduzindo a latência e melhorando a eficiência quando há muitos eventos.
    
    Args:
        events: Lista de eventos a serem registrados
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Quantidade de eventos processados e falhados
        
    Raises:
        HTTPException: 400 se algum evento é inválido
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Registrando {len(events)} eventos em lote para usuário {current_user.id}")
        service = AnalyticsService(db)
        result = service.track_events_batch(events, current_user.id)
        logger.info(f"Lote processado para usuário {current_user.id}: {result['processed']} sucessos, {result['failed']} falhas")
        return {"processed": result["processed"], "failed": result["failed"]}
    except Exception as e:
        logger.error(f"Erro ao processar lote de eventos para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/events", response_model=List[EventResponse], summary="Listar eventos do usuário", tags=["Analytics"])
async def get_events(
    event_type: Optional[str] = Query(None, description="Tipo do evento"),
    start_date: Optional[datetime] = Query(None, description="Data de início"),
    end_date: Optional[datetime] = Query(None, description="Data de fim"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[EventResponse]:
    """
    Obtém eventos do usuário com filtros opcionais.
    
    Permite filtrar eventos por tipo, período e aplicar paginação
    para análise detalhada do comportamento do usuário.
    
    Args:
        event_type: Filtro por tipo de evento (opcional)
        start_date: Data de início do período (opcional)
        end_date: Data de fim do período (opcional)
        limit: Limite de resultados por página
        offset: Offset para paginação
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        List[EventResponse]: Lista de eventos do usuário
        
    Raises:
        HTTPException: 400 se as datas são inválidas
        HTTPException: 500 se erro interno do servidor
    """
    try:
        # Validação de datas
        if start_date and end_date and start_date > end_date:
            raise HTTPException(status_code=400, detail="Data de início deve ser anterior à data de fim")
            
        logger.info(f"Buscando eventos para usuário {current_user.id} - tipo: {event_type}, período: {start_date} a {end_date}")
        service = AnalyticsService(db)
        events = service.get_user_events(
            current_user.id,
            event_type,
            start_date,
            end_date,
            limit,
            offset,
        )
        logger.info(f"Retornados {len(events)} eventos para usuário {current_user.id}")
        return events
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar eventos para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== MÉTRICAS ====================


@router.get("/metrics/user-behavior", summary="Métricas de comportamento do usuário", tags=["Analytics", "Metrics"])
async def get_user_behavior_metrics(
    start_date: datetime = Query(..., description="Data de início"),
    end_date: datetime = Query(..., description="Data de fim"),
    granularity: str = Query("day", pattern="^(hour|day|week|month)$", description="Granularidade dos dados"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Obtém métricas de comportamento do usuário no período especificado.
    
    Analisa padrões de uso, frequência de ações e outros indicadores
    comportamentais para o usuário autenticado.
    
    Args:
        start_date: Data de início da análise
        end_date: Data de fim da análise
        granularity: Granularidade dos dados (hour, day, week, month)
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Métricas de comportamento do usuário
        
    Raises:
        HTTPException: 400 se as datas são inválidas
        HTTPException: 500 se erro interno do servidor
    """
    try:
        if start_date > end_date:
            raise HTTPException(status_code=400, detail="Data de início deve ser anterior à data de fim")
            
        logger.info(f"Gerando métricas de comportamento para usuário {current_user.id} - período: {start_date} a {end_date}")
        service = AnalyticsService(db)
        metrics = service.get_user_behavior_metrics(
            current_user.id,
            start_date,
            end_date,
            granularity,
        )
        logger.info(f"Métricas de comportamento geradas para usuário {current_user.id}")
        return metrics
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar métricas de comportamento para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/metrics/system-performance", summary="Métricas de performance do sistema", tags=["Analytics", "Metrics", "Admin"])
async def get_system_performance_metrics(
    start_date: datetime = Query(..., description="Data de início"),
    end_date: datetime = Query(..., description="Data de fim"),
    granularity: str = Query("hour", pattern="^(minute|hour|day)$", description="Granularidade dos dados"),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Obtém métricas de performance do sistema (apenas para administradores).
    
    Analisa performance, latência, throughput e outros indicadores
    técnicos do sistema para monitoramento operacional.
    
    Args:
        start_date: Data de início da análise
        end_date: Data de fim da análise
        granularity: Granularidade dos dados (minute, hour, day)
        current_admin: Usuário administrador autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Métricas de performance do sistema
        
    Raises:
        HTTPException: 400 se as datas são inválidas
        HTTPException: 403 se usuário não é admin
        HTTPException: 500 se erro interno do servidor
    """
    try:
        if start_date > end_date:
            raise HTTPException(status_code=400, detail="Data de início deve ser anterior à data de fim")
            
        logger.info(f"Gerando métricas de sistema por admin {current_admin.id} - período: {start_date} a {end_date}")
        service = AnalyticsService(db)
        metrics = service.get_system_performance_metrics(start_date, end_date, granularity)
        logger.info(f"Métricas de sistema geradas por admin {current_admin.id}")
        return metrics
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar métricas de sistema por admin {current_admin.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/metrics/business", summary="Métricas de negócio", tags=["Analytics", "Metrics", "Admin"])
async def get_business_metrics(
    start_date: datetime = Query(..., description="Data de início"),
    end_date: datetime = Query(..., description="Data de fim"),
    granularity: str = Query("day", pattern="^(day|week|month)$", description="Granularidade dos dados"),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Obtém métricas de negócio (apenas para administradores).
    
    Analisa indicadores de performance de negócio como receita,
    conversões, retenção e outros KPIs importantes.
    
    Args:
        start_date: Data de início da análise
        end_date: Data de fim da análise
        granularity: Granularidade dos dados (day, week, month)
        current_admin: Usuário administrador autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Métricas de negócio
        
    Raises:
        HTTPException: 400 se as datas são inválidas
        HTTPException: 403 se usuário não é admin
        HTTPException: 500 se erro interno do servidor
    """
    try:
        if start_date > end_date:
            raise HTTPException(status_code=400, detail="Data de início deve ser anterior à data de fim")
            
        logger.info(f"Gerando métricas de negócio por admin {current_admin.id} - período: {start_date} a {end_date}")
        service = AnalyticsService(db)
        metrics = service.get_business_metrics(start_date, end_date, granularity)
        logger.info(f"Métricas de negócio geradas por admin {current_admin.id}")
        return metrics
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar métricas de negócio por admin {current_admin.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/metrics/real-time", response_model=RealTimeStats, summary="Métricas em tempo real", tags=["Analytics", "Metrics"])
async def get_real_time_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RealTimeStats:
    """
    Obtém métricas em tempo real do usuário.
    
    Retorna estatísticas atualizadas sobre atividade recente,
    sessions ativas e outros indicadores em tempo real.
    
    Args:
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        RealTimeStats: Estatísticas em tempo real
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo métricas em tempo real para usuário {current_user.id}")
        service = AnalyticsService(db)
        stats = service.get_real_time_metrics(current_user.id)
        logger.info(f"Métricas em tempo real obtidas para usuário {current_user.id}")
        return stats
    except Exception as e:
        logger.error(f"Erro ao obter métricas em tempo real para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== CONSULTAS CUSTOMIZADAS ====================


@router.post("/queries", response_model=QueryResponse, summary="Executar consulta customizada", tags=["Analytics", "Queries"])
async def execute_analytics_query(
    query: AnalyticsQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QueryResponse:
    """
    Executa uma consulta customizada de analytics.
    
    Permite executar consultas personalizadas para análises
    específicas que não estão cobertas pelos endpoints padrão.
    
    Args:
        query: Dados da consulta a ser executada
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        QueryResponse: Resultado da consulta
        
    Raises:
        HTTPException: 400 se a consulta é inválida
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Executando consulta customizada para usuário {current_user.id}")
        service = AnalyticsService(db)
        result = service.execute_query(query, current_user.id)
        logger.info(f"Consulta customizada executada com sucesso para usuário {current_user.id}")
        return result
    except ValueError as e:
        logger.warning(f"Consulta inválida para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao executar consulta para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/queries/validate", summary="Validar consulta", tags=["Analytics", "Queries"])
async def validate_analytics_query(
    query: AnalyticsQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Valida uma consulta de analytics sem executá-la.
    
    Verifica se a sintaxe e estrutura da consulta estão corretas
    antes da execução, permitindo debug e validação prévia.
    
    Args:
        query: Consulta a ser validada
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Resultado da validação (valid, errors)
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Validando consulta para usuário {current_user.id}")
        service = AnalyticsService(db)
        validation = service.validate_query(query, current_user.id)
        logger.info(f"Validação concluída para usuário {current_user.id}: {validation['valid']}")
        return {"valid": validation["valid"], "errors": validation.get("errors", [])}
    except Exception as e:
        logger.error(f"Erro ao validar consulta para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/queries/saved", summary="Listar consultas salvas", tags=["Analytics", "Queries"])
async def get_saved_queries(
    limit: int = Query(20, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Obtém consultas salvas do usuário.
    
    Retorna lista de consultas que o usuário salvou para reutilização,
    facilitando análises recorrentes.
    
    Args:
        limit: Limite de resultados por página
        offset: Offset para paginação
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Lista de consultas salvas
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo consultas salvas para usuário {current_user.id}")
        service = AnalyticsService(db)
        queries = service.get_saved_queries(current_user.id, limit, offset)
        logger.info(f"Retornadas {len(queries)} consultas salvas para usuário {current_user.id}")
        return queries
    except Exception as e:
        logger.error(f"Erro ao obter consultas salvas para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/queries/save", summary="Salvar consulta", tags=["Analytics", "Queries"])
async def save_query(
    query: AnalyticsQuery,
    name: str = Query(..., description="Nome da consulta"),
    description: Optional[str] = Query(None, description="Descrição"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Salva uma consulta para reutilização.
    
    Permite armazenar consultas customizadas com nome e descrição
    para facilitar análises recorrentes.
    
    Args:
        query: Consulta a ser salva
        name: Nome da consulta
        description: Descrição opcional
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Dados da consulta salva
        
    Raises:
        HTTPException: 400 se nome já existe
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Salvando consulta '{name}' para usuário {current_user.id}")
        service = AnalyticsService(db)
        saved_query = service.save_query(query, name, description, current_user.id)
        logger.info(f"Consulta '{name}' salva com sucesso para usuário {current_user.id}")
        return saved_query
    except ValueError as e:
        logger.warning(f"Erro ao salvar consulta '{name}' para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao salvar consulta '{name}' para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== DASHBOARDS ====================


@router.post("/dashboards", response_model=DashboardResponse, summary="Criar dashboard", tags=["Analytics", "Dashboards"])
async def create_dashboard(
    dashboard_data: DashboardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    """
    Cria um novo dashboard personalizado.
    
    Permite criar dashboards customizados com widgets e visualizações
    específicas para análises personalizadas.
    
    Args:
        dashboard_data: Dados do dashboard a ser criado
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        DashboardResponse: Dashboard criado
        
    Raises:
        HTTPException: 400 se dados são inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Criando dashboard '{dashboard_data.name}' para usuário {current_user.id}")
        service = AnalyticsService(db)
        dashboard = service.create_dashboard(dashboard_data, current_user.id)
        logger.info(f"Dashboard '{dashboard_data.name}' criado com sucesso para usuário {current_user.id}")
        return dashboard
    except ValueError as e:
        logger.warning(f"Dados inválidos para dashboard '{dashboard_data.name}': {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao criar dashboard '{dashboard_data.name}' para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/dashboards", response_model=List[DashboardResponse], summary="Listar dashboards do usuário", tags=["Analytics", "Dashboards"])
async def get_user_dashboards(
    limit: int = Query(20, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[DashboardResponse]:
    """
    Obtém dashboards do usuário com paginação.
    
    Retorna lista de todos os dashboards criados pelo usuário,
    permitindo navegação paginada.
    
    Args:
        limit: Limite de resultados por página
        offset: Offset para paginação
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        List[DashboardResponse]: Lista de dashboards do usuário
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Listando dashboards para usuário {current_user.id} - limite: {limit}, offset: {offset}")
        service = AnalyticsService(db)
        dashboards = service.get_user_dashboards(current_user.id, limit, offset)
        logger.info(f"Retornados {len(dashboards)} dashboards para usuário {current_user.id}")
        return dashboards
    except Exception as e:
        logger.error(f"Erro ao listar dashboards para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/dashboards/{dashboard_id}", response_model=DashboardResponse, summary="Obter dashboard específico", tags=["Analytics", "Dashboards"])
async def get_dashboard(
    dashboard_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    """
    Obtém detalhes de um dashboard específico.
    
    Retorna todas as informações de um dashboard, incluindo
    widgets, configurações e dados associados.
    
    Args:
        dashboard_id: ID do dashboard
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        DashboardResponse: Dados do dashboard
        
    Raises:
        HTTPException: 404 se dashboard não encontrado
        HTTPException: 403 se sem permissão de acesso
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo dashboard {dashboard_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        dashboard = service.get_dashboard(dashboard_id, current_user.id)
        if not dashboard:
            logger.warning(f"Dashboard {dashboard_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Dashboard não encontrado")
        logger.info(f"Dashboard {dashboard_id} obtido com sucesso para usuário {current_user.id}")
        return dashboard
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter dashboard {dashboard_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/dashboards/{dashboard_id}", response_model=DashboardResponse, summary="Atualizar dashboard", tags=["Analytics", "Dashboards"])
async def update_dashboard(
    dashboard_id: int,
    dashboard_data: DashboardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    """
    Atualiza um dashboard existente.
    
    Permite modificar nome, descrição, widgets e configurações
    de um dashboard existente do usuário.
    
    Args:
        dashboard_id: ID do dashboard
        dashboard_data: Dados atualizados do dashboard
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        DashboardResponse: Dashboard atualizado
        
    Raises:
        HTTPException: 404 se dashboard não encontrado
        HTTPException: 403 se sem permissão de edição
        HTTPException: 400 se dados inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Atualizando dashboard {dashboard_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        dashboard = service.update_dashboard(dashboard_id, dashboard_data, current_user.id)
        if not dashboard:
            logger.warning(f"Dashboard {dashboard_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Dashboard não encontrado")
        logger.info(f"Dashboard {dashboard_id} atualizado com sucesso para usuário {current_user.id}")
        return dashboard
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Dados inválidos ao atualizar dashboard {dashboard_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao atualizar dashboard {dashboard_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/dashboards/{dashboard_id}", summary="Deletar dashboard", tags=["Analytics", "Dashboards"])
async def delete_dashboard(
    dashboard_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Remove um dashboard do usuário.
    
    Exclui permanentemente um dashboard e todos os seus dados
    associados (widgets, configurações, etc.).
    
    Args:
        dashboard_id: ID do dashboard
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Mensagem de confirmação
        
    Raises:
        HTTPException: 404 se dashboard não encontrado
        HTTPException: 403 se sem permissão de exclusão
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Deletando dashboard {dashboard_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        success = service.delete_dashboard(dashboard_id, current_user.id)
        if not success:
            logger.warning(f"Dashboard {dashboard_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Dashboard não encontrado")
        logger.info(f"Dashboard {dashboard_id} deletado com sucesso para usuário {current_user.id}")
        return {"message": "Dashboard deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar dashboard {dashboard_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/dashboards/{dashboard_id}/data", response_model=DashboardData, summary="Obter dados do dashboard", tags=["Analytics", "Dashboards"])
async def get_dashboard_data(
    dashboard_id: int,
    refresh: bool = Query(False, description="Forçar atualização dos dados"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardData:
    """
    Obtém dados atualizados de um dashboard.
    
    Retorna os dados processados de todos os widgets do dashboard,
    com opção de forçar atualização do cache.
    
    Args:
        dashboard_id: ID do dashboard
        refresh: Se deve forçar atualização dos dados
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        DashboardData: Dados do dashboard
        
    Raises:
        HTTPException: 404 se dashboard não encontrado
        HTTPException: 403 se sem permissão de acesso
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo dados do dashboard {dashboard_id} para usuário {current_user.id} - refresh: {refresh}")
        service = AnalyticsService(db)
        data = service.get_dashboard_data(dashboard_id, current_user.id, refresh)
        if not data:
            logger.warning(f"Dashboard {dashboard_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Dashboard não encontrado")
        logger.info(f"Dados do dashboard {dashboard_id} obtidos com sucesso para usuário {current_user.id}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter dados do dashboard {dashboard_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/dashboards/{dashboard_id}/share", summary="Compartilhar dashboard", tags=["Analytics", "Dashboards"])
async def share_dashboard(
    dashboard_id: int,
    public: bool = Query(True, description="Tornar público"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Configura compartilhamento de um dashboard.
    
    Permite tornar um dashboard público ou privado,
    gerando links de compartilhamento quando necessário.
    
    Args:
        dashboard_id: ID do dashboard
        public: Se deve tornar o dashboard público
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Status do compartilhamento e link público (se aplicável)
        
    Raises:
        HTTPException: 404 se dashboard não encontrado
        HTTPException: 403 se sem permissão de compartilhamento
        HTTPException: 500 se erro interno do servidor
    """
    try:
        action = "público" if public else "privado"
        logger.info(f"Configurando dashboard {dashboard_id} como {action} para usuário {current_user.id}")
        service = AnalyticsService(db)
        result = service.share_dashboard(dashboard_id, current_user.id, public)
        if not result:
            logger.warning(f"Dashboard {dashboard_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Dashboard não encontrado")
        logger.info(f"Dashboard {dashboard_id} configurado como {action} para usuário {current_user.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao compartilhar dashboard {dashboard_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== RELATÓRIOS ====================


@router.post("/reports", response_model=ReportResponse, summary="Criar relatório", tags=["Analytics", "Reports"])
async def create_report(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    """
    Cria um novo relatório personalizado.
    
    Permite criar relatórios automatizados com agendamento
    e configurações específicas de análise.
    
    Args:
        report_data: Dados do relatório a ser criado
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        ReportResponse: Relatório criado
        
    Raises:
        HTTPException: 400 se dados são inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Criando relatório '{report_data.name}' para usuário {current_user.id}")
        service = AnalyticsService(db)
        report = service.create_report(report_data, current_user.id)
        logger.info(f"Relatório '{report_data.name}' criado com sucesso para usuário {current_user.id}")
        return report
    except ValueError as e:
        logger.warning(f"Dados inválidos para relatório '{report_data.name}': {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao criar relatório '{report_data.name}' para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/reports", response_model=List[ReportResponse], summary="Listar relatórios do usuário", tags=["Analytics", "Reports"])
async def get_user_reports(
    status: Optional[str] = Query(
        None, pattern="^(draft|scheduled|running|completed|failed)$", description="Filtrar por status"
    ),
    limit: int = Query(20, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ReportResponse]:
    """
    Obtém relatórios do usuário com filtros.
    
    Lista relatórios criados pelo usuário com opção de
    filtrar por status e aplicar paginação.
    
    Args:
        status: Filtro por status do relatório (opcional)
        limit: Limite de resultados por página
        offset: Offset para paginação
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        List[ReportResponse]: Lista de relatórios
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Listando relatórios para usuário {current_user.id} - status: {status}, limite: {limit}")
        service = AnalyticsService(db)
        reports = service.get_user_reports(current_user.id, status, limit, offset)
        logger.info(f"Retornados {len(reports)} relatórios para usuário {current_user.id}")
        return reports
    except Exception as e:
        logger.error(f"Erro ao listar relatórios para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/reports/{report_id}", response_model=ReportResponse, summary="Obter relatório específico", tags=["Analytics", "Reports"])
async def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    """
    Obtém detalhes de um relatório específico.
    
    Retorna informações completas sobre um relatório,
    incluindo configurações, status e histórico.
    
    Args:
        report_id: ID do relatório
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        ReportResponse: Dados do relatório
        
    Raises:
        HTTPException: 404 se relatório não encontrado
        HTTPException: 403 se sem permissão de acesso
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo relatório {report_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        report = service.get_report(report_id, current_user.id)
        if not report:
            logger.warning(f"Relatório {report_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Relatório não encontrado")
        logger.info(f"Relatório {report_id} obtido com sucesso para usuário {current_user.id}")
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter relatório {report_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/reports/{report_id}", response_model=ReportResponse, summary="Atualizar relatório", tags=["Analytics", "Reports"])
async def update_report(
    report_id: int,
    report_data: ReportUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    """
    Atualiza um relatório existente.
    
    Permite modificar configurações, agendamento e
    parâmetros de um relatório existente.
    
    Args:
        report_id: ID do relatório
        report_data: Dados atualizados do relatório
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        ReportResponse: Relatório atualizado
        
    Raises:
        HTTPException: 404 se relatório não encontrado
        HTTPException: 403 se sem permissão de edição
        HTTPException: 400 se dados inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Atualizando relatório {report_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        report = service.update_report(report_id, report_data, current_user.id)
        if not report:
            logger.warning(f"Relatório {report_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Relatório não encontrado")
        logger.info(f"Relatório {report_id} atualizado com sucesso para usuário {current_user.id}")
        return report
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Dados inválidos ao atualizar relatório {report_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao atualizar relatório {report_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/reports/{report_id}", summary="Deletar relatório", tags=["Analytics", "Reports"])
async def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Remove um relatório do usuário.
    
    Exclui permanentemente um relatório e seu histórico
    de execuções, cancelando agendamentos futuros.
    
    Args:
        report_id: ID do relatório
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Mensagem de confirmação
        
    Raises:
        HTTPException: 404 se relatório não encontrado
        HTTPException: 403 se sem permissão de exclusão
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Deletando relatório {report_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        success = service.delete_report(report_id, current_user.id)
        if not success:
            logger.warning(f"Relatório {report_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Relatório não encontrado")
        logger.info(f"Relatório {report_id} deletado com sucesso para usuário {current_user.id}")
        return {"message": "Relatório deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar relatório {report_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/reports/{report_id}/execute", response_model=ReportExecutionResponse, summary="Executar relatório", tags=["Analytics", "Reports"])
async def execute_report(
    report_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportExecutionResponse:
    """
    Executa um relatório em background.
    
    Inicia a execução de um relatório configurado, processando
    em background para não bloquear a resposta da API.
    
    Args:
        report_id: ID do relatório
        background_tasks: Tarefas em background do FastAPI
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        ReportExecutionResponse: Dados da execução iniciada
        
    Raises:
        HTTPException: 404 se relatório não encontrado
        HTTPException: 403 se sem permissão de execução
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Executando relatório {report_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        execution = service.execute_report(report_id, current_user.id)
        if not execution:
            logger.warning(f"Relatório {report_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Relatório não encontrado")
        
        # Executar relatório em background
        background_tasks.add_task(service.process_report_execution, execution.id)
        logger.info(f"Execução {execution.id} do relatório {report_id} iniciada em background para usuário {current_user.id}")
        return execution
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao executar relatório {report_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/reports/{report_id}/executions", response_model=List[ReportExecutionResponse], summary="Histórico de execuções", tags=["Analytics", "Reports"])
async def get_report_executions(
    report_id: int,
    limit: int = Query(10, ge=1, le=50, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ReportExecutionResponse]:
    """
    Obtém histórico de execuções de um relatório.
    
    Lista todas as execuções passadas de um relatório específico
    com informações de status, duração e resultados.
    
    Args:
        report_id: ID do relatório
        limit: Limite de resultados por página
        offset: Offset para paginação
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        List[ReportExecutionResponse]: Lista de execuções
        
    Raises:
        HTTPException: 404 se relatório não encontrado
        HTTPException: 403 se sem permissão de acesso
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo execuções do relatório {report_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        executions = service.get_report_executions(report_id, current_user.id, limit, offset)
        if executions is None:
            logger.warning(f"Relatório {report_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Relatório não encontrado")
        logger.info(f"Retornadas {len(executions)} execuções do relatório {report_id} para usuário {current_user.id}")
        return executions
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter execuções do relatório {report_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== INSIGHTS ====================


@router.post("/insights", response_model=InsightResponse, summary="Gerar insights personalizados", tags=["Analytics", "Insights"])
async def generate_insights(
    insight_request: InsightRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InsightResponse:
    """
    Gera insights personalizados baseados em dados do usuário.
    
    Analisa dados do usuário para gerar insights inteligentes
    e recomendações baseadas em padrões identificados.
    
    Args:
        insight_request: Configuração do insight a ser gerado
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        InsightResponse: Insights gerados
        
    Raises:
        HTTPException: 400 se configuração inválida
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Gerando insights personalizados para usuário {current_user.id}")
        service = AnalyticsService(db)
        insights = service.generate_insights(insight_request, current_user.id)
        logger.info(f"Insights gerados com sucesso para usuário {current_user.id}")
        return insights
    except ValueError as e:
        logger.warning(f"Configuração inválida para insights do usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao gerar insights para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/insights/system", response_model=SystemInsights, summary="Insights do sistema", tags=["Analytics", "Insights", "Admin"])
async def get_system_insights(
    days: int = Query(7, ge=1, le=90, description="Período em dias"),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> SystemInsights:
    """
    Obtém insights do sistema (apenas para administradores).
    
    Analisa métricas globais do sistema para identificar
    tendências, problemas e oportunidades de melhoria.
    
    Args:
        days: Período de análise em dias
        current_admin: Usuário administrador autenticado
        db: Sessão do banco de dados
        
    Returns:
        SystemInsights: Insights do sistema
        
    Raises:
        HTTPException: 403 se usuário não é admin
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Gerando insights do sistema para {days} dias por admin {current_admin.id}")
        service = AnalyticsService(db)
        insights = service.get_system_insights(days)
        logger.info(f"Insights do sistema gerados por admin {current_admin.id}")
        return insights
    except Exception as e:
        logger.error(f"Erro ao gerar insights do sistema por admin {current_admin.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/insights/user", summary="Insights do usuário", tags=["Analytics", "Insights"])
async def get_user_insights(
    days: int = Query(30, ge=1, le=365, description="Período em dias"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Obtém insights personalizados do usuário.
    
    Analisa comportamento e padrões específicos do usuário
    para gerar insights e recomendações personalizadas.
    
    Args:
        days: Período de análise em dias
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Insights do usuário
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Gerando insights pessoais para {days} dias do usuário {current_user.id}")
        service = AnalyticsService(db)
        insights = service.get_user_insights(current_user.id, days)
        logger.info(f"Insights pessoais gerados para usuário {current_user.id}")
        return insights
    except Exception as e:
        logger.error(f"Erro ao gerar insights pessoais para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/insights/trends", summary="Insights de tendências", tags=["Analytics", "Insights"])
async def get_trending_insights(
    category: Optional[str] = Query(None, description="Categoria de insights"),
    limit: int = Query(10, ge=1, le=50, description="Limite de resultados"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Obtém insights sobre tendências e padrões emergentes.
    
    Identifica tendências e padrões interessantes nos dados
    que podem ser relevantes para o usuário.
    
    Args:
        category: Categoria específica de insights (opcional)
        limit: Limite de insights retornados
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Insights de tendências
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo insights de tendências para usuário {current_user.id} - categoria: {category}")
        service = AnalyticsService(db)
        insights = service.get_trending_insights(current_user.id, category, limit)
        logger.info(f"Insights de tendências obtidos para usuário {current_user.id}")
        return insights
    except Exception as e:
        logger.error(f"Erro ao obter insights de tendências para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== ANÁLISES AVANÇADAS ====================


@router.post("/analysis/funnel", response_model=FunnelResult, summary="Análise de funil", tags=["Analytics", "Analysis"])
async def analyze_funnel(
    funnel_config: FunnelAnalysis,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FunnelResult:
    """
    Executa análise de funil de conversão.
    
    Analisa a jornada do usuário através de diferentes etapas
    para identificar pontos de conversão e abandono.
    
    Args:
        funnel_config: Configuração da análise de funil
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        FunnelResult: Resultados da análise de funil
        
    Raises:
        HTTPException: 400 se configuração inválida
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Executando análise de funil para usuário {current_user.id}")
        service = AnalyticsService(db)
        result = service.analyze_funnel(funnel_config, current_user.id)
        logger.info(f"Análise de funil concluída para usuário {current_user.id}")
        return result
    except ValueError as e:
        logger.warning(f"Configuração inválida para análise de funil do usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro na análise de funil para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/analysis/cohort", response_model=CohortResult, summary="Análise de coorte", tags=["Analytics", "Analysis"])
async def analyze_cohort(
    cohort_config: CohortAnalysis,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CohortResult:
    """
    Executa análise de coorte para retenção de usuários.
    
    Analisa grupos de usuários baseados em períodos específicos
    para entender padrões de retenção e comportamento.
    
    Args:
        cohort_config: Configuração da análise de coorte
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        CohortResult: Resultados da análise de coorte
        
    Raises:
        HTTPException: 400 se configuração inválida
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Executando análise de coorte para usuário {current_user.id}")
        service = AnalyticsService(db)
        result = service.analyze_cohort(cohort_config, current_user.id)
        logger.info(f"Análise de coorte concluída para usuário {current_user.id}")
        return result
    except ValueError as e:
        logger.warning(f"Configuração inválida para análise de coorte do usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro na análise de coorte para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/analysis/ab-test", response_model=ABTestResult, summary="Análise de teste A/B", tags=["Analytics", "Analysis"])
async def analyze_ab_test(
    test_config: ABTestConfig,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ABTestResult:
    """
    Executa análise de teste A/B.
    
    Analisa resultados de testes A/B para determinar
    significância estatística e performance de variantes.
    
    Args:
        test_config: Configuração do teste A/B
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        ABTestResult: Resultados da análise A/B
        
    Raises:
        HTTPException: 400 se configuração inválida
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Executando análise A/B para usuário {current_user.id}")
        service = AnalyticsService(db)
        result = service.analyze_ab_test(test_config, current_user.id)
        logger.info(f"Análise A/B concluída para usuário {current_user.id}")
        return result
    except ValueError as e:
        logger.warning(f"Configuração inválida para análise A/B do usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro na análise A/B para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/analysis/correlation", summary="Análise de correlação", tags=["Analytics", "Analysis"])
async def analyze_correlation(
    metric1: str = Query(..., description="Primeira métrica"),
    metric2: str = Query(..., description="Segunda métrica"),
    start_date: datetime = Query(..., description="Data de início"),
    end_date: datetime = Query(..., description="Data de fim"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Executa análise de correlação entre duas métricas.
    
    Calcula a correlação estatística entre duas métricas
    no período especificado para identificar relacionamentos.
    
    Args:
        metric1: Nome da primeira métrica
        metric2: Nome da segunda métrica
        start_date: Data de início da análise
        end_date: Data de fim da análise
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Resultados da análise de correlação
        
    Raises:
        HTTPException: 400 se parâmetros inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        if start_date > end_date:
            raise HTTPException(status_code=400, detail="Data de início deve ser anterior à data de fim")
            
        logger.info(f"Analisando correlação entre {metric1} e {metric2} para usuário {current_user.id}")
        service = AnalyticsService(db)
        result = service.analyze_correlation(metric1, metric2, start_date, end_date, current_user.id)
        logger.info(f"Análise de correlação concluída para usuário {current_user.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na análise de correlação para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/analysis/anomalies", summary="Detecção de anomalias", tags=["Analytics", "Analysis"])
async def detect_anomalies(
    metric: str = Query(..., description="Métrica para análise"),
    days: int = Query(30, ge=7, le=365, description="Período em dias"),
    sensitivity: float = Query(0.95, ge=0.8, le=0.99, description="Sensibilidade"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Detecta anomalias em uma métrica específica.
    
    Utiliza algoritmos de detecção de anomalias para identificar
    pontos de dados incomuns que podem indicar problemas ou oportunidades.
    
    Args:
        metric: Nome da métrica para análise
        days: Período de análise em dias
        sensitivity: Sensibilidade da detecção (0.8-0.99)
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Anomalias detectadas
        
    Raises:
        HTTPException: 400 se parâmetros inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Detectando anomalias na métrica {metric} para usuário {current_user.id} - {days} dias, sensibilidade {sensitivity}")
        service = AnalyticsService(db)
        anomalies = service.detect_anomalies(metric, days, sensitivity, current_user.id)
        logger.info(f"Detecção de anomalias concluída para usuário {current_user.id}")
        return anomalies
    except ValueError as e:
        logger.warning(f"Parâmetros inválidos para detecção de anomalias do usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro na detecção de anomalias para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== EXPORTAÇÕES ====================


@router.post("/export", response_model=ExportResponse, summary="Exportar dados", tags=["Analytics", "Export"])
async def export_data(
    export_request: ExportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExportResponse:
    """
    Inicia exportação de dados em background.
    
    Cria uma tarefa de exportação que será processada em background,
    permitindo gerar arquivos grandes sem bloquear a API.
    
    Args:
        export_request: Configuração da exportação
        background_tasks: Tarefas em background do FastAPI
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        ExportResponse: Dados da exportação iniciada
        
    Raises:
        HTTPException: 400 se configuração inválida
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Iniciando exportação de dados para usuário {current_user.id} - formato: {export_request.format}")
        service = AnalyticsService(db)
        export_task = service.create_export_task(export_request, current_user.id)
        
        # Processar exportação em background
        background_tasks.add_task(service.process_export, export_task.id)
        logger.info(f"Exportação {export_task.id} iniciada em background para usuário {current_user.id}")
        return export_task
    except ValueError as e:
        logger.warning(f"Configuração inválida para exportação do usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao iniciar exportação para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/exports", response_model=List[ExportResponse], summary="Listar exportações do usuário", tags=["Analytics", "Export"])
async def get_user_exports(
    status: Optional[str] = Query(None, pattern="^(pending|processing|completed|failed)$", description="Filtrar por status"),
    limit: int = Query(20, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ExportResponse]:
    """
    Obtém histórico de exportações do usuário.
    
    Lista todas as exportações criadas pelo usuário com opção
    de filtrar por status e aplicar paginação.
    
    Args:
        status: Filtro por status da exportação (opcional)
        limit: Limite de resultados por página
        offset: Offset para paginação
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        List[ExportResponse]: Lista de exportações
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Listando exportações para usuário {current_user.id} - status: {status}")
        service = AnalyticsService(db)
        exports = service.get_user_exports(current_user.id, status, limit, offset)
        logger.info(f"Retornadas {len(exports)} exportações para usuário {current_user.id}")
        return exports
    except Exception as e:
        logger.error(f"Erro ao listar exportações para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/exports/{export_id}/download", summary="Download de exportação", tags=["Analytics", "Export"])
async def download_export(
    export_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Faz download de uma exportação concluída.
    
    Permite baixar o arquivo gerado por uma exportação,
    verificando permissões e disponibilidade do arquivo.
    
    Args:
        export_id: ID da exportação
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        FileResponse: Arquivo da exportação
        
    Raises:
        HTTPException: 404 se exportação não encontrada
        HTTPException: 403 se sem permissão de download
        HTTPException: 400 se exportação não concluída
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Iniciando download da exportação {export_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        file_response = service.download_export(export_id, current_user.id)
        if not file_response:
            logger.warning(f"Exportação {export_id} não encontrada ou não disponível para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Exportação não encontrada ou não disponível")
        logger.info(f"Download da exportação {export_id} concluído para usuário {current_user.id}")
        return file_response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no download da exportação {export_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== ALERTAS ====================


@router.post("/alerts", response_model=AlertResponse, summary="Criar alerta", tags=["Analytics", "Alerts"])
async def create_alert(
    alert_rule: AlertRule,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AlertResponse:
    """
    Cria um novo alerta personalizado.
    
    Configura alertas automáticos baseados em métricas específicas
    para notificar quando condições são atingidas.
    
    Args:
        alert_rule: Configuração da regra de alerta
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        AlertResponse: Alerta criado
        
    Raises:
        HTTPException: 400 se configuração inválida
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Criando alerta '{alert_rule.name}' para usuário {current_user.id}")
        service = AnalyticsService(db)
        alert = service.create_alert(alert_rule, current_user.id)
        logger.info(f"Alerta '{alert_rule.name}' criado com sucesso para usuário {current_user.id}")
        return alert
    except ValueError as e:
        logger.warning(f"Configuração inválida para alerta '{alert_rule.name}': {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao criar alerta '{alert_rule.name}' para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/alerts", response_model=List[AlertResponse], summary="Listar alertas do usuário", tags=["Analytics", "Alerts"])
async def get_user_alerts(
    status: Optional[str] = Query(None, pattern="^(active|paused|triggered)$", description="Filtrar por status"),
    limit: int = Query(20, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[AlertResponse]:
    """
    Obtém alertas do usuário com filtros.
    
    Lista alertas criados pelo usuário com opção de filtrar
    por status e aplicar paginação.
    
    Args:
        status: Filtro por status do alerta (opcional)
        limit: Limite de resultados por página
        offset: Offset para paginação
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        List[AlertResponse]: Lista de alertas
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Listando alertas para usuário {current_user.id} - status: {status}")
        service = AnalyticsService(db)
        alerts = service.get_user_alerts(current_user.id, status, limit, offset)
        logger.info(f"Retornados {len(alerts)} alertas para usuário {current_user.id}")
        return alerts
    except Exception as e:
        logger.error(f"Erro ao listar alertas para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/alerts/{alert_id}", response_model=AlertResponse, summary="Atualizar alerta", tags=["Analytics", "Alerts"])
async def update_alert(
    alert_id: int,
    alert_rule: AlertRule,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AlertResponse:
    """
    Atualiza configuração de um alerta existente.
    
    Permite modificar regras, condições e configurações
    de notificação de um alerta existente.
    
    Args:
        alert_id: ID do alerta
        alert_rule: Nova configuração do alerta
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        AlertResponse: Alerta atualizado
        
    Raises:
        HTTPException: 404 se alerta não encontrado
        HTTPException: 403 se sem permissão de edição
        HTTPException: 400 se configuração inválida
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Atualizando alerta {alert_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        alert = service.update_alert(alert_id, alert_rule, current_user.id)
        if not alert:
            logger.warning(f"Alerta {alert_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        logger.info(f"Alerta {alert_id} atualizado com sucesso para usuário {current_user.id}")
        return alert
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Configuração inválida ao atualizar alerta {alert_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao atualizar alerta {alert_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/alerts/{alert_id}", summary="Deletar alerta", tags=["Analytics", "Alerts"])
async def delete_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Remove um alerta do usuário.
    
    Exclui permanentemente um alerta e para todas as
    notificações associadas a ele.
    
    Args:
        alert_id: ID do alerta
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Mensagem de confirmação
        
    Raises:
        HTTPException: 404 se alerta não encontrado
        HTTPException: 403 se sem permissão de exclusão
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Deletando alerta {alert_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        success = service.delete_alert(alert_id, current_user.id)
        if not success:
            logger.warning(f"Alerta {alert_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        logger.info(f"Alerta {alert_id} deletado com sucesso para usuário {current_user.id}")
        return {"message": "Alerta removido com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar alerta {alert_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/alerts/{alert_id}/pause", summary="Pausar alerta", tags=["Analytics", "Alerts"])
async def pause_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Pausa temporariamente um alerta.
    
    Desativa as notificações de um alerta sem removê-lo,
    permitindo reativação posterior.
    
    Args:
        alert_id: ID do alerta
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Mensagem de confirmação
        
    Raises:
        HTTPException: 404 se alerta não encontrado
        HTTPException: 403 se sem permissão de controle
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Pausando alerta {alert_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        success = service.pause_alert(alert_id, current_user.id)
        if not success:
            logger.warning(f"Alerta {alert_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        logger.info(f"Alerta {alert_id} pausado com sucesso para usuário {current_user.id}")
        return {"message": "Alerta pausado"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao pausar alerta {alert_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/alerts/{alert_id}/resume", summary="Reativar alerta", tags=["Analytics", "Alerts"])
async def resume_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Reativa um alerta pausado.
    
    Retoma as notificações de um alerta que estava pausado,
    voltando ao monitoramento normal.
    
    Args:
        alert_id: ID do alerta
        current_user: Usuário autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Mensagem de confirmação
        
    Raises:
        HTTPException: 404 se alerta não encontrado
        HTTPException: 403 se sem permissão de controle
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Reativando alerta {alert_id} para usuário {current_user.id}")
        service = AnalyticsService(db)
        success = service.resume_alert(alert_id, current_user.id)
        if not success:
            logger.warning(f"Alerta {alert_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        logger.info(f"Alerta {alert_id} reativado com sucesso para usuário {current_user.id}")
        return {"message": "Alerta retomado"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao reativar alerta {alert_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== ADMINISTRAÇÃO ====================


@router.get("/admin/stats", summary="Estatísticas administrativas", tags=["Analytics", "Admin"])
async def get_admin_analytics_stats(
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Obtém estatísticas administrativas do sistema analytics.
    
    Retorna métricas globais sobre uso, performance e recursos
    do sistema analytics para administradores.
    
    Args:
        current_admin: Usuário administrador autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Estatísticas administrativas
        
    Raises:
        HTTPException: 403 se usuário não é admin
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo estatísticas administrativas por admin {current_admin.id}")
        service = AnalyticsService(db)
        stats = service.get_admin_stats()
        logger.info(f"Estatísticas administrativas obtidas por admin {current_admin.id}")
        return stats
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas administrativas por admin {current_admin.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/admin/cleanup", summary="Limpeza de dados antigos", tags=["Analytics", "Admin"])
async def cleanup_old_data(
    days: int = Query(90, ge=30, le=365, description="Manter dados dos últimos N dias"),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    Remove dados antigos do sistema analytics.
    
    Executa limpeza de dados antigos baseado no período especificado
    para manter performance e controlar uso de armazenamento.
    
    Args:
        days: Manter dados dos últimos N dias
        current_admin: Usuário administrador autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Resultado da limpeza (registros removidos)
        
    Raises:
        HTTPException: 403 se usuário não é admin
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Iniciando limpeza de dados antigos (>{days} dias) por admin {current_admin.id}")
        service = AnalyticsService(db)
        result = service.cleanup_old_data(days)
        logger.info(f"Limpeza concluída por admin {current_admin.id}: {result['removed']} registros removidos")
        return result
    except Exception as e:
        logger.error(f"Erro na limpeza de dados por admin {current_admin.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/admin/recompute-metrics", summary="Recomputar métricas", tags=["Analytics", "Admin"])
async def recompute_metrics(
    background_tasks: BackgroundTasks,
    start_date: datetime = Query(..., description="Data de início"),
    end_date: datetime = Query(..., description="Data de fim"),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Força recomputação de métricas para um período.
    
    Recalcula todas as métricas agregadas para o período especificado,
    útil para correção de dados ou após mudanças na lógica de cálculo.
    
    Args:
        background_tasks: Tarefas em background do FastAPI
        start_date: Data de início do reprocessamento
        end_date: Data de fim do reprocessamento
        current_admin: Usuário administrador autenticado
        db: Sessão do banco de dados
        
    Returns:
        dict: Confirmação de início do reprocessamento
        
    Raises:
        HTTPException: 400 se datas inválidas
        HTTPException: 403 se usuário não é admin
        HTTPException: 500 se erro interno do servidor
    """
    try:
        if start_date > end_date:
            raise HTTPException(status_code=400, detail="Data de início deve ser anterior à data de fim")
            
        logger.info(f"Iniciando recomputação de métricas ({start_date} a {end_date}) por admin {current_admin.id}")
        service = AnalyticsService(db)
        
        # Executar recomputação em background
        background_tasks.add_task(service.recompute_metrics, start_date, end_date)
        logger.info(f"Recomputação de métricas iniciada em background por admin {current_admin.id}")
        
        return {"message": "Recomputação iniciada em background"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao iniciar recomputação por admin {current_admin.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
