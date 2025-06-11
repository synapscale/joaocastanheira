"""
Validação de segurança para arquivos
"""

import os
import re
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status


class SecurityValidator:
    """Classe para validação de segurança de arquivos"""

    # Extensões permitidas por categoria
    ALLOWED_EXTENSIONS = {
        "image": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
        "document": [".pdf", ".doc", ".docx", ".txt", ".rtf"],
        "spreadsheet": [".xls", ".xlsx", ".csv"],
        "audio": [".mp3", ".wav", ".ogg", ".m4a"],
        "video": [".mp4", ".avi", ".mkv", ".mov", ".wmv"],
        "archive": [".zip", ".rar", ".7z", ".tar", ".gz"],
    }

    # Tamanho máximo por tipo (em bytes)
    MAX_FILE_SIZES = {
        "image": 10 * 1024 * 1024,  # 10MB
        "document": 50 * 1024 * 1024,  # 50MB
        "spreadsheet": 20 * 1024 * 1024,  # 20MB
        "audio": 100 * 1024 * 1024,  # 100MB
        "video": 500 * 1024 * 1024,  # 500MB
        "archive": 100 * 1024 * 1024,  # 100MB
    }

    @classmethod
    def validate_file(
        cls, filename: str, file_size: int, file_type: str | None = None
    ) -> bool:
        """
        Valida se um arquivo é seguro para upload

        Args:
            filename: Nome do arquivo
            file_size: Tamanho do arquivo em bytes
            file_type: Tipo do arquivo (opcional)

        Returns:
            bool: True se o arquivo é válido

        Raises:
            HTTPException: Se o arquivo não é válido
        """
        # Verificar nome do arquivo
        if not cls._is_safe_filename(filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nome de arquivo inválido",
            )

        # Verificar extensão
        file_ext = Path(filename).suffix.lower()
        if not cls._is_allowed_extension(file_ext):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Extensão de arquivo não permitida: {file_ext}",
            )

        # Verificar tamanho
        category = cls._get_file_category(file_ext)
        max_size = cls.MAX_FILE_SIZES.get(category, 10 * 1024 * 1024)  # Default 10MB

        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Arquivo muito grande. Máximo permitido: {max_size / (1024*1024):.1f}MB",
            )

        return True

    @classmethod
    def _is_safe_filename(cls, filename: str) -> bool:
        """Verifica se o nome do arquivo é seguro"""
        if not filename or len(filename) > 255:
            return False

        # Caracteres perigosos
        dangerous_chars = ["..", "/", "\\", ":", "*", "?", '"', "<", ">", "|"]
        for char in dangerous_chars:
            if char in filename:
                return False

        # Nomes reservados no Windows
        reserved_names = [
            "CON",
            "PRN",
            "AUX",
            "NUL",
            "COM1",
            "COM2",
            "COM3",
            "COM4",
            "COM5",
            "COM6",
            "COM7",
            "COM8",
            "COM9",
            "LPT1",
            "LPT2",
            "LPT3",
            "LPT4",
            "LPT5",
            "LPT6",
            "LPT7",
            "LPT8",
            "LPT9",
        ]

        name_without_ext = Path(filename).stem.upper()
        if name_without_ext in reserved_names:
            return False

        return True

    @classmethod
    def _is_allowed_extension(cls, extension: str) -> bool:
        """Verifica se a extensão é permitida"""
        for category, extensions in cls.ALLOWED_EXTENSIONS.items():
            if extension in extensions:
                return True
        return False

    @classmethod
    def _get_file_category(cls, extension: str) -> str:
        """Retorna a categoria do arquivo baseada na extensão"""
        for category, extensions in cls.ALLOWED_EXTENSIONS.items():
            if extension in extensions:
                return category
        return "unknown"


def sanitize_filename(filename: str) -> str:
    """
    Sanitiza um nome de arquivo removendo caracteres perigosos

    Args:
        filename: Nome do arquivo original

    Returns:
        str: Nome do arquivo sanitizado
    """
    if not filename:
        return "unnamed_file"

    # Remover espaços no início e fim
    filename = filename.strip()

    # Substituir caracteres perigosos por underscore
    filename = re.sub(r'[<>:"/\\|?*]', "_", filename)

    # Remover múltiplos pontos consecutivos (exceto a extensão)
    parts = filename.rsplit(".", 1)
    if len(parts) == 2:
        name, ext = parts
        name = re.sub(r"\.{2,}", "_", name)
        filename = f"{name}.{ext}"
    else:
        filename = re.sub(r"\.{2,}", "_", filename)

    # Limitar tamanho
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        max_name_length = 255 - len(ext)
        filename = name[:max_name_length] + ext

    # Garantir que não seja vazio
    if not filename or filename.startswith("."):
        filename = f"file_{filename}" if filename else "unnamed_file"

    return filename
