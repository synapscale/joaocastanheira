#!/bin/bash
# Script para execução de testes do SynapScale Backend

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'
BOLD='\033[1m'

print_header() {
    echo -e "${BOLD}${GREEN}=== $1 ===${RESET}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${RESET}"
}

print_error() {
    echo -e "${RED}❌ $1${RESET}"
}

print_success() {
    echo -e "${GREEN}✅ $1${RESET}"
}

print_header "Executando Testes do SynapScale Backend"

# Verificar se estamos no ambiente virtual
if [[ "$VIRTUAL_ENV" != "" ]]; then
    print_success "Ambiente virtual ativo: $VIRTUAL_ENV"
else
    print_warning "Ativando ambiente virtual..."
    poetry shell
fi

# Executar testes unitários
print_header "Executando Testes Unitários"
python -m pytest tests/unit/ -v --tb=short

# Executar testes de integração
print_header "Executando Testes de Integração"
python -m pytest tests/integration/ -v --tb=short

# Executar todos os testes com cobertura
print_header "Executando Análise de Cobertura"
python -m pytest tests/ --cov=src/synapse --cov-report=html --cov-report=term-missing

print_success "Todos os testes executados com sucesso!"
print_success "Relatório de cobertura disponível em htmlcov/index.html"
