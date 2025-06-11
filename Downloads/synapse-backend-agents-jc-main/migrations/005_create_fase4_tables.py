"""
Migração 005: Criação das tabelas da Fase 4
Criado por José - um desenvolvedor Full Stack
Marketplace, Workspaces e Analytics
"""

import sqlite3
import logging
from datetime import datetime

def apply_migration(db_path: str):
    """Aplica a migração 005 - Tabelas da Fase 4"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🚀 Aplicando migração 005: Tabelas da Fase 4...")
        
        # ==================== MARKETPLACE ====================
        
        # Tabela de componentes do marketplace
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS marketplace_components (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100) NOT NULL,
            component_type VARCHAR(50) NOT NULL,
            tags TEXT, -- JSON array
            price DECIMAL(10,2) DEFAULT 0.00,
            is_free BOOLEAN DEFAULT TRUE,
            author_id INTEGER NOT NULL,
            version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
            content TEXT, -- JSON content
            metadata TEXT, -- JSON metadata
            downloads_count INTEGER DEFAULT 0,
            rating_average DECIMAL(3,2) DEFAULT 0.00,
            rating_count INTEGER DEFAULT 0,
            is_featured BOOLEAN DEFAULT FALSE,
            is_approved BOOLEAN DEFAULT FALSE,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de avaliações de componentes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS component_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            component_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            review TEXT,
            helpful_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (component_id) REFERENCES marketplace_components (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(component_id, user_id)
        )
        """)
        
        # Tabela de downloads de componentes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS component_downloads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            component_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            version VARCHAR(50),
            download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45),
            user_agent TEXT,
            FOREIGN KEY (component_id) REFERENCES marketplace_components (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de compras de componentes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS component_purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            component_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD',
            payment_method VARCHAR(50),
            transaction_id VARCHAR(255),
            status VARCHAR(20) DEFAULT 'pending',
            purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (component_id) REFERENCES marketplace_components (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de favoritos de componentes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS component_favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            component_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (component_id) REFERENCES marketplace_components (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(component_id, user_id)
        )
        """)
        
        # Tabela de versões de componentes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS component_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            component_id INTEGER NOT NULL,
            version VARCHAR(50) NOT NULL,
            content TEXT, -- JSON content
            changelog TEXT,
            file_path VARCHAR(500),
            file_size INTEGER,
            downloads_count INTEGER DEFAULT 0,
            is_latest BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (component_id) REFERENCES marketplace_components (id) ON DELETE CASCADE,
            UNIQUE(component_id, version)
        )
        """)
        
        # ==================== WORKSPACES ====================
        
        # Tabela de workspaces
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS workspaces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            slug VARCHAR(255) UNIQUE,
            is_public BOOLEAN DEFAULT FALSE,
            owner_id INTEGER NOT NULL,
            settings TEXT, -- JSON settings
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de membros de workspaces
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS workspace_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workspace_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            role VARCHAR(20) DEFAULT 'member',
            permissions TEXT, -- JSON permissions
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            invited_by INTEGER,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE SET NULL,
            UNIQUE(workspace_id, user_id)
        )
        """)
        
        # Tabela de convites para workspaces
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS workspace_invitations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workspace_id INTEGER NOT NULL,
            email VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'member',
            permissions TEXT, -- JSON permissions
            token VARCHAR(255) UNIQUE NOT NULL,
            invited_by INTEGER NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            responded_at TIMESTAMP,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de projetos
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS workspace_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workspace_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            workflow_data TEXT, -- JSON workflow
            status VARCHAR(20) DEFAULT 'active',
            owner_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de colaboradores de projetos
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_collaborators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            permissions TEXT, -- JSON permissions
            added_by INTEGER NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES workspace_projects (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (added_by) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(project_id, user_id)
        )
        """)
        
        # Tabela de comentários em projetos
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            node_id VARCHAR(255), -- ID do nó específico
            position_x DECIMAL(10,2),
            position_y DECIMAL(10,2),
            is_resolved BOOLEAN DEFAULT FALSE,
            resolved_by INTEGER,
            resolved_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES workspace_projects (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (resolved_by) REFERENCES users (id) ON DELETE SET NULL
        )
        """)
        
        # Tabela de atividades em workspaces
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS workspace_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workspace_id INTEGER NOT NULL,
            project_id INTEGER,
            user_id INTEGER NOT NULL,
            action VARCHAR(100) NOT NULL,
            target_type VARCHAR(50),
            target_id INTEGER,
            metadata TEXT, -- JSON metadata
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES workspace_projects (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de versões de projetos
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            version VARCHAR(50) NOT NULL,
            workflow_data TEXT, -- JSON workflow snapshot
            description TEXT,
            created_by INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES workspace_projects (id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # ==================== ANALYTICS ====================
        
        # Tabela de eventos de analytics
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            session_id VARCHAR(255),
            event_type VARCHAR(100) NOT NULL,
            event_name VARCHAR(255) NOT NULL,
            properties TEXT, -- JSON properties
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45),
            user_agent TEXT,
            page_url TEXT,
            referrer TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        )
        """)
        
        # Tabela de métricas agregadas
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analytics_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_type VARCHAR(50) NOT NULL,
            metric_name VARCHAR(100) NOT NULL,
            value DECIMAL(15,4) NOT NULL,
            dimensions TEXT, -- JSON dimensions
            timestamp TIMESTAMP NOT NULL,
            granularity VARCHAR(20) NOT NULL, -- hour, day, week, month
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Tabela de dashboards
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analytics_dashboards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            layout TEXT, -- JSON layout
            widgets TEXT, -- JSON widgets
            is_public BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de relatórios
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analytics_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            query_config TEXT, -- JSON query configuration
            schedule_config TEXT, -- JSON schedule
            status VARCHAR(20) DEFAULT 'draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de execuções de relatórios
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS report_executions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id INTEGER NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            result_data TEXT, -- JSON result
            error_message TEXT,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (report_id) REFERENCES analytics_reports (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de alertas
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analytics_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            rule_config TEXT, -- JSON rule configuration
            notification_config TEXT, -- JSON notification settings
            status VARCHAR(20) DEFAULT 'active',
            last_triggered TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de exportações
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analytics_exports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            export_type VARCHAR(50) NOT NULL,
            query_config TEXT, -- JSON query
            format VARCHAR(20) NOT NULL, -- csv, json, xlsx
            status VARCHAR(20) DEFAULT 'pending',
            file_path VARCHAR(500),
            file_size INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            expires_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """)
        
        # ==================== ÍNDICES PARA PERFORMANCE ====================
        
        # Índices para marketplace
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_components_category ON marketplace_components(category)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_components_type ON marketplace_components(component_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_components_author ON marketplace_components(author_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_components_featured ON marketplace_components(is_featured)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_marketplace_components_approved ON marketplace_components(is_approved)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_component_ratings_component ON component_ratings(component_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_component_downloads_component ON component_downloads(component_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_component_downloads_user ON component_downloads(user_id)")
        
        # Índices para workspaces
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workspaces_public ON workspaces(is_public)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workspace_projects_workspace ON workspace_projects(workspace_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workspace_projects_owner ON workspace_projects(owner_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_project_collaborators_project ON project_collaborators(project_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_project_comments_project ON project_comments(project_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workspace_activities_workspace ON workspace_activities(workspace_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workspace_activities_user ON workspace_activities(user_id)")
        
        # Índices para analytics
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_metrics_type ON analytics_metrics(metric_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_metrics_timestamp ON analytics_metrics(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_user ON analytics_dashboards(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_reports_user ON analytics_reports(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_report_executions_report ON report_executions(report_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_alerts_user ON analytics_alerts(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_exports_user ON analytics_exports(user_id)")
        
        conn.commit()
        conn.close()
        
        print("✅ Migração 005 aplicada com sucesso!")
        print("📊 Tabelas da Fase 4 criadas:")
        print("   🏪 Marketplace: 6 tabelas")
        print("   👥 Workspaces: 8 tabelas") 
        print("   📈 Analytics: 7 tabelas")
        print("   🚀 Total: 21 novas tabelas + índices otimizados")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao aplicar migração 005: {e}")
        logging.error(f"Migration 005 failed: {e}")
        return False

if __name__ == "__main__":
    # Para teste local
    apply_migration("synapse.db")

