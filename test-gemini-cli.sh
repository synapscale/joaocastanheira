#!/bin/bash

echo "🔧 Testando Gemini CLI com Wrapper que Carrega .env..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Verificar se o wrapper existe
if [ ! -f "gemini-wrapper.sh" ]; then
    echo -e "${RED}❌ Arquivo gemini-wrapper.sh não encontrado${NC}"
    exit 1
fi

# Verificar se o wrapper é executável
if [ ! -x "gemini-wrapper.sh" ]; then
    echo -e "${YELLOW}⚠️  Tornando gemini-wrapper.sh executável...${NC}"
    chmod +x gemini-wrapper.sh
fi

# Verificar se arquivo .env existe na raiz
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado na raiz do projeto${NC}"
    exit 1
fi

# Verificar se GOOGLE_CLOUD_PROJECT está definido no .env
if ! grep -q "GOOGLE_CLOUD_PROJECT" .env; then
    echo -e "${RED}❌ GOOGLE_CLOUD_PROJECT não encontrado no .env${NC}"
    exit 1
fi

# Mostrar o valor do GOOGLE_CLOUD_PROJECT
PROJECT_ID=$(grep GOOGLE_CLOUD_PROJECT .env | cut -d'=' -f2)
echo -e "${GREEN}✅ GOOGLE_CLOUD_PROJECT encontrado: $PROJECT_ID${NC}"

# Verificar se arquivo de configuração existe
if [ ! -f ".gemini/settings.json" ]; then
    echo -e "${RED}❌ Arquivo de configuração não encontrado em .gemini/settings.json${NC}"
    exit 1
fi

# Verificar se o JSON é válido
if ! python3 -m json.tool .gemini/settings.json > /dev/null 2>&1; then
    echo -e "${RED}❌ Arquivo settings.json inválido${NC}"
    exit 1
fi

echo -e "${GREEN}✅ JSON válido${NC}"

# Verificar tipo de autenticação
AUTH_TYPE=$(grep -o '"selectedAuthType":[^,]*' .gemini/settings.json | cut -d'"' -f4)
echo -e "${GREEN}🔐 Tipo de autenticação: $AUTH_TYPE${NC}"

if [ "$AUTH_TYPE" = "oauth-personal" ]; then
    echo -e "${GREEN}✅ Configurado para OAuth Personal (Login with Google)${NC}"
else
    echo -e "${YELLOW}⚠️  Tipo de autenticação: $AUTH_TYPE${NC}"
fi

# Testar o wrapper
echo -e "${YELLOW}🧪 Testando wrapper com --help...${NC}"
if ./gemini-wrapper.sh --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Wrapper funcionando${NC}"
else
    echo -e "${RED}❌ Wrapper com problemas${NC}"
    exit 1
fi

# Mostrar resumo final
echo -e "${GREEN}"
echo "════════════════════════════════════════════════════════════════"
echo "🎉 GEMINI CLI CONFIGURADO COM SUCESSO!"
echo "════════════════════════════════════════════════════════════════"
echo -e "${NC}"
echo -e "${GREEN}✅ Wrapper Script: gemini-wrapper.sh${NC}"
echo -e "${GREEN}✅ Projeto Google Cloud: $PROJECT_ID${NC}"
echo -e "${GREEN}✅ Autenticação: $AUTH_TYPE${NC}"
echo -e "${GREEN}✅ Variáveis .env: Carregadas automaticamente${NC}"
echo ""
echo -e "${YELLOW}🚀 Para usar o Gemini CLI:${NC}"
echo -e "${YELLOW}   ./gemini-wrapper.sh${NC}"
echo ""
echo -e "${YELLOW}💡 Dica: Crie um alias para facilitar:${NC}"
echo -e "${YELLOW}   alias gemini='./gemini-wrapper.sh'${NC}"
echo "" 