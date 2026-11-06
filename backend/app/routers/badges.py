from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.badge import BadgesSummaryOut, BadgeOut
from app.services.badge_service import BadgeService

router = APIRouter(prefix="/badges", tags=["Achievement Badges"])

@router.get("/", response_model=BadgesSummaryOut, summary="List all achievement badges with user's earned status")
def get_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get full badges catalog with earned statuses, timestamps, and progress indicators.
    """
    return BadgeService.get_user_badges(db, current_user.id)

@router.post("/check", response_model=List[BadgeOut], summary="Evaluate and award pending badges")
def check_awards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates current workout, streak, goal, and calorie metrics, awarding any newly earned badges.
    """
    newly_awarded = BadgeService.check_and_award_badges(db, current_user.id)
    return [
        BadgeOut(
            id=b.id,
            name=b.name,
            description=b.description,
            icon=b.icon,
            category=b.category,
            criteria_type=b.criteria_type,
            criteria_threshold=b.criteria_threshold,
            earned=True,
            progress=b.criteria_threshold,
            target=b.criteria_threshold,
        )
        for b in newly_awarded
    ]
