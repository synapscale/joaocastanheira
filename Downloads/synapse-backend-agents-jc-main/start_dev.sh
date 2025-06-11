#!/bin/bash
# Script de inicialização do SynapScale Backend em modo de desenvolvimento
# Este script inicia o servidor com reload automático

set -e  # Sai em caso de erro

echo "🚀 Iniciando SynapScale Backend em modo de desenvolvimento..."

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

# Iniciar o servidor com reload
echo "🚀 Iniciando servidor com reload automático..."
python -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir src

