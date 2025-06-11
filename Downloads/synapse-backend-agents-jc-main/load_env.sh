#!/bin/bash
# Carregar variáveis de ambiente do arquivo .env

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "💡 Execute: cp .env.example .env"
    exit 1
fi

# Carregar variáveis de ambiente
set -a
source .env
set +a

echo "✅ Variáveis de ambiente carregadas com sucesso!"
