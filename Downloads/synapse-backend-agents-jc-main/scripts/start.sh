#!/bin/bash

# Script de inicialização para o backend SynapScale
# Este script configura o ambiente e inicia a aplicação

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

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    print_header "Arquivo .env não encontrado. Criando a partir do exemplo..."
    cp .env.example .env
    echo -e "${YELLOW}Por favor, edite o arquivo .env com suas configurações antes de continuar.${RESET}"
    exit 1
fi

# Verificar dependências
print_header "Verificando dependências..."

# Verificar se o Poetry está instalado
if ! command -v poetry &> /dev/null; then
    echo -e "${RED}Poetry não encontrado. Instalando...${RESET}"
    curl -sSL https://install.python-poetry.org | python3 -
fi

# Instalar dependências
print_header "Instalando dependências..."
poetry install

# Criar diretórios de armazenamento
print_header "Criando diretórios de armazenamento..."
mkdir -p storage/image storage/video storage/audio storage/document storage/archive

# Executar migrações do banco de dados
print_header "Executando migrações do banco de dados..."
poetry run alembic upgrade head

# Iniciar a aplicação
print_header "Iniciando a aplicação..."
echo -e "${GREEN}${BOLD}Backend SynapScale iniciado com sucesso!${RESET}"
echo -e "API disponível em: ${BOLD}http://localhost:8000${RESET}"
echo -e "Documentação: ${BOLD}http://localhost:8000/docs${RESET}"
echo -e "Pressione Ctrl+C para encerrar."

# Iniciar a aplicação
poetry run uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 --reload
