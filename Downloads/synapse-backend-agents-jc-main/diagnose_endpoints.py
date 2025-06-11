#!/usr/bin/env python3
"""
Script para testar endpoints individuais e diagnosticar problemas
"""

import sys
import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Importar o router principal
try:
    from src.synapse.api.v1.router import api_router
    print("✅ Router principal importado com sucesso")
except Exception as e:
    print(f"❌ Erro ao importar router principal: {e}")
    sys.exit(1)

# Criar uma aplicação de teste simples
app = FastAPI()
app.include_router(api_router, prefix="/api/v1")

# Criar cliente de teste
client = TestClient(app)

def test_endpoints():
    """Testa endpoints básicos"""
    print("\n🔍 Testando endpoints com TestClient...")
    
    # Lista de endpoints para testar
    endpoints = [
        "/api/v1/marketplace",
        "/api/v1/auth/me", 
        "/api/v1/workflows",
        "/api/v1/agents",
        "/api/v1/nodes"
    ]
    
    for endpoint in endpoints:
        try:
            response = client.get(endpoint)
            print(f"   {endpoint}: {response.status_code}")
            if response.status_code != 404:
                print(f"      ✅ Endpoint encontrado!")
            else:
                print(f"      ❌ Endpoint não encontrado")
        except Exception as e:
            print(f"   {endpoint}: ❌ Erro - {e}")

def inspect_router():
    """Inspeciona a estrutura do router"""
    print("\n🔍 Inspecionando estrutura do router...")
    
    print(f"Router principal: {api_router}")
    print(f"Rotas registradas: {len(api_router.routes)}")
    
    for i, route in enumerate(api_router.routes):
        print(f"   {i+1}. {route}")
        if hasattr(route, 'path'):
            print(f"      Path: {route.path}")
        if hasattr(route, 'methods'):
            print(f"      Methods: {route.methods}")

if __name__ == "__main__":
    print("🚀 Diagnóstico de Endpoints - SynapScale Backend")
    print("=" * 60)
    
    inspect_router()
    test_endpoints()
    
    print("\n" + "=" * 60)
    print("📊 Diagnóstico concluído")

