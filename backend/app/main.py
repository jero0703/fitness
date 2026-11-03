import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.connection import init_db
from app.utils.scheduler import start_scheduler, stop_scheduler
from app.routers import (
    auth_router,
    workouts_router,
    progress_router,
    goals_router,
    analytics_router,
    notifications_router,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("fittrack")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database schema and start background scheduler
    if os.environ.get("TESTING") != "1":
        logger.info("Initializing database...")
        init_db()
        logger.info("Starting background reminder scheduler...")
        start_scheduler()
    yield
    # Shutdown: Stop scheduler
    if os.environ.get("TESTING") != "1":
        logger.info("Stopping background scheduler...")
        stop_scheduler()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FitTrack – A complete, production-grade Fitness & Workout Management Platform API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(workouts_router)
app.include_router(progress_router)
app.include_router(goals_router)
app.include_router(analytics_router)
app.include_router(notifications_router)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "healthy"}
