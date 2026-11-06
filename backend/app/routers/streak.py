from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.streak import StreakOut
from app.services.streak_service import StreakService

router = APIRouter(prefix="/streak", tags=["Streak Tracking System"])

@router.get("/", response_model=StreakOut, summary="Get user workout streak status")
def get_user_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve real-time streak statistics: current streak count, longest streak record,
    last workout date, whether streak is active today, and upcoming milestone.
    """
    return StreakService.get_streak_stats(db, current_user.id)

@router.post("/sync", response_model=StreakOut, summary="Force recalculate streak status")
def sync_user_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Recalculate streak history and verify active streak.
    """
    StreakService.calculate_user_streak(db, current_user.id)
    return StreakService.get_streak_stats(db, current_user.id)
