#!/bin/bash
# Script de configuração do SynapScale Backend
# Este script configura o ambiente para o SynapScale Backend

set -e  # Sai em caso de erro

echo "🚀 Iniciando configuração do SynapScale Backend..."

# Verificar se Python 3.11+ está instalado
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "📋 Versão do Python detectada: $python_version"

# Validar se a versão do Python é 3.11 ou superior
python - "$python_version" <<'EOF'
import sys
version = sys.argv[1]
major, minor = (int(x) for x in version.split('.')[:2])
if (major, minor) < (3, 11):
    print(f"❌ Python 3.11 ou superior é necessário. Versão detectada: {version}")
    sys.exit(1)
EOF

# Criar ambiente virtual
echo "🔧 Criando ambiente virtual..."
python3 -m venv venv
source venv/bin/activate

# Atualizar pip
echo "🔄 Atualizando pip..."
pip install --upgrade pip

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env a partir do exemplo..."
    cp .env.example .env
    echo "⚠️ Por favor, edite o arquivo .env com suas configurações!"
else
    echo "✅ Arquivo .env já existe."
fi

# Verificar conexão com o banco de dados
echo "🔍 Verificando conexão com o banco de dados..."
python -c "
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv('DATABASE_URL')
schema = os.getenv('DATABASE_SCHEMA', 'synapscale_db')

if not database_url:
    print('❌ DATABASE_URL não configurada no arquivo .env')
    exit(1)

try:
    engine = create_engine(database_url)
    with engine.connect() as conn:
        result = conn.execute(text(f'SELECT 1'))
        print('✅ Conexão com o banco de dados estabelecida com sucesso!')
except Exception as e:
    print(f'❌ Erro ao conectar ao banco de dados: {e}')
    exit(1)
"

# Verificar se a configuração foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Configuração concluída com sucesso!"
    echo ""
    echo "🚀 Para iniciar o servidor em modo de desenvolvimento:"
    echo "source venv/bin/activate  # Se ainda não estiver ativado"
    echo "python -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 --reload"
    echo ""
    echo "📚 Documentação da API disponível em:"
    echo "- Swagger UI: http://localhost:8000/docs"
    echo "- ReDoc: http://localhost:8000/redoc"
else
    echo "❌ Configuração falhou. Por favor, verifique os erros acima."
fi

