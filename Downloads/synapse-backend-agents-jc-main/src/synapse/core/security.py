"""
Configuração de segurança do backend
Criado por José - um desenvolvedor Full Stack
Implementa todas as melhores práticas de segurança
"""

import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from synapse.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# JWT token functions
def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """Create JWT access token"""
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    # Create token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    return encoded_jwt


def create_refresh_token(data: dict[str, Any]) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()

    # Set expiration time (longer than access token)
    expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})

    # Create token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    return encoded_jwt


def verify_token(token: str) -> dict[str, Any]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.PyJWTError:
        return None


# Password functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


# API key functions
def generate_api_key() -> str:
    """Generate secure API key"""
    import secrets

    return f"sk-{secrets.token_urlsafe(32)}"


def hash_api_key(api_key: str) -> str:
    """Hash API key for storage"""
    return pwd_context.hash(api_key)


def verify_api_key(plain_api_key: str, hashed_api_key: str) -> bool:
    """Verify API key against hash"""
    return pwd_context.verify(plain_api_key, hashed_api_key)
