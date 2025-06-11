import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

print("🔗 Verificando schema synapscale_db no DigitalOcean...")

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
    
    # Verificar se schema synapscale_db existe
    cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'synapscale_db';")
    schema_exists = cursor.fetchone()
    
    if schema_exists:
        print("✅ Schema 'synapscale_db' encontrado!")
        
        # Verificar tabelas no schema synapscale_db
        cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'synapscale_db';")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"📋 Tabelas no schema synapscale_db ({len(tables)}): {tables}")
        
        # Verificar se tabela users existe no schema correto
        if 'users' in tables:
            cursor.execute("SELECT COUNT(*) FROM synapscale_db.users;")
            count = cursor.fetchone()[0]
            print(f"👥 Tabela synapscale_db.users: {count} registros")
            
            # Mostrar estrutura da tabela users
            cursor.execute("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_schema = 'synapscale_db' AND table_name = 'users'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            print("📝 Estrutura da tabela synapscale_db.users:")
            for col in columns:
                print(f"  - {col[0]}: {col[1]} ({'NULL' if col[2] == 'YES' else 'NOT NULL'})")
                
            # Verificar se há dados na tabela
            if count > 0:
                cursor.execute("SELECT id, email, username, full_name, is_active FROM synapscale_db.users LIMIT 5;")
                users = cursor.fetchall()
                print("👤 Usuários existentes:")
                for user in users:
                    print(f"  - ID: {user[0]}, Email: {user[1]}, Username: {user[2]}, Nome: {user[3]}, Ativo: {user[4]}")
        else:
            print("⚠️  Tabela 'users' não encontrada no schema synapscale_db")
    else:
        print("❌ Schema 'synapscale_db' não encontrado!")
        
        # Mostrar schemas disponíveis
        cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast');")
        schemas = [row[0] for row in cursor.fetchall()]
        print(f"📂 Schemas disponíveis: {schemas}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Erro na conexão: {str(e)}")
