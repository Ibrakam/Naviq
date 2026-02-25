import structlog

from app.tasks.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(name="send_notification")
def send_notification_task(user_id: str, message: str, channel: str = "email"):
    """Placeholder for sending notifications (email, push, etc.)."""
    logger.info("notification.send", user_id=user_id, channel=channel, message_preview=message[:50])
    return {"status": "sent", "user_id": user_id, "channel": channel}
