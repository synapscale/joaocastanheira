"""
Router principal da API v1
Configurado por José - um desenvolvedor Full Stack
Inclui todos os endpoints disponíveis com organização perfeita
"""

from fastapi import APIRouter

# Importar todos os routers de endpoints existentes
from .endpoints.auth import router as auth_router
from .endpoints.files import router as files_router
from .endpoints.llm.routes import router as llm_router
from .endpoints.conversations import router as conversations_router
from .endpoints.workflows import router as workflows_router
from .endpoints.nodes import router as nodes_router
from .endpoints.agents import router as agents_router
from .endpoints.user_variables import router as user_variables_router
from .endpoints.executions import router as executions_router
from .endpoints.templates import router as templates_router
from .endpoints.websockets import router as websockets_router
from .endpoints.marketplace import router as marketplace_router
from .endpoints.workspaces import router as workspaces_router
from .endpoints.analytics import router as analytics_router

# Router principal da API v1
api_router = APIRouter()

# Incluir todos os routers de endpoints com organização lógica
# Autenticação - Base fundamental
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["authentication"],
    responses={401: {"description": "Unauthorized"}},
)

# User Variables - Sistema de variáveis personalizado
api_router.include_router(
    user_variables_router,
    prefix="/user-variables",
    tags=["user-variables"],
    responses={
        401: {"description": "Unauthorized"},
        404: {"description": "Variable not found"},
    },
)

# Workflows - Funcionalidade principal
api_router.include_router(
    workflows_router,
    prefix="/workflows",
    tags=["workflows"],
    responses={
        401: {"description": "Unauthorized"},
        404: {"description": "Workflow not found"},
    },
)

# Executions - Engine de execução de workflows
api_router.include_router(
    executions_router,
    prefix="/executions",
    tags=["executions"],
    responses={
        401: {"description": "Unauthorized"},
        404: {"description": "Execution not found"},
    },
)

# Templates - Marketplace de templates
api_router.include_router(
    templates_router,
    prefix="/templates",
    tags=["templates"],
    responses={
        401: {"description": "Unauthorized"},
        404: {"description": "Template not found"},
    },
)

# Nodes - Componentes dos workflows
api_router.include_router(
    nodes_router,
    prefix="/nodes",
    tags=["nodes"],
    responses={
        401: {"description": "Unauthorized"},
        404: {"description": "Node not found"},
    },
)

# Agents - Agentes de automação
api_router.include_router(
    agents_router,
    prefix="/agents",
    tags=["agents"],
    responses={
        401: {"description": "Unauthorized"},
        404: {"description": "Agent not found"},
    },
)

# LLM - Integração com modelos de linguagem
api_router.include_router(
    llm_router,
    prefix="/llm",
    tags=["llm"],
    responses={
        401: {"description": "Unauthorized"},
        429: {"description": "Rate limit exceeded"},
    },
)

# Conversations - Histórico de conversas
api_router.include_router(
    conversations_router,
    prefix="/conversations",
    tags=["conversations"],
    responses={
        401: {"description": "Unauthorized"},
        404: {"description": "Conversation not found"},
    },
)

# Files - Gerenciamento de arquivos
api_router.include_router(
    files_router,
    prefix="/files",
    tags=["files"],
    responses={
        401: {"description": "Unauthorized"},
        413: {"description": "File too large"},
    },
)

# WebSockets - Comunicação em tempo real
api_router.include_router(
    websockets_router,
    tags=["websockets"],
    responses={
        401: {"description": "Unauthorized"},
        4001: {"description": "Invalid token"},
    },
)

# Marketplace - Sistema de marketplace avançado
api_router.include_router(
    marketplace_router,
    prefix="/marketplace",
    tags=["marketplace"],
    responses={
        401: {"description": "Unauthorized"},
        404: {"description": "Component not found"},
    },
)

# Workspaces - Colaboração em equipe
api_router.include_router(
    workspaces_router,
    prefix="/workspaces",
    tags=["workspaces"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Access denied"},
    },
)

# Analytics - Insights e métricas
api_router.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["analytics"],
    responses={
        401: {"description": "Unauthorized"},
        429: {"description": "Rate limit exceeded"},
    },
)


# Health check endpoint
@api_router.get("/health", tags=["health"])
async def health_check():
    """
    Endpoint de verificação de saúde da API
    Retorna status da aplicação
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "message": "SynapScale API is running perfectly",
        "endpoints": {
            "auth": "Authentication and authorization",
            "user-variables": "User custom variables management",
            "workflows": "Workflow management and execution",
            "executions": "Workflow execution engine and monitoring",
            "templates": "Template marketplace and sharing",
            "nodes": "Node components for workflows",
            "agents": "AI agents and automation",
            "llm": "Language model integrations",
            "conversations": "Conversation history",
            "files": "File management and storage",
            "websockets": "Real-time communication and monitoring",
            "marketplace": "Advanced marketplace for components",
            "workspaces": "Team collaboration and workspaces",
            "analytics": "Analytics, insights and metrics",
        },
    }
