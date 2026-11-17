"""
Configuration settings for the SQL Injection Testing & Learning Lab.
Localhost-only educational cybersecurity environment.
"""

from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "sql_lab.db"


class Settings(BaseSettings):
    PROJECT_NAME: str = "CYBERPUNK RED TEAM: SQL INJECTION LAB"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_URL: str = f"sqlite:///{DB_PATH.as_posix()}"
    DB_FILE: Path = DB_PATH
    DATA_DIR: Path = DATA_DIR
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]


settings = Settings()

