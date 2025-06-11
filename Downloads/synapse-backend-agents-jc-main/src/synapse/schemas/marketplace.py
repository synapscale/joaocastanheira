"""
Schemas Pydantic para Marketplace
Criado por José - um desenvolvedor Full Stack
Validação e serialização para marketplace
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================


class ComponentType(str, Enum):
    WORKFLOW_TEMPLATE = "workflow_template"
    NODE_COMPONENT = "node_component"
    INTEGRATION = "integration"
    PLUGIN = "plugin"
    THEME = "theme"
    WIDGET = "widget"


class ComponentCategory(str, Enum):
    AI_ML = "ai_ml"
    DATA_PROCESSING = "data_processing"
    AUTOMATION = "automation"
    INTEGRATION = "integration"
    ANALYTICS = "analytics"
    COMMUNICATION = "communication"
    PRODUCTIVITY = "productivity"
    UTILITIES = "utilities"


class ComponentStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class LicenseType(str, Enum):
    MIT = "MIT"
    APACHE_2 = "Apache-2.0"
    GPL_3 = "GPL-3.0"
    BSD_3 = "BSD-3-Clause"
    COMMERCIAL = "Commercial"
    PROPRIETARY = "Proprietary"


# ==================== BASE SCHEMAS ====================


class ComponentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    short_description: str | None = Field(None, max_length=200)
    category: ComponentCategory
    subcategory: str | None = Field(None, max_length=50)
    tags: list[str] | None = Field(default_factory=list)
    organization: str | None = Field(None, max_length=100)
    component_type: ComponentType
    component_data: dict[str, Any]
    configuration_schema: dict[str, Any] | None = None
    dependencies: list[str] | None = Field(default_factory=list)
    compatibility: dict[str, Any] | None = Field(default_factory=dict)
    documentation: str | None = None
    readme: str | None = None
    changelog: str | None = None
    examples: list[dict[str, Any]] | None = Field(default_factory=list)
    icon_url: str | None = None
    screenshots: list[str] | None = Field(default_factory=list)
    demo_url: str | None = None
    video_url: str | None = None
    is_free: bool = True
    price: float | None = Field(None, ge=0)
    currency: str | None = Field("USD", max_length=3)
    license_type: LicenseType | None = LicenseType.MIT
    keywords: list[str] | None = Field(default_factory=list)
    version: str | None = Field("1.0.0", max_length=20)

    @validator("price")
    def validate_price(cls, v, values):
        if not values.get("is_free") and (v is None or v <= 0):
            raise ValueError("Componentes pagos devem ter preço maior que zero")
        return v

    @validator("tags", "keywords")
    def validate_lists(cls, v):
        if v and len(v) > 20:
            raise ValueError("Máximo de 20 itens permitidos")
        return v


class ComponentCreate(ComponentBase):
    pass


class ComponentUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, min_length=10, max_length=2000)
    short_description: str | None = Field(None, max_length=200)
    category: ComponentCategory | None = None
    subcategory: str | None = Field(None, max_length=50)
    tags: list[str] | None = None
    organization: str | None = Field(None, max_length=100)
    component_data: dict[str, Any] | None = None
    configuration_schema: dict[str, Any] | None = None
    dependencies: list[str] | None = None
    compatibility: dict[str, Any] | None = None
    documentation: str | None = None
    readme: str | None = None
    changelog: str | None = None
    examples: list[dict[str, Any]] | None = None
    icon_url: str | None = None
    screenshots: list[str] | None = None
    demo_url: str | None = None
    video_url: str | None = None
    is_free: bool | None = None
    price: float | None = Field(None, ge=0)
    currency: str | None = Field(None, max_length=3)
    license_type: LicenseType | None = None
    keywords: list[str] | None = None


class ComponentResponse(ComponentBase):
    id: int
    slug: str
    author_id: int
    author_name: str
    status: ComponentStatus
    download_count: int = 0
    rating_average: float = 0.0
    rating_count: int = 0
    popularity_score: float = 0.0
    is_featured: bool = False
    last_download_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== SEARCH SCHEMAS ====================


class ComponentSearch(BaseModel):
    query: str | None = None
    category: ComponentCategory | None = None
    component_type: ComponentType | None = None
    tags: list[str] | None = None
    is_free: bool | None = None
    min_rating: float | None = Field(None, ge=0, le=5)
    max_price: float | None = Field(None, ge=0)
    sort_by: str | None = Field(
        "popularity",
        pattern="^(popularity|rating|downloads|newest|price_low|price_high)$",
    )
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)


class ComponentSearchResponse(BaseModel):
    components: list[ComponentResponse]
    total: int
    page: int
    pages: int
    has_next: bool
    has_prev: bool


# ==================== RATING SCHEMAS ====================


class RatingBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: str | None = Field(None, max_length=200)
    review: str | None = Field(None, max_length=2000)
    ease_of_use: int | None = Field(None, ge=1, le=5)
    documentation_quality: int | None = Field(None, ge=1, le=5)
    performance: int | None = Field(None, ge=1, le=5)
    reliability: int | None = Field(None, ge=1, le=5)
    support_quality: int | None = Field(None, ge=1, le=5)
    version_used: str | None = Field(None, max_length=20)
    use_case: str | None = Field(None, max_length=500)
    experience_level: str | None = Field(
        None, pattern="^(beginner|intermediate|advanced|expert)$"
    )


class RatingCreate(RatingBase):
    component_id: int


class RatingResponse(RatingBase):
    id: int
    component_id: int
    user_id: int
    user_name: str
    is_verified_purchase: bool = False
    helpful_count: int = 0
    status: str = "active"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RatingStats(BaseModel):
    average_rating: float
    total_ratings: int
    rating_distribution: dict[int, int]
    aspects: dict[str, float]


# ==================== DOWNLOAD SCHEMAS ====================


class DownloadResponse(BaseModel):
    id: int
    component_id: int
    user_id: int
    version: str
    download_type: str = "manual"
    status: str = "completed"
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== PURCHASE SCHEMAS ====================


class PurchaseCreate(BaseModel):
    component_id: int
    payment_method: str = Field(..., max_length=50)
    payment_provider: str = Field(..., max_length=50)


class PurchaseResponse(BaseModel):
    id: int
    component_id: int
    user_id: int
    amount: float
    currency: str
    payment_method: str
    transaction_id: str
    provider_transaction_id: str | None = None
    status: str
    license_key: str | None = None
    created_at: datetime
    completed_at: datetime | None = None

    class Config:
        from_attributes = True


# ==================== VERSION SCHEMAS ====================


class ComponentVersionResponse(BaseModel):
    id: int
    component_id: int
    version: str
    is_latest: bool = False
    is_stable: bool = True
    component_data: dict[str, Any]
    dependencies: list[str]
    download_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== MARKETPLACE STATS ====================


class MarketplaceStats(BaseModel):
    total_components: int
    total_downloads: int
    total_revenue: float
    average_rating: float
    active_developers: int
    categories: dict[str, int]


# ==================== BULK OPERATIONS ====================


class BulkComponentOperation(BaseModel):
    action: str = Field(..., pattern="^(approve|reject|suspend|feature|unfeature)$")
    component_ids: list[int] = Field(..., min_items=1, max_items=100)
    reason: str | None = Field(None, max_length=500)


class BulkOperationResponse(BaseModel):
    success_count: int
    error_count: int
    errors: list[dict[str, Any]]


# ==================== ADMIN SCHEMAS ====================


class ComponentModerationResponse(BaseModel):
    id: int
    name: str
    author_name: str
    status: ComponentStatus
    submitted_at: datetime
    review_notes: str | None = None
    reviewer_id: int | None = None
    reviewed_at: datetime | None = None

    class Config:
        from_attributes = True


class ModerationAction(BaseModel):
    action: str = Field(..., pattern="^(approve|reject|request_changes)$")
    notes: str | None = Field(None, max_length=1000)
    feedback: dict[str, Any] | None = None
