#!/usr/bin/env python3
"""
Script simples para testar o endpoint de registro e criar um usuário
"""
import requests
import json

# Configurar endpoint
API_BASE_URL = "http://localhost:8000"
REGISTER_ENDPOINT = f"{API_BASE_URL}/api/v1/auth/register"

def test_endpoints():
    """Testa quais endpoints estão disponíveis"""
    print("🔍 Testando endpoints disponíveis...")
    
    # Testar root
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"✅ Root endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint erro: {e}")
    
    # Testar health
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/health")
        print(f"✅ Health endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Health endpoint erro: {e}")
    
    # Testar auth register com GET (deve dar 405 - Method Not Allowed)
    try:
        response = requests.get(REGISTER_ENDPOINT)
        print(f"📝 Register GET: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Register GET erro: {e}")
    
    # Testar auth register com POST vazio (deve dar 422 - Validation Error)
    try:
        response = requests.post(REGISTER_ENDPOINT)
        print(f"📝 Register POST vazio: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Register POST vazio erro: {e}")

def create_test_user():
    """Cria um usuário de teste"""
    print("\n🚀 Criando usuário de teste...")
    
    user_data = {
        "email": "teste123@example.com",
        "first_name": "João",
        "last_name": "Silva",
        "password": "MinhaSenh@123!"
    }
    
    try:
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            REGISTER_ENDPOINT,
            json=user_data,
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 201:
            user_info = response.json()
            print("✅ Usuário criado com sucesso!")
            print(f"📧 Email: {user_info.get('email')}")
            print(f"👤 Nome: {user_info.get('first_name')} {user_info.get('last_name')}")
            print(f"🆔 ID: {user_info.get('id')}")
            return True
        else:
            print(f"❌ Erro ao criar usuário")
            try:
                error_detail = response.json()
                print(f"Detalhes: {error_detail}")
            except:
                print(f"Response text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Teste de Criação de Usuário SaaS")
    print("=" * 50)
    
    test_endpoints()
    create_test_user()
