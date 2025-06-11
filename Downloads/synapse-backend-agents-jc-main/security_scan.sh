#!/bin/bash

# ==============================================================================
# SCRIPT DE DETECÇÃO E LIMPEZA DE CREDENCIAIS EXPOSTAS
# SynapScale Backend Security Scanner
# ==============================================================================

set -e

echo "🔍 INICIANDO VERIFICAÇÃO DE SEGURANÇA..."
echo "========================================"

# Cores para output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
CRITICAL_ISSUES=0
WARNING_ISSUES=0
INFO_ISSUES=0

# Função para log
log_critical() {
    echo -e "${RED}🚨 CRÍTICO: $1${NC}"
    ((CRITICAL_ISSUES++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  ATENÇÃO: $1${NC}"
    ((WARNING_ISSUES++))
}

log_info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
    ((INFO_ISSUES++))
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# ==============================================================================
# VERIFICAÇÕES DE SEGURANÇA
# ==============================================================================

echo -e "\n${BLUE}📋 Verificando chaves hardcoded...${NC}"

# 1. Verificar chaves de API expostas
echo "🔑 Procurando por chaves de API..."
if grep -r -n --include="*.py" --include="*.js" --include="*.ts" --include="*.json" --include="*.yml" --include="*.yaml" \
   -E "(sk-[a-zA-Z0-9_-]{20,}|xoxb-[a-zA-Z0-9_-]+|ghp_[a-zA-Z0-9_-]+|AIza[a-zA-Z0-9_-]+)" . 2>/dev/null; then
    log_critical "Chaves de API reais encontradas no código!"
else
    log_success "Nenhuma chave de API real encontrada"
fi

# 2. Verificar senhas hardcoded
echo "🔐 Procurando por senhas hardcoded..."
HARDCODED_PASSWORDS=$(grep -r -n --include="*.py" --include="*.js" --include="*.ts" --include="*.json" --include="*.yml" --include="*.yaml" \
   -E "password.*=.*['\"][^'\"]{8,}['\"]" . 2>/dev/null | \
   grep -v "test\|demo\|example\|password_here\|your_password\|senha_forte\|config.get\|context.get" || true)

if [ ! -z "$HARDCODED_PASSWORDS" ]; then
    log_critical "Possíveis senhas hardcoded encontradas:"
    echo "$HARDCODED_PASSWORDS"
else
    log_success "Nenhuma senha hardcoded suspeita encontrada"
fi

# 3. Verificar tokens JWT hardcoded
echo "🎫 Procurando por tokens JWT..."
if grep -r -n --include="*.py" --include="*.js" --include="*.ts" \
   -E "eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*" . 2>/dev/null; then
    log_critical "Possíveis tokens JWT encontrados no código!"
else
    log_success "Nenhum token JWT encontrado"
fi

# 4. Verificar chaves secretas padrão
echo "🗝️  Verificando chaves secretas padrão..."
SECRET_PATTERNS="your-secret-key\|change-in-production\|demo-key\|test-key\|development-key"
if grep -r -n --include="*.py" --include="*.js" --include="*.ts" --include="*.json" \
   "$SECRET_PATTERNS" . 2>/dev/null | grep -v "# \|#\|errors.append\|description=" | head -5; then
    log_critical "Chaves secretas padrão encontradas - DEVEM ser alteradas!"
else
    log_success "Nenhuma chave secreta padrão encontrada"
fi

# 5. Verificar URLs de banco com credenciais
echo "🗄️  Verificando URLs de banco com credenciais..."
if grep -r -n --include="*.py" --include="*.js" --include="*.ts" --include="*.json" --include="*.yml" \
   -E "://[^:]+:[^@]+@" . 2>/dev/null | grep -v "username:password\|user:pass\|example" | head -5; then
    log_warning "URLs de banco com credenciais encontradas"
else
    log_success "Nenhuma URL de banco com credenciais exposta"
fi

# ==============================================================================
# VERIFICAR ARQUIVOS SENSÍVEIS
# ==============================================================================

echo -e "\n${BLUE}📁 Verificando arquivos sensíveis...${NC}"

# Verificar se .env existe e não está no git
if [ -f ".env" ]; then
    if git check-ignore .env >/dev/null 2>&1; then
        log_success "Arquivo .env existe e está no .gitignore"
    else
        log_critical "Arquivo .env existe mas NÃO está no .gitignore!"
    fi
else
    log_info "Arquivo .env não encontrado - use .env.example como base"
fi

# Verificar .env.example
if [ -f ".env.example" ]; then
    log_success "Arquivo .env.example encontrado"
    # Verificar se não tem credenciais reais
    if grep -E "(sk-[a-zA-Z0-9_-]{20,}|[a-zA-Z0-9_-]{32,})" .env.example >/dev/null 2>&1; then
        log_warning ".env.example pode conter credenciais reais"
    fi
else
    log_warning "Arquivo .env.example não encontrado"
fi

# Verificar chaves privadas
echo "🔑 Procurando por chaves privadas..."
if find . -name "*.pem" -o -name "*.key" -o -name "*_rsa" -o -name "id_rsa" 2>/dev/null | grep -v ".git" | head -5; then
    log_warning "Arquivos de chave privada encontrados"
else
    log_success "Nenhuma chave privada encontrada"
fi

# ==============================================================================
# VERIFICAR CONFIGURAÇÕES
# ==============================================================================

echo -e "\n${BLUE}⚙️  Verificando configurações...${NC}"

# Verificar se há validação de segurança no código
if grep -r "validate_settings\|security.*check" src/ >/dev/null 2>&1; then
    log_success "Validações de segurança encontradas no código"
else
    log_warning "Considere adicionar validações de segurança"
fi

# Verificar HTTPS em produção
if grep -r "ENABLE_HTTPS\|SECURE_COOKIES" src/ >/dev/null 2>&1; then
    log_success "Configurações HTTPS encontradas"
else
    log_info "Considere configurar HTTPS para produção"
fi

# ==============================================================================
# RELATÓRIO FINAL
# ==============================================================================

echo -e "\n${BLUE}📊 RELATÓRIO DE SEGURANÇA${NC}"
echo "=========================="
echo -e "🚨 Problemas Críticos: ${RED}$CRITICAL_ISSUES${NC}"
echo -e "⚠️  Avisos: ${YELLOW}$WARNING_ISSUES${NC}"
echo -e "ℹ️  Informações: $INFO_ISSUES"

if [ $CRITICAL_ISSUES -gt 0 ]; then
    echo -e "\n${RED}❌ AÇÃO NECESSÁRIA: Corrija os problemas críticos antes de fazer deploy!${NC}"
    exit 1
elif [ $WARNING_ISSUES -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  ATENÇÃO: Revise os avisos para melhorar a segurança${NC}"
    exit 2
else
    echo -e "\n${GREEN}✅ TUDO OK: Nenhum problema crítico encontrado!${NC}"
    exit 0
fi
