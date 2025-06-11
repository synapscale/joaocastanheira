#!/bin/bash
set -e

echo "🚀 INICIANDO BACKEND SYNAPSE"
echo "============================"

# Ativar ambiente virtual
source venv/bin/activate

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Execute o script setup_env.py primeiro"
    exit 1
fi

# Verificar conexão com banco
echo "🗄️ Testando conexão com banco..."
python -c "
from src.synapse.core.database import test_database_connection
if not test_database_connection():
    print('❌ Falha na conexão com banco')
    exit(1)
print('✅ Conexão com banco OK')
"

# Criar diretórios necessários
mkdir -p uploads logs

# Iniciar servidor
echo "🌐 Iniciando servidor FastAPI..."
python -m uvicorn src.synapse.main_optimized:app --reload --host 0.0.0.0 --port 8000

