"""Application settings loaded from environment / .env file."""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All runtime configuration lives here. Reads from env or .env."""

    # --- OpenAI ---
    openai_api_key: str = ""
    openai_llm_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    # --- CORS — comma-separated origins ---
    cors_origins: str = "http://localhost:3000"

    # --- Paths ---
    chroma_dir: str = "./data/chroma_db"
    sources_dir: str = "./data/sources"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def chroma_path(self) -> Path:
        return Path(self.chroma_dir).resolve()

    @property
    def sources_path(self) -> Path:
        return Path(self.sources_dir).resolve()


settings = Settings()
