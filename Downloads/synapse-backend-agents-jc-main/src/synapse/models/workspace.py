"""
Modelos Workspace para Colaboração
Criado por José - um desenvolvedor Full Stack
Sistema avançado de workspaces colaborativos
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    JSON,
    Enum,
    text,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from synapse.database import Base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid


class WorkspaceRole(PyEnum):
    """Papéis em um workspace"""

    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"
    GUEST = "guest"


class PermissionLevel(PyEnum):
    """Níveis de permissão"""

    NONE = "none"
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    OWNER = "owner"


class Workspace(Base):
    """
    Modelo para workspaces colaborativos
    """

    __tablename__ = "workspaces"

    # Identificação
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(120), unique=True, nullable=False, index=True)

    # Informações básicas
    description = Column(Text)
    avatar_url = Column(String(500))
    color = Column(String(7), default="#3B82F6")  # Cor hex

    # Proprietário
    owner_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    # Configurações
    is_public = Column(Boolean, nullable=False, server_default=text("false"))
    is_template = Column(Boolean, default=False, nullable=False)
    allow_guest_access = Column(Boolean, default=False, nullable=False)
    require_approval = Column(Boolean, default=True, nullable=False)

    # Limites
    max_members = Column(Integer, default=10)
    max_projects = Column(Integer, default=50)
    max_storage_mb = Column(Integer, default=1000)

    # Configurações de colaboração
    enable_real_time_editing = Column(Boolean, default=True, nullable=False)
    enable_comments = Column(Boolean, default=True, nullable=False)
    enable_chat = Column(Boolean, default=True, nullable=False)
    enable_video_calls = Column(Boolean, default=False, nullable=False)

    # Configurações de notificação
    notification_settings = Column(JSON, default=dict)

    # Estatísticas
    member_count = Column(Integer, default=1, nullable=False)
    project_count = Column(Integer, default=0, nullable=False)
    activity_count = Column(Integer, default=0, nullable=False)
    storage_used_mb = Column(Float, default=0.0, nullable=False)

    # Status
    status = Column(
        String(20), default="active", nullable=False
    )  # active, suspended, deleted

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_activity_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    owner = relationship("User", back_populates="owned_workspaces")
    members = relationship(
        "WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan"
    )
    projects = relationship(
        "WorkspaceProject", back_populates="workspace", cascade="all, delete-orphan"
    )
    invitations = relationship(
        "WorkspaceInvitation", back_populates="workspace", cascade="all, delete-orphan"
    )
    activities = relationship(
        "WorkspaceActivity", back_populates="workspace", cascade="all, delete-orphan"
    )
    workflows = relationship(
        "Workflow", back_populates="workspace", cascade="all, delete-orphan"
    )
    nodes = relationship(
        "Node", back_populates="workspace", cascade="all, delete-orphan"
    )
    agents = relationship(
        "Agent", back_populates="workspace", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return (
            f"<Workspace(id={self.id}, name='{self.name}', owner_id={self.owner_id})>"
        )

    @property
    def is_over_member_limit(self):
        """Verifica se excedeu o limite de membros"""
        return self.member_count > self.max_members

    @property
    def is_over_storage_limit(self):
        """Verifica se excedeu o limite de armazenamento"""
        return self.storage_used_mb > self.max_storage_mb

    def get_member_role(self, user_id: int):
        """Obtém o papel de um usuário no workspace"""
        if self.owner_id == user_id:
            return WorkspaceRole.OWNER

        member = next((m for m in self.members if m.user_id == user_id), None)
        return WorkspaceRole(member.role) if member else None


class WorkspaceMember(Base):
    """
    Modelo para membros de workspace
    """

    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Papel e permissões
    role = Column(Enum(WorkspaceRole), nullable=False, default=WorkspaceRole.VIEWER)
    custom_permissions = Column(JSON, default=dict)

    # Status
    status = Column(
        String(20), default="active", nullable=False
    )  # active, suspended, left
    is_favorite = Column(Boolean, default=False, nullable=False)

    # Configurações pessoais
    notification_preferences = Column(JSON, default=dict)
    last_seen_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Timestamps
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    left_at = Column(DateTime)

    # Relacionamentos
    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User")

    # Constraint para evitar duplicatas
    __table_args__ = {"extend_existing": True}

    def __repr__(self):
        return f"<WorkspaceMember(workspace_id={self.workspace_id}, user_id={self.user_id}, role={self.role})>"

    def has_permission(self, permission: str, resource_type: str = None) -> bool:
        """Verifica se o membro tem uma permissão específica"""
        # Owner tem todas as permissões
        if self.role == WorkspaceRole.OWNER:
            return True

        # Admin tem quase todas as permissões
        if self.role == WorkspaceRole.ADMIN:
            return permission not in ["delete_workspace", "transfer_ownership"]

        # Verificar permissões customizadas
        if resource_type and resource_type in self.custom_permissions:
            return self.custom_permissions[resource_type].get(permission, False)

        # Permissões padrão por papel
        default_permissions = {
            WorkspaceRole.EDITOR: {
                "read_projects",
                "write_projects",
                "create_projects",
                "read_members",
                "comment",
                "chat",
            },
            WorkspaceRole.VIEWER: {
                "read_projects",
                "read_members",
                "comment",
            },
            WorkspaceRole.GUEST: {
                "read_projects",
            },
        }

        return permission in default_permissions.get(self.role, set())


class WorkspaceProject(Base):
    """
    Modelo para projetos dentro de workspaces
    """

    __tablename__ = "workspace_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=False, index=True)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False, index=True)

    # Informações do projeto
    name = Column(String(100), nullable=False)
    description = Column(Text)
    color = Column(String(7), default="#10B981")

    # Configurações de colaboração
    allow_concurrent_editing = Column(Boolean, default=True, nullable=False)
    auto_save_interval = Column(Integer, default=30)  # segundos
    version_control_enabled = Column(Boolean, default=True, nullable=False)

    # Status
    status = Column(
        String(20), default="active", nullable=False
    )  # active, archived, deleted
    is_template = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)

    # Estatísticas
    collaborator_count = Column(Integer, default=0, nullable=False)
    edit_count = Column(Integer, default=0, nullable=False)
    comment_count = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    last_edited_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    workspace = relationship("Workspace", back_populates="projects")
    workflow = relationship("Workflow")
    collaborators = relationship(
        "ProjectCollaborator", back_populates="project", cascade="all, delete-orphan"
    )
    comments = relationship(
        "ProjectComment", back_populates="project", cascade="all, delete-orphan"
    )
    versions = relationship(
        "ProjectVersion", back_populates="project", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<WorkspaceProject(id={self.id}, name='{self.name}', workspace_id={self.workspace_id})>"


class ProjectCollaborator(Base):
    """
    Modelo para colaboradores de projeto
    """

    __tablename__ = "project_collaborators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("workspace_projects.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Permissões específicas do projeto
    can_edit = Column(Boolean, default=True, nullable=False)
    can_comment = Column(Boolean, default=True, nullable=False)
    can_share = Column(Boolean, default=False, nullable=False)
    can_delete = Column(Boolean, default=False, nullable=False)

    # Estado de colaboração
    is_online = Column(Boolean, default=False, nullable=False)
    current_cursor_position = Column(JSON)  # Posição do cursor para edição colaborativa
    last_edit_at = Column(DateTime)

    # Timestamps
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_seen_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    project = relationship("WorkspaceProject", back_populates="collaborators")
    user = relationship("User")

    def __repr__(self):
        return f"<ProjectCollaborator(project_id={self.project_id}, user_id={self.user_id})>"


class WorkspaceInvitation(Base):
    """
    Modelo para convites de workspace
    """

    __tablename__ = "workspace_invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=False, index=True)
    inviter_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)
    invited_user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), index=True)

    # Destinatário
    email = Column(String(255), nullable=False, index=True)

    # Convite
    role = Column(Enum(WorkspaceRole), nullable=False, default=WorkspaceRole.VIEWER)
    message = Column(Text)
    token = Column(String(100), unique=True, nullable=False, index=True)

    # Status
    status = Column(
        String(20), default="pending", nullable=False
    )  # pending, accepted, declined, expired

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    responded_at = Column(DateTime)

    # Relacionamentos
    workspace = relationship("Workspace", back_populates="invitations")
    inviter = relationship("User", foreign_keys=[inviter_id])
    invited_user = relationship("User", foreign_keys=[invited_user_id])

    def __repr__(self):
        return f"<WorkspaceInvitation(id={self.id}, workspace_id={self.workspace_id}, email='{self.email}')>"

    @property
    def is_expired(self):
        """Verifica se o convite expirou"""
        return datetime.utcnow() > self.expires_at


class WorkspaceActivity(Base):
    """
    Modelo para atividades do workspace
    """

    __tablename__ = "workspace_activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Atividade
    action = Column(
        String(50), nullable=False, index=True
    )  # created, updated, deleted, etc.
    resource_type = Column(String(50), nullable=False)  # project, member, etc.
    resource_id = Column(Integer)

    # Detalhes
    description = Column(String(500), nullable=False)
    meta_data = Column(JSON, default=dict)

    # Contexto
    ip_address = Column(String(45))
    user_agent = Column(String(500))

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    workspace = relationship("Workspace", back_populates="activities")
    user = relationship("User")

    def __repr__(self):
        return f"<WorkspaceActivity(id={self.id}, action='{self.action}', resource_type='{self.resource_type}')>"


class ProjectComment(Base):
    """
    Modelo para comentários em projetos
    """

    __tablename__ = "project_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("workspace_projects.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)
    parent_id = Column(
        UUID(as_uuid=True), ForeignKey("project_comments.id"), index=True
    )  # Para threads

    # Conteúdo
    content = Column(Text, nullable=False)
    content_type = Column(String(20), default="text", nullable=False)  # text, markdown

    # Posicionamento (para comentários contextuais)
    node_id = Column(String(36))  # ID do nó comentado
    position_x = Column(Float)
    position_y = Column(Float)

    # Status
    is_resolved = Column(Boolean, default=False, nullable=False)
    is_edited = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    resolved_at = Column(DateTime)

    # Relacionamentos
    project = relationship("WorkspaceProject", back_populates="comments")
    user = relationship("User")
    parent = relationship("ProjectComment", remote_side=[id])
    replies = relationship("ProjectComment", back_populates="parent")

    def __repr__(self):
        return f"<ProjectComment(id={self.id}, project_id={self.project_id}, user_id={self.user_id})>"


class ProjectVersion(Base):
    """
    Modelo para controle de versão de projetos
    """

    __tablename__ = "project_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("workspace_projects.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Versão
    version_number = Column(Integer, nullable=False)
    version_name = Column(String(100))
    description = Column(Text)

    # Dados
    workflow_data = Column(JSON, nullable=False)  # Snapshot do workflow
    changes_summary = Column(JSON, default=dict)  # Resumo das mudanças

    # Metadata
    file_size = Column(Integer)
    checksum = Column(String(64))  # SHA-256

    # Status
    is_major = Column(Boolean, default=False, nullable=False)
    is_auto_save = Column(Boolean, default=False, nullable=False)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    project = relationship("WorkspaceProject", back_populates="versions")
    user = relationship("User")

    def __repr__(self):
        return f"<ProjectVersion(id={self.id}, project_id={self.project_id}, version={self.version_number})>"
