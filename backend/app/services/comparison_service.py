from datetime import date, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.workout import Workout

class ComparisonService:
    @staticmethod
    def _calc_pct(curr: float, prev: float) -> float:
        if prev > 0:
            return round(((curr - prev) / prev) * 100.0, 1)
        elif curr > 0:
            return 100.0
        return 0.0

    @staticmethod
    def get_weekly_comparison(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Compares the current 7-day period against the previous 7-day period.
        Generates day-by-day comparison points and automated improvement insights.
        """
        today = date.today()
        # Current week: [today - 6 days, today]
        curr_start = today - timedelta(days=6)
        curr_end = today
        # Previous week: [today - 13 days, today - 7 days]
        prev_start = today - timedelta(days=13)
        prev_end = today - timedelta(days=7)

        # Query workouts for past 14 days
        workouts = (
            db.query(Workout)
            .filter(
                Workout.user_id == user_id,
                Workout.workout_date >= prev_start,
                Workout.workout_date <= curr_end
            )
            .all()
        )

        curr_workouts_map: Dict[date, List[Workout]] = {}
        prev_workouts_map: Dict[date, List[Workout]] = {}

        for w in workouts:
            if curr_start <= w.workout_date <= curr_end:
                curr_workouts_map.setdefault(w.workout_date, []).append(w)
            elif prev_start <= w.workout_date <= prev_end:
                prev_workouts_map.setdefault(w.workout_date, []).append(w)

        # Summaries
        curr_total_workouts = sum(len(ws) for ws in curr_workouts_map.values())
        curr_total_calories = sum(sum(w.calories_burned for w in ws) for ws in curr_workouts_map.values())
        curr_total_duration = sum(sum(w.duration for w in ws) for ws in curr_workouts_map.values())

        prev_total_workouts = sum(len(ws) for ws in prev_workouts_map.values())
        prev_total_calories = sum(sum(w.calories_burned for w in ws) for ws in prev_workouts_map.values())
        prev_total_duration = sum(sum(w.duration for w in ws) for ws in prev_workouts_map.values())

        # Daily comparison array for Recharts
        daily_items = []
        best_day_name = "N/A"
        max_daily_cal = -1.0

        for i in range(7):
            c_date = curr_start + timedelta(days=i)
            p_date = prev_start + timedelta(days=i)

            c_ws = curr_workouts_map.get(c_date, [])
            p_ws = prev_workouts_map.get(p_date, [])

            c_cal = round(sum(w.calories_burned for w in c_ws), 1)
            p_cal = round(sum(w.calories_burned for w in p_ws), 1)
            c_dur = sum(w.duration for w in c_ws)
            p_dur = sum(w.duration for w in p_ws)

            if c_cal > max_daily_cal and c_cal > 0:
                max_daily_cal = c_cal
                best_day_name = c_date.strftime("%A")

            daily_items.append({
                "day": c_date.strftime("%a"),
                "date_current": c_date.isoformat(),
                "date_previous": p_date.isoformat(),
                "current_calories": c_cal,
                "previous_calories": p_cal,
                "current_workouts": len(c_ws),
                "previous_workouts": len(p_ws),
                "current_duration": c_dur,
                "previous_duration": p_dur,
            })

        # Metrics
        cal_diff = round(curr_total_calories - prev_total_calories, 1)
        cal_pct = ComparisonService._calc_pct(curr_total_calories, prev_total_calories)

        work_diff = curr_total_workouts - prev_total_workouts
        work_pct = ComparisonService._calc_pct(float(curr_total_workouts), float(prev_total_workouts))

        dur_diff = curr_total_duration - prev_total_duration
        dur_pct = ComparisonService._calc_pct(float(curr_total_duration), float(prev_total_duration))

        metrics = [
            {
                "name": "Total Workouts",
                "current": curr_total_workouts,
                "previous": prev_total_workouts,
                "difference": work_diff,
                "percentage_change": work_pct,
                "is_improved": work_diff >= 0,
            },
            {
                "name": "Calories Burned",
                "current": round(curr_total_calories, 1),
                "previous": round(prev_total_calories, 1),
                "difference": cal_diff,
                "percentage_change": cal_pct,
                "is_improved": cal_diff >= 0,
            },
            {
                "name": "Workout Duration (mins)",
                "current": curr_total_duration,
                "previous": prev_total_duration,
                "difference": dur_diff,
                "percentage_change": dur_pct,
                "is_improved": dur_diff >= 0,
            },
            {
                "name": "Daily Avg Calories",
                "current": round(curr_total_calories / 7.0, 1),
                "previous": round(prev_total_calories / 7.0, 1),
                "difference": round((curr_total_calories - prev_total_calories) / 7.0, 1),
                "percentage_change": cal_pct,
                "is_improved": cal_diff >= 0,
            }
        ]

        # Insights logic
        insights = []
        if cal_diff > 0:
            insights.append(f"🔥 Outstanding energy! You burned {cal_diff} more kcal (+{cal_pct}%) this week than last week.")
        elif cal_diff < 0:
            insights.append(f"📉 You burned {abs(cal_diff)} fewer calories ({cal_pct}%) compared to last week. An extra session can get you back on top!")
        else:
            insights.append("⚖️ Calorie burn is steady and identical to last week.")

        if work_diff > 0:
            insights.append(f"💪 You completed {work_diff} more workout session{'s' if work_diff > 1 else ''} than last week.")
        elif work_diff < 0:
            insights.append(f"⚡ Workout volume is down by {abs(work_diff)} session{'s' if abs(work_diff) > 1 else ''}. Try scheduling a session in your planner.")
        else:
            insights.append(f"🎯 Workout consistency maintained at {curr_total_workouts} sessions.")

        if best_day_name != "N/A":
            insights.append(f"⭐ Peak performance day was {best_day_name} with {max_daily_cal} kcal burned.")

        return {
            "period_label": f"This Week ({curr_start.strftime('%b %d')} - {curr_end.strftime('%b %d')}) vs Last Week ({prev_start.strftime('%b %d')} - {prev_end.strftime('%b %d')})",
            "this_week": {
                "total_workouts": curr_total_workouts,
                "total_calories": round(curr_total_calories, 1),
                "total_duration": curr_total_duration,
                "avg_daily_calories": round(curr_total_calories / 7.0, 1),
                "start_date": curr_start.isoformat(),
                "end_date": curr_end.isoformat(),
            },
            "last_week": {
                "total_workouts": prev_total_workouts,
                "total_calories": round(prev_total_calories, 1),
                "total_duration": prev_total_duration,
                "avg_daily_calories": round(prev_total_calories / 7.0, 1),
                "start_date": prev_start.isoformat(),
                "end_date": prev_end.isoformat(),
            },
            "metrics": metrics,
            "daily_comparison": daily_items,
            "insights": insights,
        }

    @staticmethod
    def get_monthly_comparison(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Compares the current 30-day period against the prior 30-day period.
        """
        today = date.today()
        curr_start = today - timedelta(days=29)
        curr_end = today
        prev_start = today - timedelta(days=59)
        prev_end = today - timedelta(days=30)

        workouts = (
            db.query(Workout)
            .filter(
                Workout.user_id == user_id,
                Workout.workout_date >= prev_start,
                Workout.workout_date <= curr_end
            )
            .all()
        )

        curr_workouts = [w for w in workouts if curr_start <= w.workout_date <= curr_end]
        prev_workouts = [w for w in workouts if prev_start <= w.workout_date <= prev_end]

        c_work = len(curr_workouts)
        c_cal = round(sum(w.calories_burned for w in curr_workouts), 1)
        c_dur = sum(w.duration for w in curr_workouts)

        p_work = len(prev_workouts)
        p_cal = round(sum(w.calories_burned for w in prev_workouts), 1)
        p_dur = sum(w.duration for w in prev_workouts)

        cal_diff = round(c_cal - p_cal, 1)
        cal_pct = ComparisonService._calc_pct(c_cal, p_cal)

        work_diff = c_work - p_work
        work_pct = ComparisonService._calc_pct(float(c_work), float(p_work))

        dur_diff = c_dur - p_dur
        dur_pct = ComparisonService._calc_pct(float(c_dur), float(p_dur))

        # 4-week bucket breakdown
        weekly_breakdown = []
        for w_idx in range(4):
            w_c_start = curr_start + timedelta(days=w_idx * 7)
            w_c_end = min(curr_start + timedelta(days=(w_idx + 1) * 7 - 1), curr_end)

            w_p_start = prev_start + timedelta(days=w_idx * 7)
            w_p_end = min(prev_start + timedelta(days=(w_idx + 1) * 7 - 1), prev_end)

            sub_c = [w for w in curr_workouts if w_c_start <= w.workout_date <= w_c_end]
            sub_p = [w for w in prev_workouts if w_p_start <= w.workout_date <= w_p_end]

            weekly_breakdown.append({
                "week": f"Week {w_idx + 1}",
                "current_calories": round(sum(w.calories_burned for w in sub_c), 1),
                "previous_calories": round(sum(w.calories_burned for w in sub_p), 1),
                "current_workouts": len(sub_c),
                "previous_workouts": len(sub_p),
            })

        insights = []
        if cal_diff >= 0:
            insights.append(f"🏆 Overall monthly calories up by {cal_diff} kcal (+{cal_pct}%). Strong monthly improvement!")
        else:
            insights.append(f"📉 Monthly burn is down by {abs(cal_diff)} kcal ({cal_pct}%). Focus on habit maintenance!")

        if work_diff >= 0:
            insights.append(f"🏋️‍♂️ Logged {c_work} workouts this month (+{work_diff} compared to last month).")
        else:
            insights.append(f"⚠️ {c_work} workouts logged vs {p_work} last month. Keep up your routine!")

        return {
            "period_label": f"Past 30 Days vs Prior 30 Days",
            "this_month": {
                "total_workouts": c_work,
                "total_calories": c_cal,
                "total_duration": c_dur,
                "avg_daily_calories": round(c_cal / 30.0, 1),
                "start_date": curr_start.isoformat(),
                "end_date": curr_end.isoformat(),
            },
            "last_month": {
                "total_workouts": p_work,
                "total_calories": p_cal,
                "total_duration": p_dur,
                "avg_daily_calories": round(p_cal / 30.0, 1),
                "start_date": prev_start.isoformat(),
                "end_date": prev_end.isoformat(),
            },
            "metrics": [
                {
                    "name": "Total Workouts",
                    "current": c_work,
                    "previous": p_work,
                    "difference": work_diff,
                    "percentage_change": work_pct,
                    "is_improved": work_diff >= 0,
                },
                {
                    "name": "Total Calories",
                    "current": c_cal,
                    "previous": p_cal,
                    "difference": cal_diff,
                    "percentage_change": cal_pct,
                    "is_improved": cal_diff >= 0,
                },
                {
                    "name": "Total Duration (mins)",
                    "current": c_dur,
                    "previous": p_dur,
                    "difference": dur_diff,
                    "percentage_change": dur_pct,
                    "is_improved": dur_diff >= 0,
                }
            ],
            "weekly_breakdown": weekly_breakdown,
            "insights": insights,
        }
