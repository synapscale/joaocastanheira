#!/usr/bin/env python3
"""
Script para criar usuário SaaS diretamente no schema synapscale_db correto
"""
import psycopg2
import uuid
from datetime import datetime
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

def create_saas_user_direct():
    """Criar usuário SaaS diretamente na estrutura correta"""
    
    print("🚀 Criando usuário SaaS no schema synapscale_db...")
    
    # Dados do usuário
    user_data = {
        'email': 'admin@synapscale.com',
        'username': 'admin',
        'full_name': 'Administrador SynapScale',
        'password': 'SynapScale2024!'
    }
    
    # Credenciais do banco
    config = {
        'host': os.getenv('DB_HOST'),
        'port': int(os.getenv('DB_PORT', 5432)),
        'database': os.getenv('DB_NAME'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'sslmode': os.getenv('DB_SSLMODE', 'require')
    }
    try:
        # Conectar ao banco
        conn = psycopg2.connect(**config)
        cursor = conn.cursor()
        
        print("✅ Conectado ao banco DigitalOcean")
        
        # Gerar hash da senha
        password_bytes = user_data['password'].encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        # Gerar UUID para o usuário
        user_id = str(uuid.uuid4())
        
        # Verificar se usuário já existe
        cursor.execute(
            "SELECT id FROM synapscale_db.users WHERE email = %s OR username = %s",
            (user_data['email'], user_data['username'])
        )
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"⚠️  Usuário já existe com ID: {existing_user[0]}")
            return existing_user[0]
        
        # Inserir usuário na tabela correta
        insert_query = """
            INSERT INTO synapscale_db.users 
            (id, email, username, full_name, hashed_password, is_active, is_superuser, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        
        now = datetime.utcnow()
        cursor.execute(insert_query, (
            user_id,
            user_data['email'],
            user_data['username'], 
            user_data['full_name'],
            hashed_password,
            True,  # is_active
            True,  # is_superuser
            now,   # created_at
            now    # updated_at
        ))
        
        inserted_id = cursor.fetchone()[0]
        
        # Confirmar transação
        conn.commit()
        
        print(f"✅ Usuário criado com sucesso!")
        print(f"📧 Email: {user_data['email']}")
        print(f"👤 Username: {user_data['username']}")
        print(f"🆔 ID: {inserted_id}")
        print(f"🔐 Senha: {user_data['password']}")
        
        # Verificar se foi realmente criado
        cursor.execute("SELECT COUNT(*) FROM synapscale_db.users;")
        total_users = cursor.fetchone()[0]
        print(f"📊 Total de usuários na base: {total_users}")
        
        cursor.close()
        conn.close()
        
        return inserted_id
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        return None

if __name__ == "__main__":
    user_id = create_saas_user_direct()
    if user_id:
        print("\n🎉 Usuário SaaS criado com sucesso!")
        print("Agora você pode testar o login via API.")
    else:
        print("\n❌ Falha ao criar usuário SaaS.")
