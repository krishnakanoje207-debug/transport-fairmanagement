"""
SafeRoute - Location Routes
Real-time location updates, route history
"""
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId

from ..config.database import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.location_model import LocationUpdate

router = APIRouter()


@router.post("/update")
async def update_location(
    data: LocationUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    loc = {
        "trip_id": data.trip_id,
        "user_id": current_user["id"],
        "latitude": data.latitude,
        "longitude": data.longitude,
        "accuracy": data.accuracy,
        "speed": data.speed,
        "heading": data.heading,
        "source": data.source,
        "timestamp": datetime.utcnow(),
    }
    await db.locations.insert_one(loc)

    # Check distance from vehicle (if guardian tracking)
    trip = await db.trips.find_one({"_id": ObjectId(data.trip_id)})
    if trip and trip.get("linked_user_id"):
        user = await db.users.find_one({"_id": ObjectId(trip["user_id"])})
        if user and user.get("guardian_id"):
            # NOTE: distance alert logic would go here
            pass

    return {"message": "Location updated", "timestamp": loc["timestamp"]}


@router.get("/latest/{trip_id}")
async def get_latest_location(
    trip_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    loc = await db.locations.find_one(
        {"trip_id": trip_id},
        sort=[("timestamp", -1)]
    )
    if not loc:
        return {"location": None}
    loc["id"] = str(loc["_id"])
    del loc["_id"]
    return {"location": loc}


@router.get("/history/{trip_id}")
async def get_location_history(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
    limit: int = 100
):
    locs = await db.locations.find(
        {"trip_id": trip_id}
    ).sort("timestamp", 1).limit(limit).to_list(limit)
    for l in locs:
        l["id"] = str(l["_id"])
        del l["_id"]
    return {"locations": locs}
