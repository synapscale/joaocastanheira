import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

print("🔍 Verificando estrutura da tabela users...")


config = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'sslmode': os.getenv('DB_SSLMODE', 'require')
}

try:
    conn = psycopg2.connect(**config)
    cursor = conn.cursor()
    
    # Verificar estrutura da tabela users
    cursor.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position;
    """)
    
    columns = cursor.fetchall()
    print(f"\n📋 Estrutura da tabela 'users' ({len(columns)} colunas):")
    print("-" * 70)
    for col in columns:
        name, dtype, nullable, default = col
        print(f"  {name:<20} | {dtype:<15} | Null: {nullable:<3} | Default: {default}")
    
    # Verificar se existe coluna de senha
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        AND column_name LIKE '%password%'
        OR column_name LIKE '%hash%'
        OR column_name LIKE '%senha%';
    """)
    
    password_cols = cursor.fetchall()
    print(f"\n🔐 Colunas relacionadas a senha encontradas: {[col[0] for col in password_cols]}")
    
    # Verificar dados existentes
    cursor.execute("SELECT COUNT(*) FROM users;")
    count = cursor.fetchone()[0]
    print(f"\n👥 Registros na tabela users: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, email, first_name, last_name FROM users LIMIT 3;")
        users = cursor.fetchall()
        print("\n📝 Exemplo de dados:")
        for user in users:
            print(f"  ID: {user[0]}, Email: {user[1]}, Nome: {user[2]} {user[3]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Erro: {str(e)}")
