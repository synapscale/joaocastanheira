"""Esquemas Pydantic para arquivos.

Este módulo contém os esquemas Pydantic para validação e serialização
de dados relacionados a arquivos.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from synapse.core.config.constants import FILE_CATEGORIES


class FileBase(BaseModel):
    """Esquema base para arquivos."""

    filename: str = Field(..., description="Nome original do arquivo")
    category: str = Field(
        ...,
        description="Categoria do arquivo (image, video, audio, document, archive)",
    )

    @field_validator("category")
    def validate_category(cls, v):
        """Valida se a categoria é permitida.

        Args:
            v: Valor da categoria

        Returns:
            Categoria validada

        Raises:
            ValueError: Se a categoria não for permitida
        """
        if v not in FILE_CATEGORIES:
            raise ValueError(
                f"Categoria inválida. Deve ser uma das: {', '.join(FILE_CATEGORIES)}",
            )
        return v


class FileCreate(BaseModel):
    """Esquema para criação de arquivo."""

    filename: str
    original_filename: str
    content_type: str
    file_size: int
    tags: list[str] | None = []
    description: str | None = None
    is_public: bool = False


class FileUpdate(BaseModel):
    """Esquema para atualização de arquivo."""

    tags: list[str] | None = Field(None, description="Tags para categorização")
    description: str | None = Field(None, description="Descrição do arquivo")
    is_public: bool | None = Field(None, description="Se o arquivo é público")


class FileInDB(FileBase):
    """Esquema para arquivo no banco de dados."""

    id: UUID = Field(..., description="ID único do arquivo")
    user_id: str = Field(..., description="ID do usuário proprietário")
    stored_name: str = Field(..., description="Nome do arquivo no armazenamento")
    mime_type: str = Field(..., description="Tipo MIME do arquivo")
    size: str = Field(..., description="Tamanho do arquivo em bytes")
    checksum: str = Field(..., description="Hash MD5 do conteúdo do arquivo")
    tags: list[str] | None = Field(None, description="Tags para categorização")
    description: str | None = Field(None, description="Descrição do arquivo")
    is_public: bool = Field(..., description="Se o arquivo é público")
    status: str = Field(..., description="Status de processamento do arquivo")
    storage_path: str = Field(..., description="Caminho de armazenamento do arquivo")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data de última atualização")

    class Config:
        """Configuração do modelo Pydantic."""

        from_attributes = True


class FileResponse(BaseModel):
    """Esquema para resposta de arquivo."""

    id: int
    filename: str
    original_filename: str
    content_type: str
    file_size: int
    tags: list[str] | None = []
    description: str | None = None
    is_public: bool
    created_at: str
    updated_at: str

    class Config:
        """Configuração do modelo Pydantic."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "user_123",
                "filename": "documento.pdf",
                "category": "document",
                "mime_type": "application/pdf",
                "size": "1048576",
                "tags": ["relatório", "financeiro"],
                "description": "Relatório financeiro anual",
                "is_public": False,
                "status": "completed",
                "created_at": "2023-01-01T12:00:00",
                "updated_at": "2023-01-01T12:00:00",
            },
        }


class FileUploadResponse(BaseModel):
    """Esquema para resposta de upload de arquivo."""

    file_id: UUID = Field(..., description="ID único do arquivo")
    message: str = Field(..., description="Mensagem de sucesso")

    class Config:
        """Configuração do modelo Pydantic."""

        json_schema_extra = {
            "example": {
                "file_id": "123e4567-e89b-12d3-a456-426614174000",
                "message": "Arquivo enviado com sucesso",
            },
        }


class FileListResponse(BaseModel):
    """Esquema para resposta de listagem de arquivos."""

    items: list[FileResponse] = Field(..., description="Lista de arquivos")
    total: int = Field(..., description="Total de arquivos")
    page: int = Field(..., description="Página atual")
    size: int = Field(..., description="Tamanho da página")
    pages: int = Field(..., description="Total de páginas")

    class Config:
        """Configuração do modelo Pydantic."""

        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "user_id": "user_123",
                        "filename": "documento.pdf",
                        "category": "document",
                        "mime_type": "application/pdf",
                        "size": "1048576",
                        "tags": ["relatório", "financeiro"],
                        "description": "Relatório financeiro anual",
                        "is_public": False,
                        "status": "completed",
                        "created_at": "2023-01-01T12:00:00",
                        "updated_at": "2023-01-01T12:00:00",
                    },
                ],
                "total": 1,
                "page": 1,
                "size": 10,
                "pages": 1,
            },
        }


class FileDownloadResponse(BaseModel):
    """Esquema para resposta de download de arquivo."""

    download_url: str = Field(..., description="URL para download do arquivo")
    expires_at: datetime = Field(..., description="Data de expiração da URL")

    class Config:
        """Configuração do modelo Pydantic."""

        json_schema_extra = {
            "example": {
                "download_url": "https://api.synapscale.com/download/123e4567-e89b-12d3-a456-426614174000?token=abc123",
                "expires_at": "2023-01-01T13:00:00",
            },
        }
