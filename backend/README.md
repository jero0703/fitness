# FitTrack – Backend API

FitTrack Backend is a high-performance, modular RESTful API built with **FastAPI**, **SQLAlchemy ORM**, **MySQL**, and **Pydantic**. It handles JWT authentication, workout logging, daily progress calculation, fitness goal tracking with automated status updates, reports and analytics, and background reminder notifications with **APScheduler**.

---

## 1. Tech Stack

- **Python**: 3.11+ (Tested on Python 3.13)
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy 2.0**: Object-Relational Mapping (ORM)
- **MySQL**: Relational database (`fittrack_db`) with PyMySQL driver
- **Pydantic v2**: Request validation, schema enforcement, and serialization
- **PyJWT & Bcrypt**: Secure token issuance, password hashing, and verification
- **Alembic**: Database migrations and schema versioning
- **APScheduler**: Background scheduled jobs for automated workout and goal alerts
- **Pytest & HTTPX**: Comprehensive automated unit and integration tests

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
│   ├── models/                # SQLAlchemy database entities
│   │   ├── user.py
│   │   ├── workout.py
│   │   ├── progress.py
│   │   ├── goal.py
│   │   └── notification.py
│   ├── schemas/               # Pydantic validation models
│   │   ├── user.py
│   │   ├── workout.py
│   │   ├── progress.py
│   │   ├── goal.py
│   │   └── notification.py
│   ├── routers/               # FastAPI route controllers
│   │   ├── auth.py
│   │   ├── workouts.py
│   │   ├── progress.py
│   │   ├── goals.py
│   │   ├── analytics.py
│   │   └── notifications.py
│   ├── services/              # Business logic & data access layer
│   │   ├── auth_service.py
│   │   ├── workout_service.py
│   │   ├── progress_service.py
│   │   ├── goal_service.py
│   │   ├── analytics_service.py
│   │   └── notification_service.py
│   ├── utils/
│   │   └── scheduler.py       # Background reminder scheduler
│   ├── seed.py                # Database seed script
│   └── main.py                # Application entrypoint & middleware
├── alembic/                   # Database migration scripts
├── tests/                     # 20 pytest unit and integration tests
├── alembic.ini
├── requirements.txt
├── .env.example
└── README.md
```

---

## 3. Database Configuration

FitTrack is designed for **MySQL** (`fittrack_db`).

### MySQL Database Setup

1. Start your local MySQL service (e.g., MySQL 8.0 or XAMPP MariaDB).
2. Create the target database:
   ```sql
   CREATE DATABASE IF NOT EXISTS fittrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Update `.env` with your MySQL credentials:
   ```env
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=fittrack_db
   DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/fittrack_db
   AUTO_SQLITE_FALLBACK=True
   ```
*(Note: If MySQL is unavailable during local development, the server smoothly falls back to SQLite `sqlite:///./fittrack.db` without crashing).*

---

## 4. Setup & Run Instructions (Windows PowerShell)

### Step 1: Install Dependencies
```powershell
python -m pip install -r requirements.txt
```

### Step 2: Apply Database Migrations
```powershell
alembic upgrade head
```

### Step 3: (Optional) Seed Sample Data
Populate the database with a test user (`alex@fittrack.com` / `Secret123!`), diverse workouts, goals, and notifications:
```powershell
python -m app.seed
```

### Step 4: Start the Development Server
```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc Documentation: `http://127.0.0.1:8000/redoc`

---

## 5. Running Automated Tests

Run the full pytest suite (20 tests covering Auth, Workouts, Progress, Goals, Analytics, and Notifications):
```powershell
pytest -v
```

---

## 6. API Reference Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and obtain JWT token | No |
| `GET` | `/auth/me` | Current authenticated user profile | Yes |
| `POST` | `/workouts/` | Log a new workout | Yes |
| `GET` | `/workouts/` | List workouts with category/date/search filter | Yes |
| `GET` | `/workouts/{id}` | Get specific workout details | Yes |
| `PUT` | `/workouts/{id}` | Update existing workout | Yes |
| `DELETE` | `/workouts/{id}` | Delete workout | Yes |
| `GET` | `/progress/daily` | Get daily summary & workouts for a date | Yes |
| `GET` | `/progress/weekly` | Rolling 7-day progress breakdown | Yes |
| `GET` | `/progress/monthly` | Month-to-date & weekly breakdown | Yes |
| `POST` | `/goals/` | Create a new fitness goal | Yes |
| `GET` | `/goals/` | List all goals with progress percentages | Yes |
| `GET` | `/goals/{id}` | Get goal by ID | Yes |
| `PUT` | `/goals/{id}` | Update goal progress or deadline | Yes |
| `DELETE` | `/goals/{id}` | Delete goal | Yes |
| `GET` | `/analytics/weekly` | Weekly workouts by day (Bar Chart) | Yes |
| `GET` | `/analytics/monthly` | 30-day progression (Line Chart) | Yes |
| `GET` | `/analytics/calories` | 14-day energy output (Area Chart) | Yes |
| `GET` | `/analytics/categories`| Workout category distribution (Pie Chart) | Yes |
| `GET` | `/notifications/` | List all user notifications | Yes |
| `GET` | `/notifications/unread-count` | Get total unread count | Yes |
| `PUT` | `/notifications/{id}/read` | Mark single notification as read | Yes |
| `PUT` | `/notifications/read-all` | Mark all notifications as read | Yes |
| `DELETE` | `/notifications/{id}` | Delete notification | Yes |
| `POST` | `/notifications/trigger-reminders` | Trigger scheduled reminder check | Yes |
