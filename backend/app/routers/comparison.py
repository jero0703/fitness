from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.comparison import WeeklyComparisonOut, MonthlyComparisonOut
from app.services.comparison_service import ComparisonService

router = APIRouter(prefix="/comparison", tags=["Progress Comparison"])

@router.get("/weekly", response_model=WeeklyComparisonOut, summary="Compare this week vs last week progress")
def get_weekly_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare current 7-day performance with prior 7-day window.
    Provides day-by-day comparison, percentage deltas, and automated insight observations.
    """
    return ComparisonService.get_weekly_comparison(db, current_user.id)

@router.get("/monthly", response_model=MonthlyComparisonOut, summary="Compare this month vs last month stats")
def get_monthly_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare current 30-day performance with prior 30-day window.
    Provides weekly bucket comparisons, percentage changes, and trend analysis.
    """
    return ComparisonService.get_monthly_comparison(db, current_user.id)
