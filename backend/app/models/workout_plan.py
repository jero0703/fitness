from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.base import Base

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_date = Column(Date, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(50), default="PLANNED", nullable=False)  # PLANNED, COMPLETED

    # Relationships
    user = relationship("User", back_populates="workout_plans")

    __table_args__ = (
        Index("idx_plan_user_date", "user_id", "scheduled_date"),
        Index("idx_plan_user_status", "user_id", "status"),
    )

    def __repr__(self):
        return f"<WorkoutPlan(id={self.id}, user_id={self.user_id}, title='{self.title}', date={self.scheduled_date}, status='{self.status}')>"
