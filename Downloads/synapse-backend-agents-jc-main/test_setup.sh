#!/bin/bash
echo "🧪 Testando configuração..."
source venv/bin/activate
# Ensure httpx is installed for tests
pip install --quiet httpx
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python3 -c "
import requests
import time
import subprocess
import signal
import os

# Iniciar servidor em background
print('Iniciando servidor de teste...')
proc = subprocess.Popen(['uvicorn', 'src.synapse.main:app', '--host', '0.0.0.0', '--port', '8001'], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Aguardar servidor inicializar
time.sleep(3)

try:
    # Testar endpoint de health
    response = requests.get('http://localhost:8001/health', timeout=5)
    if response.status_code == 200:
        print('✅ Servidor respondendo corretamente')
        print('✅ Health check passou')
        data = response.json()
        print(f'✅ Status: {data.get(\"status\", \"unknown\")}')
    else:
        print(f'❌ Servidor retornou status {response.status_code}')
except Exception as e:
    print(f'❌ Erro ao conectar com servidor: {e}')
finally:
    # Parar servidor
    proc.terminate()
    proc.wait()
    print('🔄 Servidor de teste finalizado')
"
