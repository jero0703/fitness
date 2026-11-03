from typing import List
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalUpdate, GoalOut
from app.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["Fitness Goal Management"])

@router.post("/", response_model=GoalOut, status_code=status.HTTP_201_CREATED, summary="Create a new fitness goal")
def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new fitness goal (e.g. Weight Loss, Muscle Gain, Steps) with deadline and targets.
    """
    return GoalService.create_goal(db, current_user.id, goal_in)

@router.get("/", response_model=List[GoalOut], summary="List all fitness goals")
def list_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all fitness goals for the current user with live computed completion percentage and status.
    """
    return GoalService.get_goals(db, current_user.id)

@router.get("/{id}", response_model=GoalOut, summary="Get goal details by ID")
def get_goal(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve goal details by ID. Validates user ownership.
    """
    return GoalService.get_goal_by_id(db, current_user.id, id)

@router.put("/{id}", response_model=GoalOut, summary="Update goal progress or details")
def update_goal(
    id: int,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update goal values, deadline, or current progress. Automatically updates status to COMPLETED or OVERDUE.
    """
    return GoalService.update_goal(db, current_user.id, id, goal_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a goal")
def delete_goal(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a fitness goal. Validates user ownership.
    """
    GoalService.delete_goal(db, current_user.id, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
