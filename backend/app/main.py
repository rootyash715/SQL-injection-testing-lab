"""
Main FastAPI Application Entrypoint.
Cyberpunk Red Team SQL Injection Testing & Learning Lab.
Localhost educational laboratory with isolated SQLite database.
"""

from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import router as api_router
from app.labs.lab_routes import router as labs_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and seed database on startup
    init_db(force=False)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Interactive Cyberpunk Red Team SQL Injection Educational Lab & Defense Simulator",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Localhost development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(api_router, prefix=settings.API_PREFIX)
app.include_router(labs_router, prefix=settings.API_PREFIX)

# Health Check
@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "LOCALHOST_ISOLATED",
        "target": "127.0.0.1",
    }


# Check if built frontend assets exist
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            return JSONResponse(status_code=404, content={"detail": f"API endpoint /{full_path} not found"})
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def index():
        return {
            "message": "Cyberpunk Red Team SQL Injection Lab API is running.",
            "docs": "/docs",
            "health": "/api/health",
            "frontend_status": "Vite dev server running on port 5173",
        }

