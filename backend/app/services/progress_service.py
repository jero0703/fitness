from datetime import date, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.workout import Workout
from app.models.progress import Progress
from app.schemas.progress import DailySummaryOut, WeeklySummaryOut, WeeklyDayStat, MonthlySummaryOut
from app.schemas.workout import WorkoutOut

class ProgressService:
    @staticmethod
    def sync_progress_for_date(db: Session, user_id: int, target_date: date) -> Optional[Progress]:
        """
        Derives and synchronizes daily progress aggregates from actual workout records
        to ensure data consistency and eliminate discrepancies.
        """
        stats = db.query(
            func.count(Workout.id).label("total_workouts"),
            func.coalesce(func.sum(Workout.calories_burned), 0.0).label("total_calories"),
            func.coalesce(func.sum(Workout.duration), 0).label("total_duration")
        ).filter(
            Workout.user_id == user_id,
            Workout.workout_date == target_date
        ).first()

        total_workouts = stats.total_workouts or 0
        total_calories = float(stats.total_calories or 0.0)
        total_duration = int(stats.total_duration or 0)

        prog_record = db.query(Progress).filter(
            Progress.user_id == user_id,
            Progress.date == target_date
        ).first()

        if prog_record:
            prog_record.total_workouts = total_workouts
            prog_record.total_calories = round(total_calories, 2)
            prog_record.total_duration = total_duration
        else:
            if total_workouts > 0:
                prog_record = Progress(
                    user_id=user_id,
                    date=target_date,
                    total_workouts=total_workouts,
                    total_calories=round(total_calories, 2),
                    total_duration=total_duration
                )
                db.add(prog_record)

        db.commit()
        if prog_record:
            db.refresh(prog_record)
        return prog_record

    @staticmethod
    def get_daily_summary(db: Session, user_id: int, target_date: Optional[date] = None) -> DailySummaryOut:
        if target_date is None:
            target_date = date.today()

        # Ensure latest sync
        ProgressService.sync_progress_for_date(db, user_id, target_date)

        prog_record = db.query(Progress).filter(
            Progress.user_id == user_id,
            Progress.date == target_date
        ).first()

        workouts = db.query(Workout).filter(
            Workout.user_id == user_id,
            Workout.workout_date == target_date
        ).order_by(Workout.created_at.desc()).all()

        return DailySummaryOut(
            date=target_date,
            total_workouts=prog_record.total_workouts if prog_record else 0,
            total_calories=prog_record.total_calories if prog_record else 0.0,
            total_duration=prog_record.total_duration if prog_record else 0,
            recent_workouts=[WorkoutOut.model_validate(w) for w in workouts]
        )

    @staticmethod
    def get_weekly_summary(db: Session, user_id: int, end_date: Optional[date] = None) -> WeeklySummaryOut:
        if end_date is None:
            end_date = date.today()
        start_date = end_date - timedelta(days=6)

        # Sync all 7 days to guarantee fresh data
        for i in range(7):
            d = start_date + timedelta(days=i)
            ProgressService.sync_progress_for_date(db, user_id, d)

        # Retrieve records
        records = db.query(Progress).filter(
            Progress.user_id == user_id,
            Progress.date >= start_date,
            Progress.date <= end_date
        ).all()
        rec_map = {r.date: r for r in records}

        daily_breakdown: List[WeeklyDayStat] = []
        total_w = 0
        total_c = 0.0
        total_d = 0

        for i in range(7):
            curr_date = start_date + timedelta(days=i)
            rec = rec_map.get(curr_date)
            w_count = rec.total_workouts if rec else 0
            w_cal = rec.total_calories if rec else 0.0
            w_dur = rec.total_duration if rec else 0

            total_w += w_count
            total_c += w_cal
            total_d += w_dur

            daily_breakdown.append(WeeklyDayStat(
                day=curr_date.strftime("%a"),
                date=curr_date.isoformat(),
                workouts=w_count,
                calories=round(w_cal, 2),
                duration=w_dur
            ))

        return WeeklySummaryOut(
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
            total_workouts=total_w,
            total_calories=round(total_c, 2),
            total_duration=total_d,
            daily_breakdown=daily_breakdown
        )

    @staticmethod
    def get_monthly_summary(db: Session, user_id: int, year: Optional[int] = None, month: Optional[int] = None) -> MonthlySummaryOut:
        today = date.today()
        if year is None:
            year = today.year
        if month is None:
            month = today.month

        # Find first and last day of target month
        first_day = date(year, month, 1)
        if month == 12:
            next_month = date(year + 1, 1, 1)
        else:
            next_month = date(year, month + 1, 1)
        last_day = next_month - timedelta(days=1)

        # Sync days with workouts in this range
        dates_with_workouts = db.query(Workout.workout_date).filter(
            Workout.user_id == user_id,
            Workout.workout_date >= first_day,
            Workout.workout_date <= last_day
        ).distinct().all()

        for (d,) in dates_with_workouts:
            ProgressService.sync_progress_for_date(db, user_id, d)

        # Aggregate monthly stats
        monthly_stats = db.query(
            func.coalesce(func.sum(Progress.total_workouts), 0).label("workouts"),
            func.coalesce(func.sum(Progress.total_calories), 0.0).label("calories"),
            func.coalesce(func.sum(Progress.total_duration), 0).label("duration")
        ).filter(
            Progress.user_id == user_id,
            Progress.date >= first_day,
            Progress.date <= last_day
        ).first()

        # Weekly breakdown (Weeks 1 to 4/5)
        weekly_breakdown = []
        curr = first_day
        week_num = 1
        while curr <= last_day:
            week_end = min(curr + timedelta(days=6), last_day)
            w_stats = db.query(
                func.coalesce(func.sum(Progress.total_workouts), 0).label("workouts"),
                func.coalesce(func.sum(Progress.total_calories), 0.0).label("calories"),
                func.coalesce(func.sum(Progress.total_duration), 0).label("duration")
            ).filter(
                Progress.user_id == user_id,
                Progress.date >= curr,
                Progress.date <= week_end
            ).first()

            weekly_breakdown.append({
                "week": f"Week {week_num}",
                "start_date": curr.isoformat(),
                "end_date": week_end.isoformat(),
                "workouts": int(w_stats.workouts or 0),
                "calories": round(float(w_stats.calories or 0.0), 2),
                "duration": int(w_stats.duration or 0)
            })
            curr = week_end + timedelta(days=1)
            week_num += 1

        return MonthlySummaryOut(
            month=month,
            year=year,
            total_workouts=int(monthly_stats.workouts or 0),
            total_calories=round(float(monthly_stats.calories or 0.0), 2),
            total_duration=int(monthly_stats.duration or 0),
            weekly_breakdown=weekly_breakdown
        )
