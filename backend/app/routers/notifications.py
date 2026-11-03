from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationOut, NotificationCountOut
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notification System"])

@router.get("/", response_model=List[NotificationOut], summary="List user notifications")
def list_notifications(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch notifications for the logged in user, ordered by newest first.
    """
    return NotificationService.get_notifications(db, current_user.id, limit=limit)

@router.get("/unread-count", response_model=NotificationCountOut, summary="Get unread notification count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the total count of unread notifications for badge display.
    """
    return NotificationService.get_unread_count(db, current_user.id)

@router.put("/read-all", summary="Mark all notifications as read")
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Mark all unread notifications as read for current user.
    """
    count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"message": f"Successfully marked {count} notification(s) as read."}

@router.put("/{id}/read", response_model=NotificationOut, summary="Mark single notification as read")
def mark_as_read(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific notification as read. Validates user ownership.
    """
    return NotificationService.mark_as_read(db, current_user.id, id)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete notification")
def delete_notification(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a notification. Validates user ownership.
    """
    NotificationService.delete_notification(db, current_user.id, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/trigger-reminders", summary="Trigger reminders check manually")
def trigger_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Manually triggers checking of daily workout and goal deadline alerts.
    """
    NotificationService.check_and_generate_reminders(db)
    return {"message": "Reminders checked and notifications generated where applicable."}
