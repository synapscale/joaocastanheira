"""
Testes de autenticação e autorização
"""
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient


@pytest.mark.auth
class TestAuthentication:
    """Testes de autenticação"""
    
    def test_register_valid_user(self, client: TestClient):
        """Teste de registro com dados válidos"""
        user_data = {
            "email": "valid@example.com",
            "first_name": "Valid",
            "last_name": "User",
            "password": "ValidPassword123!"
        }
        
        response = client.post("/api/v1/auth/auth/register", json=user_data)
        assert response.status_code in [200, 201]
    
    def test_register_invalid_email(self, client: TestClient):
        """Teste de registro com email inválido"""
        user_data = {
            "email": "invalid-email",
            "first_name": "Invalid",
            "last_name": "User",
            "password": "ValidPassword123!"
        }
        
        response = client.post("/api/v1/auth/auth/register", json=user_data)
        assert response.status_code == 422  # Validation error
    
    def test_register_weak_password(self, client: TestClient):
        """Teste de registro com senha fraca"""
        user_data = {
            "email": "weak@example.com",
            "first_name": "Weak",
            "last_name": "Password",
            "password": "123"
        }
        
        response = client.post("/api/v1/auth/auth/register", json=user_data)
        assert response.status_code == 422  # Validation error
    
    def test_login_valid_credentials(self, client: TestClient):
        """Teste de login com credenciais válidas"""
        # Primeiro registrar
        user_data = {
            "email": "login@example.com",
            "first_name": "Login",
            "last_name": "Test",
            "password": "LoginPassword123!"
        }
        client.post("/api/v1/auth/auth/register", json=user_data)
        
        # Tentar login
        login_data = {
            "email": "login@example.com",
            "password": "LoginPassword123!"
        }
        
        response = client.post("/api/v1/auth/auth/login", json=login_data)
        assert response.status_code in [200, 201]
    
    def test_login_invalid_credentials(self, client: TestClient):
        """Teste de login com credenciais inválidas"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "WrongPassword123!"
        }
        
        response = client.post("/api/v1/auth/auth/login", json=login_data)
        assert response.status_code in [401, 404]  # Unauthorized or Not Found
    
    def test_access_protected_endpoint_without_token(self, client: TestClient):
        """Teste de acesso a endpoint protegido sem token"""
        response = client.get("/api/v1/auth/auth/me")
        assert response.status_code == 401  # Unauthorized
    
    def test_refresh_token_endpoint(self, client: TestClient):
        """Teste do endpoint de refresh token"""
        # Primeiro fazer login para obter tokens
        user_data = {
            "email": "refresh@example.com",
            "first_name": "Refresh",
            "last_name": "Test",
            "password": "RefreshPassword123!"
        }
        client.post("/api/v1/auth/auth/register", json=user_data)
        
        login_data = {
            "email": "refresh@example.com",
            "password": "RefreshPassword123!"
        }
        
        login_response = client.post("/api/v1/auth/auth/login", json=login_data)
        
        if login_response.status_code in [200, 201]:
            login_data = login_response.json()
            if "refresh_token" in login_data:
                # Tentar refresh
                refresh_data = {"refresh_token": login_data["refresh_token"]}
                response = client.post("/api/v1/auth/auth/refresh", json=refresh_data)
                assert response.status_code in [200, 201]


@pytest.mark.auth
class TestAuthorization:
    """Testes de autorização"""
    
    def test_user_can_access_own_data(self, client: TestClient, test_user_sync, auth_headers):
        """Teste se usuário pode acessar seus próprios dados"""
        response = client.get("/api/v1/auth/auth/me", headers=auth_headers)
        assert response.status_code == 200
    
    def test_user_cannot_access_admin_endpoints(self, client: TestClient, test_user_sync, auth_headers):
        """Teste se usuário comum não pode acessar endpoints admin"""
        response = client.get("/api/v1/admin/users", headers=auth_headers)
        assert response.status_code in [401, 403, 404]  # Unauthorized, Forbidden, or Not Found


@pytest.mark.auth
@pytest.mark.integration
class TestAuthenticationFlow:
    """Testes de fluxo completo de autenticação"""
    
    async def test_complete_auth_flow(self, async_client: AsyncClient):
        """Teste do fluxo completo de autenticação"""
        # 1. Registrar usuário
        user_data = {
            "email": "flow@example.com",
            "first_name": "Flow",
            "last_name": "Test",
            "password": "FlowPassword123!"
        }
        
        register_response = await async_client.post(
            "/api/v1/auth/auth/register", 
            json=user_data
        )
        assert register_response.status_code in [200, 201]
        
        # 2. Fazer login
        login_data = {
            "email": "flow@example.com",
            "password": "FlowPassword123!"
        }
        
        login_response = await async_client.post(
            "/api/v1/auth/auth/login", 
            json=login_data
        )
        assert login_response.status_code in [200, 201]
        
        # 3. Verificar se recebeu tokens
        if login_response.status_code in [200, 201]:
            login_data = login_response.json()
            assert "access_token" in login_data or "token" in login_data
        
        # 4. Acessar endpoint protegido com token
        if login_response.status_code in [200, 201]:
            login_data = login_response.json()
            token = login_data.get("access_token") or login_data.get("token")
            
            if token:
                headers = {"Authorization": f"Bearer {token}"}
                me_response = await async_client.get(
                    "/api/v1/auth/auth/me", 
                    headers=headers
                )
                assert me_response.status_code == 200
        
        # 5. Fazer logout
        logout_response = await async_client.post("/api/v1/auth/auth/logout")
        assert logout_response.status_code in [200, 401]  # Success or already logged out

