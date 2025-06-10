#!/bin/bash

# Script para configurar e iniciar o ambiente de desenvolvimento
# Resolve problemas comuns com Node.js, npm e Corepack
# 
# USO: ./setup-dev.sh [opções]
# Opções:
#   --install-only    Apenas instala dependências sem iniciar servidor
#   --force          Força reinstalação das dependências
#   --help           Mostra esta mensagem

set -e  # Parar execução em caso de erro

# Função para mostrar ajuda
show_help() {
    echo "🚀 Setup de Desenvolvimento - SynapScale Frontend"
    echo ""
    echo "Uso: ./setup-dev.sh [opções]"
    echo ""
    echo "Opções:"
    echo "  --install-only    Apenas instala dependências sem iniciar servidor"
    echo "  --force          Força reinstalação das dependências"
    echo "  --help           Mostra esta mensagem"
    echo ""
    echo "Exemplos:"
    echo "  ./setup-dev.sh                    # Configura e inicia desenvolvimento"
    echo "  ./setup-dev.sh --install-only     # Apenas instala dependências"
    echo "  ./setup-dev.sh --force            # Força reinstalação e inicia"
}

# Verificar argumentos
INSTALL_ONLY=false
FORCE_INSTALL=false

for arg in "$@"; do
    case $arg in
        --install-only)
            INSTALL_ONLY=true
            shift
            ;;
        --force)
            FORCE_INSTALL=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "❌ Opção desconhecida: $arg"
            show_help
            exit 1
            ;;
    esac
done

echo "🚀 SynapScale Frontend - Setup de Desenvolvimento"
echo "=================================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ para continuar."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm para continuar."
    exit 1
fi

echo "📋 Versões detectadas:"
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"

# Desabilitar Corepack para evitar conflitos
echo ""
echo "📦 Configurando gerenciadores de pacotes..."
corepack disable 2>/dev/null || echo "   Corepack já desabilitado ou não disponível"

# Verificar .env.local
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚙️ Configurando variáveis de ambiente..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "   ✅ Arquivo .env.local criado a partir do .env.example"
    else
        echo "   ⚠️ Arquivo .env.example não encontrado, criando .env.local básico"
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_ENV=development
EOF
    fi
    echo "   📝 Configure as variáveis em .env.local se necessário"
fi

# Limpar cache se forçado ou se houver problemas
if [ "$FORCE_INSTALL" = true ] || [ ! -d "node_modules" ]; then
    echo ""
    echo "🧹 Limpando cache do npm..."
    npm cache clean --force 2>/dev/null || echo "   Cache já limpo"
fi

# Remover node_modules se forçado
if [ "$FORCE_INSTALL" = true ] && [ -d "node_modules" ]; then
    echo "🗑️ Removendo node_modules para reinstalação..."
    rm -rf node_modules package-lock.json
fi

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
if npm install --legacy-peer-deps; then
    echo "   ✅ Dependências instaladas com sucesso!"
else
    echo "   ❌ Erro na instalação das dependências"
    echo "   💡 Tente executar: npm install --legacy-peer-deps --force"
    exit 1
fi

# Verificar se build funciona
echo ""
echo "🔍 Verificando integridade do projeto..."
if npm run build > /tmp/build.log 2>&1; then
    echo "   ✅ Build verificado com sucesso!"
else
    echo "   ⚠️ Problemas detectados no build, mas continuando..."
    echo "   📄 Log salvo em /tmp/build.log"
fi

# Iniciar servidor se não for apenas instalação
if [ "$INSTALL_ONLY" = false ]; then
    echo ""
    echo "🚀 Iniciando servidor de desenvolvimento..."
    echo "   📱 A aplicação estará disponível em:"
    echo "   🌐 Local: http://localhost:3000 (ou próxima porta disponível)"
    echo ""
    echo "   💡 Para parar o servidor: Ctrl+C"
    echo "   💡 Para apenas instalar dependências: ./setup-dev.sh --install-only"
    echo ""
    npm run dev
else
    echo ""
    echo "✅ Setup concluído!"
    echo "   Para iniciar o servidor: npm run dev"
    echo "   Ou execute: ./setup-dev.sh"
fi
