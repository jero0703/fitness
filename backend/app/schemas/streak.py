from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict

class StreakOut(BaseModel):
    id: int
    user_id: int
    current_streak: int
    longest_streak: int
    last_workout_date: Optional[date] = None
    streak_active: bool = False
    next_milestone: int = 3
    days_to_milestone: int = 3

    model_config = ConfigDict(from_attributes=True)
