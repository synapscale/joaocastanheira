#!/usr/bin/env python3
"""
Teste direto de login usando a estrutura correta do banco
"""
import requests
import json

def test_login_direct():
    """Testa login com usuário criado diretamente"""
    
    print("🔐 Testando login do usuário SaaS...")
    
    # Dados do usuário criado
    login_data = {
        "username": "admin@synapscale.com",  # Usar email como username
        "password": "SynapScale2024!"
    }
    
    # Teste via API FastAPI
    url = "http://localhost:8000/api/v1/auth/login"
    
    try:
        print(f"📡 Fazendo requisição para: {url}")
        
        # Fazer requisição POST para login
        response = requests.post(
            url,
            data=login_data,  # OAuth2PasswordRequestForm espera form data
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login bem-sucedido!")
            print(f"🎫 Access Token: {data['access_token'][:50]}...")
            print(f"🔄 Refresh Token: {data['refresh_token'][:50]}...")
            print(f"👤 Usuário: {data['user']}")
            return True
        else:
            print("❌ Falha no login")
            print(f"📄 Resposta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Servidor não está rodando na porta 8000")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {str(e)}")
        return False

def test_endpoints_health():
    """Testa se os endpoints básicos estão funcionando"""
    
    print("🔍 Testando endpoints básicos...")
    
    endpoints = [
        ("GET", "http://localhost:8000/"),
        ("GET", "http://localhost:8000/health"),
        ("GET", "http://localhost:8000/api/v1/auth/register"),  # Deve retornar 405
    ]
    
    for method, url in endpoints:
        try:
            if method == "GET":
                response = requests.get(url)
            
            print(f"📡 {method} {url}: {response.status_code}")
            
        except requests.exceptions.ConnectionError:
            print(f"❌ {method} {url}: Servidor não conectado")
        except Exception as e:
            print(f"❌ {method} {url}: Erro - {str(e)}")

if __name__ == "__main__":
    print("🧪 Teste de Login com Usuário SaaS Criado")
    print("=" * 50)
    
    # Testar endpoints básicos primeiro
    test_endpoints_health()
    print()
    
    # Testar login
    success = test_login_direct()
    
    if success:
        print("\n🎉 SUCESSO! O usuário SaaS está funcionando!")
    else:
        print("\n⚠️ O usuário foi criado, mas o endpoint de login precisa ser ajustado.")
