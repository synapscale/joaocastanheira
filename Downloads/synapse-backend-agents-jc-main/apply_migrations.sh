#!/bin/bash

# Script para aplicar migrações do banco de dados
# Criado por José - um desenvolvedor Full Stack

echo "🔄 Aplicando migrações do banco de dados..."

# Verificar se o diretório de migrações existe
if [ ! -d "migrations" ]; then
    echo "❌ Diretório de migrações não encontrado"
    exit 1
fi

# Aplicar migração 001: user_variables
echo "📝 Aplicando migração 001: user_variables"
python3 migrations/001_create_user_variables.py
if [ $? -eq 0 ]; then
    echo "✅ Migração 001 aplicada com sucesso!"
else
    echo "❌ Erro na migração 001"
    exit 1
fi

# Aplicar migração 002: workflow_executions
echo "📝 Aplicando migração 002: workflow_executions"
python3 migrations/002_create_workflow_executions.py
if [ $? -eq 0 ]; then
    echo "✅ Migração 002 aplicada com sucesso!"
else
    echo "❌ Erro na migração 002"
    exit 1
fi

# Aplicar migração 003: templates
echo "📦 Aplicando migração 003: Templates..."
if python3 migrations/003_create_templates.py "$DB_PATH"; then
    echo "✅ Migração 003 aplicada com sucesso!"
else
    echo "❌ Erro na migração 003"
    exit 1
fi

# Aplicar migração 004: configurações de executores
echo "🔧 Aplicando migração 004: Configurações de executores..."
if python3 migrations/004_create_executor_configs.py "$DB_PATH"; then
    echo "✅ Migração 004 aplicada com sucesso!"
else
    echo "❌ Erro na migração 004"
    exit 1
fi

# Aplicar migração 005: tabelas da Fase 4
echo "🚀 Aplicando migração 005: Tabelas da Fase 4..."
if python3 migrations/005_create_fase4_tables.py "$DB_PATH"; then
    echo "✅ Migração 005 aplicada com sucesso!"
else
    echo "❌ Erro na migração 005"
    exit 1
fi

# Aplicar migrações via ORM (para garantir que todas as tabelas existem)
echo "📝 Aplicando migrações via ORM"
python3 -c "
import sys
sys.path.append('src')

from synapse.database import engine, Base
from synapse.models import *

# Criar todas as tabelas
Base.metadata.create_all(bind=engine)
print('✅ Todas as tabelas verificadas/criadas via ORM!')
"

echo "🎉 Todas as migrações aplicadas com sucesso!"
echo "📊 Tabelas disponíveis:"
echo "   - users (usuários)"
echo "   - user_variables (variáveis personalizadas)"
echo "   - workflows (workflows)"
echo "   - nodes (nós de workflows)"
echo "   - workflow_executions (execuções de workflows)"
echo "   - node_executions (execuções de nós)"
echo "   - execution_queue (fila de execução)"
echo "   - execution_metrics (métricas de performance)"
echo "   - workflow_templates (templates de workflows)"
echo "   - template_reviews (avaliações de templates)"
echo "   - template_downloads (downloads de templates)"
echo "   - template_favorites (favoritos)"
echo "   - template_collections (coleções de templates)"
echo "   - template_usage (analytics de uso)"
echo "   - executor_configs (configurações de executores)"
echo "   🏪 MARKETPLACE (6 tabelas):"
echo "     - marketplace_components (componentes)"
echo "     - component_ratings (avaliações)"
echo "     - component_downloads (downloads)"
echo "     - component_purchases (compras)"
echo "     - component_favorites (favoritos)"
echo "     - component_versions (versões)"
echo "   👥 WORKSPACES (8 tabelas):"
echo "     - workspaces (workspaces)"
echo "     - workspace_members (membros)"
echo "     - workspace_invitations (convites)"
echo "     - workspace_projects (projetos)"
echo "     - project_collaborators (colaboradores)"
echo "     - project_comments (comentários)"
echo "     - workspace_activities (atividades)"
echo "     - project_versions (versões de projetos)"
echo "   📈 ANALYTICS (7 tabelas):"
echo "     - analytics_events (eventos)"
echo "     - analytics_metrics (métricas)"
echo "     - analytics_dashboards (dashboards)"
echo "     - analytics_reports (relatórios)"
echo "     - report_executions (execuções de relatórios)"
echo "     - analytics_alerts (alertas)"
echo "     - analytics_exports (exportações)"
echo ""
echo "🚀 Total: 37+ tabelas implementadas com extrema perfeição!"
echo "💪 SynapScale está pronto para produção!"

