"""
Serviço de Marketplace usando SQLAlchemy para conexão direta com PostgreSQL
"""
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func, text
import os
import logging

from synapse.database import get_db
from synapse.models.marketplace import MarketplaceComponent, ComponentRating, ComponentPurchase

logger = logging.getLogger(__name__)

class MarketplaceService:
    """Serviço de Marketplace usando SQLAlchemy"""
    
    def __init__(self, db=None):
        # Usar a sessão do SQLAlchemy
        self.db = db
        self.schema = os.getenv("DATABASE_SCHEMA", "synapscale_db")
    
    def search_components(self, search_params: Dict[str, Any]) -> Dict[str, Any]:
        """Busca componentes no marketplace usando SQLAlchemy"""
        try:
            # Parâmetros de busca
            query = search_params.get('query', '')
            category = search_params.get('category')
            tags = search_params.get('tags', [])
            min_rating = search_params.get('min_rating', 0)
            sort_by = search_params.get('sort_by', 'created_at')
            sort_order = search_params.get('sort_order', 'desc')
            page = search_params.get('page', 1)
            limit = search_params.get('limit', 20)
            
            # Calcular offset
            offset = (page - 1) * limit
            
            # Construir a consulta base
            db_query = self.db.query(MarketplaceComponent).filter(MarketplaceComponent.is_active == True)
            
            # Adicionar filtros
            if query:
                db_query = db_query.filter(MarketplaceComponent.name.ilike(f'%{query}%'))
            
            if category:
                db_query = db_query.filter(MarketplaceComponent.category == category)
            
            # Ordenação
            if sort_order.lower() == 'desc':
                db_query = db_query.order_by(desc(getattr(MarketplaceComponent, sort_by)))
            else:
                db_query = db_query.order_by(asc(getattr(MarketplaceComponent, sort_by)))
            
            # Contar total
            total = db_query.count()
            
            # Aplicar paginação
            components = db_query.offset(offset).limit(limit).all()
            
            # Carregar relacionamentos manualmente
            for component in components:
                self.db.refresh(component)
            
            return {
                'components': components,
                'total': total,
                'page': page,
                'limit': limit,
                'total_pages': (total + limit - 1) // limit
            }
            
        except Exception as e:
            logger.error(f"Erro ao buscar componentes: {e}")
            return {
                'components': [],
                'total': 0,
                'page': page,
                'limit': limit,
                'total_pages': 0
            }
    
    def get_component_by_id(self, component_id: str) -> Optional[MarketplaceComponent]:
        """Busca componente por ID usando SQLAlchemy"""
        try:
            component = self.db.query(MarketplaceComponent).filter(MarketplaceComponent.id == component_id).first()
            if component:
                self.db.refresh(component)
            return component
        except Exception as e:
            logger.error(f"Erro ao buscar componente {component_id}: {e}")
            return None
    
    def create_component(self, component_data: Dict[str, Any]) -> Optional[MarketplaceComponent]:
        """Cria novo componente usando SQLAlchemy"""
        try:
            component = MarketplaceComponent(**component_data)
            self.db.add(component)
            self.db.commit()
            self.db.refresh(component)
            return component
        except Exception as e:
            self.db.rollback()
            logger.error(f"Erro ao criar componente: {e}")
            return None
    
    def update_component(self, component_id: str, component_data: Dict[str, Any]) -> Optional[MarketplaceComponent]:
        """Atualiza componente usando SQLAlchemy"""
        try:
            component = self.db.query(MarketplaceComponent).filter(MarketplaceComponent.id == component_id).first()
            if not component:
                return None
                
            for key, value in component_data.items():
                setattr(component, key, value)
                
            self.db.commit()
            self.db.refresh(component)
            return component
        except Exception as e:
            self.db.rollback()
            logger.error(f"Erro ao atualizar componente {component_id}: {e}")
            return None
    
    def delete_component(self, component_id: str) -> bool:
        """Deleta componente usando SQLAlchemy"""
        try:
            component = self.db.query(MarketplaceComponent).filter(MarketplaceComponent.id == component_id).first()
            if not component:
                return False
                
            self.db.delete(component)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Erro ao deletar componente {component_id}: {e}")
            return False

# Função para compatibilidade com código existente
def search_components(search_params: Dict[str, Any]) -> Dict[str, Any]:
    """Função para compatibilidade"""
    # Obter uma sessão do banco de dados
    db = next(get_db())
    service = MarketplaceService(db)
    return service.search_components(search_params)
