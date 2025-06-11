#!/usr/bin/env python3
"""
Script para gerar um token JWT de teste para demonstração da API.
"""

import os
import sys
from datetime import datetime, timedelta

# Adicionar o diretório src ao path para importar os módulos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.synapse.core.auth.jwt import create_access_token


def main():
    """Gera um token JWT de teste para demonstração."""
    
    # Dados do usuário de teste
    test_user_data = {
        "sub": "demo_user_123",
        "username": "demo@example.com",
        "role": "user",
        "scopes": ["files:read", "files:write", "llm:use"],
    }
    
    # Gerar token com 60 minutos de expiração
    token = create_access_token(
        data=test_user_data,
        expires_delta=timedelta(minutes=60)
    )
    
    print("🔑 Token JWT de Teste Gerado:")
    print("-" * 50)
    print(token)
    print("-" * 50)
    print("\n📋 Como usar:")
    print(f'curl -H "Authorization: Bearer {token}" http://localhost:8000/api/v1/providers')
    print("\n⏰ Válido por: 60 minutos")
    print("👤 Usuário: demo@example.com")
    print("🏷️ Role: user")
    print("🔐 Scopes: files:read, files:write, llm:use")


if __name__ == "__main__":
    main()
