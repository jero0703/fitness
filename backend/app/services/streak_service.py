from datetime import date, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.streak import Streak
from app.models.workout import Workout

MILESTONES = [3, 7, 14, 21, 30, 60, 90, 100, 365]

class StreakService:
    @staticmethod
    def get_or_create_streak(db: Session, user_id: int) -> Streak:
        streak = db.query(Streak).filter(Streak.user_id == user_id).first()
        if not streak:
            streak = Streak(
                user_id=user_id,
                current_streak=0,
                longest_streak=0,
                last_workout_date=None,
            )
            db.add(streak)
            db.commit()
            db.refresh(streak)
        return streak

    @staticmethod
    def calculate_user_streak(db: Session, user_id: int) -> Streak:
        """
        Computes accurate daily workout streak based on distinct workout dates.
        Resets current streak to 0 if a consecutive day was missed.
        Updates longest_streak record and persists to the Streak table.
        """
        streak = StreakService.get_or_create_streak(db, user_id)
        today = date.today()

        # Query all distinct workout dates for user
        date_records = (
            db.query(Workout.workout_date)
            .filter(Workout.user_id == user_id)
            .distinct()
            .order_by(Workout.workout_date.asc())
            .all()
        )
        workout_dates = sorted(set(r[0] for r in date_records))

        if not workout_dates:
            streak.current_streak = 0
            streak.longest_streak = 0
            streak.last_workout_date = None
            db.commit()
            db.refresh(streak)
            return streak

        last_date = workout_dates[-1]
        streak.last_workout_date = last_date

        # Calculate longest consecutive streak historically
        max_streak = 1
        curr_run = 1
        for i in range(1, len(workout_dates)):
            diff = (workout_dates[i] - workout_dates[i - 1]).days
            if diff == 1:
                curr_run += 1
                if curr_run > max_streak:
                    max_streak = curr_run
            elif diff > 1:
                curr_run = 1

        # Calculate current active streak
        # If the most recent workout was before yesterday, streak is broken
        days_since_last = (today - last_date).days
        if days_since_last > 1:
            current = 0
        else:
            # Count backwards from last_date
            current = 1
            idx = len(workout_dates) - 1
            while idx > 0:
                if (workout_dates[idx] - workout_dates[idx - 1]).days == 1:
                    current += 1
                    idx -= 1
                else:
                    break

        streak.current_streak = current
        streak.longest_streak = max(streak.longest_streak, max_streak, current)

        db.commit()
        db.refresh(streak)
        return streak

    @staticmethod
    def get_streak_stats(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Returns full streak details with active status and upcoming milestone.
        """
        streak = StreakService.calculate_user_streak(db, user_id)
        today = date.today()
        is_active_today = (streak.last_workout_date == today)

        # Determine next milestone
        next_ms = 3
        for m in MILESTONES:
            if m > streak.current_streak:
                next_ms = m
                break

        days_needed = max(0, next_ms - streak.current_streak)

        return {
            "id": streak.id,
            "user_id": streak.user_id,
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "last_workout_date": streak.last_workout_date,
            "streak_active": is_active_today,
            "next_milestone": next_ms,
            "days_to_milestone": days_needed,
        }
