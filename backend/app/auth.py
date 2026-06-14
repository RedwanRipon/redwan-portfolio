"""Admin authentication — sign + verify JWT bearer tokens.

We deliberately use a token-in-Authorization-header flow (not a
backend-set cookie) because the cookie would need to cross domains
between Vercel (frontend) and Render (backend), and SameSite + CORS
rules make that fragile on free tiers.

Flow:
    1. Frontend POSTs the admin password to /api/admin/login (Next.js
       proxy on Vercel).
    2. Vercel proxy forwards to Render's POST /admin/login.
    3. Render validates the password and returns { token, expires_at }.
    4. Vercel proxy stores the token in an HttpOnly cookie on the
       Vercel domain (same-origin to the user).
    5. Subsequent admin requests: Vercel reads its cookie, sends
       Authorization: Bearer <token> to Render. require_admin
       validates the signature + expiry.

Token contents:
    sub  — always "admin" for now (we don't have multi-user admin).
    iat  — issued-at timestamp.
    exp  — expiration timestamp.

Rotating JWT_SECRET in env vars invalidates every active session.
"""
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Header, HTTPException, status

from app.config import settings


ALGORITHM = "HS256"


def create_token(subject: str = "admin") -> tuple[str, datetime]:
    """Issue a new admin JWT. Returns (token, expires_at)."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=settings.jwt_ttl_hours)
    payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)
    return token, expires_at


def decode_token(token: str) -> dict:
    """Verify signature + expiry, return the payload dict. Raises 401
    on any failure so caller can let it bubble up to the client."""
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token.",
        )


def require_admin(authorization: str | None = Header(default=None)) -> dict:
    """FastAPI dependency. Drops into any route to gate it behind a
    valid admin token. Returns the decoded JWT payload.

    Usage:
        @router.get("/admin/whatever")
        def handler(claims: dict = Depends(require_admin)):
            ...
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must use the Bearer scheme.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization[len("Bearer ") :].strip()
    return decode_token(token)
