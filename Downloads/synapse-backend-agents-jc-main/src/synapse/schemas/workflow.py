"""
Schemas Pydantic para workflows
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# Schemas base
class WorkflowBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    category: str | None = None
    tags: list[str] = Field(default_factory=list)
    is_public: bool = False


class WorkflowCreate(WorkflowBase):
    definition: dict[str, Any] = Field(default_factory=dict)


class WorkflowUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_public: bool | None = None
    definition: dict[str, Any] | None = None
    status: str | None = None


class WorkflowResponse(WorkflowBase):
    id: str
    user_id: str
    workspace_id: str | None = None
    version: str
    status: str
    definition: dict[str, Any]
    thumbnail_url: str | None = None
    downloads_count: int
    rating_average: float
    rating_count: int
    execution_count: int
    last_executed_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class WorkflowListResponse(BaseModel):
    items: list[WorkflowResponse]
    total: int
    page: int
    size: int
    pages: int


class WorkflowExecutionRequest(BaseModel):
    inputs: dict[str, Any] | None = Field(default_factory=dict)
    context: dict[str, Any] | None = Field(default_factory=dict)


class WorkflowExecutionResponse(BaseModel):
    execution_id: str
    status: str
    message: str
    outputs: dict[str, Any] | None = None
    error: str | None = None
