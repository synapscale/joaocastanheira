"""
Migração 002: Criação das tabelas de execução de workflows
Criado por José - um desenvolvedor Full Stack
Adiciona suporte completo para execução de workflows em tempo real
"""

import sqlite3
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migration(db_path: str = "synapse.db"):
    """
    Executa a migração para criar tabelas de execução de workflows
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        logger.info("🚀 Iniciando migração 002: Tabelas de execução de workflows")
        
        # 1. Criar tabela workflow_executions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS workflow_executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                execution_id VARCHAR(36) UNIQUE NOT NULL,
                workflow_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                priority INTEGER DEFAULT 5,
                input_data JSON,
                output_data JSON,
                context_data JSON,
                variables JSON,
                total_nodes INTEGER DEFAULT 0,
                completed_nodes INTEGER DEFAULT 0,
                failed_nodes INTEGER DEFAULT 0,
                progress_percentage INTEGER DEFAULT 0,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                timeout_at TIMESTAMP,
                estimated_duration INTEGER,
                actual_duration INTEGER,
                execution_log TEXT,
                error_message TEXT,
                error_details JSON,
                debug_info JSON,
                retry_count INTEGER DEFAULT 0,
                max_retries INTEGER DEFAULT 3,
                auto_retry BOOLEAN DEFAULT 1,
                notify_on_completion BOOLEAN DEFAULT 1,
                notify_on_failure BOOLEAN DEFAULT 1,
                tags JSON,
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (workflow_id) REFERENCES workflows (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # 2. Criar índices para workflow_executions
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_executions_execution_id ON workflow_executions(execution_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_executions_priority ON workflow_executions(priority)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at)")
        
        logger.info("✅ Tabela workflow_executions criada com sucesso")
        
        # 3. Criar tabela node_executions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS node_executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                execution_id VARCHAR(36) NOT NULL,
                workflow_execution_id INTEGER NOT NULL,
                node_id INTEGER NOT NULL,
                node_key VARCHAR(255) NOT NULL,
                node_type VARCHAR(100) NOT NULL,
                node_name VARCHAR(255),
                status VARCHAR(20) DEFAULT 'pending',
                execution_order INTEGER NOT NULL,
                input_data JSON,
                output_data JSON,
                config_data JSON,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                timeout_at TIMESTAMP,
                duration_ms INTEGER,
                execution_log TEXT,
                error_message TEXT,
                error_details JSON,
                debug_info JSON,
                retry_count INTEGER DEFAULT 0,
                max_retries INTEGER DEFAULT 3,
                retry_delay INTEGER DEFAULT 1000,
                dependencies JSON,
                dependents JSON,
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (workflow_execution_id) REFERENCES workflow_executions (id),
                FOREIGN KEY (node_id) REFERENCES nodes (id)
            )
        """)
        
        # 4. Criar índices para node_executions
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_node_executions_execution_id ON node_executions(execution_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_node_executions_workflow_execution_id ON node_executions(workflow_execution_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_node_executions_node_id ON node_executions(node_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_node_executions_node_key ON node_executions(node_key)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_node_executions_node_type ON node_executions(node_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_node_executions_status ON node_executions(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_node_executions_execution_order ON node_executions(execution_order)")
        
        logger.info("✅ Tabela node_executions criada com sucesso")
        
        # 5. Criar tabela execution_queue
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS execution_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                queue_id VARCHAR(36) UNIQUE NOT NULL,
                workflow_execution_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                priority INTEGER DEFAULT 5,
                scheduled_at TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                status VARCHAR(50) DEFAULT 'queued',
                worker_id VARCHAR(100),
                max_execution_time INTEGER DEFAULT 3600,
                retry_count INTEGER DEFAULT 0,
                max_retries INTEGER DEFAULT 3,
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (workflow_execution_id) REFERENCES workflow_executions (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # 6. Criar índices para execution_queue
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_queue_queue_id ON execution_queue(queue_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_queue_workflow_execution_id ON execution_queue(workflow_execution_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_queue_user_id ON execution_queue(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_queue_priority ON execution_queue(priority)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_queue_scheduled_at ON execution_queue(scheduled_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_queue_status ON execution_queue(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_queue_worker_id ON execution_queue(worker_id)")
        
        logger.info("✅ Tabela execution_queue criada com sucesso")
        
        # 7. Criar tabela execution_metrics
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS execution_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workflow_execution_id INTEGER NOT NULL,
                node_execution_id INTEGER,
                metric_type VARCHAR(100) NOT NULL,
                metric_name VARCHAR(255) NOT NULL,
                value_numeric INTEGER,
                value_float VARCHAR(50),
                value_text TEXT,
                value_json JSON,
                context VARCHAR(255),
                tags JSON,
                measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (workflow_execution_id) REFERENCES workflow_executions (id),
                FOREIGN KEY (node_execution_id) REFERENCES node_executions (id)
            )
        """)
        
        # 8. Criar índices para execution_metrics
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_metrics_workflow_execution_id ON execution_metrics(workflow_execution_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_metrics_node_execution_id ON execution_metrics(node_execution_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_metrics_metric_type ON execution_metrics(metric_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_metrics_metric_name ON execution_metrics(metric_name)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_metrics_context ON execution_metrics(context)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_execution_metrics_measured_at ON execution_metrics(measured_at)")
        
        logger.info("✅ Tabela execution_metrics criada com sucesso")
        
        # 9. Adicionar relacionamentos nas tabelas existentes (se necessário)
        # Verificar se a coluna workflow_executions existe na tabela users
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'workflow_executions' not in columns:
            # Não é possível adicionar relacionamentos em SQLite facilmente
            # Os relacionamentos serão gerenciados pelo ORM
            logger.info("ℹ️  Relacionamentos serão gerenciados pelo ORM")
        
        # 10. Criar triggers para atualizar updated_at automaticamente
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_workflow_executions_updated_at
            AFTER UPDATE ON workflow_executions
            BEGIN
                UPDATE workflow_executions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
        """)
        
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_node_executions_updated_at
            AFTER UPDATE ON node_executions
            BEGIN
                UPDATE node_executions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
        """)
        
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_execution_queue_updated_at
            AFTER UPDATE ON execution_queue
            BEGIN
                UPDATE execution_queue SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
        """)
        
        logger.info("✅ Triggers de updated_at criados com sucesso")
        
        # 11. Inserir dados de exemplo (opcional)
        # Não inserir dados de exemplo em produção
        
        # Commit das mudanças
        conn.commit()
        
        logger.info("🎉 Migração 002 concluída com sucesso!")
        logger.info("📊 Tabelas criadas:")
        logger.info("   - workflow_executions (execuções de workflows)")
        logger.info("   - node_executions (execuções de nós)")
        logger.info("   - execution_queue (fila de execução)")
        logger.info("   - execution_metrics (métricas de performance)")
        logger.info("🔗 Índices e triggers configurados para performance otimizada")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro na migração 002: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        return False
        
    finally:
        if 'conn' in locals():
            conn.close()


def rollback_migration(db_path: str = "synapse.db"):
    """
    Reverte a migração (remove as tabelas criadas)
    CUIDADO: Isso irá apagar todos os dados de execução!
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        logger.warning("⚠️  ATENÇÃO: Revertendo migração 002 - DADOS SERÃO PERDIDOS!")
        
        # Remover triggers
        cursor.execute("DROP TRIGGER IF EXISTS update_workflow_executions_updated_at")
        cursor.execute("DROP TRIGGER IF EXISTS update_node_executions_updated_at")
        cursor.execute("DROP TRIGGER IF EXISTS update_execution_queue_updated_at")
        
        # Remover tabelas (ordem inversa devido às foreign keys)
        cursor.execute("DROP TABLE IF EXISTS execution_metrics")
        cursor.execute("DROP TABLE IF EXISTS execution_queue")
        cursor.execute("DROP TABLE IF EXISTS node_executions")
        cursor.execute("DROP TABLE IF EXISTS workflow_executions")
        
        conn.commit()
        
        logger.info("✅ Migração 002 revertida com sucesso")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao reverter migração 002: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        return False
        
    finally:
        if 'conn' in locals():
            conn.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        print("⚠️  Tem certeza que deseja reverter a migração? (digite 'sim' para confirmar)")
        confirmation = input().lower()
        if confirmation == 'sim':
            rollback_migration()
        else:
            print("Operação cancelada")
    else:
        run_migration()

