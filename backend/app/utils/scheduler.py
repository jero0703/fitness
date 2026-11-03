import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.database.connection import SessionLocal
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def scheduled_reminder_job():
    logger.info("Executing scheduled notification reminders check...")
    db = SessionLocal()
    try:
        NotificationService.check_and_generate_reminders(db)
        logger.info("Scheduled reminders check finished successfully.")
    except Exception as e:
        logger.error(f"Error in scheduled reminders job: {e}")
    finally:
        db.close()

def start_scheduler():
    try:
        # Run reminders check every 6 hours
        scheduler.add_job(scheduled_reminder_job, "interval", hours=6, id="daily_reminders", replace_existing=True)
        scheduler.start()
        logger.info("APScheduler background scheduler started.")
    except Exception as e:
        logger.warning(f"Could not start background scheduler: {e}")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("APScheduler stopped.")
