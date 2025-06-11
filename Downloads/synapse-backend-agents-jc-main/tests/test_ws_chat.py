import pytest

from synapse.core.websockets.manager import WebSocketHandler
from synapse.core.llm.unified_service import unified_service, LLMResponse
from synapse.models.conversation import Conversation


@pytest.mark.asyncio
async def test_handle_chat_message_success(db_session, test_user, test_utils, mock_websocket, monkeypatch):
    agent = await test_utils.create_test_agent(db_session, test_user)
    conversation = Conversation(user_id=test_user.id, agent_id=agent.id)
    db_session.add(conversation)
    await db_session.commit()
    await db_session.refresh(conversation)

    async def fake_chat_completion(*args, **kwargs):
        return LLMResponse(content="ok", model="m", provider="p", usage={"tokens": 5})

    monkeypatch.setattr(unified_service, "chat_completion", fake_chat_completion)

    handler = WebSocketHandler(mock_websocket, test_user, db_session)
    await handler._handle_chat_message({"conversation_id": conversation.id, "content": "hi"})

    await db_session.refresh(conversation)
    assert conversation.message_count == 2
    assert conversation.total_tokens_used == 5


@pytest.mark.asyncio
async def test_handle_chat_message_failure(db_session, test_user, test_utils, mock_websocket, monkeypatch):
    agent = await test_utils.create_test_agent(db_session, test_user)
    conversation = Conversation(user_id=test_user.id, agent_id=agent.id)
    db_session.add(conversation)
    await db_session.commit()
    await db_session.refresh(conversation)

    async def fake_fail(*args, **kwargs):
        raise RuntimeError("fail")

    monkeypatch.setattr(unified_service, "chat_completion", fake_fail)

    handler = WebSocketHandler(mock_websocket, test_user, db_session)
    await handler._handle_chat_message({"conversation_id": conversation.id, "content": "hi"})

    await db_session.refresh(conversation)
    assert conversation.message_count == 1
    assert conversation.total_tokens_used == 0
