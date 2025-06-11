"""Script para inicializar o banco de dados corretamente."""
import asyncio
import sqlite3
from src.synapse.db.base import init_db, Base, engine
from src.synapse.models.file import File  # IMPORTANTE: Importar o modelo

async def create_database():
    print("=== INICIALIZANDO BANCO DE DADOS ===")
    
    # Verificar se o modelo foi registrado
    print(f"Modelos registrados: {list(Base.metadata.tables.keys())}")
    
    # Criar todas as tabelas
    print("Criando tabelas...")
    await init_db()
    
    # Verificar tabelas criadas
    print("\n=== VERIFICANDO TABELAS CRIADAS ===")
    conn = sqlite3.connect("synapse.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Tabelas no banco: {[table[0] for table in tables]}")
    
    # Ver estrutura da tabela files
    if ('files',) in tables:
        print("\n=== ESTRUTURA DA TABELA FILES ===")
        cursor.execute("PRAGMA table_info(files);")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
    
    conn.close()
    print("\n✅ Banco inicializado com sucesso!")

if __name__ == "__main__":
    asyncio.run(create_database())
