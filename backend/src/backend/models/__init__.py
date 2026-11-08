"""SQLAlchemy models.

Import model modules here so Alembic can discover metadata.
"""

from backend.db.base import Base

__all__ = ["Base"]
