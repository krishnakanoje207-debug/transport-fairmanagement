"""
SafeRoute - Travel Partner Routes
Route management, time slabs, QR scanning, vehicles
"""
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId

from ..config.database import get_db
from ..config.security import decode_token
from ..middleware.auth_middleware import get_current_user, require_role
from ..models.travel_partner_model import PartnerRouteCreate, PartnerRouteUpdate, PartnerProfile

router = APIRouter()


@router.get("/profile")
async def get_partner_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    partner = await db.travel_partners.find_one({"user_id": current_user["id"]})
    if not partner:
        raise HTTPException(404, "Partner profile not found")
    partner["id"] = str(partner["_id"])
    del partner["_id"]
    return partner


@router.put("/profile")
async def update_partner_profile(
    data: PartnerProfile,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    update = data.dict()
    update["updated_at"] = datetime.utcnow()
    await db.travel_partners.update_one(
        {"user_id": current_user["id"]},
        {"$set": update}
    )
    return {"message": "Profile updated"}


# ─── Routes Management ───
@router.get("/routes")
async def get_routes(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    routes = await db.partner_routes.find(
        {"partner_id": current_user["id"]}
    ).sort("created_at", -1).to_list(50)
    for r in routes:
        r["id"] = str(r["_id"])
        del r["_id"]
    return {"routes": routes}


@router.post("/routes")
async def create_route(
    data: PartnerRouteCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    doc = data.dict()
    doc["partner_id"] = current_user["id"]
    doc["created_at"] = datetime.utcnow()
    result = await db.partner_routes.insert_one(doc)
    return {"message": "Route created", "route_id": str(result.inserted_id)}


@router.put("/routes/{route_id}")
async def update_route(
    route_id: str,
    data: PartnerRouteUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    update = {k: v for k, v in data.dict().items() if v is not None}
    if update:
        update["updated_at"] = datetime.utcnow()
        await db.partner_routes.update_one(
            {"_id": ObjectId(route_id), "partner_id": current_user["id"]},
            {"$set": update}
        )
    return {"message": "Route updated"}


@router.delete("/routes/{route_id}")
async def delete_route(
    route_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    await db.partner_routes.delete_one({"_id": ObjectId(route_id), "partner_id": current_user["id"]})
    return {"message": "Route deleted"}


# ─── Public: Available routes ───
@router.get("/available-routes")
async def get_available_routes(
    db: AsyncIOMotorDatabase = Depends(get_db),
    from_location: str = None
):
    """Public endpoint: get available bus routes with time slabs"""
    query = {"is_active": True}
    if from_location:
        query["$or"] = [
            {"from_location": {"$regex": from_location, "$options": "i"}},
            {"route_name": {"$regex": from_location, "$options": "i"}},
        ]
    routes = await db.partner_routes.find(query).to_list(50)
    result = []
    for r in routes:
        # Get partner info
        partner = await db.travel_partners.find_one({"user_id": r["partner_id"]})
        result.append({
            "id": str(r["_id"]),
            "route_name": r["route_name"],
            "from_location": r["from_location"],
            "to_location": r["to_location"],
            "base_fare": r.get("base_fare", 10),
            "time_slabs": r.get("time_slabs", []),
            "vehicle_type": r.get("vehicle_type", "bus"),
            "vehicle_number": r.get("vehicle_number"),
            "capacity": r.get("capacity", 40),
            "partner_name": partner.get("company_name") if partner else "Unknown",
            "partner_id": r["partner_id"],
        })
    return {"routes": result}


# ─── QR Scan to Start Trip ───
@router.post("/scan-trip-qr")
async def partner_scan_qr(
    token: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Partner scans QR code to start a trip"""
    if current_user.get("role") != "travel_partner":
        raise HTTPException(403, "Only travel partners can scan trip QR codes")

    try:
        payload = decode_token(token)
        if payload.get("qr_type") != "trip_start":
            raise HTTPException(400, "Wrong QR type. Use trip start QR.")

        trip_id = payload.get("trip_id")
        trip = await db.trips.find_one({"_id": ObjectId(trip_id)})
        if not trip:
            raise HTTPException(404, "Trip not found")
        if trip["status"] != "pending":
            raise HTTPException(400, f"Trip is already {trip['status']}")

        await db.trips.update_one(
            {"_id": ObjectId(trip_id)},
            {"$set": {
                "status": "active",
                "started_at": datetime.utcnow(),
                "partner_id": current_user["id"],
                "updated_at": datetime.utcnow()
            }}
        )

        # Notify user
        await db.notifications.insert_one({
            "user_id": trip["user_id"],
            "type": "trip_started",
            "message": f"Your trip to {trip.get('drop_location', 'destination')} has started!",
            "color": "#3dc47e",
            "read": False,
            "created_at": datetime.utcnow(),
        })

        return {"message": "Trip started successfully", "trip_id": trip_id}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Invalid or expired QR code")


# ─── Partner Stats ───
@router.get("/stats")
async def get_partner_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    pid = current_user["id"]
    total_routes = await db.partner_routes.count_documents({"partner_id": pid})
    total_trips = await db.trips.count_documents({"partner_id": pid})
    active_trips = await db.trips.count_documents({"partner_id": pid, "status": "active"})
    completed_trips = await db.trips.count_documents({"partner_id": pid, "status": "completed"})

    pipeline = [
        {"$match": {"partner_id": pid, "status": "completed"}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$actual_fare"}}}
    ]
    agg = await db.trips.aggregate(pipeline).to_list(1)
    revenue = agg[0]["total_revenue"] if agg else 0

    return {
        "total_routes": total_routes,
        "total_trips": total_trips,
        "active_trips": active_trips,
        "completed_trips": completed_trips,
        "total_revenue": round(revenue, 2),
    }
