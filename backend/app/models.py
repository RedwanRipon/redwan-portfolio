"""SQLModel database tables — Phase 4 foundation.

Three tables for Slice 1 (Comments, Reactions, Contact). The richer
content tables (blog posts, travel posts, projects, etc.) land in
Slices 2-4 alongside their migration commits.

SQLModel = Pydantic + SQLAlchemy in one class. Each `table=True`
class is both a Pydantic model (for FastAPI request/response
validation) AND a SQLAlchemy table (for DB queries). One source of
truth, no schema drift between the two.
"""
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    """Timezone-aware now() in UTC. Postgres TIMESTAMP WITH TIME ZONE
    columns need aware datetimes; SQLite tolerates either."""
    return datetime.now(timezone.utc)


# Discriminator for what kind of post a comment / reaction belongs to.
# Matches the slug-prefix the frontend already uses in localStorage.
POST_TYPES = ("blog", "travel")


# ---------------------------------------------------------------------
# Comments
# ---------------------------------------------------------------------

class Comment(SQLModel, table=True):
    """A single comment under a blog or travel post."""

    __tablename__ = "comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    # What kind of post + which post.
    post_type: str = Field(index=True, max_length=20)
    post_slug: str = Field(index=True, max_length=120)

    # Author info.
    author_name: str = Field(max_length=80)
    text: str = Field(max_length=2000)

    # Audit / moderation.
    created_at: datetime = Field(default_factory=_utcnow, index=True)
    # Admin can hide a comment instead of deleting it. Hidden ones are
    # excluded from the public GET but the row stays around.
    is_hidden: bool = Field(default=False, index=True)
    # IP of the submitter — used by simple rate limiting.
    submitter_ip: Optional[str] = Field(default=None, max_length=45)


# ---------------------------------------------------------------------
# Reactions (likes / dislikes)
# ---------------------------------------------------------------------

class Reaction(SQLModel, table=True):
    """One row per (post, browser). The browser identifies itself with
    a UUID generated on first visit, stored in localStorage. Voting
    again UPDATES the row instead of inserting a new one — so the
    counts always reflect 'one vote per browser per post'."""

    __tablename__ = "reactions"

    id: Optional[int] = Field(default=None, primary_key=True)
    post_type: str = Field(index=True, max_length=20)
    post_slug: str = Field(index=True, max_length=120)

    # Anonymous identifier — a UUID v4 from the browser. Not a user
    # account, just a 'who voted'. Indexed for the upsert lookup.
    voter_fingerprint: str = Field(index=True, max_length=64)

    # "like" or "dislike". A separate column instead of a +1/-1 int
    # makes counting cleaner (just GROUP BY vote).
    vote: str = Field(max_length=10)

    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)


# ---------------------------------------------------------------------
# Contact form
# ---------------------------------------------------------------------

class ContactMessage(SQLModel, table=True):
    """A submission from the /#contact form on the home page."""

    __tablename__ = "contact_messages"

    id: Optional[int] = Field(default=None, primary_key=True)

    name: str = Field(max_length=80)
    email: str = Field(max_length=200, index=True)
    subject: str = Field(max_length=200)
    body: str = Field(max_length=5000)

    created_at: datetime = Field(default_factory=_utcnow, index=True)
    # Admin flag — read messages drop to the bottom of the inbox.
    is_read: bool = Field(default=False, index=True)
    submitter_ip: Optional[str] = Field(default=None, max_length=45)
