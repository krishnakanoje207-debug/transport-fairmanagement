"""
SafeRoute - Trip Routes
Trip CRUD, status updates, SOS
"""
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
import hashlib, secrets

from ..config.database import get_db
from ..config.security import create_qr_token
from ..middleware.auth_middleware import get_current_user
from ..models.trip_model import TripCreate, TripUpdate

router = APIRouter()

FARE_TABLE = {
    "bus": {"base": 10, "per_km": 2.5},
    "auto": {"base": 25, "per_km": 12},
    "cab": {"base": 50, "per_km": 15},
}


def _estimate_fare(transport_type: str, distance_km: float = 5.0) -> float:
    rates = FARE_TABLE.get(transport_type, FARE_TABLE["bus"])
    fare = rates["base"] + rates["per_km"] * distance_km
    return round(max(fare, rates["base"]), 2)


@router.post("/create")
async def create_trip(
    data: TripCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    uid = current_user["id"]
    estimated_fare = _estimate_fare(data.transport_type)

    trip_dict = {
        "user_id": uid,
        "transport_type": data.transport_type,
        "pickup_location": data.pickup_location,
        "pickup_lat": data.pickup_lat,
        "pickup_lng": data.pickup_lng,
        "drop_location": data.drop_location,
        "drop_lat": data.drop_lat,
        "drop_lng": data.drop_lng,
        "start_time": data.start_time,
        "status": "pending",
        "estimated_fare": estimated_fare,
        "actual_fare": None,
        "distance_km": 0,
        "partner_id": data.partner_id,
        "route_id": data.route_id,
        "linked_user_id": data.linked_user_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.trips.insert_one(trip_dict)
    trip_id = str(result.inserted_id)

    # Generate two distinct QR codes
    tracking_qr_data = create_qr_token({
        "trip_id": trip_id,
        "qr_type": "tracking",
        "user_id": uid,
    }, expires_hours=48)

    trip_start_qr_data = create_qr_token({
        "trip_id": trip_id,
        "qr_type": "trip_start",
        "user_id": uid,
    }, expires_hours=24)

    # Store QR codes
    for qr_type, qr_data in [("tracking", tracking_qr_data), ("trip_start", trip_start_qr_data)]:
        await db.qr_codes.insert_one({
            "code": hashlib.sha256(qr_data.encode()).hexdigest()[:16],
            "trip_id": trip_id,
            "user_id": uid,
            "qr_type": qr_type,
            "token": qr_data,
            "is_used": False,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow(),
        })

    # Update trip with QR tokens
    await db.trips.update_one(
        {"_id": result.inserted_id},
        {"$set": {"tracking_qr": tracking_qr_data, "trip_start_qr": trip_start_qr_data}}
    )

    # Create notification
    await db.notifications.insert_one({
        "user_id": uid,
        "type": "trip_created",
        "message": f"Trip to {data.drop_location} booked! Fare: ₹{estimated_fare}",
        "color": "#3a5fc8",
        "read": False,
        "created_at": datetime.utcnow(),
    })

    return {
        "message": "Trip created",
        "trip_id": trip_id,
        "estimated_fare": estimated_fare,
        "tracking_qr": tracking_qr_data,
        "trip_start_qr": trip_start_qr_data,
    }


@router.get("/active")
async def get_active_trip(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    trip = await db.trips.find_one(
        {"user_id": current_user["id"], "status": {"$in": ["pending", "active"]}},
        sort=[("created_at", -1)]
    )
    if not trip:
        return {"trip": None}
    trip["id"] = str(trip["_id"])
    del trip["_id"]
    return {"trip": trip}


@router.get("/history")
async def get_trip_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
    limit: int = 20
):
    trips = await db.trips.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    for t in trips:
        t["id"] = str(t["_id"])
        del t["_id"]
    return {"trips": trips}


@router.post("/{trip_id}/start")
async def start_trip(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Start a trip (can be triggered by QR scan from partner or manually)"""
    trip = await db.trips.find_one({"_id": ObjectId(trip_id)})
    if not trip:
        raise HTTPException(404, "Trip not found")

    await db.trips.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {"status": "active", "started_at": datetime.utcnow(), "updated_at": datetime.utcnow()}}
    )

    # Notify guardian if linked user
    user_id = trip["user_id"]
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user and user.get("guardian_id"):
        await db.notifications.insert_one({
            "user_id": user["guardian_id"],
            "type": "trip_started",
            "message": f"{user['first_name']}'s trip to {trip['drop_location']} has started!",
            "color": "#3dc47e",
            "read": False,
            "created_at": datetime.utcnow(),
        })

    return {"message": "Trip started", "status": "active"}


@router.post("/{trip_id}/end")
async def end_trip(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    trip = await db.trips.find_one({"_id": ObjectId(trip_id)})
    if not trip:
        raise HTTPException(404, "Trip not found")

    await db.trips.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {
            "status": "completed",
            "ended_at": datetime.utcnow(),
            "actual_fare": trip.get("estimated_fare", 0),
            "updated_at": datetime.utcnow()
        }}
    )
    return {"message": "Trip completed"}


@router.post("/{trip_id}/sos")
async def trigger_sos(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    trip = await db.trips.find_one({"_id": ObjectId(trip_id)})
    if not trip:
        raise HTTPException(404, "Trip not found")

    await db.trips.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {"status": "sos", "sos_triggered_at": datetime.utcnow(), "updated_at": datetime.utcnow()}}
    )

    # Notify guardian
    user = await db.users.find_one({"_id": ObjectId(trip["user_id"])})
    guardian_id = user.get("guardian_id") if user else None
    if guardian_id:
        await db.notifications.insert_one({
            "user_id": guardian_id,
            "type": "sos",
            "message": f"🆘 SOS ALERT! {user['first_name']} triggered emergency on trip to {trip['drop_location']}!",
            "color": "#e05252",
            "read": False,
            "created_at": datetime.utcnow(),
        })

    return {"message": "SOS triggered! Emergency contacts notified."}


@router.post("/scan-start")
async def partner_scan_start(
    token: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Travel partner scans QR to start a trip"""
    from ..config.security import decode_token as dt
    try:
        payload = dt(token)
        if payload.get("qr_type") != "trip_start":
            raise HTTPException(400, "Invalid QR type. Use trip start QR.")
        trip_id = payload.get("trip_id")
        trip = await db.trips.find_one({"_id": ObjectId(trip_id)})
        if not trip:
            raise HTTPException(404, "Trip not found")
        if trip["status"] != "pending":
            raise HTTPException(400, f"Trip already {trip['status']}")

        await db.trips.update_one(
            {"_id": ObjectId(trip_id)},
            {"$set": {"status": "active", "started_at": datetime.utcnow(), "partner_id": current_user["id"]}}
        )
        return {"message": "Trip started via QR scan", "trip_id": trip_id}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Invalid or expired QR code")


@router.get("/tracking/{token}")
async def get_tracking_info(token: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Public endpoint: get trip tracking info from QR token (for Google Maps redirect)"""
    from ..config.security import decode_token as dt
    try:
        payload = dt(token)
        trip_id = payload.get("trip_id")
        trip = await db.trips.find_one({"_id": ObjectId(trip_id)})
        if not trip:
            raise HTTPException(404, "Trip not found")

        # Get latest location
        loc = await db.locations.find_one(
            {"trip_id": trip_id}, sort=[("timestamp", -1)]
        )

        return {
            "trip_id": trip_id,
            "status": trip["status"],
            "drop_location": trip.get("drop_location"),
            "pickup_location": trip.get("pickup_location"),
            "vehicle_lat": loc["latitude"] if loc else trip.get("pickup_lat", 26.2183),
            "vehicle_lng": loc["longitude"] if loc else trip.get("pickup_lng", 78.1828),
            "maps_url": f"https://www.google.com/maps?q={loc['latitude']},{loc['longitude']}" if loc else None,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Invalid tracking token")
