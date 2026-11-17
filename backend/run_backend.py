"""
Direct runner for FastAPI backend server on localhost:8000.
Supports environment overrides (HOST, PORT, RELOAD) with file watch exclusions.
"""

import os
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload_flag = os.getenv("RELOAD", "false").lower() == "true"

    print(f"[*] Starting Cyberpunk Red Team Lab on http://{host}:{port}")
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload_flag,
        reload_excludes=["*.db", "*.sqlite", "*.sqlite3", "data/*"] if reload_flag else None,
    )
