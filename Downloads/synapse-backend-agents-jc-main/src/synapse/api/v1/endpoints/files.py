"""
Endpoints para gerenciamento de arquivos
Criado por José - um desenvolvedor Full Stack
API completa para upload, download, listagem e gerenciamento de arquivos
Este módulo implementa os endpoints da API para upload, download,
listagem e gerenciamento de arquivos com segurança e eficiência.
"""

import logging
from typing import Optional, Dict, Any
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from synapse.core.config.constants import FILE_CATEGORIES
from synapse.api.deps import get_current_user
from synapse.database import get_db
from synapse.middlewares.rate_limiting import rate_limit
from synapse.schemas.file import (
    FileDownloadResponse,
    FileListResponse,
    FileResponse,
    FileUploadResponse,
)
from synapse.services.file_service import FileService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/files", tags=["Files"])


@router.post("/upload", response_model=FileUploadResponse, summary="Upload de arquivo", tags=["Files"])
async def upload_file(
    category: str = Form(..., description="Categoria do arquivo"),
    file: UploadFile = File(..., description="Arquivo a ser enviado"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _rate_limit=Depends(rate_limit),
) -> FileUploadResponse:
    """
    Realiza o upload de um arquivo para o servidor.

    ## Função
    Este endpoint permite enviar arquivos para o servidor, categorizando-os
    para facilitar a organização e recuperação posterior.

    ## Quando Usar
    - Quando precisar armazenar arquivos no servidor
    - Para enviar documentos, imagens ou outros tipos de arquivos
    - Quando precisar associar arquivos a categorias específicas

    ## Parâmetros Importantes
    - **category**: Categoria do arquivo (ex: "imagem", "documento", "audio")
    - **file**: O arquivo a ser enviado

    ## Resultado Esperado
    Retorna um objeto JSON contendo:
    - ID único do arquivo enviado
    - Nome original do arquivo
    - Tamanho em bytes
    - Tipo MIME
    - URL para download
    - Timestamp de upload
    - Categoria associada

    ## Exemplo de Uso
    ```python
    import requests

    url = "https://api.synapscale.com/api/v1/files/upload"
    headers = {"Authorization": "Bearer seu_token"}

    # Preparar o arquivo e categoria
    files = {"file": open("documento.pdf", "rb")}
    data = {"category": "documento"}

    response = requests.post(url, files=files, data=data, headers=headers)
    print(f"Arquivo enviado com ID: {response.json()['id']}")
    ```
    
    Args:
        category: Categoria para classificar o arquivo
        file: Arquivo a ser enviado
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        _rate_limit: Middleware de rate limiting
        
    Returns:
        FileUploadResponse: Resposta com dados do arquivo enviado
        
    Raises:
        HTTPException: 400 se categoria inválida
        HTTPException: 413 se arquivo muito grande
        HTTPException: 415 se tipo de arquivo não suportado
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Iniciando upload de arquivo '{file.filename}' categoria '{category}' para usuário {current_user.id}")
        
        if category not in FILE_CATEGORIES:
            logger.warning(f"Categoria inválida '{category}' fornecida por usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Categoria inválida. Categorias válidas: {', '.join(FILE_CATEGORIES)}",
            )

        # Validações de segurança do arquivo
        if not file.filename:
            logger.warning(f"Nome de arquivo vazio fornecido por usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nome do arquivo é obrigatório",
            )

        # Verificar tamanho do arquivo (limitado pelo FastAPI, mas vamos logar)
        if hasattr(file, 'size') and file.size:
            file_size_mb = file.size / (1024 * 1024)
            logger.info(f"Tamanho do arquivo: {file_size_mb:.2f} MB")
            
            # Limite de 100MB por arquivo
            if file.size > 100 * 1024 * 1024:
                logger.warning(f"Arquivo muito grande ({file_size_mb:.2f} MB) rejeitado para usuário {current_user.id}")
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Arquivo muito grande. Máximo permitido: 100MB",
                )

        file_service = FileService(db)
        result = await file_service.upload_file(file, category, current_user.id)
        
        logger.info(f"Upload concluído com sucesso - arquivo ID: {result.id}, usuário: {current_user.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no upload de arquivo para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor durante upload")


@router.get("/", response_model=FileListResponse, summary="Listar arquivos", tags=["Files"])
async def list_files(
    page: int = Query(1, ge=1, description="Número da página"),
    size: int = Query(10, ge=1, le=100, description="Itens por página"),
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> FileListResponse:
    """
    Lista os arquivos do usuário com paginação e filtro por categoria.

    ## Função
    Este endpoint retorna uma lista paginada dos arquivos do usuário atual,
    com opção de filtrar por categoria específica.

    ## Quando Usar
    - Para visualizar todos os arquivos enviados pelo usuário
    - Quando precisar listar arquivos de uma categoria específica
    - Para implementar uma interface de gerenciamento de arquivos

    ## Parâmetros Importantes
    - **page**: Número da página para paginação (começa em 1)
    - **size**: Quantidade de itens por página (entre 1 e 100)
    - **category**: Filtrar por categoria específica (opcional)

    ## Resultado Esperado
    Retorna um objeto JSON contendo:
    - Lista de arquivos com seus metadados
    - Informações de paginação (página atual, total de páginas)
    - Total de arquivos encontrados

    ## Exemplo de Uso
    ```python
    import requests

    url = "https://api.synapscale.com/api/v1/files/"
    headers = {"Authorization": "Bearer seu_token"}

    # Listar todos os arquivos (primeira página, 10 itens por página)
    response = requests.get(url, headers=headers)

    # Ou filtrar por categoria e página específica
    params = {"category": "imagem", "page": 2, "size": 20}
    response = requests.get(url, params=params, headers=headers)

    for file in response.json()["items"]:
        print(f"{file['filename']} - {file['category']} - {file['size']} bytes")
    ```
    
    Args:
        page: Número da página (1-based)
        size: Número de itens por página
        category: Categoria para filtrar arquivos
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        FileListResponse: Lista paginada de arquivos
        
    Raises:
        HTTPException: 400 se categoria inválida
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Listando arquivos para usuário {current_user.id} - página: {page}, categoria: {category}")
        
        # Validar categoria se fornecida
        if category and category not in FILE_CATEGORIES:
            logger.warning(f"Categoria inválida '{category}' fornecida por usuário {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Categoria inválida. Categorias válidas: {', '.join(FILE_CATEGORIES)}",
            )

        file_service = FileService(db)
        result = await file_service.list_user_files(current_user.id, page, size, category)
        
        logger.info(f"Retornados {len(result.items)} arquivos de {result.total} total para usuário {current_user.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar arquivos para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{file_id}", response_model=FileResponse, summary="Obter arquivo", tags=["Files"])
async def get_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> FileResponse:
    """
    Obtém informações detalhadas sobre um arquivo específico.

    ## Função
    Este endpoint retorna metadados detalhados sobre um arquivo específico,
    identificado pelo seu ID único.

    ## Quando Usar
    - Quando precisar verificar detalhes de um arquivo específico
    - Para obter metadados como tamanho, tipo e data de upload
    - Antes de fazer o download, para verificar se é o arquivo correto

    ## Parâmetros Importantes
    - **file_id**: ID único do arquivo (UUID)

    ## Resultado Esperado
    Retorna um objeto JSON contendo:
    - ID do arquivo
    - Nome original do arquivo
    - Tamanho em bytes
    - Tipo MIME
    - URL para download
    - Timestamp de upload
    - Categoria associada

    ## Exemplo de Uso
    ```python
    import requests

    file_id = "550e8400-e29b-41d4-a716-446655440000"  # Exemplo de UUID
    url = f"https://api.synapscale.com/api/v1/files/{file_id}"
    headers = {"Authorization": "Bearer seu_token"}

    response = requests.get(url, headers=headers)
    file_info = response.json()

    print(f"Nome: {file_info['filename']}")
    print(f"Tipo: {file_info['mime_type']}")
    print(f"Tamanho: {file_info['size']} bytes")
    print(f"URL de download: {file_info['download_url']}")
    ```
    
    Args:
        file_id: ID único do arquivo
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        FileResponse: Dados do arquivo
        
    Raises:
        HTTPException: 404 se arquivo não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Obtendo arquivo {file_id} para usuário {current_user.id}")
        
        file_service = FileService(db)
        result = await file_service.get_file(file_id, current_user.id)
        
        logger.info(f"Arquivo {file_id} obtido com sucesso para usuário {current_user.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter arquivo {file_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{file_id}/download", response_model=FileDownloadResponse, summary="Download de arquivo", tags=["Files", "Download"])
async def download_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> FileDownloadResponse:
    """
    Gera um link de download para um arquivo específico.

    ## Função
    Este endpoint gera um URL temporário para download direto de um arquivo,
    identificado pelo seu ID único.

    ## Quando Usar
    - Quando precisar baixar um arquivo específico
    - Para compartilhar um link de download temporário
    - Para implementar funcionalidade de download em uma interface

    ## Parâmetros Importantes
    - **file_id**: ID único do arquivo (UUID)

    ## Resultado Esperado
    Retorna um objeto JSON contendo:
    - URL de download direto para o arquivo
    - Tempo de expiração do link (se aplicável)
    - Informações básicas do arquivo (nome, tipo, tamanho)

    ## Exemplo de Uso
    ```python
    import requests
    import webbrowser

    file_id = "550e8400-e29b-41d4-a716-446655440000"  # Exemplo de UUID
    url = f"https://api.synapscale.com/api/v1/files/{file_id}/download"
    headers = {"Authorization": "Bearer seu_token"}

    response = requests.get(url, headers=headers)
    download_url = response.json()["download_url"]

    # Abrir o link de download no navegador
    webbrowser.open(download_url)

    # Ou baixar diretamente
    file_content = requests.get(download_url).content
    with open(response.json()["filename"], "wb") as f:
        f.write(file_content)
    ```
    
    Args:
        file_id: ID único do arquivo
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        FileDownloadResponse: URL de download e metadados
        
    Raises:
        HTTPException: 404 se arquivo não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Gerando link de download para arquivo {file_id} - usuário {current_user.id}")
        
        file_service = FileService(db)
        result = await file_service.download_file(file_id, current_user.id)
        
        logger.info(f"Link de download gerado para arquivo {file_id} - usuário {current_user.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar download para arquivo {file_id} - usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/{file_id}", summary="Deletar arquivo", tags=["Files"])
async def delete_file(
    file_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> Dict[str, str]:
    """
    Remove permanentemente um arquivo do servidor.

    ## Função
    Este endpoint exclui um arquivo específico do servidor, identificado pelo seu ID único.
    A operação é permanente e não pode ser desfeita.

    ## Quando Usar
    - Quando precisar remover arquivos desnecessários
    - Para liberar espaço de armazenamento
    - Para implementar funcionalidade de exclusão em uma interface de gerenciamento

    ## Parâmetros Importantes
    - **file_id**: ID único do arquivo (UUID)

    ## Resultado Esperado
    Retorna um objeto JSON contendo:
    - Mensagem de confirmação da exclusão

    ## Exemplo de Uso
    ```python
    import requests

    file_id = "550e8400-e29b-41d4-a716-446655440000"  # Exemplo de UUID
    url = f"https://api.synapscale.com/api/v1/files/{file_id}"
    headers = {"Authorization": "Bearer seu_token"}

    response = requests.delete(url, headers=headers)

    if response.status_code == 200:
        print("Arquivo excluído com sucesso!")
    else:
        print(f"Erro ao excluir arquivo: {response.json()['detail']}")
    ```
    
    Args:
        file_id: ID único do arquivo
        db: Sessão do banco de dados
        current_user: Usuário autenticado
        
    Returns:
        Dict[str, str]: Mensagem de confirmação
        
    Raises:
        HTTPException: 404 se arquivo não encontrado
        HTTPException: 403 se não for o proprietário
        HTTPException: 500 se erro interno do servidor
    """
    try:
        logger.info(f"Deletando arquivo {file_id} para usuário {current_user.id}")
        
        file_service = FileService(db)
        await file_service.delete_file(file_id, current_user.id)
        
        logger.info(f"Arquivo {file_id} deletado com sucesso para usuário {current_user.id}")
        return {"message": "Arquivo deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar arquivo {file_id} para usuário {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
