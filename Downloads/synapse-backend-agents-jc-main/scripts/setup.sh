#!/bin/bash

# Script de setup para desenvolvimento
# Execute este script para configurar o ambiente de desenvolvimento

set -e

echo "🚀 Configurando ambiente de desenvolvimento SynapScale..."

# Verificar se Python 3.11+ está instalado
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.11+ é necessário. Versão atual: $python_version"
    exit 1
fi

echo "✅ Python $python_version detectado"

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔄 Ativando ambiente virtual..."
source venv/bin/activate

# Atualizar pip
echo "⬆️ Atualizando pip..."
pip install --upgrade pip

# Instalar dependências
echo "📚 Instalando dependências..."
pip install -r requirements.txt

# Copiar arquivo de ambiente se não existir
if [ ! -f ".env" ]; then
    echo "⚙️ Criando arquivo .env..."
    cp .env.example .env
    echo "📝 Configure o arquivo .env com suas credenciais antes de continuar"
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p logs uploads

# Verificar se PostgreSQL está rodando
if command -v pg_isready &> /dev/null; then
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        echo "✅ PostgreSQL está rodando"
    else
        echo "⚠️ PostgreSQL não está rodando. Inicie o PostgreSQL antes de continuar."
    fi
else
    echo "⚠️ PostgreSQL não encontrado. Instale o PostgreSQL antes de continuar."
fi

# Verificar se Redis está rodando
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis está rodando"
    else
        echo "⚠️ Redis não está rodando. Inicie o Redis antes de continuar."
    fi
else
    echo "⚠️ Redis não encontrado. Instale o Redis antes de continuar."
fi

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o arquivo .env com suas credenciais"
echo "2. Execute: source venv/bin/activate"
echo "3. Execute: python -m uvicorn src.synapse.main:app --reload"
echo ""
echo "📚 Documentação: http://localhost:8000/docs"

