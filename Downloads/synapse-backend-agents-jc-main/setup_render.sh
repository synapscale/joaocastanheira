#!/bin/bash
# setup_render.sh - Script de configuração para deploy no Render

set -e

echo "🚀 Configurando ambiente para Render..."

# Criar diretório de logs
mkdir -p logs

# Verificar se as variáveis essenciais estão definidas
if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "your-secret-key-here-change-in-render" ]; then
    echo "⚠️  SECRET_KEY não está configurada corretamente"
    echo "   Configure no dashboard do Render: Dashboard > Service > Environment"
fi

if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"user:password@host:port"* ]]; then
    echo "⚠️  DATABASE_URL não está configurada"
    echo "   Configure no dashboard do Render com sua URL do PostgreSQL"
fi

# Verificar se o Python e pip estão disponíveis
python --version
pip --version

# Atualizar pip
pip install --upgrade pip

echo "✅ Configuração inicial concluída"
