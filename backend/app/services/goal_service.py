from datetime import date
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.goal import Goal
from app.models.notification import Notification
from app.schemas.goal import GoalCreate, GoalUpdate, GoalOut

class GoalService:
    @staticmethod
    def _compute_goal_state(goal: Goal) -> None:
        """
        Dynamically updates the goal's status and overdue indicator.
        """
        today = date.today()
        if goal.current_value >= goal.target_value:
            goal.status = "COMPLETED"
        elif today > goal.deadline:
            goal.status = "OVERDUE"
        elif goal.current_value > 0:
            goal.status = "IN_PROGRESS"
        else:
            goal.status = "NOT_STARTED"

    @staticmethod
    def _to_goal_out(goal: Goal) -> GoalOut:
        today = date.today()
        GoalService._compute_goal_state(goal)
        pct = 0.0
        if goal.target_value > 0:
            pct = min(100.0, round((goal.current_value / goal.target_value) * 100.0, 1))

        is_overdue = (today > goal.deadline and goal.status != "COMPLETED")

        return GoalOut(
            id=goal.id,
            user_id=goal.user_id,
            goal_type=goal.goal_type,
            target_value=goal.target_value,
            current_value=goal.current_value,
            deadline=goal.deadline,
            created_at=goal.created_at,
            status=goal.status,
            percentage=pct,
            is_overdue=is_overdue
        )

    @staticmethod
    def create_goal(db: Session, user_id: int, goal_data: GoalCreate) -> GoalOut:
        goal = Goal(
            user_id=user_id,
            goal_type=goal_data.goal_type.strip(),
            target_value=goal_data.target_value,
            current_value=goal_data.current_value,
            deadline=goal_data.deadline
        )
        GoalService._compute_goal_state(goal)
        db.add(goal)
        db.commit()
        db.refresh(goal)

        # Create goal creation notification
        notif = Notification(
            user_id=user_id,
            title=f"New Goal Created: {goal.goal_type}",
            message=f"Target: {goal.target_value}. Target date: {goal.deadline}. Keep pushing!"
        )
        db.add(notif)
        db.commit()

        return GoalService._to_goal_out(goal)

    @staticmethod
    def get_goals(db: Session, user_id: int) -> List[GoalOut]:
        goals = db.query(Goal).filter(Goal.user_id == user_id).order_by(Goal.deadline.asc()).all()
        # Ensure status updates are persisted
        has_changes = False
        for g in goals:
            prev_status = g.status
            GoalService._compute_goal_state(g)
            if g.status != prev_status:
                has_changes = True

        if has_changes:
            db.commit()

        return [GoalService._to_goal_out(g) for g in goals]

    @staticmethod
    def get_goal_by_id(db: Session, user_id: int, goal_id: int) -> GoalOut:
        goal = db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        if goal.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this goal")

        GoalService._compute_goal_state(goal)
        db.commit()
        return GoalService._to_goal_out(goal)

    @staticmethod
    def update_goal(db: Session, user_id: int, goal_id: int, update_data: GoalUpdate) -> GoalOut:
        goal = db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        if goal.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this goal")

        previous_status = goal.status
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                if isinstance(value, str):
                    setattr(goal, key, value.strip())
                else:
                    setattr(goal, key, value)

        GoalService._compute_goal_state(goal)
        db.commit()
        db.refresh(goal)

        # Notify if completed
        if goal.status == "COMPLETED" and previous_status != "COMPLETED":
            notif = Notification(
                user_id=user_id,
                title=f"Goal Achieved! 🎉",
                message=f"Congratulations! You completed your goal: '{goal.goal_type}' (Target: {goal.target_value})."
            )
            db.add(notif)
            db.commit()

        return GoalService._to_goal_out(goal)

    @staticmethod
    def delete_goal(db: Session, user_id: int, goal_id: int) -> None:
        goal = db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        if goal.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this goal")

        db.delete(goal)
        db.commit()
