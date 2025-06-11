"""
Schemas Pydantic para nodes
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# Schemas base
class NodeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    type: str = Field(..., min_length=1)
    category: str | None = None
    is_public: bool = False
    icon: str = Field(default="🔧")
    color: str = Field(default="#6366f1")


class NodeCreate(NodeBase):
    code_template: str = Field(..., min_length=1)
    input_schema: dict[str, Any] = Field(default_factory=dict)
    output_schema: dict[str, Any] = Field(default_factory=dict)
    parameters_schema: dict[str, Any] | None = None
    documentation: str | None = None
    examples: list[dict[str, Any]] = Field(default_factory=list)


class NodeUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    type: str | None = None
    category: str | None = None
    is_public: bool | None = None
    icon: str | None = None
    color: str | None = None
    code_template: str | None = None
    input_schema: dict[str, Any] | None = None
    output_schema: dict[str, Any] | None = None
    parameters_schema: dict[str, Any] | None = None
    documentation: str | None = None
    examples: list[dict[str, Any]] | None = None
    status: str | None = None


class NodeResponse(NodeBase):
    id: str
    user_id: str
    workspace_id: str | None = None
    status: str
    version: str
    code_template: str
    input_schema: dict[str, Any]
    output_schema: dict[str, Any]
    parameters_schema: dict[str, Any] | None = None
    documentation: str | None = None
    examples: list[dict[str, Any]]
    downloads_count: int
    usage_count: int
    rating_average: float
    rating_count: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class NodeListResponse(BaseModel):
    items: list[NodeResponse]
    total: int
    page: int
    size: int
    pages: int
