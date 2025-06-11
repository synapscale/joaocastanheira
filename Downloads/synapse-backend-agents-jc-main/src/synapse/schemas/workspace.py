"""
Schemas Pydantic para Workspaces
Criado por José - um desenvolvedor Full Stack
Validação e serialização para workspaces colaborativos
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================


class WorkspaceRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    GUEST = "guest"


class PermissionLevel(str, Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"


class InvitationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


class ProjectStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"


# ==================== WORKSPACE SCHEMAS ====================


class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    avatar_url: str | None = None
    color: str | None = Field("#3B82F6", pattern="^#[0-9A-Fa-f]{6}$")
    is_public: bool = False
    allow_guest_access: bool = False
    require_approval: bool = True
    max_members: int = Field(10, ge=1, le=1000)
    max_projects: int = Field(50, ge=1, le=10000)
    max_storage_mb: int = Field(1000, ge=100, le=100000)
    enable_real_time_editing: bool = True
    enable_comments: bool = True
    enable_chat: bool = True
    enable_video_calls: bool = False
    notification_settings: dict[str, Any] | None = Field(default_factory=dict)


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    avatar_url: str | None = None
    color: str | None = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    is_public: bool | None = None
    allow_guest_access: bool | None = None
    require_approval: bool | None = None
    max_members: int | None = Field(None, ge=1, le=1000)
    max_projects: int | None = Field(None, ge=1, le=10000)
    max_storage_mb: int | None = Field(None, ge=100, le=100000)
    enable_real_time_editing: bool | None = None
    enable_comments: bool | None = None
    enable_chat: bool | None = None
    enable_video_calls: bool | None = None
    notification_settings: dict[str, Any] | None = None


class WorkspaceResponse(WorkspaceBase):
    id: int
    slug: str
    owner_id: int
    owner_name: str
    member_count: int = 0
    project_count: int = 0
    activity_count: int = 0
    storage_used_mb: float = 0.0
    status: str = "active"
    last_activity_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== MEMBER SCHEMAS ====================


class MemberInvite(BaseModel):
    email: str = Field(..., pattern=r"^[^@]+@[^@]+\.[^@]+$")
    role: WorkspaceRole = WorkspaceRole.MEMBER
    message: str | None = Field(None, max_length=500)


class MemberResponse(BaseModel):
    id: int
    workspace_id: int
    user_id: int
    user_name: str
    user_email: str
    user_avatar: str | None = None
    role: WorkspaceRole
    status: str = "active"
    joined_at: datetime
    last_active_at: datetime | None = None

    class Config:
        from_attributes = True


class MemberUpdate(BaseModel):
    role: WorkspaceRole


# ==================== INVITATION SCHEMAS ====================


class InvitationResponse(BaseModel):
    id: int
    workspace_id: int
    workspace_name: str
    inviter_id: int
    inviter_name: str
    email: str
    role: WorkspaceRole
    message: str | None = None
    token: str
    status: InvitationStatus
    expires_at: datetime
    created_at: datetime
    responded_at: datetime | None = None

    class Config:
        from_attributes = True


# ==================== PROJECT SCHEMAS ====================


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    color: str | None = Field("#10B981", pattern="^#[0-9A-Fa-f]{6}$")
    allow_concurrent_editing: bool = True
    auto_save_interval: int = Field(30, ge=5, le=300)
    version_control_enabled: bool = True


class ProjectCreate(ProjectBase):
    workflow_id: int | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    color: str | None = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    allow_concurrent_editing: bool | None = None
    auto_save_interval: int | None = Field(None, ge=5, le=300)
    version_control_enabled: bool | None = None


class ProjectResponse(ProjectBase):
    id: int
    workspace_id: int
    workflow_id: int
    collaborator_count: int = 0
    comment_count: int = 0
    version_count: int = 0
    status: ProjectStatus = ProjectStatus.ACTIVE
    last_edited_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== COLLABORATOR SCHEMAS ====================


class CollaboratorPermissions(BaseModel):
    can_edit: bool = True
    can_comment: bool = True
    can_share: bool = False
    can_delete: bool = False


class CollaboratorAdd(BaseModel):
    user_id: int
    permissions: CollaboratorPermissions


class CollaboratorResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    user_name: str
    user_email: str
    user_avatar: str | None = None
    can_edit: bool
    can_comment: bool
    can_share: bool
    can_delete: bool
    added_at: datetime

    class Config:
        from_attributes = True


# ==================== COMMENT SCHEMAS ====================


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    content_type: str = Field("text", pattern="^(text|markdown)$")
    node_id: str | None = Field(None, max_length=50)
    position_x: float | None = None
    position_y: float | None = None


class CommentCreate(CommentBase):
    parent_id: int | None = None


class CommentUpdate(BaseModel):
    content: str | None = Field(None, min_length=1, max_length=2000)
    content_type: str | None = Field(None, pattern="^(text|markdown)$")


class CommentResponse(CommentBase):
    id: int
    project_id: int
    user_id: int
    user_name: str
    user_avatar: str | None = None
    parent_id: int | None = None
    reply_count: int = 0
    is_resolved: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== ACTIVITY SCHEMAS ====================


class ActivityResponse(BaseModel):
    id: int
    workspace_id: int
    user_id: int
    user_name: str
    user_avatar: str | None = None
    action: str
    resource_type: str
    resource_id: int | None = None
    description: str
    metadata: dict[str, Any] | None = Field(default_factory=dict)
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== VERSION SCHEMAS ====================


class ProjectVersionResponse(BaseModel):
    id: int
    project_id: int
    version_number: int
    name: str | None = None
    description: str | None = None
    workflow_data: dict[str, Any]
    created_by: int
    creator_name: str
    is_current: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class VersionCreate(BaseModel):
    name: str | None = Field(None, max_length=100)
    description: str | None = Field(None, max_length=500)


# ==================== WORKSPACE STATS ====================


class WorkspaceStats(BaseModel):
    member_count: int
    project_count: int
    activity_count: int
    storage_used_mb: float
    storage_limit_mb: int
    storage_usage_percent: float
    recent_activity_count: int
    active_projects: int


# ==================== SEARCH SCHEMAS ====================


class WorkspaceSearch(BaseModel):
    query: str | None = None
    is_public: bool | None = None
    has_projects: bool | None = None
    min_members: int | None = Field(None, ge=1)
    max_members: int | None = Field(None, ge=1)
    sort_by: str | None = Field(
        "activity", pattern="^(activity|members|projects|created|name)$"
    )
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)


class ProjectSearch(BaseModel):
    query: str | None = None
    workspace_id: int | None = None
    status: ProjectStatus | None = None
    has_collaborators: bool | None = None
    sort_by: str | None = Field("updated", pattern="^(updated|created|name|activity)$")
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)


# ==================== BULK OPERATIONS ====================


class BulkMemberOperation(BaseModel):
    action: str = Field(..., pattern="^(remove|change_role|send_reminder)$")
    member_ids: list[int] = Field(..., min_items=1, max_items=50)
    new_role: WorkspaceRole | None = None
    reason: str | None = Field(None, max_length=500)


class BulkProjectOperation(BaseModel):
    action: str = Field(..., pattern="^(archive|delete|move_workspace)$")
    project_ids: list[int] = Field(..., min_items=1, max_items=50)
    target_workspace_id: int | None = None
    reason: str | None = Field(None, max_length=500)


class BulkOperationResponse(BaseModel):
    success_count: int
    error_count: int
    errors: list[dict[str, Any]]


# ==================== REAL-TIME SCHEMAS ====================


class RealTimeEvent(BaseModel):
    event_type: str
    workspace_id: int
    project_id: int | None = None
    user_id: int
    user_name: str
    data: dict[str, Any]
    timestamp: datetime


class CursorPosition(BaseModel):
    user_id: int
    user_name: str
    user_color: str
    x: float
    y: float
    node_id: str | None = None
    timestamp: datetime


class EditOperation(BaseModel):
    operation_type: str = Field(..., pattern="^(insert|delete|update|move)$")
    node_id: str | None = None
    data: dict[str, Any]
    user_id: int
    timestamp: datetime


# ==================== NOTIFICATION SCHEMAS ====================


class NotificationSettings(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    desktop_notifications: bool = True
    digest_frequency: str = Field(
        "daily", pattern="^(immediate|hourly|daily|weekly|never)$"
    )
    notify_on_mention: bool = True
    notify_on_comment: bool = True
    notify_on_project_update: bool = True
    notify_on_member_join: bool = True
    notify_on_invitation: bool = True


class NotificationPreferences(BaseModel):
    workspace_id: int
    settings: NotificationSettings


# ==================== INTEGRATION SCHEMAS ====================


class WorkspaceIntegration(BaseModel):
    integration_type: str = Field(..., max_length=50)
    config: dict[str, Any]
    is_enabled: bool = True


class IntegrationResponse(BaseModel):
    id: int
    workspace_id: int
    integration_type: str
    config: dict[str, Any]
    is_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
