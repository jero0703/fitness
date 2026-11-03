from sqlalchemy import Column, Integer, Float, Date, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.database.base import Base

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    total_workouts = Column(Integer, default=0, nullable=False)
    total_calories = Column(Float, default=0.0, nullable=False)
    total_duration = Column(Integer, default=0, nullable=False)  # in minutes
    date = Column(Date, index=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="progress")

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_progress_date"),
        Index("idx_progress_user_date", "user_id", "date"),
    )

    def __repr__(self):
        return f"<Progress(id={self.id}, user_id={self.user_id}, date={self.date}, workouts={self.total_workouts}, calories={self.total_calories})>"
