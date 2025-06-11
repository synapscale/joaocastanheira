#!/usr/bin/env python3
"""
Script para testar conexão com DigitalOcean e verificar tabelas
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv
import psycopg2

# Carregar variáveis de ambiente
load_dotenv()

config = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'sslmode': os.getenv('DB_SSLMODE', 'require')
}

def test_connection():
    """Testa conexão com banco DigitalOcean"""
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL não encontrada no .env")
        return False
    
    print("🔗 Testando conexão com DigitalOcean...")
    print("URL: [SENHA OCULTA]")
    
    try:
        # Criar engine
        engine = create_engine(database_url)
        
        # Testar conexão
        with engine.connect() as conn:
            # Teste básico
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Conexão bem-sucedida!")
            print(f"📊 PostgreSQL Version: {version.split(' ')[0]} {version.split(' ')[1]}")
            
            # Verificar tabelas existentes
            print("\n📋 Verificando tabelas...")
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            if tables:
                print(f"✅ Encontradas {len(tables)} tabelas:")
                for table in sorted(tables):
                    print(f"  - {table}")
            else:
                print("⚠️  Nenhuma tabela encontrada")
            
            # Verificar se tabela users existe
            if 'users' in tables:
                print("\n👥 Verificando tabela users...")
                result = conn.execute(text("SELECT COUNT(*) FROM users"))
                count = result.scalar()
                print(f"✅ Tabela users existe com {count} registros")
                
                # Mostrar estrutura da tabela users
                columns = inspector.get_columns('users')
                print("📝 Colunas da tabela users:")
                for col in columns:
                    print(f"  - {col['name']}: {col['type']}")
            else:
                print("⚠️  Tabela 'users' não encontrada - precisamos criar as tabelas")
            
            return True
            
    except Exception as e:
        print(f"❌ Erro na conexão: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
