from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.base import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    workout_name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    duration = Column(Integer, nullable=False)  # in minutes
    calories_burned = Column(Float, nullable=False)
    workout_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="workouts")

    __table_args__ = (
        Index("idx_user_workout_date", "user_id", "workout_date"),
        Index("idx_user_category", "user_id", "category"),
    )

    def __repr__(self):
        return f"<Workout(id={self.id}, name='{self.workout_name}', category='{self.category}', date={self.workout_date})>"
