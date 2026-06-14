"""Comments — list + create.

Visitors leave comments under blog/travel posts. Comments are public,
no auth. Rate limit is per IP per minute so a single visitor can't
spam.

Hidden comments (is_hidden=True) are excluded from the GET — admin
can hide a comment without losing it. Deletion lives under /admin.
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlmodel import Session, desc, select

from app.db import get_session
from app.models import POST_TYPES, Comment
from app.rate_limit import check_rate_limit, client_ip


router = APIRouter(prefix="/comments", tags=["comments"])


# ---- Pydantic I/O schemas --------------------------------------------------

class CommentCreate(BaseModel):
    """Body of POST /comments."""

    post_type: str = Field(..., max_length=20)
    post_slug: str = Field(..., min_length=1, max_length=120)
    author_name: str = Field(..., min_length=1, max_length=80)
    text: str = Field(..., min_length=1, max_length=2000)


class CommentRead(BaseModel):
    """Shape returned to clients (omits internal fields like submitter_ip)."""

    id: int
    post_type: str
    post_slug: str
    author_name: str
    text: str
    created_at: datetime


# ---- Routes ---------------------------------------------------------------

@router.get("", response_model=list[CommentRead])
def list_comments(
    type: str = Query(..., description="'blog' or 'travel'"),
    slug: str = Query(..., min_length=1, max_length=120),
    limit: int = Query(50, ge=1, le=200),
    session: Session = Depends(get_session),
) -> list[Comment]:
    """Newest-first list of visible (non-hidden) comments for a post."""
    if type not in POST_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"type must be one of: {', '.join(POST_TYPES)}",
        )

    stmt = (
        select(Comment)
        .where(
            Comment.post_type == type,
            Comment.post_slug == slug,
            Comment.is_hidden == False,  # noqa: E712 — SQLAlchemy needs ==
        )
        .order_by(desc(Comment.created_at))
        .limit(limit)
    )
    return list(session.exec(stmt).all())


@router.post("", response_model=CommentRead, status_code=201)
def create_comment(
    body: CommentCreate,
    request: Request,
    session: Session = Depends(get_session),
) -> Comment:
    """Save a new comment. Rate-limited to 5 per IP per minute."""
    if body.post_type not in POST_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"post_type must be one of: {', '.join(POST_TYPES)}",
        )

    ip = client_ip(request)
    check_rate_limit("comments", ip, max_calls=5, window_seconds=60)

    # Light trimming — the model max_lengths already cap us.
    comment = Comment(
        post_type=body.post_type,
        post_slug=body.post_slug,
        author_name=body.author_name.strip(),
        text=body.text.strip(),
        submitter_ip=ip,
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment
