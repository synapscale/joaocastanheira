#!/bin/bash

# Script de produção para SynapScale Backend
# Execute este script para iniciar o servidor em produção

set -e

echo "🚀 Iniciando SynapScale Backend em modo produção..."

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Copie .env.example para .env e configure suas credenciais"
    exit 1
fi

# Verificar se ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔄 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar/atualizar dependências
echo "📚 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p logs uploads

# Verificar configurações críticas
echo "⚙️ Verificando configurações..."
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()

errors = []
if not os.getenv('SECRET_KEY'):
    errors.append('SECRET_KEY não definida')
if not os.getenv('JWT_SECRET_KEY'):
    errors.append('JWT_SECRET_KEY não definida')
if not os.getenv('DATABASE_URL'):
    errors.append('DATABASE_URL não definida')

if errors:
    print('❌ Erros de configuração:')
    for error in errors:
        print(f'  - {error}')
    exit(1)
else:
    print('✅ Configurações OK')
"

# Testar conexão com banco
echo "🗄️ Testando conexão com banco..."
python3 -c "
from src.synapse.database import health_check
import asyncio

async def test_db():
    try:
        result = await health_check()
        if result:
            print('✅ Conexão com banco OK')
        else:
            print('❌ Falha na conexão com banco')
            exit(1)
    except Exception as e:
        print(f'❌ Erro na conexão: {e}')
        exit(1)

asyncio.run(test_db())
"

# Iniciar servidor com Gunicorn
echo "🌟 Iniciando servidor de produção..."
echo "📍 Servidor rodando em: http://0.0.0.0:8000"
echo "📚 Documentação: http://0.0.0.0:8000/docs"
echo ""
echo "🛑 Para parar o servidor, pressione Ctrl+C"
echo ""

exec gunicorn src.synapse.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    --log-level info \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --preload

