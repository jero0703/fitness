"""
FitTrack Database Seeding Script
Populates the database with a test athlete, workouts across diverse categories,
daily progress aggregates, fitness goals, and notification alerts.
"""
from datetime import date, timedelta
from app.database.connection import SessionLocal, init_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.workout import Workout
from app.models.goal import Goal
from app.models.notification import Notification
from app.services.progress_service import ProgressService

def seed_database():
    print("Initializing database tables...")
    init_db()
    db = SessionLocal()
    try:
        # Check if user already exists
        email = "alex@fittrack.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creating sample athlete: {email}...")
            user = User(
                username="Alex Morgan",
                email=email,
                hashed_password=get_password_hash("Secret123!")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            print(f"Sample athlete already exists (ID: {user.id}).")

        user_id = user.id
        today = date.today()

        # Seed Workouts over the last 7 days
        sample_workouts = [
            ("Morning 5K Outdoor Run", "Cardio", 32, 340.0, today),
            ("Full Body Functional HIIT", "HIIT", 45, 480.0, today),
            ("Heavy Barbell Squats & Deadlifts", "Strength", 55, 390.0, today - timedelta(days=1)),
            ("Vinyasa Core Flow", "Yoga", 40, 180.0, today - timedelta(days=2)),
            ("Treadmill Intervals", "Cardio", 30, 310.0, today - timedelta(days=3)),
            ("Upper Body Push & Pull", "Strength", 50, 360.0, today - timedelta(days=4)),
            ("Scenic Outdoor Cycling", "Cycling", 60, 520.0, today - timedelta(days=5)),
            ("Restorative Stretch & Core", "Pilates", 25, 140.0, today - timedelta(days=6)),
        ]

        print("Seeding sample workouts...")
        for name, cat, dur, cal, wdate in sample_workouts:
            existing = db.query(Workout).filter(
                Workout.user_id == user_id,
                Workout.workout_name == name,
                Workout.workout_date == wdate
            ).first()
            if not existing:
                w = Workout(
                    user_id=user_id,
                    workout_name=name,
                    category=cat,
                    duration=dur,
                    calories_burned=cal,
                    workout_date=wdate
                )
                db.add(w)

        db.commit()

        # Synchronize progress for each day
        print("Synchronizing progress aggregates...")
        for i in range(7):
            d = today - timedelta(days=i)
            ProgressService.sync_progress_for_date(db, user_id, d)

        # Seed Goals
        print("Seeding fitness goals...")
        sample_goals = [
            ("Weight Loss", 5.0, 3.2, today + timedelta(days=25), "IN_PROGRESS"),
            ("Steps", 10000.0, 8500.0, today + timedelta(days=1), "IN_PROGRESS"),
            ("Workouts", 20.0, 20.0, today + timedelta(days=10), "COMPLETED"),
            ("Running", 50.0, 15.0, today + timedelta(days=45), "IN_PROGRESS"),
            ("Muscle Gain", 3.0, 0.0, today - timedelta(days=2), "OVERDUE"),
        ]

        for gtype, target, curr, dline, stat in sample_goals:
            existing_goal = db.query(Goal).filter(
                Goal.user_id == user_id,
                Goal.goal_type == gtype
            ).first()
            if not existing_goal:
                g = Goal(
                    user_id=user_id,
                    goal_type=gtype,
                    target_value=target,
                    current_value=curr,
                    deadline=dline,
                    status=stat
                )
                db.add(g)

        db.commit()

        # Seed Notifications
        print("Seeding notifications...")
        sample_notifications = [
            ("Goal Achieved! 🎉", "Congratulations! You completed your goal: 'Workouts' (Target: 20 sessions).", False),
            ("Daily Workout Reminder 🏃", "Hey Alex Morgan, don't forget to get moving and record your workout for today!", False),
            ("Goal Deadline Soon: Steps ⏰", "Your goal 'Steps' is due tomorrow. Current progress: 8500.0/10000.0.", False),
            ("Welcome to FitTrack! 👋", "Your account has been set up successfully. Explore your dashboard and start tracking workouts.", True),
        ]

        for title, msg, is_read in sample_notifications:
            existing_notif = db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.title == title
            ).first()
            if not existing_notif:
                n = Notification(
                    user_id=user_id,
                    title=title,
                    message=msg,
                    is_read=is_read
                )
                db.add(n)

        db.commit()
        print("FitTrack seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
