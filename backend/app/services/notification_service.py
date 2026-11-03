from datetime import datetime, date, timedelta, timezone
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.notification import Notification
from app.models.user import User
from app.models.workout import Workout
from app.models.goal import Goal
from app.schemas.notification import NotificationOut, NotificationCountOut

class NotificationService:
    @staticmethod
    def create_notification(db: Session, user_id: int, title: str, message: str) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title.strip(),
            message=message.strip(),
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def get_notifications(db: Session, user_id: int, limit: int = 50) -> List[NotificationOut]:
        notifs = db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).limit(limit).all()
        return [NotificationOut.model_validate(n) for n in notifs]

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> NotificationCountOut:
        count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
        return NotificationCountOut(unread_count=count)

    @staticmethod
    def mark_as_read(db: Session, user_id: int, notification_id: int) -> NotificationOut:
        notif = db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        if not notif:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        if notif.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

        notif.is_read = True
        db.commit()
        db.refresh(notif)
        return NotificationOut.model_validate(notif)

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        updated = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True}, synchronize_session=False)
        db.commit()
        return updated

    @staticmethod
    def delete_notification(db: Session, user_id: int, notification_id: int) -> None:
        notif = db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        if not notif:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        if notif.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

        db.delete(notif)
        db.commit()

    @staticmethod
    def check_and_generate_reminders(db: Session) -> None:
        """
        Background scheduler job:
        1. Daily reminder if user hasn't logged a workout today.
        2. Goal deadline alerts for goals expiring within 2 days.
        Ensures no duplicate alerts are sent on the same day.
        """
        today = date.today()
        today_start = datetime(today.year, today.month, today.day, 0, 0, 0, tzinfo=timezone.utc)

        users = db.query(User).all()
        for user in users:
            # Check if user already worked out today
            today_workouts = db.query(Workout).filter(
                Workout.user_id == user.id,
                Workout.workout_date == today
            ).count()

            if today_workouts == 0:
                # Check if reminder already sent today
                existing = db.query(Notification).filter(
                    Notification.user_id == user.id,
                    Notification.title.like("Daily Workout Reminder%"),
                    Notification.created_at >= today_start
                ).first()

                if not existing:
                    NotificationService.create_notification(
                        db=db,
                        user_id=user.id,
                        title="Daily Workout Reminder 🏃",
                        message=f"Hey {user.username}, don't forget to get moving and record your workout for today!"
                    )

            # Check goals due soon
            goals_due = db.query(Goal).filter(
                Goal.user_id == user.id,
                Goal.status.in_(["NOT_STARTED", "IN_PROGRESS"]),
                Goal.deadline >= today,
                Goal.deadline <= today + timedelta(days=2)
            ).all()

            for g in goals_due:
                existing_goal_notif = db.query(Notification).filter(
                    Notification.user_id == user.id,
                    Notification.title.like(f"Goal Deadline Soon: {g.goal_type}%"),
                    Notification.created_at >= today_start
                ).first()

                if not existing_goal_notif:
                    NotificationService.create_notification(
                        db=db,
                        user_id=user.id,
                        title=f"Goal Deadline Soon: {g.goal_type} ⏰",
                        message=f"Your goal '{g.goal_type}' is due on {g.deadline}. Current progress: {g.current_value}/{g.target_value}."
                    )
