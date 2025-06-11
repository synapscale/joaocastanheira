#!/usr/bin/env python3
"""
Diagnóstico simples dos problemas de conexão do Prisma
"""
import asyncio
import os
import sys
import subprocess
from pathlib import Path

# Adicionar o diretório src ao path
sys.path.insert(0, str(Path(__file__).parent / "src"))


def check_environment():
    """Verifica variáveis de ambiente"""
    print("🔍 Verificando variáveis de ambiente...")
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL não definida")
        return False
    
    print(f"✅ DATABASE_URL: {database_url[:50]}...")
    return True


def check_postgresql():
    """Verifica se PostgreSQL está rodando"""
    print("🔍 Verificando PostgreSQL...")
    
    try:
        result = subprocess.run(
            ["pg_isready", "-h", "localhost", "-p", "5432"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ PostgreSQL está rodando")
            return True
        else:
            print("❌ PostgreSQL não está rodando")
            return False
            
    except FileNotFoundError:
        print("⚠️  pg_isready não encontrado, tentando Docker...")
        
        try:
            result = subprocess.run(
                ["docker", "ps"],
                capture_output=True,
                text=True
            )
            
            if "postgres" in result.stdout:
                print("✅ PostgreSQL rodando via Docker")
                return True
            else:
                print("❌ PostgreSQL não encontrado")
                return False
                
        except FileNotFoundError:
            print("❌ Docker não encontrado")
            return False


def check_prisma_client():
    """Verifica se o cliente Prisma foi gerado"""
    print("🔍 Verificando cliente Prisma...")
    
    client_path = Path("app/generated/prisma/client")
    if not client_path.exists():
        print("❌ Cliente Prisma não foi gerado")
        return False
    
    print("✅ Cliente Prisma encontrado")
    return True


async def test_prisma():
    """Testa conexão via Prisma"""
    print("🔍 Testando conexão Prisma...")
    
    try:
        from prisma import Prisma
        
        prisma = Prisma()
        await prisma.connect()
        print("✅ Prisma conectado com sucesso")
        
        await prisma.disconnect()
        return True
        
    except ImportError as e:
        print(f"❌ Erro de importação: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        return False


async def main():
    """Executa diagnóstico"""
    print("🚀 Diagnóstico do Prisma")
    print("=" * 40)
    
    checks = [
        check_environment(),
        check_postgresql(),
        check_prisma_client(),
        await test_prisma()
    ]
    
    if all(checks):
        print("\n🎉 Tudo funcionando!")
    else:
        print("\n⚠️  Problemas encontrados")
        print("💡 Execute: ./fix_prisma_connection.sh")


if __name__ == "__main__":
    asyncio.run(main())
