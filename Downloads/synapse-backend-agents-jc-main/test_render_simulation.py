#!/usr/bin/env python3
"""
Script para simular o ambiente de produção do Render.com
e testar se o servidor pode ser iniciado corretamente
"""
import os
import sys
import subprocess
import time

def simulate_render_environment():
    """Simula o ambiente do Render com variáveis mínimas"""
    print("🚀 Simulando ambiente de produção do Render...")
    
    # Definir variáveis mínimas necessárias
    os.environ['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test'
    os.environ['SECRET_KEY'] = 'test-secret-key-for-render-simulation'
    os.environ['JWT_SECRET_KEY'] = 'test-jwt-secret-key-for-render'
    os.environ['ENVIRONMENT'] = 'production'
    os.environ['PORT'] = '8000'
    
    print("✅ Variáveis de ambiente configuradas")
    
    # Testar importação da aplicação
    try:
        print("📦 Testando importação da aplicação...")
        sys.path.insert(0, 'src')
        from synapse.main import app
        print("✅ Aplicação importada com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao importar aplicação: {e}")
        return False
    
    return True

def test_uvicorn_command():
    """Testa o comando uvicorn que será usado no Render"""
    print("\n🧪 Testando comando uvicorn...")
    
    # Mudar para o diretório src
    os.chdir('src')
    
    # Comando que será usado no Render
    cmd = [
        sys.executable, '-m', 'uvicorn', 
        'synapse.main:app', 
        '--host', '0.0.0.0', 
        '--port', '8000',
        '--timeout-keep-alive', '30'
    ]
    
    print(f"Executando: {' '.join(cmd)}")
    
    try:
        # Executar comando por alguns segundos para ver se inicia
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Aguardar um pouco para ver se há erro imediato
        time.sleep(3)
        
        if process.poll() is None:
            print("✅ Servidor iniciou com sucesso!")
            process.terminate()
            process.wait()
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Servidor falhou ao iniciar:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao executar comando: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Teste de Simulação do Ambiente Render")
    print("=" * 50)
    
    # Voltar ao diretório raiz se necessário
    if os.path.basename(os.getcwd()) == 'src':
        os.chdir('..')
    
    # Teste 1: Ambiente
    if not simulate_render_environment():
        print("\n❌ Falha na simulação do ambiente")
        sys.exit(1)
    
    # Teste 2: Comando uvicorn
    if not test_uvicorn_command():
        print("\n❌ Falha no teste do uvicorn")
        sys.exit(1)
    
    print("\n🎉 Todos os testes passaram!")
    print("✅ O servidor deve funcionar corretamente no Render")
