"""
Schemas Pydantic para conversations e messages
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# Schemas de Conversation
class ConversationBase(BaseModel):
    title: str | None = None
    agent_id: str | None = None
    workspace_id: str | None = None


class ConversationCreate(ConversationBase):
    context: dict[str, Any] | None = Field(default_factory=dict)
    settings: dict[str, Any] | None = Field(default_factory=dict)


class ConversationResponse(ConversationBase):
    id: str
    user_id: str
    status: str
    message_count: int
    total_tokens_used: int
    context: dict[str, Any] | None = None
    settings: dict[str, Any] | None = None
    last_message_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class ConversationListResponse(BaseModel):
    items: list[ConversationResponse]
    total: int
    page: int
    size: int
    pages: int


# Schemas de Message
class MessageBase(BaseModel):
    content: str = Field(..., min_length=1)
    role: str = Field(..., pattern="^(user|assistant|system)$")


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    attachments: list[dict[str, Any]] | None = Field(default_factory=list)


class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    attachments: list[dict[str, Any]]
    model_used: str | None = None
    model_provider: str | None = None
    tokens_used: int
    processing_time_ms: int
    temperature: float | None = None
    max_tokens: int | None = None
    status: str
    error_message: str | None = None
    rating: int | None = None
    feedback: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class MessageListResponse(BaseModel):
    items: list[MessageResponse]
    total: int
    page: int
    size: int
    pages: int
