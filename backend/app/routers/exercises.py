from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.exercise import ExerciseCreate, ExerciseOut
from app.services.exercise_service import ExerciseService

router = APIRouter(prefix="/exercises", tags=["Exercise Library"])

@router.get("/", response_model=List[ExerciseOut], summary="List and search predefined exercises")
def list_exercises(
    category: Optional[str] = Query(None, description="Filter by category (Cardio, Strength, Yoga, HIIT, Pilates)"),
    search: Optional[str] = Query(None, description="Search exercise by title or instructions"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Explore the predefined exercise catalog with search and category filtering.
    """
    return ExerciseService.get_exercises(
        db,
        category=category,
        search=search,
        limit=limit,
        offset=offset
    )

@router.get("/{id}", response_model=ExerciseOut, summary="Get exercise details")
def get_exercise(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ExerciseService.get_exercise_by_id(db, id)

@router.post("/", response_model=ExerciseOut, status_code=status.HTTP_201_CREATED, summary="Add custom exercise to library")
def create_exercise(
    exercise_in: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ExerciseService.create_exercise(db, exercise_in)
