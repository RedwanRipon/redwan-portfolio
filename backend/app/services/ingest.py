"""Ingest pipeline — read source documents, chunk, embed, persist.

Phase 2 Step 2: CV PDF only. Future steps will add blog + travel
content (which currently live as JSX in the frontend).

Public entry point: `ingest_cv()` (also called by `scripts/reindex.py`).
"""
from pathlib import Path

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from app.config import settings
from app.services.vector_store import get_vectorstore


# Chunking targets. CVs are dense so we keep chunks small with generous
# overlap so each role / project / publication tends to land in one
# retrievable unit (or, at worst, two adjacent ones).
CHUNK_SIZE = 600
CHUNK_OVERLAP = 120


def read_pdf(pdf_path: Path) -> str:
    """Concatenate all page text from a PDF into a single string."""
    reader = PdfReader(str(pdf_path))
    pages: list[str] = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n".join(pages)


def chunk_text(text: str, source: str) -> list[Document]:
    """Split text into overlapping chunks tagged with a source label."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " "],
    )
    chunks = splitter.split_text(text)
    return [
        Document(
            page_content=chunk,
            metadata={"source": source, "chunk_index": i},
        )
        for i, chunk in enumerate(chunks)
    ]


def _clear_collection() -> None:
    """Remove every chunk from the existing ChromaDB collection.

    We deliberately don't use ``shutil.rmtree`` on the persist dir
    because on Windows it fails when another process (typically a
    running uvicorn) is holding handles to the underlying HNSW /
    SQLite files. Chroma's own delete-by-id API works in-place and
    side-steps the file lock entirely.
    """
    settings.chroma_path.mkdir(parents=True, exist_ok=True)
    try:
        store = get_vectorstore()
        existing = store.get()
        ids = existing.get("ids") or []
        if ids:
            store.delete(ids=ids)
            print(f"[ingest]   cleared {len(ids)} existing chunk(s)")
        else:
            print("[ingest]   (no existing chunks to clear)")
    except Exception as exc:  # noqa: BLE001
        # Most common case: collection doesn't exist yet (first ever run).
        print(f"[ingest]   no existing collection ({type(exc).__name__})")


def ingest_cv(cv_path: Path | None = None) -> int:
    """Read the CV PDF, chunk it, embed, and persist to ChromaDB.

    Returns the number of chunks written.
    """
    cv_path = cv_path or (settings.sources_path / "cv.pdf")
    if not cv_path.exists():
        raise FileNotFoundError(
            f"CV not found at {cv_path}.\n"
            "Copy your CV PDF there as 'cv.pdf' (e.g. from "
            "frontend/public/documents/redwan-hossain-cv.pdf)."
        )

    print(f"[ingest] reading {cv_path.name} …")
    text = read_pdf(cv_path)
    word_count = len(text.split())
    print(f"[ingest]   -> {len(text):,} chars, ~{word_count:,} words")

    docs = chunk_text(text, source="cv")
    print(f"[ingest]   -> {len(docs)} chunks (size~{CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")

    print("[ingest] clearing previous chunks from ChromaDB …")
    _clear_collection()

    print(
        f"[ingest] embedding via OpenAI {settings.openai_embedding_model} "
        f"and writing to ChromaDB …"
    )
    store = get_vectorstore()
    store.add_documents(docs)

    return len(docs)
