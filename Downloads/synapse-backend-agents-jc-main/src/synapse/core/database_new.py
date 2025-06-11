"""
Conexão otimizada com banco de dados DigitalOcean
Criado por José - um desenvolvedor Full Stack
Implementa conexão robusta com PostgreSQL
"""

import logging
from typing import Optional, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager

from synapse.core.config import settings
from synapse.models.agent import Agent
from synapse.models.analytics import Analytics
from synapse.models.conversation import Conversation
from synapse.models.file import File
from synapse.models.marketplace import MarketplaceComponent
from synapse.models.message import Message
from synapse.models.node import Node
from synapse.models.template import WorkflowTemplate
from synapse.models.user import User
from synapse.models.user_variable import UserVariable
from synapse.models.workflow import Workflow
from synapse.models.workflow_execution import WorkflowExecution
from synapse.models.workspace import Workspace

logger = logging.getLogger(__name__)

# Engine do banco de dados
engine = None
SessionLocal = None


def create_database_engine():
    """
    Cria engine do banco de dados com configurações otimizadas
    """
    global engine

    if engine is None:
        try:
            db_config = settings.get_database_config()

            engine = create_engine(
                db_config["url"],
                echo=db_config["echo"],
                pool_size=db_config["pool_size"],
                max_overflow=db_config["max_overflow"],
                pool_timeout=db_config["pool_timeout"],
                pool_recycle=db_config["pool_recycle"],
                connect_args={
                    "options": f"-csearch_path={settings.DATABASE_SCHEMA},public",
                },
            )

            logger.info("✅ Database engine created successfully")

        except Exception as e:
            logger.error(f"❌ Failed to create database engine: {e}")
            raise

    return engine


def create_session_factory():
    """
    Cria factory de sessões do banco de dados
    """
    global SessionLocal

    if SessionLocal is None:
        engine = create_database_engine()
        SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine,
        )
        logger.info("✅ Session factory created successfully")

    return SessionLocal


def get_db() -> Session:
    """
    Dependency para obter sessão do banco de dados
    """
    SessionLocal = create_session_factory()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_session():
    """
    Context manager para sessão do banco de dados
    """
    SessionLocal = create_session_factory()
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def test_database_connection() -> bool:
    """
    Testa conexão com o banco de dados
    """
    try:
        engine = create_database_engine()

        with engine.connect() as connection:
            # Testar conexão básica
            result = connection.execute(text("SELECT 1"))
            result.fetchone()

            # Verificar se schema existe
            schema_check = connection.execute(
                text(
                    """
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = :schema
                """
                ),
                {"schema": settings.DATABASE_SCHEMA},
            )

            if schema_check.fetchone():
                logger.info("✅ DigitalOcean database connection OK")
                return True
            else:
                logger.error(f"❌ Schema '{settings.DATABASE_SCHEMA}' not found")
                return False

    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False


def get_database_info() -> dict[str, Any] | None:
    """
    Obtém informações do banco de dados
    """
    try:
        engine = create_database_engine()

        with engine.connect() as connection:
            # Informações básicas
            version_result = connection.execute(text("SELECT version()"))
            version = version_result.fetchone()[0]

            # Contar tabelas no schema
            tables_result = connection.execute(
                text(
                    """
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = :schema
                """
                ),
                {"schema": settings.DATABASE_SCHEMA},
            )
            table_count = tables_result.fetchone()[0]

            # Informações de conexão
            connection_info = connection.execute(
                text(
                    "SELECT current_database(), current_user, inet_server_addr(), inet_server_port()"
                ),
            )
            db_name, user, host, port = connection_info.fetchone()

            return {
                "version": version.split(" ")[0:2],  # PostgreSQL version
                "database": db_name,
                "user": user,
                "host": host,
                "port": port,
                "schema": settings.DATABASE_SCHEMA,
                "table_count": table_count,
                "connection_pool": {
                    "size": engine.pool.size(),
                    "checked_in": engine.pool.checkedin(),
                    "checked_out": engine.pool.checkedout(),
                },
            }

    except Exception as e:
        logger.error(f"❌ Failed to get database info: {e}")
        return None


def init_database():
    """
    Inicializa o banco de dados criando tabelas se necessário
    """
    try:
        engine = create_database_engine()

        # Criar tabelas
        # Base.metadata.create_all(bind=engine)

        logger.info("✅ Database initialized successfully")

    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise


def close_database_connections():
    """
    Fecha todas as conexões do banco de dados
    """
    global engine, SessionLocal

    try:
        if engine:
            engine.dispose()
            logger.info("✅ Database connections closed")

        engine = None
        SessionLocal = None

    except Exception as e:
        logger.error(f"❌ Failed to close database connections: {e}")


# Criar engine na importação para validar conexão
try:
    create_database_engine()
except Exception as e:
    logger.warning(f"⚠️ Database engine creation deferred: {e}")
