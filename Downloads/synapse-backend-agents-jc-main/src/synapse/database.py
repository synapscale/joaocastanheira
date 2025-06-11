"""
Configuração do banco de dados com SQLAlchemy
Conexão direta com PostgreSQL - MIGRADO PARA SISTEMA CENTRALIZADO
"""
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

# Importar do sistema centralizado
from synapse.core.config import settings

# Configuração de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Obter configuração completa do banco do sistema centralizado diretamente de settings
# (substitui get_database_config)
db_config = {
    "url": settings.DATABASE_URL,
    "schema": getattr(settings, "DATABASE_SCHEMA", None),
    "pool_size": getattr(settings, "DATABASE_POOL_SIZE", 20),
    "max_overflow": getattr(settings, "DATABASE_MAX_OVERFLOW", 30),
    "echo": getattr(settings, "DATABASE_ECHO", False),
}

# Usar configurações centralizadas
DATABASE_URL = db_config["url"]
DATABASE_SCHEMA = db_config.get("schema", settings.DATABASE_SCHEMA)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Criar engine do SQLAlchemy com configurações centralizadas
engine = create_engine(
    DATABASE_URL, 
    pool_size=db_config["pool_size"],
    max_overflow=db_config.get("max_overflow", 30),
    echo=db_config["echo"]
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Criar base com o schema especificado
metadata = MetaData(schema=DATABASE_SCHEMA)
Base = declarative_base(metadata=metadata)

def get_db():
    """
    Dependency para obter uma sessão do banco de dados
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Inicializa a conexão com o banco de dados
    """
    try:
        # Para SQLite, vamos apenas criar as tabelas se não existirem
        Base.metadata.create_all(bind=engine)
        
        # Teste de conexão simples
        with engine.connect() as conn:
            # Para SQLite, não usamos schemas como PostgreSQL
            if "sqlite" in settings.DATABASE_URL:
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
                tables = result.fetchall()
                logger.info(f"✅ Conectado ao banco SQLite - {len(tables)} tabelas encontradas")
            else:
                # Para PostgreSQL
                conn.execute(text(f"SET search_path TO {DATABASE_SCHEMA}"))
                result = conn.execute(text(f"SELECT COUNT(*) FROM {DATABASE_SCHEMA}.users"))
                count = result.scalar()
                logger.info(f"✅ Conectado ao schema {DATABASE_SCHEMA} - {count} usuários encontrados")
        
        logger.info(f"✅ Conexão com o banco de dados estabelecida com sucesso")
    except Exception as e:
        logger.error(f"❌ Erro ao conectar ao banco de dados: {e}")
        # Para desenvolvimento local, não vamos falhar se o banco não estiver configurado
        if "development" in getattr(settings, 'ENVIRONMENT', ''):
            logger.warning("⚠️ Continuando em modo desenvolvimento sem banco de dados")

def health_check() -> bool:
    """
    Verifica a saúde da conexão com o banco
    """
    try:
        with engine.connect() as conn:
            conn.execute(text(f"SELECT 1 FROM {DATABASE_SCHEMA}.users LIMIT 1"))
        return True
    except Exception as e:
        logger.error(f"❌ Health check falhou: {e}")
        return False

def create_tables():
    """
    Criar todas as tabelas no banco de dados
    Nota: As tabelas já existem no schema, então esta função não faz nada
    """
    logger.warning(
        "⚠️  As tabelas já existem no schema, não é necessário criá-las"
    )

def drop_tables():
    """
    Remover todas as tabelas do banco de dados
    Nota: Esta função é perigosa e não deve ser usada em produção
    """
    logger.warning(
        "⚠️  Função de remoção de tabelas desativada para evitar perda de dados"
    )
