#!/bin/bash
set -e

echo "🚀 Iniciando SynapScale Backend em produção..."

# Verificar se o Python está disponível
python --version

# Verificar se as variáveis de ambiente essenciais estão definidas
if [ -z "$PORT" ]; then
    export PORT=8000
    echo "⚠️  PORT não definida, usando padrão: 8000"
fi

# Iniciar a aplicação
echo "🌟 Iniciando FastAPI com Uvicorn..."
exec python -m uvicorn src.synapse.main_optimized:app \
    --host 0.0.0.0 \
    --port $PORT \
    --workers 1 \
    --access-log \
    --log-level info
