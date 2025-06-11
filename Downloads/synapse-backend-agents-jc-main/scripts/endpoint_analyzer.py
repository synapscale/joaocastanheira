#!/usr/bin/env python3
"""
Script de Análise Avançada de Endpoints - SynapScale Backend

Este script analisa todos os endpoints do backend, calculando métricas
de complexidade, performance e sugerindo otimizações específicas.

Autor: Sistema de Otimização SynapScale
Versão: 1.0.0
Data: Dezembro 2024
"""

import os
import ast
import time
import json
import logging
import statistics
from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path
from dataclasses import dataclass, asdict
from collections import defaultdict

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class EndpointMetrics:
    """Métricas de um endpoint específico."""
    name: str
    file_path: str
    line_count: int
    complexity_score: int
    parameters_count: int
    dependencies_count: int
    docstring_quality: float
    error_handling_score: float
    async_operations: int
    database_operations: int
    cache_usage: bool
    logging_usage: bool
    validation_score: float
    security_score: float


@dataclass
class FileAnalysis:
    """Análise completa de um arquivo de endpoint."""
    file_path: str
    file_size_kb: float
    total_lines: int
    total_endpoints: int
    complexity_average: float
    maintainability_index: float
    endpoints: List[EndpointMetrics]
    recommendations: List[str]


class EndpointAnalyzer:
    """Analisador avançado de endpoints."""
    
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.endpoints_path = self.base_path / "src" / "synapse" / "api" / "v1" / "endpoints"
        self.analysis_results = []
        
    def analyze_all_endpoints(self) -> Dict[str, Any]:
        """
        Analisa todos os arquivos de endpoints.
        
        Returns:
            Dict com resultados completos da análise
        """
        logger.info("🔍 Iniciando análise completa dos endpoints...")
        start_time = time.time()
        
        # Arquivos para análise
        endpoint_files = list(self.endpoints_path.glob("*.py"))
        endpoint_files = [f for f in endpoint_files if f.name != "__init__.py"]
        
        logger.info(f"📁 Encontrados {len(endpoint_files)} arquivos para análise")
        
        analysis_summary = {
            "total_files": len(endpoint_files),
            "analysis_date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "files": [],
            "overall_metrics": {},
            "recommendations": [],
            "priority_issues": []
        }
        
        # Analisar cada arquivo
        for file_path in endpoint_files:
            try:
                logger.info(f"📊 Analisando {file_path.name}...")
                file_analysis = self._analyze_file(file_path)
                analysis_summary["files"].append(asdict(file_analysis))
                self.analysis_results.append(file_analysis)
            except Exception as e:
                logger.error(f"❌ Erro ao analisar {file_path.name}: {str(e)}")
        
        # Calcular métricas gerais
        analysis_summary["overall_metrics"] = self._calculate_overall_metrics()
        analysis_summary["recommendations"] = self._generate_global_recommendations()
        analysis_summary["priority_issues"] = self._identify_priority_issues()
        
        analysis_time = time.time() - start_time
        logger.info(f"✅ Análise concluída em {analysis_time:.2f} segundos")
        
        return analysis_summary
    
    def _analyze_file(self, file_path: Path) -> FileAnalysis:
        """
        Analisa um arquivo específico de endpoint.
        
        Args:
            file_path: Caminho para o arquivo
            
        Returns:
            FileAnalysis com métricas do arquivo
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
        
        # Métricas básicas do arquivo
        file_size_kb = file_path.stat().st_size / 1024
        total_lines = len(lines)
        
        # Parse AST para análise estrutural
        try:
            tree = ast.parse(content)
        except SyntaxError as e:
            logger.warning(f"⚠️ Erro de sintaxe em {file_path.name}: {str(e)}")
            return self._create_empty_analysis(file_path)
        
        # Analisar endpoints
        endpoints = self._extract_endpoints(tree, file_path, content)
        
        # Calcular métricas do arquivo
        complexity_scores = [ep.complexity_score for ep in endpoints if ep.complexity_score > 0]
        complexity_average = statistics.mean(complexity_scores) if complexity_scores else 0
        
        maintainability_index = self._calculate_maintainability_index(
            total_lines, complexity_average, len(endpoints)
        )
        
        # Gerar recomendações específicas
        recommendations = self._generate_file_recommendations(
            file_path, file_size_kb, total_lines, len(endpoints), complexity_average
        )
        
        return FileAnalysis(
            file_path=str(file_path),
            file_size_kb=file_size_kb,
            total_lines=total_lines,
            total_endpoints=len(endpoints),
            complexity_average=complexity_average,
            maintainability_index=maintainability_index,
            endpoints=endpoints,
            recommendations=recommendations
        )
    
    def _extract_endpoints(self, tree: ast.AST, file_path: Path, content: str) -> List[EndpointMetrics]:
        """
        Extrai e analisa endpoints do AST.
        
        Args:
            tree: AST do arquivo
            file_path: Caminho do arquivo
            content: Conteúdo do arquivo
            
        Returns:
            Lista de métricas dos endpoints
        """
        endpoints = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Verifica se é um endpoint (tem decorador de rota)
                if self._is_endpoint_function(node):
                    metrics = self._analyze_endpoint_function(node, file_path, content)
                    endpoints.append(metrics)
        
        return endpoints
    
    def _is_endpoint_function(self, func_node: ast.FunctionDef) -> bool:
        """
        Verifica se uma função é um endpoint da API.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            True se for um endpoint
        """
        route_decorators = ['router.get', 'router.post', 'router.put', 'router.delete', 'router.patch']
        
        for decorator in func_node.decorator_list:
            if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute):
                decorator_name = f"{decorator.func.value.id}.{decorator.func.attr}"
                if decorator_name in route_decorators:
                    return True
        
        return False
    
    def _analyze_endpoint_function(self, func_node: ast.FunctionDef, file_path: Path, content: str) -> EndpointMetrics:
        """
        Analisa uma função de endpoint específica.
        
        Args:
            func_node: Nó AST da função
            file_path: Caminho do arquivo
            content: Conteúdo do arquivo
            
        Returns:
            EndpointMetrics com métricas da função
        """
        # Contar linhas da função
        func_lines = func_node.end_lineno - func_node.lineno + 1
        
        # Calcular complexidade ciclomática
        complexity = self._calculate_cyclomatic_complexity(func_node)
        
        # Contar parâmetros
        params_count = len(func_node.args.args)
        
        # Analisar dependências
        dependencies = self._count_dependencies(func_node)
        
        # Qualidade da docstring
        docstring_quality = self._analyze_docstring_quality(func_node)
        
        # Tratamento de erros
        error_handling = self._analyze_error_handling(func_node)
        
        # Operações assíncronas
        async_ops = self._count_async_operations(func_node)
        
        # Operações de banco de dados
        db_ops = self._count_database_operations(func_node)
        
        # Uso de cache
        cache_usage = self._has_cache_usage(func_node)
        
        # Uso de logging
        logging_usage = self._has_logging_usage(func_node)
        
        # Score de validação
        validation_score = self._analyze_validation(func_node)
        
        # Score de segurança
        security_score = self._analyze_security(func_node)
        
        return EndpointMetrics(
            name=func_node.name,
            file_path=str(file_path),
            line_count=func_lines,
            complexity_score=complexity,
            parameters_count=params_count,
            dependencies_count=dependencies,
            docstring_quality=docstring_quality,
            error_handling_score=error_handling,
            async_operations=async_ops,
            database_operations=db_ops,
            cache_usage=cache_usage,
            logging_usage=logging_usage,
            validation_score=validation_score,
            security_score=security_score
        )
    
    def _calculate_cyclomatic_complexity(self, node: ast.AST) -> int:
        """
        Calcula a complexidade ciclomática de uma função.
        
        Args:
            node: Nó AST da função
            
        Returns:
            Score de complexidade ciclomática
        """
        complexity = 1  # Base complexity
        
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.Try, ast.With)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
            elif isinstance(child, ast.ExceptHandler):
                complexity += 1
        
        return complexity
    
    def _count_dependencies(self, func_node: ast.FunctionDef) -> int:
        """
        Conta o número de dependências de uma função.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            Número de dependências
        """
        dependencies = set()
        
        # Dependências nos parâmetros (Depends)
        for arg in func_node.args.args:
            if hasattr(arg, 'annotation') and arg.annotation:
                if isinstance(arg.annotation, ast.Call):
                    if hasattr(arg.annotation.func, 'id') and arg.annotation.func.id == 'Depends':
                        dependencies.add('depends')
        
        # Imports e calls dentro da função
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call):
                if hasattr(node.func, 'id'):
                    dependencies.add(node.func.id)
                elif hasattr(node.func, 'attr'):
                    dependencies.add(node.func.attr)
        
        return len(dependencies)
    
    def _analyze_docstring_quality(self, func_node: ast.FunctionDef) -> float:
        """
        Analisa a qualidade da docstring de uma função.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            Score de qualidade (0.0 a 1.0)
        """
        docstring = ast.get_docstring(func_node)
        if not docstring:
            return 0.0
        
        quality_score = 0.0
        
        # Presença de docstring
        quality_score += 0.2
        
        # Tamanho adequado
        if len(docstring) > 50:
            quality_score += 0.2
        
        # Seções estruturadas
        sections = ['Args:', 'Returns:', 'Raises:']
        for section in sections:
            if section in docstring:
                quality_score += 0.2
        
        return min(quality_score, 1.0)
    
    def _analyze_error_handling(self, func_node: ast.FunctionDef) -> float:
        """
        Analisa a qualidade do tratamento de erros.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            Score de tratamento de erros (0.0 a 1.0)
        """
        error_score = 0.0
        
        # Presença de try/except
        has_try_except = False
        exception_types = set()
        
        for node in ast.walk(func_node):
            if isinstance(node, ast.Try):
                has_try_except = True
                error_score += 0.3
                
                # Tipos específicos de exceção
                for handler in node.handlers:
                    if handler.type:
                        exception_types.add('specific')
                    else:
                        exception_types.add('generic')
        
        # HTTPException usage
        for node in ast.walk(func_node):
            if isinstance(node, ast.Raise):
                if isinstance(node.exc, ast.Call) and hasattr(node.exc.func, 'id'):
                    if node.exc.func.id == 'HTTPException':
                        error_score += 0.4
        
        # Logging de erros
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call):
                if hasattr(node.func, 'attr') and 'error' in node.func.attr:
                    error_score += 0.3
        
        return min(error_score, 1.0)
    
    def _count_async_operations(self, func_node: ast.FunctionDef) -> int:
        """
        Conta operações assíncronas na função.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            Número de operações assíncronas
        """
        async_count = 0
        
        for node in ast.walk(func_node):
            if isinstance(node, ast.Await):
                async_count += 1
        
        return async_count
    
    def _count_database_operations(self, func_node: ast.FunctionDef) -> int:
        """
        Conta operações de banco de dados.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            Número de operações de BD
        """
        db_ops = 0
        db_keywords = ['query', 'filter', 'add', 'commit', 'rollback', 'execute']
        
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call):
                if hasattr(node.func, 'attr') and node.func.attr in db_keywords:
                    db_ops += 1
        
        return db_ops
    
    def _has_cache_usage(self, func_node: ast.FunctionDef) -> bool:
        """
        Verifica se a função usa cache.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            True se usa cache
        """
        cache_keywords = ['cache', 'cached', 'redis']
        
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call):
                if hasattr(node.func, 'id') and any(kw in node.func.id.lower() for kw in cache_keywords):
                    return True
                if hasattr(node.func, 'attr') and any(kw in node.func.attr.lower() for kw in cache_keywords):
                    return True
        
        return False
    
    def _has_logging_usage(self, func_node: ast.FunctionDef) -> bool:
        """
        Verifica se a função usa logging.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            True se usa logging
        """
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call):
                if hasattr(node.func, 'value') and hasattr(node.func.value, 'id'):
                    if node.func.value.id == 'logger':
                        return True
        
        return False
    
    def _analyze_validation(self, func_node: ast.FunctionDef) -> float:
        """
        Analisa a qualidade da validação de entrada.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            Score de validação (0.0 a 1.0)
        """
        validation_score = 0.0
        
        # Pydantic models nos parâmetros
        for arg in func_node.args.args:
            if hasattr(arg, 'annotation') and arg.annotation:
                validation_score += 0.2
        
        # Query parameter validation
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call) and hasattr(node.func, 'id'):
                if node.func.id == 'Query':
                    validation_score += 0.3
        
        # Manual validation checks
        for node in ast.walk(func_node):
            if isinstance(node, ast.If):
                validation_score += 0.1
        
        return min(validation_score, 1.0)
    
    def _analyze_security(self, func_node: ast.FunctionDef) -> float:
        """
        Analisa aspectos de segurança da função.
        
        Args:
            func_node: Nó AST da função
            
        Returns:
            Score de segurança (0.0 a 1.0)
        """
        security_score = 0.0
        
        # Autenticação obrigatória
        for arg in func_node.args.args:
            if 'current_user' in arg.arg:
                security_score += 0.4
        
        # Rate limiting
        for decorator in func_node.decorator_list:
            if isinstance(decorator, ast.Call):
                if hasattr(decorator.func, 'attr') and 'limit' in decorator.func.attr.lower():
                    security_score += 0.3
        
        # Input sanitization
        sanitization_funcs = ['escape', 'sanitize', 'validate']
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call) and hasattr(node.func, 'id'):
                if any(sf in node.func.id.lower() for sf in sanitization_funcs):
                    security_score += 0.3
        
        return min(security_score, 1.0)
    
    def _calculate_maintainability_index(self, lines: int, complexity: float, endpoints: int) -> float:
        """
        Calcula o índice de manutenibilidade de um arquivo.
        
        Args:
            lines: Número de linhas
            complexity: Complexidade média
            endpoints: Número de endpoints
            
        Returns:
            Índice de manutenibilidade (0-100)
        """
        # Fórmula adaptada do Maintainability Index
        if lines == 0 or complexity == 0:
            return 100.0
        
        volume = lines * (endpoints + 1)
        mi = max(0, (171 - 5.2 * (volume ** 0.23) - 0.23 * complexity - 16.2 * (lines ** 0.5)) * 100 / 171)
        return round(mi, 2)
    
    def _generate_file_recommendations(self, file_path: Path, size_kb: float, lines: int, 
                                     endpoints: int, complexity: float) -> List[str]:
        """
        Gera recomendações específicas para um arquivo.
        
        Args:
            file_path: Caminho do arquivo
            size_kb: Tamanho em KB
            lines: Número de linhas
            endpoints: Número de endpoints
            complexity: Complexidade média
            
        Returns:
            Lista de recomendações
        """
        recommendations = []
        
        # Tamanho do arquivo
        if size_kb > 50:
            recommendations.append(f"📏 Arquivo muito grande ({size_kb:.1f}KB). Considere modularizar.")
        
        # Número de linhas
        if lines > 1000:
            recommendations.append(f"📄 Muitas linhas ({lines}). Divida em módulos menores.")
        
        # Número de endpoints
        if endpoints > 15:
            recommendations.append(f"🔗 Muitos endpoints ({endpoints}). Considere separar por domínio.")
        
        # Complexidade
        if complexity > 10:
            recommendations.append(f"🧠 Complexidade alta ({complexity:.1f}). Simplifique a lógica.")
        elif complexity > 7:
            recommendations.append(f"⚠️ Complexidade moderada ({complexity:.1f}). Monitor para melhorias.")
        
        # Recomendações específicas por arquivo
        file_name = file_path.name
        if file_name == "analytics.py" and size_kb > 70:
            recommendations.append("📊 Analytics: Separar em módulos (events, metrics, reports, dashboards)")
        
        if file_name == "templates.py" and endpoints > 12:
            recommendations.append("📋 Templates: Separar marketplace, reviews e collections")
        
        if file_name == "executions.py":
            recommendations.append("⚡ Executions: Implementar cache Redis para performance")
        
        return recommendations
    
    def _calculate_overall_metrics(self) -> Dict[str, Any]:
        """
        Calcula métricas gerais do projeto.
        
        Returns:
            Dict com métricas agregadas
        """
        if not self.analysis_results:
            return {}
        
        total_files = len(self.analysis_results)
        total_endpoints = sum(f.total_endpoints for f in self.analysis_results)
        total_lines = sum(f.total_lines for f in self.analysis_results)
        total_size_kb = sum(f.file_size_kb for f in self.analysis_results)
        
        complexities = [f.complexity_average for f in self.analysis_results if f.complexity_average > 0]
        avg_complexity = statistics.mean(complexities) if complexities else 0
        
        maintainability_scores = [f.maintainability_index for f in self.analysis_results]
        avg_maintainability = statistics.mean(maintainability_scores) if maintainability_scores else 0
        
        # Estatísticas de endpoints
        all_endpoints = []
        for file_analysis in self.analysis_results:
            all_endpoints.extend(file_analysis.endpoints)
        
        endpoint_complexities = [ep.complexity_score for ep in all_endpoints if ep.complexity_score > 0]
        endpoint_lines = [ep.line_count for ep in all_endpoints if ep.line_count > 0]
        
        return {
            "total_files": total_files,
            "total_endpoints": total_endpoints,
            "total_lines": total_lines,
            "total_size_kb": round(total_size_kb, 2),
            "average_complexity": round(avg_complexity, 2),
            "average_maintainability": round(avg_maintainability, 2),
            "endpoint_stats": {
                "average_complexity": round(statistics.mean(endpoint_complexities), 2) if endpoint_complexities else 0,
                "max_complexity": max(endpoint_complexities) if endpoint_complexities else 0,
                "average_lines": round(statistics.mean(endpoint_lines), 2) if endpoint_lines else 0,
                "max_lines": max(endpoint_lines) if endpoint_lines else 0
            },
            "files_needing_attention": [
                f.file_path for f in self.analysis_results 
                if f.file_size_kb > 50 or f.complexity_average > 8 or f.maintainability_index < 60
            ]
        }
    
    def _generate_global_recommendations(self) -> List[str]:
        """
        Gera recomendações globais para o projeto.
        
        Returns:
            Lista de recomendações prioritárias
        """
        recommendations = []
        
        # Analisar arquivos grandes
        large_files = [f for f in self.analysis_results if f.file_size_kb > 50]
        if large_files:
            recommendations.append(
                f"🗂️ Modularizar {len(large_files)} arquivo(s) grande(s): " +
                ", ".join([Path(f.file_path).name for f in large_files])
            )
        
        # Analisar complexidade alta
        complex_files = [f for f in self.analysis_results if f.complexity_average > 8]
        if complex_files:
            recommendations.append(
                f"🧠 Reduzir complexidade em {len(complex_files)} arquivo(s): " +
                ", ".join([Path(f.file_path).name for f in complex_files])
            )
        
        # Cache implementation
        recommendations.append("🚀 Implementar cache Redis para endpoints de analytics e métricas")
        
        # Database optimization
        recommendations.append("🗄️ Adicionar índices específicos para queries frequentes")
        
        # Monitoring
        recommendations.append("📊 Implementar Prometheus metrics para monitoramento")
        
        return recommendations
    
    def _identify_priority_issues(self) -> List[Dict[str, Any]]:
        """
        Identifica issues de alta prioridade.
        
        Returns:
            Lista de issues críticos
        """
        issues = []
        
        for file_analysis in self.analysis_results:
            file_name = Path(file_analysis.file_path).name
            
            # Issue de tamanho
            if file_analysis.file_size_kb > 70:
                issues.append({
                    "type": "size",
                    "severity": "high",
                    "file": file_name,
                    "description": f"Arquivo muito grande ({file_analysis.file_size_kb:.1f}KB)",
                    "recommendation": "Modularizar por domínio de negócio"
                })
            
            # Issue de complexidade
            if file_analysis.complexity_average > 10:
                issues.append({
                    "type": "complexity",
                    "severity": "high", 
                    "file": file_name,
                    "description": f"Complexidade muito alta ({file_analysis.complexity_average:.1f})",
                    "recommendation": "Refatorar funções complexas"
                })
            
            # Issue de manutenibilidade
            if file_analysis.maintainability_index < 50:
                issues.append({
                    "type": "maintainability",
                    "severity": "medium",
                    "file": file_name,
                    "description": f"Baixa manutenibilidade ({file_analysis.maintainability_index:.1f})",
                    "recommendation": "Melhorar estrutura e documentação"
                })
        
        return sorted(issues, key=lambda x: x["severity"], reverse=True)
    
    def _create_empty_analysis(self, file_path: Path) -> FileAnalysis:
        """
        Cria uma análise vazia para arquivos com erro.
        
        Args:
            file_path: Caminho do arquivo
            
        Returns:
            FileAnalysis vazia
        """
        return FileAnalysis(
            file_path=str(file_path),
            file_size_kb=0.0,
            total_lines=0,
            total_endpoints=0,
            complexity_average=0.0,
            maintainability_index=0.0,
            endpoints=[],
            recommendations=["❌ Erro na análise do arquivo"]
        )


def save_analysis_report(analysis_data: Dict[str, Any], output_file: str = None) -> None:
    """
    Salva o relatório de análise em arquivo.
    
    Args:
        analysis_data: Dados da análise
        output_file: Arquivo de saída (opcional)
    """
    if not output_file:
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        output_file = f"endpoint_analysis_{timestamp}.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"📊 Relatório salvo em: {output_file}")


def print_summary_report(analysis_data: Dict[str, Any]) -> None:
    """
    Exibe um resumo da análise no console.
    
    Args:
        analysis_data: Dados da análise
    """
    print("\n" + "="*80)
    print("🔍 RELATÓRIO DE ANÁLISE DE ENDPOINTS - SYNAPSCALE BACKEND")
    print("="*80)
    
    metrics = analysis_data.get("overall_metrics", {})
    
    print(f"\n📊 MÉTRICAS GERAIS:")
    print(f"   • Total de arquivos analisados: {metrics.get('total_files', 0)}")
    print(f"   • Total de endpoints: {metrics.get('total_endpoints', 0)}")
    print(f"   • Total de linhas: {metrics.get('total_lines', 0):,}")
    print(f"   • Tamanho total: {metrics.get('total_size_kb', 0):.1f} KB")
    print(f"   • Complexidade média: {metrics.get('average_complexity', 0):.2f}")
    print(f"   • Manutenibilidade média: {metrics.get('average_maintainability', 0):.1f}/100")
    
    endpoint_stats = metrics.get('endpoint_stats', {})
    print(f"\n🎯 ESTATÍSTICAS DE ENDPOINTS:")
    print(f"   • Complexidade média: {endpoint_stats.get('average_complexity', 0):.2f}")
    print(f"   • Complexidade máxima: {endpoint_stats.get('max_complexity', 0)}")
    print(f"   • Linhas médias por endpoint: {endpoint_stats.get('average_lines', 0):.1f}")
    print(f"   • Endpoint mais longo: {endpoint_stats.get('max_lines', 0)} linhas")
    
    recommendations = analysis_data.get("recommendations", [])
    if recommendations:
        print(f"\n💡 RECOMENDAÇÕES PRINCIPAIS:")
        for i, rec in enumerate(recommendations[:5], 1):
            print(f"   {i}. {rec}")
    
    priority_issues = analysis_data.get("priority_issues", [])
    if priority_issues:
        print(f"\n🚨 ISSUES PRIORITÁRIOS:")
        for issue in priority_issues[:3]:
            print(f"   • {issue['file']}: {issue['description']}")
            print(f"     → {issue['recommendation']}")
    
    files_attention = metrics.get('files_needing_attention', [])
    if files_attention:
        print(f"\n⚠️ ARQUIVOS QUE PRECISAM DE ATENÇÃO:")
        for file_path in files_attention:
            print(f"   • {Path(file_path).name}")
    
    print("\n" + "="*80)
    print("📋 Análise concluída! Verifique o arquivo JSON para detalhes completos.")
    print("="*80)


def main():
    """Função principal do script."""
    print("🚀 Iniciando análise avançada de endpoints...")
    
    # Diretório base do projeto
    base_dir = Path(__file__).parent.parent
    
    # Criar analisador
    analyzer = EndpointAnalyzer(str(base_dir))
    
    # Executar análise
    analysis_results = analyzer.analyze_all_endpoints()
    
    # Salvar relatório
    save_analysis_report(analysis_results)
    
    # Exibir resumo
    print_summary_report(analysis_results)
    
    print("\n✅ Análise concluída com sucesso!")


if __name__ == "__main__":
    main() 