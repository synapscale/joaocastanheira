"""
Transform Executor para execução de nós de transformação de dados
Criado por José - um desenvolvedor Full Stack
Executor especializado para transformação, filtragem e manipulação de dados
"""

import json
import time
import re
from typing import Dict, Any, List
from collections.abc import Callable
from datetime import datetime
from jsonpath_ng import parse as jsonpath_parse

from src.synapse.core.executors.base import BaseExecutor, ExecutorType, ExecutionContext
from src.synapse.models.workflow_execution import NodeExecution
from src.synapse.models.node import Node


class TransformType:
    """Tipos de transformação suportados"""

    MAP = "map"
    FILTER = "filter"
    REDUCE = "reduce"
    SORT = "sort"
    GROUP = "group"
    JOIN = "join"
    AGGREGATE = "aggregate"
    EXTRACT = "extract"
    VALIDATE = "validate"
    CONVERT = "convert"
    CUSTOM = "custom"


class DataType:
    """Tipos de dados suportados"""

    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    ARRAY = "array"
    OBJECT = "object"
    DATE = "date"
    NULL = "null"


class TransformExecutor(BaseExecutor):
    """
    Executor especializado para transformação de dados
    Suporta múltiplas operações de transformação e manipulação
    """

    def __init__(self):
        super().__init__(ExecutorType.TRANSFORM)
        self.custom_functions: dict[str, Callable] = {}
        self._register_builtin_functions()

    async def execute(
        self,
        node: Node,
        context: ExecutionContext,
        node_execution: NodeExecution,
    ) -> dict[str, Any]:
        """
        Executa um nó de transformação
        """
        try:
            await self.pre_execute(node, context, node_execution)

            # Parse da configuração do nó
            config = self._parse_node_config(node)

            # Valida configuração
            validation = self.validate_config(config)
            if not validation["is_valid"]:
                return {
                    "success": False,
                    "error": f"Configuração inválida: {', '.join(validation['errors'])}",
                    "output": None,
                }

            # Extrai inputs de nós conectados
            inputs = self.extract_inputs_from_connections(node, context)

            # Obtém os dados para transformação
            data = self._get_input_data(config, context, inputs)

            # Executa a transformação
            result = await self._execute_transformation(config, data, context)

            await self.post_execute(node, context, node_execution, result)
            return result

        except Exception as e:
            return await self.handle_error(node, context, node_execution, e)

    def validate_config(self, config: dict[str, Any]) -> dict[str, Any]:
        """
        Valida a configuração do nó de transformação
        """
        errors = []

        # Validações obrigatórias
        if not config.get("transform_type"):
            errors.append("Tipo de transformação é obrigatório")

        transform_type = config.get("transform_type")

        # Validações específicas por tipo
        if transform_type == TransformType.MAP:
            if not config.get("mapping") and not config.get("expression"):
                errors.append("Mapping ou expression é obrigatório para MAP")

        elif transform_type == TransformType.FILTER:
            if not config.get("condition") and not config.get("expression"):
                errors.append("Condition ou expression é obrigatório para FILTER")

        elif transform_type == TransformType.EXTRACT:
            if not config.get("path") and not config.get("paths"):
                errors.append("Path ou paths é obrigatório para EXTRACT")

        elif transform_type == TransformType.VALIDATE:
            if not config.get("schema") and not config.get("rules"):
                errors.append("Schema ou rules é obrigatório para VALIDATE")

        elif transform_type == TransformType.CONVERT:
            if not config.get("target_type"):
                errors.append("Target type é obrigatório para CONVERT")

        elif transform_type == TransformType.CUSTOM:
            if not config.get("function_name") and not config.get("code"):
                errors.append("Function name ou code é obrigatório para CUSTOM")

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
        }

    def get_supported_node_types(self) -> list[str]:
        """
        Tipos de nós suportados pelo Transform executor
        """
        return ["transform", "map", "filter", "extract", "convert", "validate", "data"]

    def _parse_node_config(self, node: Node) -> dict[str, Any]:
        """
        Parse da configuração do nó
        """
        if isinstance(node.config, dict):
            return node.config
        elif isinstance(node.config, str):
            try:
                return json.loads(node.config)
            except json.JSONDecodeError:
                return {}
        else:
            return {}

    def _get_input_data(
        self,
        config: dict[str, Any],
        context: ExecutionContext,
        inputs: dict[str, Any],
    ) -> Any:
        """
        Obtém os dados de entrada para transformação
        """
        # Prioridade: input específico > primeiro input > dados do contexto
        input_source = config.get("input_source", "auto")

        if input_source == "auto":
            # Usa o primeiro input disponível
            if inputs:
                return list(inputs.values())[0]
            elif context.input_data:
                return context.input_data
            else:
                return None

        elif input_source == "context":
            return context.context_data

        elif input_source == "variables":
            return context.variables

        elif input_source in inputs:
            return inputs[input_source]

        else:
            # Tenta resolver como JSONPath
            try:
                all_data = {
                    **context.variables,
                    **context.input_data,
                    **context.context_data,
                    **inputs,
                }
                return self._extract_jsonpath(all_data, input_source)
            except:
                return None

    async def _execute_transformation(
        self,
        config: dict[str, Any],
        data: Any,
        context: ExecutionContext,
    ) -> dict[str, Any]:
        """
        Executa a transformação baseada no tipo
        """
        transform_type = config["transform_type"]
        start_time = time.time()

        try:
            if transform_type == TransformType.MAP:
                result = self._transform_map(data, config, context)
            elif transform_type == TransformType.FILTER:
                result = self._transform_filter(data, config, context)
            elif transform_type == TransformType.REDUCE:
                result = self._transform_reduce(data, config, context)
            elif transform_type == TransformType.SORT:
                result = self._transform_sort(data, config, context)
            elif transform_type == TransformType.GROUP:
                result = self._transform_group(data, config, context)
            elif transform_type == TransformType.JOIN:
                result = self._transform_join(data, config, context)
            elif transform_type == TransformType.AGGREGATE:
                result = self._transform_aggregate(data, config, context)
            elif transform_type == TransformType.EXTRACT:
                result = self._transform_extract(data, config, context)
            elif transform_type == TransformType.VALIDATE:
                result = self._transform_validate(data, config, context)
            elif transform_type == TransformType.CONVERT:
                result = self._transform_convert(data, config, context)
            elif transform_type == TransformType.CUSTOM:
                result = self._transform_custom(data, config, context)
            else:
                raise ValueError(
                    f"Tipo de transformação não suportado: {transform_type}"
                )

            execution_time = time.time() - start_time

            return {
                "success": True,
                "output": result,
                "execution_time_ms": int(execution_time * 1000),
                "metadata": {
                    "transform_type": transform_type,
                    "input_type": type(data).__name__,
                    "output_type": type(result).__name__,
                    "input_size": len(data) if hasattr(data, "__len__") else 1,
                    "output_size": len(result) if hasattr(result, "__len__") else 1,
                },
            }

        except Exception as e:
            execution_time = time.time() - start_time
            return {
                "success": False,
                "error": str(e),
                "execution_time_ms": int(execution_time * 1000),
                "metadata": {
                    "transform_type": transform_type,
                    "input_type": type(data).__name__,
                },
            }

    def _transform_map(
        self, data: Any, config: dict[str, Any], context: ExecutionContext
    ) -> Any:
        """
        Transformação MAP - aplica uma função a cada elemento
        """
        if not isinstance(data, (list, tuple)):
            data = [data]

        mapping = config.get("mapping", {})
        expression = config.get("expression")

        result = []
        for item in data:
            if expression:
                # Usa expressão personalizada
                transformed = self._evaluate_expression(expression, item, context)
            elif mapping:
                # Usa mapeamento de campos
                transformed = {}
                for target_field, source_path in mapping.items():
                    value = self._extract_value(item, source_path)
                    transformed[target_field] = value
            else:
                transformed = item

            result.append(transformed)

        return result if len(result) > 1 else result[0] if result else None

    def _transform_filter(
        self, data: Any, config: dict[str, Any], context: ExecutionContext
    ) -> Any:
        """
        Transformação FILTER - filtra elementos baseado em condição
        """
        if not isinstance(data, (list, tuple)):
            data = [data]

        condition = config.get("condition")
        expression = config.get("expression")

        result = []
        for item in data:
            if expression:
                # Usa expressão personalizada
                if self._evaluate_expression(expression, item, context):
                    result.append(item)
            elif condition:
                # Usa condição estruturada
                if self._evaluate_condition(condition, item, context):
                    result.append(item)
            else:
                result.append(item)

        return result

    def _transform_extract(
        self, data: Any, config: dict[str, Any], context: ExecutionContext
    ) -> Any:
        """
        Transformação EXTRACT - extrai valores usando JSONPath
        """
        path = config.get("path")
        paths = config.get("paths", {})

        if path:
            # Extrai um único caminho
            return self._extract_jsonpath(data, path)
        elif paths:
            # Extrai múltiplos caminhos
            result = {}
            for key, json_path in paths.items():
                result[key] = self._extract_jsonpath(data, json_path)
            return result
        else:
            return data

    def _transform_convert(
        self, data: Any, config: dict[str, Any], context: ExecutionContext
    ) -> Any:
        """
        Transformação CONVERT - converte tipos de dados
        """
        target_type = config["target_type"]

        if target_type == DataType.STRING:
            return str(data)
        elif target_type == DataType.NUMBER:
            if isinstance(data, str):
                try:
                    return int(data) if data.isdigit() else float(data)
                except ValueError:
                    return 0
            return float(data) if data else 0
        elif target_type == DataType.BOOLEAN:
            if isinstance(data, str):
                return data.lower() in ["true", "1", "yes", "on"]
            return bool(data)
        elif target_type == DataType.ARRAY:
            if isinstance(data, (list, tuple)):
                return list(data)
            return [data]
        elif target_type == DataType.OBJECT:
            if isinstance(data, dict):
                return data
            return {"value": data}
        elif target_type == DataType.DATE:
            if isinstance(data, str):
                try:
                    return datetime.fromisoformat(data.replace("Z", "+00:00"))
                except:
                    return datetime.now()
            return data
        else:
            return data

    def _transform_validate(
        self, data: Any, config: dict[str, Any], context: ExecutionContext
    ) -> dict[str, Any]:
        """
        Transformação VALIDATE - valida dados contra schema ou regras
        """
        schema = config.get("schema")
        rules = config.get("rules", [])

        errors = []
        warnings = []

        # Validação por schema
        if schema:
            schema_errors = self._validate_schema(data, schema)
            errors.extend(schema_errors)

        # Validação por regras
        for rule in rules:
            rule_result = self._validate_rule(data, rule, context)
            if not rule_result["valid"]:
                if rule.get("severity", "error") == "error":
                    errors.append(rule_result["message"])
                else:
                    warnings.append(rule_result["message"])

        return {
            "is_valid": len(errors) == 0,
            "data": data,
            "errors": errors,
            "warnings": warnings,
        }

    def _transform_sort(
        self, data: Any, config: dict[str, Any], context: ExecutionContext
    ) -> Any:
        """
        Transformação SORT - ordena dados
        """
        if not isinstance(data, (list, tuple)):
            return data

        sort_key = config.get("key")
        reverse = config.get("reverse", False)

        if sort_key:
            # Ordena por chave específica
            return sorted(
                data, key=lambda x: self._extract_value(x, sort_key), reverse=reverse
            )
        else:
            # Ordena diretamente
            return sorted(data, reverse=reverse)

    def _transform_group(
        self, data: Any, config: dict[str, Any], context: ExecutionContext
    ) -> dict[str, list]:
        """
        Transformação GROUP - agrupa dados por chave
        """
        if not isinstance(data, (list, tuple)):
            return {"default": [data]}

        group_key = config.get("key")
        if not group_key:
            return {"all": list(data)}

        groups = {}
        for item in data:
            key_value = self._extract_value(item, group_key)
            key_str = str(key_value)

            if key_str not in groups:
                groups[key_str] = []
            groups[key_str].append(item)

        return groups

    def _transform_aggregate(
        self, data: Any, config: dict[str, Any], context: ExecutionContext
    ) -> dict[str, Any]:
        """
        Transformação AGGREGATE - calcula agregações
        """
        if not isinstance(data, (list, tuple)):
            data = [data]

        operations = config.get("operations", ["count"])
        field = config.get("field")

        result = {}

        for operation in operations:
            if operation == "count":
                result["count"] = len(data)
            elif operation == "sum" and field:
                values = [self._extract_value(item, field) for item in data]
                numeric_values = [v for v in values if isinstance(v, (int, float))]
                result["sum"] = sum(numeric_values)
            elif operation == "avg" and field:
                values = [self._extract_value(item, field) for item in data]
                numeric_values = [v for v in values if isinstance(v, (int, float))]
                result["avg"] = (
                    sum(numeric_values) / len(numeric_values) if numeric_values else 0
                )
            elif operation == "min" and field:
                values = [self._extract_value(item, field) for item in data]
                numeric_values = [v for v in values if isinstance(v, (int, float))]
                result["min"] = min(numeric_values) if numeric_values else None
            elif operation == "max" and field:
                values = [self._extract_value(item, field) for item in data]
                numeric_values = [v for v in values if isinstance(v, (int, float))]
                result["max"] = max(numeric_values) if numeric_values else None

        return result

    def _transform_custom(
        self, data: Any, config: dict[str, Any], context: ExecutionContext
    ) -> Any:
        """
        Transformação CUSTOM - executa função personalizada
        """
        function_name = config.get("function_name")
        code = config.get("code")

        if function_name and function_name in self.custom_functions:
            # Usa função registrada
            return self.custom_functions[function_name](data, config, context)
        elif code:
            # Executa código personalizado (com cuidado!)
            local_vars = {
                "data": data,
                "config": config,
                "context": context,
                "json": json,
                "re": re,
                "datetime": datetime,
            }

            try:
                exec(code, {"__builtins__": {}}, local_vars)
                return local_vars.get("result", data)
            except Exception as e:
                raise ValueError(f"Erro na execução do código personalizado: {str(e)}")
        else:
            return data

    def _extract_jsonpath(self, data: Any, path: str) -> Any:
        """
        Extrai valor usando JSONPath
        """
        try:
            jsonpath_expr = jsonpath_parse(path)
            matches = jsonpath_expr.find(data)

            if not matches:
                return None
            elif len(matches) == 1:
                return matches[0].value
            else:
                return [match.value for match in matches]
        except Exception:
            return None

    def _extract_value(self, data: Any, path: str) -> Any:
        """
        Extrai valor usando notação de ponto ou JSONPath
        """
        if not path:
            return data

        # Se começa com $, usa JSONPath
        if path.startswith("$"):
            return self._extract_jsonpath(data, path)

        # Usa notação de ponto simples
        try:
            parts = path.split(".")
            value = data
            for part in parts:
                if part.isdigit() and isinstance(value, (list, tuple)):
                    value = value[int(part)]
                elif isinstance(value, dict):
                    value = value.get(part)
                else:
                    return None
            return value
        except:
            return None

    def _evaluate_expression(
        self, expression: str, data: Any, context: ExecutionContext
    ) -> Any:
        """
        Avalia uma expressão personalizada
        """
        # Substitui variáveis na expressão
        resolved_expr = self.resolve_template_variables(
            expression, context, {"item": data}
        )

        # Contexto seguro para eval
        safe_dict = {
            "item": data,
            "data": data,
            "len": len,
            "str": str,
            "int": int,
            "float": float,
            "bool": bool,
            "abs": abs,
            "min": min,
            "max": max,
            "sum": sum,
            "round": round,
            "json": json,
            "re": re,
        }

        try:
            return eval(resolved_expr, {"__builtins__": {}}, safe_dict)
        except Exception as e:
            self.logger.warning(f"Erro ao avaliar expressão '{expression}': {str(e)}")
            return None

    def _evaluate_condition(
        self, condition: dict[str, Any], data: Any, context: ExecutionContext
    ) -> bool:
        """
        Avalia uma condição estruturada
        """
        field = condition.get("field")
        operator = condition.get("operator", "eq")
        value = condition.get("value")

        # Extrai o valor do campo
        field_value = self._extract_value(data, field) if field else data

        # Avalia baseado no operador
        if operator == "eq":
            return field_value == value
        elif operator == "ne":
            return field_value != value
        elif operator == "gt":
            return field_value > value
        elif operator == "gte":
            return field_value >= value
        elif operator == "lt":
            return field_value < value
        elif operator == "lte":
            return field_value <= value
        elif operator == "in":
            return field_value in value if isinstance(value, (list, tuple)) else False
        elif operator == "contains":
            return (
                value in field_value if hasattr(field_value, "__contains__") else False
            )
        elif operator == "regex":
            return bool(re.search(value, str(field_value)))
        else:
            return False

    def _validate_schema(self, data: Any, schema: dict[str, Any]) -> list[str]:
        """
        Valida dados contra um schema simples
        """
        errors = []

        # Validação de tipo
        expected_type = schema.get("type")
        if expected_type:
            if expected_type == "object" and not isinstance(data, dict):
                errors.append(f"Esperado object, recebido {type(data).__name__}")
            elif expected_type == "array" and not isinstance(data, (list, tuple)):
                errors.append(f"Esperado array, recebido {type(data).__name__}")
            elif expected_type == "string" and not isinstance(data, str):
                errors.append(f"Esperado string, recebido {type(data).__name__}")
            elif expected_type == "number" and not isinstance(data, (int, float)):
                errors.append(f"Esperado number, recebido {type(data).__name__}")

        # Validação de campos obrigatórios
        required = schema.get("required", [])
        if isinstance(data, dict):
            for field in required:
                if field not in data:
                    errors.append(f"Campo obrigatório '{field}' não encontrado")

        return errors

    def _validate_rule(
        self, data: Any, rule: dict[str, Any], context: ExecutionContext
    ) -> dict[str, Any]:
        """
        Valida uma regra específica
        """
        rule_type = rule.get("type", "condition")

        if rule_type == "condition":
            condition = rule.get("condition", {})
            is_valid = self._evaluate_condition(condition, data, context)
            return {
                "valid": is_valid,
                "message": rule.get("message", "Condição não atendida"),
            }
        elif rule_type == "expression":
            expression = rule.get("expression", "True")
            is_valid = bool(self._evaluate_expression(expression, data, context))
            return {
                "valid": is_valid,
                "message": rule.get("message", "Expressão não atendida"),
            }
        else:
            return {"valid": True, "message": ""}

    def _register_builtin_functions(self):
        """
        Registra funções built-in personalizadas
        """

        def clean_text(data, config, context):
            """Remove espaços e caracteres especiais"""
            if isinstance(data, str):
                text = data.strip()
                if config.get("remove_special_chars", False):
                    text = re.sub(r"[^\w\s]", "", text)
                if config.get("lowercase", False):
                    text = text.lower()
                return text
            return data

        def format_date(data, config, context):
            """Formata datas"""
            if isinstance(data, str):
                try:
                    dt = datetime.fromisoformat(data.replace("Z", "+00:00"))
                    format_str = config.get("format", "%Y-%m-%d %H:%M:%S")
                    return dt.strftime(format_str)
                except:
                    return data
            return data

        self.custom_functions.update(
            {
                "clean_text": clean_text,
                "format_date": format_date,
            }
        )

    def register_custom_function(self, name: str, function: Callable):
        """
        Registra uma função personalizada
        """
        self.custom_functions[name] = function
