"""
Endpoints para gerenciamento de agentes de IA
Criado por José - um desenvolvedor Full Stack
API completa para CRUD e controle de agentes inteligentes
"""

import logging
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from synapse.database import get_db
from synapse.models.user import User
from synapse.models.agent import Agent, AgentStatus
from synapse.api.deps import get_current_user
from synapse.schemas.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentListResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("/", response_model=AgentListResponse, summary="Listar agentes", tags=["Agents"])
async def list_agents(
    page: int = Query(1, ge=1, description="Número da página"),
    size: int = Query(20, ge=1, le=100, description="Itens por página"),
    agent_type: Optional[str] = Query(None, description="Filtrar por tipo de agente"),
    search: Optional[str] = Query(None, description="Termo de busca"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentListResponse:
    """
    Lista todos os agentes do usuário com filtros e paginação.
    
    Retorna agentes ordenados por atividade recente,
    com opções de filtro por tipo e busca textual.
    
    Args:
        page: Número da página (1-based)
        size: Número de itens por página
        agent_type: Tipo específico de agente para filtrar
        search: Termo para buscar em nome e descrição
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        AgentListResponse: Lista paginada de agentes
        
    Raises:
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Listando agentes para usuário {current_user.id} - página: {page}, tipo: {agent_type}")
        
        query = db.query(Agent).filter(Agent.user_id == current_user.id)

        # Filtros
        if agent_type:
            query = query.filter(Agent.agent_type == agent_type)
            logger.info(f"Filtrando por tipo: {agent_type}")

        if search:
            query = query.filter(
                Agent.name.ilike(f"%{search}%") | Agent.description.ilike(f"%{search}%"),
            )
            logger.info(f"Filtrando por busca: '{search}'")

        # Ordenar por atividade recente
        query = query.order_by(Agent.last_active_at.desc().nullslast())

        # Paginação
        total = query.count()
        agents = query.offset((page - 1) * size).limit(size).all()

        logger.info(f"Retornados {len(agents)} agentes de {total} total para usuário {current_user.id}")
        
        return AgentListResponse(
            items=agents,
            total=total,
            page=page,
            size=size,
            pages=(total + size - 1) // size,
        )
    except Exception as e:
        logger.error(f"Erro ao listar agentes para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/", response_model=AgentResponse, summary="Criar agente", tags=["Agents"])
async def create_agent(
    agent_data: AgentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentResponse:
    """
    Cria um novo agente de IA personalizado.
    
    Permite criar agentes com configurações específicas
    de personalidade e modelo de linguagem.
    
    Args:
        agent_data: Dados do agente a ser criado
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        AgentResponse: Agente criado
        
    Raises:
        HTTPException: 400 se dados inválidos
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Criando agente '{agent_data.name}' para usuário {current_user.id}")
        
        agent = Agent(
            name=agent_data.name,
            description=agent_data.description,
            agent_type=agent_data.agent_type,
            personality=agent_data.personality,
            instructions=agent_data.instructions,
            model_provider=agent_data.model_provider,
            model=agent_data.model_name,
            temperature=agent_data.temperature,
            max_tokens=agent_data.max_tokens,
            tools=agent_data.tools,
            knowledge_base=agent_data.knowledge_base,
            avatar_url=agent_data.avatar_url,
            user_id=current_user.id,
        )

        db.add(agent)
        db.commit()
        db.refresh(agent)

        logger.info(f"Agente '{agent.name}' criado com sucesso (ID: {agent.id}) para usuário {current_user.id}")
        return agent
    except Exception as e:
        logger.error(f"Erro ao criar agente para usuário {current_user.id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{agent_id}", response_model=AgentResponse, summary="Obter agente", tags=["Agents"])
async def get_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentResponse:
    """
    Obtém um agente específico por ID.
    
    Retorna dados completos do agente se o usuário
    for o proprietário.
    
    Args:
        agent_id: ID único do agente
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        AgentResponse: Dados do agente
        
    Raises:
        HTTPException: 404 se agente não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo agente {agent_id} para usuário {current_user.id}")
        
        agent = (
            db.query(Agent)
            .filter(
                Agent.id == agent_id,
                Agent.user_id == current_user.id,
            )
            .first()
        )

        if not agent:
            logger.warning(f"Agente {agent_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado",
            )

        logger.info(f"Agente {agent_id} obtido com sucesso para usuário {current_user.id}")
        return agent
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter agente {agent_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/{agent_id}", response_model=AgentResponse, summary="Atualizar agente", tags=["Agents"])
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentResponse:
    """
    Atualiza um agente existente.
    
    Permite modificar configurações do agente se o usuário
    for o proprietário.
    
    Args:
        agent_id: ID único do agente
        agent_data: Dados atualizados do agente
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        AgentResponse: Agente atualizado
        
    Raises:
        HTTPException: 404 se agente não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Atualizando agente {agent_id} para usuário {current_user.id}")
        
        agent = (
            db.query(Agent)
            .filter(
                Agent.id == agent_id,
                Agent.user_id == current_user.id,
            )
            .first()
        )

        if not agent:
            logger.warning(f"Agente {agent_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado",
            )

        # Atualizar campos
        update_count = 0
        for field, value in agent_data.dict(exclude_unset=True).items():
            if field == "model_name":
                setattr(agent, "model", value)
            elif field == "model_provider":
                setattr(agent, "model_provider", value)
            elif hasattr(agent, field):
                setattr(agent, field, value)
                update_count += 1

        if update_count > 0:
            db.commit()
            db.refresh(agent)
            logger.info(f"Agente {agent_id} atualizado com sucesso - {update_count} campos modificados")
        else:
            logger.info(f"Nenhuma alteração necessária no agente {agent_id}")

        return agent
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar agente {agent_id} para usuário {current_user.id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/{agent_id}", summary="Deletar agente", tags=["Agents"])
async def delete_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, str]:
    """
    Remove um agente do usuário.
    
    Deleta permanentemente o agente se o usuário
    for o proprietário.
    
    Args:
        agent_id: ID único do agente
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        Dict[str, str]: Mensagem de confirmação
        
    Raises:
        HTTPException: 404 se agente não encontrado
        HTTPException: 403 se não for o proprietário  
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Deletando agente {agent_id} para usuário {current_user.id}")
        
        agent = (
            db.query(Agent)
            .filter(
                Agent.id == agent_id,
                Agent.user_id == current_user.id,
            )
            .first()
        )

        if not agent:
            logger.warning(f"Agente {agent_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado",
            )

        agent_name = agent.name
        db.delete(agent)
        db.commit()

        logger.info(f"Agente '{agent_name}' (ID: {agent_id}) deletado com sucesso para usuário {current_user.id}")
        return {"message": "Agente deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar agente {agent_id} para usuário {current_user.id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{agent_id}/activate", summary="Ativar agente", tags=["Agents"])
async def activate_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, str]:
    """
    Ativa um agente para uso em conversações.
    
    Coloca o agente em estado ativo, permitindo
    seu uso em chats e workflows.
    
    Args:
        agent_id: ID único do agente
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        Dict[str, str]: Mensagem de confirmação
        
    Raises:
        HTTPException: 404 se agente não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 400 se já estiver ativo
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Ativando agente {agent_id} para usuário {current_user.id}")
        
        agent = (
            db.query(Agent)
            .filter(
                Agent.id == agent_id,
                Agent.user_id == current_user.id,
            )
            .first()
        )

        if not agent:
            logger.warning(f"Agente {agent_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado",
            )

        if agent.status == "active" or agent.status == AgentStatus.ACTIVE:
            logger.warning(f"Agente {agent_id} já está ativo")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Agente já está ativo",
            )

        agent.status = AgentStatus.ACTIVE
        db.commit()

        logger.info(f"Agente '{agent.name}' (ID: {agent_id}) ativado com sucesso")
        return {"message": "Agente ativado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao ativar agente {agent_id} para usuário {current_user.id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{agent_id}/deactivate", summary="Desativar agente", tags=["Agents"])
async def deactivate_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, str]:
    """
    Desativa um agente temporariamente.
    
    Coloca o agente em estado inativo, impedindo
    seu uso até ser reativado.
    
    Args:
        agent_id: ID único do agente
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        Dict[str, str]: Mensagem de confirmação
        
    Raises:
        HTTPException: 404 se agente não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 400 se já estiver inativo
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Desativando agente {agent_id} para usuário {current_user.id}")
        
        agent = (
            db.query(Agent)
            .filter(
                Agent.id == agent_id,
                Agent.user_id == current_user.id,
            )
            .first()
        )

        if not agent:
            logger.warning(f"Agente {agent_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado",
            )

        if agent.status == "inactive" or agent.status == AgentStatus.INACTIVE:
            logger.warning(f"Agente {agent_id} já está inativo")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Agente já está inativo",
            )

        agent.status = AgentStatus.INACTIVE
        db.commit()

        logger.info(f"Agente '{agent.name}' (ID: {agent_id}) desativado com sucesso")
        return {"message": "Agente desativado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao desativar agente {agent_id} para usuário {current_user.id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{agent_id}/stats", summary="Estatísticas do agente", tags=["Agents", "Statistics"])
async def get_agent_stats(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Obtém estatísticas de uso de um agente.
    
    Retorna métricas de performance e uso do agente,
    incluindo conversas, mensagens e avaliações.
    
    Args:
        agent_id: ID único do agente
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        Dict[str, Any]: Estatísticas do agente
        
    Raises:
        HTTPException: 404 se agente não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo estatísticas do agente {agent_id} para usuário {current_user.id}")
        
        agent = (
            db.query(Agent)
            .filter(
                Agent.id == agent_id,
                Agent.user_id == current_user.id,
            )
            .first()
        )

        if not agent:
            logger.warning(f"Agente {agent_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado",
            )

        stats = {
            "agent_id": agent_id,
            "agent_name": agent.name,
            "conversation_count": getattr(agent, 'conversation_count', 0),
            "message_count": getattr(agent, 'message_count', 0),
            "rating_average": getattr(agent, 'rating_average', None),
            "rating_count": getattr(agent, 'rating_count', 0),
            "last_active_at": agent.last_active_at,
            "created_at": agent.created_at,
            "status": agent.status.value if hasattr(agent.status, 'value') else agent.status,
            "total_tokens_used": getattr(agent, 'total_tokens_used', 0),
        }

        logger.info(f"Estatísticas obtidas para agente {agent_id} - {stats['conversation_count']} conversas, {stats['message_count']} mensagens")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do agente {agent_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{agent_id}/duplicate", response_model=AgentResponse, summary="Duplicar agente", tags=["Agents"])
async def duplicate_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentResponse:
    """
    Duplica um agente existente.
    
    Cria uma cópia do agente com todas as configurações,
    permitindo usar como base para novos agentes.
    
    Args:
        agent_id: ID único do agente a ser duplicado
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        AgentResponse: Agente duplicado
        
    Raises:
        HTTPException: 404 se agente não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Duplicando agente {agent_id} para usuário {current_user.id}")
        
        original = (
            db.query(Agent)
            .filter(
                Agent.id == agent_id,
                Agent.user_id == current_user.id,
            )
            .first()
        )

        if not original:
            logger.warning(f"Agente {agent_id} não encontrado para usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agente não encontrado",
            )

        # Criar cópia
        duplicate_name = f"{original.name} (Cópia)"
        duplicate = Agent(
            name=duplicate_name,
            description=original.description,
            agent_type=original.agent_type,
            personality=original.personality,
            instructions=original.instructions,
            model_provider=original.model_provider,
            model=original.model,
            temperature=original.temperature,
            max_tokens=original.max_tokens,
            tools=original.tools,
            knowledge_base=original.knowledge_base,
            avatar_url=original.avatar_url,
            status="draft",
            user_id=current_user.id,
        )

        db.add(duplicate)
        db.commit()
        db.refresh(duplicate)

        logger.info(f"Agente '{original.name}' duplicado com sucesso (ID: {duplicate.id}) - nome: '{duplicate_name}'")
        return duplicate
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao duplicar agente {agent_id} para usuário {current_user.id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
