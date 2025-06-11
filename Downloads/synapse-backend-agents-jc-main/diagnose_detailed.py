#!/usr/bin/env python3
"""
Script de diagnóstico detalhado para identificar problemas nos routers
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def test_individual_routers():
    """Testa cada router individualmente"""
    print("=== DIAGNÓSTICO DETALHADO DOS ROUTERS ===\n")
    
    routers_to_test = [
        ('auth', 'src.synapse.api.v1.endpoints.auth'),
        ('marketplace', 'src.synapse.api.v1.endpoints.marketplace'),
        ('files', 'src.synapse.api.v1.endpoints.files'),
        ('workflows', 'src.synapse.api.v1.endpoints.workflows'),
        ('agents', 'src.synapse.api.v1.endpoints.agents'),
    ]
    
    for name, module_path in routers_to_test:
        try:
            module = __import__(module_path, fromlist=['router'])
            router = getattr(module, 'router')
            print(f"✅ {name}: {len(router.routes)} rotas")
            
            # Listar rotas específicas
            for route in router.routes:
                if hasattr(route, 'path') and hasattr(route, 'methods'):
                    print(f"   - {list(route.methods)[0] if route.methods else 'GET'} {route.path}")
                    
        except Exception as e:
            print(f"❌ {name}: Erro - {e}")
        print()

def test_main_router():
    """Testa o router principal"""
    print("=== TESTANDO ROUTER PRINCIPAL ===\n")
    try:
        from src.synapse.api.v1.router import api_router
        print(f"✅ Router principal carregado com {len(api_router.routes)} rotas")
        
        # Verificar rotas específicas
        auth_routes = [r for r in api_router.routes if hasattr(r, 'path') and '/auth' in r.path]
        marketplace_routes = [r for r in api_router.routes if hasattr(r, 'path') and '/marketplace' in r.path]
        
        print(f"   - Rotas de auth: {len(auth_routes)}")
        print(f"   - Rotas de marketplace: {len(marketplace_routes)}")
        
        if auth_routes:
            print("   Rotas de auth encontradas:")
            for route in auth_routes[:3]:  # Mostrar apenas as primeiras 3
                if hasattr(route, 'path') and hasattr(route, 'methods'):
                    print(f"     - {list(route.methods)[0] if route.methods else 'GET'} {route.path}")
        
        if marketplace_routes:
            print("   Rotas de marketplace encontradas:")
            for route in marketplace_routes[:3]:  # Mostrar apenas as primeiras 3
                if hasattr(route, 'path') and hasattr(route, 'methods'):
                    print(f"     - {list(route.methods)[0] if route.methods else 'GET'} {route.path}")
                    
    except Exception as e:
        print(f"❌ Erro ao carregar router principal: {e}")

def test_app_routes():
    """Testa as rotas da aplicação principal"""
    print("\n=== TESTANDO APLICAÇÃO PRINCIPAL ===\n")
    try:
        from src.synapse.main import app
        print(f"✅ Aplicação carregada com {len(app.routes)} rotas")
        
        # Verificar se as rotas da API v1 estão presentes
        api_routes = [r for r in app.routes if hasattr(r, 'path') and '/api/v1' in r.path]
        print(f"   - Rotas da API v1: {len(api_routes)}")
        
        # Verificar rotas específicas
        auth_routes = [r for r in app.routes if hasattr(r, 'path') and '/api/v1/auth' in r.path]
        marketplace_routes = [r for r in app.routes if hasattr(r, 'path') and '/api/v1/marketplace' in r.path]
        
        print(f"   - Rotas de auth na app: {len(auth_routes)}")
        print(f"   - Rotas de marketplace na app: {len(marketplace_routes)}")
        
        if not auth_routes:
            print("   ⚠️  PROBLEMA: Rotas de auth não encontradas na aplicação!")
        if not marketplace_routes:
            print("   ⚠️  PROBLEMA: Rotas de marketplace não encontradas na aplicação!")
            
    except Exception as e:
        print(f"❌ Erro ao carregar aplicação: {e}")

if __name__ == "__main__":
    test_individual_routers()
    test_main_router()
    test_app_routes()

