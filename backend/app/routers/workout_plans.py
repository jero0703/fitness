from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, Response
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.workout_plan import (
    WorkoutPlanCreate,
    WorkoutPlanUpdate,
    WorkoutPlanOut,
    ConvertToWorkoutRequest
)
from app.schemas.workout import WorkoutOut
from app.services.workout_plan_service import WorkoutPlanService

router = APIRouter(prefix="/workout-plans", tags=["Workout Plans & Scheduling"])

@router.post("/", response_model=WorkoutPlanOut, status_code=status.HTTP_201_CREATED, summary="Create a new workout plan")
def create_plan(
    plan_in: WorkoutPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Plan a workout for a future date.
    """
    return WorkoutPlanService.create_plan(db, current_user.id, plan_in)

@router.get("/", response_model=List[WorkoutPlanOut], summary="List workout plans with date filters")
def list_plans(
    scheduled_date: Optional[date] = Query(None, description="Filter for a specific date"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    status: Optional[str] = Query(None, description="Filter by status (PLANNED, COMPLETED)"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch workout plans for the current authenticated user.
    """
    return WorkoutPlanService.get_plans(
        db,
        user_id=current_user.id,
        scheduled_date=scheduled_date,
        start_date=start_date,
        end_date=end_date,
        status_filter=status,
        limit=limit,
        offset=offset
    )

@router.get("/upcoming", response_model=List[WorkoutPlanOut], summary="List upcoming scheduled workouts")
def get_upcoming_plans(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all upcoming planned workouts scheduled for today or later.
    """
    return WorkoutPlanService.get_upcoming_plans(db, current_user.id, limit=limit)

@router.get("/{id}", response_model=WorkoutPlanOut, summary="Get single workout plan details")
def get_plan(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return WorkoutPlanService.get_plan_by_id(db, current_user.id, id)

@router.put("/{id}", response_model=WorkoutPlanOut, summary="Update an existing workout plan")
def update_plan(
    id: int,
    plan_in: WorkoutPlanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return WorkoutPlanService.update_plan(db, current_user.id, id, plan_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a workout plan")
def delete_plan(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    WorkoutPlanService.delete_plan(db, current_user.id, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/{id}/convert", response_model=WorkoutOut, summary="Convert plan to a completed workout")
def convert_to_workout(
    id: int,
    req: ConvertToWorkoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Completes the planned workout and registers it in the actual Workouts table,
    updating progress aggregates, streak, and badges.
    """
    return WorkoutPlanService.convert_to_workout(db, current_user.id, id, req)
