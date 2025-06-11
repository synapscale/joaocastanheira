#!/bin/bash

# Script de validação para o backend SynapScale
# Este script executa verificações de conformidade, testes e validação de integridade

set -e

# Cores para output
GREEN="\033[92m"
YELLOW="\033[93m"
RED="\033[91m"
RESET="\033[0m"
BOLD="\033[1m"

# Função para imprimir cabeçalho
print_header() {
    echo -e "\n${BOLD}${YELLOW}$1${RESET}\n"
}

# Função para verificar resultado
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Sucesso: $1${RESET}"
    else
        echo -e "${RED}✗ Falha: $1${RESET}"
        exit 1
    fi
}

# Verificar estrutura de diretórios
print_header "Verificando estrutura de diretórios"
required_dirs=(
    "src/synapse"
    "src/synapse/api"
    "src/synapse/api/v1"
    "src/synapse/api/v1/endpoints"
    "src/synapse/core"
    "src/synapse/core/auth"
    "src/synapse/core/security"
    "src/synapse/core/storage"
    "src/synapse/db"
    "src/synapse/middlewares"
    "src/synapse/models"
    "src/synapse/schemas"
    "src/synapse/services"
    "docs"
    "tests"
    "tests/unit"
    "tests/integration"
    "scripts"
)

for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo -e "${RED}✗ Diretório não encontrado: $dir${RESET}"
        exit 1
    fi
    echo -e "${GREEN}✓ Diretório encontrado: $dir${RESET}"
done

# Verificar arquivos essenciais
print_header "Verificando arquivos essenciais"
required_files=(
    "src/synapse/main.py"
    "src/synapse/config.py"
    "src/synapse/constants.py"
    "src/synapse/exceptions.py"
    "src/synapse/logging.py"
    "src/synapse/api/v1/router.py"
    "src/synapse/api/v1/endpoints/files.py"
    "src/synapse/core/auth/jwt.py"
    "src/synapse/core/security/file_validation.py"
    "src/synapse/core/storage/storage_manager.py"
    "src/synapse/db/base.py"
    "src/synapse/middlewares/rate_limiting.py"
    "src/synapse/models/file.py"
    "src/synapse/schemas/file.py"
    "src/synapse/services/file_service.py"
    "docs/architecture.md"
    "docs/guia_detalhado.md"
    "docs/ai_friendly_documentation.json"
    "tests/conftest.py"
    "tests/unit/test_file_service.py"
    "tests/integration/test_file_endpoints.py"
    "scripts/start.sh"
    "scripts/run_tests.sh"
    "README.md"
    ".env.example"
    "pyproject.toml"
    "Dockerfile"
    "docker-compose.yml"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ Arquivo não encontrado: $file${RESET}"
        exit 1
    fi
    echo -e "${GREEN}✓ Arquivo encontrado: $file${RESET}"
done

# Verificar permissões de scripts
print_header "Verificando permissões de scripts"
scripts=(
    "scripts/start.sh"
    "scripts/run_tests.sh"
)

for script in "${scripts[@]}"; do
    if [ ! -x "$script" ]; then
        echo -e "${YELLOW}! Corrigindo permissões para: $script${RESET}"
        chmod +x "$script"
    fi
    echo -e "${GREEN}✓ Permissões corretas: $script${RESET}"
done

# Verificar docstrings em arquivos Python
print_header "Verificando docstrings em arquivos Python"
python_files=$(find src -name "*.py")
missing_docstrings=0

for file in $python_files; do
    if ! grep -q '"""' "$file"; then
        echo -e "${RED}✗ Docstring não encontrada: $file${RESET}"
        missing_docstrings=$((missing_docstrings + 1))
    fi
done

if [ $missing_docstrings -eq 0 ]; then
    echo -e "${GREEN}✓ Todos os arquivos Python contêm docstrings${RESET}"
else
    echo -e "${RED}✗ $missing_docstrings arquivos Python sem docstrings${RESET}"
    exit 1
fi

# Verificar consistência de imports
print_header "Verificando consistência de imports"
if command -v isort &> /dev/null; then
    isort --check-only --profile black src tests
    check_result "Imports estão consistentes"
else
    echo -e "${YELLOW}! isort não encontrado, pulando verificação de imports${RESET}"
fi

# Verificar formatação de código
print_header "Verificando formatação de código"
if command -v black &> /dev/null; then
    black --check src tests
    check_result "Código está formatado corretamente"
else
    echo -e "${YELLOW}! black não encontrado, pulando verificação de formatação${RESET}"
fi

# Verificar tipagem
print_header "Verificando tipagem"
if command -v mypy &> /dev/null; then
    mypy src
    check_result "Tipagem está correta"
else
    echo -e "${YELLOW}! mypy não encontrado, pulando verificação de tipagem${RESET}"
fi

# Verificar segurança
print_header "Verificando vulnerabilidades de segurança"
if command -v bandit &> /dev/null; then
    bandit -r src
    check_result "Nenhuma vulnerabilidade de segurança encontrada"
else
    echo -e "${YELLOW}! bandit não encontrado, pulando verificação de segurança${RESET}"
fi

# Executar testes unitários
print_header "Executando testes unitários"
if command -v pytest &> /dev/null; then
    pytest tests/unit -v
    check_result "Testes unitários passaram"
else
    echo -e "${YELLOW}! pytest não encontrado, pulando testes unitários${RESET}"
fi

# Executar testes de integração
print_header "Executando testes de integração"
if command -v pytest &> /dev/null; then
    pytest tests/integration -v
    check_result "Testes de integração passaram"
else
    echo -e "${YELLOW}! pytest não encontrado, pulando testes de integração${RESET}"
fi

# Verificar cobertura de testes
print_header "Verificando cobertura de testes"
if command -v pytest &> /dev/null && python -c "import pytest_cov" &> /dev/null; then
    pytest --cov=src --cov-report=term-missing
    check_result "Cobertura de testes verificada"
else
    echo -e "${YELLOW}! pytest-cov não encontrado, pulando verificação de cobertura${RESET}"
fi

# Verificar documentação
print_header "Verificando documentação"
if [ -f "README.md" ] && [ -f "docs/architecture.md" ] && [ -f "docs/guia_detalhado.md" ] && [ -f "docs/ai_friendly_documentation.json" ]; then
    echo -e "${GREEN}✓ Documentação completa encontrada${RESET}"
else
    echo -e "${RED}✗ Documentação incompleta${RESET}"
    exit 1
fi

# Verificar arquivos de configuração
print_header "Verificando arquivos de configuração"
if [ -f ".env.example" ] && [ -f "pyproject.toml" ] && [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ Arquivos de configuração completos encontrados${RESET}"
else
    echo -e "${RED}✗ Arquivos de configuração incompletos${RESET}"
    exit 1
fi

# Conclusão
print_header "Validação concluída com sucesso!"
echo -e "${GREEN}${BOLD}O backend SynapScale está em conformidade com as melhores práticas e pronto para empacotamento.${RESET}"
