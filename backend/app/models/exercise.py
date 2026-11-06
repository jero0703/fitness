from sqlalchemy import Column, Integer, String, Text, Float, Index
from app.database.base import Base

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # Cardio / Strength / Yoga / HIIT / Pilates
    description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=False)  # in minutes
    calories_burned = Column(Float, default=0.0, nullable=False)
    difficulty = Column(String(50), default="Intermediate", nullable=False)

    __table_args__ = (
        Index("idx_exercise_category_name", "category", "name"),
    )

    def __repr__(self):
        return f"<Exercise(id={self.id}, name='{self.name}', category='{self.category}', duration={self.duration})>"
