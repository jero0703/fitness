from datetime import date, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.models.user import User
from app.schemas.workout_plan import WorkoutPlanCreate, WorkoutPlanUpdate, ConvertToWorkoutRequest
from app.schemas.exercise import ExerciseCreate
from app.routers.workout_plans import (
    create_plan, list_plans, get_upcoming_plans, get_plan, update_plan, delete_plan, convert_to_workout
)
from app.routers.exercises import list_exercises, get_exercise, create_exercise
from app.routers.streak import get_user_streak, sync_user_streak
from app.routers.badges import get_badges, check_awards
from app.routers.comparison import get_weekly_comparison, get_monthly_comparison
from app.services.exercise_service import ExerciseService
from app.services.badge_service import BadgeService

@pytest.fixture
def test_env():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()

    user = User(
        username="endpoint_tester",
        email="endpoints@fittrack.com",
        hashed_password="pw"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    ExerciseService.seed_default_exercises(db)
    BadgeService.seed_default_badges(db)

    yield db, user
    db.close()

def test_workout_plans_endpoints(test_env):
    db, user = test_env
    today = date.today()

    # 1. POST /workout-plans/
    new_plan = create_plan(
        plan_in=WorkoutPlanCreate(
            title="Interval Cardio",
            description="High heart rate workout",
            scheduled_date=today + timedelta(days=2)
        ),
        current_user=user,
        db=db
    )
    assert new_plan.id is not None
    assert new_plan.title == "Interval Cardio"

    # 2. GET /workout-plans/
    plans = list_plans(scheduled_date=None, start_date=None, end_date=None, status=None, limit=50, offset=0, current_user=user, db=db)
    assert len(plans) == 1

    # 3. GET /workout-plans/upcoming
    upcoming = get_upcoming_plans(limit=10, current_user=user, db=db)
    assert len(upcoming) == 1

    # 4. GET /workout-plans/{id}
    fetched = get_plan(id=new_plan.id, current_user=user, db=db)
    assert fetched.id == new_plan.id

    # 5. PUT /workout-plans/{id}
    updated = update_plan(id=new_plan.id, plan_in=WorkoutPlanUpdate(title="Modified Interval Cardio"), current_user=user, db=db)
    assert updated.title == "Modified Interval Cardio"

    # 6. POST /workout-plans/{id}/convert
    workout = convert_to_workout(
        id=new_plan.id,
        req=ConvertToWorkoutRequest(category="Cardio", duration=30, calories_burned=280.0),
        current_user=user,
        db=db
    )
    assert workout.id is not None
    assert workout.workout_name == "Modified Interval Cardio"

    # 7. DELETE /workout-plans/{id}
    res = delete_plan(id=new_plan.id, current_user=user, db=db)
    assert res.status_code == 204

def test_exercises_endpoints(test_env):
    db, user = test_env

    # 1. GET /exercises/
    ex_list = list_exercises(category=None, search=None, limit=50, offset=0, current_user=user, db=db)
    assert len(ex_list) >= 15

    # 2. Category filter
    yoga_list = list_exercises(category="Yoga", search=None, limit=50, offset=0, current_user=user, db=db)
    assert len(yoga_list) > 0

    # 3. Search
    search_list = list_exercises(category=None, search="Bike", limit=50, offset=0, current_user=user, db=db)
    assert len(search_list) > 0

    # 4. GET /exercises/{id}
    single_ex = get_exercise(id=ex_list[0].id, current_user=user, db=db)
    assert single_ex.id == ex_list[0].id

    # 5. POST /exercises/
    custom_ex = create_exercise(
        exercise_in=ExerciseCreate(name="Kettlebell Snatch", category="Strength", duration=20, calories_burned=190.0),
        current_user=user,
        db=db
    )
    assert custom_ex.id is not None
    assert custom_ex.name == "Kettlebell Snatch"

def test_streak_endpoints(test_env):
    db, user = test_env

    streak_data = get_user_streak(current_user=user, db=db)
    assert streak_data["user_id"] == user.id
    assert "current_streak" in streak_data
    assert "longest_streak" in streak_data

    synced = sync_user_streak(current_user=user, db=db)
    assert synced["user_id"] == user.id

def test_badges_endpoints(test_env):
    db, user = test_env

    badges_data = get_badges(current_user=user, db=db)
    assert badges_data["total_badges"] >= 10
    assert "badges" in badges_data

    new_awards = check_awards(current_user=user, db=db)
    assert isinstance(new_awards, list)

def test_comparison_endpoints(test_env):
    db, user = test_env

    w_comp = get_weekly_comparison(current_user=user, db=db)
    assert "this_week" in w_comp
    assert "last_week" in w_comp
    assert "metrics" in w_comp

    m_comp = get_monthly_comparison(current_user=user, db=db)
    assert "this_month" in m_comp
    assert "last_month" in m_comp
    assert "weekly_breakdown" in m_comp
