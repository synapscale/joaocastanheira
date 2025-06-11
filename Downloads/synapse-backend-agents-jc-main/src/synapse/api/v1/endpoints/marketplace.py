"""
Endpoints da API para Marketplace
Criado por José - um desenvolvedor Full Stack
API completa para marketplace de componentes e templates
"""

import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from datetime import datetime

from synapse.database import get_db
from synapse.models.user import User
from synapse.services.marketplace_service import MarketplaceService
from synapse.schemas.marketplace import (
    ComponentCreate,
    ComponentUpdate,
    ComponentResponse,
    ComponentSearch,
    ComponentSearchResponse,
    RatingCreate,
    RatingResponse,
    RatingStats,
    PurchaseCreate,
    PurchaseResponse,
    ComponentVersionResponse,
    MarketplaceStats,
    BulkComponentOperation,
    BulkOperationResponse,
    ComponentModerationResponse,
    ModerationAction,
)
from synapse.api.deps import get_current_user, get_admin_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

# ==================== COMPONENTES ====================

@router.post("/components", response_model=ComponentResponse, summary="Criar componente", tags=["Marketplace", "Components"])
async def create_component(
    component_data: ComponentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ComponentResponse:
    """Cria um novo componente no marketplace"""
    try:
        logger.info(f"Criando componente '{component_data.name}' para usuário {current_user.id}")
        service = MarketplaceService(db)
        result = service.create_component(component_data, current_user.id)
        logger.info(f"Componente criado com sucesso - ID: {result.id}")
        return result
    except Exception as e:
        logger.error(f"Erro ao criar componente para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/components", response_model=ComponentSearchResponse, summary="Buscar componentes", tags=["Marketplace", "Components"])
async def search_components(
    query: Optional[str] = Query(None, description="Termo de busca"),
    category: Optional[str] = Query(None, description="Categoria do componente"),
    component_type: Optional[str] = Query(None, description="Tipo do componente"),
    tags: Optional[List[str]] = Query(None, description="Tags para filtrar"),
    is_free: Optional[bool] = Query(None, description="Apenas componentes gratuitos"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Rating mínimo"),
    max_price: Optional[float] = Query(None, ge=0, description="Preço máximo"),
    sort_by: Optional[str] = Query("popularity", description="Ordenação"),
    limit: int = Query(20, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    db: Session = Depends(get_db),
) -> ComponentSearchResponse:
    """Busca componentes no marketplace"""
    try:
        logger.info(f"Busca de componentes - query: '{query}', categoria: {category}, limit: {limit}")
        
        search_params = ComponentSearch(
            query=query,
            category=category,
            component_type=component_type,
            tags=tags or [],
            is_free=is_free,
            min_rating=min_rating,
            max_price=max_price,
            sort_by=sort_by,
            limit=limit,
            offset=offset,
        )

        service = MarketplaceService(db)
        result = service.search_components(search_params)
        logger.info(f"Busca concluída - {len(result.items)} componentes encontrados")
        return result
    except Exception as e:
        logger.error(f"Erro na busca de componentes: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/components/{component_id}", response_model=ComponentResponse, summary="Obter componente", tags=["Marketplace", "Components"])
async def get_component(
    component_id: int,
    db: Session = Depends(get_db),
) -> ComponentResponse:
    """Obtém detalhes de um componente"""
    try:
        logger.info(f"Obtendo componente {component_id}")
        service = MarketplaceService(db)
        component = service.get_component(component_id)
        if not component:
            logger.warning(f"Componente {component_id} não encontrado")
            raise HTTPException(status_code=404, detail="Componente não encontrado")
        logger.info(f"Componente {component_id} obtido com sucesso")
        return component
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter componente {component_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/components/{component_id}", response_model=ComponentResponse, summary="Atualizar componente", tags=["Marketplace", "Components"])
async def update_component(
    component_id: int,
    component_data: ComponentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ComponentResponse:
    """Atualiza um componente"""
    try:
        logger.info(f"Atualizando componente {component_id} por usuário {current_user.id}")
        service = MarketplaceService(db)
        component = service.update_component(component_id, component_data, current_user.id)
        if not component:
            logger.warning(f"Componente {component_id} não encontrado ou sem permissão")
            raise HTTPException(status_code=404, detail="Componente não encontrado")
        logger.info(f"Componente {component_id} atualizado com sucesso")
        return component
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar componente {component_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/components/{component_id}", summary="Deletar componente", tags=["Marketplace", "Components"])
async def delete_component(
    component_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, str]:
    """Remove um componente"""
    try:
        logger.info(f"Deletando componente {component_id} por usuário {current_user.id}")
        service = MarketplaceService(db)
        success = service.delete_component(component_id, current_user.id)
        if not success:
            logger.warning(f"Componente {component_id} não encontrado ou sem permissão")
            raise HTTPException(status_code=404, detail="Componente não encontrado")
        logger.info(f"Componente {component_id} deletado com sucesso")
        return {"message": "Componente removido com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar componente {component_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/components/{component_id}/download", summary="Download componente", tags=["Marketplace", "Components"])
async def download_component(
    component_id: int,
    version: Optional[str] = Query(None, description="Versão específica"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Faz download de um componente"""
    try:
        logger.info(f"Download do componente {component_id} por usuário {current_user.id}")
        service = MarketplaceService(db)
        download_info = service.download_component(component_id, current_user.id, version)
        if not download_info:
            logger.warning(f"Componente {component_id} não encontrado para download")
            raise HTTPException(status_code=404, detail="Componente não encontrado")
        logger.info(f"Download autorizado para componente {component_id}")
        return download_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no download do componente {component_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/components/{component_id}/install", summary="Instalar componente", tags=["Marketplace", "Components"])
async def install_component(
    component_id: int,
    workspace_id: Optional[int] = Query(None, description="ID do workspace"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Instala um componente no workspace"""
    try:
        logger.info(f"Instalando componente {component_id} para usuário {current_user.id}")
        service = MarketplaceService(db)
        installation = service.install_component(component_id, current_user.id, workspace_id)
        if not installation:
            logger.warning(f"Componente {component_id} não encontrado para instalação")
            raise HTTPException(status_code=404, detail="Componente não encontrado")
        logger.info(f"Componente {component_id} instalado com sucesso")
        return installation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na instalação do componente {component_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== AVALIAÇÕES ====================

@router.post("/components/{component_id}/ratings", response_model=RatingResponse, summary="Criar avaliação", tags=["Marketplace", "Ratings"])
async def create_rating(
    component_id: int,
    rating_data: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RatingResponse:
    """Cria uma avaliação para um componente"""
    try:
        logger.info(f"Criando avaliação para componente {component_id} por usuário {current_user.id}")
        service = MarketplaceService(db)
        rating_data.component_id = component_id
        result = service.create_rating(rating_data, current_user.id)
        logger.info(f"Avaliação criada com sucesso - componente {component_id}")
        return result
    except Exception as e:
        logger.error(f"Erro ao criar avaliação para componente {component_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/components/{component_id}/ratings", response_model=List[RatingResponse], summary="Listar avaliações", tags=["Marketplace", "Ratings"])
async def get_component_ratings(
    component_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("newest", pattern="^(newest|oldest|highest|lowest|helpful)$"),
    db: Session = Depends(get_db),
) -> List[RatingResponse]:
    """Obtém avaliações de um componente"""
    try:
        logger.info(f"Obtendo avaliações do componente {component_id}")
        service = MarketplaceService(db)
        result = service.get_component_ratings(component_id, limit, offset, sort_by)
        logger.info(f"Retornadas {len(result)} avaliações para componente {component_id}")
        return result
    except Exception as e:
        logger.error(f"Erro ao obter avaliações do componente {component_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/components/{component_id}/ratings/stats", response_model=RatingStats)
async def get_rating_stats(
    component_id: int,
    db: Session = Depends(get_db),
):
    """Obtém estatísticas de avaliações"""
    service = MarketplaceService(db)
    return service.get_rating_stats(component_id)


@router.put("/ratings/{rating_id}", response_model=RatingResponse)
async def update_rating(
    rating_id: int,
    rating_data: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Atualiza uma avaliação"""
    service = MarketplaceService(db)
    rating = service.update_rating(rating_id, rating_data, current_user.id)
    if not rating:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    return rating


@router.delete("/ratings/{rating_id}")
async def delete_rating(
    rating_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove uma avaliação"""
    service = MarketplaceService(db)
    success = service.delete_rating(rating_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    return {"message": "Avaliação removida com sucesso"}


@router.post("/ratings/{rating_id}/helpful")
async def mark_rating_helpful(
    rating_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marca uma avaliação como útil"""
    service = MarketplaceService(db)
    success = service.mark_rating_helpful(rating_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    return {"message": "Avaliação marcada como útil"}


# ==================== COMPRAS ====================


@router.post("/components/{component_id}/purchase", response_model=PurchaseResponse)
async def purchase_component(
    component_id: int,
    purchase_data: PurchaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compra um componente premium"""
    service = MarketplaceService(db)
    purchase_data.component_id = component_id
    return service.purchase_component(purchase_data, current_user.id)


@router.get("/purchases", response_model=list[PurchaseResponse])
async def get_user_purchases(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtém compras do usuário"""
    service = MarketplaceService(db)
    return service.get_user_purchases(current_user.id, limit, offset)


@router.get("/purchases/{purchase_id}", response_model=PurchaseResponse)
async def get_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtém detalhes de uma compra"""
    service = MarketplaceService(db)
    purchase = service.get_purchase(purchase_id, current_user.id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Compra não encontrada")
    return purchase


# ==================== VERSÕES ====================


@router.get(
    "/components/{component_id}/versions", response_model=list[ComponentVersionResponse]
)
async def get_component_versions(
    component_id: int,
    db: Session = Depends(get_db),
):
    """Obtém versões de um componente"""
    service = MarketplaceService(db)
    return service.get_component_versions(component_id)


@router.post("/components/{component_id}/versions")
async def create_component_version(
    component_id: int,
    version: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cria uma nova versão do componente"""
    service = MarketplaceService(db)
    version_info = service.create_component_version(
        component_id,
        version,
        file,
        current_user.id,
    )
    if not version_info:
        raise HTTPException(status_code=404, detail="Componente não encontrado")
    return version_info


# ==================== FAVORITOS ====================


@router.post("/components/{component_id}/favorite")
async def favorite_component(
    component_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Adiciona componente aos favoritos"""
    service = MarketplaceService(db)
    success = service.favorite_component(component_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Componente não encontrado")
    return {"message": "Componente adicionado aos favoritos"}


@router.delete("/components/{component_id}/favorite")
async def unfavorite_component(
    component_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove componente dos favoritos"""
    service = MarketplaceService(db)
    success = service.unfavorite_component(component_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Componente não encontrado")
    return {"message": "Componente removido dos favoritos"}


@router.get("/favorites", response_model=List[ComponentResponse], summary="Listar favoritos", tags=["Marketplace", "Favorites"])
async def get_user_favorites(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ComponentResponse]:
    """Lista componentes favoritos do usuário"""
    try:
        logger.info(f"Obtendo favoritos do usuário {current_user.id}")
        service = MarketplaceService(db)
        result = service.get_user_favorites(current_user.id, limit, offset)
        logger.info(f"Retornados {len(result)} favoritos para usuário {current_user.id}")
        return result
    except Exception as e:
        logger.error(f"Erro ao obter favoritos do usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


# ==================== ESTATÍSTICAS ====================


@router.get("/stats", response_model=MarketplaceStats, summary="Estatísticas marketplace", tags=["Marketplace", "Statistics"])
async def get_marketplace_stats(
    db: Session = Depends(get_db),
) -> MarketplaceStats:
    """Obtém estatísticas do marketplace"""
    try:
        logger.info("Obtendo estatísticas do marketplace")
        service = MarketplaceService(db)
        result = service.get_marketplace_stats()
        logger.info("Estatísticas do marketplace obtidas com sucesso")
        return result
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do marketplace: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/components/{component_id}/stats")
async def get_component_stats(
    component_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    """Obtém estatísticas de um componente"""
    service = MarketplaceService(db)
    stats = service.get_component_stats(component_id, days)
    if not stats:
        raise HTTPException(status_code=404, detail="Componente não encontrado")
    return stats


@router.get("/my-components/stats")
async def get_author_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtém estatísticas dos componentes do autor"""
    service = MarketplaceService(db)
    return service.get_author_stats(current_user.id)


# ==================== CATEGORIAS E TAGS ====================


@router.get("/categories")
async def get_categories(
    db: Session = Depends(get_db),
):
    """Obtém categorias disponíveis"""
    service = MarketplaceService(db)
    return service.get_categories()


@router.get("/tags")
async def get_popular_tags(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Obtém tags populares"""
    service = MarketplaceService(db)
    return service.get_popular_tags(limit)


# ==================== RECOMENDAÇÕES ====================


@router.get("/recommendations", response_model=List[ComponentResponse], summary="Recomendações", tags=["Marketplace", "Recommendations"])
async def get_recommendations(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ComponentResponse]:
    """Obtém recomendações personalizadas para o usuário"""
    try:
        logger.info(f"Obtendo recomendações para usuário {current_user.id}")
        service = MarketplaceService(db)
        result = service.get_recommendations(current_user.id, limit)
        logger.info(f"Retornadas {len(result)} recomendações para usuário {current_user.id}")
        return result
    except Exception as e:
        logger.error(f"Erro ao obter recomendações para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get(
    "/components/{component_id}/similar", response_model=list[ComponentResponse]
)
async def get_similar_components(
    component_id: int,
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Obtém componentes similares"""
    service = MarketplaceService(db)
    return service.get_similar_components(component_id, limit)


# ==================== ADMIN ====================

@router.get("/admin/moderation", response_model=List[ComponentModerationResponse], summary="Moderação pendente", tags=["Marketplace", "Admin"])
async def get_pending_moderation(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> List[ComponentModerationResponse]:
    """Lista componentes pendentes de moderação"""
    try:
        logger.info(f"Admin {current_admin.id} obtendo lista de moderação")
        service = MarketplaceService(db)
        result = service.get_pending_moderation(limit, offset)
        logger.info(f"Retornados {len(result)} itens para moderação")
        return result
    except Exception as e:
        logger.error(f"Erro ao obter lista de moderação: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/admin/components/{component_id}/moderate", summary="Moderar componente", tags=["Marketplace", "Admin"])
async def moderate_component(
    component_id: int,
    action: ModerationAction,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
) -> Dict[str, str]:
    """Executa ação de moderação em um componente"""
    try:
        logger.info(f"Admin {current_admin.id} moderando componente {component_id} - ação: {action.action}")
        service = MarketplaceService(db)
        success = service.moderate_component(component_id, action, current_admin.id)
        if not success:
            logger.warning(f"Componente {component_id} não encontrado para moderação")
            raise HTTPException(status_code=404, detail="Componente não encontrado")
        logger.info(f"Moderação aplicada com sucesso ao componente {component_id}")
        return {"message": "Moderação aplicada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na moderação do componente {component_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/admin/components/bulk", response_model=BulkOperationResponse)
async def bulk_component_operation(
    operation: BulkComponentOperation,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Operação em lote em componentes"""
    service = MarketplaceService(db)
    return service.bulk_component_operation(operation, current_admin.id)


@router.post("/admin/components/{component_id}/feature")
async def feature_component(
    component_id: int,
    featured: bool = True,
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Destaca ou remove destaque de um componente"""
    service = MarketplaceService(db)
    success = service.feature_component(component_id, featured, current_admin.id)
    if not success:
        raise HTTPException(status_code=404, detail="Componente não encontrado")

    action = "destacado" if featured else "removido dos destaques"
    return {"message": f"Componente {action} com sucesso"}


# ==================== RELATÓRIOS ====================


@router.get("/admin/reports/revenue")
async def get_revenue_report(
    start_date: datetime = Query(..., description="Data de início"),
    end_date: datetime = Query(..., description="Data de fim"),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Relatório de receita"""
    service = MarketplaceService(db)
    return service.get_revenue_report(start_date, end_date)


@router.get("/admin/reports/downloads")
async def get_downloads_report(
    start_date: datetime = Query(..., description="Data de início"),
    end_date: datetime = Query(..., description="Data de fim"),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Relatório de downloads"""
    service = MarketplaceService(db)
    return service.get_downloads_report(start_date, end_date)


@router.get("/admin/reports/top-components")
async def get_top_components_report(
    metric: str = Query("downloads", pattern="^(downloads|revenue|rating)$"),
    limit: int = Query(10, ge=1, le=100),
    current_admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Relatório de top componentes"""
    service = MarketplaceService(db)
    return service.get_top_components_report(metric, limit)
