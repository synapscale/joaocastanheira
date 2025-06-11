#!/usr/bin/env python3
"""
Teste dos endpoints de autenticação com estrutura correta
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_register():
    """Testa registro de usuário com campos corretos"""
    
    print("🚀 Testando registro de usuário...")
    
    user_data = {
        "email": "teste@synapscale.com",
        "username": "teste_user",
        "full_name": "Usuário de Teste",
        "password": "SenhaForte123!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("✅ Usuário criado com sucesso!")
            return response.json()
        else:
            print("❌ Erro ao criar usuário")
            return None
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
        return None

def test_login():
    """Testa login com o usuário existente"""
    
    print("\n🔐 Testando login...")
    
    # Primeiro tentar com o admin que já criamos
    login_data = {
        "username": "admin@synapscale.com",  # Email no campo username
        "password": "SynapScale2024!"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login", 
            data=login_data,  # Form data para OAuth2PasswordRequestForm
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Login realizado com sucesso!")
            return response.json()
        else:
            print("❌ Erro no login")
            return None
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
        return None

def test_health():
    """Testa endpoint de saúde"""
    try:
        response = requests.get(f"{BASE_URL}/../health")
        if response.status_code == 200:
            print("✅ Servidor funcionando")
            return True
    except:
        pass
    return False

if __name__ == "__main__":
    print("🎯 Teste de Autenticação - Estrutura Correta")
    print("=" * 50)
    
    # Verificar se servidor está rodando
    if not test_health():
        print("❌ Servidor não está rodando ou não responde")
        exit(1)
    
    # Testar registro
    user = test_register()
    
    # Testar login
    token = test_login()
    
    print("\n" + "=" * 50)
    if user and token:
        print("🎉 Todos os testes passaram!")
    else:
        print("⚠️  Alguns testes falharam")
