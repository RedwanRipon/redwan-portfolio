"""Contact form — visitor submits a message, admin reads it later."""
from datetime import datetime

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Session

from app.db import get_session
from app.models import ContactMessage
from app.rate_limit import check_rate_limit, client_ip


router = APIRouter(prefix="/contact", tags=["contact"])


# ---- Pydantic I/O ---------------------------------------------------------

class ContactCreate(BaseModel):
    """Body of POST /contact."""

    name: str = Field(..., min_length=1, max_length=80)
    email: EmailStr = Field(..., max_length=200)
    subject: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=5000)


class ContactSubmitted(BaseModel):
    """Tiny response — id + timestamp so the client can confirm."""

    id: int
    created_at: datetime


# ---- Route ----------------------------------------------------------------

@router.post("", response_model=ContactSubmitted, status_code=201)
def submit_contact(
    body: ContactCreate,
    request: Request,
    session: Session = Depends(get_session),
) -> ContactMessage:
    """Save a new contact message. Aggressive rate limit because
    spammers love contact forms — 3 per IP per 5 minutes."""
    ip = client_ip(request)
    check_rate_limit("contact", ip, max_calls=3, window_seconds=300)

    msg = ContactMessage(
        name=body.name.strip(),
        email=str(body.email).strip().lower(),
        subject=body.subject.strip(),
        body=body.body.strip(),
        submitter_ip=ip,
    )
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return msg
