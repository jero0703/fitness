from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class BadgeOut(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    category: str
    criteria_type: str
    criteria_threshold: int
    earned: bool = False
    earned_at: Optional[datetime] = None
    progress: int = 0
    target: int = 1

    model_config = ConfigDict(from_attributes=True)

class UserBadgeOut(BaseModel):
    id: int
    user_id: int
    badge_id: int
    earned_at: datetime
    badge: Optional[BadgeOut] = None

    model_config = ConfigDict(from_attributes=True)

class BadgesSummaryOut(BaseModel):
    total_badges: int
    earned_count: int
    badges: List[BadgeOut]
