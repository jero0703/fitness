# FitTrack – Fitness & Workout Management Platform

**FitTrack** is a production-grade, full-stack fitness and workout tracking platform designed to help users record daily workouts, monitor active progress, set and track fitness milestones, visualize trends through dynamic charts, and receive automated background notifications.

Built with **FastAPI**, **SQLAlchemy ORM**, **MySQL**, **React**, **Tailwind CSS**, and **Recharts**.

---

## 1. System Architecture

```
FitTrack/
│
├── backend/                       # FastAPI Backend
│   ├── app/
│   │   ├── core/                  # Config, JWT Security & Dependencies
│   │   ├── database/              # SQLAlchemy Base & Connection Pooling
│   │   ├── models/                # User, Workout, Progress, Goal, Notification
│   │   ├── schemas/               # Pydantic v2 Request & Response schemas
│   │   ├── routers/               # Auth, Workouts, Progress, Goals, Analytics, Notifications
│   │   ├── services/              # Business logic & data access
│   │   ├── utils/                 # APScheduler reminder jobs
│   │   ├── seed.py                # Database population script
│   │   └── main.py                # FastAPI entrypoint
│   ├── alembic/                   # Database migrations
│   ├── tests/                     # 20 Automated pytest unit & integration tests
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/                      # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/            # StatCard, WorkoutModal, GoalModal, DeleteConfirmModal
│   │   ├── context/               # AuthContext (JWT State & Token Storage)
│   │   ├── layouts/               # DashboardLayout (Sidebar, TopNav, Dropdowns)
│   │   ├── pages/                 # Dashboard, Workouts, Progress, Goals, Analytics, Notifications, Settings
│   │   ├── routes/                # ProtectedRoute guard
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
- **MySQL (`fittrack_db`)**: Primary database with PyMySQL driver
- **Pydantic v2**: Data validation and response serialization
- **PyJWT & Bcrypt**: Secure password hashing and JWT token issuance
- **APScheduler**: Automated background reminders
- **Alembic**: Database migrations and schema revisions
- **Pytest**: 20 automated unit and integration tests

### Frontend
- **React 19 + Vite**: Modern, high-speed single-page application
- **Tailwind CSS**: Custom fitness theme (`#F8FAFC` bg, `#111827` sidebar, `#22C55E` emerald, `#14B8A6` teal)
- **React Router DOM v7**: Client-side routing with protected route guards
- **Axios**: Centralized HTTP client with automatic JWT injection & 401 handling
- **Recharts**: Dynamic responsive charts (Bar, Line, Area, Pie)
- **Lucide React**: Modern iconography
- **React Toastify**: Interactive alerts and feedback

---

## 3. Core Modules & Features

1. **User Authentication**:
   - Registration with duplicate email prevention.
   - Secure password hashing using Bcrypt.
   - JWT access token generation with expiration.
   - Protected routes and Axios request interceptor.
   - Forgot Password UI.
   - Demo account auto-fill button (`alex@fittrack.com`).

2. **Workout Management**:
   - Log workouts across Cardio, Strength, Yoga, HIIT, Pilates, Running, Cycling, Swimming.
   - Duration and calorie validation.
   - Built-in calorie estimation tool.
   - Filter by category and date range; search by workout title.
   - Edit and delete workouts with ownership protection.
   - Automatic synchronization with daily progress records.

3. **Daily Progress Tracking**:
   - Calculates daily workouts, calories burned, and total duration.
   - Derived directly from workout records to prevent discrepancies.
   - Prevents duplicate progress records via unique constraints.
   - Rolling 7-day breakdown and monthly week-by-week summaries.
   - Historic date selector.

4. **Fitness Goal Management**:
   - Set goals (Weight Loss, Steps, Workouts, Distance, etc.) with deadlines.
   - Live percentage calculation and progress bars.
   - Dynamic status calculation: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`.
   - Quick progress adjustment buttons (+1, +5).
   - Automatic celebration notifications upon goal completion.

5. **Reports & Analytics (Recharts)**:
   - Weekly Workout Bar Chart
   - Monthly Progress 30-Day Line Chart
   - Daily Calories Burned 14-Day Area Chart
   - Workout Category Distribution Pie Chart
   - Minutes Trained by Category Horizontal Bar Chart
   - Connected dynamically to backend APIs (no hardcoded data).

6. **Notification System & Scheduler**:
   - Top-navigation notification bell with unread badge and dropdown.
   - Dedicated notification management view.
   - Mark as read, mark all read, and delete.
   - Background APScheduler checks for daily workout reminders and approaching goal deadlines.
   - Manual "Simulate Reminders" button for instant testing.

---

## 4. Quick Start (Windows PowerShell)

### Prerequisites
- Python 3.11+
- Node.js v18+ & npm
- MySQL Server (optional; automated SQLite fallback is enabled for zero-config local testing)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```powershell
   cd backend
   ```

2. **Install Python dependencies**:
   ```powershell
   python -m pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` if not already present:
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Setup MySQL Database (`fittrack_db`)**:
   Ensure MySQL is running on `localhost:3306` and create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS fittrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(If MySQL is not installed locally, the backend automatically uses SQLite `sqlite:///./fittrack.db` without crashing).*

5. **Run Database Migrations**:
   ```powershell
   alembic upgrade head
   ```

6. **Seed Sample Data (Workouts, Goals, Notifications)**:
   ```powershell
   python -m app.seed
   ```

7. **Start the Backend Server**:
   ```powershell
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API URL: `http://127.0.0.1:8000`
   - Swagger Documentation: `http://127.0.0.1:8000/docs`

---

### Frontend Setup

1. **Open a new PowerShell terminal and navigate to `frontend`**:
   ```powershell
   cd frontend
   ```

2. **Install Node dependencies**:
   ```powershell
   npm install
   ```

3. **Start the Development Server**:
   ```powershell
   npm run dev
   ```
   - Frontend URL: `http://localhost:5173`

4. **(Optional) Build for Production**:
   ```powershell
   npm run build
   ```

---

## 5. Sample Credentials

For instant testing, use the pre-seeded account (or click **"Auto Fill"** on the login page):

- **Email**: `alex@fittrack.com`
- **Password**: `Secret123!`

---

## 6. Running Automated Tests

Run the full pytest suite in `backend/`:
```powershell
cd backend
pytest -v
```

**Results**: 20/20 tests passing:
- Authentication & JWT validation (Registration, login, duplicate check, 401 guard)
- Workout CRUD, category & date filters, user ownership enforcement
- Progress synchronization and duplicate aggregate prevention
- Goal lifecycle, automated status transitions, deadline tracking
- Reports and analytics endpoints (weekly, monthly, calories, categories)
- Notification lifecycle, unread counter, and automated reminders

---

## 7. Security Highlights

- **JWT Bearer Token Authentication**: Stored securely in `localStorage` and dispatched in `Authorization: Bearer <token>` headers.
- **Bcrypt Password Hashing**: Passwords are never stored in plaintext and are salted with 12 rounds.
- **User Ownership Validation**: All workout, goal, and notification endpoints verify the resource belongs to `current_user.id`.
- **SQL Injection Prevention**: SQLAlchemy parameterized queries across all operations.
- **Strict Pydantic Validation**: Input data types, lengths, and constraints are strictly validated before hitting the database.
- **CORS Protection**: Whitelisted origin headers configurable via `.env`.
