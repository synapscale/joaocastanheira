#!/usr/bin/env python3
"""
Script para criar um usuário no sistema SynapScale (cliente do SaaS)
Este script registra um novo usuário através da API da aplicação
"""
import requests
import json
import sys
import os
from getpass import getpass

# Configurações da API
API_BASE_URL = "http://localhost:8000"  # Altere para sua URL de produção se necessário
REGISTER_ENDPOINT = f"{API_BASE_URL}/api/v1/auth/register"
LOGIN_ENDPOINT = f"{API_BASE_URL}/api/v1/auth/login"

def create_user_interactive():
    """Cria um usuário interativamente no sistema SynapScale"""
    print("🚀 Criador de Usuário - SynapScale SaaS")
    print("=" * 50)
    
    # Coletar informações do usuário
    print("\n📝 Informações do novo usuário:")
    email = input("📧 Email: ").strip()
    if not email or "@" not in email:
        print("❌ Email inválido!")
        return False
    
    first_name = input("👤 Primeiro nome: ").strip()
    if not first_name:
        print("❌ Primeiro nome é obrigatório!")
        return False
    
    last_name = input("👥 Sobrenome: ").strip()
    if not last_name:
        print("❌ Sobrenome é obrigatório!")
        return False
    
    password = getpass("🔒 Senha (mínimo 8 caracteres): ").strip()
    if len(password) < 8:
        print("❌ Senha deve ter pelo menos 8 caracteres!")
        return False
    
    password_confirm = getpass("🔒 Confirme a senha: ").strip()
    if password != password_confirm:
        print("❌ Senhas não coincidem!")
        return False
    
    # Dados do usuário
    user_data = {
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "password": password
    }
    
    print(f"\n📋 Resumo do usuário:")
    print(f"   Email: {email}")
    print(f"   Nome: {first_name} {last_name}")
    
    confirm = input("\nConfirma a criação? (s/n): ").strip().lower()
    if confirm not in ['s', 'sim', 'y', 'yes']:
        print("❌ Operação cancelada!")
        return False
    
    return create_user(user_data)

def create_user(user_data):
    """Cria o usuário através da API"""
    try:
        print(f"\n🔄 Registrando usuário na API...")
        
        # Fazer requisição para registrar usuário
        headers = {
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            REGISTER_ENDPOINT,
            json=user_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 201:
            user_info = response.json()
            print("✅ Usuário criado com sucesso!")
            print(f"📝 ID do usuário: {user_info.get('id')}")
            print(f"📧 Email: {user_info.get('email')}")
            print(f"👤 Nome: {user_info.get('full_name')}")
            print(f"✅ Ativo: {user_info.get('is_active')}")
            print(f"✉️ Verificado: {user_info.get('is_verified')}")
            print(f"🎭 Papel: {user_info.get('role')}")
            print(f"💳 Plano: {user_info.get('subscription_plan')}")
            
            # Salvar informações em arquivo
            save_to_file = input("\n💾 Salvar informações em arquivo? (s/n): ").strip().lower()
            if save_to_file in ['s', 'sim', 'y', 'yes']:
                filename = f"usuario_{user_info.get('email').replace('@', '_').replace('.', '_')}_info.txt"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(f"Usuário SynapScale SaaS\n")
                    f.write(f"=======================\n")
                    f.write(f"ID: {user_info.get('id')}\n")
                    f.write(f"Email: {user_info.get('email')}\n")
                    f.write(f"Nome: {user_info.get('full_name')}\n")
                    f.write(f"Senha: {user_data['password']}\n")
                    f.write(f"Papel: {user_info.get('role')}\n")
                    f.write(f"Plano: {user_info.get('subscription_plan')}\n")
                    f.write(f"Criado em: {user_info.get('created_at')}\n")
                    f.write(f"\nPara fazer login:\n")
                    f.write(f"URL: {LOGIN_ENDPOINT}\n")
                    f.write(f"Email: {user_info.get('email')}\n")
                    f.write(f"Senha: {user_data['password']}\n")
                
                print(f"✅ Informações salvas em: {filename}")
            
            return True
            
        elif response.status_code == 400:
            error_detail = response.json().get('detail', 'Erro desconhecido')
            print(f"❌ Erro de validação: {error_detail}")
            return False
        else:
            print(f"❌ Erro ao criar usuário: {response.status_code}")
            print(f"Detalhes: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar à API")
        print("   Verifique se o servidor está rodando em:", API_BASE_URL)
        return False
    except requests.exceptions.Timeout:
        print("❌ Erro: Timeout na requisição")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def test_api_connection():
    """Testa se a API está acessível"""
    try:
        print("🔍 Testando conexão com a API...")
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        if response.status_code == 200:
            print("✅ API está acessível!")
            return True
        else:
            print(f"⚠️ API retornou status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ API não está acessível")
        print(f"   Verifique se o servidor está rodando em: {API_BASE_URL}")
        return False
    except Exception as e:
        print(f"❌ Erro ao testar API: {e}")
        return False

def create_demo_user():
    """Cria um usuário de demonstração"""
    demo_data = {
        "email": "demo@synapscale.com",
        "first_name": "Demo",
        "last_name": "User",
        "password": "DemoPassword123!"
    }
    
    print("🎭 Criando usuário de demonstração...")
    return create_user(demo_data)

def main():
    """Menu principal"""
    print("🎯 Gerenciador de Usuários SynapScale SaaS")
    print("=" * 45)
    
    # Testar conexão primeiro
    if not test_api_connection():
        print("\n💡 Dicas para resolver:")
        print("1. Certifique-se de que o servidor está rodando:")
        print("   python -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000")
        print("2. Verifique se a URL está correta no script")
        print("3. Verifique se não há firewall bloqueando a conexão")
        return
    
    while True:
        print("\n📋 Opções disponíveis:")
        print("1. Criar novo usuário (interativo)")
        print("2. Criar usuário de demonstração")
        print("3. Testar conexão com API")
        print("4. Sair")
        
        choice = input("\nEscolha uma opção (1-4): ").strip()
        
        if choice == '1':
            create_user_interactive()
        elif choice == '2':
            create_demo_user()
        elif choice == '3':
            test_api_connection()
        elif choice == '4':
            print("👋 Até logo!")
            break
        else:
            print("❌ Opção inválida!")

if __name__ == "__main__":
    main()
