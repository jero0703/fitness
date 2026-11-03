from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Reports & Analytics"])

@router.get("/weekly", summary="Weekly workout analytics")
def get_weekly_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Weekly workout activity distribution for bar chart rendering.
    """
    return AnalyticsService.get_weekly_analytics(db, current_user.id)

@router.get("/monthly", summary="Monthly workout progress and trends")
def get_monthly_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    30-day workout progression and averages for line chart visualization.
    """
    return AnalyticsService.get_monthly_analytics(db, current_user.id)

@router.get("/calories", summary="Calories burned analytics")
def get_calories_analytics(
    days: int = Query(14, ge=7, le=90, description="Number of past days to analyze"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Daily calories burned trend for area chart.
    """
    return AnalyticsService.get_calories_analytics(db, current_user.id, days=days)

@router.get("/categories", summary="Workout category breakdown")
def get_categories_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Category distribution (Cardio, Strength, Yoga, etc.) for pie chart.
    """
    return AnalyticsService.get_categories_analytics(db, current_user.id)
