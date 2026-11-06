from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class ExerciseBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Exercise name")
    category: str = Field(..., min_length=2, max_length=50, description="Category: Cardio, Strength, Yoga, etc.")
    description: Optional[str] = Field(None, max_length=1000, description="Exercise execution instructions")
    duration: int = Field(..., gt=0, le=1440, description="Recommended duration in minutes")
    calories_burned: Optional[float] = Field(0.0, ge=0, le=10000, description="Estimated calories burned")
    difficulty: Optional[str] = Field("Intermediate", description="Beginner, Intermediate, Advanced")

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseOut(ExerciseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
