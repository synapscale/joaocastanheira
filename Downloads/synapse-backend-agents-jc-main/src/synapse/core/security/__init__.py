"""
Módulo de segurança do SynapScale
"""

from .file_validation import SecurityValidator, sanitize_filename

__all__ = ["SecurityValidator", "sanitize_filename"]
