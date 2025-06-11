"""
Modelo Component para Marketplace
Criado por José - um desenvolvedor Full Stack
Sistema avançado de componentes reutilizáveis
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
    DECIMAL,
    text,
    UUID,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from synapse.database import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID


class MarketplaceComponent(Base):
    """
    Modelo para componentes do marketplace
    Representa componentes reutilizáveis que podem ser compartilhados
    """

    __tablename__ = "marketplace_components"

    # Identificação
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    component_type = Column(String(50), nullable=False)
    tags = Column(Text)
    price = Column(DECIMAL(10,2), nullable=False, server_default=text("0.00"))
    is_free = Column(Boolean, nullable=False, server_default=text("true"))
    author_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    version = Column(String(50), nullable=False, server_default=text("'1.0.0'"))
    content = Column(Text)
    component_metadata = Column(Text)
    downloads_count = Column(Integer, nullable=False, server_default=text("0"))
    rating_average = Column(DECIMAL(3,2), nullable=False, server_default=text("0.00"))
    rating_count = Column(Integer, nullable=False, server_default=text("0"))
    is_featured = Column(Boolean, nullable=False, server_default=text("false"))
    is_approved = Column(Boolean, nullable=False, server_default=text("false"))
    status = Column(String(20), nullable=False, server_default=text("'pending'"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Informações básicas
    title = Column(String(200), nullable=False)
    short_description = Column(String(500))

    # Categorização
    subcategory = Column(String(50), index=True)

    # Autor e propriedade
    author_name = Column(String(100), nullable=False)
    organization = Column(String(100))

    # Conteúdo técnico
    configuration_schema = Column(JSON)  # Schema de configuração

    # Dependências
    dependencies = Column(JSON, default=list)  # Lista de dependências
    compatibility = Column(JSON, default=dict)  # Compatibilidade com versões

    # Documentação
    documentation = Column(Text)
    readme = Column(Text)
    changelog = Column(Text)
    examples = Column(JSON, default=list)  # Exemplos de uso

    # Mídia
    icon_url = Column(String(500))
    screenshots = Column(JSON, default=list)  # URLs das screenshots
    demo_url = Column(String(500))
    video_url = Column(String(500))

    # Monetização
    currency = Column(String(3), default="USD")
    license_type = Column(String(50), default="MIT")

    # Estatísticas
    install_count = Column(Integer, default=0, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    like_count = Column(Integer, default=0, nullable=False)

    # Avaliações
    rating_average = Column(Float, default=0.0, nullable=False)
    rating_count = Column(Integer, default=0, nullable=False)

    # Status e moderação
    is_verified = Column(Boolean, default=False, nullable=False)
    moderation_notes = Column(Text)

    # SEO e descoberta
    keywords = Column(JSON, default=list)
    search_vector = Column(Text)  # Para busca full-text
    popularity_score = Column(Float, default=0.0, nullable=False)

    # Timestamps
    published_at = Column(DateTime)
    last_download_at = Column(DateTime)

    # Relacionamentos
    author = relationship("User", back_populates="marketplace_components")
    ratings = relationship(
        "ComponentRating", back_populates="component", cascade="all, delete-orphan"
    )
    downloads = relationship(
        "ComponentDownload", back_populates="component", cascade="all, delete-orphan"
    )
    purchases = relationship(
        "ComponentPurchase", back_populates="component", cascade="all, delete-orphan"
    )
    versions = relationship(
        "ComponentVersion", back_populates="component", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<MarketplaceComponent(id={self.id}, name='{self.name}', version='{self.version}')>"

    @property
    def full_name(self):
        """Nome completo do componente"""
        return f"{self.name}@{self.version}"

    @property
    def is_premium(self):
        """Verifica se é um componente premium"""
        return not self.is_free and self.price > 0

    @property
    def rating_stars(self):
        """Retorna rating em formato de estrelas (0-5)"""
        return round(self.rating_average, 1)

    def update_statistics(self):
        """Atualiza estatísticas do componente"""
        # Atualizar contadores baseado nos relacionamentos
        self.download_count = len(self.downloads)
        self.rating_count = len(self.ratings)
        if self.ratings:
            self.rating_average = sum(r.rating for r in self.ratings) / len(
                self.ratings
            )

        # Calcular score de popularidade
        self.popularity_score = (
            self.download_count * 1.0
            + self.install_count * 1.5
            + self.view_count * 0.1
            + self.like_count * 2.0
            + self.rating_average * self.rating_count * 3.0
        )


class ComponentRating(Base):
    """
    Modelo para avaliações de componentes
    """

    __tablename__ = "component_ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(
        UUID(as_uuid=True), ForeignKey("marketplace_components.id"), nullable=False, index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Avaliação
    rating = Column(Integer, nullable=False)  # 1-5 estrelas
    title = Column(String(200))
    review = Column(Text)

    # Aspectos específicos (1-5)
    ease_of_use = Column(Integer)
    documentation_quality = Column(Integer)
    performance = Column(Integer)
    reliability = Column(Integer)
    support_quality = Column(Integer)

    # Contexto
    version_used = Column(String(20))
    use_case = Column(String(100))
    experience_level = Column(String(20))  # beginner, intermediate, advanced

    # Interação
    helpful_count = Column(Integer, default=0, nullable=False)
    reported_count = Column(Integer, default=0, nullable=False)

    # Status
    is_verified_purchase = Column(Boolean, default=False, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    status = Column(
        String(20), default="active", nullable=False
    )  # active, hidden, deleted

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relacionamentos
    component = relationship("MarketplaceComponent", back_populates="ratings")
    user = relationship("User")

    def __repr__(self):
        return f"<ComponentRating(id={self.id}, component_id={self.component_id}, rating={self.rating})>"


class ComponentDownload(Base):
    """
    Modelo para downloads de componentes
    """

    __tablename__ = "component_downloads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(
        UUID(as_uuid=True), ForeignKey("marketplace_components.id"), nullable=False, index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Informações do download
    version = Column(String(20), nullable=False)
    download_type = Column(
        String(20), default="manual", nullable=False
    )  # manual, auto, cli

    # Contexto
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    referrer = Column(String(500))

    # Status
    status = Column(
        String(20), default="completed", nullable=False
    )  # pending, completed, failed
    file_size = Column(Integer)  # Tamanho em bytes

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)

    # Relacionamentos
    component = relationship("MarketplaceComponent", back_populates="downloads")
    user = relationship("User")

    def __repr__(self):
        return f"<ComponentDownload(id={self.id}, component_id={self.component_id}, user_id={self.user_id})>"


class ComponentPurchase(Base):
    """
    Modelo para compras de componentes premium
    """

    __tablename__ = "component_purchases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(
        UUID(as_uuid=True), ForeignKey("marketplace_components.id"), nullable=False, index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id"), nullable=False, index=True)

    # Informações da compra
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    payment_method = Column(String(50))

    # Processamento
    transaction_id = Column(String(100), unique=True, nullable=False)
    payment_provider = Column(String(50))  # stripe, paypal, etc.
    provider_transaction_id = Column(String(100))

    # Status
    status = Column(
        String(20), default="pending", nullable=False
    )  # pending, completed, failed, refunded

    # Licença
    license_key = Column(String(100), unique=True)
    license_expires_at = Column(DateTime)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    refunded_at = Column(DateTime)

    # Relacionamentos
    component = relationship("MarketplaceComponent", back_populates="purchases")
    user = relationship("User")

    def __repr__(self):
        return f"<ComponentPurchase(id={self.id}, component_id={self.component_id}, amount={self.amount})>"


class ComponentVersion(Base):
    """
    Modelo para versões de componentes
    """

    __tablename__ = "component_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(
        UUID(as_uuid=True), ForeignKey("marketplace_components.id"), nullable=False, index=True
    )

    # Versão
    version = Column(String(20), nullable=False)
    is_latest = Column(Boolean, default=False, nullable=False)
    is_stable = Column(Boolean, default=True, nullable=False)

    # Mudanças
    changelog = Column(Text)
    breaking_changes = Column(Text)
    migration_guide = Column(Text)

    # Dados técnicos
    component_data = Column(JSON, nullable=False)
    file_size = Column(Integer)

    # Compatibilidade
    min_platform_version = Column(String(20))
    max_platform_version = Column(String(20))
    dependencies = Column(JSON, default=list)

    # Estatísticas
    download_count = Column(Integer, default=0, nullable=False)

    # Status
    status = Column(
        String(20), default="active", nullable=False
    )  # active, deprecated, deleted

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    deprecated_at = Column(DateTime)

    # Relacionamentos
    component = relationship("MarketplaceComponent", back_populates="versions")

    def __repr__(self):
        return f"<ComponentVersion(id={self.id}, component_id={self.component_id}, version='{self.version}')>"
