"""Modelo de arquivo para o banco de dados.

Este módulo contém o modelo de dados para arquivos armazenados no sistema.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Index, Boolean, ForeignKey, text, UUID
from sqlalchemy.sql import func
import uuid
from sqlalchemy.dialects.postgresql import UUID

# Importar Base do arquivo database.py
from synapse.database import Base


class File(Base):
    """Modelo de dados para arquivos armazenados no sistema."""

    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    is_public = Column(Boolean, nullable=False, server_default=text("false"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # MUDANÇA: ARRAY → JSON para compatibilidade SQLite
    tags = Column(JSON, nullable=True, default=list)

    description = Column(Text, nullable=True)

    # Índices para performance
    __table_args__ = (
        Index("idx_file_filename", "filename"),
        Index("idx_file_created_at", "created_at"),
    )

    def __repr__(self):
        return (
            f"<File(id={self.id}, filename='{self.filename}', size={self.file_size})>"
        )
