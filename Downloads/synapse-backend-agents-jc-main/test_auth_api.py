#!/usr/bin/env python3
"""
Teste de login com usuário criado no DigitalOcean
"""
import requests
import json

# URL base da API
BASE_URL = "http://localhost:8000/api/v1"

def test_login():
    """Testa login com usuário existente"""
    
    print("🔐 Testando login via API...")
    
    # Dados de login (x-www-form-urlencoded como esperado pelo OAuth2)
    login_data = {
        'username': 'usuario@exemplo.com',  # OAuth2 usa 'username' para email
        'password': 'SenhaForte123!'
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data=login_data,  # form data, não JSON
            headers={
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login bem-sucedido!")
            print(f"  Access Token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"  Token Type: {data.get('token_type', 'N/A')}")
            if 'user' in data:
                user = data['user']
                print(f"  Usuário: {user.get('full_name', 'N/A')} ({user.get('email', 'N/A')})")
            return data.get('access_token')
        else:
            print(f"❌ Erro no login:")
            print(f"  Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
        return None

def test_user_info(access_token):
    """Testa endpoint de informações do usuário"""
    
    print(f"\n👤 Testando endpoint /auth/me...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            user = response.json()
            print("✅ Informações do usuário obtidas!")
            print(f"  ID: {user.get('id', 'N/A')}")
            print(f"  Email: {user.get('email', 'N/A')}")
            print(f"  Nome: {user.get('full_name', 'N/A')}")
            print(f"  Ativo: {user.get('is_active', 'N/A')}")
            print(f"  Role: {user.get('role', 'N/A')}")
        else:
            print(f"❌ Erro ao obter info do usuário:")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")

def test_new_user_registration():
    """Testa criação de um novo usuário"""
    
    print(f"\n🆕 Testando criação de novo usuário...")
    
    user_data = {
        "email": f"teste{int(__import__('time').time())}@exemplo.com",
        "first_name": "Teste",
        "last_name": "Usuário", 
        "password": "SenhaForte123!"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=user_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            user = response.json()
            print("✅ Novo usuário criado!")
            print(f"  ID: {user.get('id', 'N/A')}")
            print(f"  Email: {user.get('email', 'N/A')}")
        else:
            print(f"❌ Erro na criação:")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")

if __name__ == "__main__":
    print("🎯 Teste Completo da API de Autenticação")
    print("=" * 50)
    
    # Teste 1: Login com usuário existente
    access_token = test_login()
    
    # Teste 2: Informações do usuário (se login funcionou)
    if access_token:
        test_user_info(access_token)
    
    # Teste 3: Criação de novo usuário
    # test_new_user_registration()  # Comentado para não criar muitos usuários
    
    print(f"\n🎉 Testes concluídos!")
