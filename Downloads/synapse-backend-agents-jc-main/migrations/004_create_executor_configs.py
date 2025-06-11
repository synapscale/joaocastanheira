"""
Migração 004: Configurações para Executores Avançados
Criado por José - um desenvolvedor Full Stack
Adiciona tabelas de configuração para os novos executores
"""

import sqlite3
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def upgrade(db_path: str):
    """
    Aplica a migração 004: Configurações para Executores Avançados
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        logger.info("🚀 Iniciando migração 004: Configurações para Executores Avançados")
        
        # Tabela de configurações de executores
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS executor_configs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                executor_type VARCHAR(50) NOT NULL,
                config_name VARCHAR(100) NOT NULL,
                config_data TEXT NOT NULL,
                is_default BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                UNIQUE(user_id, executor_type, config_name)
            )
        """)
        
        # Índices para performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_executor_configs_user_type 
            ON executor_configs (user_id, executor_type)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_executor_configs_default 
            ON executor_configs (user_id, executor_type, is_default) 
            WHERE is_default = TRUE
        """)
        
        # Tabela de cache de execuções HTTP
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS http_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cache_key VARCHAR(255) NOT NULL UNIQUE,
                response_data TEXT NOT NULL,
                headers TEXT,
                status_code INTEGER,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                hit_count INTEGER DEFAULT 0
            )
        """)
        
        # Índice para limpeza de cache expirado
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_http_cache_expires 
            ON http_cache (expires_at)
        """)
        
        # Tabela de métricas de executores
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS executor_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                execution_id VARCHAR(36) NOT NULL,
                node_id VARCHAR(36) NOT NULL,
                executor_type VARCHAR(50) NOT NULL,
                metric_name VARCHAR(100) NOT NULL,
                metric_value REAL NOT NULL,
                metric_unit VARCHAR(20),
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (execution_id) REFERENCES workflow_executions (id) ON DELETE CASCADE
            )
        """)
        
        # Índices para consultas de métricas
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_executor_metrics_execution 
            ON executor_metrics (execution_id, executor_type)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_executor_metrics_time 
            ON executor_metrics (recorded_at)
        """)
        
        # Inserir configurações padrão para executores
        default_configs = [
            # LLM Executor - OpenAI
            {
                'executor_type': 'llm',
                'config_name': 'openai_default',
                'config_data': '''{
                    "provider": "openai",
                    "model": "gpt-3.5-turbo",
                    "temperature": 0.7,
                    "max_tokens": 1000,
                    "timeout": 30,
                    "retry_attempts": 3,
                    "stream": false
                }'''
            },
            # HTTP Executor - Padrão
            {
                'executor_type': 'http',
                'config_name': 'default',
                'config_data': '''{
                    "timeout": 30,
                    "retry_attempts": 3,
                    "retry_delay": 1,
                    "follow_redirects": true,
                    "verify_ssl": true,
                    "cache_enabled": true,
                    "cache_ttl": 300
                }'''
            },
            # Transform Executor - Padrão
            {
                'executor_type': 'transform',
                'config_name': 'default',
                'config_data': '''{
                    "max_array_size": 10000,
                    "max_recursion_depth": 10,
                    "timeout": 10,
                    "safe_mode": true,
                    "allow_custom_functions": false
                }'''
            }
        ]
        
        # Inserir configurações para usuário admin (ID 1)
        for config in default_configs:
            cursor.execute("""
                INSERT OR IGNORE INTO executor_configs 
                (user_id, executor_type, config_name, config_data, is_default, is_active)
                VALUES (1, ?, ?, ?, TRUE, TRUE)
            """, (config['executor_type'], config['config_name'], config['config_data']))
        
        # Commit das mudanças
        conn.commit()
        
        logger.info("✅ Migração 004 aplicada com sucesso!")
        logger.info("📊 Tabelas criadas:")
        logger.info("   - executor_configs: Configurações de executores")
        logger.info("   - http_cache: Cache para requisições HTTP")
        logger.info("   - executor_metrics: Métricas de performance")
        logger.info("🔧 Configurações padrão inseridas para todos os executores")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro na migração 004: {str(e)}")
        if conn:
            conn.rollback()
        return False
        
    finally:
        if conn:
            conn.close()

def downgrade(db_path: str):
    """
    Reverte a migração 004
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        logger.info("🔄 Revertendo migração 004")
        
        # Remove tabelas criadas
        cursor.execute("DROP TABLE IF EXISTS executor_metrics")
        cursor.execute("DROP TABLE IF EXISTS http_cache")
        cursor.execute("DROP TABLE IF EXISTS executor_configs")
        
        conn.commit()
        logger.info("✅ Migração 004 revertida com sucesso!")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao reverter migração 004: {str(e)}")
        return False
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    # Teste da migração
    import sys
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
        upgrade(db_path)
    else:
        print("Uso: python 004_create_executor_configs.py <caminho_do_banco>")

