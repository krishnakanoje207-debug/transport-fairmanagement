"""
SafeRoute - Messaging Routes
In-app notifications and email (via EmailJS frontend integration)
"""
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId

from ..config.database import get_db
from ..middleware.auth_middleware import get_current_user

router = APIRouter()


@router.get("/inbox")
async def get_inbox(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    msgs = await db.messages.find(
        {"recipient_id": current_user["id"]}
    ).sort("created_at", -1).limit(50).to_list(50)
    for m in msgs:
        m["id"] = str(m["_id"])
        del m["_id"]
    return {"messages": msgs}


@router.post("/send")
async def send_message(
    recipient_id: str,
    subject: str,
    body: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    msg = {
        "from_id": current_user["id"],
        "from_name": f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}",
        "recipient_id": recipient_id,
        "subject": subject,
        "body": body,
        "read": False,
        "created_at": datetime.utcnow(),
    }
    await db.messages.insert_one(msg)

    # Create notification
    await db.notifications.insert_one({
        "user_id": recipient_id,
        "type": "message",
        "message": f"New message from {msg['from_name']}: {subject}",
        "color": "#3a5fc8",
        "read": False,
        "created_at": datetime.utcnow(),
    })

    return {"message": "Message sent"}


@router.put("/{msg_id}/read")
async def mark_read(
    msg_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    await db.messages.update_one(
        {"_id": ObjectId(msg_id), "recipient_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}


@router.get("/emailjs-config")
async def get_emailjs_config():
    """Return EmailJS config for frontend (public keys only)"""
    from ..config.settings import settings
    return {
        "service_id": settings.EMAILJS_SERVICE_ID,
        "template_id": settings.EMAILJS_TEMPLATE_ID,
        "public_key": settings.EMAILJS_PUBLIC_KEY,
        "configured": bool(settings.EMAILJS_SERVICE_ID and settings.EMAILJS_PUBLIC_KEY),
    }
