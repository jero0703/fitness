from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, Response
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.workout import WorkoutCreate, WorkoutUpdate, WorkoutOut
from app.services.workout_service import WorkoutService

router = APIRouter(prefix="/workouts", tags=["Workout Management"])

@router.post("/", response_model=WorkoutOut, status_code=status.HTTP_201_CREATED, summary="Add a new workout")
def create_workout(
    workout_in: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record a new workout entry for the authenticated user and automatically update daily progress aggregates.
    """
    return WorkoutService.create_workout(db, current_user.id, workout_in)

@router.get("/", response_model=List[WorkoutOut], summary="List workouts with filters and search")
def list_workouts(
    category: Optional[str] = Query(None, description="Filter by category (Cardio, Strength, Yoga, etc.)"),
    start_date: Optional[date] = Query(None, description="Filter workouts from this date"),
    end_date: Optional[date] = Query(None, description="Filter workouts up to this date"),
    search: Optional[str] = Query(None, description="Search term for workout name"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all workouts logged by the authenticated user with optional filtering by category, date range, or search string.
    """
    return WorkoutService.get_workouts(
        db,
        user_id=current_user.id,
        category=category,
        start_date=start_date,
        end_date=end_date,
        search=search,
        limit=limit,
        offset=offset
    )

@router.get("/{id}", response_model=WorkoutOut, summary="Get workout details by ID")
def get_workout(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve specific workout details. Validates user ownership.
    """
    return WorkoutService.get_workout_by_id(db, current_user.id, id)

@router.put("/{id}", response_model=WorkoutOut, summary="Update an existing workout")
def update_workout(
    id: int,
    workout_in: WorkoutUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update workout details. Validates user ownership and synchronizes daily progress aggregates.
    """
    return WorkoutService.update_workout(db, current_user.id, id, workout_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a workout")
def delete_workout(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a workout record. Validates user ownership and updates daily progress aggregates.
    """
    WorkoutService.delete_workout(db, current_user.id, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
