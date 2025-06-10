#!/bin/bash
set -e

echo "🌐 INICIANDO FRONTEND JOÃO CASTANHEIRA"
echo "====================================="

# Determinar arquivo de variáveis de ambiente
if [ -f ".env.local" ]; then
    ENV_FILE=".env.local"
elif [ -f ".env.production" ]; then
    ENV_FILE=".env.production"
else
    echo "❌ Nenhum arquivo .env.local ou .env.production encontrado."
    echo "    Crie um arquivo de variáveis de ambiente antes de iniciar."
    exit 1
fi

# Carregar variáveis para uso no script
set -o allexport
source "$ENV_FILE"
set +o allexport

# Verificar se node_modules existe
if [ ! -d node_modules ]; then
    echo "📦 Instalando dependências..."
    npm install --legacy-peer-deps
fi

# Verificar se backend está rodando, se a URL estiver definida
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
    API_HEALTH_URL="${NEXT_PUBLIC_API_URL%/}/health"
    echo "🔍 Verificando se backend está rodando em $NEXT_PUBLIC_API_URL..."
    if ! curl -fsS --max-time 5 "$API_HEALTH_URL" > /dev/null; then
        echo "⚠️ Backend não está rodando em $NEXT_PUBLIC_API_URL."
        echo "    Certifique-se de iniciar o backend ou ajuste NEXT_PUBLIC_API_URL."
        exit 1
    fi
    echo "✅ Backend está rodando"
else
    echo "⚠️ NEXT_PUBLIC_API_URL não definida. Pulando verificação do backend."
fi

# Limpar cache do Next.js
echo "🧹 Limpando cache..."
rm -rf .next

# Iniciar servidor de desenvolvimento
echo "🚀 Iniciando servidor Next.js..."
npm run dev
