"""Database engine + session factory.

Single shared SQLAlchemy engine is created at import time and reused
across requests (cached connections, no per-request setup cost).
FastAPI routes get a fresh Session via the get_session() dependency.

Local dev defaults to SQLite (zero setup). Production sets
DATABASE_URL to a Neon Postgres URL via env var.
"""
from typing import Iterator

from sqlmodel import Session, create_engine

from app.config import settings


# pool_pre_ping=True asks Postgres "are you alive?" before reusing a
# stale pooled connection. Cheap, and saves us from intermittent
# 'connection closed' errors after long idle periods on free tiers.
#
# echo=False because we don't want every query in the logs. Flip to
# True locally if you need to debug a SQL issue.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=False,
)


def get_session() -> Iterator[Session]:
    """FastAPI dependency. Yields a Session that auto-closes after the
    request, even if an exception bubbles up.

    Use it in routes like:

        @router.get("/comments")
        def list_comments(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session
