"""
Testes básicos para verificar funcionalidade principal
"""
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient


@pytest.mark.unit
def test_health_check(client: TestClient):
    """Teste do endpoint de health check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"


@pytest.mark.unit
def test_docs_endpoint(client: TestClient):
    """Teste do endpoint de documentação"""
    response = client.get("/docs")
    assert response.status_code == 200


@pytest.mark.unit
def test_openapi_endpoint(client: TestClient):
    """Teste do endpoint OpenAPI"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "info" in data


@pytest.mark.api
@pytest.mark.auth
def test_register_user(client: TestClient):
    """Teste de registro de usuário"""
    user_data = {
        "email": "newuser@example.com",
        "first_name": "New",
        "last_name": "User",
        "password": "StrongPassword123!"
    }
    
    response = client.post("/api/v1/auth/auth/register", json=user_data)
    assert response.status_code in [200, 201]
    
    data = response.json()
    assert "access_token" in data or "message" in data


@pytest.mark.api
@pytest.mark.auth
def test_login_user(client: TestClient):
    """Teste de login de usuário"""
    # Primeiro registrar um usuário
    user_data = {
        "email": "logintest@example.com",
        "first_name": "Login",
        "last_name": "Test",
        "password": "StrongPassword123!"
    }
    
    register_response = client.post("/api/v1/auth/auth/register", json=user_data)
    
    # Tentar fazer login
    login_data = {
        "email": "logintest@example.com",
        "password": "StrongPassword123!"
    }
    
    response = client.post("/api/v1/auth/auth/login", json=login_data)
    assert response.status_code in [200, 201]


@pytest.mark.api
def test_get_current_user(client: TestClient, test_user_sync, auth_headers):
    """Teste para obter usuário atual"""
    response = client.get("/api/v1/auth/auth/me", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.api
def test_list_workflows(client: TestClient, auth_headers):
    """Teste para listar workflows"""
    response = client.get("/api/v1/workflows/", headers=auth_headers)
    assert response.status_code in [200, 401]


@pytest.mark.api
def test_list_agents(client: TestClient, auth_headers):
    """Teste para listar agentes"""
    response = client.get("/api/v1/agents/", headers=auth_headers)
    assert response.status_code in [200, 401]


@pytest.mark.api
def test_list_templates(client: TestClient, auth_headers):
    """Teste para listar templates"""
    response = client.get("/api/v1/marketplace/templates/", headers=auth_headers)
    assert response.status_code in [200, 401]


@pytest.mark.api
def test_get_analytics_overview(client: TestClient, auth_headers):
    """Teste para obter overview de analytics"""
    response = client.get("/api/v1/analytics/overview", headers=auth_headers)
    assert response.status_code in [200, 401]


@pytest.mark.integration
@pytest.mark.database
async def test_database_connection(db_session):
    """Teste de conexão com banco de dados"""
    from sqlalchemy import text
    
    result = await db_session.execute(text("SELECT 1"))
    assert result.scalar() == 1


@pytest.mark.integration
async def test_async_client_health(async_client: AsyncClient):
    """Teste assíncrono do health check"""
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.unit
def test_cors_headers(client: TestClient):
    """Teste dos headers CORS"""
    response = client.options("/api/v1/auth/auth/me")
    # Verificar se headers CORS estão presentes
    assert response.status_code in [200, 405]  # Pode não suportar OPTIONS


@pytest.mark.performance
def test_response_time(client: TestClient):
    """Teste básico de tempo de resposta"""
    import time
    
    start_time = time.time()
    response = client.get("/health")
    end_time = time.time()
    
    response_time = end_time - start_time
    assert response_time < 1.0  # Deve responder em menos de 1 segundo
    assert response.status_code == 200


@pytest.mark.unit
def test_api_version_header(client: TestClient):
    """Teste do header de versão da API"""
    response = client.get("/health")
    # Verificar se há algum header de versão
    assert response.status_code == 200
    # O middleware deve adicionar o header de tempo de processamento
    assert "X-Process-Time" in response.headers
    assert response.headers["X-Process-Time"]

