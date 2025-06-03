#!/bin/bash

# Script de inicialização do Frontend João Castanheira
# Execute com: ./start.sh

echo "🚀 Iniciando Frontend João Castanheira..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ para continuar."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm para continuar."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

# Verificar se arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚙️ Criando arquivo .env.local a partir do exemplo..."
    cp .env.example .env.local
    echo "📝 Configure as variáveis em .env.local se necessário"
fi

# Instalar dependências se node_modules não existir
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
else
    echo "✅ Dependências já instaladas"
fi

# Verificar se o backend está rodando
echo "🔍 Verificando conexão com o backend..."
BACKEND_URL=$(grep NEXT_PUBLIC_API_URL .env.local | cut -d'=' -f2)
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="http://localhost:8000/api/v1"
fi

# Tentar conectar com o backend
if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend conectado em $BACKEND_URL"
else
    echo "⚠️ Backend não encontrado em $BACKEND_URL"
    echo "   Certifique-se de que o backend está rodando"
fi

# Verificar configurações do Next.js
echo "🔧 Verificando configurações..."
if [ -f "next.config.js" ]; then
    echo "✅ Configuração do Next.js encontrada"
else
    echo "⚠️ Arquivo next.config.js não encontrado"
fi

# Verificar se Tailwind está configurado
if [ -f "tailwind.config.ts" ]; then
    echo "✅ Tailwind CSS configurado"
else
    echo "⚠️ Tailwind CSS não configurado"
fi

# Limpar cache se solicitado
if [ "$1" = "clean" ]; then
    echo "🧹 Limpando cache..."
    rm -rf .next
    rm -rf node_modules/.cache
fi

# Build para produção se solicitado
if [ "$1" = "build" ]; then
    echo "🏗️ Fazendo build para produção..."
    npm run build
    echo "✅ Build concluído!"
    echo "Para iniciar em produção, execute: npm start"
    exit 0
fi

# Iniciar servidor de desenvolvimento
echo "🌟 Iniciando servidor de desenvolvimento..."
echo "📍 Frontend disponível em: http://localhost:3000"
echo "🔗 API Backend em: $BACKEND_URL"
echo ""
echo "Para parar o servidor, pressione Ctrl+C"
echo ""

# Executar em modo de desenvolvimento
if [ "$1" = "dev" ] || [ -z "$1" ]; then
    npm run dev
elif [ "$1" = "start" ]; then
    npm start
else
    echo "❌ Comando não reconhecido: $1"
    echo "Uso: ./start.sh [dev|build|clean|start]"
    exit 1
fi

