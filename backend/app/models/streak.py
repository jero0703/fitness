from sqlalchemy import Column, Integer, Date, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.base import Base

class Streak(Base):
    __tablename__ = "streak"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_workout_date = Column(Date, nullable=True)

    # Relationships
    user = relationship("User", back_populates="streak")

    def __repr__(self):
        return f"<Streak(id={self.id}, user_id={self.user_id}, current={self.current_streak}, longest={self.longest_streak}, last={self.last_workout_date})>"
