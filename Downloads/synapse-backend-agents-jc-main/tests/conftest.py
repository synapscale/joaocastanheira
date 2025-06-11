import pytest
from fastapi.testclient import TestClient
from synapse.main import app

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c 

@pytest.fixture
def sample_workflow_data():
    return {
        "name": "Workflow de Teste",
        "description": "Workflow criado para testes automatizados.",
        "category": "test",
        "tags": ["test", "automated"],
        "definition": {
            "nodes": [],
            "connections": []
        }
    } 

@pytest.fixture(scope="session")
def auth_headers(client):
    # Dados do usuário de teste
    user_data = {
        "email": "testuser@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User"
    }
    # Tenta registrar (ignora se já existe)
    client.post("/api/v1/auth/register", json=user_data)
    # Faz login
    login_data = {"username": user_data["email"], "password": user_data["password"]}
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200, f"Login falhou: {response.text}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"} 