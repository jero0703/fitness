from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class PeriodSummary(BaseModel):
    total_workouts: int
    total_calories: float
    total_duration: int
    avg_daily_calories: float
    start_date: str
    end_date: str

class DayComparisonItem(BaseModel):
    day: str
    date_current: str
    date_previous: str
    current_calories: float
    previous_calories: float
    current_workouts: int
    previous_workouts: int
    current_duration: int
    previous_duration: int

class ComparisonMetric(BaseModel):
    name: str
    current: float
    previous: float
    difference: float
    percentage_change: float
    is_improved: bool

class WeeklyComparisonOut(BaseModel):
    period_label: str
    this_week: PeriodSummary
    last_week: PeriodSummary
    metrics: List[ComparisonMetric]
    daily_comparison: List[DayComparisonItem]
    insights: List[str]

class MonthlyComparisonOut(BaseModel):
    period_label: str
    this_month: PeriodSummary
    last_month: PeriodSummary
    metrics: List[ComparisonMetric]
    weekly_breakdown: List[Dict[str, Any]]
    insights: List[str]
