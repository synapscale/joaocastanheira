#!/bin/bash
set -e

echo "🌐 INICIANDO FRONTEND JOÃO CASTANHEIRA"
echo "====================================="

# Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚙️  Configurando variáveis de ambiente..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "   ✅ Arquivo .env.local criado a partir do .env.example"
    else
        echo "   ⚠️  Arquivo .env.example não encontrado, criando .env.local básico"
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_ENV=development
EOF
    fi
    echo "   📝 Configure as variáveis em .env.local se necessário"
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
