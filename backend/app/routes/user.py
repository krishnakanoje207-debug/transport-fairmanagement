"""
SafeRoute - User Routes
Profile management, linked users, settings
"""
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId

from ..config.database import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user_model import UserUpdate

router = APIRouter()


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    current_user.pop("hashed_password", None)
    current_user["_id"] = str(current_user["_id"])
    return current_user


@router.put("/profile")
async def update_profile(
    data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    update = {k: v for k, v in data.dict().items() if v is not None}
    if update:
        update["updated_at"] = datetime.utcnow()
        await db.users.update_one({"_id": ObjectId(current_user["id"])}, {"$set": update})
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    user["id"] = str(user["_id"])
    user.pop("hashed_password", None)
    user.pop("_id", None)
    return user


@router.put("/settings")
async def update_settings(
    settings: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"settings": settings, "updated_at": datetime.utcnow()}}
    )
    return {"message": "Settings updated"}


@router.get("/linked-users")
async def get_linked_users(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all linked users for a guardian"""
    if current_user.get("role") not in ["guardian", "admin"]:
        raise HTTPException(403, "Only guardians can view linked users")
    linked_ids = current_user.get("linked_user_ids", [])
    users = []
    for lid in linked_ids:
        try:
            u = await db.users.find_one({"_id": ObjectId(lid)})
            if u:
                users.append({
                    "id": str(u["_id"]),
                    "first_name": u["first_name"],
                    "last_name": u["last_name"],
                    "email": u["email"],
                    "phone": u.get("phone", ""),
                    "relation": u.get("relation", ""),
                    "blood_group": u.get("blood_group", ""),
                    "gender": u.get("gender", ""),
                    "is_active": u.get("is_active", True),
                    "date_of_birth": u.get("date_of_birth"),
                    "special_notes": u.get("special_notes", ""),
                    "created_at": u.get("created_at"),
                })
        except Exception:
            continue
    return {"linked_users": users}


@router.delete("/linked-users/{user_id}")
async def remove_linked_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.get("role") not in ["guardian", "admin"]:
        raise HTTPException(403, "Only guardians can remove linked users")
    # Remove from guardian's list
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$pull": {"linked_user_ids": user_id}}
    )
    # Deactivate linked user
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    return {"message": "Linked user removed"}


@router.get("/stats")
async def get_user_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    uid = current_user["id"]
    total_trips = await db.trips.count_documents({"user_id": uid})
    active_trips = await db.trips.count_documents({"user_id": uid, "status": "active"})
    completed_trips = await db.trips.count_documents({"user_id": uid, "status": "completed"})
    sos_count = await db.trips.count_documents({"user_id": uid, "status": "sos"})

    # Calculate total distance from completed trips
    pipeline = [
        {"$match": {"user_id": uid, "status": "completed"}},
        {"$group": {"_id": None, "total_distance": {"$sum": "$distance_km"}, "total_fare": {"$sum": "$actual_fare"}}}
    ]
    agg = await db.trips.aggregate(pipeline).to_list(1)
    stats = agg[0] if agg else {"total_distance": 0, "total_fare": 0}

    return {
        "total_trips": total_trips,
        "active_trips": active_trips,
        "completed_trips": completed_trips,
        "sos_count": sos_count,
        "total_distance_km": round(stats.get("total_distance", 0), 1),
        "total_fare": round(stats.get("total_fare", 0), 2),
    }


@router.get("/notifications")
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    notifs = await db.notifications.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).limit(20).to_list(20)

    for n in notifs:
        n["id"] = str(n["_id"])
        del n["_id"]
    return {"notifications": notifs}


@router.put("/notifications/{notif_id}/read")
async def mark_notification_read(
    notif_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    await db.notifications.update_one(
        {"_id": ObjectId(notif_id), "user_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}
