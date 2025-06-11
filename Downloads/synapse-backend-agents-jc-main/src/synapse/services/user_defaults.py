import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

def create_user_defaults(db: Session, user_id: str, user_email: str, user_name: str):
    try:
        # 1. Criar Workspace padrão
        workspace_id = str(uuid.uuid4())
        workspace_name = f"Workspace de {user_name}"
        db.execute(text("""
            INSERT INTO synapscale_db.workspaces 
            (id, name, slug, description, owner_id, is_public, created_at, updated_at, status)
            VALUES (:id, :name, :slug, :description, :owner_id, :is_public, :created_at, :updated_at, :status)
        """), {
            "id": workspace_id,
            "name": workspace_name,
            "slug": f"workspace-{user_id[:8]}",
            "description": f"Workspace pessoal de {user_name}",
            "owner_id": user_id,
            "is_public": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "status": "active"
        })
        # 2. Criar Membership automática (owner)
        membership_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO synapscale_db.workspace_members
            (id, workspace_id, user_id, role, joined_at, status)
            VALUES (:id, :workspace_id, :user_id, :role, :joined_at, :status)
        """), {
            "id": membership_id,
            "workspace_id": workspace_id,
            "user_id": user_id,
            "role": "owner",
            "joined_at": datetime.now(timezone.utc),
            "status": "active"
        })
        # 3. Criar Dashboard de Analytics padrão
        dashboard_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO synapscale_db.analytics_dashboards
            (id, name, description, layout, widgets, filters, auto_refresh, refresh_interval, is_public, shared_with, is_default, status, created_at, updated_at)
            VALUES (:id, :name, :description, :layout, :widgets, :filters, :auto_refresh, :refresh_interval, :is_public, :shared_with, :is_default, :status, :created_at, :updated_at)
        """), {
            "id": dashboard_id,
            "name": "Dashboard Principal",
            "description": "Dashboard padrão com métricas principais",
            "layout": '{}',
            "widgets": '[{"type": "workflow_count"}, {"type": "execution_stats"}, {"type": "recent_activity"}]',
            "filters": '{}',
            "auto_refresh": True,
            "refresh_interval": 300,
            "is_public": False,
            "shared_with": '[]',
            "is_default": True,
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        # 4. Criar Variáveis de usuário padrão
        default_variables = [
            {"key": "theme", "value": "light", "is_secret": False},
            {"key": "language", "value": "pt-BR", "is_secret": False},
            {"key": "timezone", "value": "America/Sao_Paulo", "is_secret": False},
            {"key": "notifications_email", "value": "true", "is_secret": False},
            {"key": "notifications_browser", "value": "true", "is_secret": False},
            {"key": "default_workspace", "value": workspace_id, "is_secret": False},
        ]
        for var in default_variables:
            var_id = str(uuid.uuid4())
            db.execute(text("""
                INSERT INTO synapscale_db.user_variables
                (id, key, value, is_secret, user_id, created_at, updated_at)
                VALUES (:id, :key, :value, :is_secret, :user_id, :created_at, :updated_at)
            """), {
                "id": var_id,
                "key": var["key"],
                "value": var["value"],
                "is_secret": var["is_secret"],
                "user_id": user_id,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
        db.commit()
        logger.info(f"Dados automáticos criados para usuário {user_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar dados automáticos para usuário {user_id}: {str(e)}")
        raise 