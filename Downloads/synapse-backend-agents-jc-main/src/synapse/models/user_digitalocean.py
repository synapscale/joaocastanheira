#!/usr/bin/env python3
"""
Modelo User adaptado para a estrutura do banco DigitalOcean
"""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from passlib.context import CryptContext
from synapse.database import Base

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserDigitalOcean(Base):
    """Modelo User adaptado para a estrutura existente no DigitalOcean"""
    __tablename__ = "users"

    id = Column(String(255), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255))
    full_name = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def verify_password(self, password: str) -> bool:
        """Verifica se a senha fornecida está correta"""
        return pwd_context.verify(password, self.hashed_password)

    def set_password(self, password: str):
        """Define uma nova senha para o usuário"""
        self.hashed_password = pwd_context.hash(password)
    
    @property
    def first_name(self):
        """Compatibilidade: extrai primeiro nome do full_name"""
        if self.full_name:
            return self.full_name.split(' ')[0]
        return ''
    
    @property 
    def last_name(self):
        """Compatibilidade: extrai sobrenome do full_name"""
        if self.full_name and ' ' in self.full_name:
            return ' '.join(self.full_name.split(' ')[1:])
        return ''
    
    @property
    def password_hash(self):
        """Compatibilidade: mapeia para hashed_password"""
        return self.hashed_password
    
    @password_hash.setter
    def password_hash(self, value):
        """Compatibilidade: mapeia para hashed_password"""
        self.hashed_password = value
    
    @property
    def role(self):
        """Compatibilidade: mapeia is_superuser para role"""
        return "admin" if self.is_superuser else "user"
    
    @property
    def is_verified(self):
        """Compatibilidade: assume verificado se ativo"""
        return self.is_active
    
    def to_dict(self) -> dict:
        """Converte o usuário para dicionário (sem dados sensíveis)"""
        return {
            "id": str(self.id),
            "email": self.email,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


if __name__ == "__main__":
    print("✅ Modelo User adaptado para DigitalOcean criado com sucesso!")
