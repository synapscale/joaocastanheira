"""
Schemas Pydantic para agents
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# Schemas base
class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    agent_type: str = Field(default="conversational")
    personality: str | None = None
    instructions: str | None = None


class AgentCreate(AgentBase):
    model_provider: str = Field(default="openai")
    model_name: str = Field(default="gpt-3.5-turbo")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=1000, ge=1, le=128000)
    tools: list[str] = Field(default_factory=list)
    knowledge_base: dict[str, Any] | None = None
    avatar_url: str | None = None


class AgentUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    agent_type: str | None = None
    personality: str | None = None
    instructions: str | None = None
    model_provider: str | None = None
    model_name: str | None = None
    temperature: float | None = Field(None, ge=0.0, le=2.0)
    max_tokens: int | None = Field(None, ge=1, le=128000)
    tools: list[str] | None = None
    knowledge_base: dict[str, Any] | None = None
    avatar_url: str | None = None
    status: str | None = None


class AgentResponse(AgentBase):
    id: str
    user_id: str
    workspace_id: str | None = None
    model_provider: str
    model_name: str
    temperature: float
    max_tokens: int
    status: str
    tools: list[str]
    knowledge_base: dict[str, Any] | None = None
    avatar_url: str | None = None
    conversation_count: int
    message_count: int
    rating_average: float
    rating_count: int
    last_active_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class AgentListResponse(BaseModel):
    items: list[AgentResponse]
    total: int
    page: int
    size: int
    pages: int
