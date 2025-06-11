"""
Schemas Pydantic para Templates de Workflows
Criado por José - um desenvolvedor Full Stack
Sistema completo de validação para marketplace de templates
"""

from pydantic import BaseModel, Field, validator, HttpUrl
from typing import Dict, Any, Optional, List
from datetime import datetime

from synapse.models.template import (
    TemplateCategory,
    TemplateStatus,
    TemplateLicense,
)


# Schemas base para templates
class TemplateBase(BaseModel):
    """Schema base para templates"""

    name: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10)
    short_description: str | None = Field(None, max_length=500)
    category: TemplateCategory
    tags: list[str] | None = Field(None, max_items=20)
    license_type: TemplateLicense = TemplateLicense.FREE
    price: float = Field(default=0.0, ge=0.0, le=9999.99)

    @validator("tags")
    def validate_tags(cls, v):
        """Valida tags"""
        if v is not None:
            # Remove duplicatas e normaliza
            v = list({tag.lower().strip() for tag in v if tag.strip()})
            # Valida cada tag
            for tag in v:
                if len(tag) < 2 or len(tag) > 50:
                    raise ValueError("Tags devem ter entre 2 e 50 caracteres")
        return v

    @validator("price")
    def validate_price(cls, v, values):
        """Valida preço baseado na licença"""
        license_type = values.get("license_type")
        if license_type == TemplateLicense.FREE and v > 0:
            raise ValueError("Templates gratuitos não podem ter preço")
        elif (
            license_type in [TemplateLicense.PREMIUM, TemplateLicense.ENTERPRISE]
            and v <= 0
        ):
            raise ValueError("Templates premium devem ter preço maior que zero")
        return v


class TemplateCreate(TemplateBase):
    """Schema para criação de template"""

    workflow_data: dict[str, Any] = Field(
        ..., description="Estrutura completa do workflow"
    )
    nodes_data: list[dict[str, Any]] = Field(
        ..., min_items=1, description="Dados dos nós"
    )
    connections_data: list[dict[str, Any]] | None = None
    required_variables: list[str] | None = None
    optional_variables: list[str] | None = None
    default_config: dict[str, Any] | None = None
    estimated_duration: int | None = Field(None, ge=1, le=86400)  # 1 segundo a 24 horas
    complexity_level: int = Field(default=1, ge=1, le=5)
    keywords: list[str] | None = Field(None, max_items=50)
    use_cases: list[str] | None = Field(None, max_items=20)
    industries: list[str] | None = Field(None, max_items=20)
    documentation: str | None = None
    setup_instructions: str | None = None

    @validator("workflow_data")
    def validate_workflow_data(cls, v):
        """Valida estrutura do workflow"""
        required_fields = ["name", "description"]
        for field in required_fields:
            if field not in v:
                raise ValueError(
                    f"Campo obrigatório '{field}' não encontrado em workflow_data"
                )
        return v

    @validator("nodes_data")
    def validate_nodes_data(cls, v):
        """Valida dados dos nós"""
        if not v:
            raise ValueError("Template deve ter pelo menos um nó")

        for i, node in enumerate(v):
            required_fields = ["type", "name"]
            for field in required_fields:
                if field not in node:
                    raise ValueError(
                        f"Nó {i}: campo obrigatório '{field}' não encontrado"
                    )
        return v


class TemplateUpdate(BaseModel):
    """Schema para atualização de template"""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, min_length=10)
    short_description: str | None = Field(None, max_length=500)
    category: TemplateCategory | None = None
    tags: list[str] | None = Field(None, max_items=20)
    status: TemplateStatus | None = None
    is_public: bool | None = None
    license_type: TemplateLicense | None = None
    price: float | None = Field(None, ge=0.0, le=9999.99)
    workflow_data: dict[str, Any] | None = None
    nodes_data: list[dict[str, Any]] | None = None
    connections_data: list[dict[str, Any]] | None = None
    required_variables: list[str] | None = None
    optional_variables: list[str] | None = None
    default_config: dict[str, Any] | None = None
    version: str | None = Field(None, pattern=r"^\d+\.\d+\.\d+$")
    estimated_duration: int | None = Field(None, ge=1, le=86400)
    complexity_level: int | None = Field(None, ge=1, le=5)
    keywords: list[str] | None = Field(None, max_items=50)
    use_cases: list[str] | None = Field(None, max_items=20)
    industries: list[str] | None = Field(None, max_items=20)
    thumbnail_url: HttpUrl | None = None
    preview_images: list[HttpUrl] | None = Field(None, max_items=10)
    demo_video_url: HttpUrl | None = None
    documentation: str | None = None
    setup_instructions: str | None = None
    support_email: str | None = Field(None, pattern=r"^[^@]+@[^@]+\.[^@]+$")
    repository_url: HttpUrl | None = None
    documentation_url: HttpUrl | None = None


class TemplateResponse(TemplateBase):
    """Schema de resposta para template"""

    id: int
    template_id: str
    author_id: int
    status: TemplateStatus
    is_public: bool
    is_featured: bool
    is_verified: bool
    version: str
    compatibility_version: str
    estimated_duration: int | None = None
    complexity_level: int
    download_count: int
    usage_count: int
    rating_average: float
    rating_count: int
    view_count: int
    keywords: list[str] | None = None
    use_cases: list[str] | None = None
    industries: list[str] | None = None
    thumbnail_url: str | None = None
    preview_images: list[str] | None = None
    demo_video_url: str | None = None
    documentation: str | None = None
    setup_instructions: str | None = None
    support_email: str | None = None
    repository_url: str | None = None
    documentation_url: str | None = None
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None = None
    last_used_at: datetime | None = None

    class Config:
        from_attributes = True


class TemplateDetailResponse(TemplateResponse):
    """Schema de resposta detalhada para template"""

    workflow_data: dict[str, Any]
    nodes_data: list[dict[str, Any]]
    connections_data: list[dict[str, Any]] | None = None
    required_variables: list[str] | None = None
    optional_variables: list[str] | None = None
    default_config: dict[str, Any] | None = None
    changelog: list[dict[str, Any]] | None = None

    # Informações do autor (limitadas)
    author_name: str | None = None
    author_avatar: str | None = None

    # Estatísticas adicionais
    recent_downloads: int = 0
    recent_usage: int = 0
    is_favorited: bool = False  # Se o usuário atual favoritou


class TemplateListResponse(BaseModel):
    """Schema para lista de templates"""

    templates: list[TemplateResponse]
    total: int
    page: int
    per_page: int
    pages: int
    has_next: bool
    has_prev: bool


# Schemas para reviews
class ReviewBase(BaseModel):
    """Schema base para reviews"""

    rating: int = Field(..., ge=1, le=5)
    title: str | None = Field(None, max_length=255)
    comment: str | None = Field(None, max_length=2000)
    ease_of_use: int | None = Field(None, ge=1, le=5)
    documentation_quality: int | None = Field(None, ge=1, le=5)
    performance: int | None = Field(None, ge=1, le=5)
    value_for_money: int | None = Field(None, ge=1, le=5)


class ReviewCreate(ReviewBase):
    """Schema para criação de review"""

    template_id: int = Field(..., gt=0)


class ReviewUpdate(BaseModel):
    """Schema para atualização de review"""

    rating: int | None = Field(None, ge=1, le=5)
    title: str | None = Field(None, max_length=255)
    comment: str | None = Field(None, max_length=2000)
    ease_of_use: int | None = Field(None, ge=1, le=5)
    documentation_quality: int | None = Field(None, ge=1, le=5)
    performance: int | None = Field(None, ge=1, le=5)
    value_for_money: int | None = Field(None, ge=1, le=5)


class ReviewResponse(ReviewBase):
    """Schema de resposta para review"""

    id: int
    template_id: int
    user_id: int
    is_verified_purchase: bool
    is_helpful_count: int
    version_reviewed: str | None = None
    created_at: datetime
    updated_at: datetime

    # Informações do usuário (limitadas)
    user_name: str | None = None
    user_avatar: str | None = None

    class Config:
        from_attributes = True


# Schemas para downloads
class DownloadCreate(BaseModel):
    """Schema para registro de download"""

    template_id: int = Field(..., gt=0)
    download_type: str = Field(default="full", pattern="^(full|preview|demo)$")


class DownloadResponse(BaseModel):
    """Schema de resposta para download"""

    id: int
    template_id: int
    user_id: int
    download_type: str
    template_version: str | None = None
    downloaded_at: datetime

    class Config:
        from_attributes = True


# Schemas para favoritos
class FavoriteCreate(BaseModel):
    """Schema para adicionar favorito"""

    template_id: int = Field(..., gt=0)
    notes: str | None = Field(None, max_length=1000)


class FavoriteUpdate(BaseModel):
    """Schema para atualizar favorito"""

    notes: str | None = Field(None, max_length=1000)


class FavoriteResponse(BaseModel):
    """Schema de resposta para favorito"""

    id: int
    template_id: int
    user_id: int
    notes: str | None = None
    created_at: datetime

    # Informações básicas do template
    template_name: str
    template_title: str
    template_category: str

    class Config:
        from_attributes = True


# Schemas para coleções
class CollectionBase(BaseModel):
    """Schema base para coleções"""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    is_public: bool = True
    tags: list[str] | None = Field(None, max_items=20)
    thumbnail_url: HttpUrl | None = None


class CollectionCreate(CollectionBase):
    """Schema para criação de coleção"""

    template_ids: list[int] = Field(..., min_items=1, max_items=100)

    @validator("template_ids")
    def validate_template_ids(cls, v):
        """Remove duplicatas"""
        return list(set(v))


class CollectionUpdate(BaseModel):
    """Schema para atualização de coleção"""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    is_public: bool | None = None
    template_ids: list[int] | None = Field(None, min_items=1, max_items=100)
    tags: list[str] | None = Field(None, max_items=20)
    thumbnail_url: HttpUrl | None = None


class CollectionResponse(CollectionBase):
    """Schema de resposta para coleção"""

    id: int
    collection_id: str
    creator_id: int
    is_featured: bool
    template_ids: list[int]
    view_count: int
    follow_count: int
    created_at: datetime
    updated_at: datetime

    # Informações do criador (limitadas)
    creator_name: str | None = None
    creator_avatar: str | None = None

    # Templates da coleção (resumo)
    templates_count: int = 0
    templates_preview: list[TemplateResponse] | None = None

    class Config:
        from_attributes = True


# Schemas para busca e filtros
class TemplateFilter(BaseModel):
    """Filtros para busca de templates"""

    search: str | None = Field(None, min_length=1, max_length=255)
    category: list[TemplateCategory] | None = None
    tags: list[str] | None = None
    license_type: list[TemplateLicense] | None = None
    price_min: float | None = Field(None, ge=0.0)
    price_max: float | None = Field(None, ge=0.0)
    rating_min: float | None = Field(None, ge=0.0, le=5.0)
    complexity_min: int | None = Field(None, ge=1, le=5)
    complexity_max: int | None = Field(None, ge=1, le=5)
    is_featured: bool | None = None
    is_verified: bool | None = None
    author_id: int | None = Field(None, gt=0)
    created_after: datetime | None = None
    created_before: datetime | None = None
    industries: list[str] | None = None
    use_cases: list[str] | None = None
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)
    sort_by: str = Field(
        default="created_at",
        pattern="^(created_at|updated_at|rating|downloads|name|price)$",
    )
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")


# Schemas para estatísticas
class TemplateStats(BaseModel):
    """Estatísticas de templates"""

    total_templates: int
    published_templates: int
    featured_templates: int
    verified_templates: int
    free_templates: int
    premium_templates: int
    total_downloads: int
    total_reviews: int
    average_rating: float
    categories_distribution: dict[str, int]
    top_templates: list[TemplateResponse]
    recent_templates: list[TemplateResponse]


class UserTemplateStats(BaseModel):
    """Estatísticas de templates do usuário"""

    created_templates: int
    published_templates: int
    total_downloads: int
    total_reviews: int
    average_rating: float
    favorite_templates: int
    template_collections: int
    total_earnings: float  # Para templates premium


# Schemas para marketplace
class MarketplaceStats(BaseModel):
    """Estatísticas do marketplace"""

    total_templates: int
    total_authors: int
    total_downloads: int
    total_reviews: int
    featured_templates: list[TemplateResponse]
    trending_templates: list[TemplateResponse]
    new_templates: list[TemplateResponse]
    top_categories: list[dict[str, Any]]
    top_authors: list[dict[str, Any]]


# Schema para instalação de template
class TemplateInstall(BaseModel):
    """Schema para instalação de template"""

    template_id: int = Field(..., gt=0)
    workflow_name: str | None = Field(None, min_length=1, max_length=255)
    custom_variables: dict[str, Any] | None = None
    modify_config: dict[str, Any] | None = None

    @validator("workflow_name")
    def validate_workflow_name(cls, v):
        """Valida nome do workflow"""
        if v is not None:
            # Remove caracteres especiais
            import re

            if not re.match(r"^[a-zA-Z0-9\s\-_]+$", v):
                raise ValueError(
                    "Nome do workflow deve conter apenas letras, números, espaços, hífens e underscores"
                )
        return v


class TemplateInstallResponse(BaseModel):
    """Schema de resposta para instalação"""

    success: bool
    workflow_id: int | None = None
    workflow_name: str
    template_id: int
    template_name: str
    modifications_applied: list[str]
    warnings: list[str]
    errors: list[str]
