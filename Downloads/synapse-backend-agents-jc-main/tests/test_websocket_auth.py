import pytest

from synapse.api.v1.endpoints.websockets import authenticate_websocket
from synapse.core.auth.jwt import create_access_token
from synapse.database import get_db


@pytest.mark.asyncio
async def test_authenticate_websocket_valid_token(mock_websocket, db_session, test_user):
    token = create_access_token({"sub": str(test_user.id)})
    user = await authenticate_websocket(mock_websocket, token, db_session)
    assert user is not None
    assert str(user.id) == str(test_user.id)


@pytest.mark.asyncio
async def test_authenticate_websocket_invalid_token(mock_websocket, db_session):
    user = await authenticate_websocket(mock_websocket, "invalid-token", db_session)
    assert user is None
