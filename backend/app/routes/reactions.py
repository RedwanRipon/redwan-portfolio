"""Reactions — likes / dislikes per (post, browser).

A browser identifies itself with a UUID stored in its own localStorage
(the 'voter_fingerprint'). Voting again UPDATES the existing row so
counts always reflect 'one vote per browser per post'.
"""
from datetime import datetime
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlmodel import Session, select, func

from app.db import get_session
from app.models import POST_TYPES, Reaction
from app.rate_limit import check_rate_limit, client_ip


router = APIRouter(prefix="/reactions", tags=["reactions"])


# ---- Pydantic I/O schemas --------------------------------------------------

VoteValue = Literal["like", "dislike"]


class ReactionCreate(BaseModel):
    """Body of POST /reactions — must include the chosen vote."""

    post_type: str = Field(..., max_length=20)
    post_slug: str = Field(..., min_length=1, max_length=120)
    voter_fingerprint: str = Field(..., min_length=8, max_length=64)
    vote: VoteValue


class ReactionDelete(BaseModel):
    """Body of DELETE /reactions — no `vote` because we're undoing."""

    post_type: str = Field(..., max_length=20)
    post_slug: str = Field(..., min_length=1, max_length=120)
    voter_fingerprint: str = Field(..., min_length=8, max_length=64)


class ReactionCounts(BaseModel):
    """Aggregate counts + this voter's current vote (if any)."""

    likes: int
    dislikes: int
    user_vote: Optional[VoteValue] = None


# ---- Routes ---------------------------------------------------------------

@router.get("/counts", response_model=ReactionCounts)
def get_counts(
    type: str = Query(..., description="'blog' or 'travel'"),
    slug: str = Query(..., min_length=1, max_length=120),
    fingerprint: Optional[str] = Query(
        None,
        description="Optional voter fingerprint. If supplied, "
        "returns this voter's current vote in the response.",
        max_length=64,
    ),
    session: Session = Depends(get_session),
) -> ReactionCounts:
    """Return total like/dislike counts for a post and, if a
    fingerprint is supplied, whether THAT browser already voted."""
    if type not in POST_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"type must be one of: {', '.join(POST_TYPES)}",
        )

    # Single query — group by `vote`, count each side.
    stmt = (
        select(Reaction.vote, func.count(Reaction.id))
        .where(Reaction.post_type == type, Reaction.post_slug == slug)
        .group_by(Reaction.vote)
    )
    counts = {row[0]: row[1] for row in session.exec(stmt).all()}

    user_vote: Optional[VoteValue] = None
    if fingerprint:
        own = session.exec(
            select(Reaction.vote).where(
                Reaction.post_type == type,
                Reaction.post_slug == slug,
                Reaction.voter_fingerprint == fingerprint,
            )
        ).first()
        if own in ("like", "dislike"):
            user_vote = own  # type: ignore[assignment]

    return ReactionCounts(
        likes=counts.get("like", 0),
        dislikes=counts.get("dislike", 0),
        user_vote=user_vote,
    )


@router.post("", response_model=ReactionCounts, status_code=200)
def upsert_reaction(
    body: ReactionCreate,
    request: Request,
    session: Session = Depends(get_session),
) -> ReactionCounts:
    """Record / change a vote. If the voter already voted on this post,
    UPDATE the existing row. Otherwise INSERT a new one. Returns the
    fresh counts for the post so the frontend doesn't need a second
    round trip."""
    if body.post_type not in POST_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"post_type must be one of: {', '.join(POST_TYPES)}",
        )

    ip = client_ip(request)
    # Generous bucket — undoing/redoing votes is normal user behaviour.
    check_rate_limit("reactions", ip, max_calls=30, window_seconds=60)

    # Look for an existing row for (post, voter).
    existing = session.exec(
        select(Reaction).where(
            Reaction.post_type == body.post_type,
            Reaction.post_slug == body.post_slug,
            Reaction.voter_fingerprint == body.voter_fingerprint,
        )
    ).first()

    now = datetime.utcnow()
    if existing:
        existing.vote = body.vote
        existing.updated_at = now
        session.add(existing)
    else:
        session.add(
            Reaction(
                post_type=body.post_type,
                post_slug=body.post_slug,
                voter_fingerprint=body.voter_fingerprint,
                vote=body.vote,
            )
        )
    session.commit()

    # Re-fetch counts so the response is authoritative.
    return get_counts(
        type=body.post_type,
        slug=body.post_slug,
        fingerprint=body.voter_fingerprint,
        session=session,
    )


@router.delete("", response_model=ReactionCounts, status_code=200)
def remove_reaction(
    body: ReactionDelete,
    request: Request,
    session: Session = Depends(get_session),
) -> ReactionCounts:
    """Undo a vote. Same shape as POST for client simplicity, but
    deletes the row and returns the new counts."""
    if body.post_type not in POST_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"post_type must be one of: {', '.join(POST_TYPES)}",
        )

    existing = session.exec(
        select(Reaction).where(
            Reaction.post_type == body.post_type,
            Reaction.post_slug == body.post_slug,
            Reaction.voter_fingerprint == body.voter_fingerprint,
        )
    ).first()
    if existing:
        session.delete(existing)
        session.commit()

    return get_counts(
        type=body.post_type,
        slug=body.post_slug,
        fingerprint=body.voter_fingerprint,
        session=session,
    )
