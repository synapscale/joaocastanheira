"""
Endpoints da API para Templates de Workflows
Criado por José - um desenvolvedor Full Stack
Sistema completo de marketplace de templates
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from synapse.database import get_db
from synapse.models.user import User
from synapse.services.template_service import TemplateService
from synapse.schemas.template import (
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse,
    TemplateDetailResponse,
    TemplateListResponse,
    TemplateFilter,
    TemplateStats,
    UserTemplateStats,
    ReviewCreate,
    ReviewResponse,
    FavoriteCreate,
    FavoriteResponse,
    CollectionCreate,
    CollectionResponse,
    TemplateInstall,
    TemplateInstallResponse,
    MarketplaceStats,
)
from synapse.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/templates", tags=["Templates"])
template_service = TemplateService()


@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED, summary="Criar template", tags=["Templates"])
async def create_template(
    template_data: TemplateCreate,
    workflow_id: Optional[int] = Query(None, description="ID do workflow base"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TemplateResponse:
    """
    Cria um novo template de workflow no marketplace.
    
    Permite aos usuários criar templates personalizados a partir
    de workflows existentes ou do zero, com metadados completos.
    
    Args:
        template_data: Dados do template a ser criado
        workflow_id: ID do workflow base (opcional)
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        TemplateResponse: Template criado com detalhes
        
    Raises:
        HTTPException: 400 se dados inválidos
        HTTPException: 403 se sem permissão
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Criando template '{template_data.name}' para usuário {current_user.id} - workflow base: {workflow_id}")
        
        template = await template_service.create_template(
            db=db,
            template_data=template_data,
            author_id=current_user.id,
            workflow_id=workflow_id,
        )
        
        logger.info(f"Template '{template.name}' criado com sucesso (ID: {template.id}) para usuário {current_user.id}")
        return template
    except ValueError as e:
        logger.warning(f"Dados inválidos para criação de template por usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao criar template para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/", response_model=TemplateListResponse, summary="Buscar templates", tags=["Templates", "Search"])
async def search_templates(
    search: Optional[str] = Query(None, description="Termo de busca"),
    category: Optional[List[str]] = Query(None, description="Categorias"),
    tags: Optional[List[str]] = Query(None, description="Tags"),
    license_type: Optional[List[str]] = Query(None, description="Tipos de licença"),
    price_min: Optional[float] = Query(None, ge=0, description="Preço mínimo"),
    price_max: Optional[float] = Query(None, ge=0, description="Preço máximo"),
    rating_min: Optional[float] = Query(None, ge=0, le=5, description="Rating mínimo"),
    complexity_min: Optional[int] = Query(
        None, ge=1, le=5, description="Complexidade mínima"
    ),
    complexity_max: Optional[int] = Query(
        None, ge=1, le=5, description="Complexidade máxima"
    ),
    is_featured: Optional[bool] = Query(None, description="Apenas em destaque"),
    is_verified: Optional[bool] = Query(None, description="Apenas verificados"),
    author_id: Optional[int] = Query(None, description="ID do autor"),
    industries: Optional[List[str]] = Query(None, description="Indústrias"),
    use_cases: Optional[List[str]] = Query(None, description="Casos de uso"),
    page: int = Query(1, ge=1, description="Página"),
    per_page: int = Query(20, ge=1, le=100, description="Itens por página"),
    sort_by: str = Query("created_at", description="Campo de ordenação"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Ordem"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
) -> TemplateListResponse:
    """
    Busca templates no marketplace com filtros avançados.
    
    Permite busca textual combinada com múltiplos filtros
    incluindo categoria, preço, rating, complexidade e mais.
    
    Args:
        search: Termo de busca em nome e descrição
        category: Lista de categorias para filtrar
        tags: Lista de tags para filtrar
        license_type: Tipos de licença (free, premium, etc.)
        price_min: Preço mínimo para filtrar
        price_max: Preço máximo para filtrar
        rating_min: Rating mínimo (0-5)
        complexity_min: Complexidade mínima (1-5)
        complexity_max: Complexidade máxima (1-5)
        is_featured: Filtrar apenas templates em destaque
        is_verified: Filtrar apenas templates verificados
        author_id: ID do autor específico
        industries: Lista de indústrias
        use_cases: Lista de casos de uso
        page: Número da página
        per_page: Itens por página
        sort_by: Campo para ordenação
        sort_order: Ordem de ordenação (asc/desc)
        db: Sessão do banco de dados
        current_user: Usuário autenticado (opcional)
        
    Returns:
        TemplateListResponse: Lista paginada de templates
        
    Raises:
        HTTPException: 400 se filtros inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        # Validações de entrada
        if price_min is not None and price_max is not None and price_min > price_max:
            raise HTTPException(status_code=400, detail="Preço mínimo deve ser menor que o máximo")
        
        if complexity_min is not None and complexity_max is not None and complexity_min > complexity_max:
            raise HTTPException(status_code=400, detail="Complexidade mínima deve ser menor que a máxima")
            
        logger.info(f"Buscando templates - termo: '{search}', página: {page}, filtros aplicados")
        
        filters = TemplateFilter(
            search=search,
            category=category,
            tags=tags,
            license_type=license_type,
            price_min=price_min,
            price_max=price_max,
            rating_min=rating_min,
            complexity_min=complexity_min,
            complexity_max=complexity_max,
            is_featured=is_featured,
            is_verified=is_verified,
            author_id=author_id,
            industries=industries,
            use_cases=use_cases,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        result = await template_service.search_templates(
            db=db,
            filters=filters,
            user_id=current_user.id if current_user else None,
        )
        
        logger.info(f"Busca de templates concluída - {result.total} templates encontrados, página {page}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro na busca de templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/stats", response_model=TemplateStats, summary="Estatísticas de templates", tags=["Templates", "Statistics"])
async def get_template_stats(
    db: Session = Depends(get_db),
) -> TemplateStats:
    """
    Obtém estatísticas gerais de templates do marketplace.
    
    Retorna métricas agregadas incluindo totais, médias,
    templates populares e estatísticas de engajamento.
    
    Args:
        db: Sessão do banco de dados
        
    Returns:
        TemplateStats: Estatísticas completas do marketplace
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info("Obtendo estatísticas gerais de templates")
        stats = await template_service.get_template_stats(db=db)
        logger.info(f"Estatísticas obtidas - {stats.total_templates} templates totais")
        return stats
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas de templates: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/marketplace", response_model=MarketplaceStats, summary="Estatísticas do marketplace", tags=["Templates", "Marketplace"])
async def get_marketplace_stats(
    db: Session = Depends(get_db),
) -> MarketplaceStats:
    """
    Obtém estatísticas específicas do marketplace de templates.
    
    Retorna dados curados para exibição no marketplace
    incluindo destaques, tendências e rankings.
    
    Args:
        db: Sessão do banco de dados
        
    Returns:
        MarketplaceStats: Estatísticas do marketplace
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info("Obtendo estatísticas do marketplace")
        
        # Obtém estatísticas base
        stats = await template_service.get_template_stats(db=db)

        # Converter para MarketplaceStats com dados adicionais
        marketplace_stats = MarketplaceStats(
            total_templates=stats.total_templates,
            total_authors=await template_service.count_authors(db=db),
            total_downloads=stats.total_downloads,
            total_reviews=stats.total_reviews,
            featured_templates=stats.top_templates[:5],
            trending_templates=await template_service.get_trending_templates(db=db, limit=5),
            new_templates=stats.recent_templates[:5],
            top_categories=await template_service.get_top_categories(db=db, limit=10),
            top_authors=await template_service.get_top_authors(db=db, limit=10),
        )
        
        logger.info(f"Estatísticas do marketplace obtidas - {marketplace_stats.total_templates} templates")
        return marketplace_stats
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do marketplace: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/my-stats", response_model=UserTemplateStats, summary="Minhas estatísticas", tags=["Templates", "User"])
async def get_user_template_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserTemplateStats:
    """
    Obtém estatísticas de templates do usuário autenticado.
    
    Retorna métricas pessoais incluindo templates criados,
    downloads, reviews e performance.
    
    Args:
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        UserTemplateStats: Estatísticas pessoais do usuário
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo estatísticas pessoais para usuário {current_user.id}")
        stats = await template_service.get_user_template_stats(
            db=db,
            user_id=current_user.id,
        )
        logger.info(f"Estatísticas pessoais obtidas para usuário {current_user.id}")
        return stats
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas pessoais para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{template_id}", response_model=TemplateDetailResponse, summary="Obter template", tags=["Templates"])
async def get_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
) -> TemplateDetailResponse:
    """
    Obtém detalhes completos de um template específico.
    
    Retorna informações detalhadas incluindo metadados,
    reviews, estatísticas e dados de compatibilidade.
    
    Args:
        template_id: ID único do template
        db: Sessão do banco de dados
        current_user: Usuário autenticado (opcional)
        
    Returns:
        TemplateDetailResponse: Detalhes completos do template
        
    Raises:
        HTTPException: 404 se template não encontrado
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo detalhes do template {template_id}")
        
        template = await template_service.get_template(
            db=db,
            template_id=template_id,
            user_id=current_user.id if current_user else None,
        )

        if not template:
            logger.warning(f"Template {template_id} não encontrado")
            raise HTTPException(status_code=404, detail="Template não encontrado")

        logger.info(f"Template {template_id} obtido com sucesso")
        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/{template_id}", response_model=TemplateResponse, summary="Atualizar template", tags=["Templates"])
async def update_template(
    template_id: str,
    template_data: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TemplateResponse:
    """
    Atualiza um template existente do usuário.
    
    Permite modificar metadados, descrição, configurações
    e outros dados de templates próprios.
    
    Args:
        template_id: ID único do template
        template_data: Dados atualizados do template
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        TemplateResponse: Template atualizado
        
    Raises:
        HTTPException: 404 se template não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 400 se dados inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Atualizando template {template_id} por usuário {current_user.id}")
        
        template = await template_service.update_template(
            db=db,
            template_id=template_id,
            template_data=template_data,
            user_id=current_user.id,
        )
        
        if not template:
            logger.warning(f"Template {template_id} não encontrado ou sem permissão para usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Template não encontrado")
            
        logger.info(f"Template {template_id} atualizado com sucesso por usuário {current_user.id}")
        return template
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Dados inválidos para atualização de template {template_id} por usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao atualizar template {template_id} por usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{template_id}/publish", response_model=Dict[str, Any], summary="Publicar template", tags=["Templates", "Publishing"])
async def publish_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Publica um template no marketplace público.
    
    Submete o template para revisão e publicação,
    tornando-o disponível para outros usuários.
    
    Args:
        template_id: ID único do template
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        Dict[str, Any]: Status da publicação
        
    Raises:
        HTTPException: 404 se template não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 400 se template inválido para publicação
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Publicando template {template_id} por usuário {current_user.id}")
        
        success = await template_service.publish_template(
            db=db,
            template_id=template_id,
            user_id=current_user.id,
        )
        
        if not success:
            logger.warning(f"Falha ao publicar template {template_id} por usuário {current_user.id}")
            raise HTTPException(
                status_code=400, 
                detail="Não foi possível publicar o template. Verifique se está completo e válido."
            )
            
        logger.info(f"Template {template_id} publicado com sucesso por usuário {current_user.id}")
        return {
            "success": True,
            "message": "Template enviado para revisão e publicação",
            "template_id": template_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao publicar template {template_id} por usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{template_id}/download", response_model=Dict[str, Any], summary="Download de template", tags=["Templates", "Download"])
async def download_template(
    template_id: str,
    download_type: str = Query("full", pattern="^(full|preview|demo)$", description="Tipo de download"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Registra e processa download de um template.
    
    Suporta diferentes tipos de download incluindo
    versão completa, preview e demo.
    
    Args:
        template_id: ID único do template
        download_type: Tipo de download (full, preview, demo)
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        Dict[str, Any]: Informações do download
        
    Raises:
        HTTPException: 404 se template não encontrado
        HTTPException: 403 se sem permissão para download
        HTTPException: 400 se tipo de download inválido
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Processando download do template {template_id} (tipo: {download_type}) por usuário {current_user.id}")
        
        download_info = await template_service.download_template(
            db=db,
            template_id=template_id,
            user_id=current_user.id,
            download_type=download_type,
        )
        
        if not download_info:
            logger.warning(f"Template {template_id} não encontrado ou sem permissão para download por usuário {current_user.id}")
            raise HTTPException(status_code=404, detail="Template não encontrado")
            
        logger.info(f"Download do template {template_id} processado com sucesso para usuário {current_user.id}")
        return download_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no download do template {template_id} por usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/install", response_model=TemplateInstallResponse, summary="Instalar template", tags=["Templates", "Installation"])
async def install_template(
    install_data: TemplateInstall,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TemplateInstallResponse:
    """
    Instala um template como workflow do usuário.
    
    Cria um novo workflow baseado no template,
    aplicando configurações e customizações.
    
    Args:
        install_data: Dados de instalação do template
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        TemplateInstallResponse: Resultado da instalação
        
    Raises:
        HTTPException: 404 se template não encontrado
        HTTPException: 400 se dados de instalação inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Instalando template {install_data.template_id} para usuário {current_user.id}")
        
        installation = await template_service.install_template(
            db=db,
            install_data=install_data,
            user_id=current_user.id,
        )
        
        if not installation:
            logger.warning(f"Falha na instalação do template {install_data.template_id} para usuário {current_user.id}")
            raise HTTPException(status_code=400, detail="Não foi possível instalar o template")
            
        logger.info(f"Template {install_data.template_id} instalado com sucesso como workflow {installation.workflow_id} para usuário {current_user.id}")
        return installation
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Dados inválidos para instalação de template por usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro na instalação do template {install_data.template_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/favorites", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED, summary="Adicionar favorito", tags=["Templates", "Favorites"])
async def add_to_favorites(
    favorite_data: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FavoriteResponse:
    """
    Adiciona um template aos favoritos do usuário.
    
    Permite marcar templates como favoritos para
    acesso rápido e organização pessoal.
    
    Args:
        favorite_data: Dados do favorito
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        FavoriteResponse: Favorito criado
        
    Raises:
        HTTPException: 404 se template não encontrado
        HTTPException: 409 se já está nos favoritos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Adicionando template {favorite_data.template_id} aos favoritos do usuário {current_user.id}")
        
        favorite = await template_service.add_to_favorites(
            db=db,
            favorite_data=favorite_data,
            user_id=current_user.id,
        )
        
        if not favorite:
            logger.warning(f"Template {favorite_data.template_id} não encontrado ou já está nos favoritos do usuário {current_user.id}")
            raise HTTPException(status_code=409, detail="Template já está nos favoritos ou não encontrado")
            
        logger.info(f"Template {favorite_data.template_id} adicionado aos favoritos do usuário {current_user.id}")
        return favorite
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao adicionar favorito para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/favorites/my", response_model=List[FavoriteResponse], summary="Meus favoritos", tags=["Templates", "Favorites"])
async def get_my_favorites(
    page: int = Query(1, ge=1, description="Página"),
    per_page: int = Query(20, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[FavoriteResponse]:
    """
    Obtém lista de templates favoritos do usuário.
    
    Retorna templates marcados como favoritos
    com paginação e informações detalhadas.
    
    Args:
        page: Número da página
        per_page: Itens por página
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        List[FavoriteResponse]: Lista de favoritos
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo favoritos do usuário {current_user.id} - página {page}")
        
        favorites = await template_service.get_user_favorites(
            db=db,
            user_id=current_user.id,
            page=page,
            per_page=per_page,
        )
        
        logger.info(f"Retornados {len(favorites)} favoritos para usuário {current_user.id}")
        return favorites
    except Exception as e:
        logger.error(f"Erro ao obter favoritos para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{template_id}/reviews", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED, summary="Criar review", tags=["Templates", "Reviews"])
async def create_review(
    template_id: str,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Cria uma avaliação para um template.
    
    Permite usuários avaliarem templates com nota
    e comentários detalhados.
    
    Args:
        template_id: ID único do template
        review_data: Dados da avaliação
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        Dict[str, Any]: Resultado da criação da review
        
    Raises:
        HTTPException: 404 se template não encontrado
        HTTPException: 409 se usuário já avaliou
        HTTPException: 400 se dados inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Criando review para template {template_id} por usuário {current_user.id} - nota: {review_data.rating}")
        
        review = await template_service.create_review(
            db=db,
            template_id=template_id,
            review_data=review_data,
            user_id=current_user.id,
        )
        
        if not review:
            logger.warning(f"Falha ao criar review para template {template_id} por usuário {current_user.id}")
            raise HTTPException(status_code=409, detail="Usuário já avaliou este template ou template não encontrado")
            
        logger.info(f"Review criada com sucesso para template {template_id} por usuário {current_user.id}")
        return {
            "success": True,
            "message": "Avaliação criada com sucesso",
            "review_id": review.id,
            "template_id": template_id
        }
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Dados inválidos para review do template {template_id} por usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao criar review para template {template_id} por usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{template_id}/reviews", response_model=List[ReviewResponse], summary="Obter reviews", tags=["Templates", "Reviews"])
async def get_template_reviews(
    template_id: str,
    page: int = Query(1, ge=1, description="Página"),
    per_page: int = Query(20, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
) -> List[ReviewResponse]:
    """
    Obtém avaliações de um template específico.
    
    Retorna lista paginada de reviews com detalhes
    dos usuários e estatísticas agregadas.
    
    Args:
        template_id: ID único do template
        page: Número da página
        per_page: Itens por página
        db: Sessão do banco de dados
        
    Returns:
        List[ReviewResponse]: Lista de avaliações
        
    Raises:
        HTTPException: 404 se template não encontrado
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo reviews do template {template_id} - página {page}")
        
        reviews = await template_service.get_template_reviews(
            db=db,
            template_id=template_id,
            page=page,
            per_page=per_page,
        )
        
        if reviews is None:
            logger.warning(f"Template {template_id} não encontrado")
            raise HTTPException(status_code=404, detail="Template não encontrado")
            
        logger.info(f"Retornadas {len(reviews)} reviews para template {template_id}")
        return reviews
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter reviews do template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/collections", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED, summary="Criar coleção", tags=["Templates", "Collections"])
async def create_collection(
    collection_data: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Cria uma nova coleção de templates.
    
    Permite organizar templates em coleções temáticas
    para melhor curadoria e descoberta.
    
    Args:
        collection_data: Dados da coleção
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        Dict[str, Any]: Resultado da criação da coleção
        
    Raises:
        HTTPException: 400 se dados inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Criando coleção '{collection_data.name}' para usuário {current_user.id}")
        
        collection = await template_service.create_collection(
            db=db,
            collection_data=collection_data,
            user_id=current_user.id,
        )
        
        if not collection:
            logger.warning(f"Falha ao criar coleção '{collection_data.name}' para usuário {current_user.id}")
            raise HTTPException(status_code=400, detail="Não foi possível criar a coleção")
            
        logger.info(f"Coleção '{collection.name}' criada com sucesso (ID: {collection.id}) para usuário {current_user.id}")
        return {
            "success": True,
            "message": "Coleção criada com sucesso",
            "collection_id": collection.id,
            "name": collection.name
        }
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Dados inválidos para criação de coleção por usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao criar coleção para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/collections", response_model=List[CollectionResponse], summary="Listar coleções", tags=["Templates", "Collections"])
async def get_collections(
    page: int = Query(1, ge=1, description="Página"),
    per_page: int = Query(20, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
) -> List[CollectionResponse]:
    """
    Obtém lista de coleções públicas de templates.
    
    Retorna coleções curadas disponíveis no marketplace
    com informações de templates incluídos.
    
    Args:
        page: Número da página
        per_page: Itens por página
        db: Sessão do banco de dados
        
    Returns:
        List[CollectionResponse]: Lista de coleções
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo coleções públicas - página {page}")
        
        collections = await template_service.get_public_collections(
            db=db,
            page=page,
            per_page=per_page,
        )
        
        logger.info(f"Retornadas {len(collections)} coleções públicas")
        return collections
    except Exception as e:
        logger.error(f"Erro ao obter coleções públicas: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
