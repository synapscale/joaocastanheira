#!/usr/bin/env python3
"""
Script para testar o carregamento das variáveis de ambiente
"""
import os
from pathlib import Path

def load_env_file():
    """Carrega o arquivo .env"""
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ Arquivo .env não encontrado!")
        return False
    
    print("✅ Arquivo .env encontrado!")
    
    # Carrega as variáveis
    with open(env_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    env_vars = {}
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            env_vars[key] = value
    
    print(f"📊 Total de variáveis encontradas: {len(env_vars)}")
    
    # Testa algumas variáveis importantes
    important_vars = [
        'ENVIRONMENT', 'SECRET_KEY', 'DATABASE_URL', 
        'REDIS_URL', 'HOST', 'PORT'
    ]
    
    print("\n🔍 Verificando variáveis importantes:")
    for var in important_vars:
        if var in env_vars:
            value = env_vars[var]
            if len(value) > 50:
                value = value[:47] + "..."
            print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NÃO ENCONTRADA")
    
    return True

if __name__ == "__main__":
    print("🔧 TESTE DE VARIÁVEIS DE AMBIENTE")
    print("=" * 40)
    load_env_file()
