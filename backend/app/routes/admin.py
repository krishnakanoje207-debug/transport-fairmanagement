"""
SafeRoute - Admin Routes
Dashboard, user/partner/trip management, messaging
"""
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId

from ..config.database import get_db
from ..middleware.auth_middleware import require_role
from ..models.admin_model import MessageTemplate, MessageTemplateUpdate, SendMessage

router = APIRouter()
admin_only = require_role(["admin"])


@router.get("/stats")
async def get_admin_stats(
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    total_users = await db.users.count_documents({"role": {"$ne": "admin"}})
    guardians = await db.users.count_documents({"role": "guardian"})
    linked = await db.users.count_documents({"role": "linked_user"})
    partners = await db.users.count_documents({"role": "travel_partner"})
    total_trips = await db.trips.count_documents({})
    active_trips = await db.trips.count_documents({"status": "active"})
    sos_count = await db.trips.count_documents({"status": "sos"})
    messages = await db.messages.count_documents({})

    return {
        "total_users": total_users,
        "total_guardians": guardians,
        "total_linked_users": linked,
        "total_partners": partners,
        "total_trips": total_trips,
        "active_trips": active_trips,
        "total_sos": sos_count,
        "total_messages": messages,
    }


@router.get("/users")
async def list_users(
    role: str = None,
    search: str = None,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    query = {"role": {"$ne": "admin"}}
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    users = await db.users.find(query).sort("created_at", -1).limit(100).to_list(100)
    for u in users:
        u["id"] = str(u["_id"])
        del u["_id"]
        u.pop("hashed_password", None)
    return {"users": users}


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(404, "User not found")
    user["id"] = str(user["_id"])
    del user["_id"]
    user.pop("hashed_password", None)
    return user


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    data: dict,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    data.pop("_id", None)
    data.pop("hashed_password", None)
    data["updated_at"] = datetime.utcnow()
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": data})
    return {"message": "User updated"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted"}


# ─── Partners ───
@router.get("/partners")
async def list_partners(
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    partners = await db.travel_partners.find().sort("created_at", -1).to_list(100)
    for p in partners:
        p["id"] = str(p["_id"])
        del p["_id"]
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(p["user_id"])}) if p.get("user_id") else None
        if user:
            p["email"] = user.get("email")
            p["phone"] = user.get("phone")
    return {"partners": partners}


@router.delete("/partners/{partner_id}")
async def delete_partner(
    partner_id: str,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    partner = await db.travel_partners.find_one({"_id": ObjectId(partner_id)})
    if partner:
        await db.users.delete_one({"_id": ObjectId(partner.get("user_id"))})
    await db.travel_partners.delete_one({"_id": ObjectId(partner_id)})
    return {"message": "Partner deleted"}


# ─── Trips ───
@router.get("/trips")
async def list_trips(
    status: str = None,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    query = {}
    if status:
        query["status"] = status
    trips = await db.trips.find(query).sort("created_at", -1).limit(100).to_list(100)
    for t in trips:
        t["id"] = str(t["_id"])
        del t["_id"]
    return {"trips": trips}


# ─── Message Templates ───
@router.get("/templates")
async def list_templates(
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    templates = await db.message_templates.find().to_list(50)
    for t in templates:
        t["id"] = str(t["_id"])
        del t["_id"]
    return {"templates": templates}


@router.post("/templates")
async def create_template(
    data: MessageTemplate,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    doc = data.dict()
    doc["created_at"] = datetime.utcnow()
    doc["created_by"] = current_user["id"]
    result = await db.message_templates.insert_one(doc)
    return {"message": "Template created", "id": str(result.inserted_id)}


@router.put("/templates/{template_id}")
async def update_template(
    template_id: str,
    data: MessageTemplateUpdate,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    update = {k: v for k, v in data.dict().items() if v is not None}
    if update:
        update["updated_at"] = datetime.utcnow()
        await db.message_templates.update_one({"_id": ObjectId(template_id)}, {"$set": update})
    return {"message": "Template updated"}


@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: str,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    await db.message_templates.delete_one({"_id": ObjectId(template_id)})
    return {"message": "Template deleted"}


# ─── Send Messages ───
@router.post("/send-message")
async def send_message(
    data: SendMessage,
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Send message to user (stored in DB + notification)"""
    msg = {
        "from_id": current_user["id"],
        "recipient_id": data.recipient_id,
        "recipient_email": data.recipient_email,
        "subject": data.subject,
        "body": data.body,
        "status": "sent",
        "created_at": datetime.utcnow(),
    }
    await db.messages.insert_one(msg)

    # Also create in-app notification
    if data.recipient_id:
        await db.notifications.insert_one({
            "user_id": data.recipient_id,
            "type": "admin_message",
            "message": f"📧 New message: {data.subject}",
            "color": "#3a5fc8",
            "read": False,
            "created_at": datetime.utcnow(),
        })

    return {"message": "Message sent"}


@router.get("/messages")
async def list_messages(
    current_user: dict = Depends(admin_only),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    msgs = await db.messages.find().sort("created_at", -1).limit(100).to_list(100)
    for m in msgs:
        m["id"] = str(m["_id"])
        del m["_id"]
    return {"messages": msgs}
