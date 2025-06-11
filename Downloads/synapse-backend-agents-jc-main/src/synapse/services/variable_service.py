"""
Serviço para gerenciamento de variáveis do usuário
Criado por José - um desenvolvedor Full Stack
Implementa operações CRUD e utilitários para variáveis personalizadas
"""

from typing import List, Dict, Optional, Tuple, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime
import re
import os
import json
import yaml
import logging

from synapse.models.user_variable import UserVariable
from synapse.schemas.user_variable import (
    UserVariableCreate,
    UserVariableUpdate,
    UserVariableImport,
    UserVariableExport,
    UserVariableStats,
    UserVariableValidation,
)
from synapse.exceptions import NotFoundException, ForbiddenException, BadRequestException

logger = logging.getLogger(__name__)


class VariableService:
    """
    Serviço para gerenciamento de variáveis do usuário
    Implementa operações CRUD e utilitários para variáveis personalizadas
    """

    @staticmethod
    def get_variables(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        is_active: Optional[bool] = None,
        sort_by: str = "key",
        sort_order: str = "asc",
    ) -> Tuple[List[UserVariable], int]:
        """
        Obtém variáveis do usuário com filtros e paginação
        """
        query = db.query(UserVariable).filter(UserVariable.user_id == user_id)

        # Aplicar filtros
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    UserVariable.key.ilike(search_term),
                    UserVariable.description.ilike(search_term),
                ),
            )

        if category:
            query = query.filter(UserVariable.category == category.upper())

        if is_active is not None:
            query = query.filter(UserVariable.is_active == is_active)

        # Contar total antes de aplicar paginação
        total = query.count()

        # Aplicar ordenação
        if sort_by == "key":
            order_column = UserVariable.key
        elif sort_by == "created_at":
            order_column = UserVariable.created_at
        elif sort_by == "updated_at":
            order_column = UserVariable.updated_at
        elif sort_by == "category":
            order_column = UserVariable.category
        else:
            order_column = UserVariable.key

        if sort_order.lower() == "desc":
            order_column = order_column.desc()
        else:
            order_column = order_column.asc()

        query = query.order_by(order_column)

        # Aplicar paginação
        variables = query.offset(skip).limit(limit).all()

        return variables, total

    @staticmethod
    def get_variable_by_id(db: Session, variable_id: int, user_id: int) -> UserVariable:
        """
        Obtém uma variável específica pelo ID
        """
        variable = (
            db.query(UserVariable)
            .filter(
                UserVariable.id == variable_id,
                UserVariable.user_id == user_id,
            )
            .first()
        )

        if not variable:
            raise NotFoundException(f"Variável com ID {variable_id} não encontrada")

        return variable

    @staticmethod
    def get_variable_by_key(db: Session, key: str, user_id: int) -> Optional[UserVariable]:
        """
        Obtém uma variável específica pela chave
        """
        return (
            db.query(UserVariable)
            .filter(
                UserVariable.key == key.upper(),
                UserVariable.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def create_variable(
        db: Session,
        user_id: int,
        variable_data: UserVariableCreate,
    ) -> UserVariable:
        """
        Cria uma nova variável para o usuário
        """
        # Verificar se já existe uma variável com a mesma chave
        existing = VariableService.get_variable_by_key(db, variable_data.key, user_id)
        if existing:
            raise BadRequestException(
                f"Já existe uma variável com a chave '{variable_data.key}'"
            )

        # Criar nova variável
        variable = UserVariable.create_variable(
            user_id=user_id,
            key=variable_data.key,
            value=variable_data.value,
            description=variable_data.description,
            category=variable_data.category,
            is_encrypted=variable_data.is_encrypted,
        )

        db.add(variable)
        db.commit()
        db.refresh(variable)

        logger.info(f"Variável '{variable.key}' criada para usuário {user_id}")
        return variable

    @staticmethod
    def update_variable(
        db: Session,
        variable_id: int,
        user_id: int,
        variable_data: UserVariableUpdate,
    ) -> UserVariable:
        """
        Atualiza uma variável existente
        """
        variable = VariableService.get_variable_by_id(db, variable_id, user_id)

        # Atualizar campos
        if variable_data.value is not None:
            variable.set_encrypted_value(variable_data.value)

        if variable_data.description is not None:
            variable.description = variable_data.description

        if variable_data.category is not None:
            variable.category = variable_data.category

        if variable_data.is_active is not None:
            variable.is_active = variable_data.is_active

        db.commit()
        db.refresh(variable)

        logger.info(f"Variável '{variable.key}' atualizada para usuário {user_id}")
        return variable

    @staticmethod
    def delete_variable(db: Session, variable_id: int, user_id: int) -> bool:
        """
        Remove uma variável do usuário
        """
        variable = VariableService.get_variable_by_id(db, variable_id, user_id)

        db.delete(variable)
        db.commit()

        logger.info(f"Variável '{variable.key}' removida para usuário {user_id}")
        return True

    @staticmethod
    def bulk_create_variables(
        db: Session,
        user_id: int,
        variables_data: List[UserVariableCreate],
    ) -> List[UserVariable]:
        """
        Cria múltiplas variáveis em lote
        """
        if len(variables_data) > 50:
            raise BadRequestException("Máximo de 50 variáveis por operação em lote")

        # Verificar chaves duplicadas no lote
        keys = [v.key.upper() for v in variables_data]
        if len(keys) != len(set(keys)):
            raise BadRequestException("Existem chaves duplicadas no lote")

        # Verificar chaves existentes no banco
        existing_keys = (
            db.query(UserVariable.key)
            .filter(
                UserVariable.user_id == user_id,
                UserVariable.key.in_(keys),
            )
            .all()
        )

        if existing_keys:
            existing = [k[0] for k in existing_keys]
            raise BadRequestException(
                f"Já existem variáveis com as chaves: {', '.join(existing)}"
            )

        # Criar variáveis
        variables = []
        for data in variables_data:
            variable = UserVariable.create_variable(
                user_id=user_id,
                key=data.key,
                value=data.value,
                description=data.description,
                category=data.category,
                is_encrypted=data.is_encrypted,
            )
            db.add(variable)
            variables.append(variable)

        db.commit()
        for v in variables:
            db.refresh(v)

        logger.info(
            f"{len(variables)} variáveis criadas em lote para usuário {user_id}"
        )
        return variables

    @staticmethod
    def bulk_update_variables(
        db: Session,
        user_id: int,
        updates: dict[int, UserVariableUpdate],
    ) -> dict[int, UserVariable]:
        """
        Atualiza múltiplas variáveis em lote
        """
        if len(updates) > 50:
            raise BadRequestException("Máximo de 50 variáveis por operação em lote")

        result = {}
        for variable_id, data in updates.items():
            try:
                variable = VariableService.update_variable(
                    db, variable_id, user_id, data
                )
                result[variable_id] = variable
            except Exception as e:
                logger.error(f"Erro ao atualizar variável {variable_id}: {str(e)}")
                # Continuar com as outras atualizações

        logger.info(
            f"{len(result)} variáveis atualizadas em lote para usuário {user_id}"
        )
        return result

    @staticmethod
    def bulk_delete_variables(
        db: Session,
        user_id: int,
        variable_ids: list[int],
    ) -> int:
        """
        Remove múltiplas variáveis em lote
        """
        if len(variable_ids) > 50:
            raise BadRequestException("Máximo de 50 variáveis por operação em lote")

        result = (
            db.query(UserVariable)
            .filter(
                UserVariable.id.in_(variable_ids),
                UserVariable.user_id == user_id,
            )
            .delete(synchronize_session=False)
        )

        db.commit()

        logger.info(f"{result} variáveis removidas em lote para usuário {user_id}")
        return result

    @staticmethod
    def import_from_env(
        db: Session,
        user_id: int,
        import_data: UserVariableImport,
    ) -> dict[str, Any]:
        """
        Importa variáveis de um arquivo .env
        """
        env_content = import_data.env_content.strip()
        lines = env_content.split("\n")

        variables_to_create = []
        variables_to_update = []
        skipped = []

        # Processar cada linha
        for line in lines:
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            if "=" not in line:
                skipped.append(line)
                continue

            key, value = line.split("=", 1)
            key = key.strip().upper()
            value = value.strip()

            # Remover aspas do valor se existirem
            if (value.startswith('"') and value.endswith('"')) or (
                value.startswith("'") and value.endswith("'")
            ):
                value = value[1:-1]

            # Verificar se a variável já existe
            existing = VariableService.get_variable_by_key(db, key, user_id)

            if existing:
                if import_data.overwrite_existing:
                    existing.set_encrypted_value(value)
                    variables_to_update.append(existing)
                else:
                    skipped.append(key)
            else:
                # Criar nova variável
                variable = UserVariable.create_variable(
                    user_id=user_id,
                    key=key,
                    value=value,
                    description=f"Importado de arquivo .env",
                    category=import_data.default_category,
                    is_encrypted=True,
                )
                variables_to_create.append(variable)

        # Salvar no banco
        db.add_all(variables_to_create)
        db.commit()

        # Atualizar variáveis existentes
        for v in variables_to_create:
            db.refresh(v)

        logger.info(
            f"Importação de variáveis para usuário {user_id}: "
            f"{len(variables_to_create)} criadas, {len(variables_to_update)} atualizadas, "
            f"{len(skipped)} ignoradas",
        )

        return {
            "created": len(variables_to_create),
            "updated": len(variables_to_update),
            "skipped": len(skipped),
            "total_processed": len(variables_to_create)
            + len(variables_to_update)
            + len(skipped),
        }

    @staticmethod
    def export_variables(
        db: Session,
        user_id: int,
        export_data: UserVariableExport,
    ) -> dict[str, Any]:
        """
        Exporta variáveis do usuário em diferentes formatos
        """
        # Buscar variáveis
        query = db.query(UserVariable).filter(
            UserVariable.user_id == user_id,
            UserVariable.is_active == True,
        )

        # Filtrar por categorias se especificado
        if export_data.categories:
            query = query.filter(
                UserVariable.category.in_([c.upper() for c in export_data.categories])
            )

        # Filtrar variáveis sensíveis se não incluídas
        if not export_data.include_sensitive:
            query = query.filter(
                ~UserVariable.key.like("%KEY%"),
                ~UserVariable.key.like("%SECRET%"),
                ~UserVariable.key.like("%TOKEN%"),
                ~UserVariable.key.like("%PASSWORD%"),
                ~UserVariable.key.like("%PASS%"),
                ~UserVariable.key.like("%AUTH%"),
                ~UserVariable.key.like("%CREDENTIAL%"),
                ~UserVariable.key.like("%PRIVATE%"),
            )

        variables = query.order_by(UserVariable.key).all()

        # Exportar no formato solicitado
        if export_data.format == "env":
            content = "\n".join([v.to_env_format() for v in variables])
            return {
                "format": "env",
                "content": content,
                "variables_count": len(variables),
            }

        elif export_data.format == "json":
            data = {}
            for v in variables:
                data[v.key] = v.get_decrypted_value()

            content = json.dumps(data, indent=2)
            return {
                "format": "json",
                "content": content,
                "variables_count": len(variables),
            }

        elif export_data.format == "yaml":
            data = {}
            for v in variables:
                data[v.key] = v.get_decrypted_value()

            content = yaml.dump(data, default_flow_style=False)
            return {
                "format": "yaml",
                "content": content,
                "variables_count": len(variables),
            }

        else:
            raise BadRequestException(
                f"Formato de exportação não suportado: {export_data.format}"
            )

    @staticmethod
    def get_stats(db: Session, user_id: int) -> UserVariableStats:
        """
        Obtém estatísticas das variáveis do usuário
        """
        # Total de variáveis
        total = (
            db.query(func.count(UserVariable.id))
            .filter(
                UserVariable.user_id == user_id,
            )
            .scalar()
            or 0
        )

        # Variáveis ativas
        active = (
            db.query(func.count(UserVariable.id))
            .filter(
                UserVariable.user_id == user_id,
                UserVariable.is_active == True,
            )
            .scalar()
            or 0
        )

        # Variáveis inativas
        inactive = total - active

        # Variáveis sensíveis
        sensitive_query = db.query(func.count(UserVariable.id)).filter(
            UserVariable.user_id == user_id,
            or_(
                UserVariable.key.like("%KEY%"),
                UserVariable.key.like("%SECRET%"),
                UserVariable.key.like("%TOKEN%"),
                UserVariable.key.like("%PASSWORD%"),
                UserVariable.key.like("%PASS%"),
                UserVariable.key.like("%AUTH%"),
                UserVariable.key.like("%CREDENTIAL%"),
                UserVariable.key.like("%PRIVATE%"),
            ),
        )
        sensitive = sensitive_query.scalar() or 0

        # Contagem por categoria
        categories_count = {}
        categories = (
            db.query(
                UserVariable.category,
                func.count(UserVariable.id),
            )
            .filter(
                UserVariable.user_id == user_id,
            )
            .group_by(
                UserVariable.category,
            )
            .all()
        )

        for category, count in categories:
            categories_count[category or "UNCATEGORIZED"] = count

        # Última atualização
        last_updated = (
            db.query(
                func.max(UserVariable.updated_at),
            )
            .filter(
                UserVariable.user_id == user_id,
            )
            .scalar()
        )

        return UserVariableStats(
            total_variables=total,
            active_variables=active,
            inactive_variables=inactive,
            sensitive_variables=sensitive,
            categories_count=categories_count,
            last_updated=last_updated,
        )

    @staticmethod
    def validate_variable(key: str) -> UserVariableValidation:
        """
        Valida uma chave de variável
        """
        validation = UserVariableValidation(
            key=key,
            is_valid=True,
            errors=[],
            warnings=[],
            suggestions=[],
        )

        # Converter para maiúsculo
        key = key.upper()
        validation.key = key

        # Verificar formato
        pattern = r"^[A-Z][A-Z0-9_]*$"
        if not re.match(pattern, key):
            validation.is_valid = False
            validation.errors.append(
                "Chave deve seguir o formato de variável de ambiente: "
                "começar com letra maiúscula, seguido de letras, números ou underscore",
            )

            # Sugerir correção
            suggested_key = re.sub(r"[^A-Z0-9_]", "_", key.upper())
            if suggested_key and suggested_key[0].isdigit():
                suggested_key = "VAR_" + suggested_key

            validation.suggestions.append(suggested_key)

        # Verificar palavras reservadas
        reserved_words = [
            "PATH",
            "HOME",
            "USER",
            "SHELL",
            "PWD",
            "LANG",
            "LC_ALL",
            "PYTHONPATH",
            "VIRTUAL_ENV",
            "NODE_ENV",
            "PORT",
        ]
        if key in reserved_words:
            validation.is_valid = False
            validation.errors.append(f"'{key}' é uma palavra reservada do sistema")
            validation.suggestions.append(f"CUSTOM_{key}")

        # Verificar tamanho
        if len(key) > 255:
            validation.is_valid = False
            validation.errors.append("Chave muito longa (máximo 255 caracteres)")

        # Verificar se é sensível
        sensitive_keywords = [
            "KEY",
            "SECRET",
            "TOKEN",
            "PASSWORD",
            "PASS",
            "AUTH",
            "CREDENTIAL",
            "PRIVATE",
            "API_KEY",
            "ACCESS_TOKEN",
        ]
        if any(keyword in key for keyword in sensitive_keywords):
            validation.warnings.append(
                "Esta variável parece conter dados sensíveis e será criptografada",
            )

        # Verificar convenções
        if "_" not in key and len(key) > 3:
            validation.warnings.append(
                "Recomendado usar underscore para separar palavras (ex: API_KEY)",
            )

        return validation

    @staticmethod
    def get_user_env_dict(db: Session, user_id: int) -> dict[str, str]:
        """
        Retorna todas as variáveis ativas do usuário como dicionário
        Usado para injetar variáveis em execuções de workflows
        """
        return UserVariable.get_user_env_dict(user_id, db)

    @staticmethod
    def get_user_env_string(db: Session, user_id: int) -> str:
        """
        Retorna todas as variáveis ativas do usuário como string .env
        """
        return UserVariable.get_user_env_string(user_id, db)

    @staticmethod
    def get_available_categories(db: Session, user_id: int) -> list[str]:
        """
        Retorna todas as categorias usadas pelo usuário
        """
        categories = (
            db.query(UserVariable.category)
            .filter(
                UserVariable.user_id == user_id,
                UserVariable.category.isnot(None),
            )
            .distinct()
            .all()
        )

        return [c[0] for c in categories if c[0]]
