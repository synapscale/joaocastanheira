"""
Schemas Pydantic para UserVariable
Criado por José - um desenvolvedor Full Stack
Validação e serialização para sistema de variáveis personalizado
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict
from datetime import datetime
import re


class UserVariableBase(BaseModel):
    """Schema base para variáveis do usuário"""

    key: str = Field(
        ..., min_length=1, max_length=255, description="Nome da variável (formato ENV)"
    )
    value: str = Field(..., description="Valor da variável")
    description: str | None = Field(
        None, max_length=500, description="Descrição opcional da variável"
    )
    category: str | None = Field(
        None, max_length=100, description="Categoria da variável"
    )
    is_encrypted: bool = Field(True, description="Se o valor deve ser criptografado")
    is_active: bool = Field(True, description="Se a variável está ativa")

    @validator("key")
    def validate_key_format(cls, v):
        """Valida se a chave está no formato correto de variável de ambiente"""
        if not v:
            raise ValueError("Chave não pode estar vazia")

        # Converter para maiúsculo
        v = v.upper()

        # Validar formato: deve começar com letra, seguido de letras, números ou underscore
        pattern = r"^[A-Z][A-Z0-9_]*$"
        if not re.match(pattern, v):
            raise ValueError(
                "Chave deve seguir o formato de variável de ambiente: "
                "começar com letra maiúscula, seguido de letras, números ou underscore",
            )

        # Verificar palavras reservadas
        reserved_words = [
            "PATH",
            "HOME",
            "USER",
            "SHELL",
            "PWD",
            "LANG",
            "LC_ALL",
            "PYTHONPATH",
            "VIRTUAL_ENV",
            "NODE_ENV",
            "PORT",
        ]
        if v in reserved_words:
            raise ValueError(f'"{v}" é uma palavra reservada do sistema')

        return v

    @validator("value")
    def validate_value(cls, v):
        """Valida o valor da variável"""
        if v is None:
            return ""

        # Converter para string se necessário
        if not isinstance(v, str):
            v = str(v)

        # Limitar tamanho do valor
        if len(v) > 10000:  # 10KB
            raise ValueError("Valor da variável muito longo (máximo 10KB)")

        return v

    @validator("category")
    def validate_category(cls, v):
        """Valida a categoria da variável"""
        if v is None:
            return None

        valid_categories = [
            "API_KEYS",
            "CREDENTIALS",
            "CONFIG",
            "URLS",
            "TOKENS",
            "DATABASE",
            "EMAIL",
            "STORAGE",
            "SOCIAL",
            "PAYMENT",
            "OTHER",
        ]

        v = v.upper()
        if v not in valid_categories:
            raise ValueError(
                f'Categoria deve ser uma das seguintes: {", ".join(valid_categories)}'
            )

        return v


class UserVariableCreate(UserVariableBase):
    """Schema para criação de variável do usuário"""


class UserVariableUpdate(BaseModel):
    """Schema para atualização de variável do usuário"""

    value: str | None = Field(None, description="Novo valor da variável")
    description: str | None = Field(None, max_length=500, description="Nova descrição")
    category: str | None = Field(None, max_length=100, description="Nova categoria")
    is_active: bool | None = Field(None, description="Status ativo/inativo")

    @validator("value")
    def validate_value(cls, v):
        """Valida o valor da variável"""
        if v is None:
            return None

        if not isinstance(v, str):
            v = str(v)

        if len(v) > 10000:
            raise ValueError("Valor da variável muito longo (máximo 10KB)")

        return v

    @validator("category")
    def validate_category(cls, v):
        """Valida a categoria da variável"""
        if v is None:
            return None

        valid_categories = [
            "API_KEYS",
            "CREDENTIALS",
            "CONFIG",
            "URLS",
            "TOKENS",
            "DATABASE",
            "EMAIL",
            "STORAGE",
            "SOCIAL",
            "PAYMENT",
            "OTHER",
        ]

        v = v.upper()
        if v not in valid_categories:
            raise ValueError(
                f'Categoria deve ser uma das seguintes: {", ".join(valid_categories)}'
            )

        return v


class UserVariableResponse(BaseModel):
    """Schema para resposta de variável do usuário"""

    id: int
    key: str
    description: str | None
    category: str | None
    is_active: bool
    is_sensitive: bool = Field(description="Se a variável contém dados sensíveis")
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserVariableWithValue(UserVariableResponse):
    """Schema para resposta com valor (apenas para o próprio usuário)"""

    value: str


class UserVariableList(BaseModel):
    """Schema para lista de variáveis do usuário"""

    variables: list[UserVariableResponse]
    total: int
    categories: list[str] = Field(description="Categorias disponíveis")


class UserVariableBulkCreate(BaseModel):
    """Schema para criação em lote de variáveis"""

    variables: list[UserVariableCreate] = Field(..., min_items=1, max_items=50)


class UserVariableBulkUpdate(BaseModel):
    """Schema para atualização em lote de variáveis"""

    updates: dict[int, UserVariableUpdate] = Field(
        ..., description="Mapeamento ID -> dados de atualização"
    )


class UserVariableImport(BaseModel):
    """Schema para importação de variáveis de arquivo .env"""

    env_content: str = Field(..., description="Conteúdo do arquivo .env")
    overwrite_existing: bool = Field(
        False, description="Se deve sobrescrever variáveis existentes"
    )
    default_category: str | None = Field(
        "CONFIG", description="Categoria padrão para variáveis importadas"
    )

    @validator("env_content")
    def validate_env_content(cls, v):
        """Valida o conteúdo do arquivo .env"""
        if not v or not v.strip():
            raise ValueError("Conteúdo do arquivo .env não pode estar vazio")

        lines = v.strip().split("\n")
        valid_lines = 0

        for line in lines:
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            if "=" not in line:
                raise ValueError(f"Linha inválida no arquivo .env: {line}")

            key, _ = line.split("=", 1)
            if not key.strip():
                raise ValueError(f"Chave vazia na linha: {line}")

            valid_lines += 1

        if valid_lines == 0:
            raise ValueError("Nenhuma variável válida encontrada no arquivo .env")

        if valid_lines > 100:
            raise ValueError("Muitas variáveis no arquivo .env (máximo 100)")

        return v


class UserVariableExport(BaseModel):
    """Schema para exportação de variáveis"""

    format: str = Field("env", description="Formato de exportação (env, json, yaml)")
    include_sensitive: bool = Field(
        False, description="Se deve incluir variáveis sensíveis"
    )
    categories: list[str] | None = Field(
        None, description="Categorias específicas para exportar"
    )

    @validator("format")
    def validate_format(cls, v):
        """Valida o formato de exportação"""
        valid_formats = ["env", "json", "yaml"]
        if v not in valid_formats:
            raise ValueError(
                f'Formato deve ser um dos seguintes: {", ".join(valid_formats)}'
            )
        return v


class UserVariableStats(BaseModel):
    """Schema para estatísticas das variáveis do usuário"""

    total_variables: int
    active_variables: int
    inactive_variables: int
    sensitive_variables: int
    categories_count: dict[str, int]
    last_updated: datetime | None


class UserVariableValidation(BaseModel):
    """Schema para validação de variáveis"""

    key: str
    is_valid: bool
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class UserVariableBulkValidation(BaseModel):
    """Schema para validação em lote"""

    validations: list[UserVariableValidation]
    summary: dict[str, int] = Field(description="Resumo da validação")


# Schemas para uso em workflows
class WorkflowVariableContext(BaseModel):
    """Schema para contexto de variáveis em workflows"""

    user_variables: dict[str, str] = Field(description="Variáveis do usuário")
    system_variables: dict[str, str] = Field(description="Variáveis do sistema")
    workflow_variables: dict[str, str] = Field(
        description="Variáveis específicas do workflow"
    )


class VariableUsageLog(BaseModel):
    """Schema para log de uso de variáveis"""

    variable_key: str
    workflow_id: int | None
    node_id: int | None
    used_at: datetime
    execution_id: str | None
