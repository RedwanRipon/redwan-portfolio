"""One-command CV update: copy frontend PDF -> backend, then reingest.

After you replace the PDF at
    frontend/public/documents/redwan-hossain-cv.pdf
run this once from /backend (with the venv active):

    python -m scripts.refresh_cv

It does two things:
    1. Copies the frontend PDF into backend/data/sources/cv.pdf
    2. Calls ingest_cv() so ChromaDB picks up the new content.

Whenever your CV changes you only need to update one file (the one
in the frontend, which is also what the live site serves for
download) — this script keeps the backend's knowledge in sync.
"""
import shutil
import sys
import time
from pathlib import Path

from app.services.ingest import ingest_cv


# Project layout assumed:
#   <project root>/
#     frontend/public/documents/redwan-hossain-cv.pdf
#     backend/data/sources/cv.pdf
#     backend/scripts/refresh_cv.py       <-- this file
BACKEND_DIR = Path(__file__).resolve().parent.parent       # …/backend
PROJECT_ROOT = BACKEND_DIR.parent                          # repo root
FRONTEND_CV = (
    PROJECT_ROOT / "frontend" / "public" / "documents" / "redwan-hossain-cv.pdf"
)
BACKEND_CV = BACKEND_DIR / "data" / "sources" / "cv.pdf"


def main() -> None:
    print("=== Refresh CV ===")
    start = time.time()

    if not FRONTEND_CV.exists():
        print(f"\nERROR: source PDF not found at:\n  {FRONTEND_CV}", file=sys.stderr)
        print(
            "\nMake sure you've saved the new CV in the frontend "
            "folder first, then re-run this script.",
            file=sys.stderr,
        )
        sys.exit(1)

    BACKEND_CV.parent.mkdir(parents=True, exist_ok=True)

    print(f"[copy] from: {FRONTEND_CV.relative_to(PROJECT_ROOT)}")
    print(f"[copy]   to: {BACKEND_CV.relative_to(PROJECT_ROOT)}")
    shutil.copy2(FRONTEND_CV, BACKEND_CV)
    size_kb = BACKEND_CV.stat().st_size / 1024
    print(f"[copy] done ({size_kb:,.1f} KB)\n")

    count = ingest_cv(BACKEND_CV)

    elapsed = time.time() - start
    print(f"\nOK — refresh complete. {count} chunk(s) in ChromaDB ({elapsed:.1f}s total).")
    print("\nNote: if uvicorn is running, restart it so the chat agent picks")
    print("      up the new content.")


if __name__ == "__main__":
    main()
