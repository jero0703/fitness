# FitTrack – Backend API (Phase 1 & Phase 2)

FitTrack Backend is a high-performance, modular RESTful API built with **FastAPI**, **SQLAlchemy ORM**, **MySQL / SQLite**, and **Pydantic**. It handles JWT authentication, workout logging, daily progress calculation, fitness goal tracking, background notifications with **APScheduler**, workout scheduling & calendar planning, predefined exercise catalog, consecutive streak tracking with automated reset, milestone achievement badge evaluations, and comparative analytics.

---

## 1. Tech Stack

- **Python**: 3.11+ (Tested on Python 3.13)
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy 2.0**: Object-Relational Mapping (ORM)
- **MySQL / SQLite**: Primary relational database with automated SQLite fallback
- **Pydantic v2**: Request validation, schema enforcement, and serialization
- **PyJWT & Bcrypt**: Secure token issuance, password hashing, and verification
- **Alembic**: Database migrations and schema versioning
- **APScheduler**: Background scheduled jobs for automated workout and goal alerts
- **Pytest**: Comprehensive automated unit and integration tests

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Environment settings & CORS
│   │   ├── security.py        # Bcrypt hashing & JWT functions
│   │   └── dependencies.py    # Bearer authentication & user resolution
│   ├── database/
│   │   ├── base.py            # SQLAlchemy Declarative Base
│   │   └── connection.py      # Engine creation, pooling & session generator
│   ├── models/                # SQLAlchemy database entities (10 tables)
│   │   ├── user.py
│   │   ├── workout.py
│   │   ├── progress.py
│   │   ├── goal.py
│   │   ├── notification.py
│   │   ├── workout_plan.py    # Phase 2: Workout_Plans
│   │   ├── exercise.py        # Phase 2: Exercises
│   │   ├── streak.py          # Phase 2: Streak
│   │   └── badge.py           # Phase 2: Badges & User_Badges
│   ├── schemas/               # Pydantic validation models
│   │   ├── user.py
│   │   ├── workout.py
│   │   ├── progress.py
│   │   ├── goal.py
│   │   ├── notification.py
│   │   ├── workout_plan.py    # Phase 2: WorkoutPlanCreate, WorkoutPlanOut, etc.
│   │   ├── exercise.py        # Phase 2: ExerciseCreate, ExerciseOut
│   │   ├── streak.py          # Phase 2: StreakOut
│   │   ├── badge.py           # Phase 2: BadgeOut, UserBadgeOut
│   │   └── comparison.py      # Phase 2: WeeklyComparisonOut, MonthlyComparisonOut
│   ├── routers/               # FastAPI route controllers
│   │   ├── auth.py
│   │   ├── workouts.py
│   │   ├── progress.py
│   │   ├── goals.py
│   │   ├── analytics.py
│   │   ├── notifications.py
│   │   ├── workout_plans.py   # Phase 2: /workout-plans & /plans
│   │   ├── exercises.py       # Phase 2: /exercises
│   │   ├── streak.py          # Phase 2: /streak
│   │   ├── badges.py          # Phase 2: /badges
│   │   └── comparison.py      # Phase 2: /comparison
│   ├── services/              # Business logic & data access layer
│   │   ├── auth_service.py
│   │   ├── workout_service.py
│   │   ├── progress_service.py
│   │   ├── goal_service.py
│   │   ├── analytics_service.py
│   │   ├── notification_service.py
│   │   ├── workout_plan_service.py
│   │   ├── exercise_service.py
│   │   ├── streak_service.py
│   │   ├── badge_service.py
│   │   └── comparison_service.py
│   ├── utils/
│   │   └── scheduler.py       # Background reminder scheduler
│   ├── seed.py                # Database seeding script (Phase 1 & Phase 2)
│   └── main.py                # FastAPI entrypoint
├── alembic/                   # Database migrations (Initial & Phase 2)
├── tests/                     # Automated pytest test suites
└── requirements.txt
```

---

## 3. Database Tables (Phase 2 Additions)

- **`workout_plans`**: `id`, `user_id`, `title`, `description`, `scheduled_date`, `status`, `created_at`
- **`exercises`**: `id`, `name`, `category`, `description`, `duration`, `calories_burned`, `difficulty`
- **`streak`**: `id`, `user_id`, `current_streak`, `longest_streak`, `last_workout_date`
- **`badges`**: `id`, `name`, `description`, `icon`, `category`, `criteria_type`, `criteria_threshold`
- **`user_badges`**: `id`, `user_id`, `badge_id`, `earned_at`

---

## 4. API Endpoints

### Workout Plans & Scheduling
- `POST /workout-plans/` - Create a new workout plan for a future date
- `GET /workout-plans/` - List user's workout plans with date range & status filters
- `GET /workout-plans/upcoming` - Get upcoming planned workouts
- `GET /workout-plans/{id}` - Get workout plan details
- `PUT /workout-plans/{id}` - Update workout plan details
- `DELETE /workout-plans/{id}` - Remove workout plan
- `POST /workout-plans/{id}/convert` - Complete plan & log as recorded workout

### Exercise Library
- `GET /exercises/` - Browse exercises with category filtering and search
- `GET /exercises/{id}` - Get single exercise details
- `POST /exercises/` - Create custom exercise entry

### Streak Tracking
- `GET /streak/` - Get user's workout streak, longest streak, and milestone distance
- `POST /streak/sync` - Force recalculate and sync streak

### Achievement Badges
- `GET /badges/` - Get all badges with earned statuses, timestamps, and criteria progress
- `POST /badges/check` - Evaluate and award newly earned milestone badges

### Progress Comparison
- `GET /comparison/weekly` - Weekly comparison (this week vs last week)
- `GET /comparison/monthly` - Monthly comparison (past 30 days vs prior 30 days)

---

## 5. Running the Backend

```powershell
# 1. Install dependencies
python -m pip install -r requirements.txt

# 2. Seed database
python app/seed.py

# 3. Start API
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

## 6. Running Tests

```powershell
python -m pytest tests/test_phase2_services.py tests/test_phase2_endpoints.py -v
```
All 10 tests passing with 100% success rate.
