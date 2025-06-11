"""
Serviço de gerenciamento de arquivos.

Este módulo implementa o serviço de negócio para gerenciamento de arquivos,
incluindo upload, download, listagem e remoção.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Union
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from synapse.core.security.file_validation import SecurityValidator, sanitize_filename
from synapse.core.storage.storage_manager import StorageManager
from synapse.exceptions import NotFoundError, StorageError, not_found_exception
from synapse.models.file import File
from synapse.schemas.file import FileCreate, FileInDB, FileUpdate

# Logger
logger = logging.getLogger(__name__)


class FileService:
    """Serviço para gerenciamento de arquivos."""

    def __init__(self):
        """Inicializa o serviço de arquivos."""
        self.storage_manager = StorageManager()
        self.security_validator = SecurityValidator()
        logger.info("Serviço de arquivos inicializado")

    async def upload_file(
        self,
        db: AsyncSession,
        file: UploadFile,
        user_id: str,
        file_data: FileCreate,
    ) -> File:
        """Faz upload de um arquivo.

        Args:
            db: Sessão do banco de dados
            file: Arquivo enviado
            user_id: ID do usuário que está fazendo upload
            file_data: Dados adicionais do arquivo

        Returns:
            Objeto File criado

        Raises:
            FileValidationError: Se o arquivo não passar nas validações
            StorageError: Se houver erro ao armazenar o arquivo
        """
        # Ler conteúdo do arquivo
        content = await file.read()

        # Sanitizar nome do arquivo
        filename = sanitize_filename(file.filename)

        # Validar arquivo
        await self.security_validator.validate_file_safety(
            content=content,
            filename=filename,
            mime_type=file.content_type,
            category=file_data.category,
        )

        # Salvar arquivo no armazenamento
        storage_info = await self.storage_manager.save_file(
            content=content,
            filename=filename,
            category=file_data.category,
            user_id=user_id,
        )

        # Criar registro no banco de dados com campos válidos
        db_file = File(
            user_id=user_id,
            filename=filename,
            original_name=file.filename,
            file_path=storage_info["file_path"],
            file_size=len(content),
            mime_type=file.content_type,
            category=file_data.category,
            is_public=file_data.is_public,
            tags=file_data.tags,
            description=file_data.description,
        )

        # Salvar no banco de dados
        db.add(db_file)
        await db.commit()
        await db.refresh(db_file)

        logger.info(f"Arquivo {db_file.id} enviado com sucesso por usuário {user_id}")
        return db_file

    async def get_file(
        self,
        db: AsyncSession,
        file_id: UUID,
        user_id: Optional[str] = None,
    ) -> File:
        """Obtém informações de um arquivo.

        Args:
            db: Sessão do banco de dados
            file_id: ID do arquivo
            user_id: ID do usuário (opcional, para verificação de permissão)

        Returns:
            Objeto File

        Raises:
            NotFoundError: Se o arquivo não for encontrado
        """
        # Buscar arquivo no banco de dados
        result = await db.execute(select(File).where(File.id == file_id))
        db_file = result.scalars().first()

        if not db_file:
            logger.warning(f"Arquivo {file_id} não encontrado")
            raise not_found_exception("Arquivo não encontrado")

        # Verificar permissão
        if user_id and db_file.user_id != user_id and db_file.is_public != "true":
            logger.warning(
                f"Usuário {user_id} tentou acessar arquivo {file_id} sem permissão"
            )
            raise not_found_exception("Arquivo não encontrado")

        logger.info(f"Arquivo {file_id} recuperado com sucesso")
        return db_file

    async def list_files(
        self,
        db: AsyncSession,
        user_id: str,
        skip: int = 0,
        limit: int = 10,
        category: Optional[str] = None,
    ) -> Tuple[List[File], int]:
        """Lista arquivos de um usuário.

        Args:
            db: Sessão do banco de dados
            user_id: ID do usuário
            skip: Número de registros para pular
            limit: Número máximo de registros para retornar
            category: Filtrar por categoria (opcional)

        Returns:
            Tupla com lista de arquivos e contagem total
        """
        # Construir query base
        query = select(File).where(File.user_id == user_id)

        # Adicionar filtro de categoria
        if category:
            query = query.where(File.category == category)

        # Contar total
        count_query = select(File.id).where(File.user_id == user_id)
        if category:
            count_query = count_query.where(File.category == category)

        count_result = await db.execute(count_query)
        total = len(count_result.scalars().all())

        # Executar query paginada
        result = await db.execute(
            query.order_by(File.created_at.desc()).offset(skip).limit(limit)
        )
        files = result.scalars().all()

        logger.info(
            f"Listados {len(files)} arquivos para usuário {user_id} "
            f"(total: {total}, skip: {skip}, limit: {limit})"
        )
        return files, total

    async def update_file(
        self,
        db: AsyncSession,
        file_id: UUID,
        user_id: str,
        file_data: FileUpdate,
    ) -> File:
        """Atualiza informações de um arquivo.

        Args:
            db: Sessão do banco de dados
            file_id: ID do arquivo
            user_id: ID do usuário
            file_data: Dados atualizados do arquivo

        Returns:
            Objeto File atualizado

        Raises:
            NotFoundError: Se o arquivo não for encontrado
        """
        # Buscar arquivo no banco de dados
        db_file = await self.get_file(db, file_id, user_id)

        # Verificar propriedade
        if db_file.user_id != user_id:
            logger.warning(
                f"Usuário {user_id} tentou atualizar arquivo {file_id} sem permissão"
            )
            raise not_found_exception("Arquivo não encontrado")

        # Atualizar campos
        if file_data.tags is not None:
            db_file.tags = file_data.tags

        if file_data.description is not None:
            db_file.description = file_data.description

        if file_data.is_public is not None:
            db_file.is_public = str(file_data.is_public).lower()

        # Salvar no banco de dados
        await db.commit()
        await db.refresh(db_file)

        logger.info(f"Arquivo {file_id} atualizado com sucesso por usuário {user_id}")
        return db_file

    async def delete_file(
        self,
        db: AsyncSession,
        file_id: UUID,
        user_id: str,
    ) -> bool:
        """Remove um arquivo.

        Args:
            db: Sessão do banco de dados
            file_id: ID do arquivo
            user_id: ID do usuário

        Returns:
            True se o arquivo foi removido com sucesso

        Raises:
            NotFoundError: Se o arquivo não for encontrado
        """
        # Buscar arquivo no banco de dados
        db_file = await self.get_file(db, file_id, user_id)

        # Verificar propriedade (apenas o proprietário pode remover)
        if db_file.user_id != user_id:
            logger.warning(
                f"Usuário {user_id} tentou remover arquivo {file_id} sem permissão"
            )
            raise not_found_exception("Arquivo não encontrado")

        try:
            # Remover do armazenamento
            await self.storage_manager.delete_file(
                category=db_file.category,
                stored_name=db_file.stored_name,
            )

            # Remover do banco de dados
            await db.delete(db_file)
            await db.commit()

            logger.info(f"Arquivo {file_id} removido com sucesso por usuário {user_id}")
            return True
        except Exception as e:
            # Rollback em caso de erro
            await db.rollback()
            logger.error(f"Erro ao remover arquivo {file_id}: {str(e)}")
            raise StorageError(f"Erro ao remover arquivo: {str(e)}") from e

    async def generate_download_url(
        self,
        db: AsyncSession,
        file_id: UUID,
        user_id: Optional[str] = None,
    ) -> Dict[str, Union[str, datetime]]:
        """Gera URL para download de um arquivo.

        Args:
            db: Sessão do banco de dados
            file_id: ID do arquivo
            user_id: ID do usuário (opcional, para verificação de permissão)

        Returns:
            Dicionário com URL de download e data de expiração

        Raises:
            NotFoundError: Se o arquivo não for encontrado
        """
        # Buscar arquivo no banco de dados
        db_file = await self.get_file(db, file_id, user_id)

        # Verificar permissão
        if user_id and db_file.user_id != user_id and db_file.is_public != "true":
            logger.warning(
                f"Usuário {user_id} tentou gerar URL para arquivo {file_id} sem permissão"
            )
            raise not_found_exception("Arquivo não encontrado")

        # Gerar URL
        download_url = await self.storage_manager.generate_download_url(
            category=db_file.category,
            stored_name=db_file.stored_name,
        )

        # Definir expiração (1 hora)
        expires_at = datetime.utcnow() + timedelta(hours=1)

        logger.info(f"URL de download gerada para arquivo {file_id}")
        return {
            "download_url": download_url,
            "expires_at": expires_at,
        }
