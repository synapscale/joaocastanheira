#!/bin/bash
# Script de configuração automática do SynapScale Backend
# Este script automatiza todo o processo de setup seguindo o README

set -e  # Sai em caso de erro

echo "🚀 SETUP AUTOMÁTICO DO SYNAPSCALE BACKEND"
echo "=========================================="

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    echo "🔧 Ativando ambiente virtual venv..."
    source venv/bin/activate
elif [ -d "venv311" ]; then
    echo "🔧 Ativando ambiente virtual venv311..."
    source venv311/bin/activate
else
    echo "❌ Ambiente virtual não encontrado!"
    echo "Execute: python3 -m venv venv && source venv/bin/activate"
    exit 1
fi

# Verificar se requirements.txt existe
if [ ! -f "requirements.txt" ]; then
    echo "❌ Arquivo requirements.txt não encontrado!"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

# Gerar arquivo .env automaticamente (opção 1)
echo "🔐 Gerando arquivo .env com chaves seguras..."
python generate_secure_keys.py --auto

# Verificar se .env foi criado
if [ ! -f ".env" ]; then
    echo "❌ Falha ao criar arquivo .env!"
    exit 1
fi

# Desativar mascaramento por padrão
echo "🔓 Desativando mascaramento de .env por padrão..."
./disable_env_masking.sh > /dev/null 2>&1 || true

echo "✅ Setup automático concluído!"
echo ""
echo "📝 Próximos passos manuais:"
echo "   1. Configure DATABASE_URL no arquivo .env"
echo "   2. Configure REDIS_URL no arquivo .env"
echo "   3. Configure chaves de API dos provedores LLM"
echo "   4. Execute: ./start_dev.sh"
echo ""
echo "🌐 Documentação da API estará em: http://localhost:8000/docs"
