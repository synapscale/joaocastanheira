#!/usr/bin/env python3
"""
Script de teste para verificar se as importações estão funcionando corretamente
"""
import sys
import os

# Adicionar src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Definir uma DATABASE_URL temporária para os testes
os.environ['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test'

def test_imports():
    print("🧪 Testando importações do SynapScale Backend...")
    
    try:
        print("📦 Testando importação da configuração...")
        from synapse.core.config import settings
        print(f"✅ Configuração importada - Projeto: {settings.PROJECT_NAME}")
    except Exception as e:
        print(f"❌ Erro na configuração: {e}")
        return False
    
    try:
        print("📦 Testando importação do banco de dados...")
        from synapse.database import Base, get_db
        print("✅ Database importado com sucesso")
    except Exception as e:
        print(f"❌ Erro no database: {e}")
        return False
    
    try:
        print("📦 Testando importação da aplicação principal...")
        from synapse.main import app
        print("✅ Aplicação principal importada com sucesso")
    except Exception as e:
        print(f"❌ Erro na aplicação principal: {e}")
        return False
    
    try:
        print("📦 Testando importação do router da API...")
        from synapse.api.v1.router import api_router
        print("✅ Router da API importado com sucesso")
    except Exception as e:
        print(f"❌ Erro no router da API: {e}")
        return False
    
    print("🎉 Todas as importações foram bem-sucedidas!")
    return True

if __name__ == "__main__":
    success = test_imports()
    if not success:
        print("\n⚠️ Algumas importações falharam. Verifique a estrutura do projeto.")
        sys.exit(1)
    else:
        print("\n✅ Projeto pronto para execução!")
