import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

print("🔗 Testando conexão com DigitalOcean PostgreSQL...")

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
    
    print("✅ Conexão bem-sucedida!")
    
    # Verificar versão
    cursor.execute("SELECT version();")
    version = cursor.fetchone()[0]
    print(f"📊 PostgreSQL: {version.split(' ')[0]} {version.split(' ')[1]}")
    
    # Verificar tabelas
    cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"📋 Tabelas encontradas ({len(tables)}): {tables}")
    
    # Verificar se tabela users existe
    if 'users' in tables:
        cursor.execute("SELECT COUNT(*) FROM users;")
        count = cursor.fetchone()[0]
        print(f"👥 Tabela users: {count} registros")
    else:
        print("⚠️  Tabela 'users' não encontrada")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Erro na conexão: {str(e)}")
