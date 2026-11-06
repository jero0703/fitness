from datetime import date, datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.workout_plan import WorkoutPlan
from app.models.workout import Workout
from app.schemas.workout_plan import WorkoutPlanCreate, WorkoutPlanUpdate, ConvertToWorkoutRequest
from app.services.progress_service import ProgressService
from app.services.streak_service import StreakService
from app.services.badge_service import BadgeService

class WorkoutPlanService:
    @staticmethod
    def create_plan(db: Session, user_id: int, plan_data: WorkoutPlanCreate) -> WorkoutPlan:
        plan = WorkoutPlan(
            user_id=user_id,
            title=plan_data.title.strip(),
            description=plan_data.description.strip() if plan_data.description else None,
            scheduled_date=plan_data.scheduled_date,
            status=plan_data.status or "PLANNED",
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def get_plans(
        db: Session,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        scheduled_date: Optional[date] = None,
        status_filter: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[WorkoutPlan]:
        query = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id)

        if scheduled_date:
            query = query.filter(WorkoutPlan.scheduled_date == scheduled_date)
        if start_date:
            query = query.filter(WorkoutPlan.scheduled_date >= start_date)
        if end_date:
            query = query.filter(WorkoutPlan.scheduled_date <= end_date)
        if status_filter:
            query = query.filter(WorkoutPlan.status == status_filter)

        return query.order_by(WorkoutPlan.scheduled_date.asc(), WorkoutPlan.id.asc()).offset(offset).limit(limit).all()

    @staticmethod
    def get_upcoming_plans(db: Session, user_id: int, limit: int = 10) -> List[WorkoutPlan]:
        today = date.today()
        return (
            db.query(WorkoutPlan)
            .filter(
                WorkoutPlan.user_id == user_id,
                WorkoutPlan.scheduled_date >= today,
                WorkoutPlan.status == "PLANNED"
            )
            .order_by(WorkoutPlan.scheduled_date.asc(), WorkoutPlan.id.asc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_plan_by_id(db: Session, user_id: int, plan_id: int) -> WorkoutPlan:
        plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout plan not found")
        if plan.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this workout plan")
        return plan

    @staticmethod
    def update_plan(db: Session, user_id: int, plan_id: int, update_data: WorkoutPlanUpdate) -> WorkoutPlan:
        plan = WorkoutPlanService.get_plan_by_id(db, user_id, plan_id)

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                if isinstance(value, str):
                    setattr(plan, key, value.strip())
                else:
                    setattr(plan, key, value)

        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def delete_plan(db: Session, user_id: int, plan_id: int) -> None:
        plan = WorkoutPlanService.get_plan_by_id(db, user_id, plan_id)
        db.delete(plan)
        db.commit()

    @staticmethod
    def convert_to_workout(
        db: Session,
        user_id: int,
        plan_id: int,
        req: ConvertToWorkoutRequest
    ) -> Workout:
        plan = WorkoutPlanService.get_plan_by_id(db, user_id, plan_id)
        plan.status = "COMPLETED"

        workout = Workout(
            user_id=user_id,
            workout_name=plan.title,
            category=req.category,
            duration=req.duration,
            calories_burned=req.calories_burned,
            workout_date=plan.scheduled_date or date.today(),
        )
        db.add(workout)
        db.commit()
        db.refresh(workout)

        # Synchronize daily progress, streaks, badges
        ProgressService.sync_progress_for_date(db, user_id, workout.workout_date)
        StreakService.calculate_user_streak(db, user_id)
        BadgeService.check_and_award_badges(db, user_id)

        return workout
