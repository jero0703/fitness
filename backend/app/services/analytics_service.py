from datetime import date, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.workout import Workout

class AnalyticsService:
    @staticmethod
    def get_weekly_analytics(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Weekly workout summary for the past 7 days (Bar chart).
        """
        today = date.today()
        start_date = today - timedelta(days=6)

        # Query workouts grouped by date
        records = db.query(
            Workout.workout_date,
            func.count(Workout.id).label("workout_count"),
            func.coalesce(func.sum(Workout.calories_burned), 0.0).label("calories"),
            func.coalesce(func.sum(Workout.duration), 0).label("duration")
        ).filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= today
        ).group_by(Workout.workout_date).all()

        record_map = {r.workout_date: r for r in records}

        days_data = []
        total_workouts = 0
        total_calories = 0.0
        total_duration = 0

        for i in range(7):
            curr_date = start_date + timedelta(days=i)
            rec = record_map.get(curr_date)
            w_count = rec.workout_count if rec else 0
            cal = float(rec.calories if rec else 0.0)
            dur = int(rec.duration if rec else 0)

            total_workouts += w_count
            total_calories += cal
            total_duration += dur

            days_data.append({
                "day": curr_date.strftime("%a"),
                "date": curr_date.isoformat(),
                "workouts": w_count,
                "calories": round(cal, 1),
                "duration": dur
            })

        return {
            "period": f"{start_date.isoformat()} to {today.isoformat()}",
            "total_workouts": total_workouts,
            "total_calories": round(total_calories, 1),
            "total_duration": total_duration,
            "chart_data": days_data
        }

    @staticmethod
    def get_monthly_analytics(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Monthly workout progress (past 30 days) for line charts and trend analysis.
        """
        today = date.today()
        start_date = today - timedelta(days=29)

        records = db.query(
            Workout.workout_date,
            func.count(Workout.id).label("workout_count"),
            func.coalesce(func.sum(Workout.calories_burned), 0.0).label("calories"),
            func.coalesce(func.sum(Workout.duration), 0).label("duration")
        ).filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= today
        ).group_by(Workout.workout_date).all()

        record_map = {r.workout_date: r for r in records}

        chart_data = []
        total_workouts = 0
        total_calories = 0.0
        total_duration = 0

        for i in range(30):
            curr_date = start_date + timedelta(days=i)
            rec = record_map.get(curr_date)
            w_count = rec.workout_count if rec else 0
            cal = float(rec.calories if rec else 0.0)
            dur = int(rec.duration if rec else 0)

            total_workouts += w_count
            total_calories += cal
            total_duration += dur

            chart_data.append({
                "date": curr_date.strftime("%b %d"),
                "full_date": curr_date.isoformat(),
                "workouts": w_count,
                "calories": round(cal, 1),
                "duration": dur
            })

        return {
            "period": f"{start_date.isoformat()} to {today.isoformat()}",
            "total_workouts": total_workouts,
            "total_calories": round(total_calories, 1),
            "total_duration": total_duration,
            "average_calories_per_day": round(total_calories / 30.0, 1),
            "average_duration_per_day": round(total_duration / 30.0, 1),
            "chart_data": chart_data
        }

    @staticmethod
    def get_calories_analytics(db: Session, user_id: int, days: int = 14) -> Dict[str, Any]:
        """
        Daily calories burned across recent days for Area Chart.
        """
        today = date.today()
        start_date = today - timedelta(days=days - 1)

        records = db.query(
            Workout.workout_date,
            func.coalesce(func.sum(Workout.calories_burned), 0.0).label("calories"),
            func.coalesce(func.sum(Workout.duration), 0).label("duration")
        ).filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= today
        ).group_by(Workout.workout_date).all()

        rec_map = {r.workout_date: r for r in records}

        chart_data = []
        total_calories = 0.0

        for i in range(days):
            curr_date = start_date + timedelta(days=i)
            rec = rec_map.get(curr_date)
            cal = float(rec.calories if rec else 0.0)
            dur = int(rec.duration if rec else 0)
            total_calories += cal

            chart_data.append({
                "date": curr_date.strftime("%b %d"),
                "day": curr_date.strftime("%a"),
                "calories": round(cal, 1),
                "duration": dur
            })

        return {
            "days": days,
            "total_calories": round(total_calories, 1),
            "chart_data": chart_data
        }

    @staticmethod
    def get_categories_analytics(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Workout category distribution (Pie chart & metrics).
        """
        records = db.query(
            Workout.category,
            func.count(Workout.id).label("count"),
            func.coalesce(func.sum(Workout.calories_burned), 0.0).label("total_calories"),
            func.coalesce(func.sum(Workout.duration), 0).label("total_duration")
        ).filter(
            Workout.user_id == user_id
        ).group_by(Workout.category).all()

        total_workouts = sum(r.count for r in records)
        category_data = []

        # Color mapping for categories
        color_palette = [
            "#22C55E", "#14B8A6", "#3B82F6", "#F59E0B", "#EC4899",
            "#8B5CF6", "#06B6D4", "#10B981", "#6366F1", "#F97316"
        ]

        for idx, r in enumerate(records):
            pct = round((r.count / total_workouts * 100.0), 1) if total_workouts > 0 else 0.0
            category_data.append({
                "category": r.category,
                "name": r.category,
                "value": r.count,
                "count": r.count,
                "percentage": pct,
                "calories": round(float(r.total_calories), 1),
                "duration": int(r.total_duration),
                "color": color_palette[idx % len(color_palette)]
            })

        return {
            "total_workouts": total_workouts,
            "categories": category_data
        }
