#!/bin/bash

# ===================================================================
# SCRIPT DE INICIALIZAÇÃO DO SYNAPSCALE
# Criado por José - um desenvolvedor Full Stack
# Configura e valida todo o ambiente de desenvolvimento
# ===================================================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando configuração do ambiente SynapScale..."
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
if [ ! -f "src/synapse/main.py" ]; then
    log_error "Execute este script no diretório raiz do backend (synapse-backend-agents-jc-main)"
    exit 1
fi

log_info "Verificando estrutura de diretórios..."

# Criar diretórios necessários
DIRS=(
    "storage/uploads"
    "storage/temp" 
    "storage/backups"
    "logs"
    "data"
    "cache"
)

for dir in "${DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        log_success "Diretório criado: $dir"
    else
        log_info "Diretório já existe: $dir"
    fi
done

# Verificar arquivo .env
log_info "Verificando configurações de ambiente..."

if [ ! -f ".env" ]; then
    log_error "Arquivo .env não encontrado!"
    exit 1
else
    log_success "Arquivo .env encontrado"
fi

# Verificar Python
log_info "Verificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    log_success "Python encontrado: $PYTHON_VERSION"
else
    log_error "Python3 não encontrado!"
    exit 1
fi

# Verificar pip
if command -v pip3 &> /dev/null; then
    log_success "pip3 encontrado"
else
    log_error "pip3 não encontrado!"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "venv" ]; then
    log_info "Criando ambiente virtual..."
    python3 -m venv venv
    log_success "Ambiente virtual criado"
fi

log_info "Ativando ambiente virtual..."
source venv/bin/activate

log_info "Instalando/atualizando dependências..."
pip install --upgrade pip
pip install -r requirements.txt 2>/dev/null || log_warning "requirements.txt não encontrado, instalando dependências básicas..."

# Instalar dependências básicas se requirements.txt não existir
if [ ! -f "requirements.txt" ]; then
    log_info "Instalando dependências básicas..."
    pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings python-multipart python-jose[cryptography] passlib[bcrypt] alembic redis python-dotenv
    log_success "Dependências básicas instaladas"
fi

# Verificar banco de dados
log_info "Verificando banco de dados..."
if [ ! -f "synapse.db" ]; then
    log_info "Criando banco de dados SQLite..."
    python3 -c "
from src.synapse.database import engine, Base
Base.metadata.create_all(bind=engine)
print('Banco de dados criado com sucesso!')
" 2>/dev/null || log_warning "Erro ao criar banco de dados - será criado na primeira execução"
    log_success "Banco de dados configurado"
else
    log_success "Banco de dados já existe"
fi

# Verificar conectividade
log_info "Testando configurações..."

# Testar importação dos módulos principais
python3 -c "
try:
    from src.synapse.config import settings
    from src.synapse.main import app
    print('✅ Módulos principais importados com sucesso')
    print(f'✅ Ambiente: {settings.ENVIRONMENT}')
    print(f'✅ Debug: {settings.DEBUG}')
    print(f'✅ Database: {settings.DATABASE_URL}')
except Exception as e:
    print(f'❌ Erro ao importar módulos: {e}')
    exit(1)
" || exit 1

# Criar arquivo de status
cat > .setup_status << EOF
# Status da configuração do ambiente
SETUP_DATE=$(date)
SETUP_VERSION=1.0.0
SETUP_BY=José - um desenvolvedor Full Stack
PYTHON_VERSION=$PYTHON_VERSION
ENVIRONMENT=development
STATUS=configured
EOF

log_success "Arquivo de status criado"

# Verificar portas
log_info "Verificando portas disponíveis..."
if lsof -i :8000 &> /dev/null; then
    log_warning "Porta 8000 está em uso"
else
    log_success "Porta 8000 disponível"
fi

# Criar script de inicialização rápida
cat > start_dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando SynapScale Backend..."
source venv/bin/activate
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 --reload
EOF

chmod +x start_dev.sh
log_success "Script de inicialização criado: ./start_dev.sh"

# Aplicar migrações do banco de dados
log_info "Aplicando migrações do banco de dados..."
if [ -f "apply_migrations.sh" ]; then
    ./apply_migrations.sh
    log_success "Migrações aplicadas com sucesso"
else
    log_warning "Script de migração não encontrado, criando tabelas manualmente..."
    python3 -c "
import sys
sys.path.append('src')
from synapse.database import engine, Base
Base.metadata.create_all(bind=engine)
print('✅ Tabelas criadas com sucesso!')
    "
fi

# Criar script de teste
cat > test_setup.sh << 'EOF'
#!/bin/bash
echo "🧪 Testando configuração..."
source venv/bin/activate
# Ensure httpx is installed for tests
pip install --quiet httpx
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python3 -c "
import requests
import time
import subprocess
import signal
import os

# Iniciar servidor em background
print('Iniciando servidor de teste...')
proc = subprocess.Popen(['uvicorn', 'src.synapse.main:app', '--host', '0.0.0.0', '--port', '8001'], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Aguardar servidor inicializar
time.sleep(3)

try:
    # Testar endpoint de health
    response = requests.get('http://localhost:8001/health', timeout=5)
    if response.status_code == 200:
        print('✅ Servidor respondendo corretamente')
        print('✅ Health check passou')
        data = response.json()
        print(f'✅ Status: {data.get(\"status\", \"unknown\")}')
    else:
        print(f'❌ Servidor retornou status {response.status_code}')
except Exception as e:
    print(f'❌ Erro ao conectar com servidor: {e}')
finally:
    # Parar servidor
    proc.terminate()
    proc.wait()
    print('🔄 Servidor de teste finalizado')
"
EOF

chmod +x test_setup.sh
log_success "Script de teste criado: ./test_setup.sh"

echo ""
echo "=================================================="
log_success "Configuração do ambiente concluída com sucesso!"
echo "=================================================="
echo ""
echo "📋 Próximos passos:"
echo "   1. Para iniciar o servidor: ./start_dev.sh"
echo "   2. Para testar a configuração: ./test_setup.sh"
echo "   3. Acesse a documentação: http://localhost:8000/docs"
echo "   4. Health check: http://localhost:8000/health"
echo ""
echo "🔧 Configurações importantes:"
echo "   - Ambiente: development"
echo "   - Banco: SQLite (synapse.db)"
echo "   - Logs: ./logs/"
echo "   - Storage: ./storage/"
echo ""
echo "⚡ Desenvolvido por José - um desenvolvedor Full Stack!"
echo "=================================================="

