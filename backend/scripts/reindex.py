"""CLI: rebuild the ChromaDB index from /backend/data/sources.

Run from /backend:
    python -m scripts.reindex

Phase 2 Step 2 implements the real ingest. For now this is a stub
so the script wiring is in place.
"""
from app.services import ingest


def main() -> None:
    print("Reindex stub — will rebuild ChromaDB once Step 2 lands.")
    _ = ingest  # silence unused-import lint until Step 2


if __name__ == "__main__":
    main()
