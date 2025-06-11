#!/bin/bash
# Script de inicialização para Render.com
# Este script é otimizado para o ambiente Render

set -e  # Sai em caso de erro

echo "🚀 Iniciando SynapScale Backend no Render..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não definida. Configure no dashboard do Render."
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ SECRET_KEY não definida. Configure no dashboard do Render."
    exit 1
fi

# Aplicar migrações se necessário
echo "🔧 Aplicando migrações do banco de dados..."
cd /opt/render/project/src
python -m alembic upgrade head || echo "⚠️ Migrações não aplicadas (pode ser normal na primeira execução)"

# Iniciar o servidor
echo "🚀 Iniciando servidor..."
exec python -m uvicorn synapse.main:app --host 0.0.0.0 --port ${PORT:-8000}

