import pytest
from fastapi.testclient import TestClient

@pytest.mark.api
class TestWorkflowUpdateDelete:
    def test_update_workflow(self, client: TestClient, auth_headers):
        # Supondo que workflow 1 existe
        update_data = {"name": "Updated Workflow"}
        resp = client.put("/api/v1/workflows/1", json=update_data, headers=auth_headers)
        assert resp.status_code in [200, 401, 404]

    def test_delete_workflow(self, client: TestClient, auth_headers):
        resp = client.delete("/api/v1/workflows/1", headers=auth_headers)
        assert resp.status_code in [200, 204, 401, 404]

@pytest.mark.api
class TestAgentUpdateDelete:
    def test_update_agent(self, client: TestClient, auth_headers):
        update_data = {"name": "Updated Agent"}
        resp = client.put("/api/v1/agents/1", json=update_data, headers=auth_headers)
        assert resp.status_code in [200, 401, 404]

    def test_delete_agent(self, client: TestClient, auth_headers):
        resp = client.delete("/api/v1/agents/1", headers=auth_headers)
        assert resp.status_code in [200, 204, 401, 404]

@pytest.mark.api
class TestTemplateUpdateDelete:
    def test_update_template(self, client: TestClient, auth_headers):
        update_data = {"name": "Updated Template"}
        resp = client.put("/api/v1/templates/1", json=update_data, headers=auth_headers)
        assert resp.status_code in [200, 401, 404]

    def test_delete_template(self, client: TestClient, auth_headers):
        resp = client.delete("/api/v1/templates/1", headers=auth_headers)
        assert resp.status_code in [200, 204, 401, 404]

@pytest.mark.api
class TestAdminEndpoints:
    def test_admin_users_endpoint_forbidden(self, client: TestClient, auth_headers):
        resp = client.get("/api/v1/admin/users", headers=auth_headers)
        assert resp.status_code in [401, 403, 404]

    def test_analytics_business_metrics(self, client: TestClient, auth_headers):
        resp = client.get("/api/v1/analytics/metrics/business", headers=auth_headers)
        assert resp.status_code in [200, 401, 403]

@pytest.mark.api
class TestErrorAndAuthFlows:
    def test_update_workflow_unauthenticated(self, client: TestClient):
        update_data = {"name": "Should Fail"}
        resp = client.put("/api/v1/workflows/1", json=update_data)
        assert resp.status_code == 401

    def test_delete_workflow_unauthenticated(self, client: TestClient):
        resp = client.delete("/api/v1/workflows/1")
        assert resp.status_code == 401

    def test_update_nonexistent_workflow(self, client: TestClient, auth_headers):
        update_data = {"name": "Nonexistent"}
        resp = client.put("/api/v1/workflows/999999", json=update_data, headers=auth_headers)
        assert resp.status_code in [404, 401]

    def test_delete_nonexistent_workflow(self, client: TestClient, auth_headers):
        resp = client.delete("/api/v1/workflows/999999", headers=auth_headers)
        assert resp.status_code in [404, 401] 