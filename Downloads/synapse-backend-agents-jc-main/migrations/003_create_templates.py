"""
Migração 003: Criação das tabelas de templates
Criado por José - um desenvolvedor Full Stack
Adiciona suporte completo para marketplace de templates
"""

import sqlite3
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migration(db_path: str = "synapse.db"):
    """
    Executa a migração para criar tabelas de templates
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        logger.info("🚀 Iniciando migração 003: Tabelas de templates")
        
        # 1. Criar tabela workflow_templates
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS workflow_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id VARCHAR(36) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                short_description VARCHAR(500),
                author_id INTEGER NOT NULL,
                original_workflow_id INTEGER,
                category VARCHAR(50) NOT NULL,
                tags JSON,
                status VARCHAR(20) DEFAULT 'draft',
                is_public BOOLEAN DEFAULT 1,
                is_featured BOOLEAN DEFAULT 0,
                is_verified BOOLEAN DEFAULT 0,
                license_type VARCHAR(20) DEFAULT 'free',
                price REAL DEFAULT 0.0,
                workflow_data JSON NOT NULL,
                nodes_data JSON NOT NULL,
                connections_data JSON,
                required_variables JSON,
                optional_variables JSON,
                default_config JSON,
                version VARCHAR(20) DEFAULT '1.0.0',
                compatibility_version VARCHAR(20) DEFAULT '1.0.0',
                estimated_duration INTEGER,
                complexity_level INTEGER DEFAULT 1,
                download_count INTEGER DEFAULT 0,
                usage_count INTEGER DEFAULT 0,
                rating_average REAL DEFAULT 0.0,
                rating_count INTEGER DEFAULT 0,
                view_count INTEGER DEFAULT 0,
                keywords JSON,
                use_cases JSON,
                industries JSON,
                thumbnail_url VARCHAR(500),
                preview_images JSON,
                demo_video_url VARCHAR(500),
                documentation TEXT,
                setup_instructions TEXT,
                changelog JSON,
                support_email VARCHAR(255),
                repository_url VARCHAR(500),
                documentation_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP,
                last_used_at TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users (id),
                FOREIGN KEY (original_workflow_id) REFERENCES workflows (id)
            )
        """)
        
        # 2. Criar índices para workflow_templates
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_template_id ON workflow_templates(template_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_author_id ON workflow_templates(author_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_status ON workflow_templates(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_is_public ON workflow_templates(is_public)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_is_featured ON workflow_templates(is_featured)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_license_type ON workflow_templates(license_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_download_count ON workflow_templates(download_count)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_rating_average ON workflow_templates(rating_average)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_created_at ON workflow_templates(created_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_templates_published_at ON workflow_templates(published_at)")
        
        logger.info("✅ Tabela workflow_templates criada com sucesso")
        
        # 3. Criar tabela template_reviews
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS template_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                rating INTEGER NOT NULL,
                title VARCHAR(255),
                comment TEXT,
                ease_of_use INTEGER,
                documentation_quality INTEGER,
                performance INTEGER,
                value_for_money INTEGER,
                is_verified_purchase BOOLEAN DEFAULT 0,
                is_helpful_count INTEGER DEFAULT 0,
                is_reported BOOLEAN DEFAULT 0,
                version_reviewed VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (template_id) REFERENCES workflow_templates (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # 4. Criar índices para template_reviews
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_reviews_template_id ON template_reviews(template_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_reviews_user_id ON template_reviews(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_reviews_rating ON template_reviews(rating)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_reviews_created_at ON template_reviews(created_at)")
        
        logger.info("✅ Tabela template_reviews criada com sucesso")
        
        # 5. Criar tabela template_downloads
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS template_downloads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                download_type VARCHAR(20) DEFAULT 'full',
                ip_address VARCHAR(45),
                user_agent VARCHAR(500),
                template_version VARCHAR(20),
                downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (template_id) REFERENCES workflow_templates (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # 6. Criar índices para template_downloads
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_downloads_template_id ON template_downloads(template_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_downloads_user_id ON template_downloads(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_downloads_downloaded_at ON template_downloads(downloaded_at)")
        
        logger.info("✅ Tabela template_downloads criada com sucesso")
        
        # 7. Criar tabela template_favorites
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS template_favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (template_id) REFERENCES workflow_templates (id),
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(template_id, user_id)
            )
        """)
        
        # 8. Criar índices para template_favorites
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_favorites_template_id ON template_favorites(template_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_favorites_user_id ON template_favorites(user_id)")
        
        logger.info("✅ Tabela template_favorites criada com sucesso")
        
        # 9. Criar tabela template_collections
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS template_collections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                collection_id VARCHAR(36) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                creator_id INTEGER NOT NULL,
                is_public BOOLEAN DEFAULT 1,
                is_featured BOOLEAN DEFAULT 0,
                template_ids JSON NOT NULL,
                tags JSON,
                thumbnail_url VARCHAR(500),
                view_count INTEGER DEFAULT 0,
                follow_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users (id)
            )
        """)
        
        # 10. Criar índices para template_collections
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_collections_collection_id ON template_collections(collection_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_collections_creator_id ON template_collections(creator_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_collections_is_public ON template_collections(is_public)")
        
        logger.info("✅ Tabela template_collections criada com sucesso")
        
        # 11. Criar tabela template_usage
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS template_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                workflow_id INTEGER,
                usage_type VARCHAR(20) NOT NULL,
                success BOOLEAN DEFAULT 1,
                template_version VARCHAR(20),
                modifications_made JSON,
                execution_time INTEGER,
                ip_address VARCHAR(45),
                user_agent VARCHAR(500),
                used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (template_id) REFERENCES workflow_templates (id),
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (workflow_id) REFERENCES workflows (id)
            )
        """)
        
        # 12. Criar índices para template_usage
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_usage_template_id ON template_usage(template_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_usage_user_id ON template_usage(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_usage_usage_type ON template_usage(usage_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_template_usage_used_at ON template_usage(used_at)")
        
        logger.info("✅ Tabela template_usage criada com sucesso")
        
        # 13. Criar triggers para atualizar updated_at automaticamente
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_workflow_templates_updated_at
            AFTER UPDATE ON workflow_templates
            BEGIN
                UPDATE workflow_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
        """)
        
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_template_reviews_updated_at
            AFTER UPDATE ON template_reviews
            BEGIN
                UPDATE template_reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
        """)
        
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_template_collections_updated_at
            AFTER UPDATE ON template_collections
            BEGIN
                UPDATE template_collections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
        """)
        
        logger.info("✅ Triggers de updated_at criados com sucesso")
        
        # Commit das mudanças
        conn.commit()
        
        logger.info("🎉 Migração 003 concluída com sucesso!")
        logger.info("📊 Tabelas criadas:")
        logger.info("   - workflow_templates (templates de workflows)")
        logger.info("   - template_reviews (avaliações)")
        logger.info("   - template_downloads (downloads)")
        logger.info("   - template_favorites (favoritos)")
        logger.info("   - template_collections (coleções)")
        logger.info("   - template_usage (analytics de uso)")
        logger.info("🔗 Índices e triggers configurados para performance otimizada")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro na migração 003: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        return False
        
    finally:
        if 'conn' in locals():
            conn.close()


def rollback_migration(db_path: str = "synapse.db"):
    """
    Reverte a migração (remove as tabelas criadas)
    CUIDADO: Isso irá apagar todos os dados de templates!
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        logger.warning("⚠️  ATENÇÃO: Revertendo migração 003 - DADOS SERÃO PERDIDOS!")
        
        # Remover triggers
        cursor.execute("DROP TRIGGER IF EXISTS update_workflow_templates_updated_at")
        cursor.execute("DROP TRIGGER IF EXISTS update_template_reviews_updated_at")
        cursor.execute("DROP TRIGGER IF EXISTS update_template_collections_updated_at")
        
        # Remover tabelas (ordem inversa devido às foreign keys)
        cursor.execute("DROP TABLE IF EXISTS template_usage")
        cursor.execute("DROP TABLE IF EXISTS template_collections")
        cursor.execute("DROP TABLE IF EXISTS template_favorites")
        cursor.execute("DROP TABLE IF EXISTS template_downloads")
        cursor.execute("DROP TABLE IF EXISTS template_reviews")
        cursor.execute("DROP TABLE IF EXISTS workflow_templates")
        
        conn.commit()
        
        logger.info("✅ Migração 003 revertida com sucesso")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao reverter migração 003: {str(e)}")
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

