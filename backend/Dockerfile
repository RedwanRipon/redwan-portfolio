# Backend container for Render / Fly / Railway deploys.
# Uses python:3.12-slim — small footprint, all the libs we need.

FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /srv/app

# System deps for some Python wheels (chromadb, pypdf, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first to leverage Docker layer cache.
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy source. Skip data/ — index will be rebuilt at startup if empty.
COPY app ./app
COPY scripts ./scripts

# Render injects $PORT; default to 8000 locally.
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
