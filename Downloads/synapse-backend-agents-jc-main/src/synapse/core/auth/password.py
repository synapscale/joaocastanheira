"""
Funções para gerenciamento de senhas.
"""

from passlib.context import CryptContext

# Configuração do contexto de criptografia
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se uma senha em texto plano corresponde ao hash.

    Args:
        plain_password: Senha em texto plano
        hashed_password: Hash da senha armazenado no banco

    Returns:
        True se a senha for válida, False caso contrário
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Gera hash da senha para armazenamento seguro.

    Args:
        password: Senha em texto plano

    Returns:
        Hash da senha para armazenar no banco de dados
    """
    return pwd_context.hash(password)
