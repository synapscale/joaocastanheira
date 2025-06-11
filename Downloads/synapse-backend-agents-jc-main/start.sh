#!/bin/bash
# Script de inicialização do SynapScale Backend
# Este script inicia o servidor em modo de produção

set -e  # Sai em caso de erro

echo "🚀 Iniciando SynapScale Backend..."

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "❌ Ambiente virtual não encontrado. Execute ./setup.sh primeiro."
    exit 1
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado. Execute ./setup.sh primeiro."
    exit 1
fi

# Iniciar o servidor
echo "🚀 Iniciando servidor em modo de produção..."
python -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000

