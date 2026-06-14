"""Tiny in-memory rate limiter.

Per (key, scope) bucket with a hard cap of N events per window. Resets
on process restart — fine for free-tier workloads. For higher traffic
we'd swap this for Redis-backed sliding window, but it's overkill at
portfolio scale.

Usage:
    from app.rate_limit import check_rate_limit
    check_rate_limit("comments", request.client.host, max_calls=5, window_seconds=60)
"""
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, status


# scope -> ip -> deque of recent timestamps (floats).
_buckets: dict[str, dict[str, deque[float]]] = defaultdict(lambda: defaultdict(deque))
_lock = Lock()


def check_rate_limit(
    scope: str,
    key: str,
    *,
    max_calls: int,
    window_seconds: int,
) -> None:
    """Raise 429 if `key` has called `scope` more than `max_calls`
    times in the last `window_seconds`. Otherwise record this call.

    Args:
        scope: a name like "comments" or "contact" — separate buckets per route.
        key: usually the client IP. Could also be a user id once we add auth.
        max_calls: cap inside the window.
        window_seconds: rolling window length.
    """
    now = time.time()
    cutoff = now - window_seconds

    with _lock:
        bucket = _buckets[scope][key]
        # Drop timestamps that have aged out of the window.
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if len(bucket) >= max_calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    f"Too many {scope} requests. "
                    f"Try again in a minute."
                ),
            )
        bucket.append(now)


def client_ip(request) -> str:
    """Best-effort client IP. Behind Render's proxy we get the real
    IP via the X-Forwarded-For header; locally it's request.client.host."""
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        # X-Forwarded-For may be comma-separated; client IP is the first entry.
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
