"""
Dependências para os endpoints da API.

Este módulo define as dependências comuns utilizadas pelos endpoints da API,
como autenticação, validação e injeção de dependências.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from synapse.core.config import settings
from synapse.database import get_db
from synapse.models.user import User
from synapse.core.auth.jwt import verify_token

# Esquema de autenticação OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Obtém o usuário atual a partir do token JWT.

    Args:
        token: Token JWT de autenticação
        db: Sessão do banco de dados

    Returns:
        Objeto User do usuário autenticado

    Raises:
        HTTPException: Se o token for inválido ou usuário não encontrado
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decodificar token JWT
        payload = verify_token(token)
        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except Exception:
        raise credentials_exception

    # Buscar usuário no banco de dados
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise credentials_exception

    # Verificar se usuário está ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo",
        )

    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verifica se o usuário atual é um administrador.

    Args:
        current_user: Usuário atual

    Returns:
        Objeto User do administrador

    Raises:
        HTTPException: Se o usuário não for administrador
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão de administrador necessária",
        )

    return current_user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Verifica se o usuário atual está ativo.

    Args:
        current_user: Usuário atual

    Returns:
        Objeto User ativo

    Raises:
        HTTPException: Se o usuário estiver inativo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo",
        )

    return current_user
