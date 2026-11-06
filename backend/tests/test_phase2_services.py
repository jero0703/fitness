from datetime import date, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.models.user import User
from app.models.workout import Workout
from app.models.goal import Goal
from app.models.workout_plan import WorkoutPlan
from app.models.exercise import Exercise
from app.schemas.workout_plan import WorkoutPlanCreate, WorkoutPlanUpdate, ConvertToWorkoutRequest
from app.schemas.exercise import ExerciseCreate
from app.schemas.workout import WorkoutCreate
from app.services.workout_service import WorkoutService
from app.services.workout_plan_service import WorkoutPlanService
from app.services.exercise_service import ExerciseService
from app.services.streak_service import StreakService
from app.services.badge_service import BadgeService
from app.services.comparison_service import ComparisonService

@pytest.fixture
def test_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()

    # Create test user
    user = User(
        username="test_athlete",
        email="athlete@fittrack.com",
        hashed_password="hashed_pw_xyz"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Seed default exercises and badges
    ExerciseService.seed_default_exercises(db)
    BadgeService.seed_default_badges(db)

    yield db, user
    db.close()

def test_workout_plan_crud_and_conversion(test_db):
    db, user = test_db
    today = date.today()
    tomorrow = today + timedelta(days=1)

    # 1. Create workout plan
    plan_data = WorkoutPlanCreate(
        title="Speed Intervals",
        description="6x 800m repeats",
        scheduled_date=tomorrow,
        status="PLANNED"
    )
    plan = WorkoutPlanService.create_plan(db, user.id, plan_data)
    assert plan.id is not None
    assert plan.title == "Speed Intervals"
    assert plan.scheduled_date == tomorrow
    assert plan.status == "PLANNED"

    # 2. View upcoming workouts
    upcoming = WorkoutPlanService.get_upcoming_plans(db, user.id)
    assert len(upcoming) >= 1
    assert upcoming[0].title == "Speed Intervals"

    # 3. Update workout plan
    updated = WorkoutPlanService.update_plan(
        db, user.id, plan.id,
        WorkoutPlanUpdate(title="Modified Speed Intervals")
    )
    assert updated.title == "Modified Speed Intervals"

    # 4. Convert plan to completed workout
    workout = WorkoutPlanService.convert_to_workout(
        db, user.id, plan.id,
        ConvertToWorkoutRequest(category="Cardio", duration=35, calories_burned=350.0)
    )
    assert workout.id is not None
    assert workout.workout_name == "Modified Speed Intervals"
    assert workout.duration == 35
    assert plan.status == "COMPLETED"

    # 5. Delete plan
    WorkoutPlanService.delete_plan(db, user.id, plan.id)
    assert db.query(WorkoutPlan).filter(WorkoutPlan.id == plan.id).first() is None

def test_exercise_library(test_db):
    db, user = test_db

    # 1. View exercises
    exercises = ExerciseService.get_exercises(db)
    assert len(exercises) >= 15

    # 2. Filter by category
    cardio_ex = ExerciseService.get_exercises(db, category="Cardio")
    assert len(cardio_ex) > 0
    assert all(e.category == "Cardio" for e in cardio_ex)

    strength_ex = ExerciseService.get_exercises(db, category="Strength")
    assert len(strength_ex) > 0
    assert all(e.category == "Strength" for e in strength_ex)

    # 3. Search exercises
    search_res = ExerciseService.get_exercises(db, search="Run")
    assert len(search_res) > 0
    assert any("run" in e.name.lower() or "run" in (e.description or "").lower() for e in search_res)

    # 4. Create custom exercise
    custom = ExerciseService.create_exercise(db, ExerciseCreate(
        name="Battle Ropes Waves",
        category="HIIT",
        duration=15,
        calories_burned=180.0,
        description="Alternating and double wave slams with heavy ropes"
    ))
    assert custom.id is not None
    assert custom.name == "Battle Ropes Waves"

def test_streak_tracking_and_reset(test_db):
    db, user = test_db
    today = date.today()

    # Initially 0 streak
    streak = StreakService.calculate_user_streak(db, user.id)
    assert streak.current_streak == 0

    # Add workout today
    WorkoutService.create_workout(db, user.id, WorkoutCreate(
        workout_name="Morning Run",
        category="Cardio",
        duration=30,
        calories_burned=300.0,
        workout_date=today
    ))
    streak = StreakService.calculate_user_streak(db, user.id)
    assert streak.current_streak == 1
    assert streak.longest_streak >= 1

    # Add workout yesterday -> consecutive streak becomes 2
    WorkoutService.create_workout(db, user.id, WorkoutCreate(
        workout_name="Yesterday Lift",
        category="Strength",
        duration=45,
        calories_burned=250.0,
        workout_date=today - timedelta(days=1)
    ))
    streak = StreakService.calculate_user_streak(db, user.id)
    assert streak.current_streak == 2
    assert streak.longest_streak == 2

    # Verify streak stats formatting
    stats = StreakService.get_streak_stats(db, user.id)
    assert stats["current_streak"] == 2
    assert stats["streak_active"] is True
    assert stats["next_milestone"] == 3
    assert stats["days_to_milestone"] == 1

def test_achievement_badges(test_db):
    db, user = test_db
    today = date.today()

    # Initially, no badges awarded
    badges_info = BadgeService.get_user_badges(db, user.id)
    assert badges_info["total_badges"] >= 10
    assert badges_info["earned_count"] == 0

    # Log 1 workout -> should trigger "First Step" badge
    WorkoutService.create_workout(db, user.id, WorkoutCreate(
        workout_name="Inaugural Workout",
        category="Cardio",
        duration=30,
        calories_burned=150.0,
        workout_date=today
    ))

    badges_info = BadgeService.get_user_badges(db, user.id)
    earned_names = [b["name"] for b in badges_info["badges"] if b["earned"]]
    assert "First Step" in earned_names
    assert badges_info["earned_count"] >= 1

    # Add and complete a goal -> triggers "Goal Setter" and "Goal Crusher"
    goal = Goal(
        user_id=user.id,
        goal_type="Weight Loss",
        target_value=5.0,
        current_value=5.0,
        deadline=today + timedelta(days=30),
        status="COMPLETED"
    )
    db.add(goal)
    db.commit()

    BadgeService.check_and_award_badges(db, user.id)
    updated_info = BadgeService.get_user_badges(db, user.id)
    updated_names = [b["name"] for b in updated_info["badges"] if b["earned"]]
    assert "Goal Crusher" in updated_names

def test_progress_comparison(test_db):
    db, user = test_db
    today = date.today()

    # Log workouts this week
    WorkoutService.create_workout(db, user.id, WorkoutCreate(
        workout_name="Current Week Run",
        category="Cardio",
        duration=40,
        calories_burned=400.0,
        workout_date=today
    ))
    # Log workout last week
    WorkoutService.create_workout(db, user.id, WorkoutCreate(
        workout_name="Last Week Run",
        category="Cardio",
        duration=30,
        calories_burned=250.0,
        workout_date=today - timedelta(days=8)
    ))

    # Weekly comparison
    w_comp = ComparisonService.get_weekly_comparison(db, user.id)
    assert w_comp["this_week"]["total_workouts"] >= 1
    assert w_comp["last_week"]["total_workouts"] >= 1
    assert len(w_comp["daily_comparison"]) == 7
    assert len(w_comp["insights"]) >= 1
    assert any(m["name"] == "Calories Burned" for m in w_comp["metrics"])

    # Monthly comparison
    m_comp = ComparisonService.get_monthly_comparison(db, user.id)
    assert m_comp["this_month"]["total_workouts"] >= 2
    assert len(m_comp["weekly_breakdown"]) == 4
    assert len(m_comp["insights"]) >= 1
