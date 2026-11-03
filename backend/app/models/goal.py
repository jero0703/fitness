from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.base import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    goal_type = Column(String(50), nullable=False)  # Weight Loss, Muscle Gain, Steps, Workouts, etc.
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0, nullable=False)
    deadline = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(50), default="NOT_STARTED", nullable=False)  # NOT_STARTED, IN_PROGRESS, COMPLETED, OVERDUE

    # Relationships
    user = relationship("User", back_populates="goals")

    __table_args__ = (
        Index("idx_goal_user_status", "user_id", "status"),
        Index("idx_goal_user_deadline", "user_id", "deadline"),
    )

    def __repr__(self):
        return f"<Goal(id={self.id}, type='{self.goal_type}', target={self.target_value}, current={self.current_value}, status='{self.status}')>"
