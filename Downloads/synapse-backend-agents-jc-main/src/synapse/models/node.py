"""
Modelo completo de Node com todas as funcionalidades
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


class NodeType(enum.Enum):
    LLM = "llm"
    TRANSFORM = "transform"
    API = "api"
    CONDITION = "condition"
    TRIGGER = "trigger"
    OPERATION = "operation"
    FLOW = "flow"
    INPUT = "input"
    OUTPUT = "output"
    FILE_PROCESSOR = "file_processor"


class NodeStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    DEPRECATED = "deprecated"
    PRIVATE = "private"


class Node(Base):
    __tablename__ = "nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text)
    version = Column(String(50), nullable=False, server_default=text("'1.0.0'"))
    definition = Column(JSONB, nullable=False)
    is_public = Column(Boolean, nullable=False, server_default=text("false"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Código e configuração
    code_template = Column(Text, nullable=False)
    input_schema = Column(JSON, nullable=False)
    output_schema = Column(JSON, nullable=False)
    parameters_schema = Column(JSON, default=dict)

    # Metadados
    icon = Column(String(10), default="🔧")
    color = Column(String(7), default="#6366f1")
    documentation = Column(Text)
    examples = Column(JSON, default=list)

    # Estatísticas
    downloads_count = Column(Integer, default=0)
    usage_count = Column(Integer, default=0)
    rating_average = Column(Integer, default=0)  # 0-5 estrelas
    rating_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relacionamentos
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    user = relationship("User", back_populates="nodes")
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True, index=True)
    workspace = relationship("Workspace", back_populates="nodes")
    workflow_instances = relationship("WorkflowNode", back_populates="node")
    # Relacionamento com listagens de marketplace ainda não implementado
    # marketplace_listings = relationship("MarketplaceListing", back_populates="node")

    def to_dict(self, include_code: bool = True) -> dict:
        """Converte node para dicionário"""
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "type": self.type.value,
            "category": self.category,
            "user_id": str(self.user_id),
            "workspace_id": str(self.workspace_id) if self.workspace_id else None,
            "is_public": self.is_public,
            "status": self.status.value,
            "version": self.version,
            "icon": self.icon,
            "color": self.color,
            "documentation": self.documentation,
            "examples": self.examples,
            "downloads_count": self.downloads_count,
            "usage_count": self.usage_count,
            "rating_average": self.rating_average,
            "rating_count": self.rating_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_code:
            data.update(
                {
                    "code_template": self.code_template,
                    "input_schema": self.input_schema,
                    "output_schema": self.output_schema,
                    "parameters_schema": self.parameters_schema,
                }
            )

        return data

    def validate_schemas(self) -> bool:
        """Valida os schemas de entrada e saída"""
        try:
            # Validar que são dicionários válidos
            if not isinstance(self.input_schema, dict):
                return False
            if not isinstance(self.output_schema, dict):
                return False
            if not isinstance(self.parameters_schema, dict):
                return False

            # Validar estrutura básica dos schemas
            required_keys = ["type", "properties"]
            for schema in [self.input_schema, self.output_schema]:
                if not all(key in schema for key in required_keys):
                    return False

            return True
        except Exception:
            return False

    def increment_downloads(self):
        """Incrementa contador de downloads"""
        self.downloads_count += 1

    def increment_usage(self):
        """Incrementa contador de uso"""
        self.usage_count += 1

    def update_rating(self, new_rating: int):
        """Atualiza rating médio com nova avaliação"""
        if not 1 <= new_rating <= 5:
            raise ValueError("Rating deve estar entre 1 e 5")

        total_points = self.rating_average * self.rating_count
        total_points += new_rating
        self.rating_count += 1
        self.rating_average = total_points / self.rating_count

    def get_default_configuration(self) -> dict:
        """Retorna configuração padrão baseada no schema de parâmetros"""
        config = {}
        if self.parameters_schema and "properties" in self.parameters_schema:
            for param_name, param_config in self.parameters_schema[
                "properties"
            ].items():
                if "default" in param_config:
                    config[param_name] = param_config["default"]
        return config

    def is_compatible_with(self, other_node: "Node") -> bool:
        """Verifica se este node é compatível com outro para conexão"""
        try:
            # Verificar se o output deste node é compatível com o input do outro
            my_output = self.output_schema.get("properties", {})
            other_input = other_node.input_schema.get("properties", {})

            # Verificação básica de compatibilidade de tipos
            for output_key, output_config in my_output.items():
                if output_key in other_input:
                    output_type = output_config.get("type")
                    input_type = other_input[output_key].get("type")
                    if output_type != input_type:
                        return False

            return True
        except Exception:
            return False


class NodeCategory(Base):
    __tablename__ = "node_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    icon = Column(String(10), default="📁")
    color = Column(String(7), default="#6366f1")
    parent_id = Column(
        UUID(as_uuid=True), ForeignKey("node_categories.id"), nullable=True
    )
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamento auto-referencial para categorias hierárquicas
    parent = relationship("NodeCategory", remote_side=[id])
    children = relationship("NodeCategory")

    def to_dict(self) -> dict:
        """Converte categoria para dicionário"""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "color": self.color,
            "parent_id": str(self.parent_id) if self.parent_id else None,
            "sort_order": self.sort_order,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class NodeTemplate(Base):
    __tablename__ = "node_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(Enum(NodeType), nullable=False)
    category = Column(String(100))

    # Template de código
    code_template = Column(Text, nullable=False)
    input_schema = Column(JSON, nullable=False)
    output_schema = Column(JSON, nullable=False)
    parameters_schema = Column(JSON, default=dict)

    # Metadados
    icon = Column(String(10), default="🔧")
    color = Column(String(7), default="#6366f1")
    documentation = Column(Text)
    examples = Column(JSON, default=list)

    # Sistema
    is_system = Column(Boolean, default=False)  # Templates do sistema vs usuário
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self) -> dict:
        """Converte template para dicionário"""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "type": self.type.value,
            "category": self.category,
            "code_template": self.code_template,
            "input_schema": self.input_schema,
            "output_schema": self.output_schema,
            "parameters_schema": self.parameters_schema,
            "icon": self.icon,
            "color": self.color,
            "documentation": self.documentation,
            "examples": self.examples,
            "is_system": self.is_system,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def create_node_from_template(self, user_id: str, name: str = None) -> dict:
        """Cria um novo node baseado neste template"""
        return {
            "name": name or self.name,
            "description": self.description,
            "type": self.type,
            "category": self.category,
            "user_id": user_id,
            "code_template": self.code_template,
            "input_schema": self.input_schema,
            "output_schema": self.output_schema,
            "parameters_schema": self.parameters_schema,
            "icon": self.icon,
            "color": self.color,
            "documentation": self.documentation,
            "examples": self.examples,
        }
