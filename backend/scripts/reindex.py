"""CLI: rebuild the ChromaDB index from /backend/data/sources.

Run from /backend (with the venv active and OPENAI_API_KEY set):

    python -m scripts.reindex

Idempotent — the existing index is wiped first, so you can re-run
this any time you update the CV (or, later, blog/travel content).
"""
import sys
import time

from app.services.ingest import ingest_cv


def main() -> None:
    print("=== Reindex ===")
    start = time.time()
    try:
        count = ingest_cv()
    except FileNotFoundError as exc:
        print(f"\nERROR: {exc}", file=sys.stderr)
        sys.exit(1)
    except Exception as exc:  # noqa: BLE001
        print(f"\nERROR during ingest: {exc}", file=sys.stderr)
        raise

    elapsed = time.time() - start
    print(f"\nOK — {count} chunk(s) embedded and persisted in {elapsed:.1f}s.")
    print("\nQuick sanity check:")
    print(
        "  python -c \"from app.services.vector_store import search; "
        "print(search('master thesis', 2))\""
    )


if __name__ == "__main__":
    main()
