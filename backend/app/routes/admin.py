"""Admin-only endpoints. Everything except /login requires a valid
Bearer token issued by /login.

Routes:
    POST   /admin/login            issue a session token
    GET    /admin/me               verify a token is still valid
    POST   /admin/logout           no-op (tokens are stateless) — kept
                                   for API symmetry so the frontend can
                                   clear its cookie via a single call.

    GET    /admin/stats            dashboard counts
    GET    /admin/comments         paginated, INCLUDES hidden
    PATCH  /admin/comments/{id}    toggle is_hidden
    DELETE /admin/comments/{id}    hard delete
    GET    /admin/messages         paginated, unread first
    PATCH  /admin/messages/{id}    mark is_read
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlmodel import Session, desc, select
from sqlalchemy import func

from app.auth import create_token, require_admin
from app.config import settings
from app.db import get_session
from app.models import Comment, ContactMessage, Reaction
from app.rate_limit import check_rate_limit, client_ip


router = APIRouter(prefix="/admin", tags=["admin"])


# ===========================================================================
# Session: login / me / logout
# ===========================================================================

class LoginRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=200)


class LoginResponse(BaseModel):
    token: str
    expires_at: datetime


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, request: Request) -> LoginResponse:
    """Trade the admin password for a JWT. Rate-limited so brute
    force is impractical (5 attempts per IP per 5 minutes)."""
    ip = client_ip(request)
    check_rate_limit("admin_login", ip, max_calls=5, window_seconds=300)

    if not settings.admin_password:
        # Misconfiguration: server is missing ADMIN_PASSWORD env var.
        # Return 500 so an admin sees it in logs rather than a 401 that
        # looks like a typo.
        raise HTTPException(
            status_code=500,
            detail="ADMIN_PASSWORD not set on the server.",
        )

    if body.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Invalid password.")

    token, expires_at = create_token()
    return LoginResponse(token=token, expires_at=expires_at)


class MeResponse(BaseModel):
    authenticated: bool
    subject: Optional[str] = None
    expires_at: Optional[datetime] = None


@router.get("/me", response_model=MeResponse)
def me(claims: dict = Depends(require_admin)) -> MeResponse:
    """Echo back identity. Useful for the frontend to check if a
    cookie is still valid before rendering an admin page."""
    exp = claims.get("exp")
    return MeResponse(
        authenticated=True,
        subject=claims.get("sub"),
        expires_at=datetime.fromtimestamp(exp) if exp else None,
    )


@router.post("/logout", status_code=204)
def logout(_: dict = Depends(require_admin)) -> None:
    """Server-side no-op — tokens are stateless. Symmetry only;
    the real logout is the frontend dropping its cookie."""
    return None


# ===========================================================================
# Stats — single dashboard query
# ===========================================================================

class StatsResponse(BaseModel):
    comments_total: int
    comments_hidden: int
    messages_total: int
    messages_unread: int
    reactions_total: int


@router.get("/stats", response_model=StatsResponse)
def stats(
    session: Session = Depends(get_session),
    _: dict = Depends(require_admin),
) -> StatsResponse:
    def count(stmt) -> int:
        return session.exec(stmt).one() or 0

    return StatsResponse(
        comments_total=count(select(func.count(Comment.id))),
        comments_hidden=count(
            select(func.count(Comment.id)).where(Comment.is_hidden == True)  # noqa: E712
        ),
        messages_total=count(select(func.count(ContactMessage.id))),
        messages_unread=count(
            select(func.count(ContactMessage.id)).where(
                ContactMessage.is_read == False  # noqa: E712
            )
        ),
        reactions_total=count(select(func.count(Reaction.id))),
    )


# ===========================================================================
# Comments moderation
# ===========================================================================

class CommentAdminRead(BaseModel):
    id: int
    post_type: str
    post_slug: str
    author_name: str
    text: str
    created_at: datetime
    is_hidden: bool
    submitter_ip: Optional[str]


class CommentUpdate(BaseModel):
    is_hidden: Optional[bool] = None


@router.get("/comments", response_model=list[CommentAdminRead])
def list_all_comments(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    post_type: Optional[str] = Query(None),
    session: Session = Depends(get_session),
    _: dict = Depends(require_admin),
) -> list[Comment]:
    """All comments, newest first. Includes hidden. Optional filter."""
    stmt = select(Comment).order_by(desc(Comment.created_at))
    if post_type:
        stmt = stmt.where(Comment.post_type == post_type)
    stmt = stmt.offset(offset).limit(limit)
    return list(session.exec(stmt).all())


@router.patch("/comments/{comment_id}", response_model=CommentAdminRead)
def update_comment(
    comment_id: int,
    body: CommentUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(require_admin),
) -> Comment:
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found.")
    if body.is_hidden is not None:
        comment.is_hidden = body.is_hidden
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(require_admin),
) -> None:
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found.")
    session.delete(comment)
    session.commit()


# ===========================================================================
# Messages inbox
# ===========================================================================

class MessageAdminRead(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    body: str
    created_at: datetime
    is_read: bool
    submitter_ip: Optional[str]


class MessageUpdate(BaseModel):
    is_read: Optional[bool] = None


@router.get("/messages", response_model=list[MessageAdminRead])
def list_messages(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_session),
    _: dict = Depends(require_admin),
) -> list[ContactMessage]:
    """Inbox view: unread first, then newest first inside each group."""
    stmt = (
        select(ContactMessage)
        .order_by(ContactMessage.is_read.asc(), desc(ContactMessage.created_at))
        .offset(offset)
        .limit(limit)
    )
    return list(session.exec(stmt).all())


@router.patch("/messages/{message_id}", response_model=MessageAdminRead)
def update_message(
    message_id: int,
    body: MessageUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(require_admin),
) -> ContactMessage:
    msg = session.get(ContactMessage, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")
    if body.is_read is not None:
        msg.is_read = body.is_read
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return msg


@router.delete("/messages/{message_id}", status_code=204)
def delete_message(
    message_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(require_admin),
) -> None:
    msg = session.get(ContactMessage, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")
    session.delete(msg)
    session.commit()
