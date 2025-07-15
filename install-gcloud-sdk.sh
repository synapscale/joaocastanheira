#!/bin/bash

echo "🔧 Instalando Google Cloud SDK no macOS..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# Verificar se gcloud já está instalado
if command -v gcloud &> /dev/null; then
    echo -e "${GREEN}✅ Google Cloud SDK já está instalado!${NC}"
    echo -e "${GREEN}📦 Versão: $(gcloud --version | head -n1)${NC}"
    exit 0
fi

# Verificar se Homebrew está instalado
if ! command -v brew &> /dev/null; then
    echo -e "${RED}❌ Homebrew não encontrado. Instalando...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Instalar Google Cloud SDK via Homebrew
echo -e "${YELLOW}⬇️  Instalando Google Cloud SDK via Homebrew...${NC}"
brew install --cask google-cloud-sdk

# Verificar instalação
if command -v gcloud &> /dev/null; then
    echo -e "${GREEN}✅ Google Cloud SDK instalado com sucesso!${NC}"
    echo -e "${GREEN}📦 Versão: $(gcloud --version | head -n1)${NC}"
    
    # Configurar gcloud
    echo -e "${YELLOW}🔧 Configurando gcloud...${NC}"
    gcloud init
    
    echo -e "${GREEN}🎉 Configuração concluída!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Próximos passos para OAuth2:${NC}"
    echo "1. gcloud services enable generativeai.googleapis.com"
    echo "2. Configurar credenciais OAuth2 no Google Cloud Console"
    echo "3. Baixar google-credentials.json"
    echo "4. Configurar .gemini/.env"
    echo ""
    echo -e "${GREEN}📖 Veja o guia completo em: OAUTH2-GOOGLE-SETUP.md${NC}"
else
    echo -e "${RED}❌ Falha na instalação do Google Cloud SDK${NC}"
    exit 1
fi 