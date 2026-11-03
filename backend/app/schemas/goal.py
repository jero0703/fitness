from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

GoalStatus = Literal["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "OVERDUE"]

class GoalBase(BaseModel):
    goal_type: str = Field(..., min_length=2, max_length=50, description="e.g. Weight Loss, Muscle Gain, Steps, Running")
    target_value: float = Field(..., gt=0, description="Target numeric goal value")
    current_value: float = Field(0.0, ge=0, description="Current progress value")
    deadline: date = Field(..., description="Target completion date")

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    goal_type: Optional[str] = Field(None, min_length=2, max_length=50)
    target_value: Optional[float] = Field(None, gt=0)
    current_value: Optional[float] = Field(None, ge=0)
    deadline: Optional[date] = None
    status: Optional[str] = None

class GoalOut(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    status: str
    percentage: float = 0.0
    is_overdue: bool = False

    model_config = ConfigDict(from_attributes=True)
