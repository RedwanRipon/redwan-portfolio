"""Liveness probe for Render / Fly / uptime monitors."""
from fastapi import APIRouter

from app.schemas import HealthResponse

router = APIRouter(tags=["meta"])


@router.get("/", response_model=HealthResponse)
def root() -> HealthResponse:
    """Convenience root — useful when you open the backend URL in a browser."""
    return HealthResponse()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()
