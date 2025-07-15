#!/bin/bash

# Script wrapper para carregar variáveis .env antes de executar Gemini CLI

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Carregando variáveis de ambiente do .env...${NC}"

# Carregar variáveis do .env da raiz do projeto
if [ -f ".env" ]; then
    # Ler e exportar cada linha do .env, sobrescrevendo variáveis existentes
    while IFS= read -r line; do
        # Ignorar linhas vazias e comentários
        if [[ ! -z "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
            # Exportar variável
            export "$line"
        fi
    done < .env
    
    echo -e "${GREEN}✅ Variáveis carregadas e sobrescritas do .env${NC}"
    
    # Mostrar o GOOGLE_CLOUD_PROJECT carregado
    echo -e "${YELLOW}🔍 GOOGLE_CLOUD_PROJECT: $GOOGLE_CLOUD_PROJECT${NC}"
else
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado na raiz do projeto${NC}"
fi

# Executar Gemini CLI com as variáveis carregadas
echo -e "${GREEN}🚀 Iniciando Gemini CLI com variáveis carregadas...${NC}"
gemini "$@" 