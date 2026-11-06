from app.routers.auth import router as auth_router
from app.routers.workouts import router as workouts_router
from app.routers.progress import router as progress_router
from app.routers.goals import router as goals_router
from app.routers.analytics import router as analytics_router
from app.routers.notifications import router as notifications_router
from app.routers.workout_plans import router as workout_plans_router
from app.routers.exercises import router as exercises_router
from app.routers.streak import router as streak_router
from app.routers.badges import router as badges_router
from app.routers.comparison import router as comparison_router

__all__ = [
    "auth_router",
    "workouts_router",
    "progress_router",
    "goals_router",
    "analytics_router",
    "notifications_router",
    "workout_plans_router",
    "exercises_router",
    "streak_router",
    "badges_router",
    "comparison_router",
]
