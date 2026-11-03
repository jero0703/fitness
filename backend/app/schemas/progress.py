from datetime import date
from typing import List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.workout import WorkoutOut

class ProgressOut(BaseModel):
    id: int
    user_id: int
    date: date
    total_workouts: int
    total_calories: float
    total_duration: int

    model_config = ConfigDict(from_attributes=True)

class DailySummaryOut(BaseModel):
    date: date
    total_workouts: int
    total_calories: float
    total_duration: int
    recent_workouts: List[WorkoutOut] = []

class WeeklyDayStat(BaseModel):
    day: str
    date: str
    workouts: int
    calories: float
    duration: int

class WeeklySummaryOut(BaseModel):
    start_date: str
    end_date: str
    total_workouts: int
    total_calories: float
    total_duration: int
    daily_breakdown: List[WeeklyDayStat] = []

class MonthlySummaryOut(BaseModel):
    month: int
    year: int
    total_workouts: int
    total_calories: float
    total_duration: int
    weekly_breakdown: List[Dict[str, Any]] = []
