from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class WorkoutPlanBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150, description="Title of the planned workout")
    description: Optional[str] = Field(None, max_length=1000, description="Details or exercises planned")
    scheduled_date: date = Field(..., description="Target date for the scheduled workout")
    status: Optional[str] = Field("PLANNED", description="Status: PLANNED or COMPLETED")

class WorkoutPlanCreate(WorkoutPlanBase):
    pass

class WorkoutPlanUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    scheduled_date: Optional[date] = None
    status: Optional[str] = None

class WorkoutPlanOut(WorkoutPlanBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConvertToWorkoutRequest(BaseModel):
    category: str = Field("Cardio", min_length=2, max_length=50)
    duration: int = Field(30, gt=0, le=1440)
    calories_burned: float = Field(200.0, ge=0, le=10000)
