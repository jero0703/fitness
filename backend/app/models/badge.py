from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.database.base import Base

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(100), nullable=False)
    category = Column(String(50), default="Workouts", nullable=False)  # Workouts, Streaks, Goals, Calories
    criteria_type = Column(String(50), nullable=False)  # "workouts", "streak", "goals", "calories"
    criteria_threshold = Column(Integer, nullable=False)

    # Relationships
    user_badges = relationship("UserBadge", back_populates="badge", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Badge(id={self.id}, name='{self.name}', criteria='{self.criteria_type}:{self.criteria_threshold}')>"

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), index=True, nullable=False)
    earned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")

    __table_args__ = (
        UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),
        Index("idx_user_badge_earned", "user_id", "earned_at"),
    )

    def __repr__(self):
        return f"<UserBadge(id={self.id}, user_id={self.user_id}, badge_id={self.badge_id}, earned_at={self.earned_at})>"
