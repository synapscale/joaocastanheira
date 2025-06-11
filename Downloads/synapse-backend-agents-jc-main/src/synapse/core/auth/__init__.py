# /workspaces/synapse-backend-agents-jc/src/synapse/core/auth/__init__.py

from .jwt import (
    require_permission,
    require_role,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user,
    get_current_active_user,
    get_current_verified_user,
)

from .password import (
    get_password_hash,
    verify_password,
)

__all__ = [
    # JWT functions
    "require_permission",
    "require_role",
    "create_access_token",
    "create_refresh_token",
    "verify_token",
    "get_current_user",
    "get_current_active_user",
    "get_current_verified_user",
    # Password functions
    "get_password_hash",
    "verify_password",
]
