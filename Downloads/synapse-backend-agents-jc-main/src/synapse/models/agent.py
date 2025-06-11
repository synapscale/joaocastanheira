"""
Modelo completo de Agent com todas as funcionalidades
"""

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Text,
    JSON,
    Integer,
    ForeignKey,
    Enum,
    Float,
    Boolean,
    DECIMAL,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from synapse.database import Base


class AgentStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRAINING = "training"
    MAINTENANCE = "maintenance"


class AgentType(enum.Enum):
    GENERAL = "general"
    SPECIALIST = "specialist"
    WORKFLOW = "workflow"
    ASSISTANT = "assistant"


class Agent(Base):
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    provider = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    system_prompt = Column(Text)
    temperature = Column(DECIMAL(3,2), server_default=text("0.7"))
    max_tokens = Column(Integer, server_default=text("1000"))
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("synapscale_db.users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Configuração de personalidade
    personality = Column(Text)
    instructions = Column(Text)
    agent_type = Column(Enum(AgentType), default=AgentType.GENERAL)

    # Configuração do modelo LLM
    model_provider = Column(String(50), default="openai")
    top_p = Column(Float, default=1.0)
    frequency_penalty = Column(Float, default=0.0)
    presence_penalty = Column(Float, default=0.0)

    # Ferramentas e capacidades
    tools = Column(JSON, default=list)  # Lista de ferramentas disponíveis
    knowledge_base = Column(JSON, default=dict)  # Base de conhecimento específica
    capabilities = Column(JSON, default=list)  # Capacidades específicas

    # Estado e configuração
    status = Column(Enum(AgentStatus), default=AgentStatus.ACTIVE)
    avatar_url = Column(String(500))
    configuration = Column(JSON, default=dict)

    # Estatísticas
    conversation_count = Column(Integer, default=0)
    message_count = Column(Integer, default=0)
    total_tokens_used = Column(Integer, default=0)
    average_response_time = Column(Float, default=0.0)
    rating_average = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)

    # Timestamps
    last_active_at = Column(DateTime(timezone=True))

    # Relacionamentos
    user = relationship("User", back_populates="agents")
    workspace = relationship("Workspace", back_populates="agents")
    conversations = relationship(
        "Conversation", back_populates="agent", cascade="all, delete-orphan"
    )

    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=True, index=True)

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """Converte agente para dicionário"""
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "provider": self.provider,
            "model": self.model,
            "system_prompt": self.system_prompt,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "status": self.status.value,
            "avatar_url": self.avatar_url,
            "conversation_count": self.conversation_count,
            "message_count": self.message_count,
            "rating_average": self.rating_average,
            "rating_count": self.rating_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_sensitive:
            data.update(
                {
                    "personality": self.personality,
                    "instructions": self.instructions,
                    "tools": self.tools,
                    "knowledge_base": self.knowledge_base,
                    "capabilities": self.capabilities,
                    "configuration": self.configuration,
                    "top_p": self.top_p,
                    "frequency_penalty": self.frequency_penalty,
                    "presence_penalty": self.presence_penalty,
                    "total_tokens_used": self.total_tokens_used,
                    "average_response_time": self.average_response_time,
                }
            )

        return data

    def increment_conversation(self):
        """Incrementa contador de conversações"""
        self.conversation_count += 1
        self.last_active_at = func.now()

    def increment_message(self, tokens_used: int = 0, response_time: float = 0.0):
        """Incrementa contador de mensagens e atualiza estatísticas"""
        self.message_count += 1
        self.total_tokens_used += tokens_used

        # Atualizar tempo médio de resposta
        if response_time > 0:
            if self.average_response_time == 0:
                self.average_response_time = response_time
            else:
                # Média móvel simples
                self.average_response_time = (
                    self.average_response_time + response_time
                ) / 2

        self.last_active_at = func.now()

    def update_rating(self, new_rating: float):
        """Atualiza rating médio com nova avaliação"""
        if not 1.0 <= new_rating <= 5.0:
            raise ValueError("Rating deve estar entre 1.0 e 5.0")

        total_points = self.rating_average * self.rating_count
        total_points += new_rating
        self.rating_count += 1
        self.rating_average = total_points / self.rating_count

    def get_llm_config(self) -> dict:
        """Retorna configuração para o LLM"""
        return {
            "provider": self.model_provider,
            "model": self.model_name,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "top_p": self.top_p,
            "frequency_penalty": self.frequency_penalty,
            "presence_penalty": self.presence_penalty,
        }

    def get_system_prompt(self) -> str:
        """Gera prompt do sistema baseado na personalidade e instruções"""
        system_prompt = f"Você é {self.name}"

        if self.description:
            system_prompt += f", {self.description}"

        if self.personality:
            system_prompt += f"\n\nPersonalidade: {self.personality}"

        if self.instructions:
            system_prompt += f"\n\nInstruções específicas: {self.instructions}"

        # Adicionar informações sobre ferramentas disponíveis
        if self.tools:
            tools_list = ", ".join(self.tools)
            system_prompt += f"\n\nFerramentas disponíveis: {tools_list}"

        return system_prompt

    def has_tool(self, tool_name: str) -> bool:
        """Verifica se o agente tem uma ferramenta específica"""
        return tool_name in (self.tools or [])

    def add_tool(self, tool_name: str):
        """Adiciona uma ferramenta ao agente"""
        if not self.tools:
            self.tools = []
        if tool_name not in self.tools:
            self.tools.append(tool_name)

    def remove_tool(self, tool_name: str):
        """Remove uma ferramenta do agente"""
        if self.tools and tool_name in self.tools:
            self.tools.remove(tool_name)

    def is_available(self) -> bool:
        """Verifica se o agente está disponível para conversas"""
        return self.status == AgentStatus.ACTIVE
