from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.progress import DailySummaryOut, WeeklySummaryOut, MonthlySummaryOut
from app.schemas.comparison import WeeklyComparisonOut, MonthlyComparisonOut
from app.services.progress_service import ProgressService
from app.services.comparison_service import ComparisonService

router = APIRouter(prefix="/progress", tags=["Daily Progress Tracking"])

@router.get("/daily", response_model=DailySummaryOut, summary="Get daily progress summary")
def get_daily_progress(
    target_date: Optional[date] = Query(None, description="Date for progress summary (defaults to today)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve daily workout metrics, calories burned, duration, and list of workouts for the specified date.
    """
    return ProgressService.get_daily_summary(db, current_user.id, target_date)

@router.get("/weekly", response_model=WeeklySummaryOut, summary="Get weekly progress summary")
def get_weekly_progress(
    end_date: Optional[date] = Query(None, description="End date for 7-day period (defaults to today)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve rolling 7-day workout activity, calories, duration, and day-by-day breakdown.
    """
    return ProgressService.get_weekly_summary(db, current_user.id, end_date)

@router.get("/monthly", response_model=MonthlySummaryOut, summary="Get monthly progress summary")
def get_monthly_progress(
    year: Optional[int] = Query(None, description="Year (e.g. 2026)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (1-12)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve month-to-date workout metrics and week-by-week aggregated statistics.
    """
    return ProgressService.get_monthly_summary(db, current_user.id, year, month)

@router.get("/comparison/weekly", response_model=WeeklyComparisonOut, summary="Compare weekly progress")
def get_weekly_progress_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare this week vs last week progress.
    """
    return ComparisonService.get_weekly_comparison(db, current_user.id)

@router.get("/comparison/monthly", response_model=MonthlyComparisonOut, summary="Compare monthly progress")
def get_monthly_progress_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare this month vs last month progress.
    """
    return ComparisonService.get_monthly_comparison(db, current_user.id)
