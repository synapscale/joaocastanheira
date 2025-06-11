"""
Aplicação principal otimizada do SynapScale Backend
Criado por José - um desenvolvedor Full Stack
Implementa todas as melhores práticas de FastAPI, segurança e performance
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from synapse.core.config import settings
from .core.database_new import (
    test_database_connection,
    get_database_info,
    init_database,
)
from .api.v1.router import api_router
from synapse.middlewares.rate_limiting import rate_limit

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        (
            logging.FileHandler(settings.LOG_FILE)
            if settings.LOG_FILE
            else logging.StreamHandler()
        ),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    logger.info("🚀 Starting Synapse Backend...")

    # Check database connection
    if not test_database_connection():
        raise Exception("Failed to connect to database")

    # Initialize database
    if not init_database():
        raise Exception("Failed to initialize database")

    # Create upload directory
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)

    # Create logs directory
    if settings.LOG_FILE:
        os.makedirs(os.path.dirname(settings.LOG_FILE), exist_ok=True)

    logger.info("✅ Backend started successfully")

    yield

    # Shutdown
    logger.info("🛑 Shutting down Synapse Backend...")


# Create FastAPI application
app = FastAPI(
    title="Synapse Backend Agents JC",
    description="Backend for AI automation platform",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Security middleware
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.get_trusted_hosts(),
    )

# Include API routers
app.include_router(api_router, prefix="/api/v1")


# Health checks
@app.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
    }


@app.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check"""
    db_info = get_database_info()

    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
        "database": {
            "connected": db_info is not None,
            "schema": settings.DATABASE_SCHEMA,
            "tables": db_info["table_count"] if db_info else 0,
        },
        "llm_providers": {
            "openai": bool(settings.OPENAI_API_KEY),
            "anthropic": bool(settings.ANTHROPIC_API_KEY),
            "google": bool(settings.GOOGLE_API_KEY),
            "groq": bool(settings.GROQ_API_KEY),
        },
        "features": {
            "file_upload": True,
            "websocket": True,
            "analytics": True,
        },
    }


@app.get("/health/db")
async def database_health_check():
    """Database specific health check"""
    if test_database_connection():
        db_info = get_database_info()
        return {
            "status": "healthy",
            "database": db_info,
        }
    else:
        raise HTTPException(status_code=503, detail="Database connection failed")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Synapse Backend Agents JC",
        "version": "1.0.0",
        "docs": (
            "/docs" if settings.DEBUG else "Documentation available only in development"
        ),
    }


@app.middleware('http')
async def rate_limit_middleware(request, call_next):
    # Limite padrão: 100 requisições por 60 segundos
    return await rate_limit(max_requests=100, window_seconds=60)(call_next)(request)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
