from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.badge import Badge, UserBadge
from app.models.workout import Workout
from app.models.goal import Goal
from app.models.streak import Streak
from app.models.notification import Notification

DEFAULT_BADGES = [
    # Workouts
    {"name": "First Step", "description": "Logged your first workout session on FitTrack.", "icon": "Footprints", "category": "Workouts", "criteria_type": "workouts", "criteria_threshold": 1},
    {"name": "High Five", "description": "Completed 5 workout sessions.", "icon": "Hand", "category": "Workouts", "criteria_type": "workouts", "criteria_threshold": 5},
    {"name": "Tenacious 10", "description": "Completed 10 workout sessions. Consistency is building!", "icon": "Dumbbell", "category": "Workouts", "criteria_type": "workouts", "criteria_threshold": 10},
    {"name": "Quarter Century", "description": "Completed 25 workout sessions.", "icon": "Trophy", "category": "Workouts", "criteria_type": "workouts", "criteria_threshold": 25},
    {"name": "Century Club", "description": "Completed 100 workout sessions. True fitness dedication!", "icon": "Crown", "category": "Workouts", "criteria_type": "workouts", "criteria_threshold": 100},

    # Streaks
    {"name": "Streak Spark", "description": "Maintained a 3-day consecutive workout streak.", "icon": "Flame", "category": "Streaks", "criteria_type": "streak", "criteria_threshold": 3},
    {"name": "Streak Fire", "description": "Maintained a 7-day workout streak. Unstoppable momentum!", "icon": "Zap", "category": "Streaks", "criteria_type": "streak", "criteria_threshold": 7},
    {"name": "Two-Week Triumph", "description": "Maintained a 14-day consecutive workout streak.", "icon": "ShieldCheck", "category": "Streaks", "criteria_type": "streak", "criteria_threshold": 14},
    {"name": "Iron Discipline", "description": "Achieved an incredible 30-day workout streak!", "icon": "Medal", "category": "Streaks", "criteria_type": "streak", "criteria_threshold": 30},

    # Goals
    {"name": "Goal Setter", "description": "Created your very first fitness milestone goal.", "icon": "Target", "category": "Goals", "criteria_type": "goals_created", "criteria_threshold": 1},
    {"name": "Goal Crusher", "description": "Successfully completed your first fitness goal!", "icon": "CheckCircle2", "category": "Goals", "criteria_type": "goals_completed", "criteria_threshold": 1},
    {"name": "Triple Crown", "description": "Successfully completed 3 fitness goals.", "icon": "Award", "category": "Goals", "criteria_type": "goals_completed", "criteria_threshold": 3},

    # Calories
    {"name": "Calorie Torch", "description": "Burned over 1,000 total calories through workouts.", "icon": "Sparkles", "category": "Calories", "criteria_type": "calories", "criteria_threshold": 1000},
    {"name": "Calorie Inferno", "description": "Burned over 5,000 total calories on FitTrack.", "icon": "Flame", "category": "Calories", "criteria_type": "calories", "criteria_threshold": 5000},
]

class BadgeService:
    @staticmethod
    def seed_default_badges(db: Session) -> int:
        count = 0
        for item in DEFAULT_BADGES:
            existing = db.query(Badge).filter(Badge.name == item["name"]).first()
            if not existing:
                b = Badge(
                    name=item["name"],
                    description=item["description"],
                    icon=item["icon"],
                    category=item["category"],
                    criteria_type=item["criteria_type"],
                    criteria_threshold=item["criteria_threshold"],
                )
                db.add(b)
                count += 1
        if count > 0:
            db.commit()
        return count

    @staticmethod
    def check_and_award_badges(db: Session, user_id: int) -> List[Badge]:
        """
        Evaluates user milestones across workouts, streaks, goals, and calories.
        Awards any newly earned badges, creates an in-app notification, and returns the list of newly awarded badges.
        """
        # Ensure default badges are present
        if db.query(Badge).count() == 0:
            BadgeService.seed_default_badges(db)

        # Existing earned badge IDs
        earned_badge_ids = set(
            r[0] for r in db.query(UserBadge.badge_id).filter(UserBadge.user_id == user_id).all()
        )

        # Calculate user stats
        total_workouts = db.query(func.count(Workout.id)).filter(Workout.user_id == user_id).scalar() or 0
        total_calories = db.query(func.coalesce(func.sum(Workout.calories_burned), 0.0)).filter(Workout.user_id == user_id).scalar() or 0.0

        user_streak = db.query(Streak).filter(Streak.user_id == user_id).first()
        streak_val = max(user_streak.current_streak, user_streak.longest_streak) if user_streak else 0

        goals_created = db.query(func.count(Goal.id)).filter(Goal.user_id == user_id).scalar() or 0
        goals_completed = db.query(func.count(Goal.id)).filter(Goal.user_id == user_id, Goal.status == "COMPLETED").scalar() or 0

        all_badges = db.query(Badge).all()
        newly_awarded = []

        for badge in all_badges:
            if badge.id in earned_badge_ids:
                continue

            qualifies = False
            if badge.criteria_type == "workouts" and total_workouts >= badge.criteria_threshold:
                qualifies = True
            elif badge.criteria_type == "streak" and streak_val >= badge.criteria_threshold:
                qualifies = True
            elif badge.criteria_type == "goals_created" and goals_created >= badge.criteria_threshold:
                qualifies = True
            elif badge.criteria_type == "goals_completed" and goals_completed >= badge.criteria_threshold:
                qualifies = True
            elif badge.criteria_type == "calories" and total_calories >= badge.criteria_threshold:
                qualifies = True

            if qualifies:
                user_badge = UserBadge(
                    user_id=user_id,
                    badge_id=badge.id,
                    earned_at=datetime.now(timezone.utc)
                )
                db.add(user_badge)
                newly_awarded.append(badge)

                # Send Notification
                notif = Notification(
                    user_id=user_id,
                    title=f"Achievement Unlocked: {badge.name}! 🏆",
                    message=f"Congratulations! You unlocked the '{badge.name}' badge: {badge.description}",
                    is_read=False
                )
                db.add(notif)

        if newly_awarded:
            db.commit()

        return newly_awarded

    @staticmethod
    def get_user_badges(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Retrieves all badges with earned status, earned timestamp, and current progress metrics.
        """
        if db.query(Badge).count() == 0:
            BadgeService.seed_default_badges(db)

        # First trigger check to ensure up-to-date awards
        BadgeService.check_and_award_badges(db, user_id)

        all_badges = db.query(Badge).order_by(Badge.id.asc()).all()
        user_badges_map = {
            ub.badge_id: ub for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
        }

        # Calculate current user stats for progress display
        total_workouts = db.query(func.count(Workout.id)).filter(Workout.user_id == user_id).scalar() or 0
        total_calories = db.query(func.coalesce(func.sum(Workout.calories_burned), 0.0)).filter(Workout.user_id == user_id).scalar() or 0.0

        user_streak = db.query(Streak).filter(Streak.user_id == user_id).first()
        streak_val = max(user_streak.current_streak, user_streak.longest_streak) if user_streak else 0

        goals_created = db.query(func.count(Goal.id)).filter(Goal.user_id == user_id).scalar() or 0
        goals_completed = db.query(func.count(Goal.id)).filter(Goal.user_id == user_id, Goal.status == "COMPLETED").scalar() or 0

        badges_output = []
        earned_count = 0

        for badge in all_badges:
            ub = user_badges_map.get(badge.id)
            is_earned = (ub is not None)
            if is_earned:
                earned_count += 1

            # Determine progress
            current_progress = 0
            if badge.criteria_type == "workouts":
                current_progress = total_workouts
            elif badge.criteria_type == "streak":
                current_progress = streak_val
            elif badge.criteria_type == "goals_created":
                current_progress = goals_created
            elif badge.criteria_type == "goals_completed":
                current_progress = goals_completed
            elif badge.criteria_type == "calories":
                current_progress = int(total_calories)

            badges_output.append({
                "id": badge.id,
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon,
                "category": badge.category,
                "criteria_type": badge.criteria_type,
                "criteria_threshold": badge.criteria_threshold,
                "earned": is_earned,
                "earned_at": ub.earned_at if is_earned else None,
                "progress": min(current_progress, badge.criteria_threshold),
                "target": badge.criteria_threshold,
            })

        return {
            "total_badges": len(all_badges),
            "earned_count": earned_count,
            "badges": badges_output,
        }
