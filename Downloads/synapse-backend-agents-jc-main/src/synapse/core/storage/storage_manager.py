"""
Gerenciador de armazenamento de arquivos
"""

import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from synapse.core.security.file_validation import (
    SecurityValidator,
    sanitize_filename,
)


class StorageManager:
    """Classe para gerenciar o armazenamento de arquivos"""

    def __init__(self, base_storage_path: str = "storage"):
        """
        Inicializa o gerenciador de armazenamento

        Args:
            base_storage_path: Caminho base para armazenamento
        """
        self.base_path = Path(base_storage_path)
        self.base_path.mkdir(exist_ok=True)

        # Criar diretórios por categoria
        self.categories = {
            "image": ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
            "document": ["pdf", "doc", "docx", "txt", "rtf"],
            "csv": ["csv"],
            "audio": ["mp3", "wav", "ogg", "m4a"],
            "video": ["mp4", "avi", "mkv", "mov", "wmv"],
            "archive": ["zip", "rar", "7z", "tar", "gz"],
            "temp": [],  # Para arquivos temporários
            "uploads": [],  # Para uploads gerais
        }

        # Criar diretórios para cada categoria
        for category in self.categories:
            category_path = self.base_path / category
            category_path.mkdir(exist_ok=True)

    def save_file(self, file: UploadFile, category: str | None = None) -> str:
        """
        Salva um arquivo no sistema de armazenamento

        Args:
            file: Arquivo para salvar
            category: Categoria do arquivo (opcional)

        Returns:
            str: Caminho do arquivo salvo

        Raises:
            HTTPException: Se houver erro no salvamento
        """
        try:
            # Validar arquivo
            file_size = self._get_file_size(file)
            SecurityValidator.validate_file(file.filename, file_size)

            # Sanitizar nome do arquivo
            safe_filename = sanitize_filename(file.filename)

            # Determinar categoria se não fornecida
            if not category:
                category = self._get_file_category(safe_filename)

            # Criar diretório da categoria se não existir
            category_path = self.base_path / category
            category_path.mkdir(exist_ok=True)

            # Gerar nome único se arquivo já existir
            file_path = self._get_unique_filepath(category_path, safe_filename)

            # Salvar arquivo
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Retornar caminho relativo
            return str(file_path.relative_to(self.base_path))

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao salvar arquivo: {str(e)}",
            )

    def get_file_path(self, relative_path: str) -> Path:
        """
        Retorna o caminho completo de um arquivo

        Args:
            relative_path: Caminho relativo do arquivo

        Returns:
            Path: Caminho completo do arquivo
        """
        return self.base_path / relative_path

    def delete_file(self, relative_path: str) -> bool:
        """
        Remove um arquivo do armazenamento

        Args:
            relative_path: Caminho relativo do arquivo

        Returns:
            bool: True se o arquivo foi removido com sucesso
        """
        try:
            file_path = self.get_file_path(relative_path)
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception:
            return False

    def file_exists(self, relative_path: str) -> bool:
        """
        Verifica se um arquivo existe

        Args:
            relative_path: Caminho relativo do arquivo

        Returns:
            bool: True se o arquivo existe
        """
        return self.get_file_path(relative_path).exists()

    def get_file_size(self, relative_path: str) -> int:
        """
        Retorna o tamanho de um arquivo em bytes

        Args:
            relative_path: Caminho relativo do arquivo

        Returns:
            int: Tamanho do arquivo em bytes
        """
        file_path = self.get_file_path(relative_path)
        return file_path.stat().st_size if file_path.exists() else 0

    def _get_file_size(self, file: UploadFile) -> int:
        """Retorna o tamanho do arquivo"""
        file.file.seek(0, 2)  # Ir para o final
        size = file.file.tell()
        file.file.seek(0)  # Voltar para o início
        return size

    def _get_file_category(self, filename: str) -> str:
        """
        Determina a categoria de um arquivo baseada na extensão

        Args:
            filename: Nome do arquivo

        Returns:
            str: Categoria do arquivo
        """
        extension = Path(filename).suffix.lower().lstrip(".")

        for category, extensions in self.categories.items():
            if extension in extensions:
                return category

        return "uploads"  # Categoria padrão

    def _get_unique_filepath(self, directory: Path, filename: str) -> Path:
        """
        Gera um caminho único para o arquivo, adicionando número se necessário

        Args:
            directory: Diretório onde salvar
            filename: Nome do arquivo

        Returns:
            Path: Caminho único para o arquivo
        """
        file_path = directory / filename

        if not file_path.exists():
            return file_path

        # Se arquivo já existe, adicionar número
        stem = file_path.stem
        suffix = file_path.suffix
        counter = 1

        while True:
            new_filename = f"{stem}_{counter}{suffix}"
            new_path = directory / new_filename
            if not new_path.exists():
                return new_path
            counter += 1


# Instância global do gerenciador de armazenamento
storage_manager = StorageManager()
