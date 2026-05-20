"""ChromaDB wrapper — single source of truth for the vector store.

The vector store is persisted to disk at `settings.chroma_dir`, so the
ChromaDB collection survives backend restarts. The ingest script
(`scripts/reindex.py`) writes here; the agent (Step 3) reads from here.
"""
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

from app.config import settings

COLLECTION_NAME = "portfolio"


def get_embeddings() -> OpenAIEmbeddings:
    """OpenAI embeddings client (text-embedding-3-small by default)."""
    return OpenAIEmbeddings(
        api_key=settings.openai_api_key,
        model=settings.openai_embedding_model,
    )


def get_vectorstore() -> Chroma:
    """Persistent ChromaDB store rooted at settings.chroma_dir."""
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=get_embeddings(),
        persist_directory=str(settings.chroma_path),
    )


def search(query: str, k: int = 4) -> list[tuple[str, dict]]:
    """Similarity search. Returns a list of (content, metadata) tuples.

    Example:
        >>> from app.services.vector_store import search
        >>> hits = search("master thesis", k=2)
        >>> for content, meta in hits:
        ...     print(meta, content[:80])
    """
    store = get_vectorstore()
    results: list[Document] = store.similarity_search(query, k=k)
    return [(r.page_content, r.metadata) for r in results]
