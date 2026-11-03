from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

WorkoutCategory = Literal["Cardio", "Strength", "Yoga", "HIIT", "Pilates", "Walking", "Running", "Cycling", "Swimming", "Other"]

class WorkoutBase(BaseModel):
    workout_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=50)
    duration: int = Field(..., gt=0, le=1440, description="Duration in minutes (must be > 0)")
    calories_burned: float = Field(..., ge=0, le=10000, description="Calories burned in kcal (must be >= 0)")
    workout_date: date = Field(..., description="Date of the workout")

class WorkoutCreate(WorkoutBase):
    pass

class WorkoutUpdate(BaseModel):
    workout_name: Optional[str] = Field(None, min_length=2, max_length=150)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    duration: Optional[int] = Field(None, gt=0, le=1440)
    calories_burned: Optional[float] = Field(None, ge=0, le=10000)
    workout_date: Optional[date] = None

class WorkoutOut(WorkoutBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
