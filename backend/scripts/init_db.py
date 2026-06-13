"""CLI: create all database tables.

Run from /backend (with .venv active and DATABASE_URL set):

    python -m scripts.init_db

Safe to re-run. SQLModel's create_all is idempotent — existing
tables are left alone, missing ones get created.

This is intentionally NOT Alembic. For a portfolio at this stage,
create_all + manual schema changes are simpler. We can switch to
Alembic migrations once the schema starts evolving in production.
"""
import sys

from sqlmodel import SQLModel

from app.config import settings
from app.db import engine
from app import models  # noqa: F401 — import to register tables on SQLModel.metadata


def main() -> None:
    print("=== init_db ===")
    print(f"target: {settings.database_url.split('@')[-1] or settings.database_url}")
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as exc:  # noqa: BLE001
        print(f"\nERROR: {exc}", file=sys.stderr)
        sys.exit(1)

    tables = sorted(SQLModel.metadata.tables.keys())
    print(f"OK — {len(tables)} table(s) ensured:")
    for t in tables:
        print(f"  - {t}")


if __name__ == "__main__":
    main()
