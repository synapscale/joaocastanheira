#!/usr/bin/env python3
"""
API de autenticação simples que funciona com a estrutura do banco DigitalOcean
"""
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Configuração do banco
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'sslmode': os.getenv('DB_SSLMODE', 'require')
}

JWT_SECRET = os.getenv('JWT_SECRET')

# Modelos Pydantic
class UserLogin(BaseModel):
    username: str  # email
    password: str

class UserRegister(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: Optional[str]
    full_name: Optional[str]
    first_name: str
    last_name: str
    is_active: bool
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Funções de utilidade
def get_db_connection():
    """Conecta ao banco DigitalOcean"""
    return psycopg2.connect(**DB_CONFIG)

def verify_password(password: str, hashed: str) -> bool:
    """Verifica senha usando bcrypt"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def hash_password(password: str) -> str:
    """Gera hash da senha"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(user_id: str, email: str) -> str:
    """Cria token JWT"""
    payload = {
        'sub': email,
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Autentica usuário"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscar usuário
        cursor.execute("""
            SELECT id, email, username, full_name, hashed_password, is_active, is_superuser
            FROM users WHERE email = %s
        """, (email,))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            return None
            
        user_id, user_email, username, full_name, hashed_password, is_active, is_superuser = user
        
        if not is_active:
            return None
            
        if not verify_password(password, hashed_password):
            return None
            
        # Separar first_name e last_name do full_name
        names = full_name.split(' ') if full_name else ['', '']
        first_name = names[0] if names else ''
        last_name = ' '.join(names[1:]) if len(names) > 1 else ''
        
        return {
            'id': user_id,
            'email': user_email,
            'username': username or '',
            'full_name': full_name or '',
            'first_name': first_name,
            'last_name': last_name,
            'is_active': is_active,
            'role': 'admin' if is_superuser else 'user'
        }
        
    except Exception as e:
        print(f"Erro na autenticação: {e}")
        return None

def create_user(email: str, first_name: str, last_name: str, password: str) -> Optional[dict]:
    """Cria novo usuário"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se usuário já existe
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return None  # Usuário já existe
        
        # Criar novo usuário
        user_id = f"user_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        full_name = f"{first_name} {last_name}".strip()
        hashed_password = hash_password(password)
        
        cursor.execute("""
            INSERT INTO users (id, email, username, full_name, hashed_password, 
                             is_active, is_superuser, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, email, email.split('@')[0], full_name, hashed_password,
            True, False, datetime.now(), datetime.now()
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'id': user_id,
            'email': email,
            'username': email.split('@')[0],
            'full_name': full_name,
            'first_name': first_name,
            'last_name': last_name,
            'is_active': True,
            'role': 'user'
        }
        
    except Exception as e:
        print(f"Erro na criação do usuário: {e}")
        return None

# Teste das funções
def test_functions():
    """Testa as funções de autenticação"""
    print("🧪 Testando funções de autenticação...")
    
    # Teste 1: Login
    user = authenticate_user('usuario@exemplo.com', 'SenhaForte123!')
    if user:
        print("✅ Login funcionando!")
        print(f"  Usuário: {user['full_name']} ({user['email']})")
        
        # Teste 2: Token
        token = create_access_token(user['id'], user['email'])
        print(f"✅ Token gerado: {token[:50]}...")
        
    else:
        print("❌ Login falhou")
    
    # Teste 3: Criar usuário
    # new_user = create_user('novo@exemplo.com', 'Novo', 'Usuário', 'SenhaForte123!')
    # if new_user:
    #     print("✅ Criação de usuário funcionando!")
    # else:
    #     print("❌ Criação de usuário falhou")

if __name__ == "__main__":
    print("🎯 Testando API de Autenticação Simplificada")
    print("=" * 50)
    test_functions()
