from app.routers.auth import router as auth_router
from app.routers.workouts import router as workouts_router
from app.routers.progress import router as progress_router
from app.routers.goals import router as goals_router
from app.routers.analytics import router as analytics_router
from app.routers.notifications import router as notifications_router

__all__ = [
    "auth_router",
    "workouts_router",
    "progress_router",
    "goals_router",
    "analytics_router",
    "notifications_router",
]
