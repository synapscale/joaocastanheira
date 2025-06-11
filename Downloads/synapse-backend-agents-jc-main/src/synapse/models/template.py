"""
Modelo WorkflowTemplate para marketplace de templates
Criado por José - um desenvolvedor Full Stack
Sistema completo de templates compartilháveis
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    JSON,
    Float,
    DECIMAL,
    UUID,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from enum import Enum
from sqlalchemy.sql import text
import uuid

from synapse.database import Base


class TemplateCategory(str, Enum):
    """Categorias de templates"""

    AUTOMATION = "automation"
    DATA_PROCESSING = "data_processing"
    AI_WORKFLOWS = "ai_workflows"
    MARKETING = "marketing"
    PRODUCTIVITY = "productivity"
    INTEGRATION = "integration"
    ANALYTICS = "analytics"
    CONTENT_CREATION = "content_creation"
    CUSTOMER_SERVICE = "customer_service"
    FINANCE = "finance"
    HR = "hr"
    SALES = "sales"
    OTHER = "other"


class TemplateStatus(str, Enum):
    """Status do template"""

    DRAFT = "draft"
    PUBLISHED = "published"
    FEATURED = "featured"
    DEPRECATED = "deprecated"
    PRIVATE = "private"


class TemplateLicense(str, Enum):
    """Licenças de templates"""

    FREE = "free"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"


class WorkflowTemplate(Base):
    """
    Modelo para templates de workflows
    Permite compartilhamento e reutilização de workflows
    """

    __tablename__ = "workflow_templates"

    # Campos principais
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    tags = Column(Text)
    workflow_definition = Column(JSONB, nullable=False)
    preview_image = Column(String(500))
    author_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    version = Column(String(50), nullable=False, server_default=text("'1.0.0'"))
    is_public = Column(Boolean, nullable=False, server_default=text("false"))
    is_featured = Column(Boolean, nullable=False, server_default=text("false"))
    downloads_count = Column(Integer, nullable=False, server_default=text("0"))
    rating_average = Column(DECIMAL(3,2), nullable=False, server_default=text("0.00"))
    rating_count = Column(Integer, nullable=False, server_default=text("0"))
    price = Column(DECIMAL(10,2), nullable=False, server_default=text("0.00"))
    is_free = Column(Boolean, nullable=False, server_default=text("true"))
    license = Column(String(50), nullable=False, server_default=text("'MIT'"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Informações básicas
    title = Column(String(255), nullable=False)  # Título público
    short_description = Column(String(500), nullable=True)

    # Relacionamentos
    original_workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=True, index=True)

    # Categorização
    tags = Column(JSON, nullable=True)  # Lista de tags

    # Status e visibilidade
    status = Column(String(20), default=TemplateStatus.DRAFT.value, index=True)
    is_verified = Column(Boolean, default=False, index=True)

    # Licenciamento
    license_type = Column(String(20), default=TemplateLicense.FREE.value, index=True)

    # Conteúdo do template
    workflow_data = Column(JSON, nullable=False)  # Estrutura completa do workflow
    nodes_data = Column(JSON, nullable=False)  # Dados dos nós
    connections_data = Column(JSON, nullable=True)  # Conexões entre nós

    # Configurações
    required_variables = Column(JSON, nullable=True)  # Variáveis obrigatórias
    optional_variables = Column(JSON, nullable=True)  # Variáveis opcionais
    default_config = Column(JSON, nullable=True)  # Configuração padrão

    # Metadados
    compatibility_version = Column(
        String(20), default="1.0.0"
    )  # Versão mínima do sistema
    estimated_duration = Column(Integer, nullable=True)  # Duração estimada em segundos
    complexity_level = Column(Integer, default=1)  # 1-5 (básico a avançado)

    # Estatísticas
    download_count = Column(Integer, default=0, index=True)
    usage_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    # SEO e descoberta
    keywords = Column(JSON, nullable=True)  # Palavras-chave para busca
    use_cases = Column(JSON, nullable=True)  # Casos de uso
    industries = Column(JSON, nullable=True)  # Indústrias aplicáveis

    # Recursos visuais
    thumbnail_url = Column(String(500), nullable=True)
    preview_images = Column(JSON, nullable=True)  # URLs de imagens de preview
    demo_video_url = Column(String(500), nullable=True)

    # Documentação
    documentation = Column(Text, nullable=True)  # Documentação em Markdown
    setup_instructions = Column(Text, nullable=True)  # Instruções de configuração
    changelog = Column(JSON, nullable=True)  # Histórico de mudanças

    # Suporte e manutenção
    support_email = Column(String(255), nullable=True)
    repository_url = Column(String(500), nullable=True)
    documentation_url = Column(String(500), nullable=True)

    # Timestamps
    published_at = Column(DateTime(timezone=True), nullable=True, index=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)

    # Relacionamentos
    author = relationship("User", back_populates="created_templates")
    original_workflow = relationship("Workflow")
    reviews = relationship(
        "TemplateReview", back_populates="template", cascade="all, delete-orphan"
    )
    downloads = relationship(
        "TemplateDownload", back_populates="template", cascade="all, delete-orphan"
    )
    favorites = relationship(
        "TemplateFavorite", back_populates="template", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<WorkflowTemplate(id={self.id}, name='{self.name}', status='{self.status}')>"

    @property
    def is_premium(self) -> bool:
        """Verifica se é um template premium"""
        return self.license_type in [
            TemplateLicense.PREMIUM.value,
            TemplateLicense.ENTERPRISE.value,
        ]

    @property
    def rating_stars(self) -> float:
        """Retorna a avaliação em estrelas (0-5)"""
        return round(self.rating_average, 1)


class TemplateReview(Base):
    """
    Modelo para avaliações de templates
    """

    __tablename__ = "template_reviews"

    # Campos principais
    id = Column(Integer, primary_key=True, index=True)

    # Relacionamentos
    template_id = Column(
        Integer, ForeignKey("workflow_templates.id"), nullable=False, index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Avaliação
    rating = Column(Integer, nullable=False)  # 1-5 estrelas
    title = Column(String(255), nullable=True)
    comment = Column(Text, nullable=True)

    # Aspectos específicos (1-5)
    ease_of_use = Column(Integer, nullable=True)
    documentation_quality = Column(Integer, nullable=True)
    performance = Column(Integer, nullable=True)
    value_for_money = Column(Integer, nullable=True)

    # Status
    is_verified_purchase = Column(Boolean, default=False)
    is_helpful_count = Column(Integer, default=0)
    is_reported = Column(Boolean, default=False)

    # Metadados
    version_reviewed = Column(String(20), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relacionamentos
    template = relationship("WorkflowTemplate", back_populates="reviews")
    user = relationship("User", back_populates="template_reviews")

    def __repr__(self):
        return f"<TemplateReview(id={self.id}, rating={self.rating}, template_id={self.template_id})>"


class TemplateDownload(Base):
    """
    Modelo para rastreamento de downloads de templates
    """

    __tablename__ = "template_downloads"

    # Campos principais
    id = Column(Integer, primary_key=True, index=True)

    # Relacionamentos
    template_id = Column(
        Integer, ForeignKey("workflow_templates.id"), nullable=False, index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Informações do download
    download_type = Column(String(20), default="full")  # full, preview, demo
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Metadados
    template_version = Column(String(20), nullable=True)

    # Timestamps
    downloaded_at = Column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    # Relacionamentos
    template = relationship("WorkflowTemplate", back_populates="downloads")
    user = relationship("User", back_populates="template_downloads")

    def __repr__(self):
        return f"<TemplateDownload(id={self.id}, template_id={self.template_id}, user_id={self.user_id})>"


class TemplateFavorite(Base):
    """
    Modelo para templates favoritos dos usuários
    """

    __tablename__ = "template_favorites"

    # Campos principais
    id = Column(Integer, primary_key=True, index=True)

    # Relacionamentos
    template_id = Column(
        Integer, ForeignKey("workflow_templates.id"), nullable=False, index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Metadados
    notes = Column(Text, nullable=True)  # Notas pessoais do usuário

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    template = relationship("WorkflowTemplate", back_populates="favorites")
    user = relationship("User", back_populates="favorite_templates")

    # Constraint para evitar duplicatas
    __table_args__ = ({"sqlite_autoincrement": True},)

    def __repr__(self):
        return f"<TemplateFavorite(id={self.id}, template_id={self.template_id}, user_id={self.user_id})>"


class TemplateCollection(Base):
    """
    Modelo para coleções de templates
    Permite agrupar templates relacionados
    """

    __tablename__ = "template_collections"

    # Campos principais
    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(String(36), unique=True, index=True)

    # Informações básicas
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Relacionamentos
    creator_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Configurações
    is_public = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    # Metadados
    template_ids = Column(JSON, nullable=False)  # Lista de IDs de templates
    tags = Column(JSON, nullable=True)

    # Recursos visuais
    thumbnail_url = Column(String(500), nullable=True)

    # Estatísticas
    view_count = Column(Integer, default=0)
    follow_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relacionamentos
    creator = relationship("User", back_populates="template_collections")

    def __repr__(self):
        return f"<TemplateCollection(id={self.id}, name='{self.name}')>"


class TemplateUsage(Base):
    """
    Modelo para rastreamento de uso de templates
    Analytics detalhados de como os templates são usados
    """

    __tablename__ = "template_usage"

    # Campos principais
    id = Column(Integer, primary_key=True, index=True)

    # Relacionamentos
    template_id = Column(
        Integer, ForeignKey("workflow_templates.id"), nullable=False, index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=True, index=True)

    # Informações de uso
    usage_type = Column(String(20), nullable=False)  # create, clone, execute, modify
    success = Column(Boolean, default=True)

    # Metadados
    template_version = Column(String(20), nullable=True)
    modifications_made = Column(JSON, nullable=True)  # Modificações feitas pelo usuário
    execution_time = Column(Integer, nullable=True)  # Tempo de execução em segundos

    # Contexto
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Timestamps
    used_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relacionamentos
    template = relationship("WorkflowTemplate")
    user = relationship("User", back_populates="template_usage")
    workflow = relationship("Workflow")

    def __repr__(self):
        return f"<TemplateUsage(id={self.id}, template_id={self.template_id}, usage_type='{self.usage_type}')>"
