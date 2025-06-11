"""
Modelo completo de Workflow com todas as funcionalidades
"""

from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Text,
    JSON,
    Integer,
    ForeignKey,
    Enum,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from synapse.database import Base


class WorkflowStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    DEPRECATED = "deprecated"


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    definition = Column(JSONB, nullable=False)
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True, index=True)
    is_public = Column(Boolean, default=False)
    category = Column(String(100))
    tags = Column(JSON, default=list)
    version = Column(String(20), default="1.0.0")
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.DRAFT)
    thumbnail_url = Column(String(500))
    downloads_count = Column(Integer, default=0)
    rating_average = Column(Integer, default=0)  # 0-5 estrelas
    rating_count = Column(Integer, default=0)
    execution_count = Column(Integer, default=0)
    last_executed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relacionamentos
    user = relationship("User", back_populates="workflows")
    workspace = relationship("Workspace", back_populates="workflows")
    workflow_nodes = relationship(
        "WorkflowNode", back_populates="workflow", cascade="all, delete-orphan"
    )
    connections = relationship(
        "WorkflowConnection", back_populates="workflow", cascade="all, delete-orphan"
    )
    executions = relationship(
        "WorkflowExecution",
        back_populates="workflow",
        cascade="all, delete-orphan",
    )

    def to_dict(self, include_definition: bool = True) -> dict:
        """Converte workflow para dicionário"""
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "user_id": self.user_id,
            "workspace_id": str(self.workspace_id) if self.workspace_id else None,
            "is_public": self.is_public,
            "category": self.category,
            "tags": self.tags,
            "version": self.version,
            "status": self.status.value,
            "thumbnail_url": self.thumbnail_url,
            "downloads_count": self.downloads_count,
            "rating_average": self.rating_average,
            "rating_count": self.rating_count,
            "execution_count": self.execution_count,
            "last_executed_at": (
                self.last_executed_at.isoformat() if self.last_executed_at else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_definition:
            data["definition"] = self.definition

        return data

    def validate_definition(self) -> bool:
        """Valida a estrutura da definição do workflow"""
        if not isinstance(self.definition, dict):
            return False

        required_keys = ["nodes", "connections"]
        if not all(key in self.definition for key in required_keys):
            return False

        # Validar nodes
        nodes = self.definition.get("nodes", [])
        if not isinstance(nodes, list):
            return False

        # Validar connections
        connections = self.definition.get("connections", [])
        if not isinstance(connections, list):
            return False

        return True

    def get_node_count(self) -> int:
        """Retorna o número de nodes no workflow"""
        return len(self.definition.get("nodes", []))

    def get_connection_count(self) -> int:
        """Retorna o número de conexões no workflow"""
        return len(self.definition.get("connections", []))

    def increment_downloads(self):
        """Incrementa contador de downloads"""
        self.downloads_count += 1

    def increment_executions(self):
        """Incrementa contador de execuções"""
        self.execution_count += 1
        self.last_executed_at = func.now()

    def update_rating(self, new_rating: int):
        """Atualiza rating médio com nova avaliação"""
        total_points = self.rating_average * self.rating_count
        total_points += new_rating
        self.rating_count += 1
        self.rating_average = total_points / self.rating_count


class WorkflowNode(Base):
    __tablename__ = "workflow_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(
        UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False, index=True
    )
    node_id = Column(
        UUID(as_uuid=True), ForeignKey("nodes.id"), nullable=False, index=True
    )
    instance_name = Column(String(200))
    position_x = Column(Integer, nullable=False)
    position_y = Column(Integer, nullable=False)
    configuration = Column(JSON, default=dict)  # Parâmetros específicos desta instância
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    workflow = relationship("Workflow", back_populates="workflow_nodes")
    node = relationship("Node", back_populates="workflow_instances")

    def to_dict(self) -> dict:
        """Converte instância de node para dicionário"""
        return {
            "id": str(self.id),
            "workflow_id": str(self.workflow_id),
            "node_id": str(self.node_id),
            "instance_name": self.instance_name,
            "position_x": self.position_x,
            "position_y": self.position_y,
            "configuration": self.configuration,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class WorkflowConnection(Base):
    __tablename__ = "workflow_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(
        UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False, index=True
    )
    source_node_id = Column(
        UUID(as_uuid=True), ForeignKey("workflow_nodes.id"), nullable=False
    )
    target_node_id = Column(
        UUID(as_uuid=True), ForeignKey("workflow_nodes.id"), nullable=False
    )
    source_port = Column(String(100))
    target_port = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    workflow = relationship("Workflow", back_populates="connections")
    source_node = relationship("WorkflowNode", foreign_keys=[source_node_id])
    target_node = relationship("WorkflowNode", foreign_keys=[target_node_id])

    def to_dict(self) -> dict:
        """Converte conexão para dicionário"""
        return {
            "id": str(self.id),
            "workflow_id": str(self.workflow_id),
            "source_node_id": str(self.source_node_id),
            "target_node_id": str(self.target_node_id),
            "source_port": self.source_port,
            "target_port": self.target_port,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
