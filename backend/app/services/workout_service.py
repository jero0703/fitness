from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.workout import Workout
from app.schemas.workout import WorkoutCreate, WorkoutUpdate
from app.services.progress_service import ProgressService
from app.services.streak_service import StreakService
from app.services.badge_service import BadgeService

class WorkoutService:
    @staticmethod
    def create_workout(db: Session, user_id: int, workout_data: WorkoutCreate) -> Workout:
        workout = Workout(
            user_id=user_id,
            workout_name=workout_data.workout_name.strip(),
            category=workout_data.category.strip(),
            duration=workout_data.duration,
            calories_burned=workout_data.calories_burned,
            workout_date=workout_data.workout_date,
        )
        db.add(workout)
        db.commit()
        db.refresh(workout)

        # Synchronize daily progress aggregate for this date
        ProgressService.sync_progress_for_date(db, user_id, workout_data.workout_date)

        # Update streak tracking
        StreakService.calculate_user_streak(db, user_id)

        # Evaluate and award any milestone badges
        BadgeService.check_and_award_badges(db, user_id)

        return workout

    @staticmethod
    def get_workouts(
        db: Session,
        user_id: int,
        category: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Workout]:
        query = db.query(Workout).filter(Workout.user_id == user_id)

        if category and category.lower() != "all":
            query = query.filter(Workout.category.ilike(f"%{category.strip()}%"))

        if start_date:
            query = query.filter(Workout.workout_date >= start_date)

        if end_date:
            query = query.filter(Workout.workout_date <= end_date)

        if search:
            query = query.filter(Workout.workout_name.ilike(f"%{search.strip()}%"))

        return query.order_by(Workout.workout_date.desc(), Workout.id.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def get_workout_by_id(db: Session, user_id: int, workout_id: int) -> Workout:
        workout = db.query(Workout).filter(Workout.id == workout_id).first()
        if not workout:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found")
        if workout.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this workout")
        return workout

    @staticmethod
    def update_workout(db: Session, user_id: int, workout_id: int, update_data: WorkoutUpdate) -> Workout:
        workout = WorkoutService.get_workout_by_id(db, user_id, workout_id)
        original_date = workout.workout_date

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                if isinstance(value, str):
                    setattr(workout, key, value.strip())
                else:
                    setattr(workout, key, value)

        db.commit()
        db.refresh(workout)

        # Sync progress for original date and new date (if date was changed)
        ProgressService.sync_progress_for_date(db, user_id, original_date)
        if workout.workout_date != original_date:
            ProgressService.sync_progress_for_date(db, user_id, workout.workout_date)

        # Recalculate streak & badges
        StreakService.calculate_user_streak(db, user_id)
        BadgeService.check_and_award_badges(db, user_id)

        return workout

    @staticmethod
    def delete_workout(db: Session, user_id: int, workout_id: int) -> None:
        workout = WorkoutService.get_workout_by_id(db, user_id, workout_id)
        w_date = workout.workout_date

        db.delete(workout)
        db.commit()

        # Resync progress aggregate and streak
        ProgressService.sync_progress_for_date(db, user_id, w_date)
        StreakService.calculate_user_streak(db, user_id)
