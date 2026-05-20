"""ChromaDB wrapper. Phase 2 Step 2 fills this in.

Filled in next commit:
- get_vectorstore() returning a lazily-loaded langchain_chroma.Chroma
  instance, persisted at settings.chroma_path.
- search(query: str, k: int = 4) → list of (text, metadata) tuples.
"""
