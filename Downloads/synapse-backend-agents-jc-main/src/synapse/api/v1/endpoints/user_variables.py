"""
Endpoints para gerenciamento de variáveis do usuário
Criado por José - um desenvolvedor Full Stack
API REST completa para sistema de variáveis personalizado
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status, File, UploadFile
from sqlalchemy.orm import Session

from synapse.database import get_db
from synapse.api.deps import get_current_user
from synapse.models.user import User
from synapse.schemas.user_variable import (
    UserVariableCreate,
    UserVariableUpdate,
    UserVariableResponse,
    UserVariableWithValue,
    UserVariableList,
    UserVariableBulkCreate,
    UserVariableBulkUpdate,
    UserVariableImport,
    UserVariableExport,
    UserVariableStats,
    UserVariableValidation,
    UserVariableBulkValidation,
)
from synapse.services.variable_service import VariableService

router = APIRouter(prefix="/variables", tags=["User Variables"])


@router.get(
    "/",
    response_model=UserVariableList,
    summary="Listar variáveis do usuário",
    response_description="Lista de variáveis do usuário retornada com sucesso",
    tags=["User Variables"],
)
async def get_user_variables(
    skip: int = Query(0, ge=0, description="Número de registros para pular (paginação)"),
    limit: int = Query(100, ge=1, le=500, description="Número máximo de registros por página (paginação)"),
    search: str | None = Query(None, description="Buscar por chave ou descrição da variável"),
    category: str | None = Query(None, description="Filtrar por categoria da variável"),
    is_active: bool | None = Query(None, description="Filtrar por status ativo/inativo"),
    sort_by: str = Query("key", description="Campo para ordenação (ex: key, created_at, updated_at)"),
    sort_order: str = Query(
        "asc", pattern="^(asc|desc)$", description="Ordem de classificação: ascendente ou descendente"
    ),
    include_values: bool = Query(False, description="Incluir valores das variáveis na resposta"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserVariableList:
    """
    Lista todas as variáveis do usuário autenticado, com filtros, busca e paginação.

    - **skip**: Quantos registros pular (para paginação)
    - **limit**: Quantos registros retornar (máximo 500)
    - **search**: Termo para buscar por chave ou descrição
    - **category**: Filtrar por categoria
    - **is_active**: Filtrar por status ativo/inativo
    - **sort_by**: Campo para ordenação
    - **sort_order**: Ordem de classificação (asc/desc)
    - **include_values**: Se deve incluir os valores das variáveis na resposta

    Exemplo de resposta:
    ```json
    {
      "variables": [
        {
          "id": 1,
          "key": "API_KEY",
          "description": "Chave da API",
          "category": "CONFIG",
          "is_active": true,
          "is_sensitive": true,
          ...
        }
      ],
      "total": 1,
      "categories": ["CONFIG", "SECRET"]
    }
    ```
    """
    variables, total = VariableService.get_variables(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        search=search,
        category=category,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    # Converter para response models
    if include_values:
        variable_responses = [
            UserVariableWithValue(
                **var.to_dict(include_value=True),
                is_sensitive=var.is_sensitive(),
            )
            for var in variables
        ]
    else:
        variable_responses = [
            UserVariableResponse(
                **var.to_dict(include_value=False),
                is_sensitive=var.is_sensitive(),
            )
            for var in variables
        ]
    # Obter categorias disponíveis
    categories = VariableService.get_available_categories(db, current_user.id)
    # Logging de auditoria
    if search or category or is_active is not None:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Usuário {current_user.id} buscou variáveis com filtros: search={search}, category={category}, is_active={is_active}")
    return UserVariableList(
        variables=variable_responses,
        total=total,
        categories=categories,
    )


@router.get("/{variable_id}", response_model=UserVariableWithValue)
async def get_variable(
    variable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Obtém uma variável específica pelo ID
    """
    variable = VariableService.get_variable_by_id(db, variable_id, current_user.id)

    return UserVariableWithValue(
        **variable.to_dict(include_value=True),
        is_sensitive=variable.is_sensitive(),
    )


@router.get(
    "/key/{key}",
    response_model=UserVariableWithValue,
    summary="Obter variável do usuário por chave",
    response_description="Variável retornada com sucesso",
    tags=["User Variables"],
)
async def get_variable_by_key(
    key: str = Path(..., description="Chave da variável a ser consultada"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserVariableWithValue:
    """
    Obtém uma variável específica do usuário autenticado pela chave.

    - **key**: Chave da variável

    Exemplo de resposta:
    ```json
    {
      "id": 1,
      "key": "API_KEY",
      "description": "Chave da API",
      "category": "CONFIG",
      "is_active": true,
      "is_sensitive": true,
      ...
    }
    ```
    """
    variable = VariableService.get_variable_by_key(db, key, current_user.id)
    if not variable:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Usuário {current_user.id} tentou acessar variável inexistente por chave: {key}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Variável com chave '{key}' não encontrada",
        )
    return UserVariableWithValue(
        **variable.to_dict(include_value=True),
        is_sensitive=variable.is_sensitive(),
    )


@router.post(
    "/",
    response_model=UserVariableResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar nova variável do usuário",
    response_description="Variável criada com sucesso",
    tags=["User Variables"],
)
async def create_variable(
    variable_data: UserVariableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserVariableResponse:
    """
    Cria uma nova variável para o usuário autenticado.

    Corpo de requisição:
    ```json
    {
      "key": "API_KEY",
      "value": "123456",
      "description": "Chave da API",
      "category": "CONFIG",
      "is_active": true
    }
    ```

    Exemplo de resposta:
    ```json
    {
      "id": 1,
      "key": "API_KEY",
      "description": "Chave da API",
      "category": "CONFIG",
      "is_active": true,
      "is_sensitive": true,
      ...
    }
    ```
    """
    variable = VariableService.create_variable(db, current_user.id, variable_data)
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Usuário {current_user.id} criou variável: {variable_data.key}")
    return UserVariableResponse(
        **variable.to_dict(include_value=False),
        is_sensitive=variable.is_sensitive(),
    )


@router.put(
    "/{variable_id}",
    response_model=UserVariableResponse,
    summary="Atualizar variável do usuário",
    response_description="Variável atualizada com sucesso",
    tags=["User Variables"],
)
async def update_variable(
    variable_id: int = Path(..., description="ID da variável a ser atualizada"),
    variable_data: UserVariableUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserVariableResponse:
    """
    Atualiza uma variável existente do usuário autenticado.

    - **variable_id**: ID da variável

    Corpo de requisição:
    ```json
    {
      "value": "novo_valor",
      "description": "Nova descrição",
      "category": "SECRET",
      "is_active": false
    }
    ```

    Exemplo de resposta:
    ```json
    {
      "id": 1,
      "key": "API_KEY",
      "description": "Nova descrição",
      "category": "SECRET",
      "is_active": false,
      "is_sensitive": true,
      ...
    }
    ```
    """
    variable = VariableService.update_variable(
        db, variable_id, current_user.id, variable_data
    )
    if not variable:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Usuário {current_user.id} tentou atualizar variável inexistente: {variable_id}")
        raise HTTPException(status_code=404, detail="Variável não encontrada")
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Usuário {current_user.id} atualizou variável: {variable_id}")
    return UserVariableResponse(
        **variable.to_dict(include_value=False),
        is_sensitive=variable.is_sensitive(),
    )


@router.delete(
    "/{variable_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remover variável do usuário",
    response_description="Variável removida com sucesso",
    tags=["User Variables"],
)
async def delete_variable(
    variable_id: int = Path(..., description="ID da variável a ser removida"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove uma variável do usuário autenticado pelo ID.

    - **variable_id**: ID da variável
    """
    VariableService.delete_variable(db, variable_id, current_user.id)
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Usuário {current_user.id} removeu variável: {variable_id}")


@router.post(
    "/bulk",
    response_model=list[UserVariableResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Criar múltiplas variáveis em lote",
    response_description="Variáveis criadas em lote com sucesso",
    tags=["User Variables"],
)
async def bulk_create_variables(
    variables_data: UserVariableBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[UserVariableResponse]:
    """
    Cria múltiplas variáveis para o usuário autenticado em uma única requisição.
    """
    variables = VariableService.bulk_create_variables(
        db,
        current_user.id,
        variables_data.variables,
    )
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Usuário {current_user.id} criou {len(variables)} variáveis em lote.")
    return [
        UserVariableResponse(
            **var.to_dict(include_value=False),
            is_sensitive=var.is_sensitive(),
        )
        for var in variables
    ]


@router.put(
    "/bulk",
    response_model=dict[int, UserVariableResponse],
    summary="Atualizar múltiplas variáveis em lote",
    response_description="Variáveis atualizadas em lote com sucesso",
    tags=["User Variables"],
)
async def bulk_update_variables(
    updates_data: UserVariableBulkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[int, UserVariableResponse]:
    """
    Atualiza múltiplas variáveis do usuário autenticado em uma única requisição.
    """
    updated = VariableService.bulk_update_variables(
        db, current_user.id, updates_data.updates
    )
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Usuário {current_user.id} atualizou {len(updated)} variáveis em lote.")
    return {
        var.id: UserVariableResponse(
            **var.to_dict(include_value=False),
            is_sensitive=var.is_sensitive(),
        )
        for var in updated
    }


@router.delete(
    "/bulk",
    response_model=dict[str, int],
    summary="Remover múltiplas variáveis em lote",
    response_description="Variáveis removidas em lote com sucesso",
    tags=["User Variables"],
)
async def bulk_delete_variables(
    variable_ids: list[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, int]:
    """
    Remove múltiplas variáveis do usuário autenticado em uma única requisição.
    """
    count = VariableService.bulk_delete_variables(db, current_user.id, variable_ids)
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Usuário {current_user.id} removeu {count} variáveis em lote.")
    return {"removed": count}


@router.post(
    "/import",
    response_model=Dict[str, Any],
    summary="Importar variáveis via JSON",
    response_description="Variáveis importadas com sucesso",
    tags=["User Variables"],
)
async def import_variables(
    import_data: UserVariableImport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Importa variáveis do usuário autenticado a partir de um JSON.
    """
    result = VariableService.import_variables(db, current_user.id, import_data)
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Usuário {current_user.id} importou variáveis via JSON.")
    return result


@router.post(
    "/import/file",
    response_model=Dict[str, Any],
    summary="Importar variáveis via arquivo .env",
    response_description="Variáveis importadas de arquivo com sucesso",
    tags=["User Variables"],
)
async def import_variables_from_file(
    file: UploadFile = File(..., description="Arquivo .env para importar"),
    overwrite_existing: bool = Query(
        False, description="Sobrescrever variáveis existentes"
    ),
    default_category: str | None = Query("CONFIG", description="Categoria padrão"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Importa variáveis do usuário autenticado a partir de um arquivo .env.
    """
    result = VariableService.import_variables_from_file(
        db, current_user.id, file, overwrite_existing, default_category
    )
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Usuário {current_user.id} importou variáveis via arquivo .env.")
    return result


@router.post(
    "/export",
    response_model=Dict[str, Any],
    summary="Exportar variáveis do usuário",
    response_description="Variáveis exportadas com sucesso",
    tags=["User Variables"],
)
async def export_variables(
    export_data: UserVariableExport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Exporta variáveis do usuário autenticado para JSON ou .env.
    """
    result = VariableService.export_variables(db, current_user.id, export_data)
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Usuário {current_user.id} exportou variáveis.")
    return result


@router.get(
    "/stats/summary",
    response_model=UserVariableStats,
    summary="Obter estatísticas das variáveis do usuário",
    response_description="Estatísticas retornadas com sucesso",
    tags=["User Variables"],
)
async def get_variables_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserVariableStats:
    """
    Obtém estatísticas das variáveis do usuário autenticado.
    """
    stats = VariableService.get_variables_stats(db, current_user.id)
    return stats


@router.post(
    "/validate",
    response_model=UserVariableValidation,
    summary="Validar chave de variável",
    response_description="Validação de chave realizada com sucesso",
    tags=["User Variables"],
)
async def validate_variable_key(
    key: str = Query(..., description="Chave da variável para validar"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserVariableValidation:
    """
    Valida se a chave de variável é válida e disponível para o usuário autenticado.
    """
    return VariableService.validate_variable_key(db, current_user.id, key)


@router.post(
    "/validate/bulk",
    response_model=UserVariableBulkValidation,
    summary="Validar múltiplas chaves de variáveis",
    response_description="Validação em lote realizada com sucesso",
    tags=["User Variables"],
)
async def validate_variable_keys_bulk(
    keys: list[str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserVariableBulkValidation:
    """
    Valida múltiplas chaves de variáveis para o usuário autenticado.
    """
    return VariableService.validate_variable_keys_bulk(db, current_user.id, keys)


@router.get(
    "/categories/list",
    response_model=list[str],
    summary="Listar categorias de variáveis disponíveis",
    response_description="Categorias listadas com sucesso",
    tags=["User Variables"],
)
async def get_available_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[str]:
    """
    Lista todas as categorias de variáveis disponíveis para o usuário autenticado.
    """
    return VariableService.get_available_categories(db, current_user.id)


@router.get(
    "/env/dict",
    response_model=dict[str, str],
    summary="Obter variáveis do usuário como dicionário",
    response_description="Variáveis retornadas como dicionário",
    tags=["User Variables"],
)
async def get_env_dict(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    Retorna todas as variáveis do usuário autenticado como um dicionário.
    """
    return VariableService.get_env_dict(db, current_user.id)


@router.get(
    "/env/string",
    response_model=dict[str, str],
    summary="Obter variáveis do usuário como string .env",
    response_description="Variáveis retornadas como string .env",
    tags=["User Variables"],
)
async def get_env_string(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    Retorna todas as variáveis do usuário autenticado como uma string no formato .env.
    """
    return VariableService.get_env_string(db, current_user.id)


# Endpoints para uso interno (workflows)
@router.get(
    "/internal/env-dict/{user_id}",
    response_model=dict[str, str],
    include_in_schema=False,
)
async def get_user_env_dict_internal(
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Endpoint interno para obter variáveis de um usuário específico
    Usado pelo sistema de execução de workflows
    """
    return VariableService.get_user_env_dict(db, user_id)


@router.get("/internal/categories", response_model=list[str], include_in_schema=False)
async def get_all_categories_internal(
    db: Session = Depends(get_db),
):
    """
    Endpoint interno para obter todas as categorias do sistema
    """
    from ..models.user_variable import UserVariable

    categories = (
        db.query(UserVariable.category)
        .filter(
            UserVariable.category.isnot(None),
        )
        .distinct()
        .all()
    )

    return [c[0] for c in categories if c[0]]
