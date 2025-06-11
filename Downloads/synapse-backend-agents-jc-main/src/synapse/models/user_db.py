"""
Modelo User adaptado para a estrutura real do banco DigitalOcean
Schema: synapscale_db
"""

import uuid
import hashlib
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Column, String, Boolean, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session

# Base para o schema correto
Base = declarative_base()

class UserDB(Base):
    """
    Modelo User adaptado para a estrutura real do banco DigitalOcean
    """
    __tablename__ = "users"
    __table_args__ = {"schema": "synapscale_db"}
    
    # Colunas que existem no banco real
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    profile_image_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    
    def verify_password(self, password: str) -> bool:
        """Verifica se a senha está correta"""
        # Simples hash SHA-256 usado no banco existente
        hashed = hashlib.sha256(password.encode()).hexdigest()
        return self.hashed_password == hashed
    
    def set_password(self, password: str):
        """Define a senha do usuário"""
        self.hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    @property
    def first_name(self) -> str:
        """Compatibilidade com modelo antigo"""
        if self.full_name:
            return self.full_name.split(' ')[0]
        return ""
    
    @property
    def last_name(self) -> str:
        """Compatibilidade com modelo antigo"""
        if self.full_name and ' ' in self.full_name:
            return ' '.join(self.full_name.split(' ')[1:])
        return ""

class RefreshTokenDB(Base):
    """Token de refresh adaptado"""
    __tablename__ = "refresh_tokens"
    __table_args__ = {"schema": "synapscale_db"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token = Column(String, unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)
    
    def is_valid(self) -> bool:
        """Verifica se o token ainda é válido"""
        return self.is_active and datetime.now(timezone.utc) < self.expires_at

def get_user_by_email(db: Session, email: str) -> Optional[UserDB]:
    """Busca usuário por email"""
    return db.execute(
        text("SELECT * FROM synapscale_db.users WHERE email = :email"),
        {"email": email}
    ).first()

def get_user_by_username(db: Session, username: str) -> Optional[UserDB]:
    """Busca usuário por username"""
    return db.execute(
        text("SELECT * FROM synapscale_db.users WHERE username = :username"),
        {"username": username}
    ).first()

def create_user_db(db: Session, email: str, username: str, full_name: str, password: str) -> str:
    """Cria usuário no banco usando SQL direto"""
    user_id = str(uuid.uuid4())
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    db.execute(
        text("""
            INSERT INTO synapscale_db.users 
            (id, email, username, full_name, hashed_password, is_active, is_verified, is_superuser, created_at, updated_at)
            VALUES (:id, :email, :username, :full_name, :hashed_password, true, false, false, :created_at, :updated_at)
        """),
        {
            "id": user_id,
            "email": email,
            "username": username,
            "full_name": full_name,
            "hashed_password": hashed_password,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    )
    db.commit()
    return user_id

def verify_user_credentials(db: Session, email_or_username: str, password: str) -> Optional[dict]:
    """Verifica credenciais e retorna dados do usuário"""
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    result = db.execute(
        text("""
            SELECT id, email, username, full_name, is_active, is_verified, is_superuser, created_at
            FROM synapscale_db.users 
            WHERE (email = :credential OR username = :credential) 
            AND hashed_password = :hashed_password
            AND is_active = true
        """),
        {
            "credential": email_or_username,
            "hashed_password": hashed_password
        }
    ).first()
    
    if result:
        return {
            "id": str(result.id),
            "email": result.email,
            "username": result.username,
            "full_name": result.full_name,
            "is_active": result.is_active,
            "is_verified": result.is_verified,
            "is_superuser": result.is_superuser,
            "created_at": result.created_at.isoformat() if result.created_at else None
        }
    return None
