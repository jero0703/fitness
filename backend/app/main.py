import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.connection import init_db, SessionLocal
from app.utils.scheduler import start_scheduler, stop_scheduler
from app.routers import (
    auth_router,
    workouts_router,
    progress_router,
    goals_router,
    analytics_router,
    notifications_router,
    workout_plans_router,
    exercises_router,
    streak_router,
    badges_router,
    comparison_router,
)
from app.services.exercise_service import ExerciseService
from app.services.badge_service import BadgeService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("fittrack")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database schema, seed defaults, and start background scheduler
    if os.environ.get("TESTING") != "1":
        logger.info("Initializing database...")
        init_db()
        db = SessionLocal()
        try:
            logger.info("Ensuring default exercises & badges are seeded...")
            ExerciseService.seed_default_exercises(db)
            BadgeService.seed_default_badges(db)
        except Exception as e:
            logger.warning("Error seeding initial data: %s", e)
        finally:
            db.close()

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
    version="2.0.0",
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
app.include_router(workout_plans_router)
app.include_router(exercises_router)
app.include_router(streak_router)
app.include_router(badges_router)
app.include_router(comparison_router)

# Also alias /plans for workout-plans
app.include_router(workout_plans_router, prefix="/plans", include_in_schema=False)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "healthy"}
