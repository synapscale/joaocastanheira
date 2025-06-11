"""
Modelo de mensagem para conversações
"""

from sqlalchemy import Column, String, DateTime, Text, JSON, Integer, Float, ForeignKey, text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from sqlalchemy.dialects.postgresql import UUID

from synapse.database import Base


class Message(Base):
    __tablename__ = "messages"

    # Identificação
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(String(30), ForeignKey("conversations.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    # Conteúdo
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    attachments = Column(JSON, default=list)

    # Metadados do modelo (para mensagens de IA)
    model_used = Column(String(100), nullable=True)
    model_provider = Column(String(50), nullable=True)
    tokens_used = Column(Integer, default=0)
    processing_time_ms = Column(Integer, default=0)

    # Configurações usadas
    temperature = Column(Float, nullable=True)
    max_tokens = Column(Integer, nullable=True)

    # Status e feedback
    status = Column(String(50), default="sent")  # sent, delivered, read, error
    error_message = Column(Text, nullable=True)

    # Feedback do usuário
    rating = Column(Integer, nullable=True)  # 1-5 estrelas
    feedback = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relacionamentos
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role}, conversation_id={self.conversation_id})>"

    @property
    def is_from_user(self):
        """Verifica se a mensagem é do usuário"""
        return self.role == "user"

    @property
    def is_from_assistant(self):
        """Verifica se a mensagem é do assistente"""
        return self.role == "assistant"

    @property
    def is_system_message(self):
        """Verifica se é uma mensagem do sistema"""
        return self.role == "system"

    @property
    def content_preview(self):
        """Preview do conteúdo (primeiros 100 caracteres)"""
        if len(self.content) <= 100:
            return self.content
        return f"{self.content[:100]}..."

    @property
    def has_attachments(self):
        """Verifica se a mensagem tem anexos"""
        return bool(self.attachments)

    @property
    def attachment_count(self):
        """Número de anexos"""
        return len(self.attachments) if self.attachments else 0

    def to_dict(self):
        """Converter para dicionário"""
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "content_preview": self.content_preview,
            "attachments": self.attachments,
            "model_used": self.model_used,
            "model_provider": self.model_provider,
            "tokens_used": self.tokens_used,
            "processing_time_ms": self.processing_time_ms,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "status": self.status,
            "error_message": self.error_message,
            "rating": self.rating,
            "feedback": self.feedback,
            "has_attachments": self.has_attachments,
            "attachment_count": self.attachment_count,
            "is_from_user": self.is_from_user,
            "is_from_assistant": self.is_from_assistant,
            "is_system_message": self.is_system_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
