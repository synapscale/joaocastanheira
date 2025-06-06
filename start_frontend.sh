#!/bin/bash
set -e

echo "🌐 INICIANDO FRONTEND JOÃO CASTANHEIRA"
echo "====================================="

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ Arquivo .env.local não encontrado!"
    echo "Execute o script setup_env.py primeiro"
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d node_modules ]; then
    echo "📦 Instalando dependências..."
    npm install --legacy-peer-deps
fi

# Verificar se backend está rodando
echo "🔍 Verificando se backend está rodando..."
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "⚠️ Backend não está rodando. Inicie o backend primeiro."
    echo "Execute: cd ../synapse-backend-agents-jc-main && ./start_backend.sh"
    exit 1
fi

echo "✅ Backend está rodando"

# Limpar cache do Next.js
echo "🧹 Limpando cache..."
rm -rf .next

# Iniciar servidor de desenvolvimento
echo "🚀 Iniciando servidor Next.js..."
npm run dev

