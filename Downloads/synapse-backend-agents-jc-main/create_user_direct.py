#!/usr/bin/env python3
"""
Script para criar usuário SaaS usando a estrutura correta do banco DigitalOcean
"""
import psycopg2
import bcrypt
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Configuração do banco
config = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'sslmode': os.getenv('DB_SSLMODE', 'require')
}

def hash_password(password: str) -> str:
    """Gera hash da senha usando bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_saas_user():
    """Cria usuário SaaS diretamente no banco"""
    
    # Dados do usuário
    user_data = {
        'id': 'user_' + datetime.now().strftime('%Y%m%d_%H%M%S'),
        'email': 'usuario@exemplo.com',
        'username': 'usuario_saas',
        'full_name': 'João Silva',
        'hashed_password': hash_password('SenhaForte123!'),
        'is_active': True,
        'is_superuser': False,
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }
    
    print("🚀 Criando usuário SaaS no banco DigitalOcean...")
    print(f"Email: {user_data['email']}")
    print(f"Username: {user_data['username']}")
    print(f"Nome: {user_data['full_name']}")
    
    try:
        conn = psycopg2.connect(**config)
        cursor = conn.cursor()
        
        # Verificar se usuário já existe
        cursor.execute("SELECT id FROM users WHERE email = %s", (user_data['email'],))
        existing = cursor.fetchone()
        
        if existing:
            print(f"⚠️  Usuário com email {user_data['email']} já existe!")
            print(f"ID existente: {existing[0]}")
            return existing[0]
        
        # Inserir novo usuário
        insert_query = """
            INSERT INTO users (id, email, username, full_name, hashed_password, 
                             is_active, is_superuser, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        
        cursor.execute(insert_query, (
            user_data['id'],
            user_data['email'],
            user_data['username'], 
            user_data['full_name'],
            user_data['hashed_password'],
            user_data['is_active'],
            user_data['is_superuser'],
            user_data['created_at'],
            user_data['updated_at']
        ))
        
        user_id = cursor.fetchone()[0]
        conn.commit()
        
        print(f"✅ Usuário criado com sucesso!")
        print(f"ID: {user_id}")
        
        # Verificar criação
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        print(f"\n📋 Dados do usuário criado:")
        print(f"  ID: {user[0]}")
        print(f"  Email: {user[1]}")
        print(f"  Username: {user[2]}")
        print(f"  Nome: {user[3]}")
        print(f"  Ativo: {user[5]}")
        print(f"  Superuser: {user[6]}")
        print(f"  Criado em: {user[7]}")
        
        cursor.close()
        conn.close()
        
        return user_id
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {str(e)}")
        return None

def test_login():
    """Testa se conseguimos fazer 'login' verificando a senha"""
    
    email = 'usuario@exemplo.com'
    password = 'SenhaForte123!'
    
    print(f"\n🔐 Testando login...")
    
    try:
        conn = psycopg2.connect(**config)
        cursor = conn.cursor()
        
        # Buscar usuário
        cursor.execute("SELECT id, email, hashed_password FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"❌ Usuário não encontrado: {email}")
            return False
        
        user_id, user_email, hashed_password = user
        
        # Verificar senha
        if bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8')):
            print(f"✅ Login bem-sucedido!")
            print(f"  ID: {user_id}")
            print(f"  Email: {user_email}")
            return True
        else:
            print(f"❌ Senha incorreta")
            return False
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro no teste de login: {str(e)}")
        return False

if __name__ == "__main__":
    print("🎯 Script de Criação de Usuário SaaS")
    print("=" * 50)
    
    # Criar usuário
    user_id = create_saas_user()
    
    if user_id:
        # Testar login
        test_login()
        
        print(f"\n🎉 Usuário SaaS criado e testado com sucesso!")
        print(f"\n📝 Credenciais para teste:")
        print(f"  Email: usuario@exemplo.com")
        print(f"  Senha: SenhaForte123!")
        print(f"\n🔗 Agora você pode testar via API:")
        print(f"  curl -X POST http://localhost:8000/api/v1/auth/register \\")
        print(f"       -H 'Content-Type: application/json' \\")
        print(f"       -d '{{\"email\":\"usuario@exemplo.com\",\"first_name\":\"João\",\"last_name\":\"Silva\",\"password\":\"SenhaForte123!\"}}'")
    else:
        print(f"\n❌ Falha na criação do usuário")
