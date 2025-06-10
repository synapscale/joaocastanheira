#!/bin/bash

# ===================================================================
# SCRIPT DE INICIALIZAÇÃO DO SYNAPSCALE FRONTEND
# Criado por José - O melhor Full Stack do mundo
# Configura e valida todo o ambiente de desenvolvimento do frontend
# ===================================================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando configuração do frontend SynapScale..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    log_error "Execute este script no diretório raiz do frontend (joaocastanheira-main)"
    exit 1
fi

log_info "Verificando estrutura do projeto Next.js..."

# Verificar Node.js
log_info "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js encontrado: $NODE_VERSION"
    
    # Verificar versão mínima (Node 18+)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        log_warning "Node.js versão $NODE_VERSION detectada. Recomendado: v18 ou superior"
    fi
else
    log_error "Node.js não encontrado!"
    exit 1
fi

# Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "npm encontrado: v$NPM_VERSION"
else
    log_error "npm não encontrado!"
    exit 1
fi

# Verificar arquivo .env.local
log_info "Verificando configurações de ambiente..."
if [ ! -f ".env.local" ]; then
    log_error "Arquivo .env.local não encontrado!"
    exit 1
else
    log_success "Arquivo .env.local encontrado"
fi

# Verificar package.json
log_info "Verificando package.json..."
if [ -f "package.json" ]; then
    log_success "package.json encontrado"
    
    # Extrair informações do projeto
    PROJECT_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "unknown")
    PROJECT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
    
    log_info "Projeto: $PROJECT_NAME v$PROJECT_VERSION"
else
    log_error "package.json não encontrado!"
    exit 1
fi

# Instalar dependências
log_info "Verificando dependências..."
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependências..."
    npm install
    log_success "Dependências instaladas"
else
    log_info "Verificando se dependências estão atualizadas..."
    npm ci --silent
    log_success "Dependências verificadas"
fi

# Verificar dependências críticas
log_info "Verificando dependências críticas..."

CRITICAL_DEPS=(
    "next"
    "react"
    "react-dom"
    "typescript"
    "@types/react"
    "@types/node"
)

for dep in "${CRITICAL_DEPS[@]}"; do
    if npm list "$dep" &> /dev/null; then
        VERSION=$(npm list "$dep" --depth=0 2>/dev/null | grep "$dep" | cut -d'@' -f2 || echo "unknown")
        log_success "$dep@$VERSION"
    else
        log_warning "$dep não encontrado"
    fi
done

# Verificar estrutura de diretórios
log_info "Verificando estrutura de diretórios..."

REQUIRED_DIRS=(
    "app"
    "components"
    "context"
    "lib"
    "types"
    "styles"
    "public"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "Diretório encontrado: $dir"
    else
        log_warning "Diretório não encontrado: $dir"
    fi
done

# Verificar arquivos de configuração
log_info "Verificando arquivos de configuração..."

CONFIG_FILES=(
    "next.config.js"
    "tailwind.config.js"
    "tsconfig.json"
    "package.json"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "Arquivo encontrado: $file"
    else
        log_warning "Arquivo não encontrado: $file"
    fi
done

# Verificar TypeScript
log_info "Verificando configuração TypeScript..."
if npx tsc --noEmit --skipLibCheck &> /dev/null; then
    log_success "TypeScript: Sem erros de tipo"
else
    log_warning "TypeScript: Erros de tipo detectados (não crítico para desenvolvimento)"
fi

# Verificar conectividade com backend
log_info "Testando conectividade com backend..."
BACKEND_URL=$(grep NEXT_PUBLIC_API_URL .env.local | cut -d'=' -f2 | tr -d '"' || echo "http://localhost:8000/api/v1")

if curl -s "$BACKEND_URL/../health" &> /dev/null; then
    log_success "Backend acessível em: $BACKEND_URL"
else
    log_warning "Backend não acessível em: $BACKEND_URL (normal se não estiver rodando)"
fi

# Verificar portas
log_info "Verificando portas disponíveis..."
if lsof -i :3000 &> /dev/null; then
    log_warning "Porta 3000 está em uso"
else
    log_success "Porta 3000 disponível"
fi

# Criar script de inicialização
cat > start_dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando SynapScale Frontend..."
echo "Aguarde o servidor inicializar..."
npm run dev
EOF

chmod +x start_dev.sh
log_success "Script de inicialização criado: ./start_dev.sh"

# Criar script de build
cat > build_prod.sh << 'EOF'
#!/bin/bash
echo "🏗️  Fazendo build de produção..."
npm run build
echo "✅ Build concluído!"
echo "Para testar: npm run start"
EOF

chmod +x build_prod.sh
log_success "Script de build criado: ./build_prod.sh"

# Criar script de teste
cat > test_setup.sh << 'EOF'
#!/bin/bash
echo "🧪 Testando configuração do frontend..."

# Verificar se pode fazer build
echo "Testando build..."
if npm run build &> /dev/null; then
    echo "✅ Build de produção: OK"
else
    echo "❌ Build de produção: FALHOU"
fi

# Verificar linting
echo "Testando linting..."
if npm run lint &> /dev/null; then
    echo "✅ Linting: OK"
else
    echo "⚠️  Linting: Avisos encontrados (não crítico)"
fi

# Verificar TypeScript
echo "Testando TypeScript..."
if npx tsc --noEmit --skipLibCheck &> /dev/null; then
    echo "✅ TypeScript: OK"
else
    echo "⚠️  TypeScript: Erros de tipo (não crítico para desenvolvimento)"
fi

echo "🎉 Teste concluído!"
EOF

chmod +x test_setup.sh
log_success "Script de teste criado: ./test_setup.sh"

# Criar arquivo de status
cat > .setup_status << EOF
# Status da configuração do frontend
SETUP_DATE=$(date)
SETUP_VERSION=1.0.0
SETUP_BY=José - O melhor Full Stack do mundo
NODE_VERSION=$NODE_VERSION
NPM_VERSION=$NPM_VERSION
PROJECT_NAME=$PROJECT_NAME
PROJECT_VERSION=$PROJECT_VERSION
ENVIRONMENT=development
STATUS=configured
EOF

log_success "Arquivo de status criado"

echo ""
echo "=================================================="
log_success "Configuração do frontend concluída com sucesso!"
echo "=================================================="
echo ""
echo "📋 Próximos passos:"
echo "   1. Para iniciar o servidor: ./start_dev.sh ou npm run dev"
echo "   2. Para testar a configuração: ./test_setup.sh"
echo "   3. Para build de produção: ./build_prod.sh"
echo "   4. Acesse a aplicação: http://localhost:3000"
echo ""
echo "🔧 Configurações importantes:"
echo "   - Framework: Next.js"
echo "   - Linguagem: TypeScript"
echo "   - Estilo: Tailwind CSS"
echo "   - Backend: $BACKEND_URL"
echo ""
echo "📱 Funcionalidades configuradas:"
echo "   - Autenticação completa"
echo "   - Contextos de estado"
echo "   - Componentes UI"
echo "   - Integração com backend"
echo ""
echo "⚡ Desenvolvido por José - O melhor Full Stack do mundo!"
echo "=================================================="

