"""Ingest pipeline — read source documents, chunk, embed, persist.

Phase 2 Step 2: CV PDF only. Future steps will add blog + travel
content (which currently live as JSX in the frontend).

Public entry point: `ingest_cv()` (also called by `scripts/reindex.py`).
"""
import shutil
from pathlib import Path

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from app.config import settings
from app.services.vector_store import COLLECTION_NAME, get_embeddings


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


def _wipe_chroma_dir() -> None:
    """Delete the persistent ChromaDB folder so the next write starts fresh.

    Re-running the ingest is idempotent — old chunks don't pile up
    alongside new ones.
    """
    chroma_path = settings.chroma_path
    if chroma_path.exists():
        shutil.rmtree(chroma_path)
    chroma_path.mkdir(parents=True, exist_ok=True)


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

    print(f"[ingest] wiping old index at {settings.chroma_path} …")
    _wipe_chroma_dir()

    print(
        f"[ingest] embedding via OpenAI {settings.openai_embedding_model} "
        f"and writing to ChromaDB …"
    )
    Chroma.from_documents(
        documents=docs,
        embedding=get_embeddings(),
        collection_name=COLLECTION_NAME,
        persist_directory=str(settings.chroma_path),
    )

    return len(docs)
