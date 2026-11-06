# FitTrack – Fitness & Workout Management Platform (Phase 1 & Phase 2)

**FitTrack** is a production-grade, full-stack fitness and workout tracking platform designed to help users record daily workouts, plan training schedules in advance, monitor active progress, compare performance trends, maintain workout streaks, earn achievement badges, and visualize insights through dynamic charts.

Built with **FastAPI**, **SQLAlchemy ORM**, **MySQL / SQLite**, **React 19**, **Tailwind CSS**, and **Recharts**.

---

## 1. System Architecture

```
FitTrack/
│
├── backend/                       # FastAPI Backend
│   ├── app/
│   │   ├── core/                  # Config, JWT Security & Dependencies
│   │   ├── database/              # SQLAlchemy Base & Connection Pooling
│   │   ├── models/                # User, Workout, Progress, Goal, Notification,
│   │   │                          # WorkoutPlan, Exercise, Streak, Badge, UserBadge
│   │   ├── schemas/               # Pydantic v2 Request & Response schemas
│   │   ├── routers/               # Auth, Workouts, Progress, Goals, Analytics,
│   │   │                          # Notifications, WorkoutPlans, Exercises, Streak,
│   │   │                          # Badges, Comparison
│   │   ├── services/              # Business logic & data access
│   │   ├── utils/                 # APScheduler reminder jobs
│   │   ├── seed.py                # Database population script (Phase 1 & Phase 2)
│   │   └── main.py                # FastAPI entrypoint
│   ├── alembic/                   # Database migrations (Initial & Phase 2)
│   ├── tests/                     # Automated pytest unit & integration test suites
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/                      # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/            # StatCard, WorkoutModal, GoalModal, PlanModal,
│   │   │                          # AchievementModal, DeleteConfirmModal
│   │   ├── context/               # AuthContext (JWT State & Token Storage)
│   │   ├── layouts/               # DashboardLayout (Sidebar, TopNav with Flame Streak, Bell)
│   │   ├── pages/                 # Dashboard, Workouts, WorkoutPlans (Calendar),
│   │   │                          # ExerciseLibrary, Progress (Comparison), Goals,
│   │   │                          # Badges (Trophy Room), Analytics, Notifications, Settings
│   │   ├── routes/                # ProtectedRoute & GuestRoute guards
│   │   ├── services/              # Centralized Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
│
└── README.md
```

---

## 2. Technology Stack

### Backend
- **Python 3.11+** (Tested on Python 3.13)
- **FastAPI**: Asynchronous high-performance REST API
- **SQLAlchemy 2.0**: Relational ORM with connection pooling
- **MySQL (`fittrack_db`)**: Primary database with automatic SQLite fallback (`fittrack.db`)
- **Pydantic v2**: Data validation and response serialization
- **PyJWT & Bcrypt**: Secure password hashing and JWT token issuance
- **APScheduler**: Automated background reminders
- **Alembic**: Database migrations and schema revisions
- **Pytest**: Automated unit and integration test suites

### Frontend
- **React 19 + Vite**: Modern, high-speed single-page application
- **Tailwind CSS**: Custom fitness theme (`#F8FAFC` bg, `#111827` sidebar, `#22C55E` emerald, `#14B8A6` teal)
- **React Router DOM v7**: Client-side routing with protected route guards
- **Axios**: Centralized HTTP client with automatic JWT injection & 401 handling
- **Recharts**: Dynamic responsive charts (Bar, Grouped Bar, Line, Area, Pie)
- **Lucide React**: Modern iconography
- **React Toastify**: Interactive alerts and feedback

---

## 3. Database Schema (10 Tables)

### Phase 1 Core Tables
1. **`users`**: `id`, `username`, `email`, `hashed_password`, `created_at`
2. **`workouts`**: `id`, `user_id`, `workout_name`, `category`, `duration`, `calories_burned`, `workout_date`, `created_at`
3. **`progress`**: `id`, `user_id`, `total_workouts`, `total_calories`, `total_duration`, `date`
4. **`goals`**: `id`, `user_id`, `goal_type`, `target_value`, `current_value`, `deadline`, `status`, `created_at`
5. **`notifications`**: `id`, `user_id`, `title`, `message`, `is_read`, `created_at`

### Phase 2 Advanced Tracking & User Engagement Tables
6. **`workout_plans`**: `id`, `user_id`, `title`, `description`, `scheduled_date`, `status`, `created_at`
7. **`exercises`**: `id`, `name`, `category` (Cardio / Strength / Yoga / HIIT / Pilates), `description`, `duration`, `calories_burned`, `difficulty`
8. **`streak`**: `id`, `user_id`, `current_streak`, `longest_streak`, `last_workout_date`
9. **`badges`**: `id`, `name`, `description`, `icon`, `category`, `criteria_type`, `criteria_threshold`
10. **`user_badges`**: `id`, `user_id`, `badge_id`, `earned_at`

---

## 4. Phase 2 Modules & Feature Implementation

### MODULE 7: Workout Plans & Scheduling
- **Objective**: Plan workouts in advance and schedule training routines.
- **Features**:
  - Create, view, update, and delete workout plans.
  - Schedule workouts for future dates with title, description, and status (`PLANNED` / `COMPLETED`).
  - View upcoming scheduled workouts.
  - One-click **"Complete & Log"** (`POST /workout-plans/{id}/convert`) converting planned workouts into logged workout sessions with progress, streak, and badge synchronization.
- **Frontend**:
  - Interactive **Monthly Calendar View** (`/calendar` or `/plans`) with month navigation, today shortcut, and day cells indicating scheduled plans and completed workouts.
  - **Schedule Planner UI** with quick scheduling modal, day focus sidebar, and status filtering.

### MODULE 8: Exercise Library
- **Objective**: Provide predefined exercises for users.
- **Features**:
  - Curated catalog of 20+ predefined exercises across Cardio, Strength, Yoga, HIIT, and Pilates.
  - Real-time search across exercise names and instruction descriptions.
  - Category filtering by Cardio, Strength, Yoga, HIIT, Pilates.
  - Quick action: **"Log as Workout"** (pre-fills workout name, category, duration, and calories into WorkoutModal).
  - Quick action: **"Schedule Plan"** (pre-fills title and description into PlanModal).
  - Add custom exercises to the user's library.
- **Frontend**:
  - Dedicated **Exercise Library Page** (`/exercises`) with search and filter pills, duration & calorie tags, and action buttons.
  - Integrated quick-selector dropdown inside `WorkoutModal`.

### MODULE 9: Progress Comparison
- **Objective**: Allow users to compare performance over time.
- **Backend Features**:
  - **Weekly Comparison** (`GET /comparison/weekly` or `/progress/comparison/weekly`): Compares Current Week (rolling 7 days) against Previous Week (prior 7 days). Computes day-by-day comparison metrics.
  - **Monthly Comparison** (`GET /comparison/monthly` or `/progress/comparison/monthly`): Compares Current 30 days against Prior 30 days with 4-week bucket breakdown.
  - **Improvement Trends & Insights**: Automated calculations for differences, percentage changes (+/- %), peak performance days, and smart qualitative insight observations.
- **Frontend**:
  - **Progress Comparison UI** inside `/progress` with Weekly and Monthly toggles.
  - Side-by-side **Grouped Recharts Bar Chart** comparing Current vs Previous period.
  - Metric delta cards with percentage growth/drop badges.
  - **Smart Insights Card** displaying automated performance trends.

### MODULE 10: Streak Tracking System
- **Objective**: Encourage consistency in daily workouts.
- **Features**:
  - Tracks consecutive daily workout streaks based on distinct workout dates.
  - Resets current streak to 0 if consecutive workout days are missed.
  - Tracks all-time longest streak record.
  - Automatic streak calculation upon workout creation, update, and deletion.
  - Calculates active streak status and distance to next milestone (3, 7, 14, 21, 30, 60, 90, 100 days).
- **Frontend**:
  - Prominent **Header Streak Pill** (`🔥 {count}d Streak`) in the navigation bar.
  - **Streak Counter Card** on Dashboard with flame animations and milestone progress.

### MODULE 11: Achievement Badges
- **Objective**: Reward users for milestone achievements.
- **Features**:
  - 14 pre-seeded badges across Workouts (First Step, High Five, Tenacious 10, Quarter Century, Century Club), Streaks (Streak Spark, Streak Fire, Two-Week Triumph, Iron Discipline), Goals (Goal Setter, Goal Crusher, Triple Crown), and Calories (Calorie Torch, Calorie Inferno).
  - Automatic milestone evaluation service triggers whenever workouts are logged, goals are achieved, or streaks update.
  - Generates in-app notifications upon unlocking new badges.
- **Frontend**:
  - **Trophy Room & Badges Page** (`/badges`) displaying unlocked badges with vibrant gradients and locked badges with real-time criteria progress bars.
  - **Achievement Popup Modal** (`AchievementModal`) celebrating new milestone unlocks with badge icons and celebratory flair.

### MODULE 12: Personalized Dashboard
- **Objective**: Provide a customized, motivating user experience.
- **Features**:
  - **Personalized Banner** with greeting, active streak status, and dynamic quick-action toolbar.
  - **Daily Summary Cards** (Workouts Today, Calories Burned Today, Active Minutes Today, Daily Streak).
  - **Upcoming Scheduled Workouts** widget with one-click "Complete & Log".
  - **Active Goal Progress** with visual progress bars and status badges.
  - **Milestone Badges Showcase** highlighting latest unlocked achievements.
  - **Weekly Energy Expenditure** Recharts Bar Chart.
  - **Recent Workout Sessions** table with category pills and calories.

---

## 5. Quick Start (Windows PowerShell)

### Prerequisites
- Python 3.11+
- Node.js v18+ & npm
- MySQL Server (optional; automated SQLite fallback is enabled for zero-config local testing)

---

### Backend Setup

1. **Navigate to backend**:
   ```powershell
   cd backend
   ```

2. **Install Python dependencies**:
   ```powershell
   python -m pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Initialize DB & Seed Phase 1 & 2 Data**:
   ```powershell
   python app/seed.py
   ```

5. **Start the Backend Server**:
   ```powershell
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API URL: `http://127.0.0.1:8000`
   - Swagger Documentation: `http://127.0.0.1:8000/docs`

---

### Frontend Setup

1. **Open a new terminal and navigate to `frontend`**:
   ```powershell
   cd frontend
   ```

2. **Install Node dependencies**:
   ```powershell
   npm install
   ```

3. **Start Development Server**:
   ```powershell
   npm run dev
   ```
   - Frontend URL: `http://localhost:5173`

4. **Build Production Bundle**:
   ```powershell
   npm run build
   ```

---

## 6. Sample Credentials

For instant testing, use the pre-seeded account:
- **Email**: `alex@fittrack.com`
- **Password**: `Secret123!`

---

## 7. Running Automated Tests

Run Phase 2 test suites:
```powershell
python -m pytest backend/tests/test_phase2_services.py backend/tests/test_phase2_endpoints.py -v
```
All 10 test suites pass with 100% success rate:
- Workout Plans CRUD, schedule planner, and workout conversion
- Exercise library querying, category filtering, search, and custom exercises
- Streak calculation, consecutive day tracking, and reset on missed days
- Achievement badge evaluation and automatic unlock triggers
- Progress comparison (weekly and monthly) with percentage deltas and insights
- FastAPI router endpoint tests across all Phase 2 routers

---

## 8. Security & Validation

- **JWT Authentication**: Secure Bearer tokens with expiration.
- **Ownership Validation**: Every operation verifies `user_id == current_user.id`.
- **Input Validation**: Strict Pydantic v2 schemas across all request bodies and queries.
- **CORS Protection**: Configurable allowed origin whitelists.
